import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ImageCarousel from "./ImageCarousel";

const { width } = Dimensions.get("window");

interface HomeHeaderProps {
  onMapPress: () => void;
  onFavPress: () => void;
}

export const HomeHeader = ({ onMapPress, onFavPress }: HomeHeaderProps) => {
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.topLogoRow}>
        <Ionicons name="flash" size={24} color="#5856D6" />
        <Text style={styles.logoText}>FITLOCATOR</Text>
      </View>

      <View style={styles.carouselContainer}>
        <ImageCarousel />
      </View>

      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.btn} onPress={onMapPress}>
          <LinearGradient colors={["#1C1C1E", "#3A3A3C"]} style={styles.innerBtnGradient}>
            <Ionicons name="map" size={18} color="white" />
            <Text style={styles.btnText}>ดูแผนที่</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={onFavPress}>
          <LinearGradient colors={["#FF2D55", "#FF5E7D"]} style={styles.innerBtnGradient}>
            <Ionicons name="heart" size={18} color="white" />
            <Text style={styles.btnText}>รายการโปรด</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: { paddingHorizontal: 20 },
  topLogoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  logoText: { fontSize: 14, fontWeight: '900', color: '#5856D6', marginLeft: 5, letterSpacing: 2 },
  carouselContainer: { marginBottom: 15 },
  topButtons: { flexDirection: "row", gap: 12, marginBottom: 30 },
  btn: { flex: 1, height: 58, borderRadius: 18, overflow: 'hidden', elevation: 4 },
  innerBtnGradient: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  btnText: { color: "white", marginLeft: 8, fontWeight: "700", fontSize: 15 },
});