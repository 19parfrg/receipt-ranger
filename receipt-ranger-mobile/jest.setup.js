/* eslint-env jest */
// Global mocks for every native module the app touches, so suites run in
// plain Node without a simulator. Mirrors the approach used in Sift.

// AsyncStorage — official in-memory mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// expo-text-extractor — URI-keyed canned OCR output:
//   *coffee*  → café receipt lines
//   *gas*     → fuel station receipt lines
//   *no-text* → empty array (image with no readable text)
//   anything else → generic store receipt
jest.mock('expo-text-extractor', () => ({
  extractTextFromImage: jest.fn().mockImplementation(async (uri) => {
    if (uri.includes('no-text')) {
      return [];
    }
    if (uri.includes('coffee')) {
      return [
        'BLUE BOTTLE COFFEE',
        'June 5, 2026 08:34 AM',
        '1x Single Origin Espresso $5.25',
        '1x Almond Croissant $6.20',
        'Subtotal: $11.45',
        'Tax: $1.00',
        'Total: $12.45',
      ];
    }
    if (uri.includes('gas')) {
      return [
        'SHELL OIL CO',
        'Station #8472911',
        '06/04/2026',
        'Regular Fuel: 13.88 Gallons @ $3.96/G',
        'Total Sale: $55.00',
        'Includes Tax: $4.40',
      ];
    }
    return [
      'CORNER STORE',
      '2026-06-01',
      '1x Item $9.99',
      'Tax: $0.80',
      'Total: $10.79',
    ];
  }),
}));

// expo-clipboard — in-memory virtual clipboard
jest.mock('expo-clipboard', () => {
  let clipboard = '';
  return {
    setStringAsync: jest.fn().mockImplementation(async (text) => {
      clipboard = text;
      return true;
    }),
    getStringAsync: jest.fn().mockImplementation(async () => clipboard),
    _resetClipboard: () => {
      clipboard = '';
    },
  };
});

// expo-file-system (legacy API used by the CSV exporter)
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock-documents/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

// expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// expo-image-picker — permissions granted, picker returns a coffee receipt
jest.mock('expo-image-picker', () => {
  let cancelled = false;
  return {
    getMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
    getCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
    requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
    launchImageLibraryAsync: jest.fn().mockImplementation(async () =>
      cancelled
        ? { canceled: true, assets: null }
        : { canceled: false, assets: [{ uri: 'file:///picked-coffee-receipt.png' }] }
    ),
    launchCameraAsync: jest.fn().mockImplementation(async () =>
      cancelled
        ? { canceled: true, assets: null }
        : { canceled: false, assets: [{ uri: 'file:///captured-gas-receipt.png' }] }
    ),
    _setCancelled: (value) => {
      cancelled = value;
    },
  };
});

// expo-media-library
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
}));

// lucide-react-native — icon components are irrelevant to behavior under test
jest.mock('lucide-react-native', () =>
  new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        return () => null;
      },
    }
  )
);
