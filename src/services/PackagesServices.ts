import api from "@/services/api";
import axios from "axios";
import { base64ToFile, DestinationModel } from "./CoreServices";
import { PackageHighlightsModelTemplate } from "./HighlightsTemplateServices";
import { PackageBenefitsModelTemplate } from "./BenefitsTemplateServices";
import { PackageItineraryModelTemplate } from "./ItineraryTemplateServices";

export interface PackageTypeModel {
    id: string;
    type_title: string;
    type_title_de: string;
    type_img: string;
    is_archived: boolean;
    is_holy: boolean;
}

export const getPackageTypes = async (): Promise<PackageTypeModel[]> => {
  try {
    const response = await api.get<PackageTypeModel[]>(`/admin_apis/packages/package_types/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updatePackageTypes = async (formData) => {
  const response = await api.patch(`/admin_apis/packages/package_types/`, formData,  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const createPackageTypes = async (formData: {
    type_title: string;
    type_title_de: string;
    type_img: string;
    is_archived: boolean;
    is_holy: boolean;
}) => {
  const data = new FormData();
  data.append("type_title", formData.type_title);
  data.append("type_title_de", formData.type_title_de);
  data.append("is_archived", String(formData.is_archived));
  data.append("is_holy", String(formData.is_holy));
  if (typeof formData.type_img === "string" && formData.type_img.startsWith("data:image")) {
    const file = base64ToFile(formData.type_img);
    data.append("type_img", file);
  } else if (formData.type_img) {
    data.append("type_img", formData.type_img);
  }
  const response = await api.post("/admin_apis/packages/package_types/", data,  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export interface PackageHighlightsModel {
  id: string;
  highlights: PackageHighlightsModelTemplate;
}

export interface PackageBenefitsModel {
  id: string;
  benefit: PackageBenefitsModelTemplate;
  is_included: boolean;
}

export interface PackageItineraryModel {
  id: string;
  itinerary: PackageItineraryModelTemplate;
}

export interface PackageDestinationModel {
  id: string;
  destination: DestinationModel;
}

export interface PackagePricingModel {
  id: string;
  title: string;
  description: string;
  price: string;
  price_currency: string;
  date_from: string;
  date_to: string;
  depature_day: string;
  is_active: boolean;
}

export interface PackageModel {
  id: string;
  package_destinations: PackageDestinationModel[];
  package_type: PackageTypeModel;
  package_title: string;
  package_img: string;
  package_description: string;
  package_duration: number;
  package_highlights: PackageHighlightsModel[];
  package_itinerary: PackageItineraryModel[];
  package_include: PackageBenefitsModel[];
  package_pricing: PackagePricingModel[];
  is_active: boolean;
}

export const getPackages = async (): Promise<PackageModel[]> => {
  try {
    const response = await api.get<PackageModel[]>(`/admin_apis/packages/packages/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updatePackage = async (formData) => {
  const response = await api.patch(`/admin_apis/packages/packages/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const createPackage = async (formData: {
  package_type: string;
  package_title: string;
  package_img: string | File;
  package_description: string;
  package_duration: number;
  is_active: boolean;
}) => {
  const data = new FormData();
  data.append("package_type_id", formData.package_type);
  data.append("package_title", formData.package_title);
  data.append("package_description", formData.package_description);
  data.append("package_duration", String(formData.package_duration));
  data.append("is_active", String(formData.is_active))

  if (typeof formData.package_img === "string" && formData.package_img.startsWith("data:image")) {
    const file = base64ToFile(formData.package_img);
    data.append("package_img", file);
  } else if (formData.package_img) {
    data.append("package_img", formData.package_img);
  }
  
  const response = await api.post("/admin_apis/packages/packages/", data, {headers: {
    'Content-Type': 'multipart/form-data',
  },});
  return response;
};

export const assignPackageHighlight = async (formData: {
  package_id: string;
  highlight_id: string;
}) => {
  const data = new FormData();
  data.append("package_id", formData.package_id);
  data.append("highlight_id", formData.highlight_id);
  const response = await api.post("/admin_apis/packages/manage_packages_highlights/", data);
  return response;
};

export const deletePackageHighlight = async (id: string) => {
  const response = await api.delete(`/admin_apis/packages/manage_packages_highlights/?id=${id}`);
  return response;
};

export const assignPackageBenefit = async (formData: {
  package_id: string;
  benefit_id: string;
  is_included: string;
}) => {
  const data = new FormData();
  data.append("package_id", formData.package_id);
  data.append("benefit_id", formData.benefit_id);
  data.append("is_included", String(formData.is_included));
  const response = await api.post("/admin_apis/packages/manage_packages_benefits/", data);
  return response;
};

export const updatePackageBenefit = async (formData: {
  id: string;
  is_included: boolean;
}) => {
  const data = new FormData();
  data.append("id", formData.id);
  data.append("is_included", String(formData.is_included));
  const response = await api.put("/admin_apis/packages/manage_packages_benefits/", data);
  return response;
};

export const deletePackageBenefit = async (id: string) => {
  const response = await api.delete(`/admin_apis/packages/manage_packages_benefits/?id=${id}`);
  return response;
};

export const assignPackageItinerary = async (formData: {
  package_id: string;
  itinerary_id: string;
}) => {
  const data = new FormData();
  data.append("package_id", formData.package_id);
  data.append("itinerary_id", formData.itinerary_id);
  const response = await api.post("/admin_apis/packages/manage_packages_itinerary/", data);
  return response;
};

export const deletePackageItinerary = async (id: string) => {
  const response = await api.delete(`/admin_apis/packages/manage_packages_itinerary/?id=${id}`);
  return response;
};

export const assignPackageDestination = async (formData: {
  package_id: string;
  destination_id: string;
}) => {
  const data = new FormData();
  data.append("package_id", formData.package_id);
  data.append("destination_id", formData.destination_id);
  const response = await api.post("/admin_apis/packages/manage_packages_destinations/", data);
  return response;
};

export const deletePackageDestination = async (id: string) => {
  const response = await api.delete(`/admin_apis/packages/manage_packages_destinations/?id=${id}`);
  return response;
};

export const createPackagePricing = async (formData: {
  package_id: string;
  title: string;
  description: string;
  price: string;
  price_currency: string;
  date_from: string;
  date_to: string;
  depature_day: string;
  is_active: boolean;
}) => {
  const data = new FormData();
  data.append("package_id", formData.package_id);
  data.append("title", formData.title);
  data.append("description", formData.description);
  data.append("price", formData.price);
  data.append("price_currency", formData.price_currency);
  data.append("date_from", formData.date_from);
  data.append("date_to", formData.date_to);
  if (formData.depature_day && Number(formData.depature_day) !== 0) {
    data.append("depature_day", formData.depature_day);
  }
  data.append("is_active", String(formData.is_active));
  const response = await api.post("/admin_apis/packages/manage_packages_pricinig/", data);
  return response;
};

export const updatePackagePricing = async (formData) => {
  const response = await api.patch("/admin_apis/packages/manage_packages_pricinig/", formData);
  return response;
};