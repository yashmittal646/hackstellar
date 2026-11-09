export type ReturnStatus =
  | "initiated"
  | "picked_up"
  | "in_transit"
  | "condition_check"
  | "routed"
  | "out_for_delivery"
  | "delivered"
  | "warehouse_received";

export type RoutingDestination = "direct_to_customer" | "nearby_hub" | "central_warehouse";

export type ConditionGrade = "pristine" | "good" | "fair" | "damaged" | "defective";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: Coordinates;
  };
  totalOrders: number;
  totalReturns: number;
  fraudScore: number;
  role: "customer" | "admin";
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  weight: number;
  sku: string;
  imageUrl?: string;
}

export interface Hub {
  _id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  capacity: number;
  currentStock: number;
  isActive: boolean;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: User | string;
  productId: Product | string;
  quantity: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: Coordinates;
  };
  expectedDelivery: string;
  totalAmount: number;
  createdAt: string;
}

export interface TimelineEvent {
  status: ReturnStatus;
  timestamp: string;
  location?: string;
  notes?: string;
}

export interface ReturnItem {
  _id: string;
  returnId: string;
  originalOrderId: Order | string;
  userId: User;
  productId: Product;
  reason: string;
  reasonCategory:
    | "wrong_item"
    | "damaged"
    | "not_as_described"
    | "changed_mind"
    | "defective"
    | "size_issue"
    | "other";
  status: ReturnStatus;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: Coordinates;
  };
  conditionImages: string[];
  conditionGrade: ConditionGrade;
  conditionScore: number;
  fraudScore: number;
  fraudFlags: string[];
  fraudRisk: "low" | "medium" | "high";
  routingDestination?: RoutingDestination;
  routingScore: number;
  routingReasoning?: {
    conditionFactor: number;
    demandFactor: number;
    fraudFactor: number;
    proximityFactor: number;
    timeSavingsFactor: number;
  };
  matchedOrderId?: Order;
  assignedHubId?: Hub;
  originalDistance: number;
  optimizedDistance: number;
  costSaved: number;
  co2Saved: number;
  timeSaved: number;
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface DashboardStats {
  totalReturns: number;
  activeReturns: number;
  totalOrders: number;
  totalHubs: number;
  totalFraudAlerts: number;
  routingBreakdown: Record<string, number>;
  fraudBreakdown: Record<string, number>;
  savings: {
    totalCostSaved: number;
    totalCo2Saved: number;
    totalTimeSaved: number;
    avgConditionScore: number;
    distanceSaved: number;
  };
}

export interface FraudLogItem {
  _id: string;
  returnId: {
    _id: string;
    returnId: string;
    userId: { name: string; email: string };
    productId: { name: string; price: number };
  };
  userId: string;
  score: number;
  risk: "low" | "medium" | "high";
  flags: {
    flag: string;
    description: string;
    weight: number;
    triggered: boolean;
  }[];
  createdAt: string;
}

