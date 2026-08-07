import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { UrantixBanner } from "@/components/site/urantix-banner";
import { Features } from "@/components/site/features";
import { Showcase } from "@/components/site/showcase";
import { Testimonials } from "@/components/site/testimonials";
import { Pricing } from "@/components/site/pricing";
import { Faq } from "@/components/site/faq";
import { Contact } from "@/components/site/contact";
import { Cta } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";
import { StructuredData } from "@/components/site/structured-data";

export default function Home() {
  return (
    <>
      <StructuredData />
      <Navbar />
      <main>
        <Hero />
        <UrantixBanner />
        <Features />
        <Showcase />
        <Testimonials />
        <Pricing />
        <Faq />
        <Contact />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
