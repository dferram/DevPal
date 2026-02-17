import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface Marker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  category?: string;
}

interface MapViewProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: Marker[];
  onMarkerPress?: (id: string) => void;
}

const MapView = ({ style, initialRegion, markers = [], onMarkerPress }: MapViewProps) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Generate HTML for Leaflet Map
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; background-color: #0F172A; }
        .custom-icon {
          background-color: #22D3EE;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        });
        
        // Add dark theme tiles (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);

        var markersLayer = L.layerGroup().addTo(map);
        var markersData = {}; // Store markers by ID for reference

        // Notify RN that map is ready to receive commands
        setTimeout(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
        }, 500);

        function initMap(lat, lng, zoom) {
          map.setView([lat, lng], zoom);
        }

        function updateMarkers(markers) {
          markersLayer.clearLayers();
          markersData = {};

          markers.forEach(m => {
            var iconHtml = '<div style="background-color: #22D3EE; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>';
            
            // Customize color based on category if needed
            if (m.category === 'Hackathon') iconHtml = iconHtml.replace('#22D3EE', '#F472B6'); // Pink
            
            var icon = L.divIcon({
              className: 'custom-marker',
              html: iconHtml,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            var marker = L.marker([m.coordinate.latitude, m.coordinate.longitude], { icon: icon });
            
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_PRESS', id: m.id }));
            });

            marker.addTo(markersLayer);
            markersData[m.id] = marker;
          });
        }

        // Handle messages from React Native
        // No direct listener setup here needed for standard injection, but good practice
      </script>
    </body>
    </html>
  `;

  // Initialize map with region
  useEffect(() => {
    if (isMapReady && initialRegion) {
      const zoomLevel = Math.round(Math.log2(360 / initialRegion.longitudeDelta)) + 1;
      const script = `initMap(${initialRegion.latitude}, ${initialRegion.longitude}, ${zoomLevel});`;
      webViewRef.current?.injectJavaScript(script);
    }
  }, [isMapReady]); // On mount, wait for ready

  // Update markers when props change
  useEffect(() => {
    if (isMapReady) {
      const script = `updateMarkers(${JSON.stringify(markers)});`;
      webViewRef.current?.injectJavaScript(script);
    }
  }, [markers, isMapReady]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setIsMapReady(true);
      } else if (data.type === 'MARKER_PRESS') {
        if (onMarkerPress) {
          onMarkerPress(data.id);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={{ flex: 1, backgroundColor: '#0F172A' }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
      {!isMapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22D3EE" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapView;

// Export helper types if needed for parent
export { MapViewProps };
