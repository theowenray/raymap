import SwiftUI
import MapKit

@main
struct RaymapApp: App {
    @StateObject private var parcelStore = ParcelStore()
    @StateObject private var authService = AuthService()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(parcelStore)
                .environmentObject(authService)
                .task {
                    await parcelStore.loadInitialData()
                }
        }
    }
}
