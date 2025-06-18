import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Building, 
  GraduationCap, 
  MapPin,
  Microscope 
} from 'lucide-react-native';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: '',
    institution: '',
    department: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    const { email, password, confirmPassword, displayName, role, institution } = formData;

    if (!email || !password || !displayName || !role || !institution) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, {
        displayName,
        role,
        institution,
        department: formData.department,
        location: formData.location,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erreur d\'inscription', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Microscope size={48} color="#2563EB" strokeWidth={2} />
            </View>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez la communauté CQA</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Nom complet *"
                value={formData.displayName}
                onChangeText={(value) => updateFormData('displayName', value)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <GraduationCap size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Rôle/Fonction *"
                value={formData.role}
                onChangeText={(value) => updateFormData('role', value)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Building size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Institution *"
                value={formData.institution}
                onChangeText={(value) => updateFormData('institution', value)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <GraduationCap size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Département"
                value={formData.department}
                onChangeText={(value) => updateFormData('department', value)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <MapPin size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Localisation"
                value={formData.location}
                onChangeText={(value) => updateFormData('location', value)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe *"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" strokeWidth={2} />
                ) : (
                  <Eye size={20} color="#6B7280" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe *"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" strokeWidth={2} />
                ) : (
                  <Eye size={20} color="#6B7280" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Création...' : 'Créer le compte'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.loginButton}>
                <Text style={styles.loginButtonText}>J'ai déjà un compte</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En créant un compte, vous acceptez nos conditions d'utilisation
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  registerButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginHorizontal: 16,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});