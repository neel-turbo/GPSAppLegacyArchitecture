import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import {getCurrentLocation, LocationData} from './GPSModule';

const App = () => {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGetLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);

      mapRef.current?.animateToRegion(
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.08, // Zoom level
          longitudeDelta: 0.08,
        },
        1000,
      );
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = async () => {
    const camera = await mapRef.current?.getCamera();
    if (camera && camera.zoom !== undefined) {
      camera.zoom += 1;
      mapRef.current?.animateCamera(camera, {duration: 300});
    }
  };

  const handleZoomOut = async () => {
    const camera = await mapRef.current?.getCamera();
    if (camera && camera.zoom !== undefined) {
      camera.zoom -= 1;
      mapRef.current?.animateCamera(camera, {duration: 300});
    }
  };

  const defaultRegion: Region = {
    latitude: 30.55435,
    longitude: -91.03677,
    latitudeDelta: 40,
    longitudeDelta: 40,
  };

  const mapRegion: Region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : defaultRegion;

  console.log('location', location);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultRegion}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}>
        {location ? (
          <Marker
            key={`marker-${location.latitude}-${location.longitude}`}
            coordinate={{
              latitude: Number(location.latitude),
              longitude: Number(location.longitude),
            }}
            title="You are here"
            tracksViewChanges={false}
          />
        ) : null}
      </MapView>

      <View style={styles.zoomContainer}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomIn}
          activeOpacity={0.7}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>

        <View style={styles.zoomDivider} />

        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomOut}
          activeOpacity={0.7}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Floating UI overlay */}
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>GPS Locator</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {location && !error ? (
            <Text style={styles.coordText}>
              Lat: {location.latitude.toFixed(5)}
              {'\n'}
              Lon: {location.longitude.toFixed(5)}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleGetLocation}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Find My Location</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // for Android shadow
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  coordText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  zoomContainer: {
    position: 'absolute',
    right: 16,
    bottom: 250, // Adjust this height so it clears your GPS card!
    backgroundColor: 'white',
    borderRadius: 8,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Android Shadow
    elevation: 4,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  zoomText: {
    fontSize: 26,
    fontWeight: '300',
    color: '#333',
    // Slight tweak to perfectly center the math symbols
    marginTop: -2,
  },
  zoomDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E5E5E5',
  },
});

export default App;
