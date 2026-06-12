import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ArrowLeft, Store, Calendar, DollarSign, Percent, Copy, Archive, Trash2, Eye, EyeOff } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../types';
import { Toast } from '../components/Toast';

export const DetailScreen: React.FC = () => {
  const {
    activeReceiptId,
    receipts,
    setActiveReceiptId,
    updateReceipt,
    archiveReceipt,
    deleteReceipt,
    showToast,
    toastMessage,
  } = useApp();

  const receipt = receipts.find(r => r.id === activeReceiptId);

  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('');
  const [showOcr, setShowOcr] = useState(false);

  // Sync state when active receipt changes
  useEffect(() => {
    if (receipt) {
      setMerchant(receipt.merchant);
      setDate(receipt.date);
      setAmount(receipt.amount.toString());
      setTax(receipt.tax.toString());
      setShowOcr(false);
    }
  }, [activeReceiptId]);

  if (!receipt) return null;

  const handleFieldChange = (field: 'merchant' | 'date' | 'amount' | 'tax', value: string) => {
    if (field === 'merchant') {
      setMerchant(value);
      updateReceipt(receipt.id, { merchant: value });
    } else if (field === 'date') {
      setDate(value);
      updateReceipt(receipt.id, { date: value });
    } else if (field === 'amount') {
      setAmount(value);
      const val = parseFloat(value) || 0;
      updateReceipt(receipt.id, { amount: val });
    } else if (field === 'tax') {
      setTax(value);
      const val = parseFloat(value) || 0;
      updateReceipt(receipt.id, { tax: val });
    }
  };

  const handleCategoryPress = (category: typeof CATEGORIES[number]) => {
    updateReceipt(receipt.id, { category });
  };

  const handleCopyRawText = async () => {
    if (receipt.ocrText) {
      await Clipboard.setStringAsync(receipt.ocrText);
      showToast('Raw OCR text copied!');
    }
  };

  const handleCopyDetails = async () => {
    const formatted = `Merchant: ${receipt.merchant}\nDate: ${receipt.date}\nAmount: $${receipt.amount.toFixed(2)}\nCategory: ${receipt.category}`;
    await Clipboard.setStringAsync(formatted);
    showToast('Expense details copied!');
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to permanently delete this receipt? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteReceipt(receipt.id);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={activeReceiptId !== null} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setActiveReceiptId(null)}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Receipt Details</Text>
            <Text style={styles.headerSubtitle}>ID: {receipt.id}</Text>
          </View>
          <View style={[styles.statusBadge, receipt.status === 'archived' && styles.statusBadgeArchived]}>
            <Text style={[styles.statusBadgeText, receipt.status === 'archived' && styles.statusBadgeTextArchived]}>
              {receipt.status}
            </Text>
          </View>
        </View>

        {/* Scrollable Form */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Merchant */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Merchant</Text>
            <View style={styles.inputWrapper}>
              <Store size={16} color="#64748b" style={styles.inputIcon} />
              <TextInput
                value={merchant}
                onChangeText={(val) => handleFieldChange('merchant', val)}
                style={styles.textInput}
                placeholder="Merchant Name"
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          {/* Grid for Date & Amount */}
          <View style={styles.row}>
            {/* Date */}
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Date</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  value={date}
                  onChangeText={(val) => handleFieldChange('date', val)}
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Amount */}
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Total Amount ($)</Text>
              <View style={styles.inputWrapper}>
                <DollarSign size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  value={amount}
                  onChangeText={(val) => handleFieldChange('amount', val)}
                  style={styles.textInput}
                  placeholder="0.00"
                  placeholderTextColor="#475569"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Tax Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tax Included ($)</Text>
            <View style={styles.inputWrapper}>
              <Percent size={16} color="#64748b" style={styles.inputIcon} />
              <TextInput
                value={tax}
                onChangeText={(val) => handleFieldChange('tax', val)}
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor="#475569"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Category Chips Selector */}
          <View style={styles.categoryGroup}>
            <Text style={styles.inputLabel}>Assign Category</Text>
            <View style={styles.categoryChipsContainer}>
              {CATEGORIES.map((cat) => {
                const isSelected = receipt.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                    onPress={() => handleCategoryPress(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Collapsible Raw OCR Block */}
          {receipt.ocrText && (
            <View style={styles.ocrSection}>
              <TouchableOpacity
                style={styles.ocrHeader}
                onPress={() => setShowOcr(!showOcr)}
                activeOpacity={0.7}
              >
                <Text style={styles.ocrHeaderTitle}>Raw OCR Text Extraction</Text>
                {showOcr ? (
                  <EyeOff size={16} color="#94a3b8" />
                ) : (
                  <Eye size={16} color="#94a3b8" />
                )}
              </TouchableOpacity>
              
              {showOcr && (
                <View style={styles.ocrBody}>
                  <Text style={styles.ocrText}>{receipt.ocrText}</Text>
                  <TouchableOpacity
                    style={styles.ocrCopyButton}
                    onPress={handleCopyRawText}
                  >
                    <Copy size={14} color="#ffffff" style={styles.ocrCopyIcon} />
                    <Text style={styles.ocrCopyButtonText}>Copy Raw OCR Text</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Utility Action copy details */}
          <TouchableOpacity style={styles.secondaryButton} onPress={handleCopyDetails}>
            <Copy size={16} color="#a78bfa" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>Copy Clean Expense Details</Text>
          </TouchableOpacity>

          {/* Triage Actions */}
          <View style={styles.actionRow}>
            {/* Archive / Restore */}
            <TouchableOpacity
              style={[styles.actionButton, styles.archiveButtonAction]}
              onPress={() => archiveReceipt(receipt.id)}
            >
              <Archive size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>
                {receipt.status === 'active' ? 'Archive Expense' : 'Restore to Inbox'}
              </Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButtonAction]}
              onPress={handleDeletePress}
            >
              <Trash2 size={16} color="#f87171" style={{ marginRight: 8 }} />
              <Text style={[styles.actionButtonText, { color: '#f87171' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Native modals render above the root overlay, so the toast must
            also live inside the modal to be visible while it is open. */}
        <Toast message={toastMessage} />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1e1e2d',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 12,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeArchived: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#34d399',
    textTransform: 'uppercase',
  },
  statusBadgeTextArchived: {
    color: '#818cf8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    padding: 0,
  },
  row: {
    flexDirection: 'row',
  },
  categoryGroup: {
    marginBottom: 24,
  },
  categoryChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 12,
  },
  categoryChipSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#8b5cf6',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  ocrSection: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  ocrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  ocrHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ocrBody: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#1e1e2d',
    backgroundColor: '#0b0b0f',
  },
  ocrText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Courier',
    marginBottom: 16,
  },
  ocrCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e2d',
    borderWidth: 1,
    borderColor: '#312e81',
    borderRadius: 12,
    paddingVertical: 10,
  },
  ocrCopyIcon: {
    marginRight: 6,
  },
  ocrCopyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#312e81',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  archiveButtonAction: {
    backgroundColor: '#1e1e2d',
    borderColor: '#334155',
  },
  deleteButtonAction: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
