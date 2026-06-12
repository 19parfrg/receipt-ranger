import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { Search, Scan, ReceiptText, ShieldCheck } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../types';
import { ReceiptCard } from '../components/ReceiptCard';
import { ProgressBar } from '../components/ProgressBar';
import { DEV_TOOLS_ENABLED } from '../config/features';

export const InboxScreen: React.FC = () => {
  const {
    receipts,
    activeTab,
    activeCategory,
    searchQuery,
    isUploading,
    uploadProgress,
    setActiveTab,
    setActiveCategory,
    setSearchQuery,
    setActiveReceiptId,
    scanReceipt,
    simulateUpload,
  } = useApp();

  const handleScanPress = () => {
    const options: Array<{ text: string; onPress?: () => void; style?: 'cancel' }> = [
      {
        text: 'Take Photo (Camera)',
        onPress: handleCameraScan,
      },
      {
        text: 'Choose from Gallery (Photos)',
        onPress: handleGalleryScan,
      },
    ];
    if (DEV_TOOLS_ENABLED) {
      options.push({
        text: 'Simulate Local Scan (Dev)',
        onPress: () => simulateUpload(),
      });
    }
    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Scan Receipt',
      'Choose a source to import your receipt for local on-device OCR:',
      options
    );
  };

  const showPermissionAlert = (what: string) => {
    Alert.alert(
      'Permission Needed',
      `${what} access is required to scan receipt images. You can enable it in iOS Settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const handleCameraScan = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      showPermissionAlert('Camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      scanReceipt(result.assets[0].uri);
    }
  };

  const handleGalleryScan = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      showPermissionAlert('Photo Library');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      scanReceipt(result.assets[0].uri);
    }
  };

  // Filter logic
  const filteredReceipts = receipts.filter(r => {
    const matchesTab = r.status === activeTab;
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchesSearch =
      searchQuery === '' || r.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  // Calculate totals for active receipts
  const activeReceipts = receipts.filter(r => r.status === 'active');
  const totalAmount = activeReceipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Brand & Stats Panel */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <ShieldCheck size={16} color="#ffffff" />
            </View>
            <Text style={styles.brandTitle}>ReceiptRanger</Text>
          </View>
        </View>

        {/* Stats Ticker */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Active</Text>
            <Text style={styles.statValue}>${totalAmount.toFixed(2)}</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{activeReceipts.length}</Text>
          </View>
        </View>

        {/* Segmented Controls */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'active' && styles.tabButtonTextActive]}>
              Inbox
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'archived' && styles.tabButtonActive]}
            onPress={() => setActiveTab('archived')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'archived' && styles.tabButtonTextActive]}>
              Archive
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={16} color="#64748b" style={styles.searchIcon} />
          <TextInput
            placeholder="Search merchants..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCorrect={false}
          />
        </View>

        {/* Category Filters Bar */}
        <View style={styles.categoriesOuter}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                activeCategory === 'All' && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory('All')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === 'All' && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  activeCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    activeCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Receipts Scrollable List */}
      <View style={styles.listContainer}>
        {isUploading && <ProgressBar progress={uploadProgress} />}

        <FlatList
          data={filteredReceipts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ReceiptCard receipt={item} onPress={() => setActiveReceiptId(item.id)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isUploading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBackground}>
                  <ReceiptText size={32} color="#475569" />
                </View>
                <Text style={styles.emptyTitle}>No Receipts Found</Text>
                <Text style={styles.emptyText}>
                  Your inbox is empty. Tap the scan button below to add your first expense record.
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={handleScanPress} activeOpacity={0.85}>
        <Scan size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderColor: '#1e1e2d',
    backgroundColor: '#0b0b0f',
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    padding: 6,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    paddingLeft: 8,
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderColor: '#1e1e2d',
    paddingLeft: 16,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#161622',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e1e2d',
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#1e1e2d',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    padding: 0,
  },
  categoriesOuter: {
    marginHorizontal: -16,
    marginBottom: 4,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 9999,
  },
  categoryChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#8b5cf6',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {
    paddingBottom: 88,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIconBackground: {
    padding: 16,
    backgroundColor: '#161622',
    borderRadius: 24,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#7c3aed',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
});
