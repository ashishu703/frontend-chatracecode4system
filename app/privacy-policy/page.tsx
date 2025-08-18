"use client"

import React from "react"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4 text-gray-700 leading-7">
          <p>
            We respect your privacy. This Privacy Policy explains how we collect, use, and safeguard
            your information when you use our services.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Information We Collect</h2>
          <p>
            Depending on your use, we may collect account information (such as name, email), usage
            data, and communication metadata required to operate messaging integrations.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve the application</li>
            <li>Authenticate users and secure the platform</li>
            <li>Offer customer support and troubleshoot issues</li>
          </ul>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with service providers as
            necessary to deliver functionality, subject to appropriate safeguards.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your personal data, subject to
            applicable law.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at support@example.com.
          </p>
        </section>
      </div>
    </main>
  )
}


