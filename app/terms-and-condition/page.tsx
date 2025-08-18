"use client"

import React from "react"

export default function TermsAndConditionPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4 text-gray-700 leading-7">
          <p>
            By accessing or using this application, you agree to be bound by these Terms and
            Conditions. If you do not agree, do not use the service.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Use of Service</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must comply with applicable laws and platform policies (e.g., Meta, WhatsApp).</li>
            <li>Do not misuse or attempt to disrupt the service.</li>
            <li>Accounts are responsible for all activity conducted under them.</li>
          </ul>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Subscriptions & Billing</h2>
          <p>
            Some features may require a subscription. Fees are billed according to your selected
            plan and renewal terms.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Limitation of Liability</h2>
          <p>
            The service is provided "as is" without warranties of any kind. We are not liable for
            indirect or consequential damages to the extent permitted by law.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use constitutes acceptance of the
            updated terms.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Contact</h2>
          <p>
            For questions about these Terms, contact us at support@example.com.
          </p>
        </section>
      </div>
    </main>
  )
}


