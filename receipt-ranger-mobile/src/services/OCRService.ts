import { extractTextFromImage } from 'expo-text-extractor';
import { CategoryType } from '../types';
import { MOCK_OCR_TEMPLATES } from '../data/mockReceipts';
import { SIMULATED_OCR_FALLBACK } from '../config/features';

/**
 * OCRService — the single pipeline between a receipt image and a structured
 * expense record. Everything here runs 100% on-device:
 *
 *   image URI ──▶ extractTextFromImage()   (Apple Vision via
 *                       │                   expo-text-extractor; falls back
 *                       │                   to simulated OCR ONLY in __DEV__ —
 *                       ▼                   release builds fail soft, never
 *                 parseReceiptText()        fake data)
 *                       │
 *                       ▼
 *                 classifyText()           (regex keyword heuristics →
 *                       │                   CategoryType; see precedence
 *                       ▼                   order below)
 *                 ParsedReceipt
 */
export interface ParsedReceipt {
  merchant: string;
  /** ISO date YYYY-MM-DD; defaults to today when no date is found. */
  date: string;
  amount: number;
  tax: number;
  category: CategoryType;
  /** Raw extracted lines joined with newlines, for the Detail screen. */
  ocrText: string;
  /** True when the text came from the dev-only simulated fallback. */
  simulated: boolean;
}

/**
 * Keyword heuristics per category. Categories earlier in CLASSIFY_ORDER win
 * when keywords from multiple categories appear (e.g. a Shell receipt that
 * also sells coffee classifies as Travel).
 */
const CATEGORY_KEYWORDS: Record<CategoryType, RegExp> = {
  'Travel': /\b(uber|lyft|taxi|airline|airlines|flight|delta|united air|american air|hotel|motel|airbnb|fuel|gasoline|gallons?|shell oil|chevron|exxon|parking|toll|car rental|hertz|avis|amtrak|transit)\b/i,
  'Utilities': /\b(comcast|xfinity|verizon|t-mobile|at&t|spectrum|electric|electricity|water bill|sewer|internet service|utility|utilities|cable|power co|energy|kwh|broadband)\b/i,
  'Entertainment': /\b(netflix|spotify|hulu|disney\+|hbo|cinema|theater|theatre|movie|concert|tickets?|arcade|steam|playstation|xbox|nintendo|streaming|subscription)\b/i,
  'Office Supplies': /\b(office depot|office max|staples|paper|ink|toner|notebooks?|keyboard|mouse|usb|printer|stationery|binder|docking station|monitor)\b/i,
  'Food & Dining': /\b(coffee|cafe|caffe|restaurant|grill|pizza|burger|starbucks|mcdonald|bakery|diner|latte|espresso|sushi|taco|deli|brewery|bar & |kitchen|eatery|food|breakfast|lunch|dinner)\b/i,
};

const CLASSIFY_ORDER: CategoryType[] = [
  'Travel',
  'Utilities',
  'Entertainment',
  'Office Supplies',
  'Food & Dining',
];

const DEFAULT_CATEGORY: CategoryType = 'Food & Dining';

/** Classify raw OCR text into an expense category via keyword precedence. */
export function classifyText(text: string): CategoryType {
  for (const category of CLASSIFY_ORDER) {
    if (CATEGORY_KEYWORDS[category].test(text)) {
      return category;
    }
  }
  return DEFAULT_CATEGORY;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const pad = (n: number) => String(n).padStart(2, '0');

const isValidYmd = (y: number, m: number, d: number) =>
  m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2100;

/** Find the first recognizable date in the text; returns YYYY-MM-DD or null. */
export function parseDate(text: string): string | null {
  // ISO: 2026-06-05
  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const [, y, m, d] = iso;
    if (isValidYmd(+y, +m, +d)) return `${y}-${m}-${d}`;
  }
  // US numeric: 6/5/2026 or 06/05/26
  const us = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (us) {
    const [, m, d, yRaw] = us;
    const y = yRaw.length === 2 ? 2000 + +yRaw : +yRaw;
    if (isValidYmd(y, +m, +d)) return `${y}-${pad(+m)}-${pad(+d)}`;
  }
  // Month name: June 5, 2026 / Jun 5 2026
  const named = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/i);
  if (named) {
    const m = MONTHS[named[1].toLowerCase()];
    const d = +named[2];
    const y = +named[3];
    if (isValidYmd(y, m, d)) return `${y}-${pad(m)}-${pad(d)}`;
  }
  return null;
}

const currencyValue = (line: string): number | null => {
  // Matches $14.58, 14.58, 1,234.56, and whole-dollar amounts like $14 —
  // takes the last currency-looking number on the line (label usually
  // precedes the value on receipts). Bare integers without a $ sign are
  // NOT treated as currency (they're usually store/transaction numbers).
  const matches = line.match(/\$\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b|\d{1,3}(?:,\d{3})*\.\d{2}\b/g);
  if (!matches || matches.length === 0) return null;
  const raw = matches[matches.length - 1].replace(/[$,\s]/g, '');
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : null;
};

/** Today's date in the device's local timezone, as YYYY-MM-DD. */
export const todayLocalISO = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/**
 * Extract the structured fields from raw OCR lines.
 *
 * - merchant: first non-empty line (receipts lead with the store name)
 * - amount:   value on a "total" line (excluding "subtotal"); falls back to
 *             the largest currency value found anywhere
 * - tax:      value on the first "tax"/"vat"/"fee" line, when plausible
 * - date:     first recognizable date, else today
 */
export function parseReceiptText(lines: string[]): ParsedReceipt {
  const cleaned = lines.map(l => l.trim()).filter(l => l.length > 0);
  const fullText = cleaned.join('\n');

  const merchant = (cleaned[0] || 'Unknown Merchant').slice(0, 48);

  let amount: number | null = null;
  let tax: number | null = null;
  let maxValue = 0;

  for (const line of cleaned) {
    const value = currencyValue(line);
    if (value === null) continue;
    if (value > maxValue) maxValue = value;
    if (/total/i.test(line) && !/sub\s*-?\s*total/i.test(line)) {
      // Prefer the last "total" line (grand total tends to come after
      // "Total before tax" style lines).
      amount = value;
    }
    if (tax === null && /\b(tax|vat|gst|fees?)\b/i.test(line) && !/total/i.test(line)) {
      tax = value;
    }
  }

  if (amount === null) amount = maxValue;
  if (tax === null || tax > amount) tax = 0;

  return {
    merchant,
    date: parseDate(fullText) || todayLocalISO(),
    amount,
    tax,
    category: classifyText(fullText),
    ocrText: fullText,
    simulated: false,
  };
}

/** Dev-only canned scan result; also used by the dev "simulate scan" tool. */
export const simulatedParse = (): ParsedReceipt => {
  const template = MOCK_OCR_TEMPLATES[Math.floor(Math.random() * MOCK_OCR_TEMPLATES.length)];
  return {
    merchant: template.merchant,
    date: todayLocalISO(),
    amount: template.amount,
    tax: template.tax,
    category: template.category,
    ocrText: template.ocrText,
    simulated: true,
  };
};

/**
 * Run the full on-device OCR pipeline against an image URI.
 *
 * Returns null when the image contains no readable text, or when the native
 * OCR engine fails in a release build (fail soft — release builds must never
 * surface simulated data). In __DEV__ the simulated fallback keeps the flow
 * testable in Expo Go, where the native Vision module is unavailable.
 */
export async function performOCR(uri: string): Promise<ParsedReceipt | null> {
  try {
    const lines = await extractTextFromImage(uri);
    if (lines && lines.length > 0) {
      return parseReceiptText(lines);
    }
    return null;
  } catch (error) {
    if (SIMULATED_OCR_FALLBACK) {
      console.warn('Native OCR unavailable, using dev-only simulated scan:', error);
      return simulatedParse();
    }
    console.warn('On-device OCR failed:', error);
    return null;
  }
}
