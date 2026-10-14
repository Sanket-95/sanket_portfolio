import { Seo, breadcrumb } from '@/components/seo/Seo';
import { PageHeader } from '@/sections/PageHeader';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { CtaBand } from '@/sections/CtaBand';
import { ShopDemo } from '@/components/demo/ShopDemo';

const features = ['Search & category filters', 'Sorting', 'Wishlist', 'Cart with quantities', 'Coupon codes', 'Free-delivery threshold', 'Checkout & order confirmation'];

export default function EcommerceDemoPage() {
  return (
    <>
      <Seo path="/ecommerce-demo" jsonLd={[breadcrumb('E-commerce Website', '/ecommerce-demo')]} />
      <PageHeader
        eyebrow="E-commerce Website"
        title="A storefront your customers can shop in"
        description="Kartly is a single-page demo store. Search, filter, add to cart, apply the coupon WELCOME10 and check out — everything runs in your browser on mock data."
      />

      <Section labelledBy="shop-demo-title">
        <h2 id="shop-demo-title" className="sr-only">
          E-commerce store demo
        </h2>
        <ul aria-label="Features" className="mb-8 flex flex-wrap justify-center gap-2 lg:justify-start">
          {features.map((f) => (
            <li key={f} className="rounded-md border border-line bg-ink/60 px-2.5 py-1 text-xs font-medium text-slate-300">
              {f}
            </li>
          ))}
        </ul>
        <Reveal variant="scale">
          <ShopDemo />
        </Reveal>
      </Section>

      <CtaBand />
    </>
  );
}
