"use client"
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import { Loader } from '@googlemaps/js-api-loader';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY;

if (!MAPS_API_KEY) {
  throw new Error('Google Maps API key not provided.');
}

interface Hospital {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
}

const MapContainer = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchHospitals(latitude, longitude);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const fetchHospitals = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/nearest-hospitals/${lat}/${lng}`
      );
      const data: { results: Hospital[] } = response.data;
      setHospitals(data.results);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  useEffect(() => {
    const loadMap = async () => {
      try {
        const loader = new Loader({
          apiKey: MAPS_API_KEY,
          version: 'weekly',
        });

        await loader.load();

        const { google } = window;
        if (google) {
          const mapInstance = new google.maps.Map(
            document.getElementById('map') as HTMLElement,
            {
              center: location,
              zoom: location.lat ? 15 : 2,
            }
          );
          setMap(mapInstance);
          mapRef.current = mapInstance; // Assign map instance to ref
        } else {
          console.error('Google Maps library not loaded.');
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    loadMap();
  }, [location]);

  useEffect(() => {
    // Render markers when hospitals data changes
    if (mapRef.current && hospitals.length > 0) {
      hospitals.forEach((hospital, index) => {
        const marker = new google.maps.Marker({
          position: {
            lat: hospital.geometry.location.lat,
            lng: hospital.geometry.location.lng,
          },
          map: mapRef.current!,
          title: hospital.name,
        });
      });
    }
  }, [hospitals]);

  console.log('LAST TIME OUTPUTING KEY', MAPS_API_KEY);

  return (
    <div id="map" style={{ height: '400px', width: '800px' }}></div>
  );
};

export default MapContainer;