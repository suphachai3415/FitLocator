import { useState, useEffect, useRef } from "react";
import { Keyboard } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView from "react-native-maps";
import { PlaceService } from "../services/placeService";
import { getDistance } from "../utils/distance";

export const useMapData = () => {
  const [places, setPlaces] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const [isNearbyFilter, setIsNearbyFilter] = useState(false);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let curLoc = null;
      if (status === 'granted') {
        curLoc = await Location.getCurrentPositionAsync({});
        setLocation(curLoc.coords);
      }

      const [data, favStore] = await Promise.all([
        PlaceService.getPlaces(),
        AsyncStorage.getItem("favorites")
      ]);

      setFavorites(favStore ? JSON.parse(favStore).map((f: any) => f.id) : []);
      setPlaces(data);

      if (curLoc && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: curLoc.coords.latitude,
          longitude: curLoc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = places.map(p => ({
        ...p,
        distance: location ? getDistance(location.latitude, location.longitude, parseFloat(p.latitude), parseFloat(p.longitude)) : null
      })).filter(p => 
        p.name.toLowerCase().includes(text.toLowerCase()) || 
        p.type.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)).slice(0, 5));
    }
  };

  const selectSuggestion = (place: any) => {
    setSearchQuery(place.name);
    setSuggestions([]);
    Keyboard.dismiss();
    mapRef.current?.animateToRegion({
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 1000);
  };

  const toggleNearbyFilter = () => {
  setIsNearbyFilter(!isNearbyFilter);
};

const filteredPlaces = isNearbyFilter && location 
    ? places.filter(p => {
        const d = getDistance(
          location.latitude, 
          location.longitude, 
          parseFloat(p.latitude), 
          parseFloat(p.longitude)
        );
        return d <= 5; 
      })
    : places;

 return {
    places, 
    filteredPlaces, 
    favorites, 
    searchQuery, 
    suggestions, 
    location, 
    loading,
    mapRef, 
    handleSearch, 
    selectSuggestion,
    isNearbyFilter, // ส่งไปบอก UI ว่าตอนนี้ปุ่มกดอยู่ไหม
    toggleNearbyFilter // ส่งฟังก์ชันไปให้ปุ่มกด
  };
};