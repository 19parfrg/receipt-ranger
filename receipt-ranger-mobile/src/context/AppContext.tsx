import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Receipt, CategoryType, ScreenName, TabName } from '../types';
import { MOCK_RECEIPTS, MOCK_OCR_TEMPLATES } from '../data/mockReceipts';
import { performOCR, ParsedReceipt } from '../services/OCRService';
import { DEV_TOOLS_ENABLED } from '../config/features';

const RECEIPTS_KEY = '@receipts';
const CONSENT_KEY = '@consent_given';

interface AppContextProps {
  receipts: Receipt[];
  screen: ScreenName;
  tab: TabName;
  activeReceiptId: string | null;
  isUploading: boolean;
  uploadProgress: number;
  toastMessage: string | null;
  activeTab: 'active' | 'archived';
  activeCategory: 'All' | CategoryType;
  searchQuery: string;
  hasPermissions: boolean;

  // Setters
  setScreen: (screen: ScreenName) => void;
  setTab: (tab: TabName) => void;
  setActiveReceiptId: (id: string | null) => void;
  setActiveTab: (tab: 'active' | 'archived') => void;
  setActiveCategory: (cat: 'All' | CategoryType) => void;
  setSearchQuery: (query: string) => void;

  // Handlers
  addReceipt: (receipt: Receipt) => void;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  archiveReceipt: (id: string) => void;
  deleteReceipt: (id: string) => void;
  scanReceipt: (imageUri: string) => Promise<void>;
  /** Dev-only: animated fake scan with canned data. No-op in release. */
  simulateUpload: () => void;
  exportToCSV: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  showToast: (message: string) => void;
  resetData: (toMocks: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [tab, setTab] = useState<TabName>('inbox');
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [activeCategory, setActiveCategory] = useState<'All' | CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPermissions, setHasPermissions] = useState(false);

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const splashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Load receipts from local storage. A fresh production install starts
        // with an empty inbox by design; demo receipts are seeded in dev only.
        const storedReceipts = await AsyncStorage.getItem(RECEIPTS_KEY);
        if (storedReceipts) {
          setReceipts(JSON.parse(storedReceipts));
        } else if (DEV_TOOLS_ENABLED) {
          setReceipts(MOCK_RECEIPTS);
          await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(MOCK_RECEIPTS));
        }

        // Load onboarding consent status
        const consentGiven = await AsyncStorage.getItem(CONSENT_KEY);

        // Brief loading state visual delay
        splashTimer.current = setTimeout(() => {
          setScreen(consentGiven === 'true' ? 'app' : 'onboarding');
        }, 1500);

        // Check current permission statuses
        const libStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        const camStatus = await ImagePicker.getCameraPermissionsAsync();
        if (libStatus.status === 'granted' && camStatus.status === 'granted') {
          setHasPermissions(true);
        }
      } catch (err) {
        console.error('Failed to initialize local state', err);
        setScreen('onboarding');
      }
    };
    init();

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (splashTimer.current) clearTimeout(splashTimer.current);
    };
  }, []);

  const persistReceipts = (list: Receipt[]) => {
    AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(list)).catch(err =>
      console.error('Failed to save receipts to AsyncStorage', err)
    );
  };

  // Functional updates so concurrent mutations never work from a stale list.
  const applyReceipts = (updater: (prev: Receipt[]) => Receipt[]) => {
    setReceipts(prev => {
      const next = updater(prev);
      persistReceipts(next);
      return next;
    });
  };

  const addReceipt = (receipt: Receipt) => {
    applyReceipts(prev => [receipt, ...prev]);
    showToast('Receipt saved successfully!');
  };

  const updateReceipt = (id: string, updates: Partial<Receipt>) => {
    applyReceipts(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const archiveReceipt = (id: string) => {
    let archived = false;
    applyReceipts(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        archived = r.status === 'active';
        return { ...r, status: archived ? 'archived' : 'active' };
      })
    );
    setActiveReceiptId(null);
    showToast(archived ? 'Receipt archived successfully' : 'Receipt restored to inbox');
  };

  const deleteReceipt = (id: string) => {
    applyReceipts(prev => prev.filter(r => r.id !== id));
    setActiveReceiptId(null);
    showToast('Receipt deleted successfully');
  };

  const clearProgressTimer = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const finishScan = (parsed: ParsedReceipt, imageUri?: string) => {
    const newReceipt: Receipt = {
      id: `rcpt-${Date.now()}`,
      merchant: parsed.merchant,
      date: parsed.date,
      amount: parsed.amount,
      category: parsed.category,
      tax: parsed.tax,
      status: 'active',
      ocrText: parsed.ocrText,
      imageUri,
    };
    applyReceipts(prev => [newReceipt, ...prev]);
    setActiveReceiptId(newReceipt.id);
    setActiveTab('active');
    setActiveCategory('All');
    showToast(parsed.simulated ? 'Simulated scan complete (dev only)' : 'On-device OCR scan complete!');
  };

  /**
   * Real scan pipeline: image → Apple Vision OCR → parsed fields → inbox.
   * Everything runs locally; the image never leaves the device.
   */
  const scanReceipt = async (imageUri: string) => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(8);
    // Creep toward 90% while the Vision engine works; jump to 100 on completion.
    progressTimer.current = setInterval(() => {
      setUploadProgress(p => (p < 90 ? p + 6 : p));
    }, 180);

    try {
      const parsed = await performOCR(imageUri);
      clearProgressTimer();
      if (!parsed) {
        showToast('No readable text found. Try a clearer, well-lit photo.');
        return;
      }
      setUploadProgress(100);
      finishScan(parsed, imageUri);
    } catch (err) {
      console.error('Receipt scan failed:', err);
      showToast('Something went wrong while scanning. Please try again.');
    } finally {
      clearProgressTimer();
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const simulateUpload = () => {
    if (!DEV_TOOLS_ENABLED || isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    let currentProgress = 0;
    progressTimer.current = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 100) {
        clearProgressTimer();
        const template = MOCK_OCR_TEMPLATES[Math.floor(Math.random() * MOCK_OCR_TEMPLATES.length)];
        finishScan(
          {
            merchant: template.merchant,
            date: new Date().toISOString().split('T')[0],
            amount: template.amount,
            tax: template.tax,
            category: template.category,
            ocrText: template.ocrText,
            simulated: true,
          },
          undefined
        );
        setIsUploading(false);
        setUploadProgress(0);
      } else {
        setUploadProgress(currentProgress);
      }
    }, 240);
  };

  const exportToCSV = async () => {
    const activeReceipts = receipts.filter(r => r.status === 'active');
    if (activeReceipts.length === 0) {
      Alert.alert('No Expenses', 'There are no active expenses in your inbox to export.');
      return;
    }

    const headers = ['ID', 'Merchant', 'Date', 'Amount', 'Tax', 'Category'];
    const escapeCSVField = (field: string): string => {
      const clean = field.replace(/"/g, '""');
      if (clean.includes(',') || clean.includes('"') || clean.includes('\n') || clean.includes('\r')) {
        return `"${clean}"`;
      }
      return clean;
    };

    const csvRows = activeReceipts.map(r => [
      r.id,
      escapeCSVField(r.merchant),
      r.date,
      r.amount.toFixed(2),
      r.tax.toFixed(2),
      r.category
    ].join(','));

    const csvString = [headers.join(','), ...csvRows].join('\r\n');
    const filename = `receipt_ranger_export_${new Date().toISOString().split('T')[0]}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Expense Report',
          UTI: 'public.comma-separated-values-text'
        });
        showToast('CSV report shared successfully');
      } else {
        Alert.alert('Export Error', 'System sharing is not available on this device.');
      }
    } catch (err) {
      console.error('CSV Export Failed:', err);
      Alert.alert('Export Failed', 'An error occurred while generating or sharing the CSV file.');
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      await MediaLibrary.requestPermissionsAsync();

      const libraryGranted = libraryPermission.status === 'granted';
      const cameraGranted = cameraPermission.status === 'granted';
      const granted = libraryGranted && cameraGranted;
      setHasPermissions(granted);

      await AsyncStorage.setItem(CONSENT_KEY, 'true');

      if (!libraryGranted && !cameraGranted) {
        Alert.alert(
          'Permissions Limited',
          'You can still use the app but scanning features will be limited until enabled in iOS settings.',
          [{ text: 'OK' }]
        );
      }

      setScreen('app');
      return granted;
    } catch (err) {
      console.error('Failed requesting device permissions:', err);
      // Never strand the user on onboarding; the app degrades gracefully.
      setScreen('app');
      return false;
    }
  };

  const resetData = async (toMocks: boolean) => {
    // Demo data is a dev-only convenience; release builds can only clear.
    const useMocks = toMocks && DEV_TOOLS_ENABLED;
    const defaultData = useMocks ? MOCK_RECEIPTS : [];
    applyReceipts(() => defaultData);
    setActiveReceiptId(null);
    showToast(useMocks ? 'Reset to default mocks!' : 'All receipts cleared!');
  };

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <AppContext.Provider
      value={{
        receipts,
        screen,
        tab,
        activeReceiptId,
        isUploading,
        uploadProgress,
        toastMessage,
        activeTab,
        activeCategory,
        searchQuery,
        hasPermissions,
        setScreen,
        setTab,
        setActiveReceiptId,
        setActiveTab,
        setActiveCategory,
        setSearchQuery,
        addReceipt,
        updateReceipt,
        archiveReceipt,
        deleteReceipt,
        scanReceipt,
        simulateUpload,
        exportToCSV,
        requestPermissions,
        showToast,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
