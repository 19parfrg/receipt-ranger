import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Receipt, CategoryType, ScreenName, TabName } from '../types';
import { MOCK_RECEIPTS, MOCK_OCR_TEMPLATES } from '../data/mockReceipts';

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
  simulateUpload: (imageUri?: string) => void;
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

  useEffect(() => {
    const init = async () => {
      try {
        // Load receipts from storage or initialize with mock data
        const storedReceipts = await AsyncStorage.getItem('@receipts');
        let initialReceipts = MOCK_RECEIPTS;
        if (storedReceipts) {
          initialReceipts = JSON.parse(storedReceipts);
          setReceipts(initialReceipts);
        } else {
          setReceipts(MOCK_RECEIPTS);
          await AsyncStorage.setItem('@receipts', JSON.stringify(MOCK_RECEIPTS));
        }

        // Load onboarding consent status
        const consentGiven = await AsyncStorage.getItem('@consent_given');
        
        // Brief loading state visual delay
        setTimeout(() => {
          if (consentGiven === 'true') {
            setScreen('app');
          } else {
            setScreen('onboarding');
          }
        }, 1500);

        // Check current permission statuses
        const libStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        const camStatus = await ImagePicker.getCameraPermissionsAsync();
        if (libStatus.status === 'granted' && camStatus.status === 'granted') {
          setHasPermissions(true);
        }
      } catch (err) {
        console.error('Failed to initialize local state', err);
        setReceipts(MOCK_RECEIPTS);
        setScreen('onboarding');
      }
    };
    init();
  }, []);

  const saveReceipts = async (newReceipts: Receipt[]) => {
    setReceipts(newReceipts);
    try {
      await AsyncStorage.setItem('@receipts', JSON.stringify(newReceipts));
    } catch (err) {
      console.error('Failed to save receipts to AsyncStorage', err);
    }
  };

  const addReceipt = (receipt: Receipt) => {
    const updated = [receipt, ...receipts];
    saveReceipts(updated);
    showToast('Receipt saved successfully!');
  };

  const updateReceipt = (id: string, updates: Partial<Receipt>) => {
    const updated = receipts.map(r => r.id === id ? { ...r, ...updates } : r);
    saveReceipts(updated);
  };

  const archiveReceipt = (id: string) => {
    const receipt = receipts.find(r => r.id === id);
    if (!receipt) return;
    const newStatus: 'active' | 'archived' = receipt.status === 'active' ? 'archived' : 'active';
    const updated = receipts.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveReceipts(updated);
    setActiveReceiptId(null);
    showToast(newStatus === 'archived' ? 'Receipt archived successfully' : 'Receipt restored to inbox');
  };

  const deleteReceipt = (id: string) => {
    const updated = receipts.filter(r => r.id !== id);
    saveReceipts(updated);
    setActiveReceiptId(null);
    showToast('Receipt deleted successfully');
  };

  const simulateUpload = (imageUri?: string) => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        const template = MOCK_OCR_TEMPLATES[Math.floor(Math.random() * MOCK_OCR_TEMPLATES.length)];
        const newReceipt: Receipt = {
          id: `rcpt-${Date.now()}`,
          merchant: template.merchant,
          date: new Date().toISOString().split('T')[0],
          amount: template.amount,
          category: template.category,
          tax: template.tax,
          status: 'active' as const,
          ocrText: template.ocrText,
          imageUri: imageUri || undefined,
        };

        setReceipts(prev => {
          const updated = [newReceipt, ...prev];
          AsyncStorage.setItem('@receipts', JSON.stringify(updated)).catch(e => console.error(e));
          return updated;
        });

        setIsUploading(false);
        setUploadProgress(0);
        setActiveReceiptId(newReceipt.id);
        setActiveTab('active');
        setActiveCategory('All');
        showToast('Local OCR scan complete!');
      } else {
        setUploadProgress(currentProgress);
      }
    }, 240); // Runs 2.4 seconds total (10 ticks)
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
      const mediaLibPermission = await MediaLibrary.requestPermissionsAsync();
      
      const libraryGranted = libraryPermission.status === 'granted';
      const cameraGranted = cameraPermission.status === 'granted';
      const granted = libraryGranted && cameraGranted;
      setHasPermissions(granted);
      
      await AsyncStorage.setItem('@consent_given', 'true');
      
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
      return false;
    }
  };

  const resetData = async (toMocks: boolean) => {
    const defaultData = toMocks ? MOCK_RECEIPTS : [];
    await saveReceipts(defaultData);
    setActiveReceiptId(null);
    showToast(toMocks ? 'Reset to default mocks!' : 'All receipts cleared!');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
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
