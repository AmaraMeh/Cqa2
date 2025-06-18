import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  AlertTriangle,
  Clock,
  Package,
  Settings,
  Calendar,
  CheckCircle,
  X,
} from 'lucide-react-native';

interface Notification {
  id: string;
  type: 'expiry' | 'quality' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  productId?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'expiry',
    title: 'Produit expirant bientôt',
    message: 'Le lait UHT Candia expire dans 3 jours',
    timestamp: '2024-02-12T10:30:00Z',
    read: false,
    priority: 'high',
    productId: '1',
  },
  {
    id: '2',
    type: 'quality',
    title: 'Test de qualité non conforme',
    message: 'Les pommes Golden ont échoué au test de pesticides',
    timestamp: '2024-02-12T09:15:00Z',
    read: false,
    priority: 'high',
    productId: '4',
  },
  {
    id: '3',
    type: 'expiry',
    title: 'Produit expiré',
    message: 'Le yaourt nature Danone a expiré',
    timestamp: '2024-02-11T16:45:00Z',
    read: true,
    priority: 'high',
    productId: '3',
  },
  {
    id: '4',
    type: 'system',
    title: 'Mise à jour disponible',
    message: 'Une nouvelle version de CQA est disponible',
    timestamp: '2024-02-11T14:20:00Z',
    read: true,
    priority: 'low',
  },
  {
    id: '5',
    type: 'quality',
    title: 'Test de qualité en attente',
    message: 'Le pain de mie Harry\'s nécessite un test d\'humidité',
    timestamp: '2024-02-11T11:30:00Z',
    read: false,
    priority: 'medium',
    productId: '2',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    expiryAlerts: true,
    qualityAlerts: true,
    systemAlerts: true,
    weeklyReport: true,
    daysBeforeExpiry: 7,
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const color = priority === 'high' ? '#DC2626' : priority === 'medium' ? '#D97706' : '#2563EB';
    
    switch (type) {
      case 'expiry':
        return <Clock size={20} color={color} strokeWidth={2} />;
      case 'quality':
        return <AlertTriangle size={20} color={color} strokeWidth={2} />;
      case 'system':
        return <Settings size={20} color={color} strokeWidth={2} />;
      default:
        return <Bell size={20} color={color} strokeWidth={2} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#DC2626';
      case 'medium': return '#D97706';
      case 'low': return '#2563EB';
      default: return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heure(s)`;
    } else {
      return `Il y a ${Math.floor(diffInHours / 24)} jour(s)`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (showSettings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(false)}>
            <X size={24} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres de notification</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.settingsContainer}>
          <View style={styles.settingGroup}>
            <Text style={styles.settingGroupTitle}>Alertes</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Alertes d'expiration</Text>
                <Text style={styles.settingDescription}>
                  Recevoir des notifications avant expiration
                </Text>
              </View>
              <Switch
                value={notificationSettings.expiryAlerts}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, expiryAlerts: value }))
                }
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={notificationSettings.expiryAlerts ? '#2563EB' : '#F3F4F6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Alertes de qualité</Text>
                <Text style={styles.settingDescription}>
                  Notifications pour les tests de qualité
                </Text>
              </View>
              <Switch
                value={notificationSettings.qualityAlerts}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, qualityAlerts: value }))
                }
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={notificationSettings.qualityAlerts ? '#2563EB' : '#F3F4F6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Alertes système</Text>
                <Text style={styles.settingDescription}>
                  Mises à jour et informations système
                </Text>
              </View>
              <Switch
                value={notificationSettings.systemAlerts}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, systemAlerts: value }))
                }
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={notificationSettings.systemAlerts ? '#2563EB' : '#F3F4F6'}
              />
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingGroupTitle}>Rapports</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Rapport hebdomadaire</Text>
                <Text style={styles.settingDescription}>
                  Recevoir un résumé chaque semaine
                </Text>
              </View>
              <Switch
                value={notificationSettings.weeklyReport}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, weeklyReport: value }))
                }
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={notificationSettings.weeklyReport ? '#2563EB' : '#F3F4F6'}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount} notification(s) non lue(s)
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Settings size={24} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <CheckCircle size={16} color="#2563EB" strokeWidth={2} />
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <View 
            key={notification.id} 
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard
            ]}
          >
            <View style={styles.notificationHeader}>
              <View style={styles.notificationIcon}>
                {getNotificationIcon(notification.type, notification.priority)}
              </View>
              <View style={styles.notificationContent}>
                <Text style={[
                  styles.notificationTitle,
                  !notification.read && styles.unreadText
                ]}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatTimestamp(notification.timestamp)}
                </Text>
              </View>
              <View style={styles.notificationActions}>
                {!notification.read && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <CheckCircle size={16} color="#059669" strokeWidth={2} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteNotification(notification.id)}
                >
                  <X size={16} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
            
            {notification.priority === 'high' && (
              <View style={styles.priorityBanner}>
                <Text style={styles.priorityText}>Priorité élevée</Text>
              </View>
            )}
          </View>
        ))}
        
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Bell size={48} color="#D1D5DB" strokeWidth={1} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyDescription}>
              Vous êtes à jour ! Toutes vos notifications ont été lues.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  actionBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  unreadText: {
    fontFamily: 'Inter-Bold',
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 4,
  },
  priorityBanner: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingGroupTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
});