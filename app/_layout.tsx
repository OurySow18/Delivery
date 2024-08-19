import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '/(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isAuth, setIsAuth] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    // Vérifie l'état de l'utilisateur
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user);
      setAuthLoaded(true);
    });
    return () => unsubscribe(); // Nettoie l'écouteur lorsqu'il n'est plus nécessaire
  }, []);
  if (!authLoaded) {
    // Affichez un écran de chargement ou un splash screen tant que l'état de l'utilisateur est en cours de vérification
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {
        !isAuth ? (
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="login"
              options={{
                presentation: 'modal',
                title: '',
                headerTitleStyle: {
                  // fontFamily: '#000',
                },
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close-outline" size={28} />
                  </TouchableOpacity>
                ),
              }}
            />
          </Stack>
        ) : (
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>

        )
      }
    </ThemeProvider>
  );
}