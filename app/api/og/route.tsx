import { ImageResponse } from 'next/og';
import { getCardCopy } from '@/lib/messages';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ?type=O&rank=4&days=2.8
    const type = searchParams.get('type') || 'O';
    const rank = parseInt(searchParams.get('rank') || '4', 10);
    const days = searchParams.get('days') || '2.8';

    let bgColor = '#f43f5e'; // rose-500
    if (type === 'B') bgColor = '#3b82f6'; // blue-500
    if (type === 'O') bgColor = '#f59e0b'; // amber-500
    if (type === 'AB') bgColor = '#a855f7'; // purple-500

    const copy = getCardCopy(type as any, rank);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bgColor,
            padding: '40px',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '32px', padding: '60px', width: '100%', height: '100%' }}>
            <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 20 }}>
              Blood Rank - 혈부심
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
              <div style={{ backgroundColor: 'white', color: bgColor, borderRadius: '100%', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '40px', fontSize: 70, fontWeight: 900 }}>
                {type}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 80, fontWeight: 900 }}>{rank}위</span>
                <span style={{ fontSize: 45, opacity: 0.8, fontWeight: 700 }}>현재 {days}일치</span>
              </div>
            </div>

            <div style={{ fontSize: 45, fontWeight: 700, textAlign: 'center', lineHeight: 1.4, maxWidth: '90%', wordBreak: 'keep-all' }}>
              "{copy}"
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
