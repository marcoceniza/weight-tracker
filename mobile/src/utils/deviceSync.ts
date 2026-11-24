/**
 * Synchronizes device registration and app data with the admin backend.
 */
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');
const INSTALLATION_TOKEN_KEY = 'device_installation_token';
const DEVICE_TOKEN_KEY = 'device_access_token';

interface DevicePayload {
  device_name?: string;
  device_brand?: string;
  device_model?: string;
  device_id?: string;
  os_version?: string;
  app_version?: string;
}

interface OnboardingPayload {
  name: string;
  currentWeight: number;
  currentWeightDate: string;
  unit: 'kg' | 'lbs';
  heightCm: number;
}

interface RegistrationResponse {
  success?: boolean;
  data?: {
    token?: unknown;
    enabled?: unknown;
  };
}

export class DeviceAccessError extends Error {
  constructor(
    message: string,
    public readonly disabled = false
  ) {
    super(message);
    this.name = 'DeviceAccessError';
  }
}

function apiUrl(path: string): string {
  if (!configuredApiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured.');
  }

  return `${configuredApiBaseUrl}/api/${path}`;
}

function appVersion(): string {
  const buildId = Application.nativeBuildVersion ?? '';
  const version =
    Constants.expoConfig?.version ?? Application.nativeApplicationVersion ?? '1.0.0';
  return buildId ? `${version} (${buildId})` : version;
}

function isNativePlatform(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

export async function collectDeviceInfo(): Promise<DevicePayload> {
  const modelName = Device.modelName ?? undefined;
  const brand = Device.brand ?? undefined;
  const osVersion = Device.osVersion ?? undefined;
  const id =
    Device.osName === 'Android'
      ? Application.getAndroidId()
      : Device.osName === 'iOS'
        ? (await Application.getIosIdForVendorAsync()) ?? undefined
        : undefined;

  return {
    device_name: Device.deviceName ?? modelName,
    device_brand: brand,
    device_model: modelName,
    device_id: id,
    os_version: osVersion,
    app_version: appVersion(),
  };
}

async function getInstallationToken(): Promise<string> {
  const existingToken = await SecureStore.getItemAsync(INSTALLATION_TOKEN_KEY);
  if (existingToken) {
    return existingToken;
  }

  const installationToken = Crypto.randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_TOKEN_KEY, installationToken);

  return installationToken;
}

function disabledDeviceError(): DeviceAccessError {
  return new DeviceAccessError(
    'This device has been disabled by the administrator. Contact support if you think this is a mistake.',
    true
  );
}

async function registerDevice(): Promise<void> {
  const installationToken = await getInstallationToken();
  const deviceInfo = await collectDeviceInfo();
  let response: Response;

  try {
    response = await fetch(apiUrl('device-registration'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        installation_token: installationToken,
        ...deviceInfo,
      }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new DeviceAccessError(
        'Connect to the internet to register this installation before using the app.'
      );
    }

    throw error;
  }

  if (response.status === 403) {
    throw disabledDeviceError();
  }

  if (!response.ok) {
    throw new DeviceAccessError(
      `Device registration failed (HTTP ${response.status}). Please try again.`
    );
  }

  const result = (await response.json()) as RegistrationResponse;
  const token = result.data?.token;
  if (result.success !== true || result.data?.enabled !== true || typeof token !== 'string') {
    throw new DeviceAccessError('The server returned an invalid device registration response.');
  }

  await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);
}

async function checkDeviceStatus(token: string): Promise<'enabled' | 'unauthorized' | 'offline'> {
  let response: Response;

  try {
    response = await fetch(apiUrl('device-status'), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      return 'offline';
    }

    throw error;
  }

  if (response.status === 403) {
    throw disabledDeviceError();
  }

  if (response.status === 401) {
    return 'unauthorized';
  }

  if (!response.ok) {
    throw new DeviceAccessError(
      `Could not verify device access (HTTP ${response.status}). Please try again.`
    );
  }

  return 'enabled';
}

/**
 * New installations must register online. Existing installations may keep
 * using their local data when offline, and are rechecked whenever the app
 * starts or returns to the foreground.
 */
export async function ensureDeviceAccess(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  const storedToken = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
  if (storedToken) {
    const status = await checkDeviceStatus(storedToken);
    if (status === 'enabled' || status === 'offline') {
      return;
    }
  }

  await registerDevice();
}

async function authorizationHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
  if (!token) {
    throw new Error('This device is not registered with the server.');
  }

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function sendOnboardingData(values: OnboardingPayload): Promise<boolean> {
  if (!isNativePlatform()) {
    return true;
  }

  const response = await fetch(apiUrl('onboarding'), {
    method: 'POST',
    headers: await authorizationHeaders(),
    body: JSON.stringify({
      name: values.name,
      current_weight: values.currentWeight,
      current_weight_date: values.currentWeightDate,
      unit: values.unit,
      height_cm: values.heightCm,
    }),
  }).catch((error: unknown) => {
    if (error instanceof TypeError) {
      console.warn('[DeviceSync] Onboarding data was saved locally but could not be sent while offline.');
      return null;
    }

    throw error;
  });

  if (response === null) {
    return false;
  }

  if (!response.ok) {
    throw new Error(`The server rejected onboarding data (HTTP ${response.status}).`);
  }

  return true;
}

export async function sendDeviceLocation(
  latitude: number,
  longitude: number,
  locationName?: string
): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  const response = await fetch(apiUrl('device-info/location'), {
    method: 'POST',
    headers: await authorizationHeaders(),
    body: JSON.stringify({
      latitude,
      longitude,
      location_name: locationName,
    }),
  });

  if (!response.ok) {
    throw new Error(`The server rejected your location (HTTP ${response.status}).`);
  }
}

export async function getCurrentDeviceLocation(): Promise<{
  latitude: number;
  longitude: number;
  locationName?: string;
}> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error('Location permission was not granted.');
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    if (Platform.OS === 'android') {
      await Location.enableNetworkProviderAsync();
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      throw new Error('Location services are turned off.');
    }
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
    mayShowUserSettingsDialog: true,
  });

  let locationName: string | undefined;
  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    if (address) {
      const parts = [
        address.city || address.district,
        address.region || address.subregion,
        address.isoCountryCode || address.country,
      ].filter((part): part is string => Boolean(part));
      locationName = [...new Set(parts)].join(', ') || address.formattedAddress || undefined;
    }
  } catch (error) {
    console.warn('[DeviceSync] Could not resolve a place name for the shared coordinates:', error);
  }

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    locationName,
  };
}

export async function shareCurrentDeviceLocation(): Promise<void> {
  const location = await getCurrentDeviceLocation();
  await sendDeviceLocation(
    location.latitude,
    location.longitude,
    location.locationName
  );
}

/**
 * Metadata is best-effort and must not prevent the user from using the app.
 */
export async function sendDeviceInfo(): Promise<boolean> {
  if (!isNativePlatform()) {
    return false;
  }

  try {
    const response = await fetch(apiUrl('device-info'), {
      method: 'POST',
      headers: await authorizationHeaders(),
      body: JSON.stringify(await collectDeviceInfo()),
    });

    if (!response.ok) {
      console.warn(`[DeviceSync] Device info request failed (HTTP ${response.status}).`);
    }

    return response.ok;
  } catch (error) {
    console.warn('[DeviceSync] Failed to send device info:', error);
    return false;
  }
}
