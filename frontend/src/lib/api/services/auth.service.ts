import { apiClient } from "@/lib/api/client";
import { mapAuthProfile } from "@/lib/api/mappers/auth.mapper";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import type { AuthProfileDto, LoginCallbackDto } from "@/types/api";

export async function loginCallback(accessToken: string): Promise<UserProfile> {
  const data = await apiClient<LoginCallbackDto>("/auth/callback", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
    token: accessToken,
    skipAuth: false,
  });
  return mapAuthProfile(data.profile);
}

export async function fetchProfile(token?: string): Promise<UserProfile> {
  const data = await apiClient<AuthProfileDto>("/auth/profile", { token });
  return mapAuthProfile(data);
}

export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): Promise<UserProfile> {
  const data = await apiClient<AuthProfileDto>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return mapAuthProfile(data);
}

export async function changePassword(newPassword: string): Promise<void> {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw new Error(error.message);
  }
}

export async function logoutApi(): Promise<void> {
  await apiClient<{ message: string }>("/auth/logout", { method: "POST" });
}
