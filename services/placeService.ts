// services/placeService.ts
import { supabase } from './supabase';

export const PlaceService = {
  // ดึงข้อมูลทั้งหมด (สำหรับหน้า Home และ Map)
  async getPlaces() {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('name', { ascending: true }); // เรียงตามชื่อ

    if (error) throw error;
    return data;
  },

  // ดึงข้อมูลเฉพาะสถานที่ (สำหรับหน้า [id].tsx)
  async getPlaceById(id: string) {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // ดึงรีวิวของสถานที่นั้นๆ (Read)
async getReviews(placeId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
},

// เพิ่มรีวิวใหม่ (Create)
async addReview(placeId: string, rating: number, comment: string) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ place_id: placeId, rating, comment }]);
  if (error) throw error;
  return data;
},
async updateReview(reviewId: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment }) // ข้อมูลที่ต้องการเปลี่ยน
      .eq('id', reviewId);          // เลือกตัวที่จะแก้จาก ID

    if (error) throw error;
    return data;
  },

  // 🗑️ ลบรีวิว (Delete)
  async deleteReview(reviewId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .delete()           // คำสั่งลบ
      .eq('id', reviewId); // ลบตัวที่มี ID ตรงกัน

    if (error) throw error;
    return data;
  },

};