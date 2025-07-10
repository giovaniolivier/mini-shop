import useFetch from './useFetch';
import { getAnalytics } from '../services/api';

export default function useFetchAnalytics() {
  const { data: analytics, loading, error, refetch } = useFetch(getAnalytics, []);
  return { analytics, loading, error, refresh: refetch };
} 