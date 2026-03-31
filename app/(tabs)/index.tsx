import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ImageBackground, Image, Linking, Modal, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db, saveUserToFirestore } from '../../firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome', 'login', 'register', 'setup', 'home', 'profile', 'editProfile', 'favorites', 'settings', 'beginnerVideos', 'chat'
  const [setupStep, setSetupStep] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [favoritesCategory, setFavoritesCategory] = useState('upper body');
  const [settingsSection, setSettingsSection] = useState('notifications');
  
  // Estados para login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para registro
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Estados para setup
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('KG');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [fullName, setFullName] = useState('Madison Smith');
  const [midName, setMidName] = useState('Madison');
  const [profileEmail, setProfileEmail] = useState('madison@madison.com');
  const [phoneNumber, setPhoneNumber] = useState('+123 456 7890');
  const [address, setAddress] = useState('123 Main St');
  const [city, setCity] = useState('Anytown');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('12345');
  const [country, setCountry] = useState('USA');

  // Estados para settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false);
  const [powerSavingEnabled, setPowerSavingEnabled] = useState(false);
  const [language, setLanguage] = useState('English');
  
  // Estados para password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '241052728524-7srs6rqsdj0lcarglu5onir5n10nj41j.apps.googleusercontent.com',
  });

  // Efecto para manejar la respuesta de Google
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken || response.params?.id_token;

      if (!idToken) {
        Alert.alert("Error", "El navegador bloqueó el token. Revisa app.json y limpia caché.");
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential)
        .then(async (result) => {
          await saveUserToFirestore(result.user.uid, {
            email: result.user.email || '',
            displayName: result.user.displayName || result.user.email?.split('@')[0] || '',
            photoURL: result.user.photoURL || '',
          });
          Alert.alert("¡Éxito!", `Bienvenido ${result.user.email}`);
          setCurrentScreen('setup');
          setSetupStep(0);
        })
        .catch((error) => Alert.alert("Error Firebase", error.message));
    }
  }, [response]);

  // Función para manejar login con email
  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert("Atención", "Ingresa email y contraseña");
      return;
    }
    
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        await saveUserToFirestore(userCredential.user.uid, {
          email: userCredential.user.email || '',
          displayName: userCredential.user.email?.split('@')[0] || '',
        });
        console.log("Login exitoso:", userCredential.user.email);
        setCurrentScreen('home');
      })
      .catch((error) => {
        console.log("Error de login:", error);
        Alert.alert("Error", "Email o contraseña incorrectos");
      })
      .finally(() => setLoading(false));
  };

  // Función para manejar registro con email
  const handleRegister = () => {
    // Validaciones
    if (!registerEmail || !registerPassword || !confirmPassword) {
      Alert.alert("Atención", "Por favor completa todos los campos");
      return;
    }

    if (registerPassword.length < 6) {
      Alert.alert("Atención", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (registerPassword !== confirmPassword) {
      Alert.alert("Atención", "Las contraseñas no coinciden");
      return;
    }

    setRegisterLoading(true);
    createUserWithEmailAndPassword(auth, registerEmail, registerPassword)
      .then(async (userCredential) => {
        await saveUserToFirestore(userCredential.user.uid, {
          email: userCredential.user.email || '',
          displayName: registerEmail.split('@')[0] || '',
        });
        Alert.alert("¡Éxito!", "Cuenta creada correctamente");
        setCurrentScreen('setup');
        setSetupStep(0);
      })
      .catch((error) => {
        console.log("Error de registro:", error);
        let errorMessage = "Error al crear la cuenta";
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = "Este email ya está registrado";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "Email inválido";
        }
        Alert.alert("Error", errorMessage);
      })
      .finally(() => setRegisterLoading(false));
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setCurrentScreen('welcome');
      setMenuVisible(false);
    });
  };

  const renderWelcomeScreen = () => (
    <>
      <View style={styles.topSection}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        
        <View style={styles.logoContainer}>
          <Text style={styles.fbLogo}>FB</Text>
          <Text style={styles.fitBodyText}>FITBODY</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCurrentScreen('login')}
      >
        <Text style={styles.buttonText}>GET STARTED</Text>
      </TouchableOpacity>
    </>
  );

  const renderLoginScreen = () => (
    <View style={styles.loginContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('welcome')}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Log In</Text>
      
      <View style={styles.authCard}>
        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="correo@ejemplo.com" 
          placeholderTextColor="#666"
          onChangeText={setEmail} 
          value={email} 
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="******" 
          placeholderTextColor="#666"
          secureTextEntry 
          onChangeText={setPassword} 
          value={password} 
        />
      </View>

      <TouchableOpacity 
        style={styles.loginBtn} 
        onPress={handleEmailLogin} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.googleBtn} 
        onPress={() => {
          console.log("Iniciando Google Login...");
          promptAsync();
        }} 
        disabled={!request}
      >
        <Text style={styles.googleText}>INICIAR CON GOOGLE</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCurrentScreen('register')} style={{marginTop: 20}}>
        <Text style={{color: '#D0FD3E', textAlign: 'center'}}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterScreen = () => (
    <View style={styles.loginContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('login')}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>CREATE ACCOUNT</Text>
      
      <View style={styles.authCard}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput 
          style={styles.input} 
          placeholder="example@example.com" 
          placeholderTextColor="#666"
          onChangeText={setRegisterEmail} 
          value={registerEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Mínimo 6 caracteres" 
          placeholderTextColor="#666"
          secureTextEntry 
          onChangeText={setRegisterPassword} 
          value={registerPassword} 
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Repite tu contraseña" 
          placeholderTextColor="#666"
          secureTextEntry 
          onChangeText={setConfirmPassword} 
          value={confirmPassword} 
        />
      </View>

      <TouchableOpacity 
        style={styles.loginBtn} 
        onPress={handleRegister} 
        disabled={registerLoading}
      >
        {registerLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o registrate con</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={styles.googleBtn} 
        onPress={() => {
          console.log("Iniciando Google Login...");
          promptAsync();
        }} 
        disabled={!request}
      >
        <Text style={styles.googleText}>G</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCurrentScreen('login')} style={{marginTop: 20}}>
        <Text style={{color: '#D0FD3E', textAlign: 'center'}}>
          ¿Ya tienes cuenta? Log in
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSetupScreen = () => {
    const steps = [
      // Paso 0: Gender
      {
        title: "What's Your Gender",
        subtitle: "Consistency Is The Key To Progress. Don't Give Up!",
        content: (
          <>
            <Text style={styles.setupSubtitle}>Consistency Is The Key To Progress. Don't Give Up!</Text>
            <Text style={styles.setupDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
            <TouchableOpacity 
              style={[styles.setupOption, gender === 'male' && styles.selectedOption]} 
              onPress={() => setGender('male')}
            >
              <Text style={[styles.setupOptionText, gender === 'male' && styles.selectedOptionText]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.setupOption, gender === 'female' && styles.selectedOption]} 
              onPress={() => setGender('female')}
            >
              <Text style={[styles.setupOptionText, gender === 'female' && styles.selectedOptionText]}>Female</Text>
            </TouchableOpacity>
          </>
        )
      },
      // Paso 1: Age
      {
        title: "How Old Are You?",
        content: (
          <>
            <Text style={styles.setupDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ageScroll}>
              {[26,27,28,29,30].map((num) => (
                <TouchableOpacity 
                  key={num} 
                  style={[styles.ageOption, age === num.toString() && styles.selectedOption]}
                  onPress={() => setAge(num.toString())}
                >
                  <Text style={[styles.ageText, age === num.toString() && styles.selectedOptionText]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )
      },
      // Paso 2: Weight
      {
        title: "What is Your Weight?",
        content: (
          <>
            <View style={styles.unitToggle}>
              <TouchableOpacity 
                style={[styles.unitButton, weightUnit === 'KG' && styles.selectedUnit]} 
                onPress={() => setWeightUnit('KG')}
              >
                <Text style={[styles.unitText, weightUnit === 'KG' && styles.selectedUnitText]}>KG</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.unitButton, weightUnit === 'LB' && styles.selectedUnit]} 
                onPress={() => setWeightUnit('LB')}
              >
                <Text style={[styles.unitText, weightUnit === 'LB' && styles.selectedUnitText]}>LB</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weightScroll}>
              {[73,74,75,76,77].map((num) => (
                <TouchableOpacity 
                  key={num} 
                  style={[styles.weightOption, weight === num.toString() && styles.selectedOption]}
                  onPress={() => setWeight(num.toString())}
                >
                  <Text style={[styles.weightText, weight === num.toString() && styles.selectedOptionText]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )
      },
      // Paso 3: Height
      {
        title: "What is Your Height?",
        content: (
          <>
            <Text style={styles.unitDisplay}>cm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heightScroll}>
              {[165,170,175,180,185,190].map((num) => (
                <TouchableOpacity 
                  key={num} 
                  style={[styles.heightOption, height === num.toString() && styles.selectedOption]}
                  onPress={() => setHeight(num.toString())}
                >
                  <Text style={[styles.heightText, height === num.toString() && styles.selectedOptionText]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )
      },
      // Paso 4: Goal
      {
        title: "What is Your Goal?",
        content: (
          <>
            <Text style={styles.setupDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
            <Text style={styles.goalText}>
              Long jump shot at over, conversion shooting off, and a three-point shot in the last two games.
            </Text>
          </>
        )
      },
      // Paso 5: Activity Level
      {
        title: "Physical Activity Level",
        content: (
          <>
            <TouchableOpacity 
              style={[styles.activityOption, activityLevel === 'beginner' && styles.selectedOption]} 
              onPress={() => setActivityLevel('beginner')}
            >
              <Text style={[styles.activityText, activityLevel === 'beginner' && styles.selectedOptionText]}>Beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.activityOption, activityLevel === 'intermediate' && styles.selectedOption]} 
              onPress={() => setActivityLevel('intermediate')}
            >
              <Text style={[styles.activityText, activityLevel === 'intermediate' && styles.selectedOptionText]}>Intermediate</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.activityOption, activityLevel === 'advanced' && styles.selectedOption]} 
              onPress={() => setActivityLevel('advanced')}
            >
              <Text style={[styles.activityText, activityLevel === 'advanced' && styles.selectedOptionText]}>Advanced</Text>
            </TouchableOpacity>
          </>
        )
      },
      // Paso 6: Profile
      {
        title: "Fill Your Profile",
        content: (
          <>
            <Text style={styles.setupDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput 
              style={styles.profileInput}
              placeholder="Madison Smith"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
            <Text style={styles.inputLabel}>Midname</Text>
            <TextInput 
              style={styles.profileInput}
              placeholder="Madison"
              placeholderTextColor="#999"
              value={midName}
              onChangeText={setMidName}
            />
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput 
              style={styles.profileInput}
              placeholder="madison@example.com"
              placeholderTextColor="#999"
              value={profileEmail}
              onChangeText={setProfileEmail}
              keyboardType="email-address"
            />
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput 
              style={styles.profileInput}
              placeholder="+123 567 89000"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </>
        )
      }
    ];

    const currentStep = steps[setupStep];
    const isLastStep = setupStep === steps.length - 1;

    const handleContinue = () => {
      // Validar que se haya seleccionado una opción en cada paso
      if (setupStep === 0 && !gender) {
        Alert.alert("Atención", "Por favor selecciona tu género");
        return;
      }
      if (setupStep === 1 && !age) {
        Alert.alert("Atención", "Por favor selecciona tu edad");
        return;
      }
      if (setupStep === 2 && !weight) {
        Alert.alert("Atención", "Por favor selecciona tu peso");
        return;
      }
      if (setupStep === 3 && !height) {
        Alert.alert("Atención", "Por favor selecciona tu altura");
        return;
      }
      if (setupStep === 5 && !activityLevel) {
        Alert.alert("Atención", "Por favor selecciona tu nivel de actividad");
        return;
      }

      if (isLastStep) {
        // Último paso - vamos al home
        Alert.alert("¡Bienvenido!", "Tu perfil ha sido configurado correctamente");
        setCurrentScreen('home');
      } else {
        // Siguiente paso
        setSetupStep(setupStep + 1);
      }
    };

    return (
      <View style={styles.setupContainer}>
        <TouchableOpacity 
          style={styles.setupBackButton}
          onPress={() => {
            if (setupStep > 0) {
              setSetupStep(setupStep - 1);
            } else {
              setCurrentScreen('login');
            }
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <ScrollView 
          style={styles.setupContent} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.setupContentContainer}
        >
          <Text style={styles.setupTitle}>{currentStep.title}</Text>
          {currentStep.subtitle && <Text style={styles.setupSubtitle}>{currentStep.subtitle}</Text>}
          {currentStep.content}

          <TouchableOpacity 
            style={[styles.continueButton, isLastStep && styles.finishButton]}
            onPress={handleContinue}
          >
            <Text style={[styles.continueButtonText, isLastStep && styles.finishButtonText]}>
              {isLastStep ? 'START MY JOURNEY' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderMenu = () => (
    <Modal
      visible={menuVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setMenuVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setMenuVisible(false)}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <View style={styles.menuProfileIcon}>
              <Text style={styles.menuProfileIconText}>{fullName.charAt(0)}</Text>
            </View>
            <Text style={styles.menuUserName}>{fullName}</Text>
            <Text style={styles.menuUserEmail}>{profileEmail}</Text>
          </View>

          <ScrollView style={styles.menuItems}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setCurrentScreen('profile');
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={styles.menuItemText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setCurrentScreen('favorites');
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemIcon}>❤️</Text>
              <Text style={styles.menuItemText}>Favorite</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setCurrentScreen('beginnerVideos');
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemIcon}>🎥</Text>
              <Text style={styles.menuItemText}>Workout Videos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setCurrentScreen('privacy');
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemIcon}>🔒</Text>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setCurrentScreen('settings');
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemIcon}>⚙️</Text>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setCurrentScreen('help');
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemIcon}>❓</Text>
              <Text style={styles.menuItemText}>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemLogout]}
              onPress={handleLogout}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, styles.menuItemLogoutText]}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderProfileScreen = () => (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.profileHeaderTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => setCurrentScreen('editProfile')}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.profileContent}>
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageLarge}>
            <Text style={styles.profileImageLargeText}>{fullName.charAt(0)}</Text>
          </View>
        </View>

        <View style={styles.profileInfoSection}>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Full Name:</Text>
            <Text style={styles.profileInfoValue}>{fullName}</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Email:</Text>
            <Text style={styles.profileInfoValue}>{profileEmail}</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Phone:</Text>
            <Text style={styles.profileInfoValue}>{phoneNumber}</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Home:</Text>
            <Text style={styles.profileInfoValue}>{address}</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>City:</Text>
            <Text style={styles.profileInfoValue}>{city}</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>State:</Text>
            <Text style={styles.profileInfoValue}>{state}</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Zip:</Text>
            <Text style={styles.profileInfoValue}>{zip}</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Text style={styles.profileInfoLabel}>Country:</Text>
            <Text style={styles.profileInfoValue}>{country}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderEditProfileScreen = () => (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('profile')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.profileHeaderTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert("Éxito", "Perfil actualizado");
          setCurrentScreen('profile');
        }}>
          <Text style={styles.editButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.profileContent}>
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageLarge}>
            <Text style={styles.profileImageLargeText}>{fullName.charAt(0)}</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.editForm}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput 
            style={styles.editInput}
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput 
            style={styles.editInput}
            value={profileEmail}
            onChangeText={setProfileEmail}
            keyboardType="email-address"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput 
            style={styles.editInput}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Address</Text>
          <TextInput 
            style={styles.editInput}
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>City</Text>
          <TextInput 
            style={styles.editInput}
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>State</Text>
          <TextInput 
            style={styles.editInput}
            value={state}
            onChangeText={setState}
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Zip Code</Text>
          <TextInput 
            style={styles.editInput}
            value={zip}
            onChangeText={setZip}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Country</Text>
          <TextInput 
            style={styles.editInput}
            value={country}
            onChangeText={setCountry}
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>
    </View>
  );

  const renderFavoritesScreen = () => {
    const categories = [
      'upper body', 'pull out', 'lower body', 'laced boots', 
      'combat thigh highs', 'quick strength training', 'bootie dress',
      'ankle boots', 'lace up boots', 'combat leggings'
    ];

    const items = ['shirt', 'pants', 'shoes', 'accessories'];

    return (
      <View style={styles.favoritesContainer}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.profileHeaderTitle}>Favorites</Text>
          <View style={{width: 40}} />
        </View>

        <View style={styles.favoritesCategories}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, favoritesCategory === cat && styles.activeCategoryTab]}
                onPress={() => setFavoritesCategory(cat)}
              >
                <Text style={[styles.categoryTabText, favoritesCategory === cat && styles.activeCategoryTabText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.favoritesContent}>
          <Text style={styles.categoryTitle}>{favoritesCategory}</Text>
          {items.map((item) => (
            <TouchableOpacity key={item} style={styles.favoriteItem}>
              <View style={styles.favoriteItemLeft}>
                <View style={styles.favoriteItemIcon}>
                  <Text>{item === 'shirt' ? '👕' : item === 'pants' ? '👖' : item === 'shoes' ? '👟' : '🧦'}</Text>
                </View>
                <Text style={styles.favoriteItemName}>{item}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.favoriteItemRemove}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSettingsScreen = () => (
    <View style={styles.settingsContainer}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.profileHeaderTitle}>Settings</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.settingsTabs}>
        <TouchableOpacity 
          style={[styles.settingsTab, settingsSection === 'notifications' && styles.activeSettingsTab]}
          onPress={() => setSettingsSection('notifications')}
        >
          <Text style={[styles.settingsTabText, settingsSection === 'notifications' && styles.activeSettingsTabText]}>
            Notifications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.settingsTab, settingsSection === 'password' && styles.activeSettingsTab]}
          onPress={() => setSettingsSection('password')}
        >
          <Text style={[styles.settingsTabText, settingsSection === 'password' && styles.activeSettingsTabText]}>
            Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.settingsTab, settingsSection === 'general' && styles.activeSettingsTab]}
          onPress={() => setSettingsSection('general')}
        >
          <Text style={[styles.settingsTabText, settingsSection === 'general' && styles.activeSettingsTabText]}>
            General
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.settingsContent}>
        {settingsSection === 'notifications' && (
          <View style={styles.settingsGroup}>
            <Text style={styles.settingsGroupTitle}>Notification Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>General Notification</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
                thumbColor={notificationsEnabled ? '#000' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sound</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
                thumbColor={soundEnabled ? '#000' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Don't Disturb Mode</Text>
              <Switch
                value={dndEnabled}
                onValueChange={setDndEnabled}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
                thumbColor={dndEnabled ? '#000' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Vibrate</Text>
              <Switch
                value={vibrateEnabled}
                onValueChange={setVibrateEnabled}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
                thumbColor={vibrateEnabled ? '#000' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Lock Screen</Text>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Background</Text>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
              />
            </View>
          </View>
        )}

        {settingsSection === 'password' && (
          <View style={styles.settingsGroup}>
            <Text style={styles.settingsGroupTitle}>Password Settings</Text>
            
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput 
              style={styles.passwordInput}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="********"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput 
              style={styles.passwordInput}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="********"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput 
              style={styles.passwordInput}
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="********"
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              style={styles.updatePasswordButton}
              onPress={() => {
                if (newPassword !== confirmNewPassword) {
                  Alert.alert("Error", "Las contraseñas no coinciden");
                } else {
                  Alert.alert("Éxito", "Contraseña actualizada");
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }
              }}
            >
              <Text style={styles.updatePasswordText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {settingsSection === 'general' && (
          <View style={styles.settingsGroup}>
            <Text style={styles.settingsGroupTitle}>General Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
                thumbColor={notificationsEnabled ? '#000' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Power Saving</Text>
              <Switch
                value={powerSavingEnabled}
                onValueChange={setPowerSavingEnabled}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
                thumbColor={powerSavingEnabled ? '#000' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Dark Theme</Text>
              <Switch
                value={darkThemeEnabled}
                onValueChange={setDarkThemeEnabled}
                trackColor={{false: '#767577', true: '#D0FD3E'}}
                thumbColor={darkThemeEnabled ? '#000' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Language</Text>
              <TouchableOpacity 
                style={styles.languageSelector}
                onPress={() => {
                  const languages = ['English', 'Spanish', 'French', 'German'];
                  Alert.alert('Select Language', '', languages.map((lang) => ({
                    text: lang,
                    onPress: () => setLanguage(lang)
                  })));
                }}
              >
                <Text style={styles.languageText}>{language}</Text>
                <Text style={styles.languageArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderBeginnerVideosScreen = () => {
    interface Video {
      id: number;
      title: string;
      duration: string;
      thumbnail: string;
      level: string;
      youtubeUrl: string;
      channel: string;
    }

    const videos: Video[] = [
      { id: 1, title: 'Full Body Workout for Beginners', duration: '20:00', thumbnail: 'https://img.youtube.com/vi/UItWltVZZmE/mqdefault.jpg', level: 'Beginner', youtubeUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE', channel: 'MadFit' },
      { id: 2, title: 'Abs Workout - 10 Minutes', duration: '10:25', thumbnail: 'https://img.youtube.com/vi/1919eTCoESo/mqdefault.jpg', level: 'Beginner', youtubeUrl: 'https://www.youtube.com/watch?v=1919eTCoESo', channel: 'THENX' },
      { id: 3, title: 'Chest Workout at Home', duration: '15:30', thumbnail: 'https://img.youtube.com/vi/BkS1-El_WlE/mqdefault.jpg', level: 'Intermediate', youtubeUrl: 'https://www.youtube.com/watch?v=BkS1-El_WlE', channel: 'AthleanX' },
      { id: 4, title: 'Leg Day - Complete Guide', duration: '18:45', thumbnail: 'https://img.youtube.com/vi/Kzag-5VFaQI/mqdefault.jpg', level: 'Intermediate', youtubeUrl: 'https://www.youtube.com/watch?v=Kzag-5VFaQI', channel: 'Jeff Nippard' },
      { id: 5, title: 'HIIT Cardio - Fat Burn', duration: '25:00', thumbnail: 'https://img.youtube.com/vi/ml6cT4AZdqI/mqdefault.jpg', level: 'Advanced', youtubeUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI', channel: 'Fitness Blender' },
      { id: 6, title: 'Back & Biceps Workout', duration: '22:15', thumbnail: 'https://img.youtube.com/vi/eE7dzM0jhfk/mqdefault.jpg', level: 'Intermediate', youtubeUrl: 'https://www.youtube.com/watch?v=eE7dzM0jhfk', channel: 'Jeremy Ethier' },
      { id: 7, title: 'Stretching for Flexibility', duration: '12:00', thumbnail: 'https://img.youtube.com/vi/g_tea8ZNk5A/mqdefault.jpg', level: 'Beginner', youtubeUrl: 'https://www.youtube.com/watch?v=g_tea8ZNk5A', channel: 'Blogilates' },
      { id: 8, title: 'Shoulder Workout - Build Mass', duration: '16:30', thumbnail: 'https://img.youtube.com/vi/2Vprklw8cu8/mqdefault.jpg', level: 'Advanced', youtubeUrl: 'https://www.youtube.com/watch?v=2Vprklw8cu8', channel: 'AthleanX' },
      { id: 9, title: 'Core Strength for Beginners', duration: '14:00', thumbnail: 'https://img.youtube.com/vi/DHD1-2P94DI/mqdefault.jpg', level: 'Beginner', youtubeUrl: 'https://www.youtube.com/watch?v=DHD1-2P94DI', channel: 'Chloe Ting' },
      { id: 10, title: 'Push Up Progression Guide', duration: '11:45', thumbnail: 'https://img.youtube.com/vi/0pkjOk0EiAk/mqdefault.jpg', level: 'Beginner', youtubeUrl: 'https://www.youtube.com/watch?v=0pkjOk0EiAk', channel: 'THENX' },
      { id: 11, title: 'Arm Workout No Equipment', duration: '15:00', thumbnail: 'https://img.youtube.com/vi/Qia2fJGQ_Yg/mqdefault.jpg', level: 'Beginner', youtubeUrl: 'https://www.youtube.com/watch?v=Qia2fJGQ_Yg', channel: 'MadFit' },
      { id: 12, title: 'Calisthenics Full Routine', duration: '30:00', thumbnail: 'https://img.youtube.com/vi/UoC_O3HzsH0/mqdefault.jpg', level: 'Advanced', youtubeUrl: 'https://www.youtube.com/watch?v=UoC_O3HzsH0', channel: 'THENX' },
    ];

    const [videoFilter, setVideoFilter] = useState('All');
    const filteredVideos = videoFilter === 'All' ? videos : videos.filter(v => v.level === videoFilter);

    return (
      <View style={styles.videosContainer}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.profileHeaderTitle}>Workout Videos</Text>
          <View style={{width: 40}} />
        </View>

        <View style={styles.videoFilters}>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, videoFilter === filter && styles.activeFilterChip]}
              onPress={() => setVideoFilter(filter)}
            >
              <Text style={[styles.filterChipText, videoFilter === filter && styles.activeFilterChipText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredVideos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.videoItem}
              onPress={() => Linking.openURL(item.youtubeUrl)}
            >
              <Image 
                source={{ uri: item.thumbnail }}
                style={styles.videoThumbnailImg}
                resizeMode="cover"
              />
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.videoChannel}>{item.channel}</Text>
                <View style={styles.videoMeta}>
                  <Text style={[
                    styles.videoLevel, 
                    item.level === 'Beginner' && styles.beginnerLevel,
                    item.level === 'Intermediate' && styles.intermediateLevel,
                    item.level === 'Advanced' && styles.advancedLevel
                  ]}>{item.level}</Text>
                  <Text style={styles.videoDuration}>{item.duration}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.videoPlayButton}
                onPress={() => Linking.openURL(item.youtubeUrl)}
              >
                <Text style={styles.videoPlayText}>▶</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.videosList}
        />
      </View>
    );
  };

  const renderHomeScreen = () => (
    <View style={styles.homeContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con saludo y menú */}
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.greeting}>Hi, {fullName.split(' ')[0]}</Text>
            <Text style={styles.subGreeting}>It's time to challenge your friends.</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileIcon}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.profileIconText}>{fullName.charAt(0)}</Text>
          </TouchableOpacity>
        </View>

        {/* Challenge Tabs */}
        <View style={styles.challengeTabs}>
          <TouchableOpacity style={[styles.challengeTab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Daily Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.challengeTab}>
            <Text style={styles.tabText}>Weekly Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.challengeTab}>
            <Text style={styles.tabText}>Monthly Challenges</Text>
          </TouchableOpacity>
        </View>

        {/* Beginner Videos Card */}
        <TouchableOpacity 
          style={styles.videoCard}
          onPress={() => setCurrentScreen('beginnerVideos')}
        >
          <View style={styles.videoCardContent}>
            <Text style={styles.videoCardTitle}>🎥 Beginner Videos</Text>
            <Text style={styles.videoCardSubtitle}>509 videos for beginners</Text>
            <View style={styles.videoCardButton}>
              <Text style={styles.videoCardButtonText}>Start Learning</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Weekly Challenge Card */}
        <View style={styles.challengeCard}>
          <Text style={styles.challengeCardTitle}>Weekly Challenge</Text>
          <Text style={styles.challengeNumber}>Challenge #1</Text>
          <View style={styles.challengeProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>60%</Text>
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Days Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>450</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>75</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>

        {/* Articles & Tips */}
        <Text style={styles.sectionTitle}>Articles & Tips</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.articlesScroll}>
          <TouchableOpacity style={styles.articleCard} onPress={() => Linking.openURL('https://www.healthline.com/nutrition/healthy-eating-tips')}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop'}} style={styles.articleImageReal} />
            <Text style={styles.articleTitle}>Healthy Meal Plans...</Text>
            <Text style={styles.articleAuthor}>By Nutritionist</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.articleCard} onPress={() => Linking.openURL('https://www.healthline.com/nutrition/pre-workout-nutrition')}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=200&fit=crop'}} style={styles.articleImageReal} />
            <Text style={styles.articleTitle}>Pre-Workout Nutrition...</Text>
            <Text style={styles.articleAuthor}>By Fitness Expert</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.articleCard} onPress={() => Linking.openURL('https://www.healthline.com/health/fitness-exercise/morning-workout')}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'}} style={styles.articleImageReal} />
            <Text style={styles.articleTitle}>Morning Workout Tips...</Text>
            <Text style={styles.articleAuthor}>By Coach Mike</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>

{/* Bottom Navigation */}
<View style={styles.bottomNav}>
  <TouchableOpacity style={styles.navItem}>
    <Text style={[styles.navIcon, styles.activeNavIcon]}>🏠</Text>
    <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('beginnerVideos')}>
    <Text style={styles.navIcon}>🎥</Text>
    <Text style={styles.navText}>Videos</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('favorites')}>
    <Text style={styles.navIcon}>❤️</Text>
    <Text style={styles.navText}>Favorites</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={styles.navItem}
    onPress={() => setMenuVisible(true)}
  >
    <Text style={styles.navIcon}>👤</Text>
    <Text style={styles.navText}>Profile</Text>
  </TouchableOpacity>
</View>

      {/* Bottom hint for tabs */}

      {/* Menú flotante */}
      {renderMenu()}
    </View>
  );

  const renderScreen = () => {
    switch(currentScreen) {
      case 'welcome':
        return renderWelcomeScreen();
      case 'login':
        return renderLoginScreen();
      case 'register':
        return renderRegisterScreen();
      case 'setup':
        return renderSetupScreen();
      case 'home':
        return renderHomeScreen();
      case 'profile':
        return renderProfileScreen();
      case 'editProfile':
        return renderEditProfileScreen();
      case 'favorites':
        return renderFavoritesScreen();
      case 'settings':
        return renderSettingsScreen();
      case 'beginnerVideos':
        return renderBeginnerVideosScreen();
      default:
        return renderWelcomeScreen();
    }
  };

 return (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" />
    {currentScreen !== 'home' && currentScreen !== 'profile' && currentScreen !== 'editProfile' && 
     currentScreen !== 'favorites' && currentScreen !== 'settings' && currentScreen !== 'beginnerVideos' ? (
      <ImageBackground 
        source={require('../../assets/images/beautiful-young-sporty-woman-training-workout-gym 3.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {renderScreen()}
        </View>
      </ImageBackground>
      ) : (
      renderScreen()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backgroundImage: { flex: 1 },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 60,
  },
  topSection: { alignItems: 'center' },
  welcomeText: { color: '#D0FD3E', fontSize: 22, fontWeight: '600', marginBottom: 5 },
  logoContainer: { alignItems: 'center' },
  fbLogo: { color: '#B0A2F2', fontSize: 100, fontWeight: '900', fontStyle: 'italic', lineHeight: 100 },
  fitBodyText: { color: '#D0FD3E', fontSize: 45, fontWeight: 'bold', marginTop: -20, letterSpacing: 3 },
  button: { 
    backgroundColor: '#D0FD3E', 
    paddingVertical: 18, 
    paddingHorizontal: 60, 
    borderRadius: 35,
    elevation: 8
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  
  // Estilos para login y registro
  loginContainer: {
    width: '100%',
    paddingHorizontal: 25,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D0FD3E',
    fontSize: 16,
  },
  headerTitle: { 
    color: '#D0FD3E', 
    textAlign: 'center', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30 
  },
  authCard: { 
    backgroundColor: '#B0A2F2', 
    padding: 20, 
    borderRadius: 25, 
    marginBottom: 20 
  },
  label: { 
    color: '#000', 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  input: { 
    backgroundColor: '#FFF', 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 15,
    color: '#000'
  },
  loginBtn: { 
    backgroundColor: '#333', 
    padding: 15, 
    borderRadius: 25, 
    alignItems: 'center' 
  },
  loginBtnText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },
  googleBtn: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginTop: 15 
  },
  googleText: { 
    color: '#4285F4', 
    fontWeight: 'bold',
    fontSize: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: '#FFF',
    marginHorizontal: 10,
    fontSize: 12,
  },

  // Estilos para setup
  setupContainer: {
    width: '100%',
    paddingHorizontal: 25,
    flex: 1,
  },
  setupBackButton: {
    marginBottom: 10,
  },
  setupContent: {
    flex: 1,
  },
  setupContentContainer: {
    paddingBottom: 30,
  },
  setupTitle: {
    color: '#D0FD3E',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  setupSubtitle: {
    color: '#D0FD3E',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  setupDescription: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.8,
  },
  setupOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  setupOptionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  selectedOption: {
    backgroundColor: '#D0FD3E',
  },
  selectedOptionText: {
    color: '#000',
  },
  ageScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  ageOption: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ageText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unitToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  unitButton: {
    paddingHorizontal: 25,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  unitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedUnit: {
    backgroundColor: '#D0FD3E',
  },
  selectedUnitText: {
    color: '#000',
  },
  weightScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  weightOption: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  weightText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unitDisplay: {
    color: '#D0FD3E',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  heightScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  heightOption: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heightText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    fontStyle: 'italic',
  },
  activityOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  activityText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#D0FD3E',
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
  },
  profileInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 8,
  },
  continueButton: {
    backgroundColor: '#D0FD3E',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#D0FD3E',
    marginTop: 30,
  },
  finishButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Estilos para Home
  homeContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#D0FD3E',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#B0A2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  challengeTabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  challengeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  activeTab: {
    borderBottomColor: '#D0FD3E',
  },
  tabText: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
  },
  activeTabText: {
    color: '#D0FD3E',
    opacity: 1,
    fontWeight: '600',
  },
  videoCard: {
    backgroundColor: 'rgba(176,162,242,0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#B0A2F2',
  },
  videoCardContent: {
    alignItems: 'center',
  },
  videoCardTitle: {
    color: '#B0A2F2',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoCardSubtitle: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 15,
  },
  videoCardButton: {
    backgroundColor: '#D0FD3E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  videoCardButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(208,253,62,0.3)',
  },
  challengeCardTitle: {
    color: '#D0FD3E',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  challengeNumber: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#D0FD3E',
    borderRadius: 4,
  },
  progressText: {
    color: '#D0FD3E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#D0FD3E',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    color: '#D0FD3E',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.7,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  articlesScroll: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  articleCard: {
    width: 140,
    marginRight: 12,
  },
  articleImage: {
    width: 140,
    height: 90,
    backgroundColor: 'rgba(176,162,242,0.3)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleEmoji: {
    fontSize: 36,
  },
  articleTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  articleAuthor: {
    color: '#D0FD3E',
    fontSize: 12,
    opacity: 0.8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 15,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.5,
  },
  activeNavIcon: {
    opacity: 1,
  },
  navText: {
    color: '#FFF',
    fontSize: 11,
    opacity: 0.5,
  },
  activeNavText: {
    color: '#D0FD3E',
    opacity: 1,
  },

  // Estilos para el menú flotante
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  menuHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuProfileIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#B0A2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuProfileIconText: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
  },
  menuUserName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuUserEmail: {
    color: '#D0FD3E',
    fontSize: 14,
    marginTop: 5,
  },
  menuItems: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 16,
  },
  menuItemLogout: {
    borderBottomWidth: 0,
  },
  menuItemLogoutText: {
    color: '#FF6B6B',
  },

  // Estilos para perfil
  profileContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileHeaderTitle: {
    color: '#D0FD3E',
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#D0FD3E',
    fontSize: 16,
  },
  profileContent: {
    flex: 1,
    padding: 20,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#B0A2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageLargeText: {
    color: '#000',
    fontSize: 48,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    padding: 10,
  },
  changePhotoText: {
    color: '#D0FD3E',
    fontSize: 14,
  },
  profileInfoSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
  },
  profileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileInfoLabel: {
    color: '#D0FD3E',
    fontSize: 14,
    fontWeight: '600',
  },
  profileInfoValue: {
    color: '#FFF',
    fontSize: 14,
  },
  editForm: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
  },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 15,
  },

  // Estilos para favoritos
  favoritesContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  favoritesCategories: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeCategoryTab: {
    backgroundColor: '#D0FD3E',
  },
  categoryTabText: {
    color: '#FFF',
    fontSize: 14,
  },
  activeCategoryTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  favoritesContent: {
    flex: 1,
    padding: 20,
  },
  categoryTitle: {
    color: '#D0FD3E',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  favoriteItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(208,253,62,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  favoriteItemName: {
    color: '#FFF',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  favoriteItemRemove: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Estilos para settings
  settingsContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  settingsTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingsTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeSettingsTab: {
    backgroundColor: '#D0FD3E',
  },
  settingsTabText: {
    color: '#FFF',
    fontSize: 14,
  },
  activeSettingsTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  settingsContent: {
    flex: 1,
    padding: 20,
  },
  settingsGroup: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
  },
  settingsGroupTitle: {
    color: '#D0FD3E',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLabel: {
    color: '#FFF',
    fontSize: 16,
  },
  passwordInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 15,
  },
  updatePasswordButton: {
    backgroundColor: '#D0FD3E',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  updatePasswordText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  languageText: {
    color: '#FFF',
    fontSize: 16,
    marginRight: 10,
  },
  languageArrow: {
    color: '#D0FD3E',
    fontSize: 14,
  },

  // Estilos para videos
  videosContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  videoFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#D0FD3E',
  },
  filterChipText: {
    color: '#FFF',
    fontSize: 12,
  },
  activeFilterChipText: {
    color: '#000',
    fontWeight: 'bold',
  },
  videosList: {
    padding: 20,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },
  videoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(208,253,62,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  videoThumbnailEmoji: {
    fontSize: 30,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoLevel: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    overflow: 'hidden',
  },
  beginnerLevel: {
    backgroundColor: 'rgba(208,253,62,0.2)',
    color: '#D0FD3E',
  },
  intermediateLevel: {
    backgroundColor: 'rgba(255,165,0,0.2)',
    color: '#FFA500',
  },
  advancedLevel: {
    backgroundColor: 'rgba(255,0,0,0.2)',
    color: '#FF4444',
  },
  videoDuration: {
    color: '#999',
    fontSize: 12,
  },
  videoPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D0FD3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  videoPlayText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  videoPlayer: {
    aspectRatio: 16/9,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoPlayerEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  videoPlayerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoPlayerDuration: {
    color: '#D0FD3E',
    fontSize: 18,
  },
  closeVideoButton: {
    backgroundColor: '#D0FD3E',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeVideoText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoThumbnailImg: {
    width: 80,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
    backgroundColor: 'rgba(208,253,62,0.1)',
  },
  videoChannel: {
    color: '#896CFE',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  articleImageReal: {
    width: 140,
    height: 90,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: 'rgba(176,162,242,0.3)',
  },
});