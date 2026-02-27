import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  TouchableOpacity, Linking, Dimensions, StatusBar,
  Platform 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PlaceService } from "../../services/placeService";
import ReviewSection from "../../components/ReviewSection";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function PlaceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [place, setPlace] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'review'>('info');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) loadData();
    checkIfFavorite();
  }, [id]);

  const checkIfFavorite = async () => {
  try {
    const stored = await AsyncStorage.getItem("favorites");
    if (stored) {
      const favoritesList = JSON.parse(stored);
      // เช็คว่ามี id นี้อยู่ในรายการโปรดหรือยัง
      const isFav = favoritesList.some((item: any) => item.id === id);
      setIsFavorite(isFav);
    }
  } catch (error) {
    console.error("Error checking favorite:", error);
  }
};

  const loadData = async () => {
    const data = await PlaceService.getPlaceById(id as string);
    setPlace(data);
  };

  

  if (!place) return (
    <View style={styles.loader}>
      <Text style={{fontSize: 16, color: '#8E8E93'}}>กำลังโหลดข้อมูล... ✨</Text>
    </View>
  );

  // หน้า PlaceDetail.tsx

const toggleFavorite = async () => {
  try {
    // 1. ดึงรายการเดิมจากเครื่อง
    const storedFavorites = await AsyncStorage.getItem("favorites");
    let favoritesList = storedFavorites ? JSON.parse(storedFavorites) : [];

    if (isFavorite) {
      // ถ้าเป็น Favorite อยู่แล้ว -> ให้ลบออก
      favoritesList = favoritesList.filter((item: any) => item.id !== place.id);
    } else {
      // ถ้ายังไม่เป็น -> ให้เพิ่มเข้าไป (ใส่โค้ดที่คุณถามตรงนี้ครับ!) ✅
      const newFavorite = {
        id: place.id,
        name: place.name,
        type: place.type,
        image_url: place.image_url,
        distance: place.distance // ตรวจสอบว่าใน object 'place' มี field พวกนี้ครบนะ
      };
      
      favoritesList.push(newFavorite);
    }

    // 2. บันทึกกลับลงเครื่อง
    await AsyncStorage.setItem("favorites", JSON.stringify(favoritesList));
    
    // 3. เปลี่ยนสถานะหัวใจในหน้าจอ
    setIsFavorite(!isFavorite);

  } catch (error) {
    console.error("Error saving favorite:", error);
  }
};

  

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={{ position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }}>
  {/* ปุ่มย้อนกลับ */}
  <TouchableOpacity 
    style={{ backgroundColor: 'white', padding: 10, borderRadius: 15, elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4 }} 
    onPress={() => router.back()}
  >
    <Ionicons name="arrow-back" size={24} color="black" />
  </TouchableOpacity>

  {/* ปุ่มหัวใจ */}
  {/* แก้ไขส่วนนี้ใน return */}
<TouchableOpacity 
  style={{ 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 15, 
    elevation: 5, 
    shadowColor: "#000", 
    shadowOpacity: 0.2, 
    shadowRadius: 4 
  }} 
  onPress={toggleFavorite} // ✅ ต้องเรียกใช้ฟังก์ชัน toggleFavorite
>
  <Ionicons 
    name={isFavorite ? "heart" : "heart-outline"} 
    size={24} 
    color={isFavorite ? "#FF2D55" : "black"} 
  />
</TouchableOpacity>
</View>
      

      <ScrollView bounces={false} showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets={true}>
        {/* 2. รูปภาพ - ปรับความสูงลงมาเหลือ 280 ให้พอดีตา ไม่กินพื้นที่เยอะเกินไป */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: place.image_url }} style={styles.image} />
          <LinearGradient 
            colors={['rgba(0,0,0,0.4)', 'transparent']} 
            style={styles.imageTopOverlay} 
          />
          
        </View>
        

        {/* 3. ส่วนหัวข้อสถานที่ - จัดวางใหม่ให้ดูโปร่งขึ้น */}
        <View style={styles.titleSection}>
          <Text style={styles.name}>{place.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
               <Text style={styles.typeText}>📍 {place.type}</Text>
            </View>
          
          </View>
        </View>

        {/* 4. ✅ TAB BAR - ใส่ Shadow ให้ลอยเด่นขึ้นมา และเช็คว่าไม่โดนอะไรทับ */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabLabel, activeTab === 'info' && styles.activeTabLabel]}>รายละเอียด</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'review' && styles.activeTab]}
              onPress={() => setActiveTab('review')}
            >
              <Text style={[styles.tabLabel, activeTab === 'review' && styles.activeTabLabel]}>รีวิว</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. ส่วนเนื้อหา */}
        <View style={styles.contentArea}>
          {activeTab === 'info' ? (
            <View>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={20} color="#5856D6" />
                  <Text style={styles.infoText}>{place.phone || "ไม่ระบุเบอร์โทร"}</Text>
                </View>
                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                  <Ionicons name="location" size={20} color="#5856D6" style={{marginTop: 2}} />
                  <Text style={styles.infoText}>{place.address}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={20} color="#FF9500" />
                  <Text style={styles.infoText}>เวลาทำการ: {place.opening_hours || "09:00 - 22:00"}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`)}
              >
                <LinearGradient colors={["#5856D6", "#7B79FF"]} style={styles.gradient}>
                  <Ionicons name="navigate" size={22} color="white" />
                  <Text style={styles.mapButtonText}>นำทางด้วย Google Maps</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <ReviewSection placeId={id as string} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  backBtn: { 
    position: 'absolute', zIndex: 10, left: 20,
    backgroundColor: 'white', padding: 10, borderRadius: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 
  },

  imageContainer: { width: width, height: 280, backgroundColor: '#eee' }, // ปรับลงจาก 320 เหลือ 280
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageTopOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },

  titleSection: { padding: 20, backgroundColor: 'white' }, // เอา marginTop: -30 ออกเพื่อให้ Tab ไม่ขยับตาม
  name: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E', letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10, flexWrap: 'wrap' },
  typeBadge: { backgroundColor: '#E8E7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  typeText: { fontSize: 14, color: '#5856D6', fontWeight: '600' },
  statusBadge: { backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },

  // TAB WRAPPER - เพิ่มความมั่นใจว่า Tab จะขึ้นชัวร์
  tabWrapper: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'white' },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F2F2F7', 
    borderRadius: 16, 
    padding: 4,
    height: 52 
  },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: 'white', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabLabel: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  activeTabLabel: { color: '#5856D6' },

  contentArea: { paddingHorizontal: 20, paddingBottom: 40 },
  infoCard: { backgroundColor: '#F8F9FB', padding: 20, borderRadius: 24, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoText: { fontSize: 15, color: '#3A3A3C', marginLeft: 12, flex: 1, lineHeight: 22 },

  mapButton: { borderRadius: 20, overflow: 'hidden', elevation: 4 },
  gradient: { height: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  mapButtonText: { color: 'white', fontSize: 17, fontWeight: 'bold' }
});