import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert, // ✨ เพิ่ม Alert ตรงนี้แล้ว
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PlaceService } from "../services/placeService";
import { LinearGradient } from "expo-linear-gradient";

export default function ReviewSection({ placeId }: { placeId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // ✨ 1. เพิ่ม State สำหรับการแก้ไข (ต้องมีตัวนี้!)
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [placeId]);

  const fetchReviews = async () => {
    try {
      const data = await PlaceService.getReviews(placeId);
      setReviews(data || []);
    } finally {
      setLoading(false);
    }
  };

  // ✨ 2. ฟังก์ชันเริ่มการแก้ไข (ต้องมีตัวนี้!)
  const startEdit = (item: any) => {
    setEditingId(item.id);
    setComment(item.comment);
    setRating(item.rating);
  };

  // ✨ 3. ฟังก์ชันส่ง/บันทึก (เหลืออันเดียวและรองรับทั้งส่งใหม่+แก้ไข)
  const handleSend = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      if (editingId) {
        await PlaceService.updateReview(editingId, rating, comment);
        setEditingId(null); 
      } else {
        await PlaceService.addReview(placeId, rating, comment);
      }
      setComment(""); 
      setRating(5); 
      fetchReviews(); 
      Keyboard.dismiss();
    } catch (e) {
      Alert.alert("บันทึกไม่ได้ ลองใหม่อีกทีนะ");
    } finally { setSending(false); }
  };

  // ✨ 4. ฟังก์ชันลบรีวิว
  const handleDelete = (id: string) => {
    Alert.alert("ลบรีวิว", "แน่ใจนะว่าจะลบรีวิวนี้?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบเลย", style: "destructive", onPress: async () => {
        try {
          await PlaceService.deleteReview(id);
          fetchReviews();
        } catch (e) {
          Alert.alert("ไม่สามารถลบได้");
        }
      }}
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Ratings & Reviews ({reviews.length})
        </Text>

        {/* Input Section */}
        <View style={[styles.inputCard, editingId ? { borderColor: '#5856D6', borderWidth: 1 } : null]}>
          {editingId && <Text style={{ fontSize: 12, color: '#5856D6', marginBottom: 5 }}>กำลังแก้ไขรีวิว...</Text>}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Ionicons
                  name={s <= rating ? "star" : "star-outline"}
                  size={22}
                  color={s <= rating ? "#FFD700" : "#D1D1D6"}
                />
              </TouchableOpacity>
            ))}
            <Text style={styles.ratingHint}>{rating}/5</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="บอกเล่าประสบการณ์ที่นี่..."
            value={comment}
            onChangeText={setComment}
            multiline
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!comment.trim() || sending}
          >
            <LinearGradient
              colors={comment.trim() ? ["#5856D6", "#7B79FF"] : ["#E5E5EA", "#D1D1D6"]}
              style={styles.sendBtn}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.sendBtnText}>
                  {editingId ? "บันทึกการแก้ไข" : "ส่งความเห็น"}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Reviews List */}
        {loading ? (
          <ActivityIndicator color="#5856D6" />
        ) : (
          reviews.map((item) => (
            <View key={item.id} style={styles.reviewCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.userName}>คุณสมาชิก</Text>
                  <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString('th-TH')} {new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                   {/* ✨ ปุ่มแก้ไขและลบ วางต่อท้ายดาวให้กระชับ */}
                   <TouchableOpacity onPress={() => startEdit(item)} style={{ padding: 5 }}>
                    <Ionicons name="pencil-outline" size={16} color="#5856D6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 5 }}>
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                  <View style={[styles.ratingBadge, { marginLeft: 5 }]}>
                    <Ionicons name="star" size={10} color="#FAAD14" />
                    <Text style={styles.ratingNum}>{item.rating}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.commentText}>{item.comment}</Text>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: "700", color: "#1C1C1E", marginBottom: 15 },
  inputCard: { backgroundColor: "#F8F9FB", padding: 15, borderRadius: 15, marginBottom: 40 },
  starRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ratingHint: { marginLeft: 10, fontSize: 13, color: "#8E8E93" },
  input: { backgroundColor: "white", borderRadius: 10, padding: 12, minHeight: 60, textAlignVertical: "top", fontSize: 14, borderWidth: 1, borderColor: "#E5E5EA", marginBottom: 12 },
  sendBtn: { height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', shadowColor: "#5856D6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginTop: 10 },
  sendBtnText: { color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  reviewCard: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  userName: { fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  date: { fontSize: 11, color: '#AEAEB2', marginLeft: 8 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center' },
  ratingNum: { fontSize: 12, fontWeight: '700', color: '#FAAD14', marginLeft: 3 },
  commentText: { fontSize: 14, color: '#48484A', marginTop: 4, lineHeight: 20 },
});