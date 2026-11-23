# Weight Tracker

Weight Tracker is an Expo app for recording weigh-ins, tracking progress, and managing weight goals. It uses Expo Router and Expo SQLite.

## Development

```bash
npm install
npx expo start
```

## Local Laravel API

Set `EXPO_PUBLIC_API_BASE_URL` in `.env` to the computer's LAN address, such as
`http://192.168.1.10:8000`. A physical phone cannot reach the computer through
`localhost`; connect the phone and computer to the same network.

From the backend directory, run its migrations and bind Laravel to the network:

```bash
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

Allow PHP through the computer's firewall if prompted. A new installation
registers with `POST /api/device-registration` and securely stores its
installation and access tokens on the device. It needs internet access for this
first registration. On later launches and when the app reconnects, it checks
`GET /api/device-status`. An already-registered installation can continue using
its local data while offline; if an administrator disables it, access is
blocked at the next successful status check.

The onboarding flow saves the profile locally and sends it to
`POST /api/onboarding`. If the server rejects the request, onboarding stays open
so the user can retry. If the device is offline, onboarding can finish with the
local profile, but that failed server sync is not automatically retried.

Users can optionally share their current coordinates from Settings. Location is
requested on app startup and shared after the user grants foreground
permission. Subsequent app launches refresh the location automatically. The
app reverse-geocodes a readable place name when available, and the backend
stores that name with the coordinates and capture time and returns a Google Maps
link. No background location tracking is enabled.

Run the checks with:

```bash
npx tsc --noEmit
npm run lint
```

After adding or changing Expo native modules, rebuild and reinstall the Android
app; restarting Expo Go or the Metro server alone does not update an existing
native binary.

The app routes are in `src/app/`; shared components, database code, utilities, and views are in the adjacent `src` directories.

Mobile UI uses React Native components styled with NativeWind. Keep `src/global.css` imported from the root layout and update `tailwind.config.js` if adding component files outside `src/`.

If NativeWind styles do not appear in Expo Go after changing Babel, Metro, or Tailwind configuration, stop the Expo server and restart it with `npx expo start --clear`, then reload the app from the new QR code.

Expo SQLite web support is alpha in SDK 57 and requires Metro WASM support plus cross-origin isolation headers. The Metro configuration and Expo Router headers are set up for this project. If deploying the static web export to a different host, configure `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` there as well.
