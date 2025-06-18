import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Product interfaces
export interface Product {
  id?: string;
  name: string;
  brand: string;
  category: string;
  barcode: string;
  expiryDate: Date;
  quantity: number;
  location: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'fresh' | 'warning' | 'expired';
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Quality Test interfaces
export interface QualityTest {
  id?: string;
  productId: string;
  productName: string;
  testType: string;
  result: 'pass' | 'warning' | 'fail';
  value: string;
  unit: string;
  standard: string;
  date: Date;
  technician: string;
  userId: string;
  notes?: string;
}

// Notification interfaces
export interface Notification {
  id?: string;
  userId: string;
  type: 'expiry' | 'quality' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  productId?: string;
}

// Product Services
export const productService = {
  // Add a new product
  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const productData = {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'products'), productData);
    return docRef.id;
  },

  // Get all products for a user
  async getUserProducts(userId: string): Promise<Product[]> {
    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Product[];
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    await deleteDoc(doc(db, 'products', productId));
  },

  // Listen to products in real-time
  subscribeToUserProducts(userId: string, callback: (products: Product[]) => void) {
    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Product[];
      callback(products);
    });
  }
};

// Quality Test Services
export const qualityTestService = {
  // Add a new quality test
  async addQualityTest(test: Omit<QualityTest, 'id'>): Promise<string> {
    const testData = {
      ...test,
      date: Timestamp.fromDate(test.date),
    };
    const docRef = await addDoc(collection(db, 'qualityTests'), testData);
    return docRef.id;
  },

  // Get all quality tests for a user
  async getUserQualityTests(userId: string): Promise<QualityTest[]> {
    const q = query(
      collection(db, 'qualityTests'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    })) as QualityTest[];
  },

  // Update quality test
  async updateQualityTest(testId: string, updates: Partial<QualityTest>): Promise<void> {
    const testRef = doc(db, 'qualityTests', testId);
    const updateData = { ...updates };
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }
    await updateDoc(testRef, updateData);
  },

  // Delete quality test
  async deleteQualityTest(testId: string): Promise<void> {
    await deleteDoc(doc(db, 'qualityTests', testId));
  }
};

// Notification Services
export const notificationService = {
  // Add a new notification
  async addNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    const notificationData = {
      ...notification,
      timestamp: Timestamp.fromDate(notification.timestamp),
    };
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return docRef.id;
  },

  // Get all notifications for a user
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as Notification[];
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await deleteDoc(doc(db, 'notifications', notificationId));
  },

  // Listen to notifications in real-time
  subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Notification[];
      callback(notifications);
    });
  }
};

// Analytics Services
export const analyticsService = {
  // Get user statistics
  async getUserStats(userId: string) {
    const [products, tests, notifications] = await Promise.all([
      productService.getUserProducts(userId),
      qualityTestService.getUserQualityTests(userId),
      notificationService.getUserNotifications(userId)
    ]);

    const now = new Date();
    const expiredProducts = products.filter(p => p.expiryDate < now);
    const warningProducts = products.filter(p => {
      const daysUntilExpiry = Math.ceil((p.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    });

    const passedTests = tests.filter(t => t.result === 'pass');
    const compliance = tests.length > 0 ? (passedTests.length / tests.length) * 100 : 0;

    return {
      totalProducts: products.length,
      totalTests: tests.length,
      totalNotifications: notifications.length,
      expiredProducts: expiredProducts.length,
      warningProducts: warningProducts.length,
      freshProducts: products.length - expiredProducts.length - warningProducts.length,
      compliance: Math.round(compliance * 10) / 10,
      passedTests: passedTests.length,
      failedTests: tests.filter(t => t.result === 'fail').length,
      warningTests: tests.filter(t => t.result === 'warning').length,
    };
  }
};