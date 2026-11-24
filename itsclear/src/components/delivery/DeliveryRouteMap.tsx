import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Truck,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  Compass,
  Store
} from 'lucide-react';
import { Address } from '../../types';

interface DeliveryRouteMapProps {
  destination: Address;
  trackingStep: number; // 1 to 5
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  orderNumber?: string;
}

// Approximate coordinate resolver for Lucknow & standard Indian locations
function resolveCoordinates(address: Address): {
  hubCoords: [number, number];
  destCoords: [number, number];
  hubName: string;
} {
  const city = (address.city || '').toLowerCase().trim();
  const street = (address.street || address.addressLine1 || '').toLowerCase();
  const pincode = (address.pincode || '').trim();

  // Primary ItsClear Cold-Stone Chakki Fulfillment Hub (Lucknow Central Hub)
  const defaultHub: [number, number] = [26.8524, 80.9936]; // Gomti Nagar, Lucknow
  const hubName = 'ItsClear Central Chakki Hub (Gomti Nagar, Lucknow)';

  // If destination is in Lucknow or nearby
  if (city.includes('lucknow') || pincode.startsWith('226')) {
    // Specific Lucknow landmarks based on address text
    if (street.includes('uattardhona') || street.includes('hans dairy') || pincode === '226010') {
      return {
        hubCoords: defaultHub,
        destCoords: [26.8858, 81.0620], // Uattardhona, Ayodhya Road / Service Rd, Lucknow
        hubName
      };
    }
    if (street.includes('indira nagar') || pincode === '226016') {
      return {
        hubCoords: defaultHub,
        destCoords: [26.8770, 80.9850],
        hubName
      };
    }
    if (street.includes('hazratganj') || pincode === '226001') {
      return {
        hubCoords: defaultHub,
        destCoords: [26.8467, 80.9462],
        hubName
      };
    }
    if (street.includes('aliganj') || pincode === '226024') {
      return {
        hubCoords: defaultHub,
        destCoords: [26.8900, 80.9420],
        hubName
      };
    }
    if (street.includes('shaheed path') || street.includes('sushant') || pincode === '226002') {
      return {
        hubCoords: defaultHub,
        destCoords: [26.7900, 80.9850],
        hubName
      };
    }
    // Default Lucknow destination (eastern corridor / chinhat area)
    return {
      hubCoords: defaultHub,
      destCoords: [26.8750, 81.0250],
      hubName
    };
  }

  // Fallback for Delhi-NCR
  if (city.includes('delhi') || city.includes('noida') || city.includes('gurgaon') || pincode.startsWith('110') || pincode.startsWith('201')) {
    return {
      hubCoords: [28.5355, 77.3910], // Noida Sector 62 Hub
      destCoords: [28.6139, 77.2090], // Delhi Destination
      hubName: 'ItsClear NCR Fresh Milling Hub (Sector 62)'
    };
  }

  // Default fallback
  return {
    hubCoords: defaultHub,
    destCoords: [26.8858, 81.0620],
    hubName
  };
}

// Generate realistic intermediate curve waypoints for the delivery route
function generateRouteWaypoints(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const points: [number, number][] = [start];
  const steps = 8;
  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    // Linear interpolation
    const lat = start[0] + (end[0] - start[0]) * fraction;
    const lng = start[1] + (end[1] - start[1]) * fraction;
    // Add small realistic curvature mimicking road bends
    const curveOffset = Math.sin(fraction * Math.PI) * 0.004;
    points.push([lat + curveOffset * 0.6, lng - curveOffset]);
  }
  points.push(end);
  return points;
}

export const DeliveryRouteMap: React.FC<DeliveryRouteMapProps> = ({
  destination,
  trackingStep,
  driverName = 'Ramesh Kumar (EV Pilot)',
  driverPhone = '+91 88581 80597',
  vehicleNumber = 'UP-32-EV-4419',
  orderNumber
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { hubCoords, destCoords, hubName } = resolveCoordinates(destination);
  const routePoints = generateRouteWaypoints(hubCoords, destCoords);

  // Calculate current EV Van position based on tracking step
  const vanProgressMap: Record<number, number> = {
    0: 0,
    1: 0,      // Confirmed: At Hub
    2: 0.1,    // Milling: At Hub dock
    3: 0.2,    // Lab Quality Check: Pre-dispatch bay
    4: 0.68,   // Out for Delivery: En route (68% along road)
    5: 1.0     // Delivered: At customer doorstep
  };

  const progressFraction = vanProgressMap[trackingStep] ?? 0.68;
  const waypointIndex = Math.min(
    Math.floor(progressFraction * (routePoints.length - 1)),
    routePoints.length - 1
  );
  const vanCoords = routePoints[waypointIndex];

  // Google Maps turn-by-turn navigation URL
  const destinationQuery = encodeURIComponent(
    `${destination.fullName || ''}, ${destination.street || destination.addressLine1 || ''}, ${destination.city || 'Lucknow'}, ${destination.pincode || ''}`
  );
  const originQuery = encodeURIComponent(hubName);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destinationQuery}`;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization if already created
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [(hubCoords[0] + destCoords[0]) / 2, (hubCoords[1] + destCoords[1]) / 2],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // High performance CartoDB Voyager luxury clean tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 1. ORIGIN MARKER (ItsClear Chakki Hub)
    const hubIcon = L.divIcon({
      className: 'custom-hub-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 36px; height: 36px; border-radius: 9999px; background: #064e3b; border: 2.5px solid #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(6, 78, 59, 0.4); color: #f59e0b;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
              <path d="M2 7h20"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const hubMarker = L.marker(hubCoords, { icon: hubIcon }).addTo(map);
    hubMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
        <strong style="color: #064e3b; font-size: 13px; display: block; margin-bottom: 2px;">${hubName}</strong>
        <span style="color: #64748b;">100% Pure Cold-Stone Milling Facility</span>
      </div>
    `);

    // 2. DESTINATION MARKER (Customer Doorstep)
    const destIcon = L.divIcon({
      className: 'custom-dest-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="width: 36px; height: 36px; border-radius: 9999px; background: #0f172a; border: 2.5px solid #f59e0b; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.4); color: #f59e0b;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
        <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 2px;">Delivery Destination</strong>
        <span style="color: #334155; font-weight: 600;">${destination.fullName}</span><br/>
        <span style="color: #64748b;">${destination.street || destination.addressLine1 || ''}, ${destination.city} - ${destination.pincode}</span>
      </div>
    `);

    // 3. ROUTE POLYLINE (Smooth delivery path)
    const routeLine = L.polyline(routePoints, {
      color: '#10b981',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: trackingStep >= 4 ? undefined : '8, 8'
    }).addTo(map);

    // Behind glow shadow for route line
    L.polyline(routePoints, {
      color: '#064e3b',
      weight: 9,
      opacity: 0.15,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 4. LIVE EV DELIVERY VAN MARKER
    if (trackingStep >= 2 && trackingStep <= 5) {
      const vanIcon = L.divIcon({
        className: 'custom-van-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
            <div style="position: absolute; width: 48px; height: 48px; border-radius: 9999px; background: rgba(245, 158, 11, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 40px; height: 40px; border-radius: 12px; background: #065f46; border: 2.5px solid #34d399; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(6, 95, 70, 0.45); color: #ffffff;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      const vanMarker = L.marker(vanCoords, { icon: vanIcon }).addTo(map);
      vanMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
          <strong style="color: #065f46; font-size: 13px; display: block; margin-bottom: 2px;">EV Delivery Fleet</strong>
          <span style="color: #0f172a; font-weight: 600;">Pilot: ${driverName}</span><br/>
          <span style="color: #64748b;">Vehicle: ${vehicleNumber} • 38 km/h</span>
        </div>
      `);
    }

    // Fit bounds with padding so everything is visible
    const bounds = L.latLngBounds([hubCoords, destCoords]);
    map.fitBounds(bounds, { padding: [50, 50] });

    setMapLoaded(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [destination, trackingStep, driverName, vehicleNumber]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([hubCoords, destCoords]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-[360px] sm:h-[400px] z-0" />

      {/* Floating HUD: Live Status & Route Details (Top Left) */}
      <div className="absolute top-4 left-4 z-[500] max-w-[280px] sm:max-w-xs bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/70">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live GPS Active</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-semibold">
            {trackingStep >= 4 ? 'En Route' : trackingStep >= 1 ? 'Dispatch Queued' : 'Processing'}
          </span>
        </div>

        <div className="space-y-1 pt-1">
          <div className="flex items-center space-x-2 text-xs">
            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-600 truncate font-medium">Chakki Hub (Gomti Nagar)</span>
          </div>
          <div className="w-0.5 h-2 bg-slate-300 ml-4"></div>
          <div className="flex items-center space-x-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-slate-900 font-bold truncate">
              {destination.fullName || 'Customer'} • {destination.street || destination.city}
            </span>
          </div>
        </div>

        {/* Distance & ETA Pills */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
            <span className="font-black text-slate-800">6.8 km</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] text-amber-700 uppercase font-bold block">Est. Time</span>
            <span className="font-black text-amber-900">
              {trackingStep === 5 ? 'Delivered' : trackingStep === 4 ? '18 Mins' : 'Within 2 Hrs'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-[500] flex items-center space-x-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-md transition-all text-xs font-bold flex items-center space-x-1.5"
          title="Recenter Map View"
        >
          <Compass className="w-4 h-4 text-slate-700" />
          <span className="hidden sm:inline">Recenter</span>
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all text-xs font-bold flex items-center space-x-1.5"
          title="Open Live Turn-by-Turn in Google Maps"
        >
          <Navigation className="w-4 h-4" />
          <span className="hidden sm:inline">Google Maps</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </a>
      </div>

      {/* Bottom Bar: EV Fleet Vehicle & Speed Status */}
      <div className="absolute bottom-3 left-4 right-4 z-[500] pointer-events-none hidden sm:flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-xs border border-white/10 shadow-lg">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>100% Zero-Emission EV Fleet</span>
          </div>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-mono">{vehicleNumber}</span>
        </div>

        <div className="flex items-center space-x-4 pointer-events-auto text-slate-300">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Speed: {trackingStep === 4 ? '38 km/h' : '0 km/h'}</span>
          </span>
          <span className="flex items-center space-x-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Temperature Sealed</span>
          </span>
        </div>
      </div>
    </div>
  );
};
