'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import {
  cloudcastingAPI,
  formatTimeStep,
  createLayerId,
  type CloudVariable,
} from '@/utils/cloudcasting-api';

interface CloudLayerControlsProps {
  map: mapboxgl.Map | null;
}

export default function CloudLayerControls({ map }: CloudLayerControlsProps) {
  const [selectedVariable, setSelectedVariable] = useState('IR_016');
  const [timeStep, setTimeStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); // milliseconds between frames
  const [cache, setCache] = useState<Map<string, string>>(new Map()); // Cache for canvas data URLs
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [loadedLayers, setLoadedLayers] = useState<Set<string>>(new Set()); // Track loaded layers

  const variables = cloudcastingAPI.getAvailableVariables();
  const maxTimeSteps = cloudcastingAPI.getMaxTimeSteps();
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const processGeoTiff = async (
    variable: string,
    step: number
  ): Promise<{
    dataUrl: string;
    coordinates: [[number, number], [number, number], [number, number], [number, number]];
  }> => {
    // Fetch the TIF file using the API utility
    const blob = await cloudcastingAPI.fetchLayer(variable, step);
    const arrayBuffer = await blob.arrayBuffer();

    // Dynamically import georaster
    const parseGeoraster = (await import('georaster')).default;

    // Parse the GeoTIFF
    const georaster = await parseGeoraster(arrayBuffer);

    // Create canvas to render the georaster
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = georaster.width;
    canvas.height = georaster.height;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Process the raster data
    for (let y = 0; y < georaster.height; y++) {
      for (let x = 0; x < georaster.width; x++) {
        const pixelIndex = (y * georaster.width + x) * 4;
        const value = georaster.values[0][y][x];

        if (value === null || isNaN(value) || value <= 0) {
          data[pixelIndex + 3] = 0; // transparent
        } else {
          // Adjust alpha based on cloud density
          const alpha = Math.min(250, Math.max(25, (value / 0.8) * 255));
          data[pixelIndex] = 255; // R - white clouds
          data[pixelIndex + 1] = 255; // G
          data[pixelIndex + 2] = 255; // B
          data[pixelIndex + 3] = alpha; // A
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
      [georaster.xmin, georaster.ymax], // top-left
      [georaster.xmax, georaster.ymax], // top-right
      [georaster.xmax, georaster.ymin], // bottom-right
      [georaster.xmin, georaster.ymin], // bottom-left
    ];

    return {
      dataUrl: canvas.toDataURL(),
      coordinates,
    };
  };

  const fetchAndDisplayLayer = async (variable: string, step: number) => {
    if (!map) return;

    const layerId = createLayerId(variable, step);
    const cacheKey = `${variable}-${step}`;

    try {
      // Hide all other layers for this variable first (instant switch)
      for (let i = 0; i < maxTimeSteps; i++) {
        const otherLayerId = createLayerId(variable, i);
        if (map.getLayer(otherLayerId) && otherLayerId !== layerId) {
          map.setLayoutProperty(otherLayerId, 'visibility', 'none');
        }
      }

      // If layer already exists, just show it
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', 'visible');
        setCurrentLayer(layerId);
        return;
      }

      let dataUrl: string;
      let coordinates: [[number, number], [number, number], [number, number], [number, number]];

      // Check if we have this layer cached
      if (cache.has(cacheKey)) {
        const cachedData = JSON.parse(cache.get(cacheKey)!);
        dataUrl = cachedData.dataUrl;
        coordinates = cachedData.coordinates;
        console.log(`Using cached layer: ${cacheKey}`);
      } else {
        setIsLoading(true);
        setError(null);

        // Fetch and process the TIF file
        const result = await processGeoTiff(variable, step);
        dataUrl = result.dataUrl;
        coordinates = result.coordinates;

        // Cache the processed data
        const cacheData = JSON.stringify({ dataUrl, coordinates });
        setCache(prev => new Map(prev.set(cacheKey, cacheData)));
        console.log(`Cached new layer: ${cacheKey}`);
        setIsLoading(false);
      }

      // Add the new layer
      map.addSource(layerId, {
        type: 'image',
        url: dataUrl,
        coordinates,
      });

      map.addLayer({
        id: layerId,
        type: 'raster',
        source: layerId,
        layout: {
          visibility: 'visible',
        },
        paint: {
          'raster-opacity': 0.7,
          'raster-fade-duration': 0, // Instant transitions
        },
      });

      setLoadedLayers(prev => new Set(prev).add(layerId));
      setCurrentLayer(layerId);
    } catch (error) {
      console.error('Error fetching cloud layer:', error);
      let errorMessage = 'Failed to load cloud layer';

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage =
          'CORS error: Unable to fetch data. Check if the API server allows cross-origin requests.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Preload all time steps for current variable
  const preloadTimeSteps = async () => {
    if (!map) return Promise.resolve();

    setIsLoading(true);
    setPreloadProgress(0);

    // Hide all existing layers for this variable
    for (let i = 0; i < maxTimeSteps; i++) {
      const layerId = createLayerId(selectedVariable, i);
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    }

    for (let step = 0; step < maxTimeSteps; step++) {
      const cacheKey = `${selectedVariable}-${step}`;
      const layerId = createLayerId(selectedVariable, step);

      try {
        let result;

        if (!cache.has(cacheKey)) {
          result = await processGeoTiff(selectedVariable, step);
          const cacheData = JSON.stringify({
            dataUrl: result.dataUrl,
            coordinates: result.coordinates,
          });
          setCache(prev => new Map(prev.set(cacheKey, cacheData)));
        } else {
          const cachedData = JSON.parse(cache.get(cacheKey)!);
          result = {
            dataUrl: cachedData.dataUrl,
            coordinates: cachedData.coordinates,
          };
        }

        // Create the layer if it doesn't exist
        if (!map.getLayer(layerId)) {
          map.addSource(layerId, {
            type: 'image',
            url: result.dataUrl,
            coordinates: result.coordinates,
          });

          map.addLayer({
            id: layerId,
            type: 'raster',
            source: layerId,
            layout: {
              visibility: step === timeStep ? 'visible' : 'none',
            },
            paint: {
              'raster-opacity': 0.7,
              'raster-fade-duration': 0, // Instant transitions for smoothness
            },
          });

          setLoadedLayers(prev => new Set(prev).add(layerId));
        }
      } catch (error) {
        console.error(`Failed to preload step ${step}:`, error);
      }

      setPreloadProgress(((step + 1) / maxTimeSteps) * 100);
    }

    // Ensure the current time step is visible
    const currentLayerId = createLayerId(selectedVariable, timeStep);
    if (map.getLayer(currentLayerId)) {
      map.setLayoutProperty(currentLayerId, 'visibility', 'visible');
      setCurrentLayer(currentLayerId);
    }

    setIsLoading(false);
    return Promise.resolve();
  };

  // Play animation controls
  const startAnimation = useCallback(() => {
    if (playIntervalRef.current) return; // Already playing

    playIntervalRef.current = setInterval(() => {
      setTimeStep(prev => {
        const next = (prev + 1) % maxTimeSteps;
        return next;
      });
    }, playSpeed);
  }, [playSpeed, maxTimeSteps]);

  const stopAnimation = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  // Preload and then start animation
  const preloadAndStartAnimation = useCallback(async () => {
    // If all frames are already cached, start playing immediately
    const allCached =
      Array.from(cache.keys()).filter(key => key.startsWith(selectedVariable)).length ===
      maxTimeSteps;

    if (allCached) {
      setIsPlaying(true);
      return;
    }

    // Otherwise preload all frames first
    setIsLoading(true);
    try {
      await preloadTimeSteps();
    } catch (error) {
      console.error('Error preloading time steps:', error);
    } finally {
      setIsLoading(false);
      setIsPlaying(true);
    }
  }, [selectedVariable, maxTimeSteps, cache, preloadTimeSteps]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      // If already playing, just pause
      setIsPlaying(false);
    } else {
      // If not playing, preload and then start
      preloadAndStartAnimation();
    }
  }, [isPlaying, preloadAndStartAnimation]);

  // Main effect to manage animation state
  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [isPlaying, startAnimation, stopAnimation]);

  // Effect to update layer when variable or time step changes
  useEffect(() => {
    if (map && map.isStyleLoaded()) {
      fetchAndDisplayLayer(selectedVariable, timeStep);
    }
  }, [selectedVariable, timeStep, map]);

  // Stop animation when variable changes
  useEffect(() => {
    setIsPlaying(false);

    // Clean up old variable layers
    if (map) {
      const currentVariablePrefix = selectedVariable;
      loadedLayers.forEach(layerId => {
        if (!layerId.includes(currentVariablePrefix)) {
          try {
            if (map.getLayer(layerId)) {
              map.removeLayer(layerId);
            }
            if (map.getSource(layerId)) {
              map.removeSource(layerId);
            }
          } catch (error) {
            console.warn('Error removing old variable layer:', error);
          }
        }
      });

      // Update loaded layers to only include current variable
      setLoadedLayers(prev => {
        const newSet = new Set<string>();
        prev.forEach(layerId => {
          if (layerId.includes(currentVariablePrefix)) {
            newSet.add(layerId);
          }
        });
        return newSet;
      });
    }
  }, [selectedVariable, map]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      stopAnimation();
      if (map) {
        // Clean up all loaded layers
        loadedLayers.forEach(layerId => {
          try {
            if (map.getLayer(layerId)) {
              map.removeLayer(layerId);
            }
            if (map.getSource(layerId)) {
              map.removeSource(layerId);
            }
          } catch (error) {
            console.warn('Error cleaning up cloud layer:', error);
          }
        });
      }
    };
  }, [map, stopAnimation]);

  // Keyboard controls for play/pause and navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process keyboard shortcuts if map is loaded and not loading
      if (!map || isLoading) return;

      // Prevent default actions for these keys in the context of the app
      if (['Space', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
          togglePlayPause();
          break;
        case 'ArrowLeft':
          setTimeStep(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'ArrowRight':
          setTimeStep(prev => (prev < maxTimeSteps - 1 ? prev + 1 : prev));
          break;
      }
    };

    // Add event listener for keyboard controls
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [map, isLoading, togglePlayPause, maxTimeSteps]);

  const cachedSteps = Array.from(cache.keys()).filter(key =>
    key.startsWith(selectedVariable)
  ).length;

  return (
    <>
      {/* Dock-style Timeline Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 flex items-center gap-3">
          {/* Date Time Display */}
          <div className="flex items-center space-x-1 text-white">
            <span className="font-semibold text-sm min-w-[70px]">{formatTimeStep(timeStep)}</span>
          </div>

          {/* Previous/Next Buttons and Timeline Slider */}
          <div className="flex items-center">
            <button
              onClick={() => setTimeStep(prev => (prev > 0 ? prev - 1 : prev))}
              className="text-white hover:text-yellow-400 px-1 opacity-80 hover:opacity-100 group relative"
              disabled={timeStep === 0 || isLoading}
              title="Previous frame (Left Arrow)"
            >
              ◀
              <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 text-white rounded whitespace-nowrap">
                ← Previous
              </span>
            </button>

            {/* Slider */}
            <div className="w-64 mx-2">
              <input
                type="range"
                min="0"
                max={maxTimeSteps - 1}
                value={timeStep}
                onChange={e => setTimeStep(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
                style={{
                  background: `linear-gradient(to right, #ffd500ff 0%, #ffd500ff ${(timeStep / (maxTimeSteps - 1)) * 100}%, #374151 ${(timeStep / (maxTimeSteps - 1)) * 100}%, #374151 100%)`,
                }}
              />
            </div>

            <button
              onClick={() => setTimeStep(prev => (prev < maxTimeSteps - 1 ? prev + 1 : prev))}
              className="text-white hover:text-yellow-400 px-1 opacity-80 hover:opacity-100 group relative"
              disabled={timeStep === maxTimeSteps - 1 || isLoading}
              title="Next frame (Right Arrow)"
            >
              ▶
              <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 text-white rounded whitespace-nowrap">
                Next →
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-600"></div>

          {/* Play/Pause Button */}
          <div className="relative">
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed group"
              aria-label={isLoading ? 'Preloading layers...' : isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isLoading ? (
                <>
                  <div className="absolute inset-0 rounded-full animate-spin border-2 border-transparent border-t-yellow-400"></div>
                  <span className="text-sm opacity-50">▶</span>
                </>
              ) : isPlaying ? (
                <span className="text-sm">⏸</span>
              ) : (
                <span className="text-sm">▶</span>
              )}
              <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 text-white rounded whitespace-nowrap">
                {isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              </span>
            </button>
            {/* {isLoading && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/75 text-white rounded whitespace-nowrap">
                Preloading layers... {Math.round(preloadProgress)}%
              </div>
            )} */}
          </div>

          {/* Speed Control */}
          <select
            value={playSpeed}
            onChange={e => setPlaySpeed(Number(e.target.value))}
            className="bg-gray-800/50 border border-gray-700/50 rounded px-1.5 py-1 text-xs text-white focus:outline-none"
            aria-label="Animation speed"
          >
            <option value={300}>4×</option>
            <option value={500}>2×</option>
            <option value={1000}>1×</option>
            <option value={2000}>½×</option>
          </select>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-600"></div>

          {/* Band Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedVariable}
              onChange={e => setSelectedVariable(e.target.value)}
              className="bg-gray-800/50 border border-gray-700/50 rounded-md px-2 py-1 text-xs text-white focus:outline-none"
              disabled={isLoading}
            >
              {variables.map((variable: CloudVariable) => (
                <option key={variable.value} value={variable.value}>
                  {variable.label}
                </option>
              ))}
            </select>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="relative group ml-2">
            <button
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700/50 hover:bg-gray-600 text-white text-xs"
              aria-label="Keyboard shortcuts"
            >
              ⌨️
            </button>
            <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 px-3 py-2 text-xs bg-black/80 text-white rounded whitespace-nowrap z-50">
              <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
              <div className="flex justify-between gap-4">
                <span>Space</span>
                <span>Play/Pause</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>←</span>
                <span>Previous Frame</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>→</span>
                <span>Next Frame</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
