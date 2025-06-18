import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});