import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Microscope,
  Thermometer,
  Droplet,
  Scale,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Beaker,
  Activity,
} from 'lucide-react-native';

interface QualityTest {
  id: string;
  productName: string;
  testType: string;
  result: 'pass' | 'warning' | 'fail';
  value: string;
  unit: string;
  standard: string;
  date: string;
  technician: string;
}

const mockTests: QualityTest[] = [
  {
    id: '1',
    productName: 'Lait UHT Candia',
    testType: 'Température',
    result: 'pass',
    value: '4.2',
    unit: '°C',
    standard: '< 6°C',
    date: '2024-02-12',
    technician: 'Dr. Amara',
  },
  {
    id: '2',
    productName: 'Yaourt Nature Danone',
    testType: 'pH',
    result: 'pass',
    value: '4.1',
    unit: 'pH',
    standard: '3.8-4.6',
    date: '2024-02-12',
    technician: 'Dr. Amara',
  },
  {
    id: '3',
    productName: 'Pain de mie Harry\'s',
    testType: 'Humidité',
    result: 'warning',
    value: '42',
    unit: '%',
    standard: '< 40%',
    date: '2024-02-11',
    technician: 'Lab Assistant',
  },
  {
    id: '4',
    productName: 'Pommes Golden',
    testType: 'Pesticides',
    result: 'fail',
    value: '0.15',
    unit: 'mg/kg',
    standard: '< 0.1 mg/kg',
    date: '2024-02-10',
    technician: 'Dr. Benali',
  },
];

export default function QualityScreen() {
  const [selectedTest, setSelectedTest] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTests = mockTests.filter(test => {
    const matchesSearch = test.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.testType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedTest === 'all' || test.result === selectedTest;
    return matchesSearch && matchesFilter;
  });

  const getResultColor = (result: string) => {
    switch (result) {
      case 'pass': return '#059669';
      case 'warning': return '#D97706';
      case 'fail': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'pass': return <CheckCircle2 size={20} color="#059669" strokeWidth={2} />;
      case 'warning': return <AlertCircle size={20} color="#D97706" strokeWidth={2} />;
      case 'fail': return <AlertCircle size={20} color="#DC2626" strokeWidth={2} />;
      default: return <Activity size={20} color="#6B7280" strokeWidth={2} />;
    }
  };

  const getTestIcon = (testType: string) => {
    switch (testType.toLowerCase()) {
      case 'température': return <Thermometer size={20} color="#2563EB" strokeWidth={2} />;
      case 'ph': return <Droplet size={20} color="#2563EB" strokeWidth={2} />;
      case 'humidité': return <Droplet size={20} color="#2563EB" strokeWidth={2} />;
      case 'pesticides': return <Beaker size={20} color="#2563EB" strokeWidth={2} />;
      default: return <Microscope size={20} color="#2563EB" strokeWidth={2} />;
    }
  };

  const stats = {
    total: mockTests.length,
    pass: mockTests.filter(t => t.result === 'pass').length,
    warning: mockTests.filter(t => t.result === 'warning').length,
    fail: mockTests.filter(t => t.result === 'fail').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contrôle Qualité</Text>
        <Text style={styles.headerSubtitle}>Université de Béjaïa - Sciences & Nature</Text>
      </View>

      {/* Stats Dashboard */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Microscope size={24} color="#2563EB" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tests total</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle2 size={24} color="#059669" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.pass}</Text>
          <Text style={styles.statLabel}>Conformes</Text>
        </View>
        <View style={styles.statCard}>
          <AlertCircle size={24} color="#D97706" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.warning}</Text>
          <Text style={styles.statLabel}>Attention</Text>
        </View>
        <View style={styles.statCard}>
          <AlertCircle size={24} color="#DC2626" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.fail}</Text>
          <Text style={styles.statLabel}>Non conformes</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <FileText size={20} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionText}>Nouveau test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <TrendingUp size={20} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionText}>Rapport</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Scale size={20} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionText}>Étalonnage</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Microscope size={20} color="#6B7280" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un test..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Tous', color: '#6B7280' },
          { key: 'pass', label: 'Conformes', color: '#059669' },
          { key: 'warning', label: 'Attention', color: '#D97706' },
          { key: 'fail', label: 'Non conformes', color: '#DC2626' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedTest === filter.key && { backgroundColor: filter.color }
            ]}
            onPress={() => setSelectedTest(filter.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedTest === filter.key && { color: '#FFFFFF' }
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tests List */}
      <ScrollView style={styles.testsList} showsVerticalScrollIndicator={false}>
        {filteredTests.map((test) => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.testHeader}>
              <View style={styles.testInfo}>
                <Text style={styles.productName}>{test.productName}</Text>
                <View style={styles.testTypeContainer}>
                  {getTestIcon(test.testType)}
                  <Text style={styles.testType}>{test.testType}</Text>
                </View>
              </View>
              <View style={styles.testResult}>
                {getResultIcon(test.result)}
              </View>
            </View>
            
            <View style={styles.testDetails}>
              <View style={styles.resultValue}>
                <Text style={styles.valueText}>
                  {test.value} {test.unit}
                </Text>
                <Text style={styles.standardText}>
                  Standard: {test.standard}
                </Text>
              </View>
              
              <View style={styles.testMeta}>
                <Text style={styles.metaText}>Date: {test.date}</Text>
                <Text style={styles.metaText}>Technicien: {test.technician}</Text>
              </View>
            </View>

            {test.result !== 'pass' && (
              <View 
                style={[
                  styles.alertBanner,
                  { backgroundColor: `${getResultColor(test.result)}15` }
                ]}
              >
                <Text style={[styles.alertText, { color: getResultColor(test.result) }]}>
                  {test.result === 'fail' 
                    ? 'Non conforme aux normes de sécurité alimentaire'
                    : 'Surveiller - Proche des limites acceptables'
                  }
                </Text>
              </View>
            )}
          </View>
        ))}
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
    color: '#2563EB',
    marginTop: 2,
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
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  testsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  testTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testType: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  testResult: {
    marginLeft: 12,
  },
  testDetails: {
    gap: 8,
  },
  resultValue: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  valueText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  standardText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  testMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  alertBanner: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
  },
  alertText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});