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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const data = await PlaceService.getPlaces();
      const updated = data.map((place: any) => ({
        ...place,
        distance: getDistance(latitude, longitude, place.latitude, place.longitude)
      }));

      // เรียงลำดับตามระยะทางและดึงมาโชว์ 10 อันดับแรก
      setPlaces(updated.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)).slice(0, 10));
    } catch (error) {
      console.error(error);
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
              {/* ส่วน Logo */}
              <View style={styles.topLogoRow}>
                <Ionicons name="flash" size={24} color="#5856D6" />
                <Text style={styles.logoText}>FITLOCATOR</Text>
              </View>

              {/* รูปสไลด์ */}
              <View style={styles.carouselContainer}>
                <ImageCarousel />
              </View>

              {/* ปุ่มกดเมนูทางลัด */}
              <View style={styles.topButtons}>
                <TouchableOpacity style={styles.mapBtn} onPress={() => router.push("/map")}>
                  <LinearGradient colors={["#1C1C1E", "#3A3A3C"]} style={styles.innerBtnGradient}>
                    <Ionicons name="map" size={18} color="white" />
                    <Text style={styles.btnText}>ดูแผนที่</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.favBtn} onPress={() => router.push("/favorites")}>
                  <LinearGradient colors={["#FF2D55", "#FF5E7D"]} style={styles.innerBtnGradient}>
                    <Ionicons name="heart" size={18} color="white" />
                    <Text style={styles.btnText}>รายการโปรด</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* ✅ ส่วนหัวข้อ List ที่ปรับใหม่ให้ "เริ่ด" ขึ้น */}
              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.sectionTitle}>สถานที่ใกล้ตัวคุณ</Text>
                  <View style={styles.subTitleRow}>
                    <Ionicons name="navigate-circle" size={14} color="#5856D6" />
                    <Text style={styles.subTitleText}>10 อันดับที่ใกล้พิกัดปัจจุบันที่สุด</Text>
                  </View>
                </View>
                
                {loading && !refreshing ? (
                  <ActivityIndicator size="small" color="#5856D6" />
                ) : (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{places.length} แห่ง</Text>
                  </View>
                )}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <PlaceCard 
              item={item} 
              onPress={() => router.push(`/place/${item.id}`)} 
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5856D6" />}
          ListEmptyComponent={!loading ? <Text style={styles.emptyText}>ไม่พบข้อมูลในบริเวณนี้</Text> : null}
          contentContainerStyle={{ paddingBottom: 30 }}
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
    height: width * 1.0, 
  },
  headerWrapper: { paddingHorizontal: 20 },
  topLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#5856D6',
    marginLeft: 5,
    letterSpacing: 2,
  },
  carouselContainer: {
    marginBottom: 15,
  },
  topButtons: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 30 
  },
  mapBtn: { flex: 1, height: 58, borderRadius: 18, overflow: 'hidden', elevation: 4 },
  favBtn: { flex: 1, height: 58, borderRadius: 18, overflow: 'hidden', elevation: 4 },
  innerBtnGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "white", marginLeft: 8, fontWeight: "700", fontSize: 15 },
  
  // ✅ Styles ส่วนหัวข้อใหม่
  listHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: "#1C1C1E",
    letterSpacing: -0.5 
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subTitleText: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 4,
    fontWeight: "500",
  },
  countBadge: {
    backgroundColor: '#E8E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countText: {
    color: '#5856D6',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#AEAEB2', fontSize: 16 },
});