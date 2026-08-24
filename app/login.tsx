import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { defaultStyles } from '../constants/Styles';
import { checkUserRole, getFirebaseAuth } from '../firebase';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      alert('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      const hasAccess = await checkUserRole(user.uid);

      if (hasAccess) {
        router.replace('/(tabs)');
      } else {
        alert('Access denied: You are not authorized to access this app.');
        await auth.signOut();
      }
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
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
      
      <Text style={styles.title}>Welcome Back</Text>

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
        <Text style={styles.btnPrimaryText}>Login</Text>
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

