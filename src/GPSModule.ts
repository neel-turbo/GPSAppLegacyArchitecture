import {NativeModules, Platform, PermissionsAndroid} from 'react-native';

const {GPSModule} = NativeModules;

export interface LocationData {
  latitude: number;
  longitude: number;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS permissions are handled automatically by CoreLocation upon first request,
    // but in production you'd ideally use react-native-permissions to pre-check.
    // For this bridge, we assume true as the Native Module handles the trigger.
    return true;
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to function.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return false;
};

export const getCurrentLocation = async (): Promise<LocationData> => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  try {
    const location: LocationData = await GPSModule.getCurrentLocation();
    return location;
  } catch (error) {
    console.error('Failed to get location from Native Module', error);
    throw error;
  }
};
