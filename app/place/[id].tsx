import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, 
  ScrollView, Linking, Platform, ActivityIndicator, Image 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter, Stack } from "expo-router"; 
import { Ionicons } from "@expo/vector-icons";
import { PlaceService } from "../../services/placeService"; 
import { LinearGradient } from "expo-linear-gradient";

export default function PlaceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchDetail();
    checkFavoriteStatus();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const data = await PlaceService.getPlaceById(id as string);
      setPlace(data);
    } catch (e) {
      Alert.alert("Error", "ไม่พบข้อมูลสถานที่");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const stored = await AsyncStorage.getItem("favorites");
    if (stored) {
      const favs = JSON.parse(stored);
      setIsFavorite(favs.some((f: any) => f.id === id));
    }
  };

  const handleFavoriteAction = async () => {
    const stored = await AsyncStorage.getItem("favorites");
    let favs = stored ? JSON.parse(stored) : [];
    if (isFavorite) {
      favs = favs.filter((f: any) => f.id !== id);
    } else {
      favs.push({ id: place.id, name: place.name, latitude: place.latitude, longitude: place.longitude });
    }
    await AsyncStorage.setItem("favorites", JSON.stringify(favs));
    setIsFavorite(!isFavorite);
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#5856D6" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: place?.name || "", 
          headerTitleAlign: 'center',
          headerBackTitle: "Fitlocator",
        }} 
      />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.header}>
          {place?.image_url ? (
            <Image source={{ uri: place.image_url }} style={styles.headerImage} />
          ) : (
            <LinearGradient colors={["#5856D6", "#8583E1"]} style={styles.headerImage}>
              <Ionicons name="fitness" size={60} color="white" />
            </LinearGradient>
          )}
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.categoryText}>{place?.type?.toUpperCase()} • {place?.city}</Text>
          <Text style={styles.title}>{place?.name}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-sharp" size={20} color="#5856D6" />
            <Text style={styles.infoText}>{place?.address}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailBox}>
            <View style={styles.detailItem}>
              <View style={styles.smallIconBg}><Ionicons name="time-outline" size={20} color="#5856D6" /></View>
              <Text style={styles.detailText}>เปิด: {place?.opening_hours}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.smallIconBg}><Ionicons name="call-outline" size={20} color="#5856D6" /></View>
              <Text style={styles.detailText}>โทร: {place?.phone}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.mapBtn} onPress={() => {
            const url = Platform.select({
              ios: `maps:0,0?q=${place.name}@${place.latitude},${place.longitude}`,
              android: `geo:${place.latitude},${place.longitude}?q=${place.name}`
            });
            Linking.openURL(url!);
          }}>
            <Ionicons name="navigate-circle" size={24} color="white" style={{marginRight: 8}} />
            <Text style={styles.btnText}>นำทางไปยังสถานที่</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.favBtn, {backgroundColor: isFavorite ? '#FF3B30' : '#007AFF'}]} 
            onPress={handleFavoriteAction}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color="white" style={{marginRight: 8}} />
            <Text style={styles.btnText}>{isFavorite ? "ลบจากรายการโปรด" : "เพิ่มเป็นรายการโปรด"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5856D6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { height: 250, backgroundColor: "#E5E5EA", borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  headerImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  contentCard: { flex: 1, backgroundColor: "#F8F9FA", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, marginTop: -30, minHeight: 500 },
  categoryText: { fontSize: 13, fontWeight: "bold", color: "#5856D6", marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "bold", color: "#1C1C1E", marginBottom: 15 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  infoText: { fontSize: 15, color: "#666", marginLeft: 8, flex: 1 },
  divider: { height: 1, backgroundColor: "#E5E5EA", marginBottom: 25 },
  detailBox: { marginBottom: 30 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  smallIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E8E7FF", justifyContent: "center", alignItems: "center" },
  detailText: { fontSize: 16, color: "#444", marginLeft: 12 },
  mapBtn: { backgroundColor: "#34C759", height: 55, borderRadius: 15, flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  favBtn: { height: 55, borderRadius: 15, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  btnText: { color: "white", fontSize: 16, fontWeight: "bold" }
});