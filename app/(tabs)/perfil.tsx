import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState('profile'); // 'profile', 'editProfile', 'settings', 'favorites', 'beginnerVideos'
  const [menuVisible, setMenuVisible] = useState(false);

  // Profile states
  const [fullName, setFullName] = useState('Usuario');
  const [profileEmail, setProfileEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+123 456 7890');
  const [address, setAddress] = useState('123 Main St');
  const [city, setCity] = useState('Anytown');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('12345');
  const [country, setCountry] = useState('USA');

  // Settings states
  const [settingsSection, setSettingsSection] = useState('notifications');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false);
  const [powerSavingEnabled, setPowerSavingEnabled] = useState(false);
  const [language, setLanguage] = useState('Español');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProfileEmail(user.email || '');
        setFullName(user.displayName || user.email?.split('@')[0] || 'Usuario');
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.displayName) setFullName(data.displayName);
            if (data.name) setFullName(data.name);
            if (data.email) setProfileEmail(data.email);
          }
        } catch (e) { console.log(e); }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      // Navigate back to login by resetting state
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
    });
  };

  // Main profile view
  const renderProfile = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmailText}>{profileEmail}</Text>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => setCurrentView('editProfile')}>
            <Text style={styles.editProfileBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setCurrentView('editProfile')}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setCurrentView('settings')}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Configuración</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Privacidad', 'Respetamos tu privacidad. Tus datos están seguros con nosotros.')}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Privacidad</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Ayuda', '¿Necesitas ayuda? Contáctanos en soporte@fitbody.com')}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Ayuda</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Acerca de', 'FitBody v1.0\nTu compañero de fitness')}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={styles.menuText}>Acerca de</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );

  // Edit Profile view
  const renderEditProfile = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setCurrentView('profile')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert('Éxito', 'Perfil actualizado');
          setCurrentView('profile');
        }}>
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.editAvatarSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Cambiar Foto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Nombre Completo</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#666" />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput style={styles.input} value={profileEmail} onChangeText={setProfileEmail} keyboardType="email-address" placeholderTextColor="#666" />

          <Text style={styles.inputLabel}>Teléfono</Text>
          <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholderTextColor="#666" />

          <Text style={styles.inputLabel}>Dirección</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholderTextColor="#666" />

          <Text style={styles.inputLabel}>Ciudad</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholderTextColor="#666" />

          <Text style={styles.inputLabel}>País</Text>
          <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholderTextColor="#666" />
        </View>
      </ScrollView>
    </View>
  );

  // Settings view
  const renderSettings = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setCurrentView('profile')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Configuración</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.settingsTabs}>
        {['notifications', 'password', 'general'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.settingsTab, settingsSection === s && styles.activeSettingsTab]}
            onPress={() => setSettingsSection(s)}
          >
            <Text style={[styles.settingsTabText, settingsSection === s && styles.activeSettingsTabText]}>
              {s === 'notifications' ? 'Notificaciones' : s === 'password' ? 'Contraseña' : 'General'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {settingsSection === 'notifications' && (
          <View style={styles.settingsGroup}>
            <SettingSwitch label="Notificaciones" value={notificationsEnabled} onChange={setNotificationsEnabled} />
            <SettingSwitch label="Sonido" value={soundEnabled} onChange={setSoundEnabled} />
            <SettingSwitch label="No Molestar" value={dndEnabled} onChange={setDndEnabled} />
            <SettingSwitch label="Vibración" value={vibrateEnabled} onChange={setVibrateEnabled} />
          </View>
        )}

        {settingsSection === 'password' && (
          <View style={styles.settingsGroup}>
            <Text style={styles.inputLabel}>Contraseña Actual</Text>
            <TextInput style={styles.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} placeholder="********" placeholderTextColor="#666" />
            <Text style={styles.inputLabel}>Nueva Contraseña</Text>
            <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="********" placeholderTextColor="#666" />
            <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
            <TextInput style={styles.input} secureTextEntry value={confirmNewPassword} onChangeText={setConfirmNewPassword} placeholder="********" placeholderTextColor="#666" />
            <TouchableOpacity style={styles.updateBtn} onPress={() => {
              if (newPassword !== confirmNewPassword) {
                Alert.alert('Error', 'Las contraseñas no coinciden');
              } else {
                Alert.alert('Éxito', 'Contraseña actualizada');
                setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
              }
            }}>
              <Text style={styles.updateBtnText}>Actualizar Contraseña</Text>
            </TouchableOpacity>
          </View>
        )}

        {settingsSection === 'general' && (
          <View style={styles.settingsGroup}>
            <SettingSwitch label="Modo Oscuro" value={darkThemeEnabled} onChange={setDarkThemeEnabled} />
            <SettingSwitch label="Ahorro de Energía" value={powerSavingEnabled} onChange={setPowerSavingEnabled} />
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Idioma</Text>
              <TouchableOpacity style={styles.languageBtn} onPress={() => {
                Alert.alert('Idioma', '', [
                  { text: 'Español', onPress: () => setLanguage('Español') },
                  { text: 'English', onPress: () => setLanguage('English') },
                  { text: 'Cancelar', style: 'cancel' },
                ]);
              }}>
                <Text style={styles.languageBtnText}>{language} ▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  switch (currentView) {
    case 'editProfile': return renderEditProfile();
    case 'settings': return renderSettings();
    default: return renderProfile();
  }
}

// Helper component for setting switches
function SettingSwitch({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={settingSwitchStyles.item}>
      <Text style={settingSwitchStyles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#767577', true: '#D0FD3E' }}
        thumbColor={value ? '#000' : '#f4f3f4'}
      />
    </View>
  );
}

const settingSwitchStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    color: '#FFF',
    fontSize: 16,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    backgroundColor: '#1C1C1E',
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  subHeaderTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backText: {
    color: '#D0FD3E',
    fontSize: 16,
  },
  saveText: {
    color: '#D0FD3E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Profile Card
  profileCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#896CFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarLargeText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmailText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 15,
  },
  editProfileBtn: {
    backgroundColor: '#D0FD3E',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Menu
  menuSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuIcon: {
    fontSize: 22,
    width: 35,
  },
  menuText: {
    color: '#FFF',
    fontSize: 16,
    flex: 1,
  },
  menuArrow: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 22,
  },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,80,80,0.15)',
    borderRadius: 20,
    paddingVertical: 16,
    gap: 10,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    color: '#FF5050',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Edit Profile
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  changePhotoText: {
    color: '#D0FD3E',
    fontSize: 14,
    marginTop: 10,
  },
  formSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
  },
  inputLabel: {
    color: '#D0FD3E',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 16,
  },
  // Settings
  settingsTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 8,
  },
  settingsTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  activeSettingsTab: {
    backgroundColor: '#D0FD3E',
  },
  settingsTabText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeSettingsTabText: {
    color: '#000',
  },
  settingsGroup: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  settingLabel: {
    color: '#FFF',
    fontSize: 16,
  },
  languageBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  languageBtnText: {
    color: '#FFF',
    fontSize: 14,
  },
  updateBtn: {
    backgroundColor: '#D0FD3E',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  updateBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
