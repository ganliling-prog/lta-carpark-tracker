/**
 * Serverless API endpoint for Singapore LTA DataMall Car Park Availability
 * GET /api/carparkavailability
 *
 * Upstream: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * Required header: AccountKey: <YOUR_LTA_KEY>
 * Reads from process.env.LTA_DATAMALL_ACCOUNT_KEY (or incoming AccountKey header)
 */

const LTA_CARPARK_API = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export default async function handler(req: any, res?: any) {
  // Common CORS & JSON headers
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, AccountKey, accountkey',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.writeHead?.(204, headers) || res.status(204);
      return res.end?.();
    }
    return new Response(null, { status: 204, headers });
  }

  // Retrieve AccountKey from environment variable or request headers (no hardcoded keys)
  const envKey =
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY;

  const headerKey =
    req.headers?.['accountkey'] ||
    req.headers?.['AccountKey'] ||
    (typeof req.headers?.get === 'function' ? req.headers.get('AccountKey') || req.headers.get('accountkey') : undefined);

  const accountKey = (headerKey || envKey || '').trim();

  // Extract query parameters ($skip, all, etc.)
  let searchParams = '';
  if (req.query && typeof req.query === 'object') {
    const params = new URLSearchParams();
    if (req.query['$skip']) params.set('$skip', String(req.query['$skip']));
    if (req.query['skip']) params.set('$skip', String(req.query['skip']));
    searchParams = params.toString() ? `?${params.toString()}` : '';
  } else if (req.url && req.url.includes('?')) {
    const queryPart = req.url.split('?')[1];
    searchParams = queryPart ? `?${queryPart}` : '';
  }

  // If no AccountKey is configured yet, return a helpful pending state
  if (!accountKey) {
    const unconfiguredPayload = {
      status: 'pending_configuration',
      message:
        'LTA DataMall AccountKey is not yet set. Please set LTA_DATAMALL_ACCOUNT_KEY in your environment variables (.env) or pass an AccountKey header.',
      upstreamEndpoint: LTA_CARPARK_API,
      documentation: 'https://datamall.lta.gov.sg/',
      value: [],
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      Object.entries(headers).forEach(([k, v]) => res.setHeader?.(k, v));
      return res.status(200).json(unconfiguredPayload);
    }
    return new Response(JSON.stringify(unconfiguredPayload), { status: 200, headers });
  }

  try {
    const targetUrl = `${LTA_CARPARK_API}${searchParams}`;

    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'AccountKey': accountKey,
        'accept': 'application/json',
      },
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text().catch(() => '');
      const errorPayload = {
        error: 'Upstream LTA DataMall returned an error status',
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        details: errorText,
        timestamp: new Date().toISOString(),
      };

      if (res && typeof res.status === 'function') {
        Object.entries(headers).forEach(([k, v]) => res.setHeader?.(k, v));
        return res.status(upstreamResponse.status).json(errorPayload);
      }
      return new Response(JSON.stringify(errorPayload), {
        status: upstreamResponse.status,
        headers,
      });
    }

    const data = await upstreamResponse.json();

    // Cache control: LTA carpark availability updates approximately every 1-2 minutes
    headers['Cache-Control'] = 'public, s-maxage=30, stale-while-revalidate=60';

    if (res && typeof res.status === 'function') {
      Object.entries(headers).forEach(([k, v]) => res.setHeader?.(k, v));
      return res.status(200).json(data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    const failurePayload = {
      error: 'Failed to connect to LTA DataMall upstream service',
      message: error?.message || 'Network request failed',
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      Object.entries(headers).forEach(([k, v]) => res.setHeader?.(k, v));
      return res.status(502).json(failurePayload);
    }

    return new Response(JSON.stringify(failurePayload), {
      status: 502,
      headers,
    });
  }
}
