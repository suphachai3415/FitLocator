import React from "react";
import { Marker, Callout } from "react-native-maps";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PlaceMarkerProps {
  place: any;
  isFav: boolean;
  onPress: (id: string) => void;
}

export const PlaceMarker = ({ place, isFav, onPress }: PlaceMarkerProps) => (
  <Marker
    coordinate={{
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
    }}
    pinColor={isFav ? "#FF2D55" : "#5856D6"}
  >
    <Callout onPress={() => onPress(place.id)}>
      <View style={styles.callout}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.calloutTitle}>{place.name}</Text>
          {isFav && <Ionicons name="heart" size={14} color="#FF2D55" style={{ marginLeft: 5 }} />}
        </View>
        <Text style={styles.calloutSubtitle}>{place.type} • คลิกดูข้อมูล</Text>
      </View>
    </Callout>
  </Marker>
);

const styles = StyleSheet.create({
  callout: { padding: 5, minWidth: 140 },
  calloutTitle: { fontWeight: "bold", fontSize: 14, color: '#1C1C1E' },
  calloutSubtitle: { fontSize: 12, color: '#8E8E93' },
});