import api from "@/services/api";
import axios from "axios";

export interface OurReviewsModel {
    id: string;
    rate: string;
    review: string;
    is_archived: boolean;
    is_top: boolean;
    created_at: string;
    user: {
        'id': string,
        'first_name': string,
        'last_name': string,
        'phone': string,
    };
    order: {
        'id': string,
        'created_at': string,
        'status': string,
    }
}

export const getOurReviews = async (): Promise<OurReviewsModel[]> => {
  try {
    const response = await api.get<OurReviewsModel[]>(`/admin_apis/reviews/our-reviews/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateOurReviews = async (formData) => {
  const response = await api.patch(`/admin_apis/reviews/our-reviews/`, formData);
  return response;
};

export const createOurReviews = async (formData: {
    user_id: string;
    order_id: string;
    rate: string;
    review: string;
    is_archived: boolean;
    is_top: boolean;
}) => {
  const data = new FormData();
  data.append("rate", formData.rate);
  data.append("review", formData.review);
  data.append("is_archived", String(formData.is_archived));
  data.append("is_top", String(formData.is_top));
  data.append("user_id", formData.user_id);
  data.append("order_id", formData.order_id);
  const response = await api.post("/admin_apis/reviews/our-reviews/", data);
  return response;
};
