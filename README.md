# Raymap

Raymap is an iOS SwiftUI prototype that previews the experience for a county parcel explorer. The current build focuses on Shelby County, IL and ships with a lightweight offline data set so that the map, parcel selection flow, and authentication shell can be demonstrated without external services.

## Features

- **Credential-gated entry** – simple email + PIN form with basic validation and room to swap in OAuth or SSO.
- **Shelby County map** – MapKit camera pre-focused on the county seat with compass, scale, and pitch controls enabled.
- **Parcel overlays** – GeoJSON loader converts polygons into MapKit overlays and parcel metadata.
- **Owner insights** – selecting a parcel surfaces the owner profile, parcel identifiers, address, and acreage in a sheet.
- **Extensible data pipeline** – drop updated GeoJSON exports from the county GIS team into `Raymap/Resources/Data/` and the loader will ingest them on the next app launch.

## Running the app

1. Open `Raymap.xcodeproj` in Xcode 15 or newer.
2. Select the `Raymap` scheme and an iOS 17+ simulator (or device).
3. Build & run. Use any email plus the demo PIN `2580` to sign in.

## Web preview

A companion web experience lives under `web/` and mirrors the Shelby County parcel explorer:

1. `cd web`
2. Copy the sample environment: `cp .env.example .env`
3. Install dependencies: `npm install`
4. Start the API server: `npm run server` (listens on the `PORT` defined in `.env`)
5. In a new terminal, launch the Vite dev server: `npm run dev`

The frontend expects the API at `VITE_API_BASE_URL` (default `http://localhost:4000`) and proxies `/api` requests in development.

### Credentials

Use the demo username/password pair defined in `.env` (defaults to `planner` / `raymap`).

### Testing

Run `npm test` from `web/` to execute Vitest suites that cover the authentication flow and property information endpoints.


## Working with GitHub in Xcode

If you would rather manage the repository from within Xcode instead of the command line:

1. From Xcode's welcome window choose **Clone an Existing Project**, paste the GitHub URL for Raymap, and pick a destination folder. Xcode will check out the repo and open `Raymap.xcodeproj` automatically.
2. To work with an already cloned checkout, open the project via **File → Open...**. Xcode detects the Git repository and enables the **Source Control** menu for commits, pulls, and pushes.
3. Remote details can be updated later through **Source Control → Raymap → Configure Raymap…**, where you can verify the GitHub account, remotes, and default branch.

These built-in tools make it easy to keep your local copy in sync with GitHub without leaving Xcode, while still allowing you to fall back to command-line Git when needed.

## Troubleshooting project metadata updates

If Xcode reports that the project is "damaged" after pulling fresh metadata:

1. Quit any open Xcode instances so they release cached project state.
2. Run **File → Open...** in Xcode and choose the repo's `Raymap.xcodeproj` again so it reloads the regenerated metadata.
3. Choose **Product → Clean Build Folder...** (⇧⌘K) once before building to discard derived data created from the previous project definition.

After re-opening, the shared **Raymap** scheme should appear automatically and the project should build normally.

## Next steps

- Replace the mock `AuthService` with a real identity provider.
- Point `ParcelStore` at an API or on-device SQLite store that mirrors the county's authoritative parcel layer.
- Expand the GeoJSON sample (or switch to vector tiles) for the full Shelby County dataset.
- Add offline caching, filtering, parcel search, and owner contact history to round out the field workflow.
