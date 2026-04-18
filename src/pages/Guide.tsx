import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'TDEE & Macros Guide — Formulas and Practical Use',
  inLanguage: 'en',
  author: { '@type': 'Organization', name: 'tdee.bal.pe.kr' },
  publisher: { '@type': 'Organization', name: 'tdee.bal.pe.kr' },
  mainEntityOfPage: 'https://tdee.bal.pe.kr/guide',
};

export default function Guide() {
  return (
    <>
      <SEO
        title="TDEE Guide — Mifflin, Katch-McArdle, Activity & Macros"
        description="How BMR is calculated (Mifflin-St Jeor vs Katch-McArdle), activity multipliers, target calories by goal, and macro ratios for protein, fat, and carbs."
        path="/guide"
        jsonLd={jsonLd}
      />

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">TDEE & Macros Guide</h1>
      <p className="mt-2 text-sm text-slate-600">Formula breakdown for our calculator.</p>

      <article className="prose prose-slate mt-8 max-w-none text-[15px]">
        <h2>1. BMR — Mifflin-St Jeor (default)</h2>
        <pre>{`Male:   10 × kg + 6.25 × cm − 5 × age + 5
Female: 10 × kg + 6.25 × cm − 5 × age − 161`}</pre>
        <p>This is the most accurate formula for the general population (±10% for most).</p>

        <h2>2. BMR — Katch-McArdle (with body fat %)</h2>
        <pre>{`BMR = 370 + 21.6 × lean body mass (kg)
lean mass = weight × (1 − body fat % / 100)`}</pre>
        <p>More accurate for athletic or very lean/obese individuals when body-fat % is known.</p>

        <h2>3. Activity multipliers (TDEE)</h2>
        <table>
          <thead><tr><th>Level</th><th>Multiplier</th></tr></thead>
          <tbody>
            <tr><td>Sedentary (desk job)</td><td>× 1.2</td></tr>
            <tr><td>Light (1–3 days/week)</td><td>× 1.375</td></tr>
            <tr><td>Moderate (3–5 days)</td><td>× 1.55</td></tr>
            <tr><td>Active (6–7 days)</td><td>× 1.725</td></tr>
            <tr><td>Very active (2x/day, manual labor)</td><td>× 1.9</td></tr>
          </tbody>
        </table>

        <h2>4. Goal-based target kcal</h2>
        <ul>
          <li><strong>Lose</strong>: TDEE − 500 kcal (≈ 0.45 kg/week)</li>
          <li><strong>Maintain</strong>: TDEE</li>
          <li><strong>Gain</strong>: TDEE + 300 kcal (≈ 0.25 kg/week)</li>
          <li><strong>Cut</strong>: TDEE × 0.8, with minimum 1,200 kcal</li>
        </ul>

        <h2>5. Macro recommendations</h2>
        <ul>
          <li><strong>Protein</strong>: 1.6 g/kg for most (2.2 g/kg during cut, 1.8 g/kg during gain).</li>
          <li><strong>Fat</strong>: 25% of calories (28% during gain for hormonal support).</li>
          <li><strong>Carbs</strong>: remainder.</li>
        </ul>

        <h2>6. When to deviate</h2>
        <ul>
          <li>Endurance athletes benefit from higher carbs (50–60% of kcal).</li>
          <li>Keto diets push fat to 70% and carbs to 5–10%.</li>
          <li>Older adults may need protein as high as 2.0 g/kg to preserve muscle.</li>
        </ul>

        <h2>7. References</h2>
        <ul>
          <li>Mifflin et al., Am J Clin Nutr 1990.</li>
          <li>Katch-McArdle, <em>Exercise Physiology</em>.</li>
          <li>ISSN Position Stand: Protein &amp; Exercise.</li>
        </ul>
      </article>

      <p className="mt-8 text-sm text-slate-500">
        <Link to="/" className="underline">Back to calculator</Link>.
      </p>
    </>
  );
}
