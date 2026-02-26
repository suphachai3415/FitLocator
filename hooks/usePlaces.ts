import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { PlaceService } from "../services/placeService";
import { getDistance } from "../utils/distance";

export const usePlaces = () => {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const data = await PlaceService.getPlaces();
      const updated = data.map((place: any) => ({
        ...place,
        distance: getDistance(latitude, longitude, place.latitude, place.longitude)
      }));

      // เรียงลำดับและดึง 10 อันดับแรก
      const sortedData = updated
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        .slice(0, 10);
        
      setPlaces(sortedData);
    } catch (error) {
      console.error("Error loading places:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  return { places, loading, refreshing, onRefresh };
};