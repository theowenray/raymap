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

## Next steps

- Replace the mock `AuthService` with a real identity provider.
- Point `ParcelStore` at an API or on-device SQLite store that mirrors the county's authoritative parcel layer.
- Expand the GeoJSON sample (or switch to vector tiles) for the full Shelby County dataset.
- Add offline caching, filtering, parcel search, and owner contact history to round out the field workflow.
