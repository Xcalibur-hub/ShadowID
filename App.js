import React, { useState, useEffect, useRef } from 'react';

import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const { width } = Dimensions.get('window');

// --- CONFIGURATION ---
const LAPTOP_IP = '192.168.31.217'; // <--- DOUBLE CHECK THIS IP
const SERVER_URL = `http://${LAPTOP_IP}:8000`;

export default function App() {
  const [mode, setMode] = useState('START'); // START, CALIBRATING, ACTIVE
  const [progress, setProgress] = useState(0);
  const [isSecure, setIsSecure] = useState(true);
  const [confidence, setConfidence] = useState(1.0);
  const [errorCount, setErrorCount] = useState(0);

  // Using a Ref to track the latest mode inside the listener
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    let lastUpdate = 0;

    const subscribe = async () => {
      const subscription = Accelerometer.addListener(async (data) => {
        const now = Date.now();
        
        // Send data every 200ms (5 times per second)
        // This ensures calibration takes exactly 10 seconds for 50 samples
        if (now - lastUpdate > 200) {
          lastUpdate = now;
          const currentMode = modeRef.current;
          
          if (currentMode === 'START') return;

          const endpoint = currentMode === 'CALIBRATING' ? 'train' : 'verify';
          
          try {
            const response = await fetch(`${SERVER_URL}/${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ acceleration: data }),
            });

            if (!response.ok) throw new Error("Server Response Error");

            const result = await response.json();

            if (currentMode === 'CALIBRATING') {
              setProgress(result.progress);
              if (result.progress >= 1) {
                setMode('ACTIVE');
              }
            } else {
              setIsSecure(result.is_owner);
              setConfidence(result.confidence);
            }
            setErrorCount(0); // Reset errors on success
          } catch (e) {
            setErrorCount(prev => prev + 1);
          }
        }
      });

      Accelerometer.setUpdateInterval(100);
      return subscription;
    };

    const subPromise = subscribe();
    return () => {
      subPromise.then(sub => sub && sub.remove());
    };
  }, []);

  const resetSystem = async () => {
    try {
      await fetch(`${SERVER_URL}/reset`, { method: 'POST' });
      setMode('START');
      setProgress(0);
      setIsSecure(true);
      setErrorCount(0);
    } catch (e) {
      Alert.alert("Connection Fail", "Could not reach the Python Brain to reset.");
    }
  };

  // --- UI SCREENS ---

  if (mode === 'START') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>SHADOW ID</Text>
        <View style={styles.statusDot} />
        <TouchableOpacity style={styles.mainButton} onPress={() => setMode('CALIBRATING')}>
          <Text style={styles.buttonText}>INITIALIZE AI</Text>
        </TouchableOpacity>
        <Text style={styles.subText}>Hold naturally to train your unique kinetic signature</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isSecure ? '#050505' : '#4a0000' }]}>
      <Text style={styles.header}>{mode === 'CALIBRATING' ? 'CALIBRATING' : 'SHADOW ID'}</Text>
      
      {mode === 'CALIBRATING' ? (
        <View style={styles.calibrationBox}>
            <View style={styles.progressBack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{(progress * 100).toFixed(0)}%</Text>
            {errorCount > 3 && <Text style={styles.errorText}>Retrying connection...</Text>}
        </View>
      ) : (
        <>
          <View style={[styles.shield, { borderColor: isSecure ? '#00ff00' : '#ff0000' }]}>
            <Text style={styles.statusText}>{isSecure ? "IDENTITY MATCHED" : "KINETIC ANOMALY"}</Text>
            <Text style={styles.confidenceText}>{(confidence * 100).toFixed(0)}% AUTHENTICITY</Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={resetSystem}>
             <Text style={styles.resetText}>RE-CALIBRATE SYSTEM</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { color: '#fff', fontSize: 32, fontWeight: 'bold', letterSpacing: 8, marginBottom: 60 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00ff00', marginBottom: 20 },
  mainButton: { backgroundColor: '#00ff00', paddingVertical: 22, paddingHorizontal: 50, borderRadius: 15, elevation: 5 },
  buttonText: { fontWeight: 'bold', fontSize: 18, color: '#000', letterSpacing: 1 },
  subText: { color: '#fff', opacity: 0.4, marginTop: 25, textAlign: 'center', fontSize: 13, lineHeight: 20 },
  calibrationBox: { width: '100%', alignItems: 'center' },
  progressBack: { width: '80%', height: 14, backgroundColor: '#1a1a1a', borderRadius: 7, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  progressFill: { height: '100%', backgroundColor: '#00ff00' },
  progressPercent: { color: '#00ff00', fontSize: 32, fontWeight: 'bold', marginTop: 20, fontFamily: 'monospace' },
  errorText: { color: '#ff3333', marginTop: 10, fontSize: 12 },
  shield: { width: 280, height: 280, borderRadius: 140, borderWidth: 5, justifyContent: 'center', alignItems: 'center', shadowColor: '#00ff00', shadowOpacity: 0.2, shadowRadius: 20 },
  statusText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 30 },
  confidenceText: { color: '#00ff00', fontSize: 14, marginTop: 15, fontFamily: 'monospace' },
  resetButton: { marginTop: 80, opacity: 0.4 },
  resetText: { color: '#fff', fontSize: 13, textDecorationLine: 'underline', letterSpacing: 1 }
});