import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Linking, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import placesData from "../data/places.json";
import { getDistance } from "../utils/distance";
import { Ionicons } from "@expo/vector-icons";

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]); 
  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false); // ควบคุมการแสดงผลการค้นหา
  const [nearbyOnly, setNearbyOnly] = useState(false);

  useEffect(() => {
    startTracking();
    loadFavorites();
  }, []);

  useEffect(() => {
    if (userLocation) {
      const updated = placesData.map((place) => ({
        ...place,
        distance: getDistance(userLocation.latitude, userLocation.longitude, place.latitude, place.longitude),
      }));
      updated.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      setPlaces(updated);
    }
  }, [userLocation]);

  // ระบบกรองข้อมูล (ทำงานร่วมกันทั้ง Search และ Nearby)
  useEffect(() => {
    let result = [...places];
    if (search.trim() !== "") {
      result = result.filter((place) =>
        place.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (nearbyOnly) {
      result = result.filter((place) => place.distance !== undefined && place.distance <= 5);
    }
    setFilteredPlaces(result);
  }, [search, nearbyOnly, places]);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (loc) => setUserLocation(loc.coords)
    );
  };

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem("favorites");
    if (stored) setFavorites(JSON.parse(stored).map((f: any) => f.id));
  };

  const openNavigation = (place: any) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(place.name)}@${place.latitude},${place.longitude}`,
      android: `geo:${place.latitude},${place.longitude}?q=${encodeURIComponent(place.name)}`,
    });
    Linking.openURL(url!);
  };

  if (!userLocation) return <View style={styles.center}><Text>กำลังโหลดพิกัด...</Text></View>;

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.input}
            placeholder="ค้นหาสถานที่..."
            value={search}
            onChangeText={(t) => { 
              setSearch(t); 
              setShowSuggestions(true); // เปิด Suggestions เมื่อมีการพิมพ์
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {search !== "" && (
            <TouchableOpacity onPress={() => { setSearch(""); setShowSuggestions(false); }}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.nearbyBtn, nearbyOnly && styles.nearbyBtnActive]} 
          onPress={() => setNearbyOnly(!nearbyOnly)}
        >
          <Ionicons name={nearbyOnly ? "location" : "location-outline"} size={18} color="white" />
          <Text style={styles.nearbyText}>{nearbyOnly ? "กรอง 5 กม." : "ใกล้ฉัน (5km)"}</Text>
        </TouchableOpacity>
      </View>

      {/* รายการแนะนำผลการค้นหา (Suggestion List) - ส่วนที่หายไปเอากลับมาแล้ว */}
      {showSuggestions && search.length > 0 && (
        <View style={styles.suggestionsBox}>
          <FlatList
            data={filteredPlaces.slice(0, 5)} // แสดง 5 อันดับแรก
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  setSearch(item.name);
                  setShowSuggestions(false);
                  mapRef.current?.animateToRegion({
                    latitude: item.latitude,
                    longitude: item.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }}
              >
                <Ionicons name="pin-outline" size={16} color="#666" />
                <Text style={styles.suggestionText}>{item.name}</Text>
                <Text style={styles.suggestionDist}>{item.distance?.toFixed(1)} km</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={() => setShowSuggestions(false)} // ปิด Suggestions เมื่อแตะแผนที่
      >
        <Marker coordinate={userLocation} zIndex={10}>
          <View style={styles.userMarkerOuter}><View style={styles.userMarkerInner} /></View>
        </Marker>

        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            pinColor={favorites.includes(place.id) ? "red" : "blue"}
          >
            <Callout onPress={() => openNavigation(place)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{place.name}</Text>
                <Text style={styles.calloutDist}>{place.distance?.toFixed(2)} กม.</Text>
                <View style={styles.navBadge}><Text style={styles.navBadgeText}>🚗 กดเพื่อนำทาง</Text></View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.fab} onPress={() => mapRef.current?.animateToRegion({...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01})}>
        <Ionicons name="locate" size={30} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { position: "absolute", top: 50, left: 15, right: 15, zIndex: 10 },
  searchBar: {
    flexDirection: "row", backgroundColor: "white", borderRadius: 15,
    paddingHorizontal: 15, height: 50, alignItems: "center",
    elevation: 5, shadowOpacity: 0.1,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  nearbyBtn: {
    marginTop: 10, backgroundColor: "#666", flexDirection: "row", alignSelf: "flex-start",
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, alignItems: "center", elevation: 3,
  },
  nearbyBtnActive: { backgroundColor: "#007AFF" },
  nearbyText: { color: "white", fontWeight: "bold", marginLeft: 5 },

  // Suggestions Box Style
  suggestionsBox: {
    position: "absolute", top: 105, left: 15, right: 15,
    backgroundColor: "white", borderRadius: 15, zIndex: 11,
    elevation: 5, overflow: 'hidden'
  },
  suggestionItem: {
    flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee', alignItems: 'center'
  },
  suggestionText: { flex: 1, marginLeft: 10, fontSize: 15 },
  suggestionDist: { color: '#007AFF', fontSize: 12 },

  calloutContainer: { padding: 10, alignItems: "center", width: 150 },
  calloutTitle: { fontWeight: "bold", fontSize: 14, textAlign: 'center' },
  calloutDist: { color: "#007AFF", marginVertical: 4 },
  navBadge: { backgroundColor: "#34C759", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 5 },
  navBadgeText: { color: "white", fontSize: 11, fontWeight: "bold" },

  userMarkerOuter: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,122,255,0.2)", justifyContent: "center", alignItems: "center" },
  userMarkerInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#007AFF", borderWidth: 2, borderColor: "white" },
  fab: { position: "absolute", bottom: 30, right: 20, backgroundColor: "white", width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 5 },
});