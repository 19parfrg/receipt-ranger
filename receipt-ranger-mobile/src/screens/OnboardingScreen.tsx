import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Shield, EyeOff, Cpu, FileSpreadsheet } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export const OnboardingScreen: React.FC = () => {
  const { requestPermissions } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={36} color="#8b5cf6" />
          </View>
          <Text style={styles.title}>Your Receipts, Kept Private</Text>
          <Text style={styles.subtitle}>
            ReceiptRanger operates 100% on your device. Zero cloud uploads. Zero data tracking.
          </Text>
        </View>

        <View style={styles.featuresList}>
          {/* Feature 1 */}
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Cpu size={22} color="#a78bfa" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>On-Device OCR Engine</Text>
              <Text style={styles.featureDescription}>
                All text extraction is executed locally on your device's neural engine. No internet connection is required.
              </Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <EyeOff size={22} color="#a78bfa" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Zero Cloud Storage</Text>
              <Text style={styles.featureDescription}>
                Your receipt data and photos remain stored exclusively in your device's isolated local app directory.
              </Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <FileSpreadsheet size={22} color="#a78bfa" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Direct CSV Exports</Text>
              <Text style={styles.featureDescription}>
                Compile and share your expense report straight to email or files via native sharing dialog sheets.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.permissionDisclaimer}>
            To import screenshots or snap physical receipts, we require Camera and Photo Library permissions.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermissions}>
            <Text style={styles.buttonText}>Grant Permissions & Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  iconContainer: {
    padding: 12,
    backgroundColor: '#1e1b4b',
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  featuresList: {
    gap: 20,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureIcon: {
    padding: 10,
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    marginRight: 16,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  featureDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
  },
  permissionDisclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
