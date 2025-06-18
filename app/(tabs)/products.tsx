import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Package, Calendar, TrendingUp, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { productService, Product } from '@/services/firebaseService';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'fresh' | 'warning' | 'expired'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;
    
    try {
      const userProducts = await productService.getUserProducts(user.uid);
      const productsWithStatus = userProducts.map(product => ({
        ...product,
        status: getProductStatus(product.expiryDate)
      }));
      setProducts(productsWithStatus);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const getProductStatus = (expiryDate: Date): 'fresh' | 'warning' | 'expired' => {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'warning';
    return 'fresh';
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${productName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(productId);
              await loadProducts();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          },
        },
      ]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || product.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return '#059669';
      case 'warning': return '#D97706';
      case 'expired': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh': return <CheckCircle size={20} color="#059669" strokeWidth={2} />;
      case 'warning': return <AlertTriangle size={20} color="#D97706" strokeWidth={2} />;
      case 'expired': return <AlertTriangle size={20} color="#DC2626" strokeWidth={2} />;
      default: return <Package size={20} color="#6B7280" strokeWidth={2} />;
    }
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const stats = {
    total: products.length,
    fresh: products.filter(p => p.status === 'fresh').length,
    warning: products.filter(p => p.status === 'warning').length,
    expired: products.filter(p => p.status === 'expired').length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Produits</Text>
        <Text style={styles.headerSubtitle}>Gestion d'inventaire CQA</Text>
      </View>

      {/* Stats Dashboard */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Package size={24} color="#2563EB" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={24} color="#059669" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.fresh}</Text>
          <Text style={styles.statLabel}>Frais</Text>
        </View>
        <View style={styles.statCard}>
          <AlertTriangle size={24} color="#D97706" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.warning}</Text>
          <Text style={styles.statLabel}>À surveiller</Text>
        </View>
        <View style={styles.statCard}>
          <AlertTriangle size={24} color="#DC2626" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.expired}</Text>
          <Text style={styles.statLabel}>Expirés</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
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
          { key: 'fresh', label: 'Frais', color: '#059669' },
          { key: 'warning', label: 'À surveiller', color: '#D97706' },
          { key: 'expired', label: 'Expirés', color: '#DC2626' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && { backgroundColor: filter.color }
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.key && { color: '#FFFFFF' }
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products List */}
      <ScrollView 
        style={styles.productsList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredProducts.map((product) => {
          const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);
          
          return (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                </View>
                <View style={styles.productActions}>
                  {getStatusIcon(product.status)}
                  <TouchableOpacity
                    onPress={() => handleDeleteProduct(product.id!, product.name)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={18} color="#DC2626" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.productDetails}>
                <View style={styles.detailItem}>
                  <Calendar size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.detailText}>
                    Expire le {product.expiryDate.toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Package size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.detailText}>
                    Quantité: {product.quantity}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <TrendingUp size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.detailText}>
                    {product.location || 'Emplacement non défini'}
                  </Text>
                </View>
              </View>

              {product.status !== 'fresh' && (
                <View 
                  style={[
                    styles.alertBanner,
                    { backgroundColor: `${getStatusColor(product.status)}15` }
                  ]}
                >
                  <Text style={[styles.alertText, { color: getStatusColor(product.status) }]}>
                    {product.status === 'expired' 
                      ? `Expiré depuis ${Math.abs(daysUntilExpiry)} jour(s)`
                      : `Expire dans ${daysUntilExpiry} jour(s)`
                    }
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color="#D1D5DB" strokeWidth={1} />
            <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery 
                ? 'Aucun produit ne correspond à votre recherche'
                : 'Commencez par scanner des produits avec la caméra'
              }
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
  productsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  productBrand: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 2,
  },
  productCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  productDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
});