import { DashboardStats, ReturnItem, FraudLogItem, Hub, Order } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  const data = await res.json();
  return data.data;
}

export async function fetchRecentReturns(): Promise<ReturnItem[]> {
  const res = await fetch(`${API_BASE}/dashboard/recent-returns`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch recent returns");
  const data = await res.json();
  return data.data;
}

export async function fetchFraudAlerts(): Promise<FraudLogItem[]> {
  const res = await fetch(`${API_BASE}/dashboard/fraud-alerts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch fraud alerts");
  const data = await res.json();
  return data.data;
}

export async function reviewFraudAlert(
  id: string,
  action: "approve" | "quarantine",
  notes: string = ""
): Promise<any> {
  const res = await fetch(`${API_BASE}/dashboard/fraud-review/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, notes }),
  });
  if (!res.ok) throw new Error("Failed to review fraud alert");
  return res.json();
}

export async function fetchMapData(): Promise<{ hubs: Hub[]; activeReturns: ReturnItem[] }> {
  const res = await fetch(`${API_BASE}/dashboard/map-data`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch map data");
  const data = await res.json();
  return data.data;
}

export async function fetchReturnById(id: string): Promise<ReturnItem> {
  const res = await fetch(`${API_BASE}/returns/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch return details");
  const data = await res.json();
  return data.data;
}

export async function processReturnRouting(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/routing/process/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to process return routing");
  return res.json();
}

export async function fetchPendingOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders?status=pending&limit=15`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = await res.json();
  return data.data;
}

export async function createReturnRequest(formData: FormData): Promise<ReturnItem> {
  const res = await fetch(`${API_BASE}/returns`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to submit return request");
  const data = await res.json();
  return data.data;
}
