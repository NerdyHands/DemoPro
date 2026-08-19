import {Container} from 'react-bootstrap';
import {Link} from 'react-router-dom';

const sectionStyle = {marginBottom: '2rem'} as const;
const headingStyle = {
  color: 'var(--color-primary)',
  fontSize: 'var(--font-size-2xl)',
  fontWeight: 700,
  marginBottom: '0.75rem'
} as const;
const bodyStyle = {
  color: 'var(--color-text-secondary)',
  lineHeight: 1.7,
  marginBottom: '0.75rem'
} as const;

const Terms = () => (
  <main>
    <section style={{padding: '80px 0 60px 0'}}>
      <Container style={{maxWidth: 860}}>
        <h1
          style={{
            color: 'var(--color-primary)',
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 800,
            marginBottom: '1rem'
          }}
        >
          Terms and Conditions
        </h1>
        <p style={bodyStyle}>Last updated: August 18, 2026</p>
        <p style={bodyStyle}>
          These Terms and Conditions govern quotes, demolition work, cleanouts,
          and related services provided by Mr Demo Pro in Hampton Roads,
          Virginia. By requesting a quote, scheduling work, or using{' '}
          <Link to="/">mrdemopro.com</Link>, you agree to these terms. If you
          have questions, see our <Link to="/privacy/">Privacy Policy</Link> or{' '}
          <Link to="/contact/">contact us</Link>.
        </p>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Services and quotes</h2>
          <p style={bodyStyle}>
            Estimates are based on the information you provide and what we can
            reasonably observe at the property. Final pricing may change if
            scope, access, hidden materials, or disposal requirements differ
            from the original quote. We will discuss material changes before
            proceeding with extra work whenever practical.
          </p>
          <p style={bodyStyle}>
            A written quote describes the planned scope. Work not listed in that
            quote — including additional structures, unexpected debris, or
            hazardous materials — may require a revised price or a separate
            agreement.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Scheduling, access, and site conditions</h2>
          <p style={bodyStyle}>
            You are responsible for providing safe access to the work area,
            confirming ownership or authority to authorize demolition, and
            disclosing known hazards such as asbestos, underground tanks,
            utilities, or occupied units. We may pause or reschedule work if
            conditions are unsafe or if required permits or utility disconnects
            are incomplete.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Permits and utilities</h2>
          <p style={bodyStyle}>
            Many full or structural demolitions in Hampton Roads localities
            require permits and utility disconnect verification. Unless your
            quote says otherwise, permit fees charged by the city or county are
            separate from our labor and haul-off price. We can help coordinate
            typical permit steps as part of the project scope.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Payment</h2>
          <p style={bodyStyle}>
            Payment terms are stated on your quote or invoice. Deposits, if
            required, are due before work begins. Remaining balances are due on
            completion unless we agree otherwise in writing. Unpaid invoices may
            pause remaining work and may accrue collection costs permitted by
            Virginia law.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Debris, recycling, and leftover materials</h2>
          <p style={bodyStyle}>
            We haul off demolition debris included in the agreed scope. Items
            you want to keep must be removed or clearly marked before work
            starts. We are not responsible for personal property left in the
            work area after you have authorized demolition or cleanout.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Limitation of liability</h2>
          <p style={bodyStyle}>
            We perform work in a workmanlike manner consistent with industry
            practice for similar demolition and cleanout jobs. Except as required
            by law, Mr Demo Pro is not liable for indirect, incidental, or
            consequential damages, including lost rents or delay costs, beyond
            the amount paid for the specific service that gave rise to the
            claim.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Website use</h2>
          <p style={bodyStyle}>
            Website content is for general information about our services in
            Hampton Roads and is not a bid, permit approval, or engineering
            opinion. Pricing examples and cost guides are estimates only. See
            our <Link to="/demolition-cost-virginia/">demolition cost guide</Link>{' '}
            and <Link to="/services/">services</Link> for current offerings.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Contact</h2>
          <p style={bodyStyle}>
            Mr Demo Pro — Hampton Roads, VA. Phone:{' '}
            <a href="tel:757-848-4559">757-848-4559</a>. Email questions about
            these terms through our <Link to="/contact/">contact page</Link>.
          </p>
        </div>
      </Container>
    </section>
  </main>
);

export default Terms;
