import type { BloodType } from './messages';

export type BloodStatus = 'good' | 'ok' | 'warning' | 'critical';

interface CrisisAlertInput {
  bloodType: BloodType;
  days: number;
  status: BloodStatus;
}

export const BLOOD_RESERVATION_URL =
  'https://www.bloodinfo.net/knrcbs/bh/resv/resvBldHousStep1.do?mi=1094';

const formatDays = (days: number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: Number.isInteger(days) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(days);
};

export const isCrisisAlert = ({ days, status }: Pick<CrisisAlertInput, 'days' | 'status'>) => {
  return status === 'critical' || days < 2;
};

export const getEmergencyMessage = ({ bloodType, days, status }: CrisisAlertInput) => {
  if (!isCrisisAlert({ days, status })) {
    return null;
  }

  const depletionCopy = days < 1 ? '오늘 안에 바닥날 수 있습니다.' : '내일이면 바닥입니다.';

  return `🚨 ${bloodType}형 보유량 ${formatDays(days)}일. ${depletionCopy}`;
};

export const getReservationCtaLabel = ({ days, status }: Pick<CrisisAlertInput, 'days' | 'status'>) => {
  return isCrisisAlert({ days, status }) ? '긴급 헌혈 예약하기' : '지금 헌혈 예약하기';
};
