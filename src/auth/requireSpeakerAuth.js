import { supabase } from '@/lib/supabaseClient';

export async function requireSpeakerAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  // Wait briefly for a new session (e.g., just redirected from callback)
  const waited = await new Promise((resolve) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (s) { subscription.unsubscribe(); resolve(true); }
    });
    setTimeout(() => { subscription.unsubscribe(); resolve(false); }, 2000);
  });

  if (waited) return (await supabase.auth.getSession()).data.session;

  // Not signed in – go to login
  window.location.replace('/#/speaker-login');
  return null;
}

