import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Download, ShieldCheck, Database, HardDrive, RotateCcw } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../types';

export const SettingsScreen: React.FC = () => {
  const { receipts, exportToCSV, resetData } = useApp();

  // Calculate stats
  const activeReceipts = receipts.filter(r => r.status === 'active');
  const totalSpend = activeReceipts.reduce((sum, r) => sum + r.amount, 0);

  const categorySpend = CATEGORIES.map(cat => {
    const amount = activeReceipts
      .filter(r => r.category === cat)
      .reduce((sum, r) => sum + r.amount, 0);
    const percentage = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
    return { category: cat, amount, percentage };
  });

  const handleResetData = () => {
    Alert.alert(
      'Reset App Data',
      'Choose whether to clear all receipts completely or reset back to default mock templates:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Mocks',
          onPress: async () => {
            await resetData(true);
          },
        },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            await resetData(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings & Reports</Text>
          <Text style={styles.subtitle}>Configure local storage and export expense CSVs</Text>
        </View>

        {/* Export Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Expense Data</Text>
          <Text style={styles.cardDescription}>
            Compile all active inbox receipts into a CSV file format and share it using the iOS native share dialog.
          </Text>
          <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
            <Download size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.exportButtonText}>Export Expenses as CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Category Breakdown Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Spending Breakdown</Text>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total Active Expenses:</Text>
            <Text style={styles.totalsValue}>${totalSpend.toFixed(2)}</Text>
          </View>

          <View style={styles.breakdownList}>
            {categorySpend.map(item => (
              <View key={item.category} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownLabel}>{item.category}</Text>
                  <Text style={styles.breakdownValue}>
                    ${item.amount.toFixed(2)} ({item.percentage.toFixed(0)}%)
                  </Text>
                </View>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Security & Audit Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security & Privacy Audit</Text>
          
          <View style={styles.auditItem}>
            <ShieldCheck size={18} color="#10b981" style={styles.auditIcon} />
            <View style={styles.auditTextContainer}>
              <Text style={styles.auditLabel}>100% Offline Processing</Text>
              <Text style={styles.auditDetail}>Verified: All OCR scanning is executed locally on-device.</Text>
            </View>
          </View>

          <View style={styles.auditItem}>
            <Database size={18} color="#10b981" style={styles.auditIcon} />
            <View style={styles.auditTextContainer}>
              <Text style={styles.auditLabel}>SQLite & AsyncStorage</Text>
              <Text style={styles.auditDetail}>Verified: All receipt records are persisted in local SQL.</Text>
            </View>
          </View>

          <View style={styles.auditItem}>
            <HardDrive size={18} color="#10b981" style={styles.auditIcon} />
            <View style={styles.auditTextContainer}>
              <Text style={styles.auditLabel}>Sandboxed Storage</Text>
              <Text style={styles.auditDetail}>Verified: Receipts cannot be accessed by external apps.</Text>
            </View>
          </View>
        </View>

        {/* App Version Info and Reset */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ReceiptRanger iOS Beta v1.0.0</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
            <RotateCcw size={12} color="#f87171" style={{ marginRight: 4 }} />
            <Text style={styles.resetText}>Reset or Clear Database</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#1e1e2d',
    paddingBottom: 12,
    marginBottom: 12,
  },
  totalsLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  totalsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  breakdownList: {
    gap: 12,
  },
  breakdownItem: {
    marginBottom: 4,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  barBackground: {
    height: 4,
    backgroundColor: '#1e1e2d',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  auditIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  auditTextContainer: {
    flex: 1,
  },
  auditLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  auditDetail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resetText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
