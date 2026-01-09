import api from "./axios";

export interface RecentBid {
  id: number;
  title: string;
  currentBid: number;
  myBid: number;
  timeLeft: string;
  status: "active" | "outbid" | "won" | "ended";
  image: string;
}

export interface DashboardStats {
  active_bids: number;
  won_auctions: number;
  favorites: number;
  total_spending: number;
}

export interface ActivityItem {
  type: "bid" | "outbid" | "favorite" | "won";
  message: string;
  time: string; // ISO string
  amount: string | null;
  timestamp: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_bids: RecentBid[];
  recent_activity: ActivityItem[];
}

export const getDashboardStats = async (): Promise<DashboardData> => {
  const response = await api.get("/dashboard/stats/");
  return response.data;
};
