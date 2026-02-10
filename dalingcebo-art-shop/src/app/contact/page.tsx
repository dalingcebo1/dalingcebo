'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'

export default function Contact() {
  const [zoomLevel, setZoomLevel] = useState(0)
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
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl">
          <div className={`fade-in-slow ${isVisible ? '' : ''}`}>
            <h1 className="yeezy-subheading text-4xl mb-8">Contact</h1>
            
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <p className="yeezy-body text-lg leading-relaxed mb-8">
                  Get in touch for inquiries, commissions, or just to say hello.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="yeezy-title text-sm mb-2">Email</h3>
                    <p className="yeezy-body text-gray-600">hello@dalingcebo.art</p>
                  </div>
                  <div>
                    <h3 className="yeezy-title text-sm mb-2">Studio</h3>
                    <p className="yeezy-body text-gray-600">
                      Johannesburg, South Africa<br />
                      By appointment only
                    </p>
                  </div>
                  <div>
                    <h3 className="yeezy-title text-sm mb-2">Social</h3>
                    <div className="flex gap-4">
                      <a href="#" className="yeezy-body text-gray-600 hover:text-black transition-colors">Instagram</a>
                      <a href="#" className="yeezy-body text-gray-600 hover:text-black transition-colors">Twitter</a>
                      <a href="#" className="yeezy-body text-gray-600 hover:text-black transition-colors">LinkedIn</a>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block yeezy-title text-xs mb-2">Name</label>
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
                  <label htmlFor="email" className="block yeezy-title text-xs mb-2">Email</label>
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
                  <label htmlFor="subject" className="block yeezy-title text-xs mb-2">Subject</label>
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
                  <label htmlFor="message" className="block yeezy-title text-xs mb-2">Message</label>
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
