import { Stack } from 'expo-router';

export default function CollecteTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: '#ff4f00',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Collecte',
        }}
      />
      <Stack.Screen
        name="[vendorKey]"
        options={{
          title: 'Collecte',
        }}
      />
    </Stack>
  );
}
