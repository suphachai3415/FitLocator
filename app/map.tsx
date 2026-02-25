import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, {
  Marker,
  AnimatedRegion,
  PROVIDER_GOOGLE,
  Callout,
} from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import placesData from "../data/places.json";
import { getDistance } from "../utils/distance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const followUser = useRef(true);

  // แก้จุดที่ 1: ใช้ any ครอบเพื่อให้ TypeScript ไม่บ่นเรื่อง AnimatedRegion properties
  const userLocationAnim = useRef<any>(
    new AnimatedRegion({
      latitude: 13.7563,
      longitude: 100.5018,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    })
  ).current;

  const [userLocation, setUserLocation] = useState<any>(null);
  const [initialRegion, setInitialRegion] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  useEffect(() => {
    initMap();
    loadFavorites();
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    const updated = placesData.map((place: any) => ({
      ...place,
      distance: getDistance(
        userLocation.latitude,
        userLocation.longitude,
        place.latitude,
        place.longitude
      ),
    }));
    updated.sort((a, b) => a.distance - b.distance);
    setPlaces(updated);
  }, [userLocation]);

  useEffect(() => {
    let result = [...places];
    if (search.trim()) {
      result = result.filter((place) =>
        place.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (nearbyOnly) {
      result = result.filter((place) => place.distance <= 5);
    }
    setFilteredPlaces(result);
  }, [places, search, nearbyOnly]);

  const initMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "กรุณาเปิด Location");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = location.coords;
      const region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setUserLocation(coords);
      setInitialRegion(region);
      userLocationAnim.setValue(region);

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 3,
        },
        (loc) => {
          const newCoords = loc.coords;
          setUserLocation(newCoords);

          // แก้จุดที่ 2: ใช้ as any เพื่อแก้ Error 'latitude' does not exist
          userLocationAnim
            .timing({
              toValue: {
                latitude: newCoords.latitude,
                longitude: newCoords.longitude,
              } as any,
              duration: 800,
              useNativeDriver: false,
            })
            .start();

          if (followUser.current && mapRef.current) {
            mapRef.current.animateCamera(
              {
                center: {
                  latitude: newCoords.latitude,
                  longitude: newCoords.longitude,
                },
                zoom: 16,
              },
              { duration: 800 }
            );
          }
        }
      );
    } catch (e) {
      Alert.alert("Error", "ไม่สามารถดึงตำแหน่งได้");
    }
  };

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem("favorites");
    if (stored) {
      const parsed = JSON.parse(stored);
      setFavorites(parsed.map((f: any) => f.id));
    }
  };

  const openNavigation = (place: any) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${place.latitude},${place.longitude}`,
      android: `geo:${place.latitude},${place.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  if (!initialRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>กำลังค้นหาตำแหน่ง...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="ค้นหาสถานที่..."
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setShowSuggestions(true);
              }}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* แก้จุดที่ 3: จัดระเบียบ Text ให้ไม่มีช่องว่างส่วนเกิน */}
      {showSuggestions && search.length > 0 && (
        <View style={styles.suggestionsBox}>
          <FlatList
            data={filteredPlaces.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  followUser.current = false;
                  mapRef.current?.animateCamera({
                    center: { latitude: item.latitude, longitude: item.longitude },
                    zoom: 16,
                  });
                  setShowSuggestions(false);
                }}
              >
                <View style={styles.suggestionRow}>
                  <Text style={styles.suggestionName}>{item.name}</Text>
                  <Text style={styles.suggestionDist}>{item.distance?.toFixed(1)} km</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        onTouchStart={() => { followUser.current = false; }}
      >
        <Marker.Animated
          coordinate={userLocationAnim as any}
        >
          <View style={styles.userMarkerOuter}>
            <View style={styles.userMarkerInner} />
          </View>
        </Marker.Animated>

        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            pinColor={favorites.includes(place.id) ? "#FF2D55" : "#007AFF"}
          >
            <Callout onPress={() => openNavigation(place)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{place.name}</Text>
                <Text style={styles.calloutText}>📍 {place.distance?.toFixed(2)} km</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          followUser.current = true;
          if (userLocation) {
            mapRef.current?.animateCamera(
              {
                center: { latitude: userLocation.latitude, longitude: userLocation.longitude },
                zoom: 16,
              },
              { duration: 800 }
            );
          }
        }}
      >
        <Ionicons name="locate" size={28} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { position: "absolute", top: 10, left: 15, right: 15, zIndex: 10 },
  headerRow: { flexDirection: "row", gap: 10 },
  backBtn: { width: 45, height: 45, backgroundColor: "white", borderRadius: 15, justifyContent: "center", alignItems: "center", elevation: 5 },
  searchBar: { flex: 1, flexDirection: "row", backgroundColor: "white", borderRadius: 15, paddingHorizontal: 15, alignItems: "center", elevation: 5 },
  input: { flex: 1, marginLeft: 10, height: 45 },
  suggestionsBox: { position: "absolute", top: 100, left: 15, right: 15, backgroundColor: "white", borderRadius: 15, zIndex: 11, elevation: 5, overflow: 'hidden' },
  suggestionItem: { padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  suggestionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestionName: { fontSize: 14, color: '#333' },
  suggestionDist: { color: "#007AFF", fontSize: 12, fontWeight: 'bold' },
  callout: { padding: 5, width: 140 },
  calloutTitle: { fontWeight: "bold", fontSize: 14 },
  calloutText: { fontSize: 12, color: '#666', marginTop: 2 },
  fab: { position: "absolute", bottom: 40, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "white", justifyContent: "center", alignItems: "center", elevation: 8 },
  userMarkerOuter: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,122,255,0.2)", justifyContent: "center", alignItems: "center" },
  userMarkerInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#007AFF", borderWidth: 2, borderColor: 'white' },
});