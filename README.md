<div align="center">

  <img src="assets/images/icon.png" alt="GymApp Logo" width="120" height="120" style="border-radius: 24px"/>

  <h1>💪 GymApp</h1>

  <p><strong>Tu compañero de entrenamiento inteligente</strong></p>
  <p>Aplicación móvil de fitness desarrollada con React Native y Expo</p>

  <br/>

  ![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=for-the-badge&logo=expo&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

  <br/>

  ![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green?style=flat-square)
  ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
  ![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=flat-square)

</div>

---

## 📖 Descripción

**GymApp** es una aplicación móvil multiplataforma orientada al fitness que integra en un solo lugar todo lo que necesitas para mejorar tu rendimiento físico:

- 🏋️ Explorar ejercicios organizados por grupo muscular con videos demostrativos
- 💬 Comunicarte con otros usuarios mediante chat en tiempo real
- 🗺️ Encontrar gimnasios cercanos con geolocalización GPS
- 👤 Gestionar tu perfil personal y seguir tu progreso

Desarrollada como proyecto académico universitario con tecnologías de nivel profesional.

---

## ✨ Características Principales

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Autenticación** | Login con correo/contraseña y Google Sign-In via Firebase |
| 💪 **Ejercicios** | Catálogo completo por grupo muscular con videos YouTube |
| 💬 **Chat** | Mensajería en tiempo real con Firestore (grupos y privado) |
| 🗺️ **Mapa** | Mapa interactivo con ubicación GPS y gimnasios marcados |
| 👤 **Perfil** | Perfil editable con estadísticas de actividad del usuario |
| 📳 **Hápticos** | Retroalimentación táctil al navegar entre pantallas |

---

## 🛠️ Tecnologías y Dependencias

### Core
```
React Native 0.81.5    → Framework principal
Expo ~54.0.33          → Plataforma de desarrollo y despliegue
Expo Router ~6.0.23    → Navegación basada en el sistema de archivos
TypeScript ~5.9.2      → Tipado estático
```

### Backend & Base de Datos
```
Firebase 12.x          → Autenticación y base de datos
Firestore              → Chat en tiempo real y datos de usuario
Google Sign-In         → Autenticación con cuenta Google
```

### UI & Navegación
```
React Navigation 7.x          → Navegación por pestañas
@expo/vector-icons 15.x       → Iconografía
React Native Reanimated ~4.1  → Animaciones fluidas
React Native Gesture Handler  → Gestos táctiles
```

### Mapas & Ubicación
```
React Native Maps 1.20.1      → Mapa interactivo
Expo Location ~19.0.8         → Acceso a GPS del dispositivo
```

---

## 📂 Estructura del Proyecto

```
GymApp/
├── 📁 app/                        # Pantallas principales (Expo Router)
│   ├── 📁 (tabs)/                 # Navegación por pestañas
│   │   ├── index.tsx              # 💪 Pantalla de Ejercicios
│   │   ├── chat.tsx               # 💬 Pantalla de Chat
│   │   ├── mapa.tsx               # 🗺️ Pantalla de Mapa
│   │   ├── perfil.tsx             # 👤 Pantalla de Perfil
│   │   └── _layout.tsx            # Configuración Bottom Tabs
│   ├── _layout.tsx                # Layout raíz de la app
│   ├── signup.tsx                 # Pantalla de Registro
│   └── modal.tsx                  # Modal genérico
│
├── 📁 components/                 # Componentes reutilizables
│   ├── GymMap.native.tsx          # Mapa para dispositivos nativos
│   ├── GymMap.web.tsx             # Mapa para versión web
│   ├── haptic-tab.tsx             # Tab con retroalimentación háptica
│   └── ...
│
├── 📁 assets/                     # Imágenes, íconos y fuentes
├── 📁 constants/                  # Colores y constantes globales
├── 📁 hooks/                      # Custom hooks de React
├── firebaseConfig.ts              # ⚙️ Configuración de Firebase
├── app.json                       # ⚙️ Configuración de Expo
├── eas.json                       # ⚙️ Configuración de EAS Build
└── package.json                   # 📦 Dependencias del proyecto
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [Git](https://git-scm.com/)
- Cuenta de [Firebase](https://firebase.google.com/) configurada
- [Expo Go](https://expo.dev/go) instalado en tu celular (para pruebas rápidas)

### 1. Clonar el repositorio

```bash
git clone https://github.com/JoseDiazLopez88/GymApp.git
cd GymApp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

Descarga el archivo `google-services.json` de tu proyecto Firebase y colócalo en la raíz del proyecto.

### 4. Iniciar el servidor de desarrollo

```bash
npx expo start
```

Luego:
- 📱 **Android físico:** Escanea el código QR con la app Expo Go
- 💻 **Emulador:** Presiona `a` en la terminal para abrir en Android
- 🌐 **Web:** Presiona `w` para abrir en el navegador

---

## 📱 Compilar para Android (APK)

Este proyecto usa **EAS Build** para generar el APK de Android:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Iniciar sesión en Expo
eas login

# Generar APK (perfil preview)
eas build --platform android --profile preview
```

El APK se descarga desde el dashboard de [Expo](https://expo.dev).

---

## 🔑 Variables de Entorno y Configuración

El archivo `firebaseConfig.ts` contiene la configuración de Firebase. Asegúrate de tener:

```
✅ google-services.json     → En la raíz del proyecto
✅ Firebase Authentication  → Habilitado (Email + Google)
✅ Firestore Database        → Modo producción con reglas configuradas
✅ Google Maps API Key       → En app.json (android.config.googleMaps.apiKey)
```

---



## 🤝 Equipo de Desarrollo

Proyecto desarrollado por estudiantes como proyecto universitario:

| Nombre | Rol |
|--------|-----|
| Jeyner Chilón | Desarrollador Frontend |
| Jeyner Chilón | Desarrollador Backend |
| Jose Diaz | Diseño UX/UI |
| Jose Diaz | QA & Documentación |

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con ❤️ y mucho café ☕**

⭐ Si te gustó el proyecto, dale una estrella en GitHub ⭐

</div>
