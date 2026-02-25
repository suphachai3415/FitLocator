import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");

const ITEM_WIDTH = width * 0.82;
const SPACING = 14;
const SIDE_SPACING = (width - ITEM_WIDTH) / 2;
const INTERVAL = 3000; // เวลาเลื่อน (3 วิ)

const carouselData = [
  { id: "1", image: require("../assets/images/1.jpg") },
  { id: "2", image: require("../assets/images/2.jpg") },
  { id: "3", image: require("../assets/images/3.jpg") },
];

export default function ImageCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<any>>(null);

  const [index, setIndex] = useState(0);

  // Auto scroll
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = index + 1;

      if (nextIndex >= carouselData.length) {
        nextIndex = 0;
      }

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * (ITEM_WIDTH + SPACING),
        animated: true,
      });

      setIndex(nextIndex);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [index]);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={carouselData}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        bounces={false}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: SIDE_SPACING,
        }}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (ITEM_WIDTH + SPACING),
            index * (ITEM_WIDTH + SPACING),
            (index + 1) * (ITEM_WIDTH + SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [{ scale }],
                },
              ]}
            >
              <Image source={item.image} style={styles.image} />
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },

  card: {
    width: ITEM_WIDTH,
    height: 200,
    marginRight: SPACING,
    borderRadius: 20,
    overflow: "hidden",

    backgroundColor: "#eee",

    elevation: 6,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  image: {
    width: "100%",
    height: "100%",
  },
});