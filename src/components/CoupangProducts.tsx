import { useLocation } from 'react-router-dom';
import products from '../data/coupang-products.json';

// 도구 주제에 맞춰 손으로 고른 쿠팡 상품 링크.
// 무맥락 캐러셀 배너(전 도구 공통)와 달리 이 도구를 쓰는 사람이 실제로 살 만한 것만 넣는다.
// 파트너스 Open API 없이도 대시보드 '링크 생성'으로 만든 단축링크를 그대로 쓸 수 있다.
// data/coupang-products.json 이 비어 있으면 아무것도 렌더링하지 않는다.

interface Item {
  url: string;
  ko: string;
  en?: string;
  note?: { ko: string; en?: string };
}

const DISCLOSURE_KO =
  '쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받습니다.';
const DISCLOSURE_EN =
  'As a Coupang Partners affiliate, this site earns a commission from qualifying purchases.';

export default function CoupangProducts() {
  // url 이 비어 있는 항목은 아직 파트너스 링크를 만들지 않은 자리다 — 렌더링하지 않는다.
  const items = ((products as { items?: Item[] }).items ?? []).filter((it) => it.url.trim() !== '');
  const location = useLocation();
  const path = location.pathname;
  // basename(/tools/<slug>)은 router가 이미 제거하므로 '/en' 접두만 보면 된다.
  const ko = !(path === '/en' || path.startsWith('/en/'));

  if (items.length === 0) return null;

  const heading = ko ? '이 계산에 자주 함께 찾는 것' : 'Often bought alongside';

  return (
    <aside className="mt-8 border-t border-slate-200 pt-6" aria-label={heading}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{heading}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it.url}>
            <a
              href={it.url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="block rounded-lg border border-slate-200 px-3 py-2 text-sm transition hover:border-emerald-400 hover:bg-emerald-50"
            >
              <span className="font-medium text-slate-800">
                {ko ? it.ko : it.en ?? it.ko}
              </span>
              {it.note && (
                <span className="mt-0.5 block text-xs text-slate-500">
                  {ko ? it.note.ko : it.note.en ?? it.note.ko}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-tight text-slate-400">
        {ko ? DISCLOSURE_KO : DISCLOSURE_EN}
      </p>
    </aside>
  );
}
