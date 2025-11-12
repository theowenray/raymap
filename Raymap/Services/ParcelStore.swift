import Foundation
import MapKit

@MainActor
final class ParcelStore: ObservableObject {
    @Published private(set) var parcels: [Parcel] = []
    @Published private(set) var lastError: String?
    @Published var selectedParcel: Parcel?

    private let loader: ParcelLoader

    init(loader: ParcelLoader = ParcelLoader()) {
        self.loader = loader
    }

    func loadInitialData() async {
        guard parcels.isEmpty else { return }

        do {
            parcels = try loader.loadParcels()
            lastError = nil
        } catch {
            lastError = error.localizedDescription
        }
    }

    func select(_ parcel: Parcel?) {
        selectedParcel = parcel
    }
}

struct ParcelLoader {
    enum LoaderError: LocalizedError {
        case missingResource

        var errorDescription: String? {
            switch self {
            case .missingResource:
                return "Could not find the Shelby County parcel sample in the app bundle."
            }
        }
    }

    func loadParcels(resourceName: String = "shelby_parcels_sample") throws -> [Parcel] {
        guard let url = Bundle.main.url(forResource: resourceName, withExtension: "geojson") else {
            throw LoaderError.missingResource
        }

        let data = try Data(contentsOf: url)
        let decoder = MKGeoJSONDecoder()
        let objects = try decoder.decode(data)

        return objects
            .compactMap { $0 as? MKGeoJSONFeature }
            .compactMap { try? Parcel(feature: $0) }
    }
}

#if DEBUG
extension ParcelStore {
    static var preview: ParcelStore {
        let store = ParcelStore(loader: ParcelLoader())
        store.parcels = [
            Parcel.mock(owner: "Ray Family", parcelId: "17-04-00-200-001", address: "301 W South 1st St", acreage: 1.1),
            Parcel.mock(owner: "Shelby Farms LLC", parcelId: "17-05-00-101-004", address: "County Rd 1925E", acreage: 24.9)
        ]
        return store
    }
}
#endif
