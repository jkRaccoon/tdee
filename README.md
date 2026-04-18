# TDEE & Macro Calculator

Live: https://tdee.bal.pe.kr

Calculate BMR (Mifflin-St Jeor or Katch-McArdle), TDEE (with 5 activity levels), and goal-based macros (protein/fat/carbs) for lose / maintain / gain / cut presets.

## Development
```bash
npm install
npm run dev
```

## Deploy
Pushing to `main` triggers the shared OIDC GitHub Actions workflow which deploys via CDK.

## Stack
- Vite + React 19 + TypeScript + Tailwind
- Pure client-side calculations, no external API
- React Router 3 pages + puppeteer prerender
- AWS S3 + CloudFront + ACM + Route53 (`microsaas-infra` CDK Construct)
