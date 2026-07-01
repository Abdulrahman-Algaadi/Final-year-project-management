import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { LandingBrand, LandingContent, SignInButton } from "./landing-content";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="hero-gradient nav-elevated sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <LandingBrand />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button asChild className="bg-brand-accent text-dark hover:bg-brand-accent-light">
              <SignInButton />
            </Button>
          </div>
        </div>
      </header>
      <LandingContent />
    </div>
  );
}
