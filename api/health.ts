/**
 * Health check serverless endpoint
 * GET /api/health
 */
export default async function handler(req: any, res?: any) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, AccountKey',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.writeHead?.(204, headers) || res.status(204);
      return res.end?.();
    }
    return new Response(null, { status: 204, headers });
  }

  const accountKey =
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY;

  const payload = {
    status: 'healthy',
    service: 'ParkSG LTA Carpark Availability API',
    timestamp: new Date().toISOString(),
    ltaKeyConfigured: Boolean(accountKey && accountKey.trim().length > 0),
    endpoints: {
      carparkAvailability: '/api/carparkavailability',
      upstream: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    },
  };

  // Express / Node.js serverless response
  if (res && typeof res.status === 'function') {
    Object.entries(headers).forEach(([key, val]) => {
      res.setHeader?.(key, val);
    });
    return res.status(200).json(payload);
  }

  // Standard Web Fetch / Edge Response
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers,
  });
}
