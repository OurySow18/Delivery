import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { defaultStyles } from '../constants/Styles';
import { db, getFirebaseAuth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from '@firebase/firestore';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isRegister = type === 'register';

  const checkUserRole = async (uid: string) => {
    const adminDocRef = doc(db, "admin", uid);
    const driverDocRef = doc(db, "drivers", uid);

    const [adminDoc, driverDoc] = await Promise.all([getDoc(adminDocRef), getDoc(driverDocRef)]);

    return adminDoc.exists() || driverDoc.exists();
  };

  const signIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      alert('Please enter your email and password.');
      return;
    }
    if (isRegister && password.length < 6) {
      alert('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const user = credential.user;

        await setDoc(
          doc(db, "drivers", user.uid),
          {
            uid: user.uid,
            email: normalizedEmail,
            role: "driver",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        router.replace('/(tabs)');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const user = userCredential.user;

        const hasAccess = await checkUserRole(user.uid);

        if (hasAccess) {
          router.replace('/(tabs)');
        } else {
          alert('Access denied: You are not authorized to access this app.');
          await auth.signOut();
        }
      }
    } catch (error: any) {
      console.log(error);
      alert((isRegister ? 'Sign up failed: ' : 'Sign in failed: ') + error.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={1}
    >
      {loading && (
        <View style={defaultStyles.loadingOverlay}>
          <ActivityIndicator size='large' color='#fff' />
        </View>
      )}

      <Stack.Screen options={{ title: "Monmarche" }} />
      
      <Text style={styles.title}>
        {isRegister ? 'Create Your Account' : 'Welcome Back'}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          autoCapitalize='none'
          placeholder='Email'
          placeholderTextColor="#888"
          style={styles.inputField}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          autoCapitalize='none'
          placeholder='Password'
          placeholderTextColor="#888"
          style={styles.inputField}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity onPress={signIn} style={styles.btnPrimary}>
        <Text style={styles.btnPrimaryText}>{isRegister ? 'Create account' : 'Login'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputField: {
    marginVertical: 8,
    height: 50,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#343a40',
  },
  btnPrimary: {
    backgroundColor: Colors.accentColor,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  }
});

