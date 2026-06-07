import React from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Inbox, Settings } from 'lucide-react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { InboxScreen } from './src/screens/InboxScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { Toast } from './src/components/Toast';

const AppContent: React.FC = () => {
  const { screen, tab, setTab, toastMessage } = useApp();

  const renderActiveScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'app':
        return tab === 'inbox' ? <InboxScreen /> : <SettingsScreen />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Active Screen View */}
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      {/* Global Detail view modal overlay */}
      <DetailScreen />

      {/* Global Toast Alert Overlay */}
      <Toast message={toastMessage} />

      {/* Tab bar (only when on App screen) */}
      {screen === 'app' && (
        <SafeAreaView style={styles.tabBarSafeArea}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, tab === 'inbox' && styles.tabItemActive]}
              onPress={() => setTab('inbox')}
              activeOpacity={0.7}
            >
              <Inbox size={20} color={tab === 'inbox' ? '#8b5cf6' : '#64748b'} />
              <Text style={[styles.tabLabel, tab === 'inbox' && styles.tabLabelActive]}>Inbox</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, tab === 'settings' && styles.tabItemActive]}
              onPress={() => setTab('settings')}
              activeOpacity={0.7}
            >
              <Settings size={20} color={tab === 'settings' ? '#8b5cf6' : '#64748b'} />
              <Text style={[styles.tabLabel, tab === 'settings' && styles.tabLabelActive]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  screenContainer: {
    flex: 1,
  },
  tabBarSafeArea: {
    backgroundColor: '#161622',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#161622',
    borderTopWidth: 1,
    borderColor: '#1e1e2d',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabItemActive: {},
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    fontWeight: 'bold',
  },
  tabLabelActive: {
    color: '#8b5cf6',
  },
});
