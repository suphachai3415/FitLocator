import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const PlaceCard = ({ item, onPress }: any) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.iconCircle}>
      <Ionicons name="fitness" size={22} color="#007AFF" />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.city}>{item.city}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.distanceBadge}>
          {item.distance?.toFixed(1)} km
        </Text>
      </View>
    </View>

    <Ionicons name="chevron-forward-circle" size={24} color="#E5E5EA" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
    // เงาแบบ Soft Shadow ให้มีมิติ
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  name: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  city: { marginLeft: 4, fontSize: 13, color: "#8E8E93" },
  distanceBadge: {
    backgroundColor: "#007AFF",
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 5,
    overflow: 'hidden'
  },
});