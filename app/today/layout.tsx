import type { Metadata } from 'next'

// Get today's ISO date string
function getTodayISODate(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

// Generate dynamic metadata for the /today page
export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isoDate = getTodayISODate();
  
  // Use approximate daily totals for OG description (static estimates for social previews)
  const approxBirths = "~380,000";
  const approxDeaths = "~170,000";
  const approxCO2 = "~115M tonnes";
  
  return {
    title: `Today on Earth — ${dateStr}`,
    description: `So far today: ${approxBirths} born, ${approxDeaths} died, ${approxCO2} of CO₂ released. See the planet in real time.`,
    openGraph: {
      title: `Today on Earth — ${dateStr}`,
      description: `So far today: ${approxBirths} born, ${approxDeaths} died, ${approxCO2} of CO₂ released. See the planet in real time.`,
      url: `https://earthnow.app/today/${isoDate}`,
      siteName: 'EarthNow',
      images: [
        {
          url: 'https://jddfmej7wr6ktfhc.public.blob.vercel-storage.com/earthnow-og.png',
          width: 1200,
          height: 630,
          alt: `Today on Earth — ${dateStr} — EarthNow`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Today on Earth — ${dateStr}`,
      description: `So far today: ${approxBirths} born, ${approxDeaths} died, ${approxCO2} of CO₂ released. See the planet in real time.`,
      images: ['https://jddfmej7wr6ktfhc.public.blob.vercel-storage.com/earthnow-og.png'],
    },
    alternates: {
      canonical: `https://earthnow.app/today/${isoDate}`,
    },
  };
}

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
