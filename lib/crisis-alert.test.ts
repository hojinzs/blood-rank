import test from 'node:test';
import assert from 'node:assert/strict';

import { getEmergencyMessage, getReservationCtaLabel, isCrisisAlert } from './crisis-alert.ts';

test('critical status triggers crisis alert even when days are not below two', () => {
  assert.equal(isCrisisAlert({ days: 2.4, status: 'critical' }), true);
});

test('days below two trigger emergency message with tomorrow depletion copy', () => {
  assert.equal(
    getEmergencyMessage({ bloodType: 'A', days: 1.2, status: 'warning' }),
    '🚨 A형 보유량 1.2일. 내일이면 바닥입니다.',
  );
});

test('sub-one-day supply uses same-day depletion copy', () => {
  assert.equal(
    getEmergencyMessage({ bloodType: 'O', days: 0.8, status: 'critical' }),
    '🚨 O형 보유량 0.8일. 오늘 안에 바닥날 수 있습니다.',
  );
});

test('critical status with two or more days avoids tomorrow depletion copy', () => {
  assert.equal(
    getEmergencyMessage({ bloodType: 'AB', days: 2.4, status: 'critical' }),
    '🚨 AB형 보유량 2.4일. 위기 단계가 계속되고 있습니다.',
  );
});

test('non-crisis supply keeps normal reservation CTA', () => {
  assert.equal(getReservationCtaLabel({ days: 3.5, status: 'ok' }), '지금 헌혈 예약하기');
});

test('crisis supply switches reservation CTA label', () => {
  assert.equal(getReservationCtaLabel({ days: 1.7, status: 'warning' }), '긴급 헌혈 예약하기');
});
