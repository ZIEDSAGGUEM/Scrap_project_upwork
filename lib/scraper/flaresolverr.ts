/**
 * FlareSolverr Client
 * 
 * Communicates with FlareSolverr API to bypass Cloudflare protection
 * FlareSolverr must be running on FLARESOLVERR_URL (default: http://localhost:8191)
 */

const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'http://localhost:8191';

interface FlareSolverrRequest {
  cmd: 'request.get' | 'sessions.create' | 'sessions.destroy';
  url?: string;
  session?: string;
  maxTimeout?: number;
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
  }>;
}

interface FlareSolverrResponse {
  status: string;
  message: string;
  solution?: {
    url: string;
    status: number;
    response: string;
    cookies: any[];
    userAgent: string;
  };
  startTimestamp: number;
  endTimestamp: number;
}

/**
 * Solve Cloudflare challenge and get clean HTML
 * @param url - The URL to fetch (e.g., Upwork job search)
 * @param sessionId - Optional session ID to reuse browser session
 * @param maxTimeout - Maximum timeout in milliseconds (default: 60000)
 * @returns Clean HTML content
 */
export async function solveCloudflare(
  url: string,
  sessionId?: string,
  maxTimeout: number = 60000
): Promise<string> {
  console.log(`🔓 FlareSolverr: Solving Cloudflare for ${url}`);
  
  const payload: FlareSolverrRequest = {
    cmd: 'request.get',
    url,
    maxTimeout,
  };

  if (sessionId) {
    payload.session = sessionId;
  }

  try {
    const response = await fetch(`${FLARESOLVERR_URL}/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`FlareSolverr HTTP error: ${response.status} ${response.statusText}`);
    }

    const data: FlareSolverrResponse = await response.json();

    if (data.status !== 'ok') {
      throw new Error(`FlareSolverr failed: ${data.message}`);
    }

    if (!data.solution) {
      throw new Error('FlareSolverr returned no solution');
    }

    const duration = ((data.endTimestamp - data.startTimestamp) / 1000).toFixed(2);
    console.log(`✅ FlareSolverr: Success in ${duration}s (Status: ${data.solution.status})`);

    return data.solution.response;
  } catch (error) {
    console.error('❌ FlareSolverr error:', error);
    throw new Error(`Failed to solve Cloudflare: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new browser session in FlareSolverr
 * Sessions allow reusing the same browser instance for multiple requests (faster)
 * @param sessionId - Unique session identifier
 * @returns Session ID
 */
export async function createSession(sessionId: string): Promise<string> {
  console.log(`🆕 FlareSolverr: Creating session ${sessionId}`);

  const payload: FlareSolverrRequest = {
    cmd: 'sessions.create',
    session: sessionId,
  };

  try {
    const response = await fetch(`${FLARESOLVERR_URL}/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`FlareSolverr HTTP error: ${response.status} ${response.statusText}`);
    }

    const data: FlareSolverrResponse = await response.json();

    if (data.status !== 'ok') {
      throw new Error(`FlareSolverr failed: ${data.message}`);
    }

    console.log(`✅ FlareSolverr: Session ${sessionId} created`);
    return sessionId;
  } catch (error) {
    console.error('❌ FlareSolverr session creation error:', error);
    throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Destroy a browser session in FlareSolverr
 * @param sessionId - Session ID to destroy
 */
export async function destroySession(sessionId: string): Promise<void> {
  console.log(`🗑️ FlareSolverr: Destroying session ${sessionId}`);

  const payload: FlareSolverrRequest = {
    cmd: 'sessions.destroy',
    session: sessionId,
  };

  try {
    const response = await fetch(`${FLARESOLVERR_URL}/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`FlareSolverr HTTP error: ${response.status} ${response.statusText}`);
    }

    const data: FlareSolverrResponse = await response.json();

    if (data.status !== 'ok') {
      throw new Error(`FlareSolverr failed: ${data.message}`);
    }

    console.log(`✅ FlareSolverr: Session ${sessionId} destroyed`);
  } catch (error) {
    console.error('❌ FlareSolverr session destruction error:', error);
    // Don't throw - session cleanup is not critical
  }
}

/**
 * Check if FlareSolverr is running and accessible
 * @returns True if FlareSolverr is accessible
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${FLARESOLVERR_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('❌ FlareSolverr health check failed:', error);
    return false;
  }
}




