import {useCallback, useEffect, useRef} from 'react';
import {
  type LeadType,
  trackFormAbandon,
  trackFormError,
  trackFormStart,
  trackFormSubmitAttempt,
  trackFormView,
  trackGenerateLead
} from '../config/gtm';
import {identifyPostHogLead} from '../config/posthog';

type LeadFormFunnelOptions = {
  formId: string;
  formType: LeadType;
  serviceName?: string;
};

type LeadContact = {
  name?: string;
  email?: string;
  phone?: string;
};

/**
 * Lead form funnel: form_view → form_start → form_submit_attempt → generate_lead,
 * with form_error on blocked/failed submits and form_abandon (last field, time on form) on exit.
 * Attach `formRef` to the <form> element.
 */
export function useLeadFormFunnel({formId, formType, serviceName}: LeadFormFunnelOptions) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const viewed = useRef(false);
  const startedAt = useRef<number | null>(null);
  const lastField = useRef<string | undefined>(undefined);
  const submitted = useRef(false);
  const abandonReported = useRef(false);

  const base = {form_id: formId, form_type: formType, service_name: serviceName};
  const baseRef = useRef(base);
  baseRef.current = base;

  const markFormStart = useCallback(() => {
    if (startedAt.current !== null) return;
    startedAt.current = Date.now();
    trackFormStart(baseRef.current);
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLInputElement | null;
      const field = target?.name || target?.getAttribute('aria-label') || undefined;
      if (field && field !== 'website') lastField.current = field;
      markFormStart();
    };
    form.addEventListener('focusin', onFocusIn);

    let observer: IntersectionObserver | undefined;
    if (!viewed.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        entries => {
          if (viewed.current || !entries.some(entry => entry.isIntersecting)) return;
          viewed.current = true;
          trackFormView(baseRef.current);
          observer?.disconnect();
        },
        {threshold: 0.5}
      );
      observer.observe(form);
    }

    return () => {
      form.removeEventListener('focusin', onFocusIn);
      observer?.disconnect();
    };
  }, [markFormStart]);

  useEffect(() => {
    const onAbandon = () => {
      if (startedAt.current === null || submitted.current || abandonReported.current) {
        return;
      }
      abandonReported.current = true;
      trackFormAbandon({
        ...baseRef.current,
        last_field: lastField.current,
        seconds_on_form: Math.round((Date.now() - startedAt.current) / 1000)
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') onAbandon();
    };
    window.addEventListener('pagehide', onAbandon);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onAbandon);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const markSubmitAttempt = useCallback(() => {
    markFormStart();
    trackFormSubmitAttempt(baseRef.current);
  }, [markFormStart]);

  const markValidationError = useCallback((errorField: string, errorMessage?: string) => {
    trackFormError({
      ...baseRef.current,
      error_type: 'validation',
      error_field: errorField,
      error_message: errorMessage
    });
  }, []);

  const markNetworkError = useCallback((error: unknown) => {
    trackFormError({
      ...baseRef.current,
      error_type: 'network',
      error_message: error instanceof Error ? error.message : String(error)
    });
  }, []);

  /**
   * Call after the lead is accepted, before navigating to /thank-you/.
   * `leadProps.service_name` overrides the default (e.g. service picked in the form).
   */
  const markSubmitted = useCallback(
    (contact: LeadContact, leadProps: Record<string, unknown> & {service_name?: string} = {}) => {
      submitted.current = true;
      const {form_id, form_type} = baseRef.current;
      const service_name = leadProps.service_name || baseRef.current.service_name;
      identifyPostHogLead({
        ...contact,
        lead_type: form_type,
        service_name,
        form_id
      });
      trackGenerateLead({
        ...leadProps,
        form_id,
        lead_type: form_type,
        service_name,
        method: 'form'
      });
    },
    []
  );

  return {
    formRef,
    markFormStart,
    markSubmitAttempt,
    markValidationError,
    markNetworkError,
    markSubmitted
  };
}
