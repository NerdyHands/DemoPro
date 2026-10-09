import type {ReactNode} from 'react';
import {motion} from 'framer-motion';

export interface AudienceContent {
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

const fadeUp = {
  initial: {opacity: 0, y: 30},
  whileInView: {opacity: 1, y: 0},
  viewport: {once: true},
  transition: {duration: 0.5}
};

export const AudienceProblem = ({
  problemTitle,
  problemText
}: Pick<AudienceContent, 'problemTitle' | 'problemText'>) => (
  <section className="aud-problem">
    <div className="aud-container">
      <motion.div className="aud-narrow" {...fadeUp}>
        <h2 className="aud-h2">{problemTitle}</h2>
        <p className="aud-lead" style={{marginBottom: 0}}>
          {problemText}
        </p>
      </motion.div>
    </div>
  </section>
);

export const AudienceSupport = ({
  supportTitle,
  supportIntro,
  supportItems,
  supportNote,
  children
}: Pick<
  AudienceContent,
  'supportTitle' | 'supportIntro' | 'supportItems' | 'supportNote'
> & {children?: ReactNode}) => (
  <section className="aud-support">
    <div className="aud-container">
      <h2 className="aud-h2">{supportTitle}</h2>
      <p className="aud-lead aud-support-intro">{supportIntro}</p>
      <ul className="aud-checklist">
        {supportItems.map(item => (
          <li key={item}>
            <span aria-hidden="true">✔ </span>
            {item}
          </li>
        ))}
      </ul>
      {supportNote && (
        <p className="aud-lead" style={{marginBottom: 0}}>
          {supportNote}
        </p>
      )}
      {children}
    </div>
  </section>
);

export const AudienceOutcomes = ({
  outcomes
}: Pick<AudienceContent, 'outcomes'>) =>
  outcomes && outcomes.length > 0 ? (
    <section className="aud-outcomes">
      <div className="aud-container">
        <div className="aud-outcomes-grid">
          {outcomes.map(outcome => (
            <motion.div key={outcome.title} className="aud-outcome" {...fadeUp}>
              <h3>{outcome.title}</h3>
              <p>{outcome.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  ) : null;
