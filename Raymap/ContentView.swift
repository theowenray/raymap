import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var authService: AuthService

    var body: some View {
        switch authService.phase {
        case .loggedOut, .failed(_):
            LoginView()
                .environmentObject(authService)
                .transition(.opacity)
        case .authenticating:
            ProgressView("Signing in…")
                .progressViewStyle(.circular)
        case .authenticated:
            MapDashboardView()
                .transition(.move(edge: .trailing))
        }
    }
}

#if DEBUG
#Preview {
    ContentView()
        .environmentObject(AuthService())
        .environmentObject(ParcelStore.preview)
}
#endif
