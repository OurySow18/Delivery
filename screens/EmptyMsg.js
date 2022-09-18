/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Diese Seite zeigt nur eine Nachricht, die sie per props bekommt
 */
import React from 'react'
import { View, StyleSheet, Text } from 'react-native' 

const EmptyMsg = ({ text }) => {
  return (
    <View style={styles.container}>
        <Text style={styles.text}>
            { text }
        </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 120,
        alignItems: 'center'
    },
    text: {
        color: "green",
        fontSize: 19
    }
})

export default EmptyMsg