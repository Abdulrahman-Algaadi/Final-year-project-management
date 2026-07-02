import { apiClient } from "@/lib/api/client";
import { setCachedAccessToken } from "@/lib/api/auth-token";
import { mapAuthProfile } from "@/lib/api/mappers/auth.mapper";
import { createClientAsync } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import type { AuthProfileDto, LoginCallbackDto, StudentLoginResponseDto } from "@/types/api";

export async function loginCallback(accessToken: string): Promise<UserProfile> {
  const data = await apiClient<LoginCallbackDto>("/auth/callback", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
    token: accessToken,
    skipAuth: false,
  });
  return mapAuthProfile(data.profile);
}

export async function loginStudent(registrationNo: string, password: string): Promise<UserProfile> {
  const data = await apiClient<StudentLoginResponseDto>("/auth/login/student", {
    method: "POST",
    body: JSON.stringify({ registrationNo, password }),
    skipAuth: true,
  });

  const supabase = await createClientAsync();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.auth.setSession({
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
  });
  if (error) {
    throw new Error(error.message);
  }

  setCachedAccessToken(data.accessToken);
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
  const supabase = await createClientAsync();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw new Error(error.message);
  }
}

export async function logoutApi(): Promise<void> {
  await apiClient<{ message: string }>("/auth/logout", { method: "POST" });
}
