import React from 'react';
import { StyleSheet, Text, Animated, SafeAreaView } from 'react-native';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <SafeAreaView style={styles.safeContainer} pointerEvents="none">
      <Animated.View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: '85%',
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
