import { View, Text, StyleSheet, TouchableOpacity } from 'react-native' 
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {ColorPalette} from '@/constants/Colors'
import { Link } from 'expo-router'
import { defaultStyles } from '@/constants/Styles'

const BottomLoginSheet = () => {

  const { bottom }  = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      <Link href={{
        pathname: '/login',
        params: {
          type: 'login',
        }
      }} asChild style={[defaultStyles.btn, styles.btnDark]}>
        <TouchableOpacity>
          <Text style={styles.btnDarkText}>Se connecter</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#000',
    padding: 26,
    gap: 14,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,

  },
  btnDark: {
    backgroundColor: ColorPalette.grey,
  },
  btnDarkText: {
    color: '#fff',
    fontSize: 20,
  }
})

export default BottomLoginSheet
