import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Keyboard } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. ย้าย Styles ขึ้นมาไว้ด้านบนสุด (หรือก่อน Component) เพื่อแก้ Error: styles used before declaration
const styles = StyleSheet.create({
  searchWrapper: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 15, right: 15, zIndex: 100 },
  searchBox: { backgroundColor: 'white', height: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1C1C1E' },
  suggestionList: { backgroundColor: 'white', borderRadius: 15, marginTop: 8, overflow: 'hidden', elevation: 10 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#F2F2F7' },
  suggestionText: { marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  distanceSubText: { fontSize: 12, color: '#8E8E93', marginLeft: 24 },
  distanceBadge: { backgroundColor: '#E8E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 11, fontWeight: 'bold', color: '#5856D6' },
  callout: { padding: 5, minWidth: 140 },
  calloutTitle: { fontWeight: "bold", fontSize: 14 },
  calloutSubtitle: { fontSize: 12, color: '#8E8E93' },
  
  // สไตล์ปุ่มใหม่
  nearbyBtn: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  nearbyBtnActive: { backgroundColor: '#5856D6' },
  nearbyText: { marginLeft: 8, fontWeight: 'bold', color: '#5856D6' },
  nearbyTextActive: { color: 'white' },
});

// ✅ 2. เพิ่ม Export NearbyButton (ต้องมีคำว่า export)
export const NearbyButton = ({ isActive, onPress }: any) => (
  <TouchableOpacity 
    style={[styles.nearbyBtn, isActive && styles.nearbyBtnActive]} 
    onPress={onPress}
  >
    <Ionicons 
      name={isActive ? "location" : "location-outline"} 
      size={20} 
      color={isActive ? "white" : "#5856D6"} 
    />
    <Text style={[styles.nearbyText, isActive && styles.nearbyTextActive]}>
      {isActive ? "ใกล้ฉัน (5km)" : "ทั้งหมด"}
    </Text>
  </TouchableOpacity>
);

export const MapSearchBar = ({ searchQuery, handleSearch, suggestions, selectSuggestion }: any) => (
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
        <TouchableOpacity onPress={() => { handleSearch(""); Keyboard.dismiss(); }}>
          <Ionicons name="close-circle" size={20} color="#8E8E93" />
        </TouchableOpacity>
      )}
    </View>
    {suggestions.length > 0 && (
      <View style={styles.suggestionList}>
        {suggestions.map((item: any) => (
          <TouchableOpacity key={item.id} style={styles.suggestionItem} onPress={() => selectSuggestion(item)}>
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
);

export const PlaceMarker = ({ place, isFav, onPress }: any) => (
  <Marker
    coordinate={{ latitude: parseFloat(place.latitude), longitude: parseFloat(place.longitude) }}
    pinColor={isFav ? "#FF2D55" : "#5856D6"}
  >
    <Callout onPress={() => onPress(place.id)}>
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