import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { doc, getDoc } from '@firebase/firestore';
import { onAuthStateChanged, signOut, type User } from '@firebase/auth';
import QRCode from 'react-native-qrcode-svg';

import { db, getFirebaseAuth } from '@/firebase';

interface DriverProfile {
  createdAt?: any;
  email?: string;
  phone?: string;
  role?: string;
  surname?: string;
  uid?: string;
  updatedAt?: any;
  username?: string;
}

export default function CompteScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const driverDoc = await getDoc(doc(db, 'drivers', currentUser.uid));
        setProfile(driverDoc.exists() ? (driverDoc.data() as DriverProfile) : null);
      } catch (error) {
        console.error('Erreur chargement compte livreur :', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut(getFirebaseAuth());
    } catch (error) {
      console.error('Erreur deconnexion :', error);
      Alert.alert('Deconnexion impossible', 'La session n’a pas pu etre fermee.');
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6f00" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Compte' }} />

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Compte</Text>
        <Text style={styles.heroTitle}>{profile?.role === 'admin' ? 'Administrateur' : 'Livreur'}</Text>
        <Text style={styles.heroText}>
          Utilise cet identifiant chez le vendeur pour lier la collecte au bon livreur.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Identite</Text>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{profile?.username || 'Non renseigne'}</Text>
        <Text style={styles.label}>Surname</Text>
        <Text style={styles.value}>{profile?.surname || 'Non renseigne'}</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{profile?.phone || 'Non renseigne'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Code vendeur</Text>
        {user?.uid ? (
          <TouchableOpacity activeOpacity={0.85} onPress={() => setQrModalVisible(true)}>
            <View style={styles.qrCard}>
              <QRCode value={user.uid} size={140} backgroundColor="#111827" color="#fff" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.fallbackCode}>
            <Text style={styles.fallbackCodeText}>Code indisponible</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, signingOut && styles.logoutButtonDisabled]}
        disabled={signingOut}
        onPress={handleSignOut}
      >
        <Text style={styles.logoutButtonText}>{signingOut ? 'Deconnexion...' : 'Se deconnecter'}</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setQrModalVisible(false)}>
          <Pressable onPress={() => {}}>
            <View style={styles.modalCard}>
              {user?.uid ? (
                <QRCode value={user.uid} size={240} backgroundColor="#111827" color="#fff" />
              ) : (
                <Text style={styles.fallbackCodeLarge}>Code indisponible</Text>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f5f7',
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: '#f3f5f7',
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: '#121826',
    borderRadius: 20,
    marginBottom: 18,
    padding: 20,
  },
  heroEyebrow: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroText: {
    color: '#d0d5dd',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    textTransform: 'uppercase',
  },
  value: {
    color: '#111827',
    fontSize: 16,
    marginTop: 4,
  },
  qrCard: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
  },
  fallbackCode: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
  },
  fallbackCodeText: {
    color: '#111827',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontSize: 13,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 24,
    maxWidth: '100%',
    padding: 20,
  },
  fallbackCodeLarge: {
    color: '#fff',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontSize: 16,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  logoutButtonDisabled: {
    backgroundColor: '#f09999',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
