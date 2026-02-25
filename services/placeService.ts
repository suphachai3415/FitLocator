// services/placeService.ts
import { supabase } from './supabase'; // ไฟล์ที่เก็บ config supabase

export const PlaceService = {
  async getPlaces() {
    // ดึงข้อมูลจากตารางชื่อ 'places' ใน Supabase
    const { data, error } = await supabase
      .from('places')
      .select('*');

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }
    return data;
  }
};