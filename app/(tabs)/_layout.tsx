import { Tabs } from 'expo-router';
import { ScanLine, Package, Bell, User, Microscope } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ size, color }) => (
            <ScanLine size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produits',
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="quality"
        options={{
          title: 'Qualité',
          tabBarIcon: ({ size, color }) => (
            <Microscope size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ size, color }) => (
            <Bell size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
    height: 80,
  },
  tabLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
});