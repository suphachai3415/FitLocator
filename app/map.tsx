import MapView, { Marker, Region } from "react-native-maps";
import { useState } from "react";
import { View, StyleSheet } from "react-native";

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 13.7563,
    longitude: 100.5018,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        region={region}
        onRegionChangeComplete={handleRegionChange}
      />
    </View>
  );
}