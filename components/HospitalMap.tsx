import { MapPin, Navigation } from "lucide-react";

type HospitalMapProps = {
  name: string;
  address: string;
  mapQuery: string;
};

export function HospitalMap({ name, address, mapQuery }: HospitalMapProps) {
  const encodedQuery = encodeURIComponent(mapQuery);
  const mapSrc = `https://www.google.com/maps?q=${encodedQuery}&z=17&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`;

  return (
    <div className="map-card">
      <iframe className="map-frame" loading="lazy" src={mapSrc} title={`${name} location`} />
      <div className="map-location-card">
        <span>
          <MapPin size={18} />
        </span>
        <div>
          <strong>{name}</strong>
          <small>{address}</small>
        </div>
        <a href={directionsUrl} target="_blank" rel="noreferrer" aria-label="Open hospital directions in Google Maps">
          <Navigation size={16} />
          Directions
        </a>
      </div>
    </div>
  );
}
