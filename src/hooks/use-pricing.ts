import { useQuery } from '@tanstack/react-query';
import { paymentAPI, PricingResponse } from '@/lib/payment-api';

export function usePricing(countryOverride?: string) {
  // Check for dev query parameter for testing different countries
  const urlParams = new URLSearchParams(window.location.search);
  const devCountry = urlParams.get('dev_country');
  const countryToUse = countryOverride || devCountry;

  const {
    data: pricing,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<PricingResponse>({
    queryKey: ['pricing', countryToUse],
    queryFn: async () => {
      const response = await paymentAPI.getPricing(countryToUse || undefined);
      return response.data;
    },
    staleTime: 0, // Always refresh from server
    gcTime: 1000 * 60 * 5, // 5 minute cache in memory
    retry: 2,
  });

  return {
    pricing,
    isLoading,
    isError,
    error,
    refetch,
  };
}
