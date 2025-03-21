import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Coins,
  Cpu,
  DollarSign,
  LineChart,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { ModelCard } from "@/components/model-card";
import { TokenStats } from "@/components/token-stats";
import { WalletConnect } from "@/components/wallet-connect";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col container mx-auto">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Coins className="h-6 w-6 text-primary" />
            <span>AITokenize</span>
          </div>
          <div className="flex items-center gap-4">
            <WalletConnect />
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Model
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inference Requests
                </CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Token Value
                </CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.0042</div>
                <p className="text-xs text-muted-foreground">
                  +7% from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="models" className="space-y-4">
            <TabsList>
              <TabsTrigger value="models">AI Models</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="models" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ModelCard
                  name="Text Summarizer"
                  description="Summarizes long-form content into concise paragraphs"
                  requests={4521}
                  revenue={1245.32}
                  status="active"
                />
                <ModelCard
                  name="Image Generator"
                  description="Creates images from text descriptions"
                  requests={2134}
                  revenue={876.45}
                  status="active"
                />
                <ModelCard
                  name="Code Assistant"
                  description="Helps with coding tasks and debugging"
                  requests={1876}
                  revenue={543.21}
                  status="active"
                />
                <Button
                  variant="outline"
                  className="h-[220px] border-dashed flex flex-col gap-2 items-center justify-center"
                >
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <span>Add New Model</span>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="tokens" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <TokenStats
                  name="TXTS"
                  fullName="Text Summarizer Token"
                  price={0.0042}
                  change={7.2}
                  volume={12453}
                  liquidity={45678}
                />
                <TokenStats
                  name="IMGN"
                  fullName="Image Generator Token"
                  price={0.0078}
                  change={-2.3}
                  volume={8765}
                  liquidity={32456}
                />
                <TokenStats
                  name="CODE"
                  fullName="Code Assistant Token"
                  price={0.0035}
                  change={12.5}
                  volume={5432}
                  liquidity={21345}
                />
                <Button
                  variant="outline"
                  className="h-[220px] border-dashed flex flex-col gap-2 items-center justify-center"
                >
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <span>Create New Token</span>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>
                      Daily revenue from all models
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <LineChart className="h-16 w-16" />
                      <span>Revenue Chart</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Inference Requests</CardTitle>
                    <CardDescription>Requests by model</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-16 w-16" />
                      <span>Requests Chart</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Token Performance</CardTitle>
                    <CardDescription>
                      Price and volume over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <LineChart className="h-16 w-16" />
                      <span>Token Performance Chart</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
