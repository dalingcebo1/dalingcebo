import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata = {
  title: 'Press Kit',
  description: 'Press information and media resources for Dalingcebo contemporary art',
}

export default function PressPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header zoomLevel={0} setZoomLevel={() => {}} />
      
      <section className="border-b border-gray-200 bg-white">
        <div className="yeezy-container py-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Press' }]} />
        </div>
      </section>

      <section className="yeezy-section flex-1">
        <div className="yeezy-container">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center">
              <h1 className="yeezy-heading text-4xl md:text-5xl mb-4">PRESS KIT</h1>
              <p className="yeezy-body text-lg text-gray-600">
                Media resources and information
              </p>
            </div>

            <div className="space-y-8">
              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">ABOUT THE ARTIST</h2>
                <p className="yeezy-body text-base text-gray-700 leading-relaxed">
                  Dalingcebo is a contemporary artist working at the intersection of traditional and modern techniques. 
                  Based in Johannesburg, South Africa, their work explores themes of cultural identity, heritage, and 
                  the contemporary African experience.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">PRESS INQUIRIES</h2>
                <p className="yeezy-body text-base text-gray-700 leading-relaxed mb-4">
                  For press inquiries, interviews, and media requests:
                </p>
                <p className="yeezy-body text-base text-gray-700">
                  Email: <a href="mailto:press@dalingcebo.art" className="underline hover:no-underline">press@dalingcebo.art</a>
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">MEDIA RESOURCES</h2>
                <div className="space-y-3">
                  <p className="yeezy-body text-base text-gray-700">
                    High-resolution images and additional press materials are available upon request.
                  </p>
                  <p className="yeezy-body text-sm text-gray-600">
                    Please contact us with your media outlet information and intended use.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">RECENT COVERAGE</h2>
                <p className="yeezy-body text-base text-gray-600">
                  Press coverage will be updated here.
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
