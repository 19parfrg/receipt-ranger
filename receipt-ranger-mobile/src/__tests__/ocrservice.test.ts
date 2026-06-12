import { classifyText, parseDate, parseReceiptText, performOCR } from '../services/OCRService';

describe('OCRService.classifyText — keyword precedence', () => {
  it('classifies travel receipts', () => {
    expect(classifyText('UBER RIDE REPORT\nBase Fare $3.50')).toBe('Travel');
    expect(classifyText('SHELL OIL CO\nRegular Fuel 13.88 Gallons')).toBe('Travel');
    expect(classifyText('DELTA AIRLINES Ticket Flight DL1822')).toBe('Travel');
  });

  it('classifies utilities receipts', () => {
    expect(classifyText('COMCAST / XFINITY\nMonthly Internet Service')).toBe('Utilities');
    expect(classifyText('City Power Co electricity statement')).toBe('Utilities');
  });

  it('classifies entertainment receipts', () => {
    expect(classifyText('NETFLIX BILLING STATEMENT Premium Plan')).toBe('Entertainment');
    expect(classifyText('AMC Theater ticket purchase')).toBe('Entertainment');
  });

  it('classifies office supplies receipts', () => {
    expect(classifyText('OFFICE DEPOT #922\n1x USB-C Docking Station')).toBe('Office Supplies');
    expect(classifyText('Staples: ink and toner refill')).toBe('Office Supplies');
  });

  it('classifies food & dining receipts', () => {
    expect(classifyText('STARBUCKS COFFEE Store #48291 Caffe Latte')).toBe('Food & Dining');
    expect(classifyText("MCDONALD'S #4891 Big Mac Meal")).toBe('Food & Dining');
  });

  it('gives Travel precedence over Food & Dining for mixed text (gas station coffee)', () => {
    expect(classifyText('SHELL OIL CO\nRegular Fuel 10 Gallons\n1x Coffee $2.00')).toBe('Travel');
  });

  it('falls back to Food & Dining when nothing matches', () => {
    expect(classifyText('UNRECOGNIZABLE MERCHANT 123')).toBe('Food & Dining');
  });
});

describe('OCRService.parseDate', () => {
  it('parses ISO dates', () => {
    expect(parseDate('Date: 2026-06-05 thanks')).toBe('2026-06-05');
  });

  it('parses US numeric dates with 4- and 2-digit years', () => {
    expect(parseDate('06/04/2026 10:15 PM')).toBe('2026-06-04');
    expect(parseDate('6/4/26')).toBe('2026-06-04');
  });

  it('parses month-name dates', () => {
    expect(parseDate('June 5, 2026 08:34 AM')).toBe('2026-06-05');
    expect(parseDate('Jun 5 2026')).toBe('2026-06-05');
  });

  it('rejects implausible dates and returns null when nothing matches', () => {
    expect(parseDate('99/99/2026')).toBeNull();
    expect(parseDate('no date here')).toBeNull();
  });
});

describe('OCRService.parseReceiptText', () => {
  const coffeeLines = [
    'BLUE BOTTLE COFFEE',
    'June 5, 2026 08:34 AM',
    '1x Single Origin Espresso $5.25',
    '1x Almond Croissant $6.20',
    'Subtotal: $11.45',
    'Tax: $1.00',
    'Total: $12.45',
  ];

  it('extracts merchant from the first line', () => {
    expect(parseReceiptText(coffeeLines).merchant).toBe('BLUE BOTTLE COFFEE');
  });

  it('prefers the grand total over subtotal and line items', () => {
    expect(parseReceiptText(coffeeLines).amount).toBe(12.45);
  });

  it('extracts tax from a tax line', () => {
    expect(parseReceiptText(coffeeLines).tax).toBe(1.0);
  });

  it('extracts the receipt date', () => {
    expect(parseReceiptText(coffeeLines).date).toBe('2026-06-05');
  });

  it('classifies from the full text', () => {
    expect(parseReceiptText(coffeeLines).category).toBe('Food & Dining');
  });

  it('falls back to the largest currency value when no total line exists', () => {
    const lines = ['CORNER STORE', '1x Item $9.99', '1x Other $4.50'];
    expect(parseReceiptText(lines).amount).toBe(9.99);
  });

  it('zeroes tax when the parsed tax exceeds the total (misread guard)', () => {
    const lines = ['STORE', 'Tax: $50.00', 'Total: $10.00'];
    expect(parseReceiptText(lines).tax).toBe(0);
  });

  it('defaults date to today when no date is present', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(parseReceiptText(['STORE', 'Total: $5.00']).date).toBe(today);
  });

  it('handles thousands separators', () => {
    const lines = ['DELTA AIRLINES', 'Total: $1,312.50'];
    expect(parseReceiptText(lines).amount).toBe(1312.5);
  });

  it('never marks real extractions as simulated', () => {
    expect(parseReceiptText(coffeeLines).simulated).toBe(false);
  });
});

describe('OCRService.performOCR', () => {
  it('returns a parsed receipt for readable images', async () => {
    const result = await performOCR('file:///receipt-coffee.png');
    expect(result).not.toBeNull();
    expect(result!.merchant).toBe('BLUE BOTTLE COFFEE');
    expect(result!.simulated).toBe(false);
  });

  it('returns null when the image has no readable text', async () => {
    const result = await performOCR('file:///no-text.png');
    expect(result).toBeNull();
  });

  it('falls back to simulated data only when the dev flag is on', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { extractTextFromImage } = require('expo-text-extractor');
    (extractTextFromImage as jest.Mock).mockRejectedValueOnce(new Error('Native engine failed'));

    // Under Jest __DEV__ is true, so SIMULATED_OCR_FALLBACK is on and the
    // dev fallback must produce data flagged as simulated.
    const result = await performOCR('file:///receipt.png');
    expect(result).not.toBeNull();
    expect(result!.simulated).toBe(true);
    warnSpy.mockRestore();
  });

  it('fails soft (null, never fake data) when the engine fails in release mode', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let result: unknown = 'unset';
    jest.isolateModules(() => {
      jest.doMock('../config/features', () => ({
        DEV_TOOLS_ENABLED: false,
        SIMULATED_OCR_FALLBACK: false,
      }));
      const releaseOCR = require('../services/OCRService');
      const { extractTextFromImage } = require('expo-text-extractor');
      (extractTextFromImage as jest.Mock).mockRejectedValueOnce(new Error('Native engine failed'));
      result = releaseOCR.performOCR('file:///receipt.png');
    });
    await expect(result).resolves.toBeNull();
    warnSpy.mockRestore();
  });
});
