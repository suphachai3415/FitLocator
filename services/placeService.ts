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
  }
};