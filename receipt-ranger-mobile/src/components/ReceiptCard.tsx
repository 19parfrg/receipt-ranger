import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Receipt } from '../types';

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContainer}>
        <Text style={styles.merchant}>{receipt.merchant}</Text>
        <Text style={styles.date}>{receipt.date}</Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>${receipt.amount.toFixed(2)}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{receipt.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#1e1e2d',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftContainer: {
    flex: 1,
    paddingRight: 12,
  },
  merchant: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  date: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chip: {
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#312e81',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  chipText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#a78bfa',
    textTransform: 'uppercase',
  },
});
