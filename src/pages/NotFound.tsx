import { ArrowLeft } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <>
      <Seo
        path="/404"
        title="Page Not Found | Sanket Sathe"
        description="The page you are looking for could not be found."
        noindex
      />
      <section className="relative isolate flex min-h-[80svh] items-center pt-[72px]">
        <div aria-hidden="true" className="bg-grid mask-radial absolute inset-0 -z-10" />
        <Container className="text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent-soft">ERROR 404</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Page not found</h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-muted">
            The page you are looking for may have been moved or no longer exists.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink to="/" size="lg">
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Home
            </ButtonLink>
            <ButtonLink to="/#contact" size="lg" variant="secondary">
              Contact Me
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
