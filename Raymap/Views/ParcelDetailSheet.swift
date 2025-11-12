import SwiftUI

struct ParcelDetailSheet: View {
    let parcel: Parcel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Capsule()
                .fill(Color.secondary.opacity(0.4))
                .frame(width: 48, height: 5)
                .frame(maxWidth: .infinity)

            VStack(alignment: .leading, spacing: 4) {
                Text(parcel.properties.owner)
                    .font(.title3.bold())
                Text(parcel.properties.address)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Divider()

            DetailRow(title: "Parcel ID", value: parcel.properties.parcelId)
            DetailRow(title: "Acreage", value: String(format: "%.2f ac", parcel.properties.acreage))

            Spacer()
        }
        .padding()
    }
}

private struct DetailRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.body.monospaced())
        }
    }
}

#if DEBUG
#Preview {
    ParcelDetailSheet(
        parcel: Parcel.mock(
            owner: "Shelby Farms LLC",
            parcelId: "17-05-00-101-004",
            address: "County Rd 1925E",
            acreage: 24.9
        )
    )
}
#endif
