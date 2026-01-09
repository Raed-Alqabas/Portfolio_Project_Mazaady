import api from "./axios";

export interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  phone_country_code: string;
  date_joined: string;
  bidding_access?: boolean;
}

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserStats {
  active_bids: number;
  completed_bids: number;
  active_listings: number;
  rating: number;
}

export const getProfile = async (): Promise<ProfileData> => {
  const response = await api.get("/auth/profile/");
  return response.data;
};

export const updateProfile = async (data: UpdateProfileData): Promise<ProfileData> => {
  const response = await api.put("/auth/profile/", data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordData) => {
  const response = await api.post("/auth/change-password/", data);
  return response.data;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get("/auth/stats/");
  return response.data;
};
