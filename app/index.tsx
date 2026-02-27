import React from "react";
import { 
  View, 
  FlatList, 
  SafeAreaView, 
  RefreshControl, 
  StyleSheet, 
  Text, 
  Dimensions, 
  StatusBar 
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { usePlaces } from "../hooks/usePlaces";
import { HomeHeader } from "../components/HomeHeader";
import { SectionHeader } from "../components/SectionHeader";
import { PlaceCard } from "../components/PlaceCard";
import { PlaceSkeleton } from "../components/PlaceSkeleton"; // 👈 ตัวที่สร้างใหม่

const { width } = Dimensions.get("window");

export default function Home() {
  const { places, loading, refreshing, onRefresh } = usePlaces();
  const router = useRouter();

  // 🦴 สร้างรายการ Skeleton หลอกๆ 3 อันตอนโหลด
  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <PlaceSkeleton />
      <PlaceSkeleton />
      <PlaceSkeleton />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      
      <LinearGradient 
        colors={["#E8E7FF", "#F8F9FB", "transparent"]} 
        style={styles.gradientHeader} 
      />

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={loading && !refreshing ? [] : places} // ถ้าโหลดอยู่ให้ส่ง array ว่างไปก่อนเพื่อโชว์ EmptyComponent หรือจัดการผ่าน Skeleton
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          
          ListHeaderComponent={
            <View>
              <HomeHeader 
                onMapPress={() => router.push("/map")}
                onFavPress={() => router.push("/favorites")}
              />
              <SectionHeader 
                loading={loading && !refreshing} 
                count={places.length} 
              />
            </View>
          }

          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PlaceCard 
                item={item} 
                onPress={() => router.push(`/place/${item.id}`)} 
              />
            </View>
          )}

          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#5856D6" 
            />
          }

          ListEmptyComponent={
            loading && !refreshing 
              ? renderSkeleton() 
              : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={60} color="#D1D1D6" />
                  <Text style={styles.emptyText}>ไม่พบข้อมูลในบริเวณนี้ค่ะ 🗺️</Text>
                </View>
              )
          }

          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FB" 
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300, // ลดความสูงลงให้ดูสมดุล
  },
  cardWrapper: { 
    paddingHorizontal: 20,
    marginBottom: 5
  },
  listContent: { 
    paddingBottom: 40 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#8E8E93', 
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500'
  },
});