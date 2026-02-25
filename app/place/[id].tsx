import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, 
  SafeAreaView, Linking, Platform, ScrollView 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// ✅ นำเข้า Stack เพื่อจัดการ Header
import { useLocalSearchParams, useRouter, Stack } from "expo-router"; 
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function PlaceDetail() {
  const { id, name, lat, lng } = useLocalSearchParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // กำหนดชื่อสถานที่ ถ้าไม่มีให้โชว์เป็น ID แทน
  const placeName = name ? String(name) : `สนามกีฬา ${id}`;

  useEffect(() => {
    checkFavoriteStatus();
  }, [id]);

  const checkFavoriteStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      if (stored) {
        const favorites = JSON.parse(stored);
        setIsFavorite(favorites.some((item: any) => item.id === id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openInGoogleMaps = () => {
    const latLng = `${lat},${lng}`;
    const url = Platform.OS === 'android' 
      ? `geo:0,0?q=${latLng}(${placeName})` 
      : `maps:0,0?q=${placeName}&ll=${latLng}`;

    Linking.openURL(url).catch((err) => 
      Alert.alert("Error", "ไม่สามารถเปิดแอปแผนที่ได้")
    );
  };

  const handleFavoriteAction = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      let favorites = stored ? JSON.parse(stored) : [];
      if (isFavorite) {
        favorites = favorites.filter((item: any) => item.id !== id);
        setIsFavorite(false);
        Alert.alert("เรียบร้อย", "ลบออกจากรายการโปรดแล้ว");
      } else {
        favorites.push({ id, name: placeName, lat, lng });
        setIsFavorite(true);
        Alert.alert("สำเร็จ", "เพิ่มในรายการโปรดแล้ว ❤️");
      }
      await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
    } catch (e) {
      Alert.alert("Error", "จัดการรายการโปรดไม่ได้");
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ จุดสำคัญ: สั่งเปลี่ยนชื่อบน Tab ด้านบนที่นี่! */}
      <Stack.Screen 
        options={{ 
          title: placeName, 
          headerShown: true,
          headerStyle: { backgroundColor: "#5856D6" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerBackTitle: "ย้อนกลับ"
        }} 
      />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* --- ส่วนหัวไล่สี --- */}
        <LinearGradient
          colors={["#5856D6", "#8583E1"]}
          style={styles.headerBackground}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="football" size={60} color="white" />
          </View>
        </LinearGradient>

        {/* --- ส่วนเนื้อหา --- */}
        <View style={styles.contentCard}>
          <Text style={styles.categoryText}>STADIUM & SPORTS CENTER</Text>
          <Text style={styles.title}>{placeName}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={18} color="#5856D6" />
            <Text style={styles.locationText}>พิกัด: {lat}, {lng}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailBox}>
            <Text style={styles.sectionLabel}>ข้อมูลติดต่อและเวลาทำการ</Text>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>เวลาเปิด: 08:00 - 22:00 น.</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.detailText}>ติดต่อ: 02-xxx-xxxx</Text>
            </View>
          </View>

          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.mapBtn} onPress={openInGoogleMaps}>
              <Ionicons name="navigate" size={22} color="white" style={{marginRight: 8}} />
              <Text style={styles.mapBtnText}>นำทางไปยังสถานที่</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.favBtn, isFavorite ? styles.removeBtn : styles.addBtn]} 
              onPress={handleFavoriteAction}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={22} 
                color="white" 
                style={{marginRight: 8}} 
              />
              <Text style={styles.buttonText}>
                {isFavorite ? "ลบจากรายการโปรด" : "เพิ่มเป็นรายการโปรด"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5856D6" },
  headerBackground: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentCard: {
    minHeight: 500,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
  },
  categoryText: { fontSize: 12, fontWeight: "bold", color: "#5856D6", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "bold", color: "#1C1C1E", marginBottom: 12 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  locationText: { fontSize: 15, color: "#8E8E93", marginLeft: 6 },
  divider: { width: "100%", height: 1, backgroundColor: "#E5E5EA", marginBottom: 25 },
  sectionLabel: { fontSize: 16, fontWeight: "bold", color: "#1C1C1E", marginBottom: 15 },
  detailBox: { marginBottom: 30 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  detailText: { fontSize: 16, color: "#444", marginLeft: 12 },
  actionGroup: { marginTop: 20 },
  mapBtn: {
    backgroundColor: "#34C759",
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
  },
  mapBtnText: { color: "white", fontSize: 17, fontWeight: "bold" },
  favBtn: {
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  addBtn: { backgroundColor: "#007AFF" },
  removeBtn: { backgroundColor: "#FF3B30" },
  buttonText: { color: "white", fontSize: 17, fontWeight: "bold" },
});