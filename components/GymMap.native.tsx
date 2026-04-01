import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, 
  TextInput, ScrollView, Platform, Linking, Image 
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { auth } from "../firebaseConfig";

interface LocationType {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface GymMarker {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  type: string;
  isOpen: boolean;
}

// Dark map style matching the Figma design
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

export default function MapaScreen() {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedGym, setSelectedGym] = useState<GymMarker | null>(null);
  const mapRef = useRef<MapView>(null);

  // Sample gym markers (will be relative to user's location)
  const [nearbyGyms, setNearbyGyms] = useState<GymMarker[]>([]);

  const generateNearbyGyms = (lat: number, lng: number) => {
    const gyms: GymMarker[] = [
      {
        id: '1', name: 'PowerFit Gym', address: 'Calle Principal 123',
        latitude: lat + 0.003, longitude: lng + 0.002,
        rating: 4.8, type: 'gym', isOpen: true,
      },
      {
        id: '2', name: 'CrossFit Box Elite', address: 'Av. Deportiva 456',
        latitude: lat - 0.002, longitude: lng + 0.004,
        rating: 4.5, type: 'crossfit', isOpen: true,
      },
      {
        id: '3', name: 'Yoga & Wellness Center', address: 'Plaza Central 789',
        latitude: lat + 0.005, longitude: lng - 0.003,
        rating: 4.9, type: 'yoga', isOpen: false,
      },
      {
        id: '4', name: 'FitBody Training Studio', address: 'Blvd. Fitness 321',
        latitude: lat - 0.004, longitude: lng - 0.002,
        rating: 4.3, type: 'gym', isOpen: true,
      },
      {
        id: '5', name: 'MMA Fight Club', address: 'Calle del Combate 654',
        latitude: lat + 0.001, longitude: lng + 0.006,
        rating: 4.7, type: 'mma', isOpen: true,
      },
      {
        id: '6', name: 'Pilates Studio Pro', address: 'Av. Bienestar 987',
        latitude: lat - 0.005, longitude: lng + 0.001,
        rating: 4.6, type: 'yoga', isOpen: false,
      },
    ];
    setNearbyGyms(gyms);
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso de ubicación denegado');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        const loc = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        };
        setLocation(loc);
        generateNearbyGyms(loc.latitude, loc.longitude);
      } catch (error) {
        setErrorMsg('Error al obtener la ubicación');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const centerMap = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      setLocation(newLocation);
      mapRef.current?.animateToRegion(newLocation, 1000);
    } catch (error) {
      console.error('Error al centrar mapa:', error);
    }
  };

  const getFilteredGyms = () => {
    let filtered = nearbyGyms;
    
    if (activeFilter === 'open') {
      filtered = filtered.filter(g => g.isOpen);
    } else if (activeFilter === 'top') {
      filtered = filtered.filter(g => g.rating >= 4.5);
    } else if (activeFilter === 'gym') {
      filtered = filtered.filter(g => g.type === 'gym');
    }
    
    if (searchText) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filters = [
    { key: 'all', label: '🏢 Todos' },
    { key: 'open', label: '🟢 Abiertos' },
    { key: 'top', label: '⭐ Top Rated' },
    { key: 'gym', label: '🏋️ Gym' },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#D0FD3E" />
          <Text style={styles.loadingText}>Buscando tu ubicación...</Text>
          <Text style={styles.loadingSubText}>Esto puede tomar un momento</Text>
        </View>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <View style={styles.errorCard}>
          <Text style={styles.errorEmoji}>📍</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Text style={styles.errorSubText}>Necesitamos tu ubicación para mostrar gimnasios cercanos</Text>
          <TouchableOpacity style={styles.retryButton} onPress={centerMap}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const filteredGyms = getFilteredGyms();

  return (
    <View style={styles.container}>
      {/* Search Bar Overlay */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar gimnasios..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Filter chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.activeFilterChip]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterText, activeFilter === f.key && styles.activeFilterText]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={location}
          showsUserLocation={true}
          showsMyLocationButton={false}
          customMapStyle={darkMapStyle}
          onPress={() => setSelectedGym(null)}
        >
          {/* User location circle */}
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={200}
            strokeColor="rgba(208, 253, 62, 0.3)"
            fillColor="rgba(208, 253, 62, 0.05)"
          />

          {/* Gym markers */}
          {filteredGyms.map((gym) => (
            <Marker
              key={gym.id}
              coordinate={{
                latitude: gym.latitude,
                longitude: gym.longitude,
              }}
              title={gym.name}
              description={gym.address}
              pinColor={gym.isOpen ? '#D0FD3E' : '#666'}
              onPress={() => setSelectedGym(gym)}
            />
          ))}
        </MapView>
      )}

      {/* Center button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerMap}>
        <Text style={styles.centerButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Selected gym card */}
      {selectedGym && (
        <View style={styles.gymCard}>
          <View style={styles.gymCardHeader}>
            <View style={styles.gymCardIcon}>
              <Text style={styles.gymCardIconText}>
                {selectedGym.type === 'yoga' ? '🧘' : selectedGym.type === 'crossfit' ? '🏋️' : selectedGym.type === 'mma' ? '🥊' : '💪'}
              </Text>
            </View>
            <View style={styles.gymCardInfo}>
              <Text style={styles.gymCardName}>{selectedGym.name}</Text>
              <Text style={styles.gymCardAddress}>{selectedGym.address}</Text>
            </View>
          </View>
          <View style={styles.gymCardMeta}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {selectedGym.rating}</Text>
            </View>
            <View style={[styles.statusBadge, !selectedGym.isOpen && styles.closedBadge]}>
              <Text style={[styles.statusText, !selectedGym.isOpen && styles.closedText]}>
                {selectedGym.isOpen ? '🟢 Abierto' : '🔴 Cerrado'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.directionsBtn}
            onPress={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedGym.latitude},${selectedGym.longitude}`;
              Linking.openURL(url);
            }}
          >
            <Text style={styles.directionsBtnText}>🧭 Cómo llegar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Gym count */}
      <View style={styles.gymCountBadge}>
        <Text style={styles.gymCountText}>{filteredGyms.length} gimnasios encontrados</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 30,
  },
  loadingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    color: '#D0FD3E',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubText: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  errorEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  errorSubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: '#D0FD3E',
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Search overlay
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(17, 17, 17, 0.85)',
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(208, 253, 62, 0.15)',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFF',
  },
  filtersScroll: {
    marginTop: 10,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#D0FD3E',
  },
  filterText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#000',
  },
  // Center button
  centerButton: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(208, 253, 62, 0.2)',
  },
  centerButtonText: {
    fontSize: 22,
  },
  // Gym card
  gymCard: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(208, 253, 62, 0.1)',
  },
  gymCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  gymCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(137, 108, 254, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymCardIconText: {
    fontSize: 26,
  },
  gymCardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  gymCardName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gymCardAddress: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 3,
  },
  gymCardMeta: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  ratingBadge: {
    backgroundColor: 'rgba(208, 253, 62, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingText: {
    color: '#D0FD3E',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  closedBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  closedText: {
    color: '#FF6B6B',
  },
  directionsBtn: {
    backgroundColor: '#D0FD3E',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  directionsBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Gym count
  gymCountBadge: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gymCountText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
});