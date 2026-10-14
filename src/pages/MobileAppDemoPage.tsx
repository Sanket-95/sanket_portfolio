import { ClipboardList, LayoutDashboard, Smartphone, UtensilsCrossed } from 'lucide-react';
import { Seo, breadcrumb } from '@/components/seo/Seo';
import { PageHeader } from '@/sections/PageHeader';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { CtaBand } from '@/sections/CtaBand';
import { CafeAppDemo } from '@/components/demo/CafeAppDemo';
import { DemoIntro } from '@/components/demo/DeviceFrames';

const screens = [
  { icon: UtensilsCrossed, title: 'Take orders', text: 'Pick a table, browse the menu by category or search it, and build the order with quick add and quantity controls.' },
  { icon: ClipboardList, title: 'Track the kitchen', text: 'Every order moves New → Preparing → Ready → Served with one tap, with a live count of what’s still open.' },
  { icon: LayoutDashboard, title: 'See the day', text: 'Revenue, order count, sales by hour, kitchen status and top-selling items update as orders come in.' },
];

export default function MobileAppDemoPage() {
  return (
    <>
      <Seo path="/mobile-app-demo" jsonLd={[breadcrumb('Mobile Application', '/mobile-app-demo')]} />
      <PageHeader
        eyebrow="Mobile Application"
        title="A café order-management app"
        description="Brew & Bean is a demo app for café staff. Take an order, send it to the kitchen and follow it to the table — it runs right here on mock data."
      />

      <Section labelledBy="app-demo-title">
        <h2 id="app-demo-title" className="sr-only">
          Mobile app demo
        </h2>
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-20">
          <Reveal variant="scale">
            <CafeAppDemo />
          </Reveal>

          <Reveal delay={0.1}>
            <DemoIntro
              icon={<Smartphone size={18} aria-hidden="true" />}
              label="Brew & Bean · Staff app"
              title="Three screens, one flow"
              text="Use the tabs at the bottom of the phone. Try adding a few items, sending the order, then moving it through the kitchen."
            />
            <ul className="space-y-4">
              {screens.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4 rounded-2xl border border-line bg-panel/70 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-soft">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
