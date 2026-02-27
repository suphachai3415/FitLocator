import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  searchQuery: string;
  handleSearch: (text: string) => void;
  suggestions: any[];
  selectSuggestion: (place: any) => void;
}

export const MapSearchBar = ({ searchQuery, handleSearch, suggestions, selectSuggestion }: SearchBarProps) => {
  return (
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
          {suggestions.map((item) => (
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
};

const styles = StyleSheet.create({
  searchWrapper: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 15, right: 15, zIndex: 100 },
  searchBox: { backgroundColor: 'white', height: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1C1C1E' },
  suggestionList: { backgroundColor: 'white', borderRadius: 15, marginTop: 8, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#F2F2F7' },
  suggestionText: { marginLeft: 8, fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  distanceSubText: { fontSize: 12, color: '#8E8E93', marginLeft: 24, marginTop: 2 },
  distanceBadge: { backgroundColor: '#E8E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 11, fontWeight: 'bold', color: '#5856D6' },
});