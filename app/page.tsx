import { supabase } from '@/lib/supabase';
import { getTitleCopy, getCardCopy } from '@/lib/messages';
import ShareButton from '@/components/ShareButton';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const typeParam = resolvedSearchParams.type as string;

  const { data } = await supabase.from('blood_supply_latest').select('*').order('rank', { ascending: true });
  
  let title = '혈부심 | 헌혈 독려 프로젝트';
  let ogImage = '/api/og';

  if (data && data.length > 0) {
    let targetData = data[0];
    
    // URL에 type 파라미터가 있으면 그 혈액형 기준, 없으면 1위 기준
    if (typeParam && ['A', 'B', 'O', 'AB'].includes(typeParam)) {
      const found = data.find(item => item.blood_type === typeParam);
      if (found) targetData = found;
    }

    title = `혈부심 | ${getTitleCopy(targetData.blood_type as any)}`;
    ogImage = `/api/og?type=${targetData.blood_type}&rank=${targetData.rank}&days=${targetData.days}`;
  }

  return {
    title,
    description: '혈액형 팀전 헌혈 독려 웹사이트',
    openGraph: {
      images: [ogImage],
    }
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
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-stone-200 dark:text-stone-800"
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
      <span className={`absolute font-black ${fontSizeClass} text-stone-700 dark:text-stone-200`}>
        {bloodType}
      </span>
    </div>
  );
}

export default async function Home() {
  const { data: bloodData } = await supabase.from('blood_supply_latest').select('*').order('rank', { ascending: true });
  
  if (!bloodData || bloodData.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-stone-800 dark:text-stone-200">데이터를 불러오는 중입니다.</h1>
        <p className="text-stone-500">잠시 후 다시 확인해주세요.</p>
      </main>
    );
  }

  const firstPlace = bloodData[0];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-rose-300 selection:text-white pb-20 transition-colors duration-300">
      <header className="py-12 px-6 flex flex-col items-center justify-center bg-rose-50/50 dark:bg-stone-900/50 border-b border-rose-100 dark:border-stone-800">
        <div className="text-rose-400 text-sm font-bold tracking-widest uppercase mb-4">Blood Rank</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-stone-800 dark:text-stone-100 font-extrabold text-center max-w-3xl leading-tight text-balance break-keep">
          {getTitleCopy(firstPlace.blood_type as any)}
        </h1>
        <p className="mt-4 text-sm text-stone-500 max-w-lg text-center leading-relaxed break-keep">
          혈액형 성격설은 과학적 근거가 없습니다. 그냥 재밌잖아요 😄
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">실시간 혈액형 팀 순위</h2>
          <span className="text-sm text-stone-500 font-medium flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-400"></span>
            </span>
            Live (대한적십자사 기준)
          </span>
        </div>

        <div className="flex flex-col gap-8">
          {/* 1위 카드 - 가로형 강조 레이아웃 */}
          <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-stone-800/80 border border-rose-100 dark:border-stone-700 shadow-[0_8px_30px_rgb(251,113,133,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300">
            <div className="absolute -top-4 -right-2 md:-right-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg transform rotate-3 border-[3px] border-white dark:border-stone-800">
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
                  <div className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter mb-2 text-stone-800 dark:text-stone-100">
                    {firstPlace.days} <span className="text-2xl text-stone-400 font-bold">일분</span>
                  </div>
                  <div className={`text-lg font-bold ${firstPlace.days >= 5 ? 'text-emerald-500' : firstPlace.days >= 3 ? 'text-amber-500' : firstPlace.days >= 2 ? 'text-rose-400' : 'text-red-500 animate-pulse'}`}>
                    {firstPlace.days >= 5 ? '🟢 여유 있어요' : firstPlace.days >= 3 ? '🟡 보통이에요' : firstPlace.days >= 2 ? '🔴 조금 위태위태' : '🚨 긴급해요!'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between w-full md:w-1/2 gap-6">
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-3xl p-6 md:p-8 flex-1 relative overflow-hidden border border-stone-100 dark:border-stone-700 shadow-inner">
                  <div className="absolute top-0 left-0 w-2 h-full bg-rose-200 dark:bg-rose-900" />
                  <p className="text-xl md:text-2xl text-stone-700 dark:text-stone-300 leading-relaxed font-bold break-keep">
                    "{getCardCopy(firstPlace.blood_type as any, 1)}"
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
              const cardBg = isLast ? 'bg-rose-50/50 dark:bg-stone-800 border-rose-200 dark:border-rose-900/50' : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700';
              const cardShadow = isLast ? 'shadow-[0_8px_30px_rgb(251,113,133,0.08)] dark:shadow-none' : 'shadow-sm dark:shadow-none';

              const statusColors: any = {
                good: 'text-emerald-500',
                ok: 'text-amber-500',
                warning: 'text-rose-400',
                critical: 'text-red-500 animate-pulse font-bold'
              };
              const statusLabels: any = {
                good: '🟢 여유',
                ok: '🟡 보통',
                warning: '🔴 조금 위태',
                critical: '🚨 안돼요!'
              };

              return (
                <div key={item.blood_type} className={`relative p-6 rounded-3xl border ${cardBg} ${cardShadow} transition-all duration-300 flex flex-col h-full hover:shadow-md hover:-translate-y-1`}>
                  {isLast && (
                     <div className="absolute -top-3 -right-2 bg-rose-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transform -rotate-3 border-2 border-white dark:border-stone-800">
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
                        <div className="text-3xl font-black tabular-nums tracking-tighter text-stone-800 dark:text-stone-100">
                          {item.days} <span className="text-sm text-stone-400 font-bold">일</span>
                        </div>
                        <div className={`text-sm mt-0.5 font-bold ${statusColors[item.status as string] || 'text-stone-400'}`}>
                          {statusLabels[item.status as string] || item.status}
                        </div>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-stone-200 dark:text-stone-700 italic">
                      #{item.rank}
                    </div>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-900/50 rounded-2xl p-5 mb-6 border border-stone-100 dark:border-stone-700 flex-grow shadow-inner">
                    <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed font-bold break-keep">
                      "{getCardCopy(item.blood_type as any, item.rank)}"
                    </p>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <a 
                      href="https://www.bloodinfo.net/knrcbs/bh/resv/resvBldHousStep1.do?mi=1094" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-200 text-sm font-bold py-3 px-4 rounded-xl transition-colors ring-1 ring-stone-200 dark:ring-stone-600"
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
