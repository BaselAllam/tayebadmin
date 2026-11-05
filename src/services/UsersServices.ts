import { UserProfileModel } from "@/contexts/AuthContext";
import api from "@/services/api";
import axios from "axios";
import { AreaModel } from "./CoreServices";

export interface UserAddressModel {
  id: string;
  area: AreaModel;
  street_name: string;
  apartment_number: number;
  flat_number: number;
}

export const updateUsersAddress = async (formData) => {
  const response = await api.patch(`/admin_apis/users/user_addresses/`, formData, {headers: {
    'Content-Type': 'multipart/form-data',
  },});
  return response;
};

export const createUserAddress = async (formData: {
  user_id: string;
  area_id: string;
  street_name: string;
  apartment_number: number;
  flat_number: number;
}) => {
  const data = new FormData();
  data.append("user_id", formData.user_id);
  data.append("area_id", formData.area_id);
  data.append("street_name", formData.street_name);
  data.append("apartment_number", formData.apartment_number.toString());
  data.append("flat_number", formData.flat_number.toString());
  const response = await api.post("/admin_apis/users/user_addresses/", data);
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
}) => {
  const data = new FormData();
  data.append("first_name", formData.first_name);
  data.append("last_name", formData.last_name);
  data.append("phone", formData.phone);
  data.append("user_status", formData.user_status);
  data.append("gender", formData.gender);
  const response = await api.post("/admin_apis/users/users/", data);
  return response;
};