
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  referralCode?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('edgemarket_user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
        
        // Fallback to API call
        const response = await apiRequest("GET", "/api/auth/me");
        const data = await response.json();
        return data.user;
      } catch (error) {
        // Check localStorage as fallback
        const storedUser = localStorage.getItem('edgemarket_user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
        return null;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const login = (userData: User) => {
    localStorage.setItem('edgemarket_user', JSON.stringify(userData));
    queryClient.setQueryData(["auth", "user"], userData);
  };

  const logout = async () => {
    localStorage.removeItem('edgemarket_user');
    queryClient.setQueryData(["auth", "user"], null);
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Logout locally even if server call fails
      console.log("Server logout failed, but logged out locally");
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('edgemarket_user', JSON.stringify(updatedUser));
      queryClient.setQueryData(["auth", "user"], updatedUser);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register: registerMutation.mutateAsync,
    logout,
    updateUser,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}
