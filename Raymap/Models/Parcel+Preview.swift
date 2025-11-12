#if DEBUG
import MapKit

extension Parcel {
    static func mock(
        owner: String,
        parcelId: String,
        address: String,
        acreage: Double,
        offset: Double = 0.01
    ) -> Parcel {
        let base = CLLocationCoordinate2D.shelbyCountyCenter
        let coords = [
            CLLocationCoordinate2D(latitude: base.latitude + offset, longitude: base.longitude + offset),
            CLLocationCoordinate2D(latitude: base.latitude + offset, longitude: base.longitude - offset),
            CLLocationCoordinate2D(latitude: base.latitude - offset, longitude: base.longitude - offset),
            CLLocationCoordinate2D(latitude: base.latitude - offset, longitude: base.longitude + offset)
        ]

        let polygon = MKPolygon(coordinates: coords, count: coords.count)
        let props = Parcel.Properties(parcelId: parcelId, owner: owner, address: address, acreage: acreage)

        return Parcel(id: UUID(), properties: props, polygon: polygon, centroid: polygon.centroid)
    }

    init(id: UUID, properties: Properties, polygon: MKPolygon, centroid: CLLocationCoordinate2D) {
        self.id = id
        self.properties = properties
        self.polygon = polygon
        self.centroid = centroid
    }
}
#endif
