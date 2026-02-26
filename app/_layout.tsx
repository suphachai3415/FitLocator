import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        // 🎨 ค่ากลางของ Header (สำหรับหน้าอื่นๆ ที่ไม่ใช่ Index)
        headerStyle: { backgroundColor: "#5856D6" },
        headerTintColor: "#fff",
        headerTitleAlign: 'center',
        headerBackTitle: "Fitlocator", // ✅ เวลากดกลับจากหน้าอื่น ให้เขียนว่า Fitlocator
      }}
    >
      {/* 🛑 หน้า Index: ปิดให้ตายสนิท ห้ามโชว์แถบขาว! */}
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false, // 👈 บรรทัดนี้คือ "ยาสั่ง" ห้ามโชว์ Header ระบบเด็ดขาด
          title: "Fitlocator"  // ใส่ไว้เป็นชื่อแอปเฉยๆ แต่พอกด headerShown: false มันจะไม่โชว์ค่ะ
        }} 
      />

      {/* หน้าอื่นๆ เปิดไว้ปกติเพื่อให้มีปุ่ม Back */}
      <Stack.Screen name="map" options={{ title: "แผนที่" }} />
      <Stack.Screen name="favorites" options={{ title: "รายการโปรด" }} />
      <Stack.Screen name="place/[id]" options={{ title: "" }} />
    </Stack>
  );
}