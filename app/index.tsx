import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, RefreshControl, SafeAreaView, Dimensions 
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ImageCarousel from "../components/ImageCarousel"; 
import { getDistance } from "../utils/distance";
import { PlaceCard } from "../components/PlaceCard"; 
import { PlaceService } from "../services/placeService";

const { width } = Dimensions.get("window");

export default function Home() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);

      // 1. จัดการ GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      // 2. 🔥 ดึงข้อมูลผ่าน Service (Supabase)
      const data = await PlaceService.getPlaces();

      // 3. คำนวณระยะทาง
      const updated = data.map((place: any) => ({
        ...place,
        distance: getDistance(latitude, longitude, place.latitude, place.longitude)
      }));

      // เรียงลำดับและจัดเก็บ
     // updated.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
     // setPlaces(updated.slice(0, 10));

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#E8E7FF", "#F2F2F7", "#F8F9FB"]} style={styles.gradientHeader} />
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={places}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              <View style={styles.topLogoRow}>
                <Ionicons name="flash" size={24} color="#5856D6" />
                <Text style={styles.logoText}>FITLOCATOR</Text>
              </View>
              <ImageCarousel />
              <View style={styles.welcomeSection}>
                <Text style={styles.subtitle}>สนามกีฬาที่ใกล้คุณที่สุดตอนนี้</Text>
              </View>
              <View style={styles.topButtons}>
                <TouchableOpacity style={styles.mapBtn} onPress={() => router.push("/map")}>
                  <LinearGradient colors={["#1C1C1E", "#3A3A3C"]} style={styles.innerBtnGradient}>
                    <Ionicons name="map" size={18} color="white" /><Text style={styles.btnText}>ดูแผนที่</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.favBtn} onPress={() => router.push("/favorites")}>
                  <LinearGradient colors={["#FF2D55", "#FF5E7D"]} style={styles.innerBtnGradient}>
                    <Ionicons name="heart" size={18} color="white" /><Text style={styles.btnText}>รายการโปรด</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>10 อันดับใกล้คุณ</Text>
                {loading && !refreshing && <ActivityIndicator size="small" color="#5856D6" />}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <PlaceCard 
              item={item} 
              onPress={() => router.push({
                pathname: "/place/[id]",
                params: { id: item.id, name: item.name, lat: item.latitude, lng: item.longitude }
              })}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5856D6" />}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={!loading ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={styles.emptyText}>ไม่พบสถานที่ใกล้เคียง</Text>
              <TouchableOpacity onPress={loadData} style={{ marginTop: 10 }}>
                <Text style={{ color: '#5856D6' }}>ลองใหม่อีกครั้ง</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: width * 1.3, // ให้คลุมลงมาถึงช่วงปุ่ม
  },
  headerWrapper: { paddingHorizontal: 20 },
  topLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#5856D6',
    marginLeft: 5,
    letterSpacing: 2,
  },
  welcomeSection: { marginTop: 25, marginBottom: 20 },
  title: { fontSize: 36, fontWeight: "900", color: "#1C1C1E", letterSpacing: -1 },
  subtitle: { fontSize: 16, color: "#636366", marginTop: 4 },
  topButtons: { flexDirection: "row", gap: 12, marginBottom: 35 },
  mapBtn: { flex: 1, height: 58, borderRadius: 18, overflow: 'hidden', elevation: 5 },
  favBtn: { flex: 1, height: 58, borderRadius: 18, overflow: 'hidden', elevation: 5 },
  innerBtnGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "white", marginLeft: 8, fontWeight: "700", fontSize: 15 },
  listHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15 
  },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#1C1C1E" },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#AEAEB2' },
});