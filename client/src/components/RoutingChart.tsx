"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { DashboardStats } from "../types";

interface RoutingChartProps {
  stats: DashboardStats;
}

const COLORS: Record<string, string> = {
  direct_to_customer: "#10b981", // Emerald
  nearby_hub: "#6366f1",         // Indigo
  central_warehouse: "#f43f5e",  // Rose
  unrouted: "#64748b",           // Slate
};

const LABELS: Record<string, string> = {
  direct_to_customer: "Direct to Customer (Peer Reroute)",
  nearby_hub: "Regional Hub (Staged Demand)",
  central_warehouse: "Central Warehouse (Damage/Fraud)",
  unrouted: "Pending Decision",
};

export function RoutingChart({ stats }: RoutingChartProps) {
  const chartData = Object.entries(stats.routingBreakdown).map(([key, value]) => ({
    name: LABELS[key] || key,
    rawKey: key,
    value,
  }));

  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.rawKey] || "#8884d8"} 
                stroke="#0f172a" 
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#0f172a", 
              borderColor: "#334155", 
              borderRadius: "0.75rem",
              color: "#f8fafc"
            }} 
            itemStyle={{ color: "#f8fafc" }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

