import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, MapPin, Briefcase, Award, BookOpen, Settings, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, Save, X, GraduationCap, Building } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, userProfile, logout, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: userProfile?.displayName || '',
    role: userProfile?.role || '',
    institution: userProfile?.institution || '',
    department: userProfile?.department || '',
    location: userProfile?.location || '',
  });

  const handleSave = async () => {
    try {
      await updateUserProfile(editedProfile);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      displayName: userProfile?.displayName || '',
      role: userProfile?.role || '',
      institution: userProfile?.institution || '',
      department: userProfile?.department || '',
      location: userProfile?.location || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            style={styles.headerButton}
          >
            {isEditing ? (
              <Save size={24} color="#2563EB" strokeWidth={2} />
            ) : (
              <Edit size={24} color="#6B7280" strokeWidth={2} />
            )}
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <X size={24} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture & Basic Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={48} color="#FFFFFF" strokeWidth={2} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Edit size={16} color="#2563EB" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.basicInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editedProfile.displayName}
                onChangeText={(text) => 
                  setEditedProfile(prev => ({ ...prev, displayName: text }))
                }
                placeholder="Nom complet"
              />
            ) : (
              <Text style={styles.userName}>{userProfile.displayName}</Text>
            )}
            
            {isEditing ? (
              <TextInput
                style={styles.roleInput}
                value={editedProfile.role}
                onChangeText={(text) => 
                  setEditedProfile(prev => ({ ...prev, role: text }))
                }
                placeholder="Rôle/Fonction"
              />
            ) : (
              <Text style={styles.userRole}>{userProfile.role}</Text>
            )}
            
            <View style={styles.institutionContainer}>
              <Building size={16} color="#2563EB" strokeWidth={2} />
              {isEditing ? (
                <TextInput
                  style={styles.institutionInput}
                  value={editedProfile.institution}
                  onChangeText={(text) => 
                    setEditedProfile(prev => ({ ...prev, institution: text }))
                  }
                  placeholder="Institution"
                />
              ) : (
                <Text style={styles.institutionText}>{userProfile.institution}</Text>
              )}
            </View>
            
            <View style={styles.departmentContainer}>
              <GraduationCap size={16} color="#059669" strokeWidth={2} />
              {isEditing ? (
                <TextInput
                  style={styles.departmentInput}
                  value={editedProfile.department}
                  onChangeText={(text) => 
                    setEditedProfile(prev => ({ ...prev, department: text }))
                  }
                  placeholder="Département"
                />
              ) : (
                <Text style={styles.departmentText}>{userProfile.department}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userProfile.totalScans}</Text>
            <Text style={styles.statLabel}>Scans effectués</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userProfile.totalTests}</Text>
            <Text style={styles.statLabel}>Tests réalisés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userProfile.compliance}%</Text>
            <Text style={styles.statLabel}>Conformité</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.infoItem}>
            <Mail size={20} color="#6B7280" strokeWidth={2} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MapPin size={20} color="#6B7280" strokeWidth={2} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Localisation</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editedProfile.location}
                  onChangeText={(text) => 
                    setEditedProfile(prev => ({ ...prev, location: text }))
                  }
                  placeholder="Localisation"
                />
              ) : (
                <Text style={styles.infoValue}>{userProfile.location || 'Non définie'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <Briefcase size={20} color="#6B7280" strokeWidth={2} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>
                {userProfile.createdAt.toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.menuText}>Paramètres</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.menuText}>Aide & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <BookOpen size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.menuText}>Documentation CQA</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color="#DC2626" strokeWidth={2} />
            <Text style={[styles.menuText, styles.logoutText]}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CQA - Contrôle de Qualité Alimentaire</Text>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 Université de Béjaïa</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  basicInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 4,
    minWidth: 200,
  },
  userRole: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 12,
  },
  roleInput: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 4,
    minWidth: 200,
  },
  institutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  institutionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  institutionInput: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 2,
    minWidth: 150,
  },
  departmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  departmentText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    textAlign: 'center',
  },
  departmentInput: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 2,
    minWidth: 150,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  infoInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#DC2626',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },
});