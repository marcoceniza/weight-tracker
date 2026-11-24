# Weight Tracker

Weight Tracker is a monorepo containing a Laravel web application and an Expo mobile application. The web app provides the admin panel and backend API for device registration and management; the mobile app records weigh-ins locally and synchronizes device, onboarding and location data with the backend.

## Technology Stack

- **Web (`web/`):** PHP `^8.3`, Laravel `^13.17`, Blade, Vite `^8.0`, Tailwind CSS `^4`, Pest `^5.3`. The admin UI is server-rendered Blade, not Vue or React.
- **Mobile (`mobile/`):** Expo `~57.0`, React Native `0.86`, React `19.2`, TypeScript `~6.0.3`, NativeWind `4.2`, Expo Router, Expo SQLite, Reanimated, SVG, Secure Store and Location.
- **Web database default:** SQLite, as specified by `web/.env.example`. Docker overrides this with MySQL on the shared `database` network (`weight_tracker` database and user).

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
    ├── docker/              # wait-for-db.sh
    ├── resources/views/     # Blade admin views
    ├── routes/
    ├── tests/
    ├── .env.example
    ├── Dockerfile
    ├── docker-compose.yml
    ├── composer.json
    └── package.json
```

The root repository tracks both application directories directly; neither app is a submodule. Each application has its own dependency manifest, lockfile and application-specific configuration.

## Prerequisites

- **Web:** PHP 8.3 or later, Composer, Node.js and npm, and PHP's PDO SQLite support when using the example SQLite database configuration. Docker is optional but recommended.
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

The example environment selects SQLite for non-Docker development. For Docker, set `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD` in `web/.env` instead — see below.

### Mobile

```sh
cd mobile
npm install
```

There is no committed mobile `.env.example`. Create a local `mobile/.env` with `EXPO_PUBLIC_API_BASE_URL` set to a reachable API origin, for example `http://192.168.1.10:8000` for a physical device on the same network, or `http://10.0.2.2:8000` for the standard Android emulator. Start Laravel with `php artisan serve --host=0.0.0.0 --port=8000` from `web/` so a device can reach it.

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

#### Docker

The web app can run in Docker against the shared MySQL container. Set `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD` in `web/.env` first, then:

```sh
cd web
docker compose up -d --build
docker compose exec weight-tracker php artisan migrate --force
```

The app is available at `http://localhost:8001` (host port 8001 maps to container port 8000; the rental app uses 8000 and the boarding app uses 8002). It joins the external `database` network from `C:/Users/marco/docker/database/compose.yml`; the database container publishes no host port. The health endpoint is `/health`. Stop it with `docker compose down`.

### Mobile

```sh
cd mobile
npm start
```

The package also defines `npm run android`, `npm run ios` and `npm run web` for the other targets.

## Environment Configuration

The web app's `web/.env.example` is the template for its local `web/.env`. It includes SQLite development defaults; Docker requires the `DB_*` variables to be set. Keep `.env` files and credentials private — the root ignore rules exclude them while allowing `.env.example` files to be committed.

The mobile app reads `EXPO_PUBLIC_API_BASE_URL` from a local `mobile/.env`. The root ignore rules exclude `.env` files, but the original repository history tracked `mobile/.env`; if that history is reused, untrack it with `git rm --cached mobile/.env`. Do not put credentials in the source.

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
