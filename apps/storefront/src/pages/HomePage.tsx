import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Hero } from '../components/Hero';
import { ProductCollection } from '../components/ProductCollection';
import { Picture, SectionHeading } from '../components/ui';
import { CollectionSkeleton, LoadError } from '../components/States';
import { Link } from '../lib/router';
import { editorialSources } from '../lib/media';
import { usePageMeta } from '../lib/meta';
import { useProducts } from '../lib/products';

const OCCASIONS = [
  {
    key: 'housewarming',
    title: 'Housewarming',
    text: 'Something lasting for a new home and the people who make it.',
    image: 'occasion-housewarming',
    alt: 'A festive console with brass lamps, marigolds and a mosaic vase'
  },
  {
    key: 'celebrations',
    title: 'Festive celebrations',
    text: 'Pieces that belong to the lamps, flowers and gatherings of the season.',
    image: 'occasion-celebrations',
    alt: 'A brass bowl filled with marigolds and a lotus tealight'
  },
  {
    key: 'gifting',
    title: 'Thoughtful gifting',
    text: 'Tell us who it is for — we will help you choose and present it well.',
    image: 'occasion-gifting',
    alt: 'A kraft-wrapped gift tied with sheer ribbon and cream roses'
  }
];

const STEPS = [
  { title: 'Choose your pieces', text: 'Browse the collection and add what you like to your bag. Quantities can be changed at any time.' },
  { title: 'Send your request', text: 'Share your contact and delivery details in one short form. No payment is taken online.' },
  { title: 'We confirm the details', text: 'Our team contacts you to confirm availability, final pricing, shipping and delivery.' }
];

export const HomePage: React.FC = () => {
  usePageMeta(null);
  const { products, status, retry } = useProducts();
  const showcase = products.slice(0, 8);

  return (
    <>
      <Hero />

      {/* The collection — layout adapts to the real number of pieces */}
      <section aria-labelledby="collection-title" className="container-content py-16 md:py-24">
        <SectionHeading
          id="collection-title"
          eyebrow="The collection"
          title={showcase.length === 1 ? 'Featured piece' : 'Pieces to request'}
          intro={
            status === 'ready' && showcase.length === 0
              ? 'New pieces appear here as soon as they are photographed.'
              : 'Real photographs of the pieces you can ask us about. Prices are confirmed personally.'
          }
          action={
            products.length > showcase.length || (status === 'ready' && products.length > 1) ? (
              <Link to="/shop" className="text-link">
                View all {products.length > 0 ? `(${products.length})` : ''} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : undefined
          }
        />
        <div className="mt-10 md:mt-14">
          {status === 'loading' && <CollectionSkeleton count={4} />}
          {status === 'error' && <LoadError onRetry={retry} />}
          {status === 'ready' && showcase.length > 0 && <ProductCollection products={showcase} />}
          {status === 'ready' && showcase.length === 0 && (
            <div className="grid items-center gap-6 border-y border-stone-deep py-10 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-display text-2xl">Our first pieces are being photographed.</p>
                <p className="mt-2 max-w-xl text-ink-soft">
                  Until they are listed here, tell us what you are looking for and our team will reply personally.
                </p>
              </div>
              <Link to="/contact" className="btn-primary">
                Ask about a piece
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Gifting occasions — editorial imagery, linked to an enquiry rather than empty categories */}
      <section aria-labelledby="occasions-title" className="bg-stone py-16 md:py-24">
        <div className="container-content">
          <SectionHeading
            id="occasions-title"
            eyebrow="Gifting occasions"
            title="For the moments that matter"
            intro="Tell us the occasion and we will suggest pieces that suit it."
          />
          <ul className="mt-10 grid gap-x-6 gap-y-12 md:mt-14 md:grid-cols-3">
            {OCCASIONS.map(o => (
              <li key={o.key}>
                <Link to={`/contact?occasion=${o.key}`} className="group block">
                  <div className="relative overflow-hidden">
                    <Picture
                      sources={editorialSources(o.image, [600, 900])}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      width={900}
                      height={1125}
                      alt={o.alt}
                      className="aspect-editorial w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="mt-5 text-[1.75rem] leading-tight transition-colors group-hover:text-burgundy">{o.title}</h3>
                  <p className="mt-1.5 text-ink-soft">{o.text}</p>
                  <span className="text-link mt-4">
                    Plan a gift <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-[0.8125rem] text-ink-soft">Photography shown for styling inspiration.</p>
        </div>
      </section>

      {/* Brand introduction */}
      <section aria-labelledby="story-title" className="container-content py-16 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6 lg:col-span-5">
            <Picture
              sources={editorialSources('brand-stone-arch', [600, 1000])}
              sizes="(min-width: 768px) 45vw, 100vw"
              width={1000}
              height={1250}
              alt="A calm room with a stone arch, warm plaster walls and a vase of dried grasses"
              className="aspect-editorial w-full object-cover"
            />
          </div>
          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
            <p className="eyebrow mb-4">Our story</p>
            <h2 id="story-title" className="text-display-sm md:text-display-lg">
              Décor to live with.
              <br />
              Gifts to remember.
            </h2>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
              SWAYARI brings together decorative pieces and gifting ideas for homes and special occasions. Every request is
              answered personally, so you can ask about a piece — its size, finish or presentation — before you decide.
            </p>
            <Link to="/about" className="btn-secondary mt-9">
              Read our story
            </Link>
          </div>
        </div>
      </section>

      {/* Personal assistance — the real ordering process */}
      <section aria-labelledby="assist-title" className="border-t border-stone-deep bg-ivory pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="container-content">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow mb-4">Personal assistance</p>
              <h2 id="assist-title" className="text-display-sm md:text-display-md">
                How ordering works
              </h2>
              <p className="mt-4 text-ink-soft">This is order assistance, not an online checkout.</p>
              <Link to="/ordering-policy" className="text-link mt-6">
                Read the details <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ol className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="border-t border-ink/80 pt-5">
                  <span className="font-display text-[2.5rem] leading-none text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-4 font-sans text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 text-ink-soft">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
};
