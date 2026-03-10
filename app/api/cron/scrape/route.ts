import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // 인증 검증 (수동 트리거 시 사용)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    if (process.env.NODE_ENV === 'production') {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const res = await fetch('https://www.bloodinfo.net/knrcbs/bi/info/bldHoldSttus.do?mi=1046');

    if (!res.ok) throw new Error('Failed to fetch blood info');

    const html = await res.text();
    const $ = cheerio.load(html);

    // 테이블 헤더 파싱
    const columns: string[] = [];
    $('table th').each((_, el) => {
      columns.push($(el).text().replace(/\s+/g, ' ').trim());
    });

    // 각 행에서 데이터 추출
    const dailyConsumption: Record<string, number> = {};
    const currentHoldings: Record<string, number> = {};
    const holdDays: Record<string, number> = {};

    $('table tr').each((_, el) => {
      const firstCell = $(el).find('td').first().text().replace(/\s+/g, ' ').trim();

      if (firstCell === '1일 소요량') {
        $(el).find('td').each((j, td) => {
          if (j === 0) return;
          const colName = columns[j];
          const val = parseInt($(td).text().replace(/,/g, '').replace(/\s+/g, '').trim(), 10);
          if (colName?.endsWith('형') && !isNaN(val)) {
            dailyConsumption[colName.replace('형', '')] = val;
          }
        });
      }

      if (firstCell === '현재 혈액보유량') {
        $(el).find('td').each((j, td) => {
          if (j === 0) return;
          const colName = columns[j];
          const val = parseInt($(td).text().replace(/,/g, '').replace(/\s+/g, '').trim(), 10);
          if (colName?.endsWith('형') && !isNaN(val)) {
            currentHoldings[colName.replace('형', '')] = val;
          }
        });
      }

      if (firstCell === '보유상태') {
        $(el).find('td').each((j, td) => {
          if (j === 0) return;
          const colName = columns[j];
          const val = parseFloat($(td).text().replace('일', '').replace(/\s+/g, '').trim());
          if (colName?.endsWith('형') && !isNaN(val)) {
            holdDays[colName.replace('형', '')] = val;
          }
        });
      }
    });

    if (Object.keys(holdDays).length !== 4) {
      throw new Error(`4개 혈액형 파싱 실패. 파싱된 항목: ${JSON.stringify(holdDays)}`);
    }

    // 순위 계산 (보유일수 내림차순: 1위 = 보유 많음)
    const typesArray = Object.keys(holdDays).map(bt => ({
      blood_type: bt,
      days: holdDays[bt],
      daily_consumption: dailyConsumption[bt] ?? null,
      current_holdings: currentHoldings[bt] ?? null,
    }));
    typesArray.sort((a, b) => b.days - a.days);

    const getStatus = (days: number) => {
      if (days >= 5.0) return 'good';
      if (days >= 3.0) return 'ok';
      if (days >= 2.0) return 'warning';
      return 'critical';
    };

    // KST 날짜 기준
    const nowKst = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const dateStr = nowKst.toISOString().split('T')[0];
    const scrapedAt = new Date().toISOString();

    const insertData = typesArray.map((item, index) => ({
      date: dateStr,
      scraped_at: scrapedAt,
      blood_type: item.blood_type,
      days: item.days,
      daily_consumption: item.daily_consumption,
      current_holdings: item.current_holdings,
      rank: index + 1,
      status: getStatus(item.days),
    }));

    const { error } = await supabase
      .from('blood_supply_daily')
      .upsert(insertData, { onConflict: 'date, blood_type' });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, count: insertData.length, data: insertData });

  } catch (error: any) {
    console.error('Scraping Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
