export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
export type Goal = 'lose' | 'maintain' | 'gain' | 'cut';
export type Unit = 'metric' | 'imperial';
export type Formula = 'mifflin' | 'harris' | 'katch';
export type MacroPreset = 'balanced' | 'high-protein' | 'keto' | 'zone' | 'low-fat';

export interface TdeeInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  activity: ActivityLevel;
  goal: Goal;
  unit: Unit;
  formula?: Formula;
  macroPreset?: MacroPreset;
}

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9,
};

export const ACTIVITY_LABEL_KO: Record<ActivityLevel, string> = {
  sedentary: '앉아서 생활 (운동 거의 없음)',
  light: '가벼운 운동 (주 1~3일)',
  moderate: '보통 운동 (주 3~5일)',
  active: '활발한 운동 (주 6~7일)',
  'very-active': '매우 활발 (하루 2회·신체노동)',
};

export const GOAL_LABEL_KO: Record<Goal, string> = {
  lose: '감량 (-500 kcal/일)',
  maintain: '유지 (±0)',
  gain: '증량 (+300 kcal/일)',
  cut: '컷 다이어트 (-20%)',
};

export const FORMULA_LABEL: Record<Formula, string> = {
  mifflin: 'Mifflin-St Jeor',
  harris: 'Harris-Benedict',
  katch: 'Katch-McArdle',
};

export const MACRO_PRESET_LABEL: Record<MacroPreset, string> = {
  balanced: 'Balanced',
  'high-protein': 'High Protein',
  keto: 'Keto',
  zone: 'Zone',
  'low-fat': 'Low Fat',
};

export const MACRO_PRESET_LABEL_KO: Record<MacroPreset, string> = {
  balanced: '균형 (Balanced)',
  'high-protein': '고단백 (High Protein)',
  keto: '케토 (Keto)',
  zone: '존 다이어트 (Zone)',
  'low-fat': '저지방 (Low Fat)',
};

/** Macro split as [proteinPct, fatPct, carbPct] — percentages of total kcal */
export const MACRO_PRESET_RATIOS: Record<MacroPreset, [number, number, number]> = {
  balanced:      [30, 30, 40],
  'high-protein':[40, 25, 35],
  keto:          [25, 70,  5],
  zone:          [30, 30, 40],
  'low-fat':     [25, 15, 60],
};

export function bmrMifflin(i: TdeeInput): number {
  const base = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age;
  return i.sex === 'male' ? base + 5 : base - 161;
}

export function bmrHarris(i: TdeeInput): number {
  if (i.sex === 'male') {
    return 88.362 + 13.397 * i.weightKg + 4.799 * i.heightCm - 5.677 * i.age;
  }
  return 447.593 + 9.247 * i.weightKg + 3.098 * i.heightCm - 4.330 * i.age;
}

export function bmrKatch(i: TdeeInput): number | null {
  if (!i.bodyFatPct) return null;
  const lean = i.weightKg * (1 - i.bodyFatPct / 100);
  return 370 + 21.6 * lean;
}

export function calcTdee(i: TdeeInput): {
  bmrMifflin: number;
  bmrHarris: number;
  bmrKatch: number | null;
  bmr: number;
  usedFormula: Formula;
  tdee: number;
  targetKcal: number;
  macros: { protein: number; fat: number; carb: number };
  explain: string[];
} {
  const mifflin = Math.round(bmrMifflin(i));
  const harris = Math.round(bmrHarris(i));
  const katch = bmrKatch(i);

  // Determine which formula to use
  let usedFormula: Formula = i.formula ?? 'mifflin';
  // If katch is selected but body fat not provided, fall back to mifflin
  if (usedFormula === 'katch' && katch === null) usedFormula = 'mifflin';

  const bmr = usedFormula === 'katch' && katch !== null
    ? Math.round(katch)
    : usedFormula === 'harris'
      ? harris
      : mifflin;

  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[i.activity]);

  let targetKcal = tdee;
  const explain: string[] = [];
  explain.push(`BMR ${bmr.toLocaleString()} kcal (${FORMULA_LABEL[usedFormula]}).`);
  explain.push(`활동지수 ${ACTIVITY_MULTIPLIER[i.activity]} → TDEE ${tdee.toLocaleString()} kcal/일.`);

  if (i.goal === 'lose') {
    targetKcal = Math.max(1200, tdee - 500);
    explain.push('감량 목표: TDEE − 500 kcal (주 0.45kg 감량 페이스).');
  } else if (i.goal === 'gain') {
    targetKcal = tdee + 300;
    explain.push('증량 목표: TDEE + 300 kcal (주 0.25kg 증량 페이스).');
  } else if (i.goal === 'cut') {
    targetKcal = Math.max(1200, Math.round(tdee * 0.8));
    explain.push('컷 다이어트: TDEE × 0.8 (단백질 상한, 급격한 감량).');
  } else {
    explain.push('유지 목표: TDEE 그대로.');
  }

  let proteinG: number;
  let fatG: number;
  let carbG: number;

  if (i.macroPreset && i.macroPreset !== 'balanced') {
    const [pp, fp, cp] = MACRO_PRESET_RATIOS[i.macroPreset];
    proteinG = Math.round((targetKcal * pp) / 100 / 4);
    fatG = Math.round((targetKcal * fp) / 100 / 9);
    carbG = Math.round((targetKcal * cp) / 100 / 4);
    explain.push(`매크로 프리셋 [${MACRO_PRESET_LABEL[i.macroPreset]}]: 단백${pp}% · 지방${fp}% · 탄수${cp}%.`);
  } else {
    // Default goal-based calculation
    const proteinPerKg = i.goal === 'cut' ? 2.2 : i.goal === 'gain' ? 1.8 : 1.6;
    proteinG = Math.round(i.weightKg * proteinPerKg);
    const fatPct = i.goal === 'gain' ? 0.28 : 0.25;
    fatG = Math.round((targetKcal * fatPct) / 9);
    const carbKcal = Math.max(0, targetKcal - proteinG * 4 - fatG * 9);
    carbG = Math.round(carbKcal / 4);
    explain.push(
      `매크로 권장: 단백질 ${proteinG}g(×4kcal) · 지방 ${fatG}g(×9kcal) · 탄수화물 ${carbG}g(잔여).`,
    );
  }

  return {
    bmrMifflin: mifflin,
    bmrHarris: harris,
    bmrKatch: katch !== null ? Math.round(katch) : null,
    bmr,
    usedFormula,
    tdee,
    targetKcal,
    macros: { protein: proteinG, fat: fatG, carb: carbG },
    explain,
  };
}

export function cmToFtIn(cm: number): string {
  const inches = cm / 2.54;
  const ft = Math.floor(inches / 12);
  const inRem = Math.round(inches - ft * 12);
  return `${ft}'${inRem}"`;
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function ftInToCm(ft: number, inch: number): number {
  return Math.round((ft * 12 + inch) * 2.54);
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}
