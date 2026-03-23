"use client";
import React from "react";
import { Button } from "./ui/Button";
import { useSettings } from "../context/SettingsContext";

interface CTASectionProps {
  heading?: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  whatsappMessage?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  heading = "Ready for your next adventure?",
  subtitle = "Book your stay with us and experience the magic of the mountains.",
  button_text = "Book Now",
  button_link = "/plan-your-trip",
  whatsappMessage = "Hi! I am interested in planning a trip.",
}) => {
  const { settings } = useSettings();
  const finalLink =
    button_link === "whatsapp" && settings?.contact?.phone
      ? `https://wa.me/${settings.contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
      : button_link;

  return (
    <section
      className="relative py-24 px-6 md:px-12 text-white overflow-hidden bg-forest bg-fixed bg-center bg-cover"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2952&auto=format&fit=crop")',
      }}
    >
      <div className="absolute inset-0 bg-forest/80 backdrop-blur-sm"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 mix-blend-screen"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl text-white font-heading font-bold mb-8 drop-shadow-xl">
          {heading}
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md font-light">
          {subtitle}
        </p>
        <Button
          href={finalLink}
          className="whitespace-pre-line text-center leading-tight"
        >
          {button_text}
        </Button>
      </div>
    </section>
  );
};
