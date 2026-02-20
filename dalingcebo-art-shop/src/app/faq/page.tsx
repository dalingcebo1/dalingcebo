'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageShell from '@/components/layout/PageShell'

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

export default function FAQPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header showBackButton={false} />
      
      <PageShell
        title="FAQ"
        subtitle="Frequently asked questions"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
        maxWidth="narrow"
      >
        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
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

          <div className="border-t border-gray-200 pt-8 text-center mt-12">
            <p className="yeezy-body text-base text-gray-700 mb-4">
              Still have questions?
            </p>
            <a href="/contact" className="btn-yeezy-primary inline-block">
              Contact Us
            </a>
          </div>
        </div>
      </PageShell>

      <Footer />
    </main>
  )
}
