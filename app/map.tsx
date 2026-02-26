import React, { useEffect, useState, useRef } from "react";
import {
  View, StyleSheet, Dimensions, ActivityIndicator,
  Text, TouchableOpacity, TextInput, Platform, Keyboard
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlaceService } from "../services/placeService";
import { getDistance } from "../utils/distance";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const [places, setPlaces] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let curLoc = null;
      if (status === 'granted') {
        curLoc = await Location.getCurrentPositionAsync({});
        setLocation(curLoc.coords);
      }

      const [data, favStore] = await Promise.all([
        PlaceService.getPlaces(),
        AsyncStorage.getItem("favorites")
      ]);

      const favIds = favStore ? JSON.parse(favStore).map((f: any) => f.id) : [];
      setFavorites(favIds);
      setPlaces(data);

      if (curLoc && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: curLoc.coords.latitude,
          longitude: curLoc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = places.map(p => {
        const d = location
          ? getDistance(location.latitude, location.longitude, parseFloat(p.latitude), parseFloat(p.longitude))
          : null;
        return { ...p, distance: d };
      }).filter(p =>
        p.name.toLowerCase().includes(text.toLowerCase()) ||
        p.type.toLowerCase().includes(text.toLowerCase())
      );

      const sorted = filtered.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      setSuggestions(sorted.slice(0, 5));
    }
  };

  const selectSuggestion = (place: any) => {
    setSearchQuery(place.name);
    setSuggestions([]);
    Keyboard.dismiss();
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }, 1000);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#5856D6" />
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        onPress={() => Keyboard.dismiss()}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 13.7563,
          longitude: location?.longitude || 100.5018,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {places.map((place) => {
          const isFav = favorites.includes(place.id);
          return (
            <Marker
              key={place.id}
              coordinate={{
                latitude: parseFloat(place.latitude),
                longitude: parseFloat(place.longitude),
              }}
              pinColor={isFav ? "#FF2D55" : "#5856D6"}
            >
              <Callout onPress={() => router.push(`/place/${place.id}`)}>
                <View style={styles.callout}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.calloutTitle}>{place.name}</Text>
                    {isFav && <Ionicons name="heart" size={14} color="#FF2D55" style={{ marginLeft: 5 }} />}
                  </View>
                  <Text style={styles.calloutSubtitle}>{place.type} • คลิกดูข้อมูล</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* 🔍 Search UI: ปรับให้ยาวเต็มจอ สวยๆ เลยแม่ */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            placeholder="ค้นหายิม, สนามกีฬา..."
            style={styles.input}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => {
              handleSearch(""); // ล้างคำค้นหา
              Keyboard.dismiss(); // ✅ ปิดแป้นพิมพ์ทันที
            }}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* รายการแนะนำ */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionList}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => selectSuggestion(item)}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location-sharp" size={16} color="#5856D6" />
                    <Text style={styles.suggestionText} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={styles.distanceSubText}>{item.type} • {item.city}</Text>
                </View>

                {item.distance !== null && (
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ✅ ปรับให้ลอยกลางจอแบบสมดุล
  searchWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 20, // ปรับลงมานิดหน่อยเพราะไม่มีปุ่ม Back แล้ว
    left: 15,
    right: 15,
    zIndex: 100,
  },
  searchBox: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1C1C1E',
  },
  suggestionList: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginTop: 8,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  suggestionText: { marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  distanceSubText: { fontSize: 12, color: '#8E8E93', marginLeft: 24, marginTop: 2 },
  distanceBadge: { backgroundColor: '#E8E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 11, fontWeight: 'bold', color: '#5856D6' },
  callout: { padding: 5, minWidth: 140 },
  calloutTitle: { fontWeight: "bold", fontSize: 14, color: '#1C1C1E' },
  calloutSubtitle: { fontSize: 12, color: '#8E8E93' },
});