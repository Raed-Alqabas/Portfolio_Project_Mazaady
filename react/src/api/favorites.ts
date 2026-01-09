import api from "./axios";

export interface FavoriteItem {
  id: number;
  title: string;
  currentBid: number;
  startingPrice: number;
  endTime: string;
  image: string;
  status: "active" | "ending-soon" | "ended";
  bids: number;
  location: string;
}

export const getFavorites = async (): Promise<FavoriteItem[]> => {
  const response = await api.get("/favorites/");
  return response.data;
};

export const toggleFavorite = async (carId: number): Promise<{ status: string; message: string }> => {
  const response = await api.post("/favorites/toggle/", { car_id: carId });
  return response.data;
};
