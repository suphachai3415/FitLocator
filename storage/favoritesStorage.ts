import AsyncStorage from "@react-native-async-storage/async-storage";
import { SportPlace } from "../types/place";

const FAVORITE_KEY = "favorites";

export const getFavorites = async (): Promise<SportPlace[]> => {
  const data = await AsyncStorage.getItem(FAVORITE_KEY);
  return data ? JSON.parse(data) : [];
};

export const toggleFavorite = async (
  place: SportPlace
): Promise<SportPlace[]> => {
  const favorites = await getFavorites();

  const exists = favorites.some((item) => item.id === place.id);

  const updated = exists
    ? favorites.filter((item) => item.id !== place.id)
    : [...favorites, place];

  await AsyncStorage.setItem(FAVORITE_KEY, JSON.stringify(updated));

  return updated;
};