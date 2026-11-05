import { UserProfileModel } from "@/contexts/AuthContext";
import api from "@/services/api";
import axios from "axios";

export interface UserActivitiesModel {
  id: string;
  action: string;
  module: string;
  details: string;
  made_by: UserProfileModel;
  made_at: string;
}

export const setUsersPassword = async (formData) => {
  const response = await api.post(`/admin_apis/users/set_user_password/`, formData);
  return response;
};

export const updateUsersData = async (formData) => {
  const response = await api.patch(`/admin_apis/users/users/`, formData, {headers: {
    'Content-Type': 'multipart/form-data',
  },});
  return response;
};
  
export const getAllUsersData = async (): Promise<UserProfileModel[]> => {
  try {
    const response = await api.get<UserProfileModel[]>(`/admin_apis/users/users/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const createUser = async (formData: {
  first_name: string;
  last_name: string;
  phone: string;
  user_status: string;
  gender: string;
  user_role: string;
  nationality: string;
}) => {
  const data = new FormData();
  data.append("first_name", formData.first_name);
  data.append("last_name", formData.last_name);
  data.append("phone", formData.phone);
  data.append("user_status", formData.user_status);
  data.append("gender", formData.gender);
  data.append("user_role", formData.user_role);
  data.append("nationality", formData.nationality);
  const response = await api.post("/admin_apis/users/users/", data);
  return response;
};