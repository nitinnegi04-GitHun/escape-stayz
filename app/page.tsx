import { Metadata } from "next";
import { cache } from "react";
import { supabase } from "../lib/supabase";
import { getDestinations } from "../lib/queries";
import { SITE_URL, SITE_NAME, SITE_OG_IMAGE } from "../lib/constants";
import { Layout } from "../components/Layout";
import { Hero } from "../components/Hero";
import { StorySection } from "../components/StorySection";
import { PropertiesSection } from "../components/PropertiesSection";
import { FeaturedDestinations } from "../components/FeaturedDestinations";
import { CTASection } from "../components/CTASection";
import DirectBookingPopupClient from "../components/DirectBookingPopupClient";

// Revalidate every hour
export const revalidate = 3600;

const getPageData = cache(async () => {
  try {
    const { data: page, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", "home")
      .single();
    if (error) {
      console.error("Supabase error fetching home page:", error);
      return null;
    }
    return page;
  } catch (e) {
    console.error("Network error fetching home page:", e);
    return null;
  }
});

const getSections = cache(async (pageId: string) => {
  try {
    const { data: sections, error } = await supabase
      .from("sections")
      .select("*")
      .eq("page_id", pageId)
      .order("section_order");
    if (error) {
      console.error("Supabase error fetching sections:", error);
      return [];
    }
    return sections || [];
  } catch (e) {
    console.error("Network error fetching sections:", e);
    return [];
  }
});

const getHotels = cache(async () => {
  try {
    const { data } = await supabase
      .from('hotels')
      .select(`
        *,
        images:hotel_images(image_url, alt_text),
        rooms(price_per_night),
        hotel_amenities(amenity:amenities(name, icon)),
        highlights
      `)
      .limit(6);
    return data || [];
  } catch (e) {
    return [];
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageData();

  if (!page) {
    return {
      title: "Escape Stayz - Luxury Hotel Chain",
      description:
        "Crafting silent luxury and refined mountain hospitality across the globes most secluded peaks.",
    };
  }

  const title = page.meta_title || "Escape Stayz - Luxury Hotel Chain";
  const description =
    page.meta_description ||
    "Crafting silent luxury and refined mountain hospitality across the globes most secluded peaks.";

  return {
    title,
    description,
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_OG_IMAGE],
    },
  };
}

export default async function HomePage() {
  const page = await getPageData();
  const destinations = await getDestinations();
  const hotels = await getHotels();

  if (!page) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-20 text-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Initializing Home Page...
            </h1>
            <p className="text-gray-500">
              The home page structure is being set up in the database.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const sections = await getSections(page.id);
  const getSection = (key: string) =>
    sections.find((s) => s.section_key === key)?.content || {};

  const heroContent = { ...getSection("hero") };
  heroContent.cta_link = "#properties";

  const ctaContent = { ...getSection("cta") };
  ctaContent.heading = "Need Help Planning Your Trip?";
  ctaContent.subtitle =
    "From personalized itineraries to complete packages with stays and transport — we’ve got you covered.";
  ctaContent.button_text = "Connect with\nTravel Expert";
  ctaContent.button_link = "whatsapp";
  ctaContent.whatsappMessage =
    "Hi Escape Stayz team! I need help planning my trip.";

  return (
    <Layout>
      <Hero {...heroContent} />
      <StorySection {...getSection("story")} />
      <PropertiesSection {...getSection("properties")} hotels={hotels} />
      <FeaturedDestinations
        {...getSection("destinations")}
        destinations={destinations}
      />
      <CTASection {...ctaContent} />
      <DirectBookingPopupClient />
    </Layout>
  );
}
