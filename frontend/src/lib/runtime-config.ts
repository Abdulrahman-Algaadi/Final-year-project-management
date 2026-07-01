export type PublicRuntimeConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
};

let cached: PublicRuntimeConfig | null = null;
let inflight: Promise<PublicRuntimeConfig | null> | null = null;

function fromBuildTime(): PublicRuntimeConfig | null {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? process.env.SUPABASE_URL?.trim();
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? process.env.SUPABASE_ANON_KEY?.trim();
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() ?? process.env.API_URL?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    apiUrl: apiUrl || "http://localhost:3000/api/v1",
  };
}

export function getRuntimeConfig(): PublicRuntimeConfig | null {
  return cached ?? fromBuildTime();
}

export async function loadRuntimeConfig(): Promise<PublicRuntimeConfig | null> {
  const builtIn = fromBuildTime();
  if (builtIn) {
    cached = builtIn;
    return cached;
  }

  if (cached) {
    return cached;
  }

  if (inflight) {
    return inflight;
  }

  inflight = fetch("/api/public-config", { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) {
        return null;
      }
      const data = (await res.json()) as PublicRuntimeConfig & { configured?: boolean };
      if (!data.supabaseUrl || !data.supabaseAnonKey) {
        return null;
      }
      cached = {
        supabaseUrl: data.supabaseUrl,
        supabaseAnonKey: data.supabaseAnonKey,
        apiUrl: data.apiUrl || "https://fypms-api.onrender.com/api/v1",
      };
      return cached;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function clearRuntimeConfigCache(): void {
  cached = null;
  inflight = null;
}
