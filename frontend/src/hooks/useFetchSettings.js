import { useCallback } from 'react';
import useFetch from './useFetch';
import { getSettings, updateSettings as updateSettingsApi } from '../services/api';

export default function useFetchSettings() {
  const { data: settings, loading, error, refetch } = useFetch(getSettings, []);

  const updateSettings = useCallback(async (data) => {
    await updateSettingsApi(data);
    refetch();
  }, [refetch]);

  return { settings, loading, error, refresh: refetch, updateSettings };
} 