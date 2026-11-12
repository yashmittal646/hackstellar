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

export async function runAgentInspect(payload: {
  productName?: string;
  category?: string;
  price?: number;
  claimedReason?: string;
  userId?: string;
  pickupCoords?: { lat: number; lng: number };
  productWeight?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/agents/inspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Agent pipeline failed");
  const data = await res.json();
  return data.data;
}

export async function askCopilot(context: any, question: string): Promise<string> {
  const res = await fetch(`${API_BASE}/agents/copilot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, question }),
  });
  if (!res.ok) throw new Error("Copilot query failed");
  const data = await res.json();
  return data.data.answer;
}

export async function fetchAllReturns(): Promise<ReturnItem[]> {
  const res = await fetch(`${API_BASE}/returns?limit=50`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch returns");
  const data = await res.json();
  return data.data;
}

export interface BarcodeResult {
  barcode: string;
  recognized: boolean;
  source: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    imageUrl: string;
    sku: string;
  };
  return: { _id: string; returnId: string; status: string } | null;
}

export async function lookupBarcode(barcode: string): Promise<BarcodeResult> {
  const res = await fetch(`${API_BASE}/barcode/${barcode}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Barcode lookup failed");
  const data = await res.json();
  return data.data;
}
