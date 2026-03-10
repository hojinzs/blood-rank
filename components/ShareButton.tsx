"use client";

import { useState, useEffect } from 'react';
import { getCardCopy } from '@/lib/messages';

interface BloodDataProps {
  blood_type: string;
  days: number;
  rank: number;
  status: string;
  date: string;
  scraped_at: string;
}

export default function ShareButton({ bloodData, variant = 'secondary' }: { bloodData: BloodDataProps, variant?: 'primary' | 'secondary' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
      if (kakaoKey) {
        window.Kakao.init(kakaoKey);
      }
    }
  }, []);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?type=${bloodData.blood_type}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleTwitterShare = () => {
    const copy = getCardCopy(bloodData.blood_type as any, bloodData.rank);
    const text = encodeURIComponent(`[혈부심] ${bloodData.blood_type}형 현재 ${bloodData.rank}위 🩸\n\n"${copy}"\n\n`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setIsOpen(false);
  };

  const handleKakaoShare = () => {
    if (typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()) {
      const copy = getCardCopy(bloodData.blood_type as any, bloodData.rank);
      
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `혈부심 | ${bloodData.blood_type}형 현재 ${bloodData.rank}위 🩸`,
          description: `"${copy}"\n지금 바로 헌혈하고 순위를 올려보세요!`,
          imageUrl: `${window.location.origin}/api/og?type=${bloodData.blood_type}&rank=${bloodData.rank}&days=${bloodData.days}`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '순위 확인하기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
      setIsOpen(false);
    } else {
      alert('카카오톡 공유를 지금은 사용할 수 없습니다. 링크 복사 기능을 이용해주세요.');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={
          variant === 'primary' 
            ? "flex-1 text-center bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 px-4 rounded-2xl transition-all border border-neutral-700 active:scale-[0.98] flex items-center justify-center gap-2"
            : "flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/10 text-neutral-200 text-sm font-semibold rounded-xl transition-colors ring-1 ring-white/10 shrink-0"
        }
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={variant === 'primary' ? "w-5 h-5" : "w-4 h-4"}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        공유
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-fade-in text-center relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-6 text-white">{bloodData.blood_type}형 상태 공유하기</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleKakaoShare}
                className="flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-semibold py-3.5 px-6 rounded-xl transition-colors w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-5 h-5 fill-current">
                  <path d="M50 11C23.6 11 2 27.6 2 48c0 13.5 9 25.4 22.8 32.2l-4.5 16.5c-.3 1.1 1 2 1.9 1.4l19.5-13.3c2.7.4 5.4.6 8.3.6 26.4 0 48-16.6 48-37S76.4 11 50 11z"/>
                </svg>
                카카오톡
              </button>
              <button 
                onClick={handleTwitterShare}
                className="flex items-center justify-center gap-3 bg-black hover:bg-neutral-800 text-white border border-neutral-700 font-semibold py-3.5 px-6 rounded-xl transition-colors w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                </svg>
                X(트위터)
              </button>
              <button 
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors w-full relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                {isCopied ? '복사 완료!' : '링크 복사'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
