export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          
          <p className="text-sm text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Cookie Policy Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cookie Policy
            </h2>
            <p className="text-gray-700 mb-4">
              Sunleaf Technologies uses cookies to ensure you get the best experience on our website. 
              This policy explains what cookies are, how we use them, and your choices regarding cookies.
            </p>
          </section>

          {/* What Are Cookies */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              What Are Cookies?
            </h3>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and keeping you logged in.
            </p>
          </section>

          {/* Cookies We Use */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Cookies We Use
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-mono text-sm">access_token</td>
                    <td className="border border-gray-300 px-4 py-2">Keeps you logged in to your account</td>
                    <td className="border border-gray-300 px-4 py-2">1 hour</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Essential
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-mono text-sm">refresh_token</td>
                    <td className="border border-gray-300 px-4 py-2">Maintains your login session securely</td>
                    <td className="border border-gray-300 px-4 py-2">30 days</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Essential
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. 
                They enable core functionality such as security, authentication, and accessibility. 
                The website cannot function properly without these cookies.
              </p>
            </div>
          </section>

          {/* Your Choices */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Your Choices
            </h3>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies through their settings. 
                However, blocking essential cookies may prevent you from using certain features of our website.
              </li>
              <li>
                <strong>Clear Cookies:</strong> You can delete cookies that have already been set through your browser settings.
              </li>
              <li>
                <strong>Logout:</strong> Logging out of your account will clear your authentication cookies.
              </li>
            </ul>
          </section>

          {/* Data Protection */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Data Protection
            </h3>
            <p className="text-gray-700 mb-4">
              We take your privacy seriously. Our authentication cookies are:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>HttpOnly:</strong> Cannot be accessed by JavaScript, protecting against XSS attacks</li>
              <li><strong>Secure:</strong> Transmitted only over HTTPS connections in production</li>
              <li><strong>SameSite:</strong> Protected against CSRF attacks</li>
              <li><strong>Encrypted:</strong> Authentication tokens are cryptographically signed</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Contact Us
            </h3>
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies or this privacy policy, please contact us:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Sunleaf Technologies</strong><br />
                Email: info@sunleaftechnologies.co.ke<br />
                Website: sunleaftechnologies.co.ke
              </p>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Updates to This Policy
            </h3>
            <p className="text-gray-700">
              We may update this privacy policy from time to time. Any changes will be posted on this page 
              with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
