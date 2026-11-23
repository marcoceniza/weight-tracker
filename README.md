# Weight Tracker

Weight Tracker is a monorepo containing a Laravel web application and an Expo mobile application. The web app provides the admin panel and backend API for device registration and management; the mobile app records weigh-ins locally and synchronizes device, onboarding and location data with the backend.

## Technology Stack

- **Web (`web/`):** PHP `^8.3`, Laravel `^13.17`, Blade, Vite `^8.0`, Tailwind CSS `^4`, Pest `^5.3`. The admin UI is server-rendered Blade, not Vue or React.
- **Mobile (`mobile/`):** Expo `~57.0`, React Native `0.86`, React `19.2`, TypeScript `~6.0.3`, NativeWind `4.2`, Expo Router, Expo SQLite, Reanimated, SVG, Secure Store and Location.
- **Web database default:** SQLite, as specified by `web/.env.example`.

## Repository Structure

```text
.
├── .editorconfig
├── .gitignore
├── README.md
├── mobile/                  # Expo / React Native user application
│   ├── assets/
│   ├── src/
│   │   ├── app/             # Expo Router routes
│   │   ├── components/
│   │   ├── db/              # Expo SQLite schema and queries
│   │   ├── types/
│   │   ├── utils/
│   │   └── views/
│   ├── app.json
│   └── package.json
└── web/                     # Laravel admin panel and API
    ├── app/
    ├── database/
    ├── resources/views/     # Blade admin views
    ├── routes/
    ├── tests/
    ├── .env.example
    ├── composer.json
    └── package.json
```

The root repository tracks both application directories directly; neither app is a submodule. Each application has its own dependency manifest, lockfile and application-specific configuration.

## Prerequisites

- **Web:** PHP 8.3 or later, Composer, Node.js and npm, and PHP's PDO SQLite support when using the example SQLite database configuration.
- **Mobile:** Node.js and npm. Use an iOS simulator, Android emulator, a physical device with Expo Go, or a browser for the web target.

## Installation and Setup

### Web

```sh
cd web
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
npm install
npm run build
```

Or run the bundled setup script:

```sh
cd web
composer run setup
```

The example environment selects SQLite, and the database directory ignores generated SQLite files. Review `.env` and configure the database or other services if your setup differs from the example.

### Mobile

```sh
cd mobile
npm install
```

The `.env` file is ignored by Git. Set `EXPO_PUBLIC_API_BASE_URL` to a reachable origin for your backend, for example `http://192.168.1.10:8000` for a physical device on the same network, or `http://10.0.2.2:8000` for the standard Android emulator. Start the Laravel server with `php artisan serve --host=0.0.0.0 --port=8000` from `web/` so a device can reach it.

## Running the Applications

Run each app from its own directory.

### Web

```sh
cd web
php artisan serve
```

In another terminal, for the admin panel assets:

```sh
cd web
npm run dev
```

The Composer `dev` script starts the configured Laravel development process:

```sh
cd web
composer run dev
```

### Mobile

```sh
cd mobile
npm start
```

The package also defines `npm run android`, `npm run ios` and `npm run web` for the other targets.

## Testing and Build Commands

### Web

From `web/`:

- `composer test` clears the config cache and runs the Laravel test suite.
- `php artisan test` runs the tests directly.
- `vendor/bin/pint --test` checks PHP formatting.
- `npm run build` creates the frontend production build.

### Mobile

From `mobile/`:

- `npx tsc --noEmit` checks TypeScript types.
- `npm run lint` runs Expo ESLint.
- `npx expo export --platform android` verifies an Android bundle.

## Git Workflow

The repository root contains both applications as regular tracked directories. Make changes to either `web/` or `mobile/` and review them together. Each application retains its own dependencies, lockfile, scripts and application-specific configuration; install and run those dependencies from that application's directory.
