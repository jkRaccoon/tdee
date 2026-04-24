import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import NumberInput from '../components/NumberInput';
import { track } from '../lib/track';
import {
  ACTIVITY_LABEL_KO,
  ACTIVITY_MULTIPLIER,
  FORMULA_LABEL,
  GOAL_LABEL_KO,
  MACRO_PRESET_LABEL_KO,
  calcTdee,
  ftInToCm,
  kgToLb,
  lbToKg,
  type ActivityLevel,
  type Formula,
  type Goal,
  type MacroPreset,
  type Sex,
  type TdeeInput,
} from '../lib/tdee';

const STORAGE = 'tdee-input';

const DEFAULT: TdeeInput = {
  sex: 'male',
  age: 30,
  heightCm: 175,
  weightKg: 72,
  bodyFatPct: undefined,
  activity: 'moderate',
  goal: 'maintain',
  unit: 'metric',
  formula: 'mifflin',
  macroPreset: 'balanced',
};

function loadStorage(): TdeeInput {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<TdeeInput>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function parseSearchParams(sp: URLSearchParams): Partial<TdeeInput> {
  const out: Partial<TdeeInput> = {};
  const n = (k: string) => { const v = sp.get(k); return v !== null ? Number(v) : undefined; };
  const s = (k: string) => sp.get(k) ?? undefined;
  if (sp.get('sex')) out.sex = sp.get('sex') as Sex;
  if (n('age')) out.age = n('age');
  if (n('h')) out.heightCm = n('h');
  if (n('w')) out.weightKg = n('w');
  if (n('bf')) out.bodyFatPct = n('bf');
  if (s('act')) out.activity = s('act') as ActivityLevel;
  if (s('goal')) out.goal = s('goal') as Goal;
  if (s('fm')) out.formula = s('fm') as Formula;
  if (s('mp')) out.macroPreset = s('mp') as MacroPreset;
  return out;
}

function toSearchParams(f: TdeeInput): string {
  const p = new URLSearchParams();
  p.set('sex', f.sex);
  p.set('age', String(f.age));
  p.set('h', String(f.heightCm));
  p.set('w', String(f.weightKg));
  if (f.bodyFatPct) p.set('bf', String(f.bodyFatPct));
  p.set('act', f.activity);
  p.set('goal', f.goal);
  p.set('fm', f.formula ?? 'mifflin');
  if (f.macroPreset) p.set('mp', f.macroPreset);
  return p.toString();
}

const FORMULAS: Formula[] = ['mifflin', 'harris', 'katch'];
const MACRO_PRESETS: MacroPreset[] = ['balanced', 'high-protein', 'keto', 'zone', 'low-fat'];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'TDEE & Macro Calculator',
  url: 'https://tdee.bal.pe.kr/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  inLanguage: 'ko-KR',
  description:
    'Mifflin-St Jeor / Harris-Benedict / Katch-McArdle 기반 BMR·TDEE 계산 + 감량/유지/증량/컷 목표별 매크로 (단백질/지방/탄수) 비율 자동 추천. 5가지 매크로 프리셋 지원.',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<TdeeInput>(() => {
    const fromUrl = parseSearchParams(searchParams);
    const base = Object.keys(fromUrl).length > 0
      ? { ...DEFAULT, ...fromUrl }
      : loadStorage();
    return base;
  });

  // Imperial display state
  const [imperialFt, setImperialFt] = useState(() => {
    const inches = form.heightCm / 2.54;
    return Math.floor(inches / 12);
  });
  const [imperialIn, setImperialIn] = useState(() => {
    const inches = form.heightCm / 2.54;
    const ft = Math.floor(inches / 12);
    return Math.round(inches - ft * 12);
  });
  const [imperialLb, setImperialLb] = useState(() => kgToLb(form.weightKg));

  const [copied, setCopied] = useState(false);
  const prevFormRef = useRef<TdeeInput>(form);

  const persist = useCallback((next: TdeeInput) => {
    setForm(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE, JSON.stringify(next));
  }, []);

  // Sync URL with form state
  useEffect(() => {
    const qs = toSearchParams(form);
    navigate(`?${qs}`, { replace: true });
  }, [form, navigate]);

  const result = useMemo(() => calcTdee(form), [form]);
  const hasInput = form.weightKg > 0 && form.heightCm > 0 && form.age > 0;

  // GA4: track on formula switch
  useEffect(() => {
    if (prevFormRef.current.formula !== form.formula) {
      track('formula_switched', { formula: form.formula });
    }
    prevFormRef.current = form;
  }, [form]);

  // GA4: track calculation on meaningful input change
  const prevResultRef = useRef<typeof result | null>(null);
  useEffect(() => {
    if (!hasInput) return;
    if (prevResultRef.current?.targetKcal === result.targetKcal) return;
    prevResultRef.current = result;
    track('tdee_calculated', {
      formula: result.usedFormula,
      goal: form.goal,
      macro_preset: form.macroPreset ?? 'balanced',
      bmr: result.bmr,
      tdee: result.tdee,
      target_kcal: result.targetKcal,
      protein_g: result.macros.protein,
      fat_g: result.macros.fat,
      carb_g: result.macros.carb,
    });
  }, [hasInput, result, form.goal, form.macroPreset]);

  const totalMacroKcal = result.macros.protein * 4 + result.macros.fat * 9 + result.macros.carb * 4;
  const proteinPct = totalMacroKcal > 0 ? Math.round(((result.macros.protein * 4) / totalMacroKcal) * 100) : 0;
  const fatPct = totalMacroKcal > 0 ? Math.round(((result.macros.fat * 9) / totalMacroKcal) * 100) : 0;
  const carbPct = 100 - proteinPct - fatPct;

  const handleUnitToggle = () => {
    if (form.unit === 'metric') {
      // metric → imperial: just update display state
      const inches = form.heightCm / 2.54;
      const ft = Math.floor(inches / 12);
      const inRem = Math.round(inches - ft * 12);
      setImperialFt(ft);
      setImperialIn(inRem);
      setImperialLb(kgToLb(form.weightKg));
      persist({ ...form, unit: 'imperial' });
    } else {
      // imperial → metric: convert back
      persist({ ...form, unit: 'metric' });
    }
  };

  const handleImperialHeight = (ft: number, inch: number) => {
    setImperialFt(ft);
    setImperialIn(inch);
    const cm = ftInToCm(ft, inch);
    persist({ ...form, heightCm: cm });
  };

  const handleImperialWeight = (lb: number) => {
    setImperialLb(lb);
    const kg = lbToKg(lb);
    persist({ ...form, weightKg: kg });
  };

  const handleCopyResult = async () => {
    if (!hasInput) return;
    const url = window.location.href;
    const text = [
      `TDEE 계산 결과 (${FORMULA_LABEL[result.usedFormula]})`,
      `BMR: ${result.bmr.toLocaleString()} kcal`,
      `TDEE: ${result.tdee.toLocaleString()} kcal`,
      `목표 칼로리: ${result.targetKcal.toLocaleString()} kcal (${GOAL_LABEL_KO[form.goal]})`,
      `단백질: ${result.macros.protein}g · 지방: ${result.macros.fat}g · 탄수: ${result.macros.carb}g`,
      `🔗 ${url}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      track('result_copied', { goal: form.goal, formula: result.usedFormula });
    } catch {
      // fallback: select text
    }
  };

  return (
    <>
      <SEO
        titleKey="meta.home.title"
        descriptionKey="meta.home.description"
        path="/"
        jsonLd={jsonLd}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">TDEE · Macro Calculator</h1>
        <p className="mt-2 text-sm text-slate-600">
          BMR(Mifflin / Harris-Benedict / Katch-McArdle) → <span className="font-medium text-emerald-700">활동지수 × TDEE</span> → 목표별 매크로까지 자동 계산.
        </p>
      </div>

      {/* Formula selector */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">BMR 공식 선택</h2>
          <button
            onClick={handleUnitToggle}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            {form.unit === 'metric' ? '→ ft / lbs' : '→ cm / kg'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FORMULAS.map((fm) => {
            const disabled = fm === 'katch' && !form.bodyFatPct;
            return (
              <button
                key={fm}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) persist({ ...form, formula: fm });
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  form.formula === fm && !disabled
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : disabled
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
                title={disabled ? '체지방률을 입력하면 활성화됩니다' : undefined}
              >
                {FORMULA_LABEL[fm]}
                {disabled && ' (체지방% 필요)'}
              </button>
            );
          })}
        </div>
        {/* Formula comparison table (shown when result available) */}
        {hasInput && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-1.5 text-left font-semibold text-slate-600">공식</th>
                  <th className="py-1.5 text-right font-semibold text-slate-600">BMR</th>
                  <th className="py-1.5 text-right font-semibold text-slate-600">TDEE</th>
                  <th className="py-1.5 text-right font-semibold text-slate-600">목표 칼로리</th>
                </tr>
              </thead>
              <tbody>
                {([
                  { label: 'Mifflin-St Jeor', bmr: result.bmrMifflin },
                  { label: 'Harris-Benedict', bmr: result.bmrHarris },
                  ...(result.bmrKatch !== null ? [{ label: 'Katch-McArdle', bmr: result.bmrKatch }] : []),
                ] as Array<{ label: string; bmr: number }>).map(({ label, bmr }) => {
                  const rowTdee = Math.round(bmr * ACTIVITY_MULTIPLIER[form.activity]);
                  let rowTarget = rowTdee;
                  if (form.goal === 'lose') rowTarget = Math.max(1200, rowTdee - 500);
                  else if (form.goal === 'gain') rowTarget = rowTdee + 300;
                  else if (form.goal === 'cut') rowTarget = Math.max(1200, Math.round(rowTdee * 0.8));
                  const isActive = label === FORMULA_LABEL[result.usedFormula];
                  return (
                    <tr key={label} className={`border-b border-slate-50 ${isActive ? 'bg-emerald-50' : ''}`}>
                      <td className={`py-1.5 ${isActive ? 'font-semibold text-emerald-800' : 'text-slate-600'}`}>
                        {label}{isActive && ' ✓'}
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-slate-800">{bmr.toLocaleString()}</td>
                      <td className="py-1.5 text-right tabular-nums text-slate-800">{rowTdee.toLocaleString()}</td>
                      <td className="py-1.5 text-right tabular-nums font-medium text-slate-900">{rowTarget.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Input form */}
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Personal info</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Sex</span>
            <select
              value={form.sex}
              onChange={(e) => persist({ ...form, sex: e.target.value as Sex })}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <NumberInput label="Age" value={form.age} onChange={(v) => persist({ ...form, age: v })} suffix="yr" />

          {form.unit === 'metric' ? (
            <>
              <NumberInput label="Height" value={form.heightCm} onChange={(v) => persist({ ...form, heightCm: v })} suffix="cm" />
              <NumberInput label="Weight" value={form.weightKg} onChange={(v) => persist({ ...form, weightKg: v })} suffix="kg" />
            </>
          ) : (
            <>
              <div className="block">
                <span className="text-sm font-medium text-slate-800">Height</span>
                <div className="mt-1 flex gap-2">
                  <NumberInput label="" value={imperialFt} onChange={(v) => handleImperialHeight(v, imperialIn)} suffix="ft" />
                  <NumberInput label="" value={imperialIn} onChange={(v) => handleImperialHeight(imperialFt, v)} suffix="in" />
                </div>
                <span className="mt-1 block text-xs text-slate-400">≈ {form.heightCm} cm</span>
              </div>
              <div className="block">
                <NumberInput label="Weight" value={imperialLb} onChange={handleImperialWeight} suffix="lbs" />
                <span className="mt-1 block text-xs text-slate-400">≈ {form.weightKg} kg</span>
              </div>
            </>
          )}

          <NumberInput
            label="Body fat % (optional — enables Katch-McArdle)"
            value={form.bodyFatPct ?? 0}
            onChange={(v) => persist({ ...form, bodyFatPct: v > 0 ? v : undefined })}
            suffix="%"
          />
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Activity</span>
            <select
              value={form.activity}
              onChange={(e) => persist({ ...form, activity: e.target.value as ActivityLevel })}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {Object.entries(ACTIVITY_LABEL_KO).map(([k, label]) => (
                <option key={k} value={k}>
                  {label} · ×{ACTIVITY_MULTIPLIER[k as ActivityLevel]}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-800">Goal</span>
            <select
              value={form.goal}
              onChange={(e) => persist({ ...form, goal: e.target.value as Goal })}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {Object.entries(GOAL_LABEL_KO).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Macro preset selector */}
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">매크로 프리셋</h2>
        <p className="mt-1 text-xs text-slate-500">목표에 맞는 탄수/단백/지방 비율을 선택하세요.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MACRO_PRESETS.map((mp) => (
            <button
              key={mp}
              onClick={() => {
                persist({ ...form, macroPreset: mp });
                track('macro_preset_applied', { preset: mp, goal: form.goal });
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                (form.macroPreset ?? 'balanced') === mp
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              {MACRO_PRESET_LABEL_KO[mp]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          balanced 30·30·40% / high-protein 40·25·35% / keto 25·70·5% / zone 30·30·40% / low-fat 25·15·60%
        </p>
      </section>

      {hasInput && (
        <>
          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Stat label="BMR" value={`${result.bmr.toLocaleString()} kcal`} sub={FORMULA_LABEL[result.usedFormula]} />
            <Stat label="TDEE" value={`${result.tdee.toLocaleString()} kcal`} sub={`×${ACTIVITY_MULTIPLIER[form.activity]} activity`} />
            <Stat label="Target" value={`${result.targetKcal.toLocaleString()} kcal`} sub={GOAL_LABEL_KO[form.goal]} emphasize />
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Macro targets</h2>
              <button
                onClick={handleCopyResult}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                {copied ? '✓ 복사됨!' : '📋 결과 복사 · 공유'}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <MacroCard color="bg-rose-500" label="Protein" g={result.macros.protein} pct={proteinPct} kcalPerG={4} />
              <MacroCard color="bg-amber-500" label="Fat" g={result.macros.fat} pct={fatPct} kcalPerG={9} />
              <MacroCard color="bg-sky-500" label="Carbs" g={result.macros.carb} pct={carbPct} kcalPerG={4} />
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="flex h-full">
                <div className="bg-rose-500" style={{ width: `${proteinPct}%` }} />
                <div className="bg-amber-500" style={{ width: `${fatPct}%` }} />
                <div className="bg-sky-500" style={{ width: `${carbPct}%` }} />
              </div>
            </div>

            <ul className="mt-4 space-y-1 text-xs text-slate-600">
              {result.explain.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          </section>

          {/* Cross-links */}
          <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <a
              href="https://bmi.bal.pe.kr"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition"
              onClick={() => track('crosslink_click', { target: 'bmi' })}
            >
              <span className="text-2xl">⚖️</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">BMI 계산기</p>
                <p className="text-xs text-slate-500">체질량지수·비만도 확인 → bmi.bal.pe.kr</p>
              </div>
            </a>
            <a
              href="https://calorie.bal.pe.kr"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition"
              onClick={() => track('crosslink_click', { target: 'calorie' })}
            >
              <span className="text-2xl">🍽️</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">칼로리 계산기</p>
                <p className="text-xs text-slate-500">음식별 칼로리 조회 → calorie.bal.pe.kr</p>
              </div>
            </a>
          </section>
        </>
      )}

      <section className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>
          See the <Link to="/guide" className="underline">Guide</Link> for formula details and <Link to="/faq" className="underline">FAQ</Link>.
        </p>
      </section>
    </>
  );
}

function Stat({ label, value, sub, emphasize }: { label: string; value: string; sub: string; emphasize?: boolean }) {
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${emphasize ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${emphasize ? 'text-emerald-900' : 'text-slate-900'}`}>{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </article>
  );
}

function MacroCard({ color, label, g, pct, kcalPerG }: { color: string; label: string; g: number; pct: number; kcalPerG: number }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3">
      <span className={`inline-block h-3 w-3 rounded-full ${color}`} />
      <p className="mt-1 text-xs font-semibold text-slate-600">{label}</p>
      <p className="text-xl font-black text-slate-900">{g} g</p>
      <p className="text-[11px] text-slate-500">{pct}% · {g * kcalPerG} kcal</p>
    </article>
  );
}
