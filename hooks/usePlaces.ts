import { useState } from "react";
import * as Location from "expo-location";
import { SportPlace } from "../types/place";
import { fetchPlaces } from "../services/api";
import { calculateDistance } from "../utils/distance";

export const usePlaces = () => {
  const [places, setPlaces] = useState<SportPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlaces = async (searchKeyword: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("กรุณาเปิดสิทธิ์การเข้าถึงตำแหน่ง");
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const { latitude, longitude } = location.coords;

      const data = await fetchPlaces(
        latitude,
        longitude,
        searchKeyword,
        15000 // 15km ทีเดียว
      );

      const sorted = data
        .map((place) => ({
          ...place,
          distance: calculateDistance(
            latitude,
            longitude,
            place.latitude,
            place.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 30);

      setPlaces(sorted);
    } catch (err) {
      setError("ไม่สามารถโหลดสถานที่ได้");
    } finally {
      setLoading(false);
    }
  };

  return { places, loading, error, loadPlaces };
};