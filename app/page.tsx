import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Wallet, BarChart3, Coins } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen container mx-auto">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Coins className="h-6 w-6 text-primary" />
            <span>AITokenize</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:underline"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:underline"
            >
              How It Works
            </Link>
            <Link
              href="#tokenomics"
              className="text-sm font-medium hover:underline"
            >
              Tokenomics
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Monetize Your AI Models with Web3 Payments
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Enable token-based payments for your AI inference services.
                    Create custom tokens, implement pay-per-prompt, and grow
                    with your user base.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-1.5">
                      Launch Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden border bg-gradient-to-br from-primary/20 to-primary/5 p-1">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Coins className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold">
                        AI Token Economy
                      </h3>
                      <p className="text-sm text-gray-500">
                        Powering the future of AI monetization
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to monetize your AI models effectively
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Custom Token Creation</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Each AI model gets its own token with a dedicated liquidity
                  pool
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Pay-per-Prompt</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Users pay in tokens based on prompt length and complexity
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Wallet Integration</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Seamless connection to Aptos wallets for token transactions
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Tokenomics</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Model demand increases token value, benefiting creators and
                  early adopters
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Inference Metering</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Accurate calculation of computational resources used per
                  request
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Analytics Dashboard</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Track usage, revenue, and token performance in real-time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  A simple process to start monetizing your AI models
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 mt-12">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 relative">
                  <div className="absolute -top-4 -left-4 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Connect Your Model</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Register your AI model and set up API endpoints
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 relative">
                  <div className="absolute -top-4 -left-4 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Create Your Token</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Launch your custom token with initial parameters
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 relative">
                  <div className="absolute -top-4 -left-4 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Start Earning</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Users pay with tokens for each inference request
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tokenomics Section */}
        <section id="tokenomics" className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Tokenomics
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  How our token economy creates value for everyone
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 mt-12">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex flex-col space-y-4 rounded-lg border p-6">
                  <h3 className="text-xl font-bold">For Model Creators</h3>
                  <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      Earn tokens for each inference request
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      Benefit from token appreciation as model usage grows
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      Set custom pricing based on computational costs
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      Receive real-time payments without intermediaries
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col space-y-4 rounded-lg border p-6">
                  <h3 className="text-xl font-bold">For Token Holders</h3>
                  <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      Early adopters benefit from token value growth
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      Discounted access to AI model services
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      Participate in governance decisions
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                      Trade tokens on decentralized exchanges
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Monetize Your AI Model?
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join the platform and start earning tokens for your AI
                  inference services
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-1.5">
                    Get Started Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            © 2025 AITokenize. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
