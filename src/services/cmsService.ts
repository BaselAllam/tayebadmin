import axios from "axios";
import api from "./api";
import { base64ToFile } from "./CoreServices";

export interface OurBranchesModel {
    id: string;
    name: string;
    city: string;
    number: string;
    address: string;
    email: string;
}

export const getOurBranches = async (): Promise<OurBranchesModel[]> => {
  try {
    const response = await api.get<OurBranchesModel[]>(`/admin_apis/cms/branches/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateOurBranches = async (formData) => {
  const response = await api.patch(`/admin_apis/cms/branches/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const deleteOurBranch = async (id: string) => {
  const response = await api.delete(`/admin_apis/cms/branches/?id=${id}`);
  return response;
};

export const createOurBranches = async (formData: {
    name: string;
    city: string;
    number: string;
    address: string;
    email: string;
}) => {
  const data = new FormData();
  data.append("name", formData.name);
  data.append("city", formData.city);
  data.append("number", formData.number);
  data.append("address", formData.address);
  data.append("email", formData.email);

  const response = await api.post("/admin_apis/cms/branches/", data);
  return response;
};


export interface SiteImagesModel {
    id: string;
    image: string;
    page: string;
    img_position: string;
}

export const getOurSitesImages = async (): Promise<SiteImagesModel[]> => {
  try {
    const response = await api.get<SiteImagesModel[]>(`/admin_apis/cms/site_imgs/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateSitesImages = async (formData) => {
  const response = await api.patch(`/admin_apis/cms/site_imgs/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const deleteSiteImg = async (id: string) => {
  const response = await api.delete(`/admin_apis/cms/site_imgs/?id=${id}`);
  return response;
};

export const createSitesImages = async (formData: {
    image: string | File;
    page: string;
    img_position: string;
}) => {
  const data = new FormData();
  data.append("page", formData.page);
  data.append("img_position", formData.img_position);
  if (typeof formData.image === "string" && formData.image.startsWith("data:image")) {
    const file = base64ToFile(formData.image);
    data.append("image", file);
  } else if (formData.image) {
    data.append("image", formData.image);
  }


  const response = await api.post("/admin_apis/cms/site_imgs/", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};


export interface SiteContentModel {
    id: string;
    page: string;
    content_key: string;
    content: string;
    content_de: string;
}

export const getSiteContent = async (): Promise<SiteContentModel[]> => {
  try {
    const response = await api.get<SiteContentModel[]>(`/admin_apis/cms/site_content/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateSiteContent = async (formData) => {
  const response = await api.patch(`/admin_apis/cms/site_content/`, formData);
  return response;
};


export const createSiteContent = async (formData: {
  page: string;
  content_key: string;
  content: string;
  content_de: string;
}) => {
  const data = new FormData();
  data.append("page", formData.page);
  data.append("content_key", formData.content_key);
  data.append("content", formData.content);
  data.append("content_de", formData.content_de);

  const response = await api.post("/admin_apis/cms/site_content/", data);
  return response;
};