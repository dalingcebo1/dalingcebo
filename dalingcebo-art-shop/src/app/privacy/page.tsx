import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Dalingcebo Art Shop',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header showBackButton={false} />
      
      <section className="border-b border-gray-200 bg-white">
        <div className="yeezy-container py-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Privacy' }]} />
        </div>
      </section>

      <section className="yeezy-section flex-1">
        <div className="yeezy-container">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="yeezy-heading text-4xl md:text-5xl mb-4">PRIVACY POLICY</h1>
              <p className="yeezy-body text-sm text-gray-600">
                Last updated: February 2025
              </p>
            </div>

            <div className="space-y-8 yeezy-body text-base text-gray-700 leading-relaxed">
              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">INTRODUCTION</h2>
                <p>
                  At Dalingcebo, we respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and safeguard your information when you 
                  visit our website or make a purchase.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">INFORMATION WE COLLECT</h2>
                <p className="mb-4">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and contact information (email, phone, address)</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Order history and preferences</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">HOW WE USE YOUR INFORMATION</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process and fulfill your orders</li>
                  <li>Send you order confirmations and shipping updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our website and services</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">DATA SECURITY</h2>
                <p>
                  We implement appropriate security measures to protect your personal information. 
                  Payment information is processed through Stripe and we never store your complete 
                  credit card details on our servers.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">COOKIES</h2>
                <p>
                  We use cookies to improve your browsing experience and analyze site traffic. 
                  You can control cookie settings through your browser preferences.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">YOUR RIGHTS</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to processing of your personal data</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">THIRD-PARTY SERVICES</h2>
                <p className="mb-4">We use the following third-party services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Stripe for payment processing</li>
                  <li>Supabase for data storage and authentication</li>
                  <li>Resend for email communications</li>
                </ul>
                <p className="mt-4">
                  These services have their own privacy policies and we encourage you to review them.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">CONTACT US</h2>
                <p>
                  If you have any questions about this privacy policy or how we handle your data, 
                  please contact us at{' '}
                  <a href="mailto:info@dalingcebo.art" className="underline hover:no-underline">
                    info@dalingcebo.art
                  </a>
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">CHANGES TO THIS POLICY</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any 
                  changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
