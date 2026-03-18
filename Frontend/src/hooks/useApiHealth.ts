import { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await checkHealth();
        setIsHealthy(true);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkApiHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isHealthy, isChecking };
}
