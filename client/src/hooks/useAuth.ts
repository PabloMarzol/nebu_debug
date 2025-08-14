import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    queryFn: async () => {
      console.log('[Auth] Checking authentication status...');
      const response = await fetch("/api/auth/user", {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      console.log('[Auth] Response status:', response.status);
      
      if (response.status === 401) {
        console.log('[Auth] User not authenticated');
        return null;
      }
      
      if (!response.ok) {
        console.error('[Auth] Failed to fetch user:', response.statusText);
        throw new Error("Failed to fetch user");
      }
      
      const userData = await response.json();
      console.log('[Auth] User authenticated:', userData.email);
      return userData;
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}