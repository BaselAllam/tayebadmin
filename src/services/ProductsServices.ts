import api from "@/services/api";
import axios from "axios";
import { base64ToFile } from "./CoreServices";

export interface ProductsCategoriesModel {
    id: string;
    category_name: string;
    category_name_ar: string;
    image: string;
    is_active: boolean;
    created_at: string;
}

export const getProductCategories = async (): Promise<ProductsCategoriesModel[]> => {
  try {
    const response = await api.get<ProductsCategoriesModel[]>(`/admin_apis/products/products-categories/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateProductCategories = async (formData) => {
  const response = await api.patch(`/admin_apis/products/products-categories/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const createProductCategories = async (formData: {
    category_name: string;
    category_name_ar: string;
    is_active: boolean;
    image: File | string | null;
}) => {
  const data = new FormData();
  data.append("category_name", formData.category_name);
  data.append("category_name_ar", formData.category_name_ar);
  data.append("is_active", String(formData.is_active));

  if (formData.image instanceof File) {
    data.append("image", formData.image);
  } else if (typeof formData.image === "string" && formData.image.startsWith("data:image")) {
    data.append("image", base64ToFile(formData.image));
  }

  const response = await api.post("/admin_apis/products/products-categories/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};