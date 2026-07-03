import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { AuthorByline } from '../components/seo-kit';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'TDEE & Macros Guide — Mifflin, Harris-Benedict, Katch-McArdle, Macro Presets',
  inLanguage: 'en',
  author: { '@type': 'Organization', name: 'tdee.bal.pe.kr' },
  publisher: { '@type': 'Organization', name: 'tdee.bal.pe.kr' },
  mainEntityOfPage: 'https://tdee.bal.pe.kr/guide',
};

export default function Guide() {
  return (
    <>
      <SEO
        titleKey="meta.guide.title"
        descriptionKey="meta.guide.description"
        path="/guide"
        jsonLd={jsonLd}
      />

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        TDEE &amp; Macros Guide — Mifflin, Harris-Benedict, Katch-McArdle Explained
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Complete formula breakdown, activity multipliers, goal-based calorie targets, and macro
        preset guide for body recomposition, cutting, lean bulking, and keto.
      </p>

      <div className="not-prose mt-6">
        <AuthorByline
          authorName="Operator (Jikwang Kim)"
          reviewerName="Cross-checked against Mifflin et al. (1990) and ISSN Position Stand"
          lastUpdated="2026-05-16"
          datePublished="2026-04-19"
          organizationName="bal.pe.kr micro-SaaS"
          organizationUrl="https://bal.pe.kr/about"
          mainEntityType="Article"
          language="en"
        />
      </div>

      <article className="prose prose-slate mt-8 max-w-none text-[15px]">
        <h2>0. Why TDEE matters — the foundation of every nutrition plan</h2>
        <p>
          Total Daily Energy Expenditure (TDEE) is the number of calories your body burns in a
          24-hour period including basal metabolism, the thermic effect of food, non-exercise
          activity thermogenesis (NEAT), and intentional exercise. Every weight-loss, weight-gain,
          and body-recomposition plan starts here. Without an accurate TDEE estimate you are
          flying blind: a 300-kcal-per-day error compounds into a 9-kg-per-year swing in body
          mass for sedentary adults. This calculator gives you three independently validated
          formulas so you can sanity-check the result, then translates the calorie target into
          protein, fat, and carbohydrate grams using five science-backed macro presets.
        </p>

        <h2>1. BMR Formulas — Which to Use?</h2>
        <p>The calculator supports three formulas. Select the one that best fits your data:</p>
        <table>
          <thead>
            <tr>
              <th>Formula</th>
              <th>Best for</th>
              <th>Inputs needed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mifflin-St Jeor</strong></td>
              <td>General population — most validated (2002 ADA recommendation)</td>
              <td>Sex, age, height, weight</td>
            </tr>
            <tr>
              <td><strong>Harris-Benedict (revised)</strong></td>
              <td>Historical standard; tends to run 5–10% higher</td>
              <td>Sex, age, height, weight</td>
            </tr>
            <tr>
              <td><strong>Katch-McArdle</strong></td>
              <td>Athletes, very lean/obese individuals with known body-fat %</td>
              <td>Weight + body fat %</td>
            </tr>
          </tbody>
        </table>

        <h2>2. BMR — Mifflin-St Jeor (default)</h2>
        <pre>{`Male:   10 × kg + 6.25 × cm − 5 × age + 5
Female: 10 × kg + 6.25 × cm − 5 × age − 161`}</pre>
        <p>Current gold standard for the general population (±10% for most). Recommended by the American Dietetic Association since 2002.</p>

        <h2>3. BMR — Harris-Benedict (Roza & Shizgal 1984 revision)</h2>
        <pre>{`Male:   88.362 + 13.397 × kg + 4.799 × cm − 5.677 × age
Female: 447.593 + 9.247 × kg + 3.098 × cm − 4.330 × age`}</pre>
        <p>Older formula, generally predicts 5–10% higher BMR than Mifflin. Useful for comparison or when you've seen this formula used in research references.</p>

        <h2>4. BMR — Katch-McArdle (lean mass based)</h2>
        <pre>{`BMR = 370 + 21.6 × lean body mass (kg)
lean mass = weight × (1 − body fat % / 100)`}</pre>
        <p>More accurate for athletic or very lean/obese individuals when body-fat % is known. Enter body fat % on the calculator to enable this option.</p>

        <h2>5. Activity multipliers (TDEE)</h2>
        <table>
          <thead><tr><th>Level</th><th>Multiplier</th></tr></thead>
          <tbody>
            <tr><td>Sedentary (desk job)</td><td>× 1.2</td></tr>
            <tr><td>Light (1–3 days/week)</td><td>× 1.375</td></tr>
            <tr><td>Moderate (3–5 days)</td><td>× 1.55</td></tr>
            <tr><td>Active (6–7 days)</td><td>× 1.725</td></tr>
            <tr><td>Very active (2×/day, manual labor)</td><td>× 1.9</td></tr>
          </tbody>
        </table>

        <h2>6. Goal-based target kcal</h2>
        <ul>
          <li><strong>Lose</strong>: TDEE − 500 kcal (≈ 0.45 kg/week)</li>
          <li><strong>Maintain</strong>: TDEE</li>
          <li><strong>Gain</strong>: TDEE + 300 kcal (≈ 0.25 kg/week)</li>
          <li><strong>Cut</strong>: TDEE × 0.8, minimum 1,200 kcal</li>
        </ul>

        <h2>7. Macro Presets — Protein/Fat/Carb ratios</h2>
        <table>
          <thead>
            <tr>
              <th>Preset</th>
              <th>Protein</th>
              <th>Fat</th>
              <th>Carbs</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Balanced</strong></td>
              <td>30%</td><td>30%</td><td>40%</td>
              <td>General fitness, recomp</td>
            </tr>
            <tr>
              <td><strong>High Protein</strong></td>
              <td>40%</td><td>25%</td><td>35%</td>
              <td>Muscle building, cutting with muscle retention</td>
            </tr>
            <tr>
              <td><strong>Keto</strong></td>
              <td>25%</td><td>70%</td><td>5%</td>
              <td>Ketogenic diet, insulin sensitivity, seizure management</td>
            </tr>
            <tr>
              <td><strong>Zone</strong></td>
              <td>30%</td><td>30%</td><td>40%</td>
              <td>Zone diet / anti-inflammatory approach (same as Balanced)</td>
            </tr>
            <tr>
              <td><strong>Low Fat</strong></td>
              <td>25%</td><td>15%</td><td>60%</td>
              <td>Endurance athletes, high-volume training, cholesterol management</td>
            </tr>
          </tbody>
        </table>
        <p><em>Note: The default "Balanced" mode uses goal-based protein (1.6–2.2 g/kg body weight), not a fixed percentage, which is more accurate for body composition goals.</em></p>

        <h2>8. When to deviate</h2>
        <ul>
          <li>Endurance athletes benefit from higher carbs (50–60% of kcal) — use Low Fat preset.</li>
          <li>Strict keto requires fat 70%+ and carbs under 50g/day — use Keto preset.</li>
          <li>Older adults may need protein as high as 2.0 g/kg to preserve muscle.</li>
          <li>If formulas disagree significantly (&gt;200 kcal), provide body fat % for Katch-McArdle.</li>
        </ul>

        <h2>9. Putting it together — a worked example</h2>
        <p>
          Take a 32-year-old male, 178 cm, 80 kg, moderate activity (gym 3–5 days/week), goal:
          lose 0.5 kg/week with muscle retention.
        </p>
        <ol>
          <li>
            <strong>BMR (Mifflin)</strong>: 10 × 80 + 6.25 × 178 − 5 × 32 + 5 = 800 + 1112.5 − 160 + 5 = <strong>1757.5 kcal</strong>.
          </li>
          <li>
            <strong>TDEE</strong>: 1757.5 × 1.55 = <strong>2724 kcal</strong> maintenance.
          </li>
          <li>
            <strong>Cut target</strong>: 2724 − 500 = <strong>2224 kcal/day</strong>.
          </li>
          <li>
            <strong>Protein</strong>: 2.0 g/kg × 80 kg = 160 g = 640 kcal (29%).
          </li>
          <li>
            <strong>Fat</strong>: 25% of 2224 = 556 kcal = 62 g.
          </li>
          <li>
            <strong>Carbs</strong>: 2224 − 640 − 556 = 1028 kcal = 257 g (46%).
          </li>
        </ol>
        <p>
          Two weeks later, the scale stalls. Possibilities: NEAT compensation (body unconsciously
          moves less), water retention from cortisol or training, measurement error, or the
          original TDEE estimate was 100–200 kcal high. The fix is to re-weigh on the same day
          of the week for 7-day rolling averages instead of single weigh-ins, and adjust the
          calorie target by ±100 kcal every 2–3 weeks until rate of loss matches the goal.
        </p>

        <h2>10. Common mistakes when interpreting TDEE numbers</h2>
        <ul>
          <li>
            <strong>Treating the result as exact</strong>. Even the best formula has a ±10%
            standard deviation. Use it as a starting point and adjust based on real weight-trend
            data over 2–4 weeks.
          </li>
          <li>
            <strong>Choosing the activity multiplier optimistically</strong>. The biggest source
            of error: people log 5 gym sessions a week but spend the rest of the day sedentary.
            Office worker + 3 gym sessions is usually 1.375 (light), not 1.55 (moderate).
          </li>
          <li>
            <strong>Cutting too aggressively</strong>. A 1000 kcal deficit produces muscle loss,
            hormonal disruption, and rebound eating for most people. Cap deficits at 25% below
            TDEE.
          </li>
          <li>
            <strong>Ignoring protein during cuts</strong>. Protein intake of 1.6–2.2 g/kg
            prevents most of the muscle loss that would otherwise accompany a calorie deficit.
            This is the single most important macro for body composition.
          </li>
          <li>
            <strong>Forgetting fiber and micronutrients</strong>. Macros are 80% of the picture
            — the other 20% (fiber 25–35 g/day, vitamins from real food, hydration 30–40 ml/kg)
            determines whether the diet is sustainable.
          </li>
        </ul>

        <h2>11. References &amp; further reading</h2>
        <ul>
          <li>Mifflin et al., <em>Am J Clin Nutr</em> 1990. A new predictive equation for resting energy expenditure in healthy individuals.</li>
          <li>Roza &amp; Shizgal, <em>Am J Clin Nutr</em> 1984 (Harris-Benedict revision).</li>
          <li>Katch-McArdle, <em>Exercise Physiology</em>. Lean-mass-based BMR derivation.</li>
          <li>ISSN Position Stand: Protein &amp; Exercise (Stokes et al., 2018).</li>
          <li>Trexler et al., <em>JISSN</em> 2014. Metabolic adaptation to weight loss.</li>
        </ul>

        <p className="text-sm text-slate-500">
          This guide is for educational purposes only and is not medical or nutritional advice.
          Consult a registered dietitian for personalized planning, especially if you have
          metabolic, kidney, or eating-disorder history.
        </p>
      </article>

      <p className="mt-8 text-sm text-slate-500">
        <Link to="/" className="underline">Back to calculator</Link>.
      </p>
    </>
  );
}
