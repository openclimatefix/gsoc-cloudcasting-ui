'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Header from '@/components/navbar';
import CloudLayerControls from '@/components/cloud-layer-controls';
import { withAuth } from '@/utils/withAuth';

const HomePage = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    if (mapContainerRef.current) {
      // const bounds = new mapboxgl.LngLatBounds(
      //   [-17, 44], // Southwest coordinates (UK southwest corner)
      //   [11, 73] // Northeast coordinates (UK northeast corner)
      // );

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-2.5, 54],
        zoom: 5,
        projection: 'equirectangular',
      });

      if (mapRef.current) {
        mapRef.current.on('load', () => {
          mapRef.current?.setFog({
            color: 'rgb(0, 0, 0)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6,
          });
          setMapLoaded(true);
        });
      }
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
      <div className="relative">
        <div
          id="map"
          ref={mapContainerRef}
          style={{ width: '100%', height: 'calc(100vh - 64px)' }}
        />
        {mapLoaded && <CloudLayerControls map={mapRef.current} />}
      </div>
    </div>
  );
};

export default withAuth(HomePage);
