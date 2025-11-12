import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var authService: AuthService
    @State private var email = ""
    @State private var pin = ""

    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text("Raymap")
                    .font(.largeTitle.bold())
                Text("Shelby County parcel intelligence")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 12) {
                TextField("work.email@county.gov", text: $email)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
                    .textFieldStyle(.roundedBorder)

                SecureField("4-digit PIN (2580)", text: $pin)
                    .keyboardType(.numberPad)
                    .textContentType(.password)
                    .textFieldStyle(.roundedBorder)
            }

            Button {
                authService.login(email: email, pin: pin)
            } label: {
                HStack {
                    Spacer()
                    Text("Sign In")
                        .font(.headline)
                        .padding(.vertical, 12)
                    Spacer()
                }
                .background(Color.accentColor)
                .foregroundStyle(.white)
                .cornerRadius(10)
            }
            .buttonStyle(.plain)

            if case let .failed(message) = authService.phase {
                Text(message)
                    .foregroundStyle(.red)
                    .font(.footnote)
            } else if authService.phase == .authenticating {
                ProgressView()
            }

            Spacer()
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.blue.opacity(0.1), .mint.opacity(0.1)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
    }
}

#if DEBUG
#Preview {
    LoginView()
        .environmentObject(AuthService())
}
#endif
