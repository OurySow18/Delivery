import { useClientOnlyValue } from '@/components/useClientOnlyValue'
import { Stack } from 'expo-router'  
const _layout = () => {
 
  return (
    <Stack
      screenOptions={{ 
        headerShown: useClientOnlyValue(false, false),
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: '#ff4f00',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        }, 
      }}>

      <Stack.Screen name="index" />
    </Stack>
  )
}

export default _layout
