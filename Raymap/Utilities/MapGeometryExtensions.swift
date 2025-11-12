import MapKit

extension MKPolygon {
    /// Approximate centroid calculated by averaging polygon points.
    var centroid: CLLocationCoordinate2D {
        guard pointCount > 0 else {
            return .shelbyCountyCenter
        }

        let pointsPointer = points()
        var latitudeTotal: Double = 0
        var longitudeTotal: Double = 0

        for index in 0..<pointCount {
            let coord = pointsPointer[index].coordinate
            latitudeTotal += coord.latitude
            longitudeTotal += coord.longitude
        }

        return CLLocationCoordinate2D(
            latitude: latitudeTotal / Double(pointCount),
            longitude: longitudeTotal / Double(pointCount)
        )
    }
}

extension CLLocationCoordinate2D {
    static var shelbyCountyCenter: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: 39.409, longitude: -88.797)
    }
}

extension MKCoordinateRegion {
    static var shelbyCounty: MKCoordinateRegion {
        MKCoordinateRegion(
            center: .shelbyCountyCenter,
            span: MKCoordinateSpan(latitudeDelta: 0.55, longitudeDelta: 0.55)
        )
    }
}
