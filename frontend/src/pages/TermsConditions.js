import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineDocumentText, HiOutlineChevronRight } from 'react-icons/hi';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">Home</Link>
            <HiOutlineChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-800 font-medium">Terms & Conditions</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
            <HiOutlineDocumentText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-primary-200 max-w-2xl mx-auto">
            Please read these terms carefully before using our services
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
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using the Meraab & Emaan website and services, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, 
                please do not use our services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                2. Use of Services
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our services are intended for personal, non-commercial use. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not interfere with the proper working of the website</li>
                <li>Not attempt to gain unauthorized access to any portion of the website</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                3. Products and Pricing
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We strive to provide accurate product descriptions and pricing. However:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Colors may vary slightly due to monitor settings</li>
                <li>Prices are subject to change without notice</li>
                <li>We reserve the right to limit quantities</li>
                <li>All prices are displayed in Pakistani Rupees (PKR)</li>
                <li>Promotional offers may have additional terms and conditions</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                4. Orders and Payment
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                When you place an order with us:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>You are making an offer to purchase the products</li>
                <li>We reserve the right to accept or decline your order</li>
                <li>Payment must be made in full before shipment (except COD orders)</li>
                <li>We accept credit/debit cards, bank transfers, and cash on delivery</li>
                <li>Orders cannot be cancelled once they have been shipped</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                5. Shipping and Delivery
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Shipping policies include:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Free shipping on orders above PKR 5,000</li>
                <li>Standard shipping fee of PKR 200 for orders below PKR 5,000</li>
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Risk of loss transfers to you upon delivery to the carrier</li>
                <li>We ship to addresses within Pakistan only</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                6. Returns and Refunds
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our return policy allows:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Returns within 7 days of delivery</li>
                <li>Items must be unused and in original packaging</li>
                <li>Custom-made items are non-returnable</li>
                <li>Refunds will be processed within 7-10 business days</li>
                <li>Return shipping costs are the responsibility of the customer</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                7. Intellectual Property
              </h2>
              <p className="text-gray-600 leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property 
                of Meraab & Emaan and is protected by Pakistani and international copyright laws. You may not reproduce, 
                distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Meraab & Emaan shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages arising from your use of our services. Our total liability shall not exceed the amount paid 
                by you for the products purchased.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                9. Changes to Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon 
                posting on the website. Your continued use of our services after any changes constitutes acceptance 
                of the new terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                10. Contact Information
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="mt-4 p-6 bg-gray-50 rounded-xl">
                <p className="text-gray-800 font-semibold">Meraab & Emaan</p>
                <p className="text-gray-600">Email: support@meraab-emaan.com</p>
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

export default TermsConditions;
