import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import NumberInput from '../components/NumberInput';
import { track } from '../lib/track';
import {
  ACTIVITY_LABEL_KO,
  ACTIVITY_MULTIPLIER,
  GOAL_LABEL_KO,
  calcTdee,
  type ActivityLevel,
  type Goal,
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
};

function load(): TdeeInput {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<TdeeInput>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'TDEE & Macro Calculator',
  url: 'https://tdee.bal.pe.kr/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  inLanguage: 'ko-KR',
  description:
    'Mifflin-St Jeor / Katch-McArdle 기반 BMR·TDEE 계산 + 감량/유지/증량/컷 목표별 매크로 (단백질/지방/탄수) 비율 자동 추천.',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
};

export default function Home() {
  const [form, setForm] = useState<TdeeInput>(load);
  const persist = useCallback((next: TdeeInput) => {
    setForm(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE, JSON.stringify(next));
  }, []);

  const result = useMemo(() => calcTdee(form), [form]);
  const hasInput = form.weightKg > 0 && form.heightCm > 0 && form.age > 0;

  useMemo(() => {
    if (hasInput) track('tdee_calc', { goal: form.goal, activity: form.activity });
  }, [hasInput, form.goal, form.activity]);

  const totalMacroKcal = result.macros.protein * 4 + result.macros.fat * 9 + result.macros.carb * 4;
  const proteinPct = Math.round(((result.macros.protein * 4) / totalMacroKcal) * 100);
  const fatPct = Math.round(((result.macros.fat * 9) / totalMacroKcal) * 100);
  const carbPct = 100 - proteinPct - fatPct;

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
          BMR(Mifflin-St Jeor 또는 Katch-McArdle) → <span className="font-medium text-emerald-700">활동지수 × TDEE</span> → 목표별 매크로까지 자동 계산.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <NumberInput label="Height" value={form.heightCm} onChange={(v) => persist({ ...form, heightCm: v })} suffix="cm" />
          <NumberInput label="Weight" value={form.weightKg} onChange={(v) => persist({ ...form, weightKg: v })} suffix="kg" />
          <NumberInput label="Body fat % (optional, more accurate)" value={form.bodyFatPct ?? 0} onChange={(v) => persist({ ...form, bodyFatPct: v > 0 ? v : undefined })} suffix="%" />
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

      {hasInput && (
        <>
          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Stat label="BMR" value={`${result.bmr.toLocaleString()} kcal`} sub={result.bmrKatch ? 'Katch-McArdle' : 'Mifflin-St Jeor'} />
            <Stat label="TDEE" value={`${result.tdee.toLocaleString()} kcal`} sub={`×${ACTIVITY_MULTIPLIER[form.activity]} activity`} />
            <Stat label="Target" value={`${result.targetKcal.toLocaleString()} kcal`} sub={GOAL_LABEL_KO[form.goal]} emphasize />
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Macro targets</h2>
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
