import { View, FlatList, Text } from "react-native";
import { useFavorites } from "../hooks/useFavorites";
import PlaceCard from "../components/PlaceCard";

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            isFavorite={true}
            onFavoritePress={() => toggleFavorite(item)}
          />
        )}
        ListEmptyComponent={<Text>ยังไม่มีรายการโปรด</Text>}
      />
    </View>
  );
}