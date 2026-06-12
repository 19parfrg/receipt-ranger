import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { AppProvider, useApp } from '../context/AppContext';
import { Receipt } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

// RNTL v14 renderHook/act are async (concurrent rendering).
const renderApp = () => renderHook(() => useApp(), { wrapper });

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('AppContext initialization', () => {
  it('seeds demo receipts on first launch in dev builds (__DEV__ is true under Jest)', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));
    expect(await AsyncStorage.getItem('@receipts')).not.toBeNull();
  });

  it('loads previously stored receipts instead of reseeding', async () => {
    const stored: Receipt[] = [
      {
        id: 'rcpt-x',
        merchant: 'Stored Merchant',
        date: '2026-06-01',
        amount: 5,
        category: 'Utilities',
        tax: 0,
        status: 'active',
      },
    ];
    await AsyncStorage.setItem('@receipts', JSON.stringify(stored));
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(1));
    expect(result.current.receipts[0].merchant).toBe('Stored Merchant');
  });
});

describe('AppContext.scanReceipt — real OCR pipeline', () => {
  it('adds a parsed receipt from on-device OCR and opens its detail view', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));

    await act(async () => {
      await result.current.scanReceipt('file:///receipt-coffee.png');
    });

    const newest = result.current.receipts[0];
    expect(newest.merchant).toBe('BLUE BOTTLE COFFEE');
    expect(newest.amount).toBe(12.45);
    expect(newest.tax).toBe(1.0);
    expect(newest.date).toBe('2026-06-05');
    expect(newest.category).toBe('Food & Dining');
    expect(newest.imageUri).toBe('file:///receipt-coffee.png');
    expect(result.current.activeReceiptId).toBe(newest.id);

    // Persisted to local storage
    const persisted = JSON.parse((await AsyncStorage.getItem('@receipts'))!);
    expect(persisted[0].merchant).toBe('BLUE BOTTLE COFFEE');
  });

  it('does not add a receipt when the image has no readable text', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));

    await act(async () => {
      await result.current.scanReceipt('file:///no-text.png');
    });

    expect(result.current.receipts.length).toBe(4);
    expect(result.current.toastMessage).toMatch(/no readable text/i);
    expect(result.current.isUploading).toBe(false);
  });
});

describe('AppContext receipt management', () => {
  it('archives and restores receipts', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));
    const id = result.current.receipts[0].id;

    await act(async () => {
      result.current.archiveReceipt(id);
    });
    expect(result.current.receipts.find(r => r.id === id)!.status).toBe('archived');

    await act(async () => {
      result.current.archiveReceipt(id);
    });
    expect(result.current.receipts.find(r => r.id === id)!.status).toBe('active');
  });

  it('deletes receipts and closes the detail view', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));
    const id = result.current.receipts[0].id;

    await act(async () => {
      result.current.setActiveReceiptId(id);
    });
    await act(async () => {
      result.current.deleteReceipt(id);
    });

    expect(result.current.receipts.find(r => r.id === id)).toBeUndefined();
    expect(result.current.activeReceiptId).toBeNull();
  });

  it('updates receipt fields', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));
    const id = result.current.receipts[0].id;

    await act(async () => {
      result.current.updateReceipt(id, { merchant: 'Edited Name', amount: 99.99 });
    });

    const edited = result.current.receipts.find(r => r.id === id)!;
    expect(edited.merchant).toBe('Edited Name');
    expect(edited.amount).toBe(99.99);
  });
});

describe('AppContext.exportToCSV', () => {
  it('escapes quotes and commas in merchant names', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));

    await act(async () => {
      result.current.addReceipt({
        id: 'rcpt-csv',
        merchant: 'Acme, "Quoted" Goods',
        date: '2026-06-10',
        amount: 10,
        category: 'Office Supplies',
        tax: 0.5,
        status: 'active',
      });
    });

    await act(async () => {
      await result.current.exportToCSV();
    });

    const writeMock = FileSystem.writeAsStringAsync as jest.Mock;
    expect(writeMock).toHaveBeenCalledTimes(1);
    const csv: string = writeMock.mock.calls[0][1];
    expect(csv).toContain('"Acme, ""Quoted"" Goods"');
    expect(csv.startsWith('ID,Merchant,Date,Amount,Tax,Category')).toBe(true);
  });

  it('exports only active receipts', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));

    await act(async () => {
      await result.current.exportToCSV();
    });

    const csv: string = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0][1];
    // The seeded mock data has one archived receipt (Netflix) that must be excluded.
    expect(csv).not.toContain('Netflix');
  });
});

describe('AppContext.resetData', () => {
  it('clears all receipts', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));

    await act(async () => {
      await result.current.resetData(false);
    });

    expect(result.current.receipts.length).toBe(0);
  });

  it('restores demo receipts in dev builds', async () => {
    const { result } = await renderApp();
    await waitFor(() => expect(result.current.receipts.length).toBe(4));

    await act(async () => {
      await result.current.resetData(false);
    });
    await act(async () => {
      await result.current.resetData(true);
    });

    expect(result.current.receipts.length).toBe(4);
  });
});
