import { hasSupabaseEnv, supabase } from '@/lib/supabase';
import { getTitleCopy, getCardCopy, isBloodType, type BloodType } from '@/lib/messages';
import ShareButton from '@/components/ShareButton';
import type { Metadata } from 'next';

export const revalidate = 3600;

type BloodStatus = 'good' | 'ok' | 'warning' | 'critical';

interface BloodSupplyRow {
  blood_type: BloodType;
  days: number;
  rank: number;
  scraped_at: string;
  status: BloodStatus;
  date?: string;
}

const statusColors: Record<BloodStatus, string> = {
  good: 'text-emerald-500',
  ok: 'text-amber-500',
  warning: 'text-rose-400',
  critical: 'text-red-500 animate-pulse font-bold',
};

const statusLabels: Record<BloodStatus, string> = {
  good: '🟢 여유',
  ok: '🟡 보통',
  warning: '🔴 조금 위태',
  critical: '🚨 안돼요!',
};

const loadBloodData = async (): Promise<BloodSupplyRow[] | null> => {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from('blood_supply_latest')
    .select('*')
    .order('rank', { ascending: true });

  return (data as BloodSupplyRow[] | null) ?? null;
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
  if (!hasSupabaseEnv) {
    return {
      title: '혈부심 | 헌혈 독려 프로젝트',
      description: '혈액형 팀전 헌혈 독려 웹사이트',
    };
  }

  const resolvedSearchParams = await searchParams;
  const typeParam = Array.isArray(resolvedSearchParams.type)
    ? resolvedSearchParams.type[0]
    : resolvedSearchParams.type;

  const data = await loadBloodData();
  
  let title = '혈부심 | 헌혈 독려 프로젝트';
  let ogImage = '/api/og';

  if (data && data.length > 0) {
    let targetData = data[0] as BloodSupplyRow;
    
    // URL에 type 파라미터가 있으면 그 혈액형 기준, 없으면 1위 기준
    if (typeParam && isBloodType(typeParam)) {
      const found = data.find(item => item.blood_type === typeParam);
      if (found) targetData = found as BloodSupplyRow;
    }

    title = `혈부심 | ${getTitleCopy(targetData.blood_type)}`;
    ogImage = `/api/og?type=${targetData.blood_type}&rank=${targetData.rank}&days=${targetData.days}`;
  }

  const description = '혈액형 팀전 헌혈 독려 웹사이트';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

function BloodCircularProgress({ days, bloodType, sizeClass = "w-24 h-24", strokeWidth = 8, fontSizeClass = "text-4xl" }: { days: number, bloodType: string, sizeClass?: string, strokeWidth?: number, fontSizeClass?: string }) {
  const max = 10;
  const percent = Math.min(Math.max(days, 0), max) / max;
  const radius = 50 - strokeWidth / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass}`}>
      <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
        <circle
          className="text-stone-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className="text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)] transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
      <span className={`absolute font-black ${fontSizeClass} text-stone-700`}>
        {bloodType}
      </span>
    </div>
  );
}

export default async function Home() {
  if (!hasSupabaseEnv) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-stone-800">서비스 설정을 확인하고 있어요.</h1>
        <p className="text-stone-500">잠시 후 다시 확인해주세요.</p>
      </main>
    );
  }

  let bloodData = await loadBloodData();

  // 데이터가 없으면 스크래핑을 트리거하고 다시 조회
  if (!bloodData || bloodData.length === 0) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    await fetch(`${baseUrl}/api/cron/scrape`, {
      headers: process.env.CRON_SECRET
        ? { Authorization: `Bearer ${process.env.CRON_SECRET}` }
        : {},
    });

    bloodData = await loadBloodData();
  }

  if (!bloodData || bloodData.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-stone-800">데이터를 불러오는 중입니다.</h1>
        <p className="text-stone-500">잠시 후 다시 확인해주세요.</p>
      </main>
    );
  }

  const firstPlace = bloodData[0];
  const collectionDate = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'Asia/Seoul'
  }).format(new Date(firstPlace.scraped_at));

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-rose-300 selection:text-white pb-20 transition-colors duration-300">
      <header className="py-12 px-6 flex flex-col items-center justify-center bg-rose-50/50 border-b border-rose-100">
        <div className="text-rose-400 text-sm font-bold tracking-widest uppercase mb-4">Blood Rank</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-stone-800 font-extrabold text-center max-w-3xl leading-tight text-balance break-keep">
          {getTitleCopy(firstPlace.blood_type as BloodType)}
        </h1>
        <p className="mt-4 text-sm text-stone-500 max-w-lg text-center leading-relaxed break-keep">
          혈액형 성격설은 과학적 근거가 없습니다. 그냥 재밌잖아요 😄
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-stone-800">실시간 혈액형 팀 순위</h2>
          <span className="text-sm text-stone-500 font-medium flex items-center gap-1.5" title="대한적십자사 기준 데이터 수집일자">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {collectionDate} 수집
          </span>
        </div>

        <div className="flex flex-col gap-8">
          {/* 1위 카드 - 가로형 강조 레이아웃 */}
          <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white border border-rose-100 shadow-[0_8px_30px_rgb(251,113,133,0.12)][0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300">
            <div className="absolute -top-4 -right-2 md:-right-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg transform rotate-3 border-[3px] border-white">
              현재 1위 👑
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-1/2">
                <BloodCircularProgress 
                  days={firstPlace.days} 
                  bloodType={firstPlace.blood_type as string} 
                  sizeClass="w-28 h-28 md:w-32 md:h-32"
                  fontSizeClass="text-4xl md:text-5xl"
                  strokeWidth={8}
                />
                <div className="text-center md:text-left flex-1">
                  <div className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter mb-2 text-stone-800">
                    {firstPlace.days} <span className="text-2xl text-stone-400 font-bold">일분</span>
                  </div>
                  <div className={`text-lg font-bold ${firstPlace.days >= 5 ? 'text-emerald-500' : firstPlace.days >= 3 ? 'text-amber-500' : firstPlace.days >= 2 ? 'text-rose-400' : 'text-red-500 animate-pulse'}`}>
                    {firstPlace.days >= 5 ? '🟢 여유 있어요' : firstPlace.days >= 3 ? '🟡 보통이에요' : firstPlace.days >= 2 ? '🔴 조금 위태위태' : '🚨 긴급해요!'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between w-full md:w-1/2 gap-6">
                <div className="bg-stone-50 rounded-3xl p-6 md:p-8 flex-1 relative overflow-hidden border border-stone-100 shadow-inner">
                  <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-bold break-keep">
                    &ldquo;{getCardCopy(firstPlace.blood_type as BloodType, 1)}&rdquo;
                  </p>
                </div>
                
                <div className="flex gap-3 w-full">
                  <a 
                    href="https://www.bloodinfo.net/knrcbs/bh/resv/resvBldHousStep1.do?mi=1094" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-2 text-center bg-rose-400 hover:bg-rose-500 text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    지금 헌혈 예약하기
                  </a>
                  <ShareButton bloodData={firstPlace} variant="primary" />
                </div>
              </div>
            </div>
          </div>

          {/* 2, 3, 4위 카드 - 3열 그리드 레이아웃 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bloodData.slice(1).map((item) => {
              const isLast = item.rank === 4;
              const cardBg = isLast ? 'bg-white border-rose-200' : 'bg-white border-stone-100';
              const cardShadow = isLast ? 'shadow-[0_8px_30px_rgb(251,113,133,0.08)]' : 'shadow-sm';

              return (
                <div key={item.blood_type} className={`relative p-6 rounded-3xl border ${cardBg} ${cardShadow} transition-all duration-300 flex flex-col h-full hover:shadow-md hover:-translate-y-1`}>
                  {isLast && (
                     <div className="absolute -top-3 -right-2 bg-rose-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transform -rotate-3 border-2 border-white">
                      꼴찌 위기 🚨
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <BloodCircularProgress 
                        days={item.days} 
                        bloodType={item.blood_type as string} 
                        sizeClass="w-16 h-16"
                        fontSizeClass="text-2xl"
                        strokeWidth={10}
                      />
                      <div>
                        <div className="text-3xl font-black tabular-nums tracking-tighter text-stone-800">
                          {item.days} <span className="text-sm text-stone-400 font-bold">일</span>
                        </div>
                        <div className={`text-sm mt-0.5 font-bold ${statusColors[item.status] || 'text-stone-400'}`}>
                          {statusLabels[item.status] || item.status}
                        </div>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-stone-200 italic">
                      #{item.rank}
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-5 mb-6 border border-stone-100 flex-grow shadow-inner">
                    <p className="text-stone-600 text-sm leading-relaxed font-bold break-keep">
                      &ldquo;{getCardCopy(item.blood_type as BloodType, item.rank)}&rdquo;
                    </p>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <a 
                      href="https://www.bloodinfo.net/knrcbs/bh/resv/resvBldHousStep1.do?mi=1094" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-stone-100 hover:bg-stone-200:bg-stone-600 text-stone-600 text-sm font-bold py-3 px-4 rounded-xl transition-colors ring-1 ring-stone-200"
                    >
                      예약하기
                    </a>
                    <ShareButton bloodData={item} variant="secondary" />
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>
    </main>
  );
}
