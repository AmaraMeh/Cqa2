import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  Platform,
  Modal
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ScanLine, 
  Camera, 
  FlipHorizontal, 
  Flashlight,
  ShieldCheck,
  Package,
  Plus,
  X
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { productService, Product } from '@/services/firebaseService';
import { Timestamp } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// Mock product database for barcode lookup
const productDatabase: { [key: string]: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> } = {
  '3033710074617': {
    name: 'Lait UHT Demi-écrémé',
    brand: 'Candia',
    category: 'Produits laitiers',
    barcode: '3033710074617',
    expiryDate: new Date('2024-03-15'),
    quantity: 1,
    location: 'Frigo - Étagère 2',
    status: 'fresh',
    nutritionalInfo: {
      calories: 46,
      protein: 3.2,
      carbs: 4.8,
      fat: 1.5,
    }
  },
  '3017620422003': {
    name: 'Yaourt Nature',
    brand: 'Danone',
    category: 'Produits laitiers',
    barcode: '3017620422003',
    expiryDate: new Date('2024-02-25'),
    quantity: 4,
    location: 'Frigo - Étagère 1',
    status: 'warning',
    nutritionalInfo: {
      calories: 60,
      protein: 4.5,
      carbs: 6.0,
      fat: 1.2,
    }
  }
};

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const { user, userProfile } = useAuth();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      // Haptics would be implemented here for mobile
      console.log('Haptic feedback triggered');
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ShieldCheck size={64} color="#2563EB" strokeWidth={1.5} />
          <Text style={styles.permissionTitle}>Accès Caméra Requis</Text>
          <Text style={styles.permissionText}>
            CQA a besoin d'accéder à votre caméra pour scanner les codes-barres des produits alimentaires.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    triggerHaptic();
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
    triggerHaptic();
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || !user) return;
    
    setScanned(true);
    triggerHaptic();
    
    // Look up product in database
    const foundProduct = productDatabase[data];
    
    if (foundProduct) {
      setScannedProduct({
        ...foundProduct,
        barcode: data
      });
      setShowAddModal(true);
    } else {
      // Product not found in database
      Alert.alert(
        'Produit non reconnu',
        `Code-barres: ${data}\n\nCe produit n'est pas dans notre base de données. Voulez-vous l'ajouter manuellement ?`,
        [
          {
            text: 'Scanner à nouveau',
            onPress: () => setScanned(false),
          },
          {
            text: 'Ajouter manuellement',
            onPress: () => {
              setScannedProduct({
                name: 'Produit inconnu',
                brand: '',
                category: '',
                barcode: data,
                expiryDate: new Date(),
                quantity: 1,
                location: '',
                status: 'fresh'
              });
              setShowAddModal(true);
            },
          },
        ]
      );
    }
  };

  const handleAddProduct = async () => {
    if (!user || !scannedProduct) return;

    try {
      await productService.addProduct({
        ...scannedProduct,
        userId: user.uid,
      });

      // Update user stats
      if (userProfile) {
        const newTotalScans = userProfile.totalScans + 1;
        // Update user profile with new scan count
        // This would be implemented in the auth context
      }

      Alert.alert(
        'Produit ajouté',
        `${scannedProduct.name} a été ajouté à votre inventaire.`,
        [
          {
            text: 'Scanner un autre',
            onPress: () => {
              setShowAddModal(false);
              setScannedProduct(null);
              setScanned(false);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit. Veuillez réessayer.');
      setScanned(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scanner CQA</Text>
        <Text style={styles.headerSubtitle}>
          Bonjour {userProfile?.displayName || 'Utilisateur'}
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              <View style={styles.scanLine}>
                <ScanLine size={200} color="#2563EB" strokeWidth={2} />
              </View>
            </View>
            
            <Text style={styles.instructionText}>
              Placez le code-barres dans le cadre
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleFlash}
            >
              <Flashlight 
                size={24} 
                color={flashEnabled ? '#F59E0B' : '#FFFFFF'} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleCameraFacing}
            >
              <FlipHorizontal size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      <View style={styles.infoPanel}>
        <View style={styles.featureItem}>
          <Package size={20} color="#059669" strokeWidth={2} />
          <Text style={styles.featureText}>Identification automatique</Text>
        </View>
        <View style={styles.featureItem}>
          <ShieldCheck size={20} color="#059669" strokeWidth={2} />
          <Text style={styles.featureText}>Contrôle de qualité</Text>
        </View>
      </View>

      {/* Add Product Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter le produit</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowAddModal(false);
                setScannedProduct(null);
                setScanned(false);
              }}
            >
              <X size={24} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {scannedProduct && (
            <View style={styles.modalContent}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{scannedProduct.name}</Text>
                <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
                <Text style={styles.productCategory}>{scannedProduct.category}</Text>
                <Text style={styles.productBarcode}>Code: {scannedProduct.barcode}</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddProduct}
                >
                  <Plus size={20} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.addButtonText}>Ajouter à l'inventaire</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
    color: '#6B7280',
    marginTop: 2,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#2563EB',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    opacity: 0.8,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 32,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 50,
  },
  infoPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  productInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  productName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  productBarcode: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  modalActions: {
    gap: 12,
  },
  addButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});