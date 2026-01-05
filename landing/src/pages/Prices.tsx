import React from 'react';
import SEOHead from '../components/SEO';
import {Container, Table} from 'react-bootstrap';
import {Link} from 'react-router-dom';

const Prices: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Prices - Cleanout, Demolition & Junk Removal in Hampton Roads | Mr Demo Pro"
        description="View transparent pricing for demolition, shed removal, deck removal, fence removal, interior demolition, junk removal and cleanout services in Hampton Roads, VA. No hidden fees. Free estimates available."
        canonicalUrl="https://mrdemopro.com/prices/"
      />

      <main role="main" aria-labelledby="pricing-heading">
        {/* Pricing Schema */}
        {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Demolition & Junk Removal Services',
            provider: {
              '@type': 'LocalBusiness',
              name: 'Mr Demo Pro',
              telephone: '+1-757-848-4559',
              areaServed: 'Hampton Roads, VA'
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              priceSpecification: {
                '@type': 'PriceSpecification',
                minPrice: 350,
                maxPrice: 2000
              }
            }
          })
        }}
      /> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'OfferCatalog',
              name: 'Mr Demo Pro Pricing',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Standard Cleanout (1BR)',
                    url: 'https://mrdemopro.com/services/cleanout/'
                  },
                  priceCurrency: 'USD',
                  lowPrice: '350',
                  highPrice: '550'
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: '2–3 Bedroom Cleanout',
                    url: 'https://mrdemopro.com/services/cleanout/'
                  },
                  priceCurrency: 'USD',
                  lowPrice: '600',
                  highPrice: '900'
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Shed Removal',
                    url: 'https://mrdemopro.com/services/shed-removal/'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Deck Removal',
                    url: 'https://mrdemopro.com/services/deck-removal/'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Fence Removal',
                    url: 'https://mrdemopro.com/services/fence-removal/'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Interior Demolition',
                    url: 'https://mrdemopro.com/services/interior-demo/'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Junk Removal',
                    url: 'https://mrdemopro.com/services/junk-removal/'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Cleanout Services',
                    url: 'https://mrdemopro.com/services/cleanout/'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Full House Cleanout (4BR+)',
                    url: 'https://mrdemopro.com/services/cleanout/'
                  },
                  priceCurrency: 'USD',
                  lowPrice: '950',
                  highPrice: '1500'
                }
              ],
              provider: {
                '@type': 'LocalBusiness',
                name: 'Mr Demo Pro',
                telephone: '+1-757-848-4559',
                areaServed: 'Hampton Roads, VA'
              }
            })
          }}
        />

        <section style={{padding: 'clamp(60px, 8vw, 90px) 0 60px'}}>
          <Container>
            {/* HEADER */}
            <header className="text-center mb-4">
              <h1
                id="pricing-heading"
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 'bold',
                  fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
                  lineHeight: 1.2
                }}
              >
                Demolition Services Pricing in Hampton Roads, VA
              </h1>

              <p
                style={{
                  marginTop: '16px',
                  color: 'var(--color-text-secondary)',
                  maxWidth: '820px',
                  marginInline: 'auto',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                }}
              >
                Transparent, upfront pricing for junk removal, cleanouts, and
                demolition services. Final cost depends on access, volume, and
                disposal weight — no hidden fees.
              </p>
            </header>

            {/* MOBILE SCROLL HINT */}
            <p
              className="text-center d-md-none"
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '10px'
              }}
            >
              👉 Swipe left/right to view full pricing table
            </p>

            {/* TABLE */}
            <div
              style={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>Base Price</th>
                    <th>High Price</th>
                    <th>Notes</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <strong>Base Services</strong>
                    </td>
                    <td>Standard Cleanout (1BR)</td>
                    <td>Remove debris, bag trash, basic sweep</td>
                    <td>Per Job</td>
                    <td>$350</td>
                    <td>$550</td>
                    <td>Up to ½ ton, easy access</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>2–3 Bedroom Cleanout</td>
                    <td>Furniture & debris removal</td>
                    <td>Per Job</td>
                    <td>$600</td>
                    <td>$900</td>
                    <td>Includes 1 ton disposal</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>Full House Cleanout (4BR+)</td>
                    <td>Home, garage & yard debris</td>
                    <td>Per Job</td>
                    <td>$950</td>
                    <td>$1,500</td>
                    <td>1.5–2 tons</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>Eviction / Emergency</td>
                    <td>Same-day or rapid response</td>
                    <td>Per Job</td>
                    <td>$1,200</td>
                    <td>$2,000</td>
                    <td>+$150 same-day</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>Commercial Cleanout</td>
                    <td>Offices & multi-units</td>
                    <td>Custom</td>
                    <td>-</td>
                    <td>-</td>
                    <td>Quoted per job</td>
                  </tr>

                  <tr>
                    <td>
                      <strong>Demolition & Removal</strong>
                    </td>
                    <td>
                      <Link to="/services/shed-removal/">Shed Removal</Link>
                    </td>
                    <td>Remove and haul away old sheds</td>
                    <td>Per Project</td>
                    <td>-</td>
                    <td>-</td>
                    <td>Price varies by size, materials, access, and disposal</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>
                      <Link to="/services/deck-removal/">Deck Removal</Link>
                    </td>
                    <td>Demolish deck and remove debris</td>
                    <td>Per Project</td>
                    <td>-</td>
                    <td>-</td>
                    <td>Quoted after reviewing size, height, and attachment</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>
                      <Link to="/services/fence-removal/">Fence Removal</Link>
                    </td>
                    <td>Remove fencing, posts, and haul away</td>
                    <td>Per Project</td>
                    <td>-</td>
                    <td>-</td>
                    <td>Depends on linear footage, material, and post type</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>
                      <Link to="/services/interior-demo/">Interior Demolition</Link>
                    </td>
                    <td>Remove non-structural interior materials</td>
                    <td>Per Project</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      Quoted based on scope, disposal, and protection required
                    </td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>
                      <Link to="/services/junk-removal/">Junk Removal</Link>
                    </td>
                    <td>Remove unwanted items and dispose responsibly</td>
                    <td>By Volume</td>
                    <td>-</td>
                    <td>-</td>
                    <td>Pricing depends on volume, weight, and access</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* CTA */}
            <footer className="text-center mt-4">
              <p
                style={{
                  color: 'gold',
                  fontSize: 'clamp(1rem, 3vw, 1.1rem)'
                }}
              >
                Need an exact quote? Call{' '}
                <a href="tel:757-848-4559" style={{fontWeight: 'bold'}}>
                  757-848-4559
                </a>{' '}
                for a free estimate.
              </p>
            </footer>
          </Container>
        </section>
      </main>
    </>
  );
};

export default Prices;
