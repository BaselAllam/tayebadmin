import { UserProfileModel } from "@/contexts/AuthContext";
import { PackageModel, PackagePricingModel } from "./PackagesServices";
import axios from "axios";
import api from "./api";

export interface PackageBookingModel {
    id: string;
    user: UserProfileModel;
    package: PackageModel;
    package_pricing: PackagePricingModel;
    number_of_adults: number;
    number_of_childrens: number;
    submitted_at: String;
    booking_status: String;
    paid_amount: number;
    remaining_amount: number;
    total_amount: number;
    check_in_date: string;
}

export const getPackageBookings = async (): Promise<PackageBookingModel[]> => {
  try {
    const response = await api.get<PackageBookingModel[]>(`/admin_apis/packages/packages_bookings/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updatePackageBookings = async (formData) => {
  const response = await api.patch(`/admin_apis/packages/packages_bookings/`, formData);
  return response;
};

export const createPackageBookings = async (formData: {
  user_id: string;
  package_id: string;
  package_pricing_id: string;
  number_of_adults: string;
  number_of_childrens: string;
  booking_status: string;
  paid_amount: string;
  remaining_amount: string;
  check_in_date: string;
}) => {
  const data = new FormData();
  data.append("user_id", formData.user_id);
  data.append("package_id", formData.package_id);
  data.append("package_pricing_id", formData.package_pricing_id);
  data.append("number_of_adults", formData.number_of_adults);
  data.append("number_of_childrens", formData.number_of_childrens);
  data.append("booking_status", formData.booking_status);
  data.append("paid_amount", formData.paid_amount);
  data.append("remaining_amount", formData.remaining_amount);
  data.append("check_in_date", formData.check_in_date);
  const response = await api.post("/admin_apis/packages/packages_bookings/", data);
  return response;
};