import { SportPlace } from "../types/place";

export const fetchPlaces = async (
  lat: number,
  lng: number,
  keyword: string,
  radius: number = 15000
): Promise<SportPlace[]> => {
  const query = `
    [out:json][timeout:25];
    (
      node["leisure"~"stadium|sports_centre|fitness_centre|pitch|golf_course"]
      (around:${radius},${lat},${lng});
    );
    out body;
  `;

  const url =
    "https://overpass.kumi.systems/api/interpreter?data=" +
    encodeURIComponent(query);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Overpass API error");
  }

  const data = await response.json();

  return data.elements.map((item: any) => ({
    id: item.id.toString(),
    name: item.tags?.name ?? "ไม่ระบุชื่อ",
    latitude: item.lat,
    longitude: item.lon,
  }));
};