export type CategoryType = 'Food & Dining' | 'Travel' | 'Office Supplies' | 'Entertainment' | 'Utilities';

export const CATEGORIES: CategoryType[] = [
  'Food & Dining',
  'Travel',
  'Office Supplies',
  'Entertainment',
  'Utilities',
];

export interface Receipt {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  category: CategoryType;
  tax: number;
  status: 'active' | 'archived';
  imageUri?: string;
  ocrText?: string;
}

export type ScreenName = 'splash' | 'onboarding' | 'app';
export type TabName = 'inbox' | 'settings';
