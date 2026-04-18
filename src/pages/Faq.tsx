import SEO from '../components/SEO';

const QAS = [
  { q: 'Which formula is better — Mifflin or Katch?', a: 'Katch-McArdle uses lean body mass and is more accurate when body-fat % is known. Without it, Mifflin-St Jeor is the current gold standard for the general population.' },
  { q: 'How accurate is TDEE really?', a: 'These formulas have ±10% accuracy for most. Track your weight weekly and adjust calories up/down by ~200 kcal every 2 weeks if results differ from target.' },
  { q: 'Why is my protein so high (2.2 g/kg)?', a: 'During calorie deficits, higher protein preserves muscle mass and keeps satiety high. The recommendation drops to 1.6 g/kg at maintenance.' },
  { q: 'What if I have very little body fat?', a: 'Provide your body-fat % so Katch-McArdle is used. Very lean individuals often have higher BMR than Mifflin predicts because of their metabolically active muscle tissue.' },
  { q: 'Is 1,200 kcal the absolute minimum?', a: 'Most professional guidelines suggest not dropping below 1,200 kcal for women and 1,500 kcal for men without medical supervision. This tool caps the "cut" mode at 1,200 kcal.' },
  { q: 'Can I use this while pregnant or breastfeeding?', a: 'No. Pregnancy and lactation have specific caloric needs (+300–500 kcal). Consult a healthcare professional.' },
  { q: 'Does this account for thyroid conditions or metabolic disorders?', a: 'No. TDEE formulas assume a healthy metabolism. If you have a diagnosed condition, your BMR may be significantly different, and you should work with a medical professional.' },
  { q: 'Why is "activity level" so subjective?', a: 'Multipliers are broad averages. Many underestimate sedentary jobs and overestimate "moderate". When in doubt, pick the lower level and adjust if weight trends diverge.' },
  { q: 'Should I eat back my exercise calories?', a: 'If you set Activity Level correctly to include exercise, do not add calories back (it would double-count). If you set "Sedentary" despite exercising, you should add back ~60% of estimated burn.' },
  { q: 'How often should I recalculate?', a: 'Every 5 kg of weight change or every 8 weeks of training to keep the TDEE realistic. Hormones, NEAT, and adaptation shift over time.' },
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
        title="TDEE FAQ — Formulas, Accuracy, Pregnancy, Activity Level"
        description="TDEE and macro calculator FAQs: which formula to use, accuracy, minimum calories, activity level selection, recalculating frequency."
        path="/faq"
        jsonLd={jsonLd}
      />

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">FAQ</h1>
      <p className="mt-2 text-sm text-slate-600">Common questions about BMR, TDEE, and macros.</p>

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
