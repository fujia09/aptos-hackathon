"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Model, ModelType } from "@/types/models";
import { toast } from "sonner";
import {
  BarChart3,
  Coins,
  Cpu,
  DollarSign,
  LineChart,
  Plus,
  Settings,
  Users,
  Loader2,
  LogOut,
  Copy,
} from "lucide-react";
import { WalletConnect } from "@/components/wallet-connect";
import { TokenStats } from "@/components/token-stats";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export default function Dashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isMinting, setIsMinting] = useState<{ [key: string]: boolean }>({});
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) {
  //       router.push("/login"); // redirect if not logged in
  //     } else {
  //       fetchModels(); // only fetch models if logged in
  //     }
  //   };
  
  //   checkAuth();
  // }, []);

  useEffect(() => {
    fetchModels();
  }, []);
  

  const fetchModels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    if (!formRef.current) {
      console.error("Form ref is null");
      return;
    }

    const formData = new FormData(formRef.current);
    const modelName = formData.get("model-name") as string;
    const modelType = formData.get("model-type") as string;
    const modelDescription = formData.get("model-description") as string;
    const tokenName = formData.get("token-name") as string;
    const tokenSymbol = formData.get("token-symbol") as string;
    const iconURI = formData.get("token-icon-uri") as string;
    const projectURI = formData.get("token-project-uri") as string;
    const tokensPerPrompt = formData.get("token-prompt") as string;
    const pricePerToken = formData.get("apt-token") as string;

    const tokenAmount = Number(tokensPerPrompt);
    const aptAmount = Number(pricePerToken);

    if (!modelName || !modelType || !tokenSymbol) {
      toast.error("Please fill in all required fields");
      setIsCreating(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the token first
      console.log("Sending token creation request with:", {
        tokenName,
        tokenSymbol,
        iconURI,
        projectURI,
      });

      const response = await fetch('/api/move-agent/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenName,
          tokenSymbol,
          iconURI,
          projectURI,
        }),
      });

      const tokenResult = await response.json();
      console.log("Token creation response:", tokenResult);

      if (!response.ok) {
        throw new Error(tokenResult.error || 'Failed to create token');
      }

      if (!tokenResult.tokenAddress) {
        throw new Error('No token address returned from API');
      }
    

      // Create the model in Supabase
      const { error: modelError } = await supabase
        .from("models")
        .insert([{ 
          name: modelName,
          type: modelType,
          description: modelDescription,
          user_id: user.id,
          token_name: tokenName,
          token_symbol: tokenSymbol,
          token_address: tokenResult.tokenAddress,
          tokens_per_prompt: tokenAmount,
          apt_per_token: aptAmount
        }]);

      if (modelError) {
        console.error("Model DB insertion error:", modelError);
        throw new Error(`Failed to save model: ${modelError.message}`);
      }

      toast.success("Model and token created successfully!");
      setOpen(false);
      await fetchModels();
    } catch (error: any) {
      console.error("Error creating model and token:", error);
      toast.error(error.message || "Failed to create model and token");
    } finally {
      setIsCreating(false);
    }
  };

  const handleMintToken = async (model: Model) => {
    try {
      setIsMinting(prev => ({ ...prev, [model.id]: true }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate mint amount based on model's tokens_per_prompt
      const mintAmount = Number(model.tokens_per_prompt) * 1000000; // Convert to smallest units

      const response = await fetch('/api/move-agent/mint-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress: model.token_address,
          recipientAddresss: "",
          amount: mintAmount
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to mint tokens');
      }

      toast.success(`Successfully minted ${model.tokens_per_prompt} ${model.token_symbol} tokens!`);
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      toast.error(error.message || "Failed to mint tokens");
    } finally {
      setIsMinting(prev => ({ ...prev, [model.id]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error(error.message || "Failed to log out");
    }
  };

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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Model
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Model</DialogTitle>
                  <DialogDescription>
                    Add a new model and create its associated token
                  </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleCreateModel} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="model-name">Model Name</Label>
                      <Input
                        id="model-name"
                        name="model-name"
                        placeholder="My Awesome Model"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="model-description">Model Description</Label>
                      <Input
                        id="model-description"
                        name="model-description"
                        placeholder="This agent executes DeFi tasks "
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="model-type">Model Type</Label>
                      <Select name="model-type" required defaultValue="text">
                        <SelectTrigger>
                          <SelectValue placeholder="Select model type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="token-name">Token Name</Label>
                      <Input
                        id="token-name"
                        name="token-name"
                        placeholder="AgentCoin"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="token-symbol">Token Symbol</Label>
                      <Input
                        id="token-symbol"
                        name="token-symbol"
                        placeholder="AGC"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="token-icon-uri">Token Icon URI (Optional)</Label>
                      <Input
                        id="token-icon-uri"
                        name="token-icon-uri"
                        placeholder="https://example.com/icon.png"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="token-project-uri">Project URI (Optional)</Label>
                      <Input
                        id="token-project-uri"
                        name="token-project-uri"
                        placeholder="https://example.com/project"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="apt-token">APT Price/Token</Label>
                      <Input
                        id="apt-token"
                        name="apt-token"
                        placeholder="0.0000005"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="token-prompt">Token Price/Prompt</Label>
                      <Input
                        id="token-prompt"
                        name="token-prompt"
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Model & Token...
                        </>
                      ) : (
                        "Create Model & Token"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
                {loading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    {models.map((model) => (
                      <Card key={model.id} className="hover:border-primary transition-colors">
                        <CardHeader>
                          <CardTitle>{model.name}</CardTitle>
                          <CardDescription>
                            Type: {model.type}
                            <br />
                            Description: {model.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Token Symbol: {model.token_symbol}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              APT/{model.token_symbol}: {model.apt_per_token}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {model.token_symbol}/Prompt: {model.tokens_per_prompt}
                            </p>
                            <p className="text-sm text-muted-foreground pb-5">
                              Created: {new Date(model.created_at).toLocaleDateString()}
                            </p>
                            <Drawer>
                              <DrawerTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-left font-normal"
                                >
                                  <span className="truncate">Token Address</span>
                                  <Copy className="h-4 w-4 ml-2" />
                                </Button>
                              </DrawerTrigger>
                              <DrawerContent>
                                <div className="mx-auto w-full max-w-sm">
                                  <DrawerHeader>
                                    <DrawerTitle>Token Address</DrawerTitle>
                                    <DrawerDescription>
                                      The address for {model.token_symbol} token
                                    </DrawerDescription>
                                  </DrawerHeader>
                                  <div className="pt-4">
                                    <div className="rounded-lg border bg-muted pt-4">
                                      <p className="font-mono text-sm break-all">{model.token_address}</p>
                                    </div>
                                  </div>
                                  <DrawerFooter>
                                    <Button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(model.token_address || "");
                                        toast.success("Token address copied to clipboard!");
                                      }}
                                    >
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Address
                                    </Button>
                                    <DrawerClose asChild>
                                      <Button variant="outline">Close</Button>
                                    </DrawerClose>
                                  </DrawerFooter>
                                </div>
                              </DrawerContent>
                            </Drawer>
                            <Button 
                              className="w-full mt-4"
                              onClick={() => handleMintToken(model)}
                              disabled={isMinting[model.id]}
                            >
                              {isMinting[model.id] ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Minting Tokens...
                                </>
                              ) : (
                                <>
                                  <Coins className="mr-2 h-4 w-4" />
                                  Mint {model.tokens_per_prompt} {model.token_symbol} to Self
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      className="h-[358.5px] border-dashed flex flex-col gap-2 items-center justify-center"
                      onClick={() => setOpen(true)}
                    >
                      <Plus className="h-8 w-8 text-muted-foreground" />
                      <span>Add New Model</span>
                    </Button>
                  </>
                )}
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
                  <CardContent className="h-[320px] flex items-center justify-center">
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
