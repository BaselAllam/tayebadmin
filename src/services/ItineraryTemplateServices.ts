import axios from "axios";
import api from "./api";
import { base64ToFile, DestinationModel } from "./CoreServices";


export interface PackageItineraryModelTemplate {
  id: string;
  itinerary_title: string;
  itinerary_description: string;
  destination: DestinationModel;
  itinerary_img: string;
}

export const getPackageItineraryTemplate = async (): Promise<PackageItineraryModelTemplate[]> => {
  try {
    const response = await api.get<PackageItineraryModelTemplate[]>(`/admin_apis/packages/itinerary_templates/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updatePackageItineraryTemplate = async (formData) => {
  const response = await api.patch(`/admin_apis/packages/itinerary_templates/`, formData,  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const createPackageItineraryTemplate = async (formData: {
  itinerary_title: string;
  itinerary_description: string;
  destination_id: string;
  itinerary_img: string;
}) => {
  const data = new FormData();
  data.append("itinerary_title", formData.itinerary_title);
  data.append("itinerary_description", formData.itinerary_description);
  data.append("destination_id", formData.destination_id);
  if (typeof formData.itinerary_img === "string" && formData.itinerary_img.startsWith("data:image")) {
      const file = base64ToFile(formData.itinerary_img);
      data.append("itinerary_img", file);
    } else if (formData.itinerary_img) {
      data.append("itinerary_img", formData.itinerary_img);
    }
  const response = await api.post("/admin_apis/packages/itinerary_templates/", data,  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const deletePackageItineraryTemplate = async (id: string) => {
  const response = await api.delete(`/admin_apis/packages/itinerary_templates/?id=${id}`);
  return response;
};