import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Cpu } from 'lucide-react-native';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusLabel}>
          <Cpu size={14} color="#a78bfa" style={styles.icon} />
          <Text style={styles.label}>On-Device OCR Extracting...</Text>
        </View>
        <Text style={styles.percentage}>{progress}%</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  percentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  barBackground: {
    height: 6,
    backgroundColor: '#1e1e2d',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
});
