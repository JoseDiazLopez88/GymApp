import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>Mapa No Disponible en Web</Text>
      <Text style={styles.subtitle}>
        Para ver la funcionalidad completa del mapa y ubicar gimnasios, 
        por favor abre la aplicación en tu celular usando Expo Go para iOS o Android.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  icon: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    color: '#D0FD3E',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
