import * as Location from "expo-location";

export async function getLocation() {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permission denied");
  }

  const location =
    await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}