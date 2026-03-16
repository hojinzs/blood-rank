"use client";

import { useState, useEffect } from 'react';
import { getCardCopy, type BloodType } from '@/lib/messages';

interface BloodDataProps {
  blood_type: BloodType;
  days: number;
  rank: number;
  status: string;
  date?: string;
  scraped_at?: string;
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
    const copy = getCardCopy(bloodData.blood_type, bloodData.rank);
    const text = encodeURIComponent(`[혈부심] ${bloodData.blood_type}형 현재 ${bloodData.rank}위\n\n"${copy}"\n\n`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setIsOpen(false);
  };

  const handleThreadsShare = () => {
    const copy = getCardCopy(bloodData.blood_type, bloodData.rank);
    const text = encodeURIComponent(`[혈부심] ${bloodData.blood_type}형 현재 ${bloodData.rank}위\n\n"${copy}"\n\n`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://threads.net/intent/post?text=${text}&url=${url}`, '_blank');
    setIsOpen(false);
  };

  const handleKakaoShare = () => {
    if (typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()) {
      const copy = getCardCopy(bloodData.blood_type, bloodData.rank);
      
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `혈부심 | ${bloodData.blood_type}형 현재 ${bloodData.rank}위`,
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
            ? "flex-1 text-center bg-white hover:bg-stone-50 text-stone-700 font-bold py-4 px-4 rounded-2xl transition-all shadow-md ring-1 ring-stone-200 active:scale-[0.98] flex items-center justify-center gap-2"
            : "flex items-center justify-center px-4 py-3 bg-white hover:bg-stone-50 text-stone-600 text-sm font-bold rounded-xl transition-colors ring-1 ring-stone-200 shrink-0"
        }
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={variant === 'primary' ? "w-5 h-5" : "w-4 h-4"}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        공유
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white border border-stone-100 p-6 md:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-fade-in text-center relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 transition-colors bg-stone-100 hover:bg-stone-200 rounded-full p-2"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-8 text-stone-800 tracking-tight">{bloodData.blood_type}형 상태 공유하기</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleKakaoShare}
                className="flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-extrabold py-4 px-6 rounded-2xl transition-colors w-full shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-5 h-5 fill-current">
                  <path d="M50 11C23.6 11 2 27.6 2 48c0 13.5 9 25.4 22.8 32.2l-4.5 16.5c-.3 1.1 1 2 1.9 1.4l19.5-13.3c2.7.4 5.4.6 8.3.6 26.4 0 48-16.6 48-37S76.4 11 50 11z"/>
                </svg>
                카카오톡으로 공유
              </button>
              <button 
                onClick={handleTwitterShare}
                className="flex items-center justify-center gap-3 bg-black hover:bg-stone-800 text-white font-extrabold py-4 px-6 rounded-2xl transition-colors w-full shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                </svg>
                X (트위터)로 퍼가기
              </button>
              <button 
                onClick={handleThreadsShare}
                className="flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold py-4 px-6 rounded-2xl transition-colors w-full shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" className="w-6 h-6 fill-current">
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.3109C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.194473 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                </svg>
                Threads로 공유하기
              </button>
              <button 
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold py-4 px-6 rounded-2xl transition-colors w-full relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                {isCopied ? '복사 완료!' : '링크 복사하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
