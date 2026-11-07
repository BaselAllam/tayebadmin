import api from "@/services/api";
import axios from "axios";
import { base64ToFile } from "./CoreServices";
import { SuppliersModel } from "./SuppliersServices";

export interface ExpensesModel {
    id: string;
    item: string;
    qty: number;
    expense_amount: number;
    unit_type: string;
    notes: string;
    purchase_date: string;
    created_at: string;
    created_by: {
        'id': string,
        'first_name': string,
        'last_name': string,
        'phone': string,
    };
    purchased_by: {
        'id': string,
        'first_name': string,
        'last_name': string,
        'phone': string,
    };
    is_archived: boolean;
    purchase_receipt: string;
    supplier: SuppliersModel;
}

export const getExpenses = async (): Promise<ExpensesModel[]> => {
  try {
    const response = await api.get<ExpensesModel[]>(`/admin_apis/finance/expenses/`);
    return response.data['data'];
    } catch (e) {
    if (axios.isAxiosError(e)) {
        const message = e.response.data['data'];
    }
    throw new Error("Unexpected error occurred");
    }
};

export const updateExpenses = async (formData) => {
  const response = await api.patch(`/admin_apis/finance/expenses/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const createExpenses = async (formData: {
  item: string;
  qty: number;
  expense_amount: number;
  notes: string;
  unit_type: string;
  purchase_date: string;
  purchased_by: string;
  is_archived: boolean;
  purchase_receipt: File | string | null;
}) => {
  const data = new FormData();
  data.append("item", formData.item);
  data.append("qty", String(formData.qty));
  data.append("expense_amount", String(formData.expense_amount));
  data.append("unit_type", formData.unit_type);
  data.append("notes", formData.notes);
  data.append("purchase_date", formData.purchase_date);
  data.append("purchased_by", formData.purchased_by);
  data.append("is_archived", String(formData.is_archived));

  if (formData.purchase_receipt instanceof File) {
    data.append("purchase_receipt", formData.purchase_receipt);
  } else if (typeof formData.purchase_receipt === "string" && formData.purchase_receipt.startsWith("data:image")) {
    data.append("purchase_receipt", base64ToFile(formData.purchase_receipt));
  }

  const response = await api.post("/admin_apis/finance/expenses/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};