import {useEffect, useState} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';
import {trackPhoneClick, trackThankYou} from '../config/gtm';

type QuizPayload = {
  name?: string;
  quiz_score?: number;
  risk_level?: string;
};

const STORAGE_KEY = 'diy_vs_pro_quiz_result';

const DiyQuizThankYou = () => {
  const location = useLocation();
  const [payload, setPayload] = useState<QuizPayload | null>(
    () => (location.state as QuizPayload | null) ?? null
  );

  useEffect(() => {
    if (!payload) {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) setPayload(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, [payload]);

  useEffect(() => {
    trackThankYou({
      thank_you_variant: 'diy_quiz',
      lead_source: 'diy_risk_quiz',
      page_path: '/diy-vs-pro-demolition/thank-you/'
    });
  }, []);

  const risk = payload?.risk_level;
  const score = payload?.quiz_score;

  return (
    <div style={{paddingTop: '100px', minHeight: '80vh'}}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <motion.div
              initial={{opacity: 0, y: 50}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.6}}
              className="text-center p-5 shadow rounded"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)'
              }}
            >
              <motion.h1
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}
              >
                Thanks — we received your quiz results
              </motion.h1>
              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '24px'
                }}
              >
                We will follow up using the contact info you provided. Want a faster answer?
                Call us anytime.
              </p>
              {(risk !== undefined || score !== undefined) && (
                <p style={{marginBottom: '24px'}}>
                  {score !== undefined && (
                    <span style={{display: 'block', fontWeight: 600}}>
                      Risk score: {score}
                    </span>
                  )}
                  {risk && (
                    <span style={{display: 'block'}}>Assessment: {risk}</span>
                  )}
                </p>
              )}
              <a
                href="tel:757-848-4559"
                onClick={() =>
                  trackPhoneClick({
                    cta_location: 'diy_quiz_thank_you',
                    cta_label: 'Call (757) 848 4559'
                  })
                }
                style={{
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontSize: '1.35rem',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginBottom: '28px'
                }}
              >
                Call (757) 848 4559
              </a>
              <div>
                <Link to="/diy-vs-pro-demolition/">
                  <Button variant="outline-primary" className="me-2">
                    Back to tool
                  </Button>
                </Link>
                <Link to="/">
                  <Button style={{backgroundColor: 'var(--color-primary)', border: 'none'}}>
                    Home
                  </Button>
                </Link>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DiyQuizThankYou;
