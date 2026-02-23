import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SportPlace } from "../types/place";
import { COLORS } from "../constants/colors";

interface Props {
  place: SportPlace;
  distance?: number;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  onMapPress?: () => void;
}

export default function PlaceCard({ place, distance, isFavorite, onMapPress, onFavoritePress }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{place.name}</Text>
      {distance !== undefined && <Text style={styles.distance}>📍 ห่างจากคุณ {distance} กม.</Text>}
      <View style={styles.row}>
        <TouchableOpacity style={styles.mapBtn} onPress={onMapPress}>
          <Text style={styles.btnText}>ดูแผนที่</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.favBtn, isFavorite && { backgroundColor: '#ff4757' }]} 
          onPress={onFavoritePress}
        >
          <Text style={styles.btnText}>{isFavorite ? "❤️ บันทึกแล้ว" : "🤍 บันทึก"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold' },
  distance: { color: '#666', fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 12, gap: 10 },
  mapBtn: { flex: 1, backgroundColor: '#3498db', padding: 10, borderRadius: 8, alignItems: 'center' },
  favBtn: { flex: 1, backgroundColor: '#95a5a6', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});