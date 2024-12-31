import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Search } from 'lucide-react';
import axios from 'axios'; // To make HTTP requests
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const libraries = ['places', 'marker'];

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

const MapComponent = () => {
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [address, setAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [map, setMap] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false); // To handle loading state when saving
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.API_KEY, // Replace with your API Key
    libraries,
  });
  const navigate=useNavigate()
  // Function to create and manage marker
  const createMarker = useCallback((position) => {
    if (!window.google || !map) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      map,
      position,
      draggable: true,
      title: 'Drag to move',
    });

    // Add drag event listeners
    marker.addListener('dragstart', () => {
      setSelectedAddress('Updating location...');
    });

    marker.addListener('dragend', () => {
      const newPosition = marker.getPosition();
      if (newPosition) {
        const updatedLocation = {
          lat: newPosition.lat(),
          lng: newPosition.lng(),
        };
        setCurrentLocation(updatedLocation);
        updateAddressFromCoords(updatedLocation.lat, updatedLocation.lng);
      }
    });

    markerRef.current = marker;
  }, [map]);

  // Function to update address from coordinates
  const updateAddressFromCoords = useCallback(async (latitude, longitude) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({
        location: { lat: latitude, lng: longitude },
      });
      if (result.results[0]) {
        setSelectedAddress(result.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }, []);

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          updateAddressFromCoords(location.lat, location.lng);
        },
        () => {
          setCurrentLocation(defaultCenter);
          updateAddressFromCoords(defaultCenter.lat, defaultCenter.lng);
        }
      );
    }
  }, [updateAddressFromCoords]);

  // Update marker when map or location changes
  useEffect(() => {
    if (map && currentLocation) {
      createMarker(currentLocation);
    }
  }, [map, currentLocation, createMarker]);

  // Setup autocomplete functionality
  useEffect(() => {
    if (isLoaded && autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        { fields: ['formatted_address', 'geometry'] }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setCurrentLocation(location);
          setSelectedAddress(place.formatted_address);
          setAddress('');

          if (map) {
            map.panTo(location);
          }
        }
      });
    }
  }, [isLoaded, map]);

  // Map load/unload handlers
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    setMap(null);
  }, []);

  // Function to save the location
  const saveLocation = async () => {
    if (!selectedAddress) {
      alert('Please select a valid location');
      return;
    }
  
    setSavingLocation(true);
  
    try {
      const token = localStorage.getItem('token'); // Assuming your token is stored in localStorage
      const locationData = { selectedAddress };  // Only send selectedAddress as string
  
      console.log('Sending location data:', locationData);  // Log location data
  
      const response = await axios.post(
        'http://localhost:5000/api/v3/savelocation',
        locationData, // Send only selectedAddress
        {
          headers: {
            Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
          }
        }
      );
  
      // Show success message
      alert('Location saved successfully!');
      console.log(response.data); // Log the response data for debugging
      navigate('/user')
      setSavingLocation(false);
    } catch (error) {
      console.error('Error saving location:', error);
      if (error.response) {
        console.log('Response error:', error.response.data); // Log the error details
      }
      alert('Error saving location, please try again.');
      setSavingLocation(false);
    }
  };
  
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Search Bar */}
      <div className="mb-4 relative">
        <input
          ref={autocompleteRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Search for a location..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {/* Selected Address */}
      {selectedAddress && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-800">Selected Location:</h3>
          <p className="text-gray-600 mt-1">{selectedAddress}</p>
          <p className="text-sm text-gray-500 mt-2">
            Drag the marker to adjust the location
          </p>
        </div>
      )}

      {/* Map */}
      {isLoaded ? (
        <div className="rounded-lg overflow-hidden shadow">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          />
        </div>
      ) : (
        <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-gray-600">Loading Map...</div>
        </div>
      )}

      {/* Save Location Button */}
      <button
        onClick={saveLocation}
        disabled={savingLocation}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {savingLocation ? 'Saving...' : 'Save Location'}
      </button>
    </div>
  );
};

export default MapComponent;
