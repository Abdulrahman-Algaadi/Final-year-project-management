import { cn } from "@/lib/utils";

const LOGO_SRC = "/Aden_University_Logo.svg";

const SIZES = {
  sm: "size-9",
  md: "size-14",
  lg: "size-20",
} as const;

interface AppLogoProps {
  size?: keyof typeof SIZES;
  className?: string;
}

export function AppLogo({ size = "sm", className }: AppLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="Aden University"
      className={cn("shrink-0 object-contain", SIZES[size], className)}
    />
  );
}
