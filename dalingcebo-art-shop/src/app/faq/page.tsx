import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Common questions about purchasing, shipping, and caring for artwork',
}

export default function FAQPage() {
  const faqs = [
    {
      question: 'How do I purchase an artwork?',
      answer: 'Browse our collection and add items to your cart. During checkout, you can choose to pay in full or make a deposit. We accept major credit cards through Stripe.',
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship worldwide. Shipping costs are calculated at checkout based on your location and the size of the artwork.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 14 days of delivery for a full refund, minus shipping costs. The artwork must be in its original condition.',
    },
    {
      question: 'How should I care for my artwork?',
      answer: 'Keep artworks away from direct sunlight and moisture. Dust gently with a soft, dry cloth. For specific care instructions, see our Care Guide.',
    },
    {
      question: 'Can I commission a custom piece?',
      answer: 'Yes! Please contact us through our inquiry form to discuss your commission. We\'ll work with you on size, colors, and concept.',
    },
    {
      question: 'How long does shipping take?',
      answer: 'Domestic shipping typically takes 3-5 business days. International shipping can take 7-14 business days depending on customs processing.',
    },
    {
      question: 'Are the artworks signed?',
      answer: 'Yes, all original artworks are signed and dated by the artist on the back of the canvas.',
    },
    {
      question: 'Do you offer payment plans?',
      answer: 'We accept deposit payments at checkout. Contact us to arrange a custom payment plan for larger purchases.',
    },
  ]

  return (
    <main className="min-h-screen flex flex-col">
      <Header showBackButton={false} />
      
      <section className="border-b border-gray-200 bg-white">
        <div className="yeezy-container py-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
        </div>
      </section>

      <section className="yeezy-section flex-1">
        <div className="yeezy-container">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center">
              <h1 className="yeezy-heading text-4xl md:text-5xl mb-4">FAQ</h1>
              <p className="yeezy-body text-lg text-gray-600">
                Frequently asked questions
              </p>
            </div>

            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="border-t border-gray-200 pt-8">
                  <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.15em]">
                    {faq.question}
                  </h2>
                  <p className="yeezy-body text-base text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-8 text-center">
              <p className="yeezy-body text-base text-gray-700 mb-4">
                Still have questions?
              </p>
              <a href="/contact" className="btn-yeezy-primary inline-block">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
