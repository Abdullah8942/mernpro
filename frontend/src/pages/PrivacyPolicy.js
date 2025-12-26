import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineChevronRight } from 'react-icons/hi';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">Home</Link>
            <HiOutlineChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-800 font-medium">Privacy Policy</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
            <HiOutlineShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-primary-200 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-primary-300 text-sm mt-4">Last updated: December 26, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping and billing addresses</li>
                <li><strong>Account Information:</strong> Username, password, and preferences</li>
                <li><strong>Payment Information:</strong> Credit card details (processed securely through our payment providers)</li>
                <li><strong>Order Information:</strong> Purchase history, product preferences, and custom measurements</li>
                <li><strong>Communication:</strong> Messages you send to us through contact forms or customer service</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                2. Information Collected Automatically
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                When you visit our website, we automatically collect:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                <li><strong>Log Information:</strong> IP address, access times, pages viewed</li>
                <li><strong>Cookies:</strong> We use cookies to enhance your experience and analyze site usage</li>
                <li><strong>Analytics:</strong> Information about how you interact with our website</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send promotional emails (you can opt out at any time)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and secure our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                4. Information Sharing
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Service Providers:</strong> Companies that help us operate our business (shipping, payment processing, analytics)</li>
                <li><strong>Business Partners:</strong> Only with your consent for specific purposes</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and employee training</li>
                <li>Secure data storage and backup systems</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                6. Your Rights and Choices
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Update:</strong> Correct inaccurate information</li>
                <li><strong>Delete:</strong> Request deletion of your account and data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Cookie Preferences:</strong> Manage cookie settings in your browser</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                7. Cookies Policy
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the following types of cookies:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                8. Data Retention
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in 
                this policy, unless a longer retention period is required by law. Order history and transaction 
                records are kept for 7 years for accounting purposes.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our services are not intended for children under 18 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                10. Changes to Privacy Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the "Last updated" date. We encourage you 
                to review this policy periodically.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-6 bg-gray-50 rounded-xl">
                <p className="text-gray-800 font-semibold">Meraab & Emaan - Privacy Team</p>
                <p className="text-gray-600">Email: privacy@meraab-emaan.com</p>
                <p className="text-gray-600">Phone: +92 300 1234567</p>
                <p className="text-gray-600">Address: Lahore, Pakistan</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
