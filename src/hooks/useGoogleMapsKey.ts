export const useGoogleMapsKey = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_GOOGLE_MAPS_API_KEY is not configured");
  }

  return {
    data: apiKey,
    isLoading: false,
    error: null,
  };
};
