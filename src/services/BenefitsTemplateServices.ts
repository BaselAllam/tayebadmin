import axios from "axios";
import api from "./api";


export interface PackageBenefitsModelTemplate {
  id: string;
  benefit_title: string;
}

export const getPackageBenefitsTemplate = async (): Promise<PackageBenefitsModelTemplate[]> => {
  try {
    const response = await api.get<PackageBenefitsModelTemplate[]>(`/admin_apis/packages/benefits_templates/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updatePackageBenefitsTemplate = async (formData) => {
  const response = await api.patch(`/admin_apis/packages/benefits_templates/`, formData);
  return response;
};

export const createPackageBenefitsTemplate = async (formData: {
  benefit_title: string;
}) => {
  const data = new FormData();
  data.append("benefit_title", formData.benefit_title);
  const response = await api.post("/admin_apis/packages/benefits_templates/", data);
  return response;
};

export const deletePackageBenefitsTemplate = async (id: string) => {
  const response = await api.delete(`/admin_apis/packages/benefits_templates/?id=${id}`);
  return response;
};