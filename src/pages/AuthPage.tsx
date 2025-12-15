import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Activity, Shield, Cpu } from "lucide-react";

const AuthPage = () => {
  const [view, setView] = useState<"login" | "forgot">("login");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-gradient">TradeSignals Pro</span>
            </div>

            <div className="space-y-4 max-w-md">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                Professional Trading
                <br />
                <span className="text-gradient">Indicator Signals</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Real-time buy/sell signals across multiple timeframes with advanced indicator analysis.
              </p>
            </div>

            <div className="grid gap-4 max-w-md">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">License Protected</h3>
                  <p className="text-sm text-muted-foreground">One device per license via MAC verification</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Multi-Indicator Analysis</h3>
                  <p className="text-sm text-muted-foreground">RSI, MACD, EMA, Bollinger & more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-gradient">TradeSignals Pro</span>
            </div>

            {view === "login" ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                  <p className="text-muted-foreground mt-2">Sign in to access your trading signals</p>
                </div>
                <LoginForm onForgotPassword={() => setView("forgot")} />
              </>
            ) : (
              <ForgotPasswordForm onBack={() => setView("login")} />
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
