import api from "@/services/api";
import axios from "axios";

export interface CitiesModel {
    id: string;
    city_name: string;
    city_name_ar: string;
    is_archived: boolean;
    area_city: AreaModel[];
}

export interface AreaModel {
    id: string;
    area_name: string;
    area_name_ar: string;
    delivery_fee: number;
    is_archived: boolean;
}

export const getCities = async (): Promise<CitiesModel[]> => {
  try {
    const response = await api.get<CitiesModel[]>(`/admin_apis/core/cities/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateCities = async (formData) => {
  const response = await api.patch(`/admin_apis/core/cities/`, formData);
  return response;
};

export const createCities = async (formData: {
  city_name: string;
  city_name_ar: string;
  is_archived: boolean;
}) => {
  const data = new FormData();
  data.append("city_name", formData.city_name);
  data.append("city_name_ar", formData.city_name_ar);
  data.append("is_archived", String(formData.is_archived));
  const response = await api.post("/admin_apis/core/cities/", data);
  return response;
};

export const createAreas = async (formData: {
  city_id: string;
  area_name: string;
  area_name_ar: string;
  delivery_fee: number;
  is_archived: boolean;
}) => {
  const data = new FormData();
  data.append("city_id", formData.city_id);
  data.append("area_name", formData.area_name);
  data.append("area_name_ar", formData.area_name_ar);
  data.append("delivery_fee", String(formData.delivery_fee));
  data.append("is_archived", String(formData.is_archived));
  const response = await api.post("/admin_apis/core/areas/", data);
  return response;
};

export const updateAreas = async (formData) => {
  const response = await api.patch(`/admin_apis/core/areas/`, formData);
  return response;
};


export interface ContactUsModel {
    id: string;
    full_name: string;
    user_email: string;
    user_phone: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

export const getContactUs = async (): Promise<ContactUsModel[]> => {
  try {
    const response = await api.get<ContactUsModel[]>(`/admin_apis/core/contactus/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateContactUs = async (formData) => {
  const response = await api.patch(`/admin_apis/core/contactus/`, formData);
  return response;
};

export interface FaqsModel {
    id: string;
    faq_title: string;
    faq_title_ar: string;
    faq_description: string;
    faq_description_ar: string;
    is_archived: boolean;
}

export const getFaqs = async (): Promise<FaqsModel[]> => {
  try {
    const response = await api.get<FaqsModel[]>(`/admin_apis/core/faq/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateFaqs = async (formData) => {
  const response = await api.patch(`/admin_apis/core/faq/`, formData);
  return response;
};

export const createFaqs = async (formData: {
  faq_title: string;
  faq_title_ar: string;
  faq_description: string;
  faq_description_ar: string;
  is_archived: boolean;
}) => {
  const data = new FormData();
  data.append("faq_title", formData.faq_title);
  data.append("faq_title_ar", formData.faq_title_ar);
  data.append("faq_description", formData.faq_description);
  data.append("faq_description_ar", formData.faq_description_ar);
  data.append("is_archived", String(formData.is_archived));
  const response = await api.post("/admin_apis/core/faq/", data);
  return response;
};

export const base64ToFile = (base64String: string, filename = "upload.png") => {
  const arr = base64String.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};