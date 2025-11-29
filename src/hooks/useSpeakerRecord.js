import { useEffect, useState } from 'react';
import { requireSpeakerAuth } from '@/auth/requireSpeakerAuth';
import { findSpeakerByEmail } from '@/lib/airtableClient';

/**
 * Fetches the current speaker record based on the signed-in user's email.
 * Optionally accepts an email to avoid re-fetching the session.
 */
export function useSpeakerRecord(initialEmail) {
  const [speaker, setSpeaker] = useState(null);
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let emailAddr = initialEmail;
        if (!emailAddr) {
          const session = await requireSpeakerAuth();
          if (!session) {
            setLoading(false);
            return;
          }
          emailAddr = session.user?.email;
          setEmail(emailAddr || '');
        }
        if (!emailAddr) {
          setLoading(false);
          return;
        }
        const recs = await findSpeakerByEmail(emailAddr);
        if (!alive) return;
        const rec = recs[0];
        if (rec && rec.fields) {
          setSpeaker({
            ...rec.fields,
            id: rec.id,
            firstName: rec.fields['First Name'],
            lastName: rec.fields['Last Name'],
          });
        } else {
          setSpeaker(null);
        }
      } catch {
        setSpeaker(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialEmail]);

  return { speaker, loading, email };
}
