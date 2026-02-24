import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PlaceDetail() {
  const { id, name, lat, lng } = useLocalSearchParams(); // รับพิกัดเพิ่มมาด้วย
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  const placeName = name || `สนามกีฬา ${id}`;

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

  // ฟังก์ชันเปิด Google Maps
  const openInGoogleMaps = () => {
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
    const latLng = `${lat},${lng}`;
    const label = placeName;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // ถ้าไม่มีแอป Maps ให้เปิดผ่าน Browser แทน
          const browserUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          Linking.openURL(browserUrl);
        }
      });
    }
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
        favorites.push({ id, name: placeName, latitude: lat, longitude: lng });
        setIsFavorite(true);
        Alert.alert("สำเร็จ", "เพิ่มลงในรายการโปรดแล้ว ❤️");
      }
      await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
    } catch (e) {
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถจัดการรายการโปรดได้");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>รหัสสถานที่: {id}</Text>
        <Text style={styles.title}>{placeName}</Text>
        <View style={styles.divider} />
        
        {/* ปุ่มเปิดใน Google Maps */}
        <TouchableOpacity style={styles.mapBtn} onPress={openInGoogleMaps}>
          <Text style={styles.mapBtnText}>📍 เปิดใน Google Maps</Text>
        </TouchableOpacity>

        {/* ปุ่ม Favorite */}
        <TouchableOpacity 
          style={[styles.button, isFavorite ? styles.removeBtn : styles.addBtn]} 
          onPress={handleFavoriteAction}
        >
          <Text style={styles.buttonText}>
            {isFavorite ? "❤️ ลบออกจากรายการโปรด" : "🤍 เพิ่มในรายการโปรด"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "white", borderRadius: 25, padding: 30, alignItems: "center", elevation: 10 },
  label: { fontSize: 14, color: "#8E8E93", marginBottom: 5 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1C1C1E", textAlign: "center" },
  divider: { width: "50%", height: 1, backgroundColor: "#E5E5EA", marginVertical: 20 },
  
  mapBtn: {
    backgroundColor: "#34C759", // สีเขียวสไตล์ Google Maps
    width: "100%",
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  mapBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  
  button: { width: "100%", height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  addBtn: { backgroundColor: "#007AFF" },
  removeBtn: { backgroundColor: "#FF3B30" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  backBtn: { marginTop: 10 },
  backBtnText: { color: "#007AFF", fontSize: 16 },
});