import React from "react";
import { View, StyleSheet, ActivityIndicator, Keyboard, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { useMapData } from "../hooks/useMapData";
import { MapSearchBar, PlaceMarker, NearbyButton } from "../components/MapUI";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const router = useRouter();
  
  // ✅ ดึงค่ามาจาก useMapData ทั้งหมดในที่เดียว
  const { 
    filteredPlaces, 
    favorites, 
    searchQuery, 
    suggestions, 
    location, 
    loading, 
    mapRef, 
    handleSearch, 
    selectSuggestion,
    isNearbyFilter,
    toggleNearbyFilter 
  } = useMapData();

  // แสดง Loading ถ้ายังโหลดไม่เสร็จ
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5856D6" />
      </View>
    );
  }

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
        showsUserLocation
      >
        {/* ✅ วาด Marker จากสถานที่ที่ผ่านการกรองแล้ว (5km หรือ ทั้งหมด) */}
        {filteredPlaces.map((place) => (
          <PlaceMarker 
            key={place.id} 
            place={place} 
            isFav={favorites.includes(place.id)} 
            onPress={(id: string) => router.push(`/place/${id}`)}
          />
        ))}
      </MapView>

      {/* ส่วนค้นหา */}
      <MapSearchBar 
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        suggestions={suggestions}
        selectSuggestion={selectSuggestion}
      />

      {/* ✅ ปุ่มกรองระยะ 5km */}
      <NearbyButton 
        isActive={isNearbyFilter} 
        onPress={toggleNearbyFilter} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});