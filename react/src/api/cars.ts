
import api from "./axios";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export interface Car {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  location: string;
  currentBid: number; 
  timeLeft: string; 
  image: string;
  category: string; 
  featured: boolean;
  highBid: boolean;
  is_favorited: boolean;
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED';
  start_bid: number;
  auction_duration: number;
  created_at: string;
  description?: string;
  bids_count: number;
  latest_bid?: number;
}

export const getPublicCars = async (): Promise<Car[]> => {
  const response = await api.get("/cars/public/");
  return response.data.map((item: any) => {
    // Calculate time left
    const created = new Date(item.created_at);
    const end = new Date(created.getTime() + item.auction_duration * 24 * 60 * 60 * 1000); // days to ms
    const now = new Date();
    let timeLeft = "منتهي";
    
    if (end > now) {
      timeLeft = formatDistanceToNow(end, { addSuffix: true, locale: ar });
    }

    return {
      id: item.id,
      title: item.title,
      brand: item.brand,
      model: item.model,
      year: item.year,
      mileage: item.mileage,
      fuel: item.fuel,
      transmission: item.transmission,
      location: item.location,
      currentBid: item.latest_bid || item.start_bid,
      timeLeft: timeLeft,
      image: item.images && item.images.length > 0 ? item.images[0].image : "",
      category: "سيدان", // Placeholder or deduce from body style if available
      featured: false, // Placeholder
      highBid: false, // Placeholder
      is_favorited: item.is_favorited,
      status: item.status,
      start_bid: item.start_bid,
      auction_duration: item.auction_duration,
      created_at: item.created_at,
      description: item.description,
      bids_count: item.bids_count
    };
  });
};
