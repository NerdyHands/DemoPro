import React from 'react';
import { Container, Table } from 'react-bootstrap';

const Prices: React.FC = () => {
  return (
    <main role="main" aria-labelledby="pricing-heading">
      {/* Pricing Schema */}
      <script
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
      />

      <section style={{ padding: 'clamp(60px, 8vw, 90px) 0 60px' }}>
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
                  <td><strong>Base Services</strong></td>
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
              </tbody>
            </Table>
          </div>

          {/* CTA */}
          <footer className="text-center mt-4">
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'clamp(1rem, 3vw, 1.1rem)'
              }}
            >
              Need an exact quote? Call{' '}
              <a
                href="tel:757-848-4559"
                style={{ fontWeight: 'bold' }}
              >
                757-848-4559
              </a>{' '}
              for a free estimate.
            </p>
          </footer>
        </Container>
      </section>
    </main>
  );
};

export default Prices;
