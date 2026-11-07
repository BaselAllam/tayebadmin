import api from "@/services/api";
import axios from "axios";

export interface SuppliersModel {
    id: string,
    supplier_name: string,
    supplier_phone: string,
    supplier_address: string,
    contact_person_name: string,
    contact_person_phone: string,
    contact_person_position: string,
}

export const getSuppliers = async (): Promise<SuppliersModel[]> => {
  try {
    const response = await api.get<SuppliersModel[]>(`/admin_apis/suppliers/suppliers/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateSuppliers = async (formData) => {
  const response = await api.patch(`/admin_apis/suppliers/suppliers/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const createSuppliers = async (formData: {
  supplier_name: string;
  supplier_phone: string;
  supplier_address: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_position: string;
}) => {
  const data = new FormData();
  data.append("supplier_name", formData.supplier_name);
  data.append("supplier_phone", formData.supplier_phone);
  data.append("supplier_address", formData.supplier_address);
  data.append("contact_person_name", formData.contact_person_name);
  data.append("contact_person_phone", formData.contact_person_phone);
  data.append("contact_person_position", formData.contact_person_position);

  const response = await api.post("/admin_apis/suppliers/suppliers/", data,);
  return response;
};