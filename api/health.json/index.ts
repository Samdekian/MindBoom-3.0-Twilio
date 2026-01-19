import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health check endpoint for Vercel
 * Returns application health status
 * 
 * Accessible at: https://mind-boom-3-0-twilio.vercel.app/health.json
 */
export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      error: 'Method not allowed',
      status: 'unhealthy'
    });
    return;
  }

  // Return health status
  const healthStatus = {
    status: 'healthy',
    service: 'mindboom-3.0-twilio',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
    version: '3.0.0'
  };

  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Return 200 OK
  res.status(200).json(healthStatus);
}

