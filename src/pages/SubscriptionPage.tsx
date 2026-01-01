import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Star, Zap, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ReactNode;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic features",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: <Star className="h-6 w-6" />,
    features: [
      "3 trading signals",
      "1 indicator",
      "Paper trading only",
      "Basic backtest (7 days)",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For active traders",
    monthlyPrice: 29,
    yearlyPrice: 249,
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Unlimited trading signals",
      "All indicators",
      "Paper & live trading",
      "Full backtest history",
      "P&L alerts",
      "Trade history export",
      "Priority support",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For professional teams",
    monthlyPrice: 99,
    yearlyPrice: 899,
    icon: <Crown className="h-6 w-6" />,
    features: [
      "Everything in Pro",
      "Multi-account trading",
      "Custom indicators",
      "API access",
      "Advanced analytics",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);

    // Simulate subscription process
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Subscription Activated!",
        description: `You've successfully subscribed to the ${plans.find(p => p.id === planId)?.name} plan.`,
      });
      
      // Store subscription
      localStorage.setItem("subscription", JSON.stringify({
        planId,
        isYearly,
        startDate: new Date().toISOString(),
      }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Subscription Plans</h1>
              <p className="text-sm text-muted-foreground">
                Choose the plan that fits your trading needs
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Rocket className="h-3 w-3 mr-1" />
            Launch Special - 20% off yearly plans
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Unlock Your Trading Potential
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get access to advanced trading signals, real-time alerts, and professional
            tools to maximize your trading success.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Label className={cn(!isYearly && "text-foreground font-medium")}>Monthly</Label>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label className={cn(isYearly && "text-foreground font-medium")}>
              Yearly
              <span className="ml-2 text-xs text-primary">(Save 20%)</span>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative transition-all duration-300",
                plan.highlighted
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <div className={cn(
                  "w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4",
                  plan.highlighted ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                )}>
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{isYearly ? "year" : "month"}
                  </span>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${(plan.yearlyPrice / 12).toFixed(0)}/month billed yearly
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing && selectedPlan === plan.id}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    "Processing..."
                  ) : plan.monthlyPrice === 0 ? (
                    "Get Started Free"
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Frequently Asked Questions
          </h3>
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <Card className="p-4">
              <h4 className="font-medium text-foreground">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-medium text-foreground">Is there a free trial?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Our Free plan gives you access to basic features. Upgrade anytime to unlock premium features.
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="font-medium text-foreground">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                We accept all major credit cards, PayPal, and cryptocurrency payments.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
