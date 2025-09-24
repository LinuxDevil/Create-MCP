export function generateHealthChecker(): string {
  return `/**
 * Health monitoring system for MCP server
 * Provides health checks and system monitoring
 */

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  timestamp?: string;
  duration?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: string;
  uptime: number;
}

export type HealthCheckFunction = () => Promise<Omit<HealthCheck, 'timestamp' | 'duration'>>;

export class HealthChecker {
  private checks: Map<string, HealthCheckFunction> = new Map();
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Register a health check function
   */
  registerCheck(name: string, checkFn: HealthCheckFunction): void {
    this.checks.set(name, checkFn);
  }

  /**
   * Remove a health check
   */
  unregisterCheck(name: string): void {
    this.checks.delete(name);
  }

  /**
   * Run all health checks and return status
   */
  async getStatus(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;
    const checks: HealthCheck[] = [];

    // Run all registered checks
    for (const [name, checkFn] of this.checks) {
      const startTime = Date.now();
      
      try {
        const result = await Promise.race([
          checkFn(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);

        checks.push({
          ...result,
          timestamp,
          duration: Date.now() - startTime
        });
      } catch (error) {
        checks.push({
          name,
          status: 'fail',
          message: error instanceof Error ? error.message : 'Health check failed',
          timestamp,
          duration: Date.now() - startTime
        });
      }
    }

    // Determine overall status
    const hasFailures = checks.some(check => check.status === 'fail');
    const hasWarnings = checks.some(check => check.status === 'warn');
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (hasFailures) {
      status = 'unhealthy';
    } else if (hasWarnings) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      checks,
      timestamp,
      uptime
    };
  }

  /**
   * Get a specific health check result
   */
  async getCheck(name: string): Promise<HealthCheck | null> {
    const checkFn = this.checks.get(name);
    if (!checkFn) {
      return null;
    }

    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      const result = await checkFn();
      return {
        ...result,
        timestamp,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name,
        status: 'fail',
        message: error instanceof Error ? error.message : 'Health check failed',
        timestamp,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Get list of registered health check names
   */
  getRegisteredChecks(): string[] {
    return Array.from(this.checks.keys());
  }
}
`;
}