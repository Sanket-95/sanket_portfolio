import { Seo } from '@/components/seo/Seo';
import { Hero } from '@/sections/Hero';
import { Highlights } from '@/sections/Highlights';
import { Work } from '@/sections/Work';
import { Demos } from '@/sections/Demos';
import { Websites } from '@/sections/Websites';
import { Technologies } from '@/sections/Technologies';
import { About } from '@/sections/About';
import { Contact } from '@/sections/Contact';

export default function Home() {
  return (
    <>
      <Seo path="/" />
      <Hero />
      <Highlights />
      <Work />
      <Demos />
      <Websites />
      <Technologies tone="raised" />
      {/* Bands alternate default/raised down the page. */}
      <About />
      <Contact />
    </>
  );
}
