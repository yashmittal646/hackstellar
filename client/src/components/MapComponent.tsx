"use client";

import { useEffect, useState, useRef } from "react";
import { Hub, ReturnItem } from "../types";
import { Eye, ExternalLink, X, MapPin, Compass, Navigation } from "lucide-react";

interface MapComponentProps {
  hubs: Hub[];
  returns: ReturnItem[];
}

type OpenFreeMapStyle = "liberty" | "bright" | "positron";

const STYLES: Record<OpenFreeMapStyle, { name: string; url: string }> = {
  liberty: {
    name: "Liberty",
    url: "https://tiles.openfreemap.org/styles/liberty",
  },
  positron: {
    name: "Positron",
    url: "https://tiles.openfreemap.org/styles/positron",
  },
  bright: {
    name: "Bright",
    url: "https://tiles.openfreemap.org/styles/bright",
  },
};

interface StreetViewTarget {
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  category?: string;
}

export default function MapComponent({ hubs, returns }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<OpenFreeMapStyle>("liberty");
  const [streetViewTarget, setStreetViewTarget] = useState<StreetViewTarget | null>(null);
  const [pegmanActive, setPegmanActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Expose global callback for Leaflet popup HTML buttons
    (window as any).__openStreetView = (lat: number, lng: number, title: string, subtitle?: string, category?: string) => {
      setStreetViewTarget({ lat, lng, title, subtitle, category });
    };
    return () => {
      delete (window as any).__openStreetView;
    };
  }, []);

  if (!mounted) {
    return (
      <div className="h-[600px] w-full rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <span className="text-sm font-medium text-slate-400">Loading Geospatial & Street View Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <LeafletMap
        hubs={hubs}
        returns={returns}
        styleKey={selectedStyle}
        pegmanActive={pegmanActive}
        onMapClick={(lat, lng) => {
          if (pegmanActive) {
            setStreetViewTarget({
              lat,
              lng,
              title: "Street View Inspection",
              subtitle: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
            });
            setPegmanActive(false);
          }
        }}
      />

      {/* Top Controls: OpenFreeMap style selector + Street View Pegman mode */}
      <div className="absolute top-4 left-4 z-[500] flex flex-wrap items-center gap-2 rounded-xl bg-slate-900/95 backdrop-blur border border-slate-800 p-1.5 shadow-xl">
        <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          OpenFreeMap
        </div>
        <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5">
          {(["liberty", "positron", "bright"] as OpenFreeMapStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                selectedStyle === style
                  ? "bg-emerald-500 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {STYLES[style].name}
            </button>
          ))}
        </div>

        {/* Pegman / Street View Toggle Button */}
        <button
          onClick={() => setPegmanActive(!pegmanActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
            pegmanActive
              ? "bg-amber-500 text-slate-950 shadow-md animate-pulse ring-2 ring-amber-300"
              : "bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-amber-500/30"
          }`}
          title="Click anywhere on the map to open street view"
        >
          <span className="text-sm">🚶</span>
          <span>{pegmanActive ? "Click map to drop" : "Street View"}</span>
        </button>
      </div>

      {/* Pegman instruction banner */}
      {pegmanActive && (
        <div className="absolute top-16 left-4 z-[500] bg-amber-500/90 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg backdrop-blur flex items-center gap-2 animate-bounce">
          <span>📍 Click any road or location on the map to open 360° Street View</span>
        </div>
      )}

      {/* Legend overlay */}
      <div className="absolute top-4 right-4 z-[500] rounded-xl bg-slate-900/90 backdrop-blur border border-slate-800 p-3 shadow-lg text-xs space-y-2">
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

      {/* ── Street View Modal / Drawer ───────────────────────────────── */}
      {streetViewTarget && (
        <div className="absolute inset-0 z-[1000] bg-slate-950/90 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  {streetViewTarget.title}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {streetViewTarget.lat.toFixed(4)}, {streetViewTarget.lng.toFixed(4)}
                  </span>
                </h3>
                {streetViewTarget.subtitle && (
                  <p className="text-slate-400 text-xs">{streetViewTarget.subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Direct 360 Street View link */}
              <a
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetViewTarget.lat},${streetViewTarget.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                <span>360° Panorama</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Navigation directions link */}
              <a
                href={`https://maps.google.com/?q=${streetViewTarget.lat},${streetViewTarget.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>Navigate</span>
              </a>

              {/* Close */}
              <button
                onClick={() => setStreetViewTarget(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Street & Satellite View Window */}
          <div className="relative flex-1 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
            <iframe
              title="Street View Live Preview"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${streetViewTarget.lat},${streetViewTarget.lng}&t=k&z=18&ie=UTF8&iwloc=&output=embed`}
            />

            {/* Quick 360 Launch Overlay Pill */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-700 shadow-xl flex items-center gap-3">
              <div className="text-xs">
                <span className="font-bold text-white block">Street-Level Visual Inspection</span>
                <span className="text-[11px] text-slate-400">High-resolution satellite + street imagery active</span>
              </div>
              <a
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetViewTarget.lat},${streetViewTarget.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <span>Full 360° Pano</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeafletMap({
  hubs,
  returns,
  styleKey,
  pegmanActive,
  onMapClick,
}: {
  hubs: Hub[];
  returns: ReturnItem[];
  styleKey: OpenFreeMapStyle;
  pegmanActive: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<any>(null);
  const glLayerRef = useRef<any>(null);
  const [libsReady, setLibsReady] = useState(false);
  const LRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      import("leaflet"),
      import("maplibre-gl"),
      import("@maplibre/maplibre-gl-leaflet"),
    ]).then(([leaflet, maplibreGl]) => {
      if (!active) return;
      const L = leaflet.default || leaflet;
      LRef.current = L;

      // Set local worker URL for MapLibre GL
      try {
        if (typeof window !== "undefined") {
          (maplibreGl as any).setWorkerUrl?.("/maplibre-gl-worker.mjs");
        }
      } catch {}

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setLibsReady(true);
    }).catch((err) => {
      console.error("Failed to load map libraries:", err);
    });

    return () => {
      active = false;
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!libsReady || !LRef.current) return;
    const L = LRef.current;

    const container = document.getElementById("openfreemap-container");
    if (!container) return;

    const map = L.map("openfreemap-container", {
      attributionControl: true,
      zoomControl: true,
    }).setView([22.5, 78.9], 5);
    mapRef.current = map;

    // Handle map clicks (e.g. for Pegman street view)
    map.on("click", (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Add OpenFreeMap Vector Layer via MapLibre GL Leaflet plugin
    try {
      const glLayer = (L as any).maplibreGL({
        style: STYLES[styleKey].url,
        attribution:
          '&copy; <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      });
      glLayer.addTo(map);
      glLayerRef.current = glLayer;
    } catch (e) {
      console.warn("MapLibre GL layer failed, falling back to raster:", e);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
    }

    // Add Central Warehouse (Delhi)
    const whLat = 28.4595;
    const whLng = 77.0266;
    const warehouseIcon = L.divIcon({
      className: "custom-pin",
      html: `<div style="background-color: #f43f5e; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid #ffffff; box-shadow: 0 0 15px rgba(244,63,94,0.6);">🏭</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const warehouseMarker = L.marker([whLat, whLng], { icon: warehouseIcon }).addTo(map);
    warehouseMarker.bindPopup(`
      <div style="font-family: sans-serif; color: #f8fafc; min-width: 190px;">
        <strong style="color: #f43f5e; font-size: 14px;">🏭 Central Warehouse</strong><br/>
        <span style="font-size: 11px; color: #94a3b8;">Delhi NCR Mega Depot</span><br/>
        <div style="margin-top: 6px; font-size: 11px; color: #cbd5e1;">All high-risk fraud & damaged returns converge here.</div>
        <div style="margin-top: 10px; display: flex; gap: 6px;">
          <button
            onclick="window.__openStreetView && window.__openStreetView(${whLat}, ${whLng}, 'Central Warehouse', 'Delhi NCR Mega Depot', 'warehouse')"
            style="cursor: pointer; background: #f43f5e; color: white; border: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px;"
          >
            👁️ Street View
          </button>
          <a
            href="https://maps.google.com/?q=${whLat},${whLng}"
            target="_blank"
            style="text-decoration: none; background: #334155; color: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;"
          >
            🧭 Directions
          </a>
        </div>
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
        <div style="font-family: sans-serif; color: #f8fafc; min-width: 190px;">
          <strong style="color: #818cf8; font-size: 13px;">📦 ${hub.name}</strong><br/>
          <span style="font-size: 11px; color: #94a3b8;">${hub.code} • Capacity: ${hub.capacity} units</span><br/>
          <div style="margin-top: 4px; font-size: 11px; color: #cbd5e1;">Stocked Interceptions: ${hub.currentStock}</div>
          <div style="margin-top: 10px; display: flex; gap: 6px;">
            <button
              onclick="window.__openStreetView && window.__openStreetView(${lat}, ${lng}, '${hub.name.replace(/'/g, "\\'")}', '${hub.code} - ${hub.address?.city || ""}', 'hub')"
              style="cursor: pointer; background: #6366f1; color: white; border: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px;"
            >
              👁️ Street View
            </button>
            <a
              href="https://maps.google.com/?q=${lat},${lng}"
              target="_blank"
              style="text-decoration: none; background: #334155; color: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;"
            >
              🧭 Directions
            </a>
          </div>
        </div>
      `);
    });

    // Add Active Returns & Rerouted Paths
    returns.forEach((ret) => {
      if (!ret.pickupAddress?.coordinates) return;
      const lat = ret.pickupAddress.coordinates.lat;
      const lng = ret.pickupAddress.coordinates.lng;
      const origin = [lat, lng];

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
      const prodName = (ret.productId?.name || "Product").replace(/'/g, "\\'");
      returnMarker.bindPopup(`
        <div style="font-family: sans-serif; color: #f8fafc; min-width: 200px;">
          <div style="font-size: 10px; font-weight: bold; color: #818cf8; letter-spacing: 0.5px;">${ret.returnId}</div>
          <strong style="font-size: 13px; color: #f1f5f9;">${ret.productId?.name || "Product"}</strong><br/>
          <span style="font-size: 11px; color: #94a3b8;">Pickup: ${ret.pickupAddress.city} (${ret.pickupAddress.street || ""})</span>
          <div style="margin-top: 6px; padding: 4px 6px; background: rgba(15,23,42,0.8); border-radius: 6px; font-size: 11px;">
            Destination: <strong style="color: #34d399;">${ret.routingDestination ? ret.routingDestination.replace(/_/g, " ") : "Calculating..."}</strong>
          </div>
          <div style="margin-top: 10px; display: flex; gap: 6px;">
            <button
              onclick="window.__openStreetView && window.__openStreetView(${lat}, ${lng}, '${prodName}', 'Pickup Address: ${ret.pickupAddress.city}', 'pickup')"
              style="cursor: pointer; background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px;"
            >
              👁️ Doorstep View
            </button>
            <a
              href="https://maps.google.com/?q=${lat},${lng}"
              target="_blank"
              style="text-decoration: none; background: #334155; color: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;"
            >
              🧭 Navigate
            </a>
          </div>
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
        L.polyline([origin, [whLat, whLng]], {
          color: "#f43f5e",
          weight: 1.5,
          opacity: 0.4,
        }).addTo(map);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      glLayerRef.current = null;
    };
  }, [libsReady, hubs, returns]);

  // Handle dynamic style change
  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    const L = LRef.current;
    const map = mapRef.current;

    if (glLayerRef.current) {
      try {
        map.removeLayer(glLayerRef.current);
      } catch {}
    }

    try {
      const newGlLayer = (L as any).maplibreGL({
        style: STYLES[styleKey].url,
        attribution:
          '&copy; <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      });
      newGlLayer.addTo(map);
      glLayerRef.current = newGlLayer;
    } catch (e) {
      console.warn("Failed to switch OpenFreeMap style:", e);
    }
  }, [styleKey]);

  // Update cursor when Pegman active
  useEffect(() => {
    const container = document.getElementById("openfreemap-container");
    if (!container) return;
    if (pegmanActive) {
      container.style.cursor = "crosshair";
    } else {
      container.style.cursor = "";
    }
  }, [pegmanActive]);

  return <div id="openfreemap-container" className="w-full h-full z-10" />;
}
