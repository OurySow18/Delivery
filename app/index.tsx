import { View } from "react-native";
import AnimatedIntro from "@/components/AnimatedIntro";
import BottomLoginSheet from "@/components/BottomLoginSheet";
import { Stack } from "expo-router";

export default function Index() {
return (
    <View
      style={{
        flex: 1,
      }}
    >      
      <Stack.Screen options={{headerShown: false}} />
      <AnimatedIntro />
      <BottomLoginSheet />
    </View>
  );
}