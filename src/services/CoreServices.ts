import api from "@/services/api";
import axios from "axios";

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
    faq_title_de: string;
    faq_description: string;
    faq_description_de: string;
    is_archived: boolean;
}

export const getFaqs = async (): Promise<FaqsModel[]> => {
  try {
    const response = await api.get<FaqsModel[]>(`/admin_apis/core/faqs/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateFaqs = async (formData) => {
  const response = await api.patch(`/admin_apis/core/faqs/`, formData);
  return response;
};

export const createFaqs = async (formData: {
  faq_title: string;
  faq_title_de: string;
  faq_description: string;
  faq_description_de: string;
  is_archived: boolean;
}) => {
  const data = new FormData();
  data.append("faq_title", formData.faq_title);
  data.append("faq_title_de", formData.faq_title_de);
  data.append("faq_description", formData.faq_description);
  data.append("faq_description_de", formData.faq_description_de);
  data.append("is_archived", String(formData.is_archived));
  const response = await api.post("/admin_apis/core/faqs/", data);
  return response;
};

export interface GalleryModel {
    id: string;
    img: string;
    is_archived: boolean;
}

export const getGallery = async (): Promise<GalleryModel[]> => {
  try {
    const response = await api.get<GalleryModel[]>(`/admin_apis/core/gallery/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateGallery = async (formData) => {
  const response = await api.patch(`/admin_apis/core/gallery/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const createGallery = async (formData: {
  img: string | File;
  is_archived: boolean;
}) => {
  const data = new FormData();
  if (typeof formData.img === "string" && formData.img.startsWith("data:image")) {
    const file = base64ToFile(formData.img);
    data.append("img", file);
  } else if (formData.img) {
    data.append("img", formData.img);
  }
  data.append("is_archived", String(formData.is_archived));
  const response = await api.post("/admin_apis/core/gallery/", data, {headers: {
    'Content-Type': 'multipart/form-data',
  },});
  return response;
};


export interface DestinationModel {
    id: string;
    destination_name: string;
    destination_name_de: string;
    destination_description: string;
    destination_description_de: string;
    img: string;
    is_archived: boolean;
}

export const getDestinations = async (): Promise<DestinationModel[]> => {
  try {
    const response = await api.get<DestinationModel[]>(`/admin_apis/core/destinations/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateDestinations = async (formData) => {
  const response = await api.patch(`/admin_apis/core/destinations/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

export const createDestinations = async (formData: {
  destination_name: string;
  destination_name_de: string;
  destination_description: string;
  destination_description_de: string;
  img: string | File;
  is_archived: boolean;
}) => {
  const data = new FormData();
  data.append("destination_name", formData.destination_name);
  data.append("destination_name_de", formData.destination_name_de);
  data.append("destination_description", formData.destination_description);
  data.append("destination_description_de", formData.destination_description_de);
  data.append("is_archived", String(formData.is_archived));
  if (typeof formData.img === "string" && formData.img.startsWith("data:image")) {
    const file = base64ToFile(formData.img);
    data.append("img", file);
  } else if (formData.img) {
    data.append("img", formData.img);
  }

  const response = await api.post("/admin_apis/core/destinations/", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};