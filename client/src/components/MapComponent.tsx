"use client";

import { useEffect, useState } from "react";
import { Hub, ReturnItem } from "../types";

interface MapComponentProps {
  hubs: Hub[];
  returns: ReturnItem[];
}

export default function MapComponent({ hubs, returns }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[600px] w-full rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <span className="text-sm font-medium text-slate-400">Loading Geospatial Engine...</span>
        </div>
      </div>
    );
  }

  // Dynamic import of Leaflet inside useEffect or inner component
  return <LeafletMap hubs={hubs} returns={returns} />;
}

function LeafletMap({ hubs, returns }: { hubs: Hub[]; returns: ReturnItem[] }) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (!L) return;

    // Fix standard leaflet icon path issues in React
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const mapContainer = document.getElementById("leaflet-map-container");
    if (!mapContainer) return;

    // Center on India (lat 21.7679, lng 78.8718)
    const map = L.map("leaflet-map-container").setView([22.5, 78.9], 5);

    // CartoDB Dark Matter tiles for modern dark theme
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add Central Warehouse (Delhi)
    const warehouseIcon = L.divIcon({
      className: "custom-pin",
      html: `<div style="background-color: #f43f5e; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid #ffffff; box-shadow: 0 0 15px rgba(244,63,94,0.6);">🏭</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const warehouseMarker = L.marker([28.4595, 77.0266], { icon: warehouseIcon }).addTo(map);
    warehouseMarker.bindPopup(`
      <div style="font-family: sans-serif; color: #f8fafc;">
        <strong style="color: #f43f5e; font-size: 14px;">🏭 Central Warehouse</strong><br/>
        <span style="font-size: 11px; color: #94a3b8;">Delhi NCR Mega Depot</span><br/>
        <div style="margin-top: 6px; font-size: 12px; color: #cbd5e1;">All high-risk fraud & damaged returns converge here.</div>
      </div>
    `);

    // Add Regional Hubs
    hubs.forEach((hub) => {
      const lat = hub.location.coordinates[1];
      const lng = hub.location.coordinates[0];
      const hubIcon = L.divIcon({
        className: "custom-pin",
        html: `<div style="background-color: #6366f1; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid #ffffff; box-shadow: 0 0 12px rgba(99,102,241,0.5);">📦</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon: hubIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #f8fafc;">
          <strong style="color: #818cf8; font-size: 13px;">📦 ${hub.name}</strong><br/>
          <span style="font-size: 11px; color: #94a3b8;">${hub.code} • Capacity: ${hub.capacity} units</span><br/>
          <div style="margin-top: 4px; font-size: 12px; color: #cbd5e1;">Current Stocked Interceptions: ${hub.currentStock}</div>
        </div>
      `);
    });

    // Add Active Returns & Rerouted Paths
    returns.forEach((ret) => {
      if (!ret.pickupAddress?.coordinates) return;
      const origin = [ret.pickupAddress.coordinates.lat, ret.pickupAddress.coordinates.lng];

      const returnPin = L.divIcon({
        className: "custom-pin",
        html: `<div style="background-color: ${
          ret.routingDestination === "direct_to_customer" 
            ? "#10b981" 
            : ret.routingDestination === "nearby_hub" 
            ? "#3b82f6" 
            : "#f59e0b"
        }; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">🔄</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const returnMarker = L.marker(origin, { icon: returnPin }).addTo(map);
      returnMarker.bindPopup(`
        <div style="font-family: sans-serif; color: #f8fafc; min-width: 180px;">
          <div style="font-size: 10px; font-weight: bold; color: #818cf8; letter-spacing: 0.5px;">${ret.returnId}</div>
          <strong style="font-size: 13px; color: #f1f5f9;">${ret.productId?.name || "Product"}</strong><br/>
          <span style="font-size: 11px; color: #94a3b8;">From: ${ret.pickupAddress.city}</span>
          <div style="margin-top: 6px; padding: 4px 6px; background: rgba(15,23,42,0.8); border-radius: 6px; font-size: 11px;">
            Destination: <strong style="color: #34d399;">${ret.routingDestination ? ret.routingDestination.replace(/_/g, " ") : "Calculating..."}</strong>
          </div>
          ${ret.costSaved ? `<div style="margin-top: 4px; font-size: 11px; color: #10b981;">💰 Saved ₹${ret.costSaved.toLocaleString()} • ⏱️ ${ret.timeSaved}h faster</div>` : ''}
        </div>
      `);

      // Draw polyline if routed
      if (ret.routingDestination === "direct_to_customer" && (ret.matchedOrderId as any)?.deliveryAddress?.coordinates) {
        const target = [
          (ret.matchedOrderId as any).deliveryAddress.coordinates.lat,
          (ret.matchedOrderId as any).deliveryAddress.coordinates.lng,
        ];
        L.polyline([origin, target], {
          color: "#10b981",
          weight: 3,
          dashArray: "6, 6",
          opacity: 0.85,
        }).addTo(map);
      } else if (ret.routingDestination === "nearby_hub" && (ret.assignedHubId as any)?.location?.coordinates) {
        const target = [
          (ret.assignedHubId as any).location.coordinates[1],
          (ret.assignedHubId as any).location.coordinates[0],
        ];
        L.polyline([origin, target], {
          color: "#6366f1",
          weight: 2.5,
          dashArray: "4, 6",
          opacity: 0.75,
        }).addTo(map);
      } else if (ret.routingDestination === "central_warehouse") {
        L.polyline([origin, [28.4595, 77.0266]], {
          color: "#f43f5e",
          weight: 1.5,
          opacity: 0.4,
        }).addTo(map);
      }
    });

    return () => {
      map.remove();
    };
  }, [L, hubs, returns]);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div id="leaflet-map-container" className="w-full h-full z-10" />

      {/* Legend overlay */}
      <div className="absolute top-4 right-4 z-20 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-800 p-3 shadow-lg text-xs space-y-2">
        <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Route Legend</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
          <span>Direct to Customer (Peer)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="h-3 w-3 rounded-full bg-indigo-500 inline-block" />
          <span>Regional Hub (Stage)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
          <span>Central Warehouse</span>
        </div>
      </div>
    </div>
  );
}

