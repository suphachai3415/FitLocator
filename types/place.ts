export interface SportPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  category?: string;
}