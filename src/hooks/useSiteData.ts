import { useQuery } from '@tanstack/react-query';
import { getUserData } from '@/services/AuthService';
import { getAllUsersData } from '@/services/UsersServices';
import { getContactUs, getFaqs } from '@/services/CoreServices';
import { getDashboard } from '@/services/DashboardServices';


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

export const useGetDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard
  });
};