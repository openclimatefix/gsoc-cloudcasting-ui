'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Header from '@/components/navbar';
import { withAuth } from '@/utils/withAuth';

const HomePage = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-2.5, 54.5],
        zoom: 6,
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div>
      <Header />
      <div id="map" ref={mapContainerRef} style={{ width: '100%', height: 'calc(100vh - 64px)' }} />
    </div>
  );
};

export default withAuth(HomePage);
