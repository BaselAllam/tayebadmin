import { useQuery } from '@tanstack/react-query';
import { getUserData } from '@/services/AuthService';
import { getAllUsersData, getUsersActivities } from '@/services/UsersServices';
import { getContactUs, getDestinations, getFaqs, getGallery } from '@/services/CoreServices';
import { getPackages, getPackageTypes } from '@/services/PackagesServices';
import { getDashboard } from '@/services/DashboardServices';
import { getOurBranches, getOurSitesImages, getSiteContent } from '@/services/cmsService';
import { getPackageHighlightsTemplate } from '@/services/HighlightsTemplateServices';
import { getPackageBenefitsTemplate } from '@/services/BenefitsTemplateServices';
import { getPackageItineraryTemplate } from '@/services/ItineraryTemplateServices';
import { getPackageBookings } from '@/services/PackageBookingServices';


export const useGetUserData = () => {
  const token = localStorage.getItem("token");
  
  return useQuery({
    queryKey: ['userData'],
    queryFn: getUserData,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsersData
  });
};

export const useGetContactUs = () => {
  return useQuery({
    queryKey: ['contactUs'],
    queryFn: getContactUs
  });
};

export const useGetFaqs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: getFaqs
  });
};

export const useGetGallery = () => {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: getGallery
  });
};

export const useGetDestinations = () => {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: getDestinations
  });
};

export const useGetPackageTypes = () => {
  return useQuery({
    queryKey: ['packageTypes'],
    queryFn: getPackageTypes
  });
};

export const useGetPackage = () => {
  return useQuery({
    queryKey: ['packages'],
    queryFn: getPackages
  });
};

export const useGetUsersActivites = (user_id?: string, action?: string) => {
  return useQuery({
    queryKey: ['activities', user_id, action],
    queryFn: () => getUsersActivities(user_id, action)
  });
};

export const useGetPackageBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: getPackageBookings
  });
};

export const useGetDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard
  });
};

export function useGetOurBranches() {
  return useQuery({
    queryKey: ["cms-branches"],
    queryFn: getOurBranches,
  });
}
 
export function useGetSiteImages() {
  return useQuery({
    queryKey: ["cms-site-images"],
    queryFn: getOurSitesImages,
  });
}

export function useGetSiteContent() {
  return useQuery({
    queryKey: ["cms-site-content"],
    queryFn: getSiteContent,
  });
}

export function useGetPackageHighlightsTemplates() {
  return useQuery({
    queryKey: ["package-highlights"],
    queryFn: getPackageHighlightsTemplate,
  });
}

export function useGetPackageBenefitsTemplates() {
  return useQuery({
    queryKey: ["package-benefits"],
    queryFn: getPackageBenefitsTemplate,
  });
}

export function useGetPackageItinerariesTemplates() {
  return useQuery({
    queryKey: ["package-itineraries"],
    queryFn: getPackageItineraryTemplate,
  });
}