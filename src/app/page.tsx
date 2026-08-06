import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { UrantixBanner } from "@/components/site/urantix-banner";
import { Features } from "@/components/site/features";
import { Showcase } from "@/components/site/showcase";
import { Stats } from "@/components/site/stats";
import { Testimonials } from "@/components/site/testimonials";
import { Pricing } from "@/components/site/pricing";
import { Faq } from "@/components/site/faq";
import { Cta } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <UrantixBanner />
        <Features />
        <Showcase />
        <Stats />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
