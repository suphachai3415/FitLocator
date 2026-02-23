import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "FitLocator",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="map"
        options={{
          title: "แผนที่",
        }}
      />

      <Stack.Screen
        name="favorites"
        options={{
          title: "รายการโปรด",
        }}
      />
    </Stack>
  );
}