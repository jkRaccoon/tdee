import SEO from '../components/SEO';

const QAS = [
  { q: 'Which formula is better — Mifflin, Harris-Benedict, or Katch?', a: 'Mifflin-St Jeor is the current gold standard (ADA 2002) for most people. Harris-Benedict tends to run 5–10% higher and is an older formula. Katch-McArdle uses lean body mass and is the most accurate when body-fat % is known — especially for athletes or very lean/obese individuals. If unsure, start with Mifflin and compare all three using the formula table.' },
  { q: 'Why do the three formulas give different numbers?', a: 'Each was derived from different research populations and methods. Mifflin (1990) was validated on a broad US population. Harris-Benedict (1919, revised 1984) was developed on smaller, more homogeneous samples. Katch-McArdle bypasses sex/height corrections entirely by using lean mass. Differences of 50–200 kcal are normal — use weekly weight tracking to calibrate.' },
  { q: 'What is the "Keto" macro preset and is it safe?', a: 'Keto allocates 70% of calories to fat and only 5% to carbs (~25–50g/day). It can be effective for weight loss and improving insulin sensitivity, but requires strict adherence. Not recommended without medical supervision for people with liver disease, pancreatitis, or gallbladder issues. The fat quality (olive oil, avocado, nuts vs. processed fats) matters significantly.' },
  { q: 'What macro preset is best for muscle building?', a: 'High Protein (40% protein, 25% fat, 35% carbs) combined with a calorie surplus (Gain goal) is optimal for muscle hypertrophy. Protein should be distributed across 3–5 meals. Carbs fuel training sessions, so timing carbs around workouts helps.' },
  { q: 'How accurate is TDEE really?', a: 'These formulas have ±10–15% accuracy for most people. Track your weight weekly and adjust calories up/down by ~200 kcal every 2 weeks if results differ from target. NEAT (non-exercise activity thermogenesis) varies enormously between individuals and is the biggest source of error.' },
  { q: 'Why is my protein so high during cut (2.2 g/kg)?', a: 'During calorie deficits, higher protein preserves muscle mass (anti-catabolism), keeps satiety high, and has the highest thermic effect (~25–30%). The recommendation drops to 1.6 g/kg at maintenance and 1.8 g/kg during a gain phase.' },
  { q: 'Is 1,200 kcal the absolute minimum?', a: 'Most professional guidelines suggest not dropping below 1,200 kcal for women and 1,500 kcal for men without medical supervision. Very low calorie diets (VLCD) below 800 kcal are medical interventions. This tool caps the "cut" mode at 1,200 kcal.' },
  { q: 'Can I use this while pregnant or breastfeeding?', a: 'No. Pregnancy and lactation have specific caloric needs (+300–500 kcal). This tool is not designed for pregnant or breastfeeding individuals. Consult a registered dietitian.' },
  { q: 'Does this account for thyroid conditions or metabolic disorders?', a: 'No. TDEE formulas assume a healthy metabolism. Hypothyroidism can reduce BMR by 30–40%. If you have a diagnosed condition, your actual BMR may differ significantly, and you should work with a medical professional.' },
  { q: 'How often should I recalculate?', a: 'Every 5 kg of weight change or every 8 weeks of consistent training. As you lose/gain weight and your body adapts (metabolic adaptation), your TDEE shifts. Recalculating ensures your targets stay realistic.' },
  { q: 'How do I share my results with someone?', a: 'The URL automatically updates with your inputs (sex, age, height, weight, goal, formula, macro preset). Copy the URL from your browser and share it. You can also click the "결과 복사 · 공유" button to copy a formatted text summary with the URL.' },
  { q: 'Should I eat back my exercise calories?', a: 'If you set Activity Level to include your exercise (e.g., "Moderate" for 3–5 days/week), do not add calories back — it would double-count. If you set "Sedentary" despite exercising, add back ~60% of estimated burn to account for the overestimation in TDEE multipliers.' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: QAS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function Faq() {
  return (
    <>
      <SEO
        titleKey="meta.faq.title"
        descriptionKey="meta.faq.description"
        path="/faq"
        jsonLd={jsonLd}
      />

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">FAQ</h1>
      <p className="mt-2 text-sm text-slate-600">Common questions about BMR formulas, TDEE, macros, and presets.</p>

      <dl className="mt-8 space-y-6">
        {QAS.map(({ q, a }, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <dt className="text-sm font-semibold text-slate-900">Q{i + 1}. {q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-700">{a}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
