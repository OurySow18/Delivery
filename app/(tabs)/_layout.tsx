import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'black',
        tabBarInactiveBackgroundColor: '#ff4f00',
        tabBarStyle: { backgroundColor: '#ff6f00' },
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: '#ff4f00',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="(orders)"
        options={{
          title: 'Livraison',
          headerShown: useClientOnlyValue(true, true),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collecte"
        options={{
          title: 'Collecte',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'cube' : 'cube-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="inventory"
              size={focused ? 40 : 24}
              color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
