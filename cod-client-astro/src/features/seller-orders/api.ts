import { apiFetch } from "@/lib/api";

export interface SellerOrderLine {
  id: string;
  productId: string | null;
  productName: string;
  variantId: string | null;
  variantLabel: string | null;
  sku: string | null;
  quantity: number;
  pricePerUnit: number;
  lineTotal: number;
  discount: number;
  reward: boolean;
}

export interface SellerOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  codAmount: number;
  createdAt: string;
  parentOrderNumber: string;
  status: string;
  customerName: string;
  phone: string;
  wilayaId: number | null;
  communeId: string | null;
  address: string | null;
  deliveryType: string;
  notes?: string | null;
  products?: SellerOrderLine[];
}

interface DataEnvelope<T> {
  success: boolean;
  data: T;
  count?: number;
}

export async function listMySellerOrders(): Promise<SellerOrder[]> {
  const response = await apiFetch<DataEnvelope<SellerOrder[]>>("/api/seller/orders?limit=50&offset=0");
  return response.data;
}

export async function getMySellerOrder(id: string): Promise<SellerOrder> {
  const response = await apiFetch<DataEnvelope<SellerOrder>>(`/api/seller/orders/${encodeURIComponent(id)}`);
  return response.data;
}
