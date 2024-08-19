import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Link } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { Animated, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);

  // Animation
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanned) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [scanned]);

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionMessage}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScanId(data);

    // Optional: Auto-reset after a few seconds
    setTimeout(() => {
      handleRescan();
    }, 2000); // 2 seconds delay before resetting
  };

  const handleRescan = () => {
    setScanned(false);
    setScanId(null);
  };

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.scanFrame} />

      {scanned && (
        <View style={styles.overlay}>
          <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: scaleValue }] }]}>
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
        </View>
      )}

      {scanned && scanId && (
        <View style={styles.overlayButtons}>
          <Link href={`/${scanId}`} style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Voir les details</Text>
          </Link>
          <TouchableOpacity onPress={handleRescan} style={styles.rescanButton}>
            <Text style={styles.rescanButtonText}>Re-Scanner</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  permissionMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanFrame: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    width: '80%',
    height: '30%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  checkmarkContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 50,
    color: '#fff',
  },
  overlayButtons: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 10,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rescanButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
