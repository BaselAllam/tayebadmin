import axios from "axios";
import api from "./api";


export interface PackageHighlightsModelTemplate {
  id: string;
  highlights_title: string;
}

export const getPackageHighlightsTemplate = async (): Promise<PackageHighlightsModelTemplate[]> => {
  try {
    const response = await api.get<PackageHighlightsModelTemplate[]>(`/admin_apis/packages/highlights_templates/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updatePackageHighlightsTemplate = async (formData) => {
  const response = await api.patch(`/admin_apis/packages/highlights_templates/`, formData);
  return response;
};

export const createPackageHighlightsTemplate = async (formData: {
  highlights_title: string;
}) => {
  const data = new FormData();
  data.append("highlights_title", formData.highlights_title);
  const response = await api.post("/admin_apis/packages/highlights_templates/", data);
  return response;
};

export const deletePackageHighlightsTemplate = async (id: string) => {
  const response = await api.delete(`/admin_apis/packages/highlights_templates/?id=${id}`);
  return response;
};