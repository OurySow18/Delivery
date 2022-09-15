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