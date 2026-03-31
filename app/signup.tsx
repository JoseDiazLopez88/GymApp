import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const auth = getAuth();

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Atención", "Por favor completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("¡Éxito!", "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.");
        router.replace('/(tabs)/two'); 
      })
      .catch((error) => {
        let message = "No se pudo crear la cuenta.";
        if (error.code === 'auth/email-already-in-use') message = "Este correo ya está registrado.";
        if (error.code === 'auth/invalid-email') message = "El formato del correo es incorrecto.";
        Alert.alert("Error de Registro", message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>SIGN UP</Text>
        
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Crea tu cuenta</Text>
          <Text style={styles.subText}>Únete a la comunidad de FB FITBODY.</Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Mínimo 6 caracteres" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Repite tu contraseña" 
            secureTextEntry 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.registerBtnText}>REGISTRARME AHORA</Text>}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/two')}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  scrollContainer: { padding: 25, justifyContent: 'center', minHeight: '100%' },
  headerTitle: { color: '#D0FD3E', textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginVertical: 20 },
  welcomeSection: { alignItems: 'center', marginBottom: 30 },
  welcomeTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subText: { color: '#888', textAlign: 'center', marginTop: 10 },
  authCard: { backgroundColor: '#B0A2F2', padding: 25, borderRadius: 25, marginBottom: 25 },
  label: { color: '#000', fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15 },
  registerBtn: { backgroundColor: '#D0FD3E', padding: 18, borderRadius: 30, alignItems: 'center' },
  registerBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 25, marginBottom: 40 },
  footerText: { color: '#888' },
  loginLink: { color: '#D0FD3E', fontWeight: 'bold' }
});