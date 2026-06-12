import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simulate a production (release) build: dev tools and the simulated OCR
// fallback are off. __DEV__ is true under Jest, so both must be forced false.
jest.mock('../config/features', () => ({
  DEV_TOOLS_ENABLED: false,
  SIMULATED_OCR_FALLBACK: false,
}));

import { AppProvider, useApp } from '../context/AppContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

// RNTL v14 renderHook/act are async (concurrent rendering).
const renderApp = () => renderHook(() => useApp(), { wrapper });

// Let the async init effect (AsyncStorage reads) settle.
const flushInit = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('Production build behavior (dev tools off)', () => {
  it('starts with an empty inbox on first launch — no demo data in release', async () => {
    const { result } = await renderApp();
    await flushInit();
    expect(result.current.receipts.length).toBe(0);
    // Nothing seeded into storage either
    expect(await AsyncStorage.getItem('@receipts')).toBeNull();
  });

  it('simulateUpload is a no-op in release builds', async () => {
    const { result } = await renderApp();
    await flushInit();

    await act(async () => {
      result.current.simulateUpload();
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.receipts.length).toBe(0);
  });

  it('resetData(true) clears instead of seeding demo receipts', async () => {
    const { result } = await renderApp();
    await flushInit();

    await act(async () => {
      await result.current.resetData(true);
    });

    expect(result.current.receipts.length).toBe(0);
    expect(result.current.toastMessage).toMatch(/cleared/i);
  });

  it('still scans real receipts via on-device OCR', async () => {
    const { result } = await renderApp();
    await flushInit();

    await act(async () => {
      await result.current.scanReceipt('file:///receipt-gas.png');
    });

    await waitFor(() => expect(result.current.receipts.length).toBe(1));
    expect(result.current.receipts[0].merchant).toBe('SHELL OIL CO');
    expect(result.current.receipts[0].category).toBe('Travel');
  });
});
