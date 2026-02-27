import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const PlaceSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // ✨ ทำ Animation กระพริบแบบละมุน (Pulse Effect)
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* ส่วนของรูปภาพหลอก */}
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />
      {/* ส่วนของข้อความหลอก */}
      <View style={styles.content}>
        <Animated.View style={[styles.titleSkeleton, { opacity }]} />
        <Animated.View style={[styles.subtitleSkeleton, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  imageSkeleton: {
    width: "100%",
    height: 180,
    backgroundColor: "#E1E1E1",
  },
  content: {
    padding: 15,
  },
  titleSkeleton: {
    width: "60%",
    height: 20,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 10,
  },
  subtitleSkeleton: {
    width: "40%",
    height: 14,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
});