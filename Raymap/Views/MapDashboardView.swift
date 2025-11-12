import SwiftUI
import MapKit

struct MapDashboardView: View {
    @EnvironmentObject private var parcelStore: ParcelStore
    @EnvironmentObject private var authService: AuthService
    @State private var camera: MapCameraPosition = .region(.shelbyCounty)
    @State private var searchText = ""

    private var filteredParcels: [Parcel] {
        guard !searchText.isEmpty else { return parcelStore.parcels }
        return parcelStore.parcels.filter {
            $0.properties.owner.localizedCaseInsensitiveContains(searchText) ||
            $0.properties.parcelId.localizedCaseInsensitiveContains(searchText) ||
            $0.properties.address.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Shelby County")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Logout") {
                            authService.logout()
                        }
                    }
                }
                .searchable(text: $searchText, prompt: "Parcel ID, owner, or address")
        }
    }

    @ViewBuilder
    private var content: some View {
        ZStack(alignment: .bottom) {
            Map(position: $camera, interactionModes: .all) {
                ForEach(filteredParcels) { parcel in
                    MapPolygon(parcel.polygon)
                        .stroke(.blue.opacity(0.35), lineWidth: 1)
                        .foregroundStyle(polygonFill(for: parcel))

                    MapAnnotation(coordinate: parcel.centroid) {
                        Button {
                            parcelStore.select(parcel)
                        } label: {
                            Circle()
                                .fill(markerFill(for: parcel))
                                .frame(width: 10, height: 10)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .mapStyle(.standard(elevation: .realistic))
            .overlay(alignment: .topTrailing) {
                MapCompass()
                    .mapControlVisibility(.visible)
            }
            .overlay(alignment: .topLeading) {
                VStack {
                    MapPitchToggle()
                    MapUserLocationButton()
                }
                .padding(8)
                .buttonStyle(.borderedProminent)
            }
            .overlay(alignment: .bottomTrailing) {
                MapScaleView()
                    .padding()
            }

            if let error = parcelStore.lastError {
                Text(error)
                    .padding()
                    .background(.thinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding()
            }
        }
        .sheet(item: $parcelStore.selectedParcel) { parcel in
            ParcelDetailSheet(parcel: parcel)
                .presentationDetents([.fraction(0.35), .medium])
        }
    }

    private func polygonFill(for parcel: Parcel) -> Color {
        parcelStore.isSelected(parcel) ? Color.cyan.opacity(0.35) : Color.blue.opacity(0.18)
    }

    private func markerFill(for parcel: Parcel) -> Color {
        parcelStore.isSelected(parcel) ? Color.cyan : Color.indigo
    }
}

#if DEBUG
#Preview {
    MapDashboardView()
        .environmentObject(ParcelStore.preview)
        .environmentObject(AuthService())
}
#endif
