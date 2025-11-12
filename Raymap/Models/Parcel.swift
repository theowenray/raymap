import Foundation
import MapKit

struct Parcel: Identifiable, Hashable {
    struct Properties: Decodable {
        let parcelId: String
        let owner: String
        let address: String
        let acreage: Double
    }

    let id: UUID
    let properties: Properties
    let polygon: MKPolygon
    let centroid: CLLocationCoordinate2D

    init(feature: MKGeoJSONFeature) throws {
        guard let polygon = feature.geometry
            .compactMap({ $0 as? MKPolygon })
            .first else {
            throw ParcelError.invalidGeometry
        }

        guard let data = feature.properties else {
            throw ParcelError.missingProperties
        }

        let decoder = JSONDecoder()
        let props = try decoder.decode(Properties.self, from: data)

        self.id = UUID()
        self.properties = props
        self.polygon = polygon
        self.centroid = polygon.centroid
    }

    static func == (lhs: Parcel, rhs: Parcel) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

extension Parcel {
    enum ParcelError: Error {
        case invalidGeometry
        case missingProperties
    }
}
