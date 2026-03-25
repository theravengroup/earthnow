import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import { FloatingDonateButton } from '@/components/floating-donate-button'
import { FooterSection } from '@/components/footer-section'
import { WarningSuppressor } from '@/components/warning-suppressor'
import './globals.css'

const cormorantGaramond = Cormorant_Garamond({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-serif'
});

const outfit = Outfit({ 
  weight: ['300', '400', '500', '600'],
  subsets: ["latin"],
  variable: '--font-sans'
});

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'EarthNow — The Planet. Right Now.',
  description: 'Real-time data on Earth\'s vital signs. See the patterns. Measure the impact. Join the signal.',
  generator: 'v0.app',
  metadataBase: new URL('https://earthnow.app'),
  openGraph: {
    title: 'EarthNow — The Planet. Right Now.',
    description: 'Real-time data on Earth\'s vital signs. See the patterns. Measure the impact. Join the signal.',
    url: 'https://earthnow.app',
    siteName: 'EarthNow',
    images: [
      {
        url: 'https://jddfmej7wr6ktfhc.public.blob.vercel-storage.com/earthnow-og.png',
        width: 1200,
        height: 630,
        alt: 'EarthNow — The Planet. Right Now.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EarthNow — The Planet. Right Now.',
    description: 'Real-time data on Earth\'s vital signs. See the patterns. Measure the impact. Join the signal.',
    images: ['https://jddfmej7wr6ktfhc.public.blob.vercel-storage.com/earthnow-og.png'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var origWarn = console.warn;
                console.warn = function() {
                  var msg = Array.prototype.join.call(arguments, ' ');
                  if (msg.indexOf('transparent') !== -1 && msg.indexOf('animatable') !== -1) return;
                  if (msg.indexOf('not an animatable value') !== -1) return;
                  if (msg.indexOf('THREE.Clock') !== -1) return;
                  origWarn.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} ${cormorantGaramond.variable} ${spaceMono.variable} font-sans antialiased`}>
        <WarningSuppressor />
        {children}
        <FooterSection />
        <FloatingDonateButton />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(15, 20, 30, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '14px',
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
