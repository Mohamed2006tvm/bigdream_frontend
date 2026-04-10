import { useEffect, useRef } from 'react';
import api from '../services/api';
import { useLoading } from '../context/LoadingContext';

// Hook to ping backend /health on app startup
const useWakeUpPing = () => {
  const { startLoading, stopLoading } = useLoading();
  const isMounted = useRef(true);

  useEffect(() => {
    let intervalId;
    const maxAttempts = 10; // up to ~30 seconds (3s interval)
    let attempts = 0;

    const ping = async () => {
      attempts += 1;
      try {
        await api.get('/health'); // will respect timeout set in api
        // success
        if (isMounted.current) stopLoading();
        clearInterval(intervalId);
      } catch (err) {
        // if timeout or network error, keep trying
        if (attempts >= maxAttempts) {
          // give up after max attempts
          if (isMounted.current) stopLoading();
          clearInterval(intervalId);
        }
        // otherwise continue
      }
    };

    // Show overlay immediately
    startLoading('Waking server... This may take up to 30 seconds on first load.');
    // Initial ping
    ping();
    // Set interval for retries
    intervalId = setInterval(ping, 3000);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
      stopLoading();
    };
  }, [startLoading, stopLoading]);
};

export default useWakeUpPing;

