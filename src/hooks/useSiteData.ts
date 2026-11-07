import { useQuery } from '@tanstack/react-query';
import { getUserData } from '@/services/AuthService';
import { getAllUsersData } from '@/services/UsersServices';
import { getCities, getContactUs, getFaqs } from '@/services/CoreServices';
import { getDashboard } from '@/services/DashboardServices';
import { getOurReviews } from '@/services/ReviewsServices';
import { getExpenses } from '@/services/ExpensesServices';
import { getSuppliers } from '@/services/SuppliersServices';
import { getProductCategories, getProducts } from '@/services/ProductsServices';


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

export const useGetCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: getCities
  });
};

export const useGetDashboard = (range) => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard(range)
  });
};

export const useGetOurReviews = () => {
  return useQuery({
    queryKey: ['ourReviews'],
    queryFn: getOurReviews
  });
};

export const useGetExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses
  });
};

export const useGetSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers
  });
};

export const useGetProductsCategories = () => {
  return useQuery({
    queryKey: ['products-categories'],
    queryFn: getProductCategories
  });
};

export const useGetProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
};