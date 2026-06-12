import { DEV_TOOLS_ENABLED, SIMULATED_OCR_FALLBACK } from '../config/features';

describe('Feature flags: v1 release (real flag values)', () => {
  it('ties dev tools to __DEV__ so they never reach release builds', () => {
    expect(DEV_TOOLS_ENABLED).toBe(__DEV__);
  });

  it('ties the simulated OCR fallback to __DEV__ so release builds never show fake data', () => {
    expect(SIMULATED_OCR_FALLBACK).toBe(__DEV__);
  });
});
