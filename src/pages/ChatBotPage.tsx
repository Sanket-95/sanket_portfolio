import { Globe, MessageCircle } from 'lucide-react';
import { Seo, breadcrumb } from '@/components/seo/Seo';
import { PageHeader } from '@/sections/PageHeader';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { CtaBand } from '@/sections/CtaBand';
import { WhatsAppDemo } from '@/components/chat/WhatsAppDemo';
import { WebsiteBotDemo } from '@/components/chat/WebsiteBotDemo';
import { DemoIntro } from '@/components/demo/DeviceFrames';

export default function ChatBotPage() {
  return (
    <>
      <Seo path="/chat-bot" jsonLd={[breadcrumb('Chat Bot', '/chat-bot')]} />
      <PageHeader
        eyebrow="Chat Bot"
        title="Chat bots for WhatsApp and your website"
        description="Two working demos you can talk to. Tap a reply button or type your own message — all conversations are simulated and nothing leaves your browser."
      />

      <Section labelledBy="chatbot-demos-title">
        <h2 id="chatbot-demos-title" className="sr-only">
          Chat bot demos
        </h2>
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12">
          <Reveal variant="scale">
            <DemoIntro
              icon={<MessageCircle size={18} aria-hidden="true" />}
              label="WhatsApp Chat Bot"
              title="Meera · CareWell Clinic"
              text="Books appointments, shares clinic timings and sends lab reports on WhatsApp, using reply buttons."
            />
            <WhatsAppDemo />
          </Reveal>

          <Reveal variant="scale" delay={0.1}>
            <DemoIntro
              icon={<Globe size={18} aria-hidden="true" />}
              label="Website Chat Bot"
              title="Leo · UrbanNest Realty"
              text="A custom chat widget for your site that qualifies buyers, shows listings and books site visits."
            />
            <WebsiteBotDemo />
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
