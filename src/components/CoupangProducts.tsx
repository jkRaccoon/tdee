import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import data from '../data/coupang-products.json';

// 도구 주제에 맞춘 쿠팡 상품 카드. 무맥락 캐러셀 배너 대신 이 도구를 쓰는 사람이 실제로 살 만한 것만
// 계산 결과 흐름 안에 섞어 보여 준다. 링크·이미지는 microsaas-infra/scripts/coupang-links 가 채운다(subId=도구 slug).
//
// 배치: 페이지가 결과 바로 아래에 <CoupangProducts placement="inline" /> 을 두면 그 자리에 나오고,
// RootLayout 의 기본 슬롯(placement="layout")은 그 페이지에서 숨는다. 인라인이 없는 가이드·FAQ 는 레이아웃 슬롯이 맡는다.
// 가격은 넣지 않는다 — 정적 데이터라 금방 틀리고, 틀린 가격 노출은 파트너스 정책 위반 소지가 있다.

interface Item {
  url: string;
  ko: string;
  en?: string;
  note?: { ko: string; en?: string };
  title?: string;
  image?: string;
  reviews?: number | null;
  badges?: string[];
}

interface Data {
  heading?: { ko: string; en?: string };
  items?: Item[];
}

interface Props {
  placement?: 'inline' | 'layout';
  /** 사이트 배경에 맞춘 색 — 어두운 테마 도구는 dark */
  tone?: 'light' | 'dark';
  /** 페이지 섹션 간격 규칙(mb-6 / mt-6 등)을 그대로 따르기 위한 추가 클래스 */
  className?: string;
}

const SLUG = 'tdee';

const DISCLOSURE_KO = '쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받습니다.';
const DISCLOSURE_EN = 'As a Coupang Partners affiliate, this site earns a commission from qualifying purchases.';

const TONES = {
  light: {
    section: 'border-slate-200 bg-white shadow-sm',
    heading: 'text-slate-900',
    pill: 'border-slate-200 text-slate-400',
    card: 'border-slate-200 hover:border-slate-300 hover:shadow-md',
    label: 'text-slate-900',
    note: 'text-slate-500',
    meta: 'text-slate-500',
    rocket: 'text-sky-600',
    disclosure: 'text-slate-400',
  },
  dark: {
    section: 'border-slate-800 bg-slate-900/70',
    heading: 'text-white',
    pill: 'border-slate-700 text-slate-500',
    card: 'border-slate-700 bg-slate-800/40 hover:border-slate-500',
    label: 'text-slate-100',
    note: 'text-slate-400',
    meta: 'text-slate-400',
    rocket: 'text-sky-400',
    disclosure: 'text-slate-500',
  },
};

// 인라인 인스턴스 수. 하나라도 마운트돼 있으면 레이아웃 슬롯은 렌더링하지 않는다.
let inlineCount = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

function fmtReviews(n: number, ko: boolean) {
  if (ko && n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}만`;
  return n.toLocaleString(ko ? 'ko-KR' : 'en-US');
}

function track(event: string, params: Record<string, unknown>) {
  // 도구마다 Analytics 의 window.gtag 전역 선언 여부가 달라 여기서 직접 좁힌다.
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('event', event, { tool: SLUG, ...params });
}

export default function CoupangProducts({ placement = 'layout', tone = 'light', className = '' }: Props) {
  const { pathname } = useLocation();
  // basename(/tools/<slug>)은 router 가 이미 제거하므로 '/en' 접두만 보면 된다.
  const ko = !(pathname === '/en' || pathname.startsWith('/en/'));
  const inlineMounted = useSyncExternalStore(subscribe, () => inlineCount > 0, () => false);
  const ref = useRef<HTMLElement>(null);
  const c = TONES[tone];

  const { heading, items: all = [] } = data as Data;
  const items = all.filter((it) => it.url.trim() !== '' && it.image);
  const hidden = items.length === 0 || (placement === 'layout' && inlineMounted);

  useEffect(() => {
    if (placement !== 'inline') return;
    inlineCount += 1;
    emit();
    return () => {
      inlineCount -= 1;
      emit();
    };
  }, [placement]);

  // 노출 1회 기록 — 클릭 이벤트와 나눠 카드 CTR 을 본다.
  useEffect(() => {
    const el = ref.current;
    if (hidden || !el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track('coupang_products_view', { placement, path: pathname });
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hidden, placement, pathname]);

  if (hidden) return null;

  const title = ko ? heading?.ko ?? '함께 보면 좋은 상품' : heading?.en ?? 'Related picks';

  return (
    <section
      ref={ref}
      aria-label={title}
      className={`rounded-xl border p-4 sm:p-6 ${c.section} ${placement === 'layout' ? 'mt-8' : ''} ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className={`text-base font-bold ${c.heading}`}>{title}</h2>
        <span className={`shrink-0 rounded border px-1.5 py-px text-[10px] font-medium ${c.pill}`}>
          {ko ? '광고' : 'Ad'}
        </span>
      </div>

      {/* 모바일: 다음 카드가 살짝 보이는 가로 스와이프 / sm 이상: 4열 고정 — 상품이 적어도 카드가 커져 광고처럼 튀지 않게 */}
      <ul className="-mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {items.map((it, i) => {
          const label = ko ? it.ko : it.en ?? it.ko;
          const note = it.note && (ko ? it.note.ko : it.note.en);
          const rocket = it.badges?.includes('ROCKET');
          return (
            <li key={it.url} className="w-[42%] shrink-0 snap-start sm:w-auto">
              <a
                href={it.url}
                target="_blank"
                rel="sponsored nofollow noopener"
                title={it.title}
                onClick={() => track('coupang_product_click', { item: it.ko, position: i + 1, placement, path: pathname })}
                className={`group flex h-full flex-col rounded-lg border p-2 transition ${c.card}`}
              >
                <div className="aspect-square overflow-hidden rounded-md bg-white">
                  <img
                    src={it.image}
                    alt={it.title ?? label}
                    loading="lazy"
                    decoding="async"
                    width={300}
                    height={300}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-2 flex flex-1 flex-col px-0.5">
                  <span className={`text-sm font-semibold leading-snug ${c.label}`}>{label}</span>
                  {note && <span className={`mt-0.5 line-clamp-2 text-xs leading-snug ${c.note}`}>{note}</span>}
                  <span className={`mt-auto flex flex-wrap items-center gap-x-1.5 pt-1.5 text-[11px] ${c.meta}`}>
                    {/* 검색 API 평점은 0.5 단위 반올림이라 숫자로 쓰면 과장된다 — 리뷰 수만 보인다. */}
                    {it.reviews ? (
                      <span>
                        <span className="text-amber-500">★</span>{' '}
                        {ko ? `리뷰 ${fmtReviews(it.reviews, ko)}` : `${fmtReviews(it.reviews, ko)} reviews`}
                      </span>
                    ) : null}
                    {rocket && ko && <span className={`font-semibold ${c.rocket}`}>로켓배송</span>}
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      <p className={`mt-3 text-[11px] leading-snug ${c.disclosure}`}>{ko ? DISCLOSURE_KO : DISCLOSURE_EN}</p>
    </section>
  );
}
