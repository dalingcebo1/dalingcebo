'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FAQ() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const faqs = [
    {
      question: "Are these original artworks?",
      answer: "Yes, every piece labeled Original is one-of-a-kind and created by Dalingcebo. Limited-edition digital works are clearly marked with their edition counts."
    },
    {
      question: "Do artworks come with a certificate of authenticity?",
      answer: "Every artwork includes a signed certificate of authenticity from the artist, documenting provenance and key details."
    },
    {
      question: "Can I commission a custom piece?",
      answer: "Yes! Commissions are welcome. Please contact us through the contact page to discuss your vision, timeline, and pricing."
    },
    {
      question: "How do I care for my artwork?",
      answer: "Keep artworks away from direct sunlight, extreme temperatures, and humidity. For specific care instructions, visit our Care page or contact us."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, PayPal, and bank transfers. For high-value purchases, payment plans can be arranged."
    },
    {
      question: "Can I visit the studio?",
      answer: "Studio visits are available by appointment only. Please contact us to schedule a private viewing."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship worldwide. Shipping costs and delivery times vary by location and are calculated at checkout."
    },
    {
      question: "What if my artwork arrives damaged?",
      answer: "All shipments are fully insured. If damage occurs during shipping, contact us immediately with photos and we will arrange a replacement or refund."
    },
    {
      question: "Can I see more images of an artwork?",
      answer: "Yes! Contact us for additional photos, detail shots, or even a video of any artwork you are interested in."
    },
    {
      question: "Do you offer framing services?",
      answer: "Currently, artworks are sold unframed. We can recommend professional framers in your area upon request."
    }
  ]

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl">
          <div className={`fade-in-slow ${isVisible ? '' : ''}`}>
            <h1 className="yeezy-subheading text-4xl mb-8">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200">
                  <button
                    onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                    className="w-full flex justify-between items-center py-6 text-left hover:opacity-70 transition-opacity"
                  >
                    <h3 className="yeezy-title text-lg pr-8">{faq.question}</h3>
                    <span className="text-2xl font-thin flex-shrink-0">
                      {openQuestion === index ? '−' : '+'}
                    </span>
                  </button>
                  {openQuestion === index && (
                    <div className="pb-6 yeezy-body text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16 text-center border-t border-gray-200 pt-16">
              <h2 className="yeezy-title text-xl mb-4">Still have questions?</h2>
              <p className="yeezy-body text-gray-600 mb-6">
                We are here to help. Get in touch with us directly.
              </p>
              <Link href="/contact" className="btn-yeezy-primary inline-block">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
