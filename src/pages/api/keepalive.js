import { supabaseAdmin } from 'lib/supabase';

export default async function handler(req, res) {
  // Disallow caching to ensure the request always reaches the server
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const startedAt = Date.now();
  let errorMessage = null;

  try {
    if (!supabaseAdmin) {
      errorMessage = 'supabaseAdmin not initialised (missing SUPABASE_SERVICE_KEY?)';
    } else {
      // Minimal query to register activity on the project
      const { error } = await supabaseAdmin.from('settings').select('id').limit(1);
      if (error) errorMessage = error.message || String(error);
    }
  } catch (err) {
    errorMessage = err?.message || String(err);
  }

  const latencyMs = Date.now() - startedAt;

  if (errorMessage) {
    console.error('Keepalive failed:', errorMessage);
    // Non-2xx so cron-job.org / GitHub Actions mark the run as failed
    return res.status(503).json({ status: 'error', supabaseQueried: false, error: errorMessage, latencyMs });
  }

  return res.status(200).json({ status: 'ok', supabaseQueried: true, latencyMs });
}
