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

// 📦 Import สิ่งที่เราแยกไฟล์ไว้
import { usePlaces } from "../hooks/usePlaces";
import { HomeHeader } from "../components/HomeHeader";
import { SectionHeader } from "../components/SectionHeader";
import { PlaceCard } from "../components/PlaceCard";

const { width } = Dimensions.get("window");

export default function Home() {
  const { places, loading, refreshing, onRefresh } = usePlaces();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 🎨 ปรับสีแถบด้านบน (นาฬิกา/แบตเตอรี่) ให้เป็นสีเข้มเพื่อให้ตัดกับพื้นหลัง */}
      <StatusBar barStyle="dark-content" />

      {/* 🌈 พื้นหลังไล่เฉดสีด้านบนสุดเพื่อความละมุน */}
      <LinearGradient 
        colors={["#E8E7FF", "#F2F2F7", "#F8F9FB"]} 
        style={styles.gradientHeader} 
      />

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={places}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          
          // 🏠 ส่วนหัวของ List (Carousel + ปุ่มทางลัด + หัวข้อรายการ)
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

          // 📍 รายการสถานที่ใกล้ตัว
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PlaceCard 
                item={item} 
                onPress={() => router.push(`/place/${item.id}`)} 
              />
            </View>
          )}

          // 🔄 ฟีเจอร์ไถลงเพื่อรีเฟรชข้อมูล
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#5856D6" 
            />
          }

          // 💨 กรณีไม่มีข้อมูลให้แสดง
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>ไม่พบข้อมูลในบริเวณนี้ค่ะแม่ 🗺️</Text>
              </View>
            ) : null
          }

          // 📏 เว้นระยะขอบล่างให้สวยงาม
          contentContainerStyle={{ paddingBottom: 40 }}
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
    height: width * 1.2, // ให้ความสูงเฉดสีครอบคลุมส่วนบน
  },
  cardWrapper: { 
    paddingHorizontal: 20,
    marginBottom: 5 // ระยะห่างระหว่างการ์ด
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#AEAEB2', 
    fontSize: 16,
    fontWeight: '500'
  },
});