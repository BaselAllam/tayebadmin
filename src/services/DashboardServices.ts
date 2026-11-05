import axios from "axios";
import api from "./api";
import { PackageBookingModel } from "./PackageBookingServices";


export interface DashboardModel {
    active_packages: number;
    total_bookings: number;
    pending_bookings: number;
    collected_revenue: number;
    outstanding_balance: number;
    users: number;
    destinations: number;
    contact_requests: number;
    packages_performance: {
        'package_name': string;
        'package_total_rev': number,
    }[];
    booking_by_status: {
        Submitted: number,
        InProgress: number,
        Approved: number,
        Cancelled: number,
    };
    pending_bookings_data: PackageBookingModel[];
}


export const getDashboard = async (): Promise<DashboardModel> => {
  try {
    const response = await api.get<DashboardModel>(`/admin_apis/dashboard/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};