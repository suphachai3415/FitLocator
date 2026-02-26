import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SectionHeaderProps {
  loading: boolean;
  count: number;
}

export const SectionHeader = ({ loading, count }: SectionHeaderProps) => (
  <View style={styles.listHeader}>
    <View>
      <Text style={styles.sectionTitle}>สถานที่ใกล้ตัวคุณ</Text>
      <View style={styles.subTitleRow}>
        <Ionicons name="navigate-circle" size={14} color="#5856D6" />
        <Text style={styles.subTitleText}>10 อันดับที่ใกล้พิกัดปัจจุบันที่สุด</Text>
      </View>
    </View>
    
    {loading ? (
      <ActivityIndicator size="small" color="#5856D6" />
    ) : (
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count} แห่ง</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#1C1C1E", letterSpacing: -0.5 },
  subTitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  subTitleText: { fontSize: 13, color: "#8E8E93", marginLeft: 4, fontWeight: "500" },
  countBadge: { backgroundColor: '#E8E7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  countText: { color: '#5856D6', fontSize: 12, fontWeight: '700' },
});