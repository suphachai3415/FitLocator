import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import placesData from "../data/places.json";
import { getDistance } from "../utils/distance";
import { Ionicons } from "@expo/vector-icons";

interface Place {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  distance?: number;
}

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const updated = placesData.map((place: Place) => {
        const distance = getDistance(
          latitude,
          longitude,
          place.latitude,
          place.longitude
        );
        return { ...place, distance };
      });

      // เรียงจากใกล้ไปไกล
      updated.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      setPlaces(updated.slice(0, 10));
    } catch (error) {
      console.error("Error loading location", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const renderPlace = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        // *** จุดที่ปรับปรุง: ส่ง params ไปให้ครบเพื่อเปิด Google Maps ในหน้า Detail ***
        router.push({
          pathname: "/place/[id]",
          params: { 
            id: item.id, 
            name: item.name,
            lat: item.latitude,
            lng: item.longitude
          },
        })
      }
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
           <Ionicons name="location" size={20} color="#007AFF" />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

        <View style={styles.row}>
          <Ionicons name="business-outline" size={14} color="#666" />
          <Text style={styles.city}>{item.city}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="navigate-outline" size={14} color="#007AFF" />
          <Text style={styles.distance}>
            {item.distance?.toFixed(2)} km จากตำแหน่งของคุณ
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#bbb" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>Nearby Sports</Text>
        <Text style={styles.subHeader}>ค้นหาสถานที่ออกกำลังกายใกล้คุณ</Text>
      </View>

      {/* Quick Access Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push("/map")}
        >
          <Ionicons name="map" size={20} color="#fff" />
          <Text style={styles.buttonText}>แผนที่</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => router.push("/favorites")}
        >
          <Ionicons name="heart" size={20} color="#fff" />
          <Text style={styles.buttonText}>Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>Top 10 ใกล้คุณ</Text>
        {loading && <ActivityIndicator size="small" color="#007AFF" />}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" color="#007AFF" />
           <Text style={styles.loadingText}>กำลังคำนวณระยะทาง...</Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={renderPlace}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>ไม่พบสถานที่ใกล้เคียงในขณะนี้</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  headerSection: {
    marginTop: 60,
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  subHeader: {
    fontSize: 15,
    color: "#777",
    marginTop: 4,
  },
  topButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 25,
  },
  mapButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconContainer: {
    marginRight: 15,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  city: {
    marginLeft: 6,
    fontSize: 13,
    color: "#666",
  },
  distance: {
    marginLeft: 6,
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  }
});