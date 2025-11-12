import Foundation

@MainActor
final class AuthService: ObservableObject {
    struct UserSession: Identifiable, Equatable {
        let id = UUID()
        let name: String
        let email: String
    }

    enum Phase: Equatable {
        case loggedOut
        case authenticating
        case authenticated(UserSession)
        case failed(String)
    }

    @Published private(set) var phase: Phase = .loggedOut

    func login(email: String, pin: String) {
        guard !email.isEmpty, !pin.isEmpty else {
            phase = .failed("Enter an email and the 4-digit PIN.")
            return
        }

        phase = .authenticating

        Task {
            try await Task.sleep(nanoseconds: 600_000_000)
            await MainActor.run {
                if pin == "2580" {
                    let name = email.components(separatedBy: "@").first ?? "Agent"
                    phase = .authenticated(UserSession(name: name.capitalized, email: email))
                } else {
                    phase = .failed("Invalid PIN. Try 2580 for the demo build.")
                }
            }
        }
    }

    func logout() {
        phase = .loggedOut
    }
}
