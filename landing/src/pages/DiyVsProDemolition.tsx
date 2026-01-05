import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '../components/SEO';
import { trackFormSubmission } from '../config/gtm';
import { GOOGLE_APPS_SCRIPT_URL } from '../config/googleAppsScript';

type RiskLevel = 'Low' | 'Medium' | 'High';

type QuizOption = {
  id: string;
  label: string;
  score: number;
};

type QuizQuestion = {
  id: string;
  question: string;
  helpText?: string;
  options: QuizOption[];
};

const DIY_RISK_QUIZ: QuizQuestion[] = [
  {
    id: 'project_scope',
    question: 'What are you planning to demolish?',
    options: [
      { id: 'small_interior', label: 'Small interior (cabinets, vanity, non-structural drywall)', score: 1 },
      { id: 'flooring_tile', label: 'Flooring / tile / fixtures only (no walls)', score: 1 },
      { id: 'deck', label: 'Deck removal', score: 2 },
      { id: 'shed_small', label: 'Small shed / outbuilding (under 120 sq ft)', score: 2 },
      { id: 'room_gut', label: 'Full room gut (walls, ceilings, framing)', score: 3 },
      { id: 'garage_large', label: 'Garage / large outbuilding (120+ sq ft)', score: 4 },
      { id: 'structural', label: 'Anything structural / load-bearing / major renovation demo', score: 5 }
    ]
  },
  {
    id: 'structural_elements',
    question: 'Will you remove any load-bearing walls or structural elements?',
    helpText: 'If you’re not 100% sure, treat it as higher risk.',
    options: [
      { id: 'no', label: 'No', score: 0 },
      { id: 'unsure', label: "I'm not sure", score: 3 },
      { id: 'yes', label: 'Yes', score: 5 }
    ]
  },
  {
    id: 'utilities',
    question: 'Are any utilities involved (electric, plumbing, gas, HVAC)?',
    options: [
      { id: 'none', label: 'No utilities in the work area', score: 0 },
      { id: 'turned_off', label: 'Yes, but I can safely shut them off / cap them', score: 2 },
      { id: 'active_unsure', label: 'Yes, and I’m not sure how to disconnect safely', score: 4 }
    ]
  },
  {
    id: 'home_age',
    question: 'How old is the home/structure?',
    helpText: 'Older homes may contain asbestos or lead paint and require special handling.',
    options: [
      { id: '2000_plus', label: '2000 or newer', score: 0 },
      { id: '1990_1999', label: '1990–1999', score: 1 },
      { id: '1978_1989', label: '1978–1989', score: 3 },
      { id: 'pre_1978', label: 'Before 1978', score: 5 }
    ]
  },
  {
    id: 'permits',
    question: 'Does your project require permits/inspections?',
    options: [
      { id: 'no', label: 'No', score: 0 },
      { id: 'unsure', label: 'Not sure', score: 2 },
      { id: 'yes', label: 'Yes', score: 3 }
    ]
  },
  {
    id: 'experience',
    question: 'How confident are you with demolition safety and containment?',
    options: [
      { id: 'experienced', label: 'I’ve done similar projects safely before', score: 0 },
      { id: 'handy', label: 'I’m handy but not very experienced with demo', score: 2 },
      { id: 'first_time', label: 'First time / not confident', score: 4 }
    ]
  }
];

function getRiskLevel(score: number): RiskLevel {
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
}

function getRiskColor(risk: RiskLevel): string {
  if (risk === 'High') return '#dc3545';
  if (risk === 'Medium') return '#fd7e14';
  return '#198754';
}

const DiyVsProDemolition = () => {
  const navigate = useNavigate();
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setFormData({ name: '', email: '' });
    setShowQuizForm(true);
  };

  const closeQuiz = () => {
    setShowQuizForm(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setAnswer = (questionId: string, optionId: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const calculateResult = () => {
    const selected = DIY_RISK_QUIZ.map(q => {
      const selectedId = quizAnswers[q.id];
      const option = q.options.find(o => o.id === selectedId);
      return {
        id: q.id,
        question: q.question,
        answerId: selectedId ?? '',
        answer: option?.label ?? '',
        score: option?.score ?? 0
      };
    });

    const score = selected.reduce((sum, x) => sum + x.score, 0);
    const riskLevel = getRiskLevel(score);

    return { score, riskLevel, selected };
  };

  const handleQuizSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scriptURL = GOOGLE_APPS_SCRIPT_URL;
      const formDataEncoded = new URLSearchParams();
      const quizResult = calculateResult();
      formDataEncoded.append('name', formData.name);
      formDataEncoded.append('email', formData.email);
      formDataEncoded.append('service_type', 'DIY vs Pro Demo Risk Quiz');
      formDataEncoded.append('form_type', 'quiz_submission');
      formDataEncoded.append('quiz_score', String(quizResult.score));
      formDataEncoded.append('risk_level', quizResult.riskLevel);
      quizResult.selected.forEach(item => {
        // Keep keys stable and readable inside Google Sheets
        formDataEncoded.append(`quiz_${item.id}`, item.answer || item.answerId || 'N/A');
      });

      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formDataEncoded.toString()
      });

      trackFormSubmission('contact_form', {
        name: formData.name,
        email: formData.email,
        service_type: 'DIY vs Pro Demo Risk Quiz',
        form_type: 'quiz_submission',
        quiz_score: quizResult.score,
        risk_level: quizResult.riskLevel
      });

      const payload = {
        name: formData.name,
        email: formData.email,
        quiz_score: quizResult.score,
        risk_level: quizResult.riskLevel,
        selected: quizResult.selected,
        submittedAt: new Date().toISOString()
      };

      // Persist so refresh on thank-you page doesn't lose the result
      try {
        sessionStorage.setItem('diy_vs_pro_quiz_result', JSON.stringify(payload));
      } catch {
        // ignore storage failures
      }

      closeQuiz();
      navigate('/diy-vs-pro-demolition/thank-you', { state: payload });
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      alert('There was an error submitting your information. Please try again or call us at 757-848-4559.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CheckIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="var(--color-primary)"
        stroke="var(--color-primary)"
        strokeWidth="2"
      />
      <path
        d="M7 12.5L10.5 16L17 9"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const WarningIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <SEOHead
        title="DIY vs Professional Demolition: What You Need to Know | Mr Demo Pro"
        description="Thinking about DIY demolition? Learn when it's safe to DIY and when you need a pro. Take our free 60-second risk quiz and get personalized guidance for your demolition project. Licensed & insured Hampton Roads demolition."
        keywords="DIY demolition, professional demolition, demolition safety, demolition permits, demolition cost, DIY vs pro demolition, demolition risk, Hampton Roads demolition, demolition contractor"
        canonicalUrl="https://mrdemopro.com/diy-vs-pro-demolition/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Mr Demo Pro',
          description: 'Professional demolition services in Hampton Roads, VA',
          url: 'https://mrdemopro.com',
          telephone: '757-848-4559',
          address: {
            '@type': 'PostalAddress',
            addressRegion: 'VA',
            addressCountry: 'US'
          },
          areaServed: 'Hampton Roads, VA',
          serviceType: 'Demolition Services'
        }}
      />

      {/* Hero Section - No navigation, focused landing page */}
      <section
        style={{
          padding: '100px 0 80px 0',
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, #ffffff 100%)',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={8} md={10} className="mx-auto text-center">
              <motion.h1
                className="fw-bold"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  lineHeight: '1.2'
                }}
              >
                DIY vs Professional Demolition: What Could Go Wrong?
              </motion.h1>
              <motion.p
                className="lead"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  fontSize: 'var(--font-size-xl)',
                  lineHeight: '1.6',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '40px',
                  maxWidth: '800px',
                  margin: '0 auto 40px'
                }}
              >
                Before you grab that sledgehammer—discover the hidden risks most
                homeowners don't see coming. This isn't a sales pitch—it's the
                honest truth about when DIY demolition works and when it becomes
                dangerously expensive.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Button
                  size="lg"
                  className="customButton large"
                  onClick={openQuiz}
                  style={{
                    padding: '20px 50px',
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(236, 65, 0, 0.3)'
                  }}
                >
                  Take the Free DIY Risk Quiz (60 seconds)
                </Button>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quiz Form Modal - Shows when user clicks quiz button */}
      {showQuizForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closeQuiz}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {quizStep < DIY_RISK_QUIZ.length ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '18px'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Step {quizStep + 1} of {DIY_RISK_QUIZ.length + 1}
                  </div>
                  <Button variant="outline-secondary" size="sm" onClick={closeQuiz}>
                    Close
                  </Button>
                </div>

                <div
                  style={{
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--color-surface)',
                    overflow: 'hidden',
                    marginBottom: '24px'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round(((quizStep + 1) / (DIY_RISK_QUIZ.length + 1)) * 100)}%`,
                      backgroundColor: 'var(--color-primary)'
                    }}
                  />
                </div>

                <h2
                  style={{
                    color: 'var(--color-primary)',
                    marginBottom: '10px',
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  {DIY_RISK_QUIZ[quizStep].question}
                </h2>

                {DIY_RISK_QUIZ[quizStep].helpText && (
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      marginBottom: '18px',
                      fontSize: 'var(--font-size-base)'
                    }}
                  >
                    {DIY_RISK_QUIZ[quizStep].helpText}
                  </p>
                )}

                <div style={{ display: 'grid', gap: '12px', marginBottom: '22px' }}>
                  {DIY_RISK_QUIZ[quizStep].options.map(option => {
                    const selected = quizAnswers[DIY_RISK_QUIZ[quizStep].id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setAnswer(DIY_RISK_QUIZ[quizStep].id, option.id)}
                        style={{
                          textAlign: 'left',
                          padding: '14px 14px',
                          borderRadius: '12px',
                          border: selected
                            ? '2px solid var(--color-primary)'
                            : '2px solid var(--color-border)',
                          backgroundColor: selected ? 'rgba(236, 64, 0, 0.06)' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {option.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    disabled={quizStep === 0}
                    onClick={() => setQuizStep(s => Math.max(0, s - 1))}
                    style={{ padding: '12px 18px' }}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-primary"
                    disabled={!quizAnswers[DIY_RISK_QUIZ[quizStep].id]}
                    onClick={() => setQuizStep(s => Math.min(DIY_RISK_QUIZ.length, s + 1))}
                    style={{ flex: 1, padding: '12px 18px', fontWeight: 700 }}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '18px'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Step {DIY_RISK_QUIZ.length + 1} of {DIY_RISK_QUIZ.length + 1}
                  </div>
                  <Button variant="outline-secondary" size="sm" onClick={closeQuiz}>
                    Close
                  </Button>
                </div>

                <div
                  style={{
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--color-surface)',
                    overflow: 'hidden',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-primary)' }} />
                </div>

                {(() => {
                  const { score, riskLevel } = calculateResult();
                  return (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        marginBottom: '18px'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        Quick preview (based on your answers)
                      </div>
                      <div style={{ marginTop: '6px', color: 'var(--color-text-secondary)' }}>
                        Risk level:{' '}
                        <span style={{ fontWeight: 900, color: getRiskColor(riskLevel) }}>
                          {riskLevel}
                        </span>{' '}
                        <span style={{ opacity: 0.8 }}>(score {score})</span>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                        Enter your email to see your full results page and recommended next steps.
                      </div>
                    </div>
                  );
                })()}

                <h2
                  style={{
                    color: 'var(--color-primary)',
                    marginBottom: '10px',
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  Where should we send your results?
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '22px' }}>
                  We’ll save your results and send you helpful guidance. No spam.
                </p>

                <form onSubmit={handleQuizSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        padding: '15px',
                        fontSize: 'var(--font-size-base)',
                        borderRadius: '8px',
                        border: '2px solid var(--color-border)'
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Your Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      style={{
                        padding: '15px',
                        fontSize: 'var(--font-size-base)',
                        borderRadius: '8px',
                        border: '2px solid var(--color-border)'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      disabled={isSubmitting}
                      onClick={() => setQuizStep(DIY_RISK_QUIZ.length - 1)}
                      style={{ padding: '12px 18px' }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        padding: '12px 18px',
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 800
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'See My Results'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* When DIY Might Be Acceptable */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--color-surface)' }}>
        <Container>
          <Row>
            <Col lg={10} className="mx-auto">
              <motion.h2
                className="text-center fw-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                When DIY Demolition Might Be Acceptable
              </motion.h2>
              <motion.p
                className="text-center lead"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  color: 'var(--color-text-secondary)',
                  marginBottom: '50px',
                  fontSize: 'var(--font-size-lg)',
                  maxWidth: '700px',
                  margin: '0 auto 50px'
                }}
              >
                Not every demolition project requires a professional. Here are
                scenarios where DIY can work—if you're careful and well-prepared.
              </motion.p>
              <Row>
                {[
                  {
                    title: 'Small Non-Structural Interior Work',
                    description:
                      'Removing a small closet, non-load-bearing wall (confirmed by a structural engineer), or interior fixtures like cabinets and vanities can be manageable for experienced DIYers with proper tools and safety equipment.'
                  },
                  {
                    title: 'Exterior Structures Under 120 Square Feet',
                    description:
                      'Small sheds, playhouses, or similar structures may be DIY-friendly if they don\'t require permits in your area, aren\'t connected to utilities, and you have a plan for disposal.'
                  },
                  {
                    title: 'Simple Material Removal',
                    description:
                      'Removing old flooring, tile, or fixtures in preparation for renovation can be DIY-appropriate if no structural elements are involved and you follow proper safety protocols.'
                  }
                ].map((item, idx) => (
                  <Col md={4} key={idx} className="mb-4">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      style={{
                        padding: '30px',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        height: '100%',
                        boxShadow: 'var(--shadow-md)',
                        borderTop: '4px solid #28a745'
                      }}
                    >
                      <div style={{ marginBottom: '15px' }}>
                        <CheckIcon />
                      </div>
                      <h3
                        style={{
                          color: 'var(--color-text-primary)',
                          marginBottom: '15px',
                          fontSize: 'var(--font-size-xl)',
                          fontWeight: 'var(--font-weight-semibold)'
                        }}
                      >
                        {item.title}
                      </h3>
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                        {item.description}
                      </p>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* When Professional is Strongly Recommended */}
      <section style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
        <Container>
          <Row>
            <Col lg={10} className="mx-auto">
              <motion.h2
                className="text-center fw-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '30px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                When Professional Demolition is Strongly Recommended
              </motion.h2>
              <motion.p
                className="text-center lead"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  color: 'var(--color-text-secondary)',
                  marginBottom: '50px',
                  fontSize: 'var(--font-size-lg)',
                  maxWidth: '700px',
                  margin: '0 auto 50px'
                }}
              >
                These scenarios require professional expertise to protect your
                safety, your property, and your wallet.
              </motion.p>
              <Row>
                {[
                  {
                    title: 'Load-Bearing Walls or Structural Elements',
                    description:
                      'Any wall or element that supports your home\'s structure must be removed by professionals who understand structural engineering. Mistake here can mean catastrophic failure.'
                  },
                  {
                    title: 'Projects Requiring Permits',
                    description:
                      'If your local building department requires permits, professional contractors handle applications, inspections, and compliance—saving you time and avoiding costly violations.'
                  },
                  {
                    title: 'Homes Built Before 1990',
                    description:
                      'Older homes may contain asbestos, lead paint, or other hazardous materials requiring special handling and disposal. Professional demolition ensures safe removal and compliance with environmental regulations.'
                  },
                  {
                    title: 'Exterior Structures Over 120 Square Feet',
                    description:
                      'Larger sheds, decks, garages, and outbuildings typically require permits and involve utility connections. Professional demolition ensures proper disconnection and disposal.'
                  }
                
                ].map((item, idx) => (
                  <Col md={6} key={idx} className="mb-4">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: (idx % 2) * 0.1 }}
                      style={{
                        padding: '25px',
                        backgroundColor: '#fff5f5',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--color-primary)',
                        height: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ marginRight: '15px', marginTop: '2px' }}>
                          <WarningIcon />
                        </div>
                        <div>
                          <h4
                            style={{
                              color: 'var(--color-text-primary)',
                              marginBottom: '10px',
                              fontSize: 'var(--font-size-lg)',
                              fontWeight: 'var(--font-weight-semibold)'
                            }}
                          >
                            {item.title}
                          </h4>
                          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', margin: 0 }}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--color-surface)' }}>
        <Container>
          <Row>
            <Col lg={12} className="mx-auto">
              <motion.h2
                className="text-center fw-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: '50px',
                  fontSize: 'var(--font-size-4xl)'
                }}
              >
                DIY Demolition vs Professional Demolition
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  overflowX: 'auto'
                }}
              >
                <Table responsive bordered hover style={{ marginBottom: 0 }}>
                  <thead style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    <tr>
                      <th style={{ padding: '20px', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                        Factor
                      </th>
                      <th style={{ padding: '20px', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                        DIY Demolition
                      </th>
                      <th style={{ padding: '20px', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                        Professional Demolition
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        factor: 'Cost Risk',
                        diy: 'Hidden costs (permits, tools, disposal) can exceed $2,000+',
                        pro: 'Transparent upfront pricing, no surprises'
                      },
                      {
                        factor: 'Safety Risk',
                        diy: 'High risk of injury, structural damage, utility line hits',
                        pro: 'Licensed, insured professionals with safety protocols'
                      },
                      {
                        factor: 'Permits',
                        diy: 'You must research, apply, and ensure compliance yourself',
                        pro: 'Handled by contractor; they know local requirements'
                      },
                      {
                        factor: 'Tools & Equipment',
                        diy: 'Rental costs ($100-$500/day), need multiple tools',
                        pro: 'Professional-grade equipment included'
                      },
                      {
                        factor: 'Time',
                        diy: 'Weekends to weeks depending on project complexity',
                        pro: 'Typically 1-3 days for most residential projects'
                      },
                      {
                        factor: 'Cleanup',
                        diy: 'You handle disposal, hauling, landfill fees',
                        pro: 'Complete cleanup and disposal included'
                      }
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            padding: '20px',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--color-surface)'
                          }}
                        >
                          {row.factor}
                        </td>
                        <td
                          style={{
                            padding: '20px',
                            color: 'var(--color-text-secondary)',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--color-surface)'
                          }}
                        >
                          {row.diy}
                        </td>
                        <td
                          style={{
                            padding: '20px',
                            color: 'var(--color-text-secondary)',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--color-surface)'
                          }}
                        >
                          {row.pro}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>


      {/* Final CTA Section */}
      <section
        style={{
          padding: '100px 0',
          background:
            'linear-gradient(135deg, rgb(236 64 0 / 92%), rgb(236 64 0 / 97%))',
          color: 'white'
        }}
      >
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <motion.h2
                className="fw-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                  marginBottom: '30px',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: 'white'
                }}
              >
                Before You Swing the Hammer—Check Your Demo Risk
              </motion.h2>
              <motion.p
                className="lead"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  fontSize: 'var(--font-size-xl)',
                  marginBottom: '40px',
                  opacity: 0.95,
                  color: '#fff'
                }}
              >
                Get your free personalized risk assessment in under 60 seconds.
                Understand your project's real risks before you start.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                <Button
                  size="lg"
                  variant="light"
                  onClick={openQuiz}
                  style={{
                    padding: '20px 50px',
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Take the Free Risk Quiz
                </Button>
                <a
                  href="tel:757-848-4559"
                  style={{
                    textDecoration: 'none',
                    color: 'white'
                  }}
                >
                  <Button
                    size="lg"
                    variant="outline-light"
                    style={{
                      padding: '20px 50px',
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                      borderRadius: '12px',
                      borderColor: 'white',
                      color: 'white'
                    }}
                  >
                    Call 757-848-4559
                  </Button>
                </a>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default DiyVsProDemolition;
