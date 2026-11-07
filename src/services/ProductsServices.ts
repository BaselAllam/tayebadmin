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

export interface ProductsModel {
    id: string;
    views_counter: number;
    is_available: boolean;
    category: ProductsCategoriesModel;
    orders_counter: number;
    reviews_counter: number;
    product_name: string;
    product_name_ar: string;
    product_description: string;
    product_description_ar: string;
    price: number;
    stock_qty: number;
    imgs: {
        'id': string;
        'image_url': string;
    }[]
    created_at: string;
}

export const getProducts = async (): Promise<ProductsModel[]> => {
  try {
    const response = await api.get<ProductsModel[]>(`/admin_apis/products/products/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateProducts = async (formData) => {
  const response = await api.patch(`/admin_apis/products/products/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const createProducts = async (formData: {
    views_counter: number;
    is_available: boolean;
    category: string;
    orders_counter: number;
    reviews_counter: number;
    product_name: string;
    product_name_ar: string;
    product_description: string;
    product_description_ar: string;
    price: number;
    stock_qty: number;
}) => {
  const data = new FormData();
  data.append("views_counter", String(formData.views_counter));
  data.append("is_available", String(formData.is_available));
  data.append("orders_counter", String(formData.orders_counter));
  data.append("reviews_counter", String(formData.reviews_counter));
  data.append("product_name", formData.product_name);
  data.append("product_name_ar", formData.product_name_ar);
  data.append("product_description", formData.product_description);
  data.append("product_description_ar", formData.product_description_ar);
  data.append("price", String(formData.price));
  data.append("stock_qty", String(formData.stock_qty));
  data.append("category", formData.category);

  const response = await api.post("/admin_apis/products/products/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const createProductsImg = async (formData: {
    product_id: string;
    image: File | string | null;
}) => {
  const data = new FormData();
  data.append("product_id", formData.product_id);
  
  if (formData.image instanceof File) {
    data.append("image", formData.image);
  } else if (typeof formData.image === "string" && formData.image.startsWith("data:image")) {
    data.append("image", base64ToFile(formData.image));
  }

  const response = await api.post("/admin_apis/products/products-imgs/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const deleteProductsImg = async (imgId: string) => {
  const response = await api.delete(`/admin_apis/products/products-imgs/?id=${imgId}`);
  return response;
};