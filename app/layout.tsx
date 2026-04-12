import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import { FloatingDonateButton } from '@/components/floating-donate-button'
import { FooterSection } from '@/components/footer-section'
import { SITE_URL, OG_IMAGE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/constants'
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
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
              },
            }),
          }}
        />
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
