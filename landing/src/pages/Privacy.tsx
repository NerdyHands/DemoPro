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

const Privacy = () => (
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
          Privacy Policy
        </h1>
        <p style={bodyStyle}>Last updated: August 18, 2026</p>
        <p style={bodyStyle}>
          Mr Demo Pro respects your privacy. This policy explains what we
          collect when you use mrdemopro.com, request a quote, or call us, and
          how we use that information. Related legal terms are on our{' '}
          <Link to="/terms/">Terms and Conditions</Link> page.
        </p>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Information we collect</h2>
          <p style={bodyStyle}>
            Quote and contact forms may collect your name, phone number, email
            address, jobsite address, service type, and project details you
            choose to share. Calls to 757-848-4559 may also include the same
            kinds of information so we can schedule work and prepare estimates.
          </p>
          <p style={bodyStyle}>
            The site uses cookies and similar technologies for analytics and
            advertising measurement (including Google Tag Manager and related
            tags) so we can understand which pages help customers find
            demolition, cleanout, and junk removal services in Hampton Roads.
            Google reCAPTCHA may run on forms to reduce spam.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>How we use information</h2>
          <p style={bodyStyle}>
            We use contact details to respond to quote requests, schedule jobs,
            follow up on projects, and improve our website. We do not sell your
            personal information. We may share information with service
            providers who host the site, process form submissions, or provide
            analytics — only as needed to operate the business.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Retention and security</h2>
          <p style={bodyStyle}>
            We keep quote and job records as long as needed for the project,
            bookkeeping, and legal obligations, then delete or archive them
            according to our internal practices. No method of transmission over
            the internet is completely secure; we take reasonable steps to
            protect form submissions and business records.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Your choices</h2>
          <p style={bodyStyle}>
            You can request access to or correction of the contact information
            we have for a quote by calling 757-848-4559 or using our{' '}
            <Link to="/contact/">contact page</Link>. You can also control
            analytics cookies through your browser settings. Do not submit
            sensitive medical or financial information through the public quote
            form.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Children</h2>
          <p style={bodyStyle}>
            This website is intended for adults seeking demolition and property
            cleanout services. We do not knowingly collect personal information
            from children.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Updates</h2>
          <p style={bodyStyle}>
            We may update this policy when our practices or tools change. The
            date at the top of this page will reflect the latest revision.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Contact</h2>
          <p style={bodyStyle}>
            Mr Demo Pro — Hampton Roads, VA. Phone:{' '}
            <a href="tel:757-848-4559">757-848-4559</a>. Privacy questions can
            be sent through our <Link to="/contact/">contact page</Link>.
          </p>
        </div>
      </Container>
    </section>
  </main>
);

export default Privacy;
