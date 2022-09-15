import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import COLORS from '../assets/const/colors'

const WaitScreen = () => {
  return (
    <View style={styles.container}>
        <Text style={styles.text}>
            Wait ...
        </Text>
        <ActivityIndicator 
            size="large"
            color="white"
        />
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.accentColor
    },
    text: {
        color: 'white',
        fontSize: 25,
        textAlign: 'center',
        marginBottom: 30
    }
})

export default WaitScreen