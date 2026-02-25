import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // เพิ่มไอคอน

export default function Favorites() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem("favorites");
    if (stored) setData(JSON.parse(stored));
  };

  // --- ฟังก์ชันลบออกจากรายการโปรด ---
  const removeFavorite = async (id: string) => {
    const updatedData = data.filter((item: any) => item.id !== id);
    setData(updatedData);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedData));
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("ยืนยันการลบ", `คุณต้องการลบ ${name} ออกจากรายการโปรดใช่หรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", onPress: () => removeFavorite(id), style: "destructive" },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>รายการโปรด ของคุณ </Text>
      
      {data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.subText}>📍 {item.distance ? `${item.distance} km` : 'สนามกีฬา'}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => confirmDelete(item.id, item.name)}
              >
                <Ionicons name="trash-outline" size={24} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>ยังไม่มีรายการโปรดเลยจ้า</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcfcfc",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // เงาสำหรับ iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // เงาสำหรับ Android
    elevation: 3,
  },
  info: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  subText: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#fff5f5",
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
  },
});