import {Container, Row, Col} from 'react-bootstrap';
import {motion} from 'framer-motion';

interface AudienceHighlightsProps {
  problemTitle: string;
  problemText: string;
  supportTitle: string;
  supportIntro: string;
  supportItems: string[];
  supportNote?: string;
  outcomes?: Array<{
    title: string;
    description: string;
  }>;
}

const sectionTitleStyle = {
  color: 'var(--color-primary)',
  marginBottom: '24px',
  fontSize: 'var(--font-size-3xl)'
} as const;

const bodyTextStyle = {
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--font-size-lg)',
  lineHeight: 1.65
} as const;

const AudienceHighlights = ({
  problemTitle,
  problemText,
  supportTitle,
  supportIntro,
  supportItems,
  supportNote,
  outcomes
}: AudienceHighlightsProps) => (
  <>
    <section style={{padding: '80px 0'}}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} className="text-center">
            <motion.h2
              className="title-small fw-bold"
              initial={{opacity: 0}}
              whileInView={{opacity: 1}}
              transition={{duration: 0.6}}
              style={sectionTitleStyle}
            >
              {problemTitle}
            </motion.h2>
            <p style={bodyTextStyle}>{problemText}</p>
          </Col>
        </Row>
      </Container>
    </section>

    <section style={{padding: '80px 0', backgroundColor: 'var(--color-surface)'}}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <motion.h2
              className="title-small fw-bold text-center"
              initial={{opacity: 0}}
              whileInView={{opacity: 1}}
              transition={{duration: 0.6}}
              style={sectionTitleStyle}
            >
              {supportTitle}
            </motion.h2>
            <p style={{...bodyTextStyle, textAlign: 'center', marginBottom: '36px'}}>
              {supportIntro}
            </p>
            <Row>
              {supportItems.map(item => (
                <Col key={item} md={6} className="mb-3">
                  <div
                    style={{
                      padding: '16px 18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{color: 'var(--color-primary)', marginRight: '10px'}}
                    >
                      ✔
                    </span>
                    {item}
                  </div>
                </Col>
              ))}
            </Row>
            {supportNote && (
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: 0
                }}
              >
                {supportNote}
              </p>
            )}
          </Col>
        </Row>
      </Container>
    </section>

    {outcomes && outcomes.length > 0 && (
      <section style={{padding: '80px 0'}}>
        <Container>
          <Row className="justify-content-center">
            {outcomes.map((outcome, idx) => (
              <Col key={outcome.title} lg={5} md={6} className="mb-4">
                <motion.div
                  className="h-100 p-4"
                  initial={{opacity: 0, y: 30}}
                  whileInView={{opacity: 1, y: 0}}
                  transition={{delay: 0.2 + idx * 0.2, duration: 0.5}}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <h3 style={{color: 'var(--color-text-primary)', marginBottom: '15px'}}>
                    {outcome.title}
                  </h3>
                  <p style={{color: 'var(--color-text-secondary)', marginBottom: 0}}>
                    {outcome.description}
                  </p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    )}
  </>
);

export default AudienceHighlights;
