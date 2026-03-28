import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface FoodItem {
  id: string;
  title: string;
  lat: number | null;
  lng: number | null;
  category: string;
  address?: string | null;
}

interface FoodMapProps {
  items: FoodItem[];
  center?: [number, number];
  zoom?: number;
  onItemClick?: (id: string) => void;
  className?: string;
}

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center, map]);
  return null;
};

const FoodMap = ({ items, center = [40.7128, -74.006], zoom = 12, onItemClick, className }: FoodMapProps) => {
  const validItems = items.filter((i) => i.lat != null && i.lng != null);

  return (
    <MapContainer center={center} zoom={zoom} className={className ?? 'h-[400px] w-full rounded-lg'} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={center} />
      {validItems.map((item) => (
        <Marker key={item.id} position={[item.lat!, item.lng!]}>
          <Popup>
            <div className="cursor-pointer" onClick={() => onItemClick?.(item.id)}>
              <strong>{item.title}</strong>
              <br />
              <span className="text-xs">{item.category}</span>
              {item.address && <><br /><span className="text-xs">{item.address}</span></>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default FoodMap;
