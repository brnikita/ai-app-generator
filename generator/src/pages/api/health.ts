import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    name: string;
    status: 'ok' | 'error';
    latency?: number;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  try {
    // Check core services
    const services = await checkServices();

    // Determine overall status
    const hasErrors = services.some(service => service.status === 'error');

    const response: HealthResponse = {
      status: hasErrors ? 'error' : 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
    };

    res.status(hasErrors ? 503 : 200).json(response);
  } catch (error) {
    const response: HealthResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: [
        {
          name: 'api',
          status: 'error',
        },
      ],
    };

    res.status(500).json(response);
  }
}

async function checkServices(): Promise<HealthResponse['services']> {
  const services: HealthResponse['services'] = [];
  const startTime = Date.now();

  // Check API
  services.push({
    name: 'api',
    status: 'ok' as const,
    latency: Date.now() - startTime,
  });

  // Add more service checks as needed
  // Example:
  // - Database connection
  // - Redis connection
  // - External API dependencies

  return services;
} 