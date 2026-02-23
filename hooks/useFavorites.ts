import { useEffect, useState } from "react";
import { SportPlace } from "../types/place";
import {
  getFavorites,
  toggleFavorite as toggleStorage,
} from "../storage/favoritesStorage";

export function useFavorites() {
  const [favorites, setFavorites] = useState<SportPlace[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const data = await getFavorites();
    setFavorites(data);
  };

  const toggleFavorite = async (place: SportPlace) => {
    const updated = await toggleStorage(place);
    setFavorites(updated);
  };

  const isFavorite = (id: string) =>
    favorites.some((item) => item.id === id);

  return { favorites, toggleFavorite, isFavorite };
}