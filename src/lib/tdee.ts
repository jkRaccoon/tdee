export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
export type Goal = 'lose' | 'maintain' | 'gain' | 'cut';
export type Unit = 'metric' | 'imperial';

export interface TdeeInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  activity: ActivityLevel;
  goal: Goal;
  unit: Unit;
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

export function bmrMifflin(i: TdeeInput): number {
  const base = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age;
  return i.sex === 'male' ? base + 5 : base - 161;
}

export function bmrKatch(i: TdeeInput): number | null {
  if (!i.bodyFatPct) return null;
  const lean = i.weightKg * (1 - i.bodyFatPct / 100);
  return 370 + 21.6 * lean;
}

export function calcTdee(i: TdeeInput): {
  bmrMifflin: number;
  bmrKatch: number | null;
  bmr: number;
  tdee: number;
  targetKcal: number;
  macros: { protein: number; fat: number; carb: number };
  explain: string[];
} {
  const mifflin = Math.round(bmrMifflin(i));
  const katch = bmrKatch(i);
  const bmr = katch !== null ? Math.round(katch) : mifflin;
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[i.activity]);

  let targetKcal = tdee;
  const explain: string[] = [];
  explain.push(`BMR ${bmr.toLocaleString()} kcal (${katch !== null ? 'Katch-McArdle, 체지방률 반영' : 'Mifflin-St Jeor'}).`);
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

  const proteinPerKg = i.goal === 'cut' ? 2.2 : i.goal === 'gain' ? 1.8 : 1.6;
  const proteinG = Math.round(i.weightKg * proteinPerKg);
  const fatPct = i.goal === 'gain' ? 0.28 : 0.25;
  const fatG = Math.round((targetKcal * fatPct) / 9);
  const carbKcal = Math.max(0, targetKcal - proteinG * 4 - fatG * 9);
  const carbG = Math.round(carbKcal / 4);

  explain.push(
    `매크로 권장: 단백질 ${proteinG}g(×4kcal) · 지방 ${fatG}g(×9kcal) · 탄수화물 ${carbG}g(잔여).`,
  );

  return {
    bmrMifflin: mifflin,
    bmrKatch: katch !== null ? Math.round(katch) : null,
    bmr,
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
