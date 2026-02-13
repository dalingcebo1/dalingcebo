'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'
import Breadcrumb from '@/components/Breadcrumb'

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowToast(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <main className="min-h-screen">
      <Header showBackButton={false} />
      
      <section className="border-b border-gray-200 bg-white">
        <div className="yeezy-container py-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
        </div>
      </section>

      {/* Hero Section */}
      <section className="yeezy-hero bg-black text-white">
        <div className={`yeezy-hero-content fade-in-slow ${isVisible ? '' : ''}`}>
          <h1 className="yeezy-main-logo text-white mb-8">
            CONTACT
          </h1>
          <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
            Get in touch for inquiries, commissions, or just to say hello.
          </p>
        </div>
      </section>
      
      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl">
          <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="yeezy-subheading text-sm mb-6 tracking-[0.3em] text-gray-600">GET IN TOUCH</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="yeezy-body text-xs mb-2 uppercase tracking-wider text-gray-600">Email</h3>
                    <p className="yeezy-body text-base text-gray-700">hello@dalingcebo.art</p>
                  </div>
                  <div>
                    <h3 className="yeezy-body text-xs mb-2 uppercase tracking-wider text-gray-600">Studio</h3>
                    <p className="yeezy-body text-base text-gray-700">
                      Johannesburg, South Africa<br />
                      By appointment only
                    </p>
                  </div>
                  <div>
                    <h3 className="yeezy-body text-xs mb-2 uppercase tracking-wider text-gray-600">Social</h3>
                    <div className="flex gap-4">
                      <a href="#" className="yeezy-body text-base text-gray-700 hover:text-black transition-colors">Instagram</a>
                      <a href="#" className="yeezy-body text-base text-gray-700 hover:text-black transition-colors">Twitter</a>
                      <a href="#" className="yeezy-body text-base text-gray-700 hover:text-black transition-colors">LinkedIn</a>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block yeezy-body text-xs mb-2 uppercase tracking-wider text-gray-600">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 yeezy-body text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block yeezy-body text-xs mb-2 uppercase tracking-wider text-gray-600">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 yeezy-body text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block yeezy-body text-xs mb-2 uppercase tracking-wider text-gray-600">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 yeezy-body text-sm focus:outline-none focus:border-black transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="purchase">Purchase Inquiry</option>
                    <option value="commission">Commission Request</option>
                    <option value="press">Press Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block yeezy-body text-xs mb-2 uppercase tracking-wider text-gray-600">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full border border-gray-300 px-4 py-3 yeezy-body text-sm focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>
                
                <button type="submit" className="w-full btn-yeezy-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {showToast && (
        <Toast 
          message="Message sent! We'll get back to you soon."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <Footer />
    </main>
  )
}
