import { apiRequest } from "@/client/api/client";
import type { Order } from "@/client/app/App";

export async function createOrder(order: Order, userId?: string): Promise<Order> {
  return apiRequest<Order>("/orders", {
    method: "POST",
    body: {
      ...order,
      userId,
    },
  });
}

export async function fetchOrders(userId?: string): Promise<Order[]> {
  const sp = new URLSearchParams();
  if (userId) sp.set("userId", userId);
  const res = await apiRequest<{ orders: Order[] }>(`/orders${sp.toString() ? `?${sp.toString()}` : ""}`);
  return res.orders;
}
