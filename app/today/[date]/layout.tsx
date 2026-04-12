import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, OG_IMAGE_URL } from '@/lib/constants'

interface Props {
  params: Promise<{ date: string }>;
}

// Parse date string YYYY-MM-DD for metadata
function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  if (isNaN(date.getTime())) return null;
  return date;
}

// Generate dynamic metadata for the dated /today/[date] page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const parsedDate = parseDate(date);
  
  if (!parsedDate) {
    return {
      title: 'Daily Planet Briefing — EarthNow',
      description: 'See what happened on Earth today with live statistics.',
    };
  }
  
  const dateStr = parsedDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'UTC',
  });
  
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
      url: `${SITE_URL}/today/${date}`,
      siteName: SITE_NAME,
      images: [
        {
          url: OG_IMAGE_URL,
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
      images: [OG_IMAGE_URL],
    },
    alternates: {
      canonical: `${SITE_URL}/today/${date}`,
    },
  };
}

export default function TodayDateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
