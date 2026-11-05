import { UserProfileModel } from "@/contexts/AuthContext";
import api from "@/services/api";
import axios from "axios";

export const updateUserData = async (userData: Partial<UserProfileModel>) => {
  const response = await api.patch(`/admin_apis/users/user_data/`, userData, {headers: {
    'Content-Type': 'multipart/form-data',
  },});
  return response;
};
  
export const getUserData = async (): Promise<UserProfileModel> => {
  try {
    const response = await api.get<UserProfileModel>(`/admin_apis/users/user_data/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};