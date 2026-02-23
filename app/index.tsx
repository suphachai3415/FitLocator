import { View, FlatList, TextInput, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import PlaceCard from "../components/PlaceCard";
import { usePlaces } from "../hooks/usePlaces";
import { useFavorites } from "../hooks/useFavorites";
import { COLORS } from "../constants/colors";

export default function HomeScreen() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const { places, loading, error, loadPlaces } = usePlaces();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    loadPlaces(""); // โหลดค่าเริ่มต้น
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหายิม, สนามกีฬา, สวน..."
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={() => loadPlaces(keyword)}
          returnKeyType="search"
        />
        {keyword !== "" && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => { setKeyword(""); loadPlaces(""); }}>
            <Text style={{ color: '#999' }}>✖</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 8 }}>กำลังค้นหาในพื้นที่...</Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceCard 
            place={item} 
            distance={item.distance}
            isFavorite={isFavorite(item.id)}
            onFavoritePress={() => toggleFavorite(item)}
            onMapPress={() => router.push({
              pathname: "/map",
              params: { lat: item.latitude, lng: item.longitude, name: item.name }
            })}
          />
        )}
        ListEmptyComponent={!loading && <Text style={styles.emptyText}>ไม่พบสถานที่ใกล้คุณ</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 16 },
  searchWrapper: { marginTop: 15, marginBottom: 15, position: 'relative' },
  searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 25, elevation: 3, paddingRight: 40 },
  clearBtn: { position: 'absolute', right: 15, top: 12 },
  center: { alignItems: 'center', marginTop: 20 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' }
});