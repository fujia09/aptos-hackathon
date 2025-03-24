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
import { Model } from "@/types/models"; // adjust if needed
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
} from "@/components/ui/drawer";

type CreateFormValues = {
  modelName: string;
  modelType: string;
  modelDescription: string;
  tokenName: string;
  tokenSymbol: string;
  iconURI?: string;
  projectURI?: string;
  pricePerToken: string;
};

export default function Dashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  // Step-based creation
  // step 1: generate wallet
  // step 2: show wallet info, ask user to fund
  const [step, setStep] = useState<1 | 2>(1);

  // We'll store the form data so we can re-use in step 2
  const [formValues, setFormValues] = useState<Partial<CreateFormValues>>({});
  const [modelWallet, setModelWallet] = useState<{
    address: string;
    privateKey: string;
  } | null>(null);

  // UI states
  const [isCreating, setIsCreating] = useState(false);
  const [isMinting, setIsMinting] = useState<{ [key: string]: boolean }>({});
  const [open, setOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchModels();
  }, []);

  // Fetch models for the user
  const fetchModels = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("models")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Generate wallet after form submission
  const handleGenerateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    if (!formRef.current) {
      console.error("Form ref is null");
      setIsCreating(false);
      return;
    }

    const formData = new FormData(formRef.current);
    const modelName = (formData.get("model-name") as string) || "";
    const modelType = (formData.get("model-type") as string) || "";
    const modelDescription = (formData.get("model-description") as string) || "";
    const tokenName = (formData.get("token-name") as string) || "";
    const tokenSymbol = (formData.get("token-symbol") as string) || "";
    const iconURI = (formData.get("token-icon-uri") as string) || "";
    const projectURI = (formData.get("token-project-uri") as string) || "";
    const pricePerToken = (formData.get("apt-token") as string) || "";

    if (!modelName || !modelType || !tokenName || !tokenSymbol) {
      toast.error("Please fill in all required fields");
      setIsCreating(false);
      return;
    }

    try {
      // Save form data in state for step 2
      setFormValues({
        modelName,
        modelType,
        modelDescription,
        tokenName,
        tokenSymbol,
        iconURI,
        projectURI,
        pricePerToken,
      });

      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1) Call init-wallet route
      const initRes = await fetch("/api/move-agent/init-wallet", {
        method: "POST",
      });
      if (!initRes.ok) {
        throw new Error("Failed to initialize wallet");
      }
      const walletData = await initRes.json();
      const { address, privateKey } = walletData?.modelWallet || {};
      if (!address || !privateKey) {
        throw new Error("No wallet data returned");
      }

      // 2) Store wallet in state
      setModelWallet({ address, privateKey });

      // 3) Move to step 2 (funding flow)
      setStep(2);
      console.log("Model wallet generated! Please send APT to continue.");
    } catch (error: any) {
      console.error("Error generating wallet:", error);
      toast.error(error.message || "Failed to create wallet");
    } finally {
      setIsCreating(false);
    }
  };

  // Step 2: Called after user funds the wallet (click "I've funded")
  const handleCreateToken = async () => {
    if (!modelWallet) {
      toast.error("No model wallet in state");
      return;
    }
    setIsCreating(true);

    try {
      // Make sure user is still logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Now call create-token route
      const createRes = await fetch("/api/move-agent/create-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-secret": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || ""
        },
        body: JSON.stringify({
          privateKey: modelWallet.privateKey,
          tokenName: formValues.tokenName,
          tokenSymbol: formValues.tokenSymbol,
          iconURI: formValues.iconURI || "",
          projectURI: formValues.projectURI || "",
        }),
      });

      const tokenResult = await createRes.json();
      if (!createRes.ok || !tokenResult?.tokenAddress) {
        throw new Error(tokenResult.error || "Token creation failed");
      }

      // Insert new model in Supabase with the token address
      const { error: modelInsertError } = await supabase.from("models").insert([
        {
          user_id: user.id,
          name: formValues.modelName,
          type: formValues.modelType,
          description: formValues.modelDescription,
          token_name: formValues.tokenName,
          token_symbol: formValues.tokenSymbol,
          token_address: tokenResult.tokenAddress,
          apt_per_token: Number(formValues.pricePerToken),
          model_wallet_public_address: modelWallet.address,
          model_wallet_private_address: modelWallet.privateKey,
        },
      ]);

      if (modelInsertError) {
        throw new Error(`Failed to save model: ${modelInsertError.message}`);
      }

      toast.success(
        `Token created at ${tokenResult.tokenAddress}. Model saved successfully!`
      );

      // Reset states, close dialog
      setModelWallet(null);
      setFormValues({});
      setStep(1);
      setOpen(false);
      await fetchModels();
    } catch (error: any) {
      console.error("Error creating token + model:", error);
      toast.error(error.message || "Failed to create token + model");
    } finally {
      setIsCreating(false);
    }
  };

  const handleMintToken = async (model: Model) => {
    try {
      setIsMinting((prev) => ({ ...prev, [model.id]: true }));

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // e.g. convert to smaller units
      const mintAmount = 1;

      const response = await fetch("/api/move-agent/mint-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-secret": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || ""
        },
        body: JSON.stringify({
          modelID: model.id,
          recipientAddresss: "", // Fill in if needed
          amount: mintAmount,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to mint tokens");
      }

      toast.success(
        `Successfully minted 1 ${model.token_symbol} tokens!`
      );
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      toast.error(error.message || "Failed to mint tokens");
    } finally {
      setIsMinting((prev) => ({ ...prev, [model.id]: false }));
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

            {/* Dialog for creating model */}
            <Dialog open={open} onOpenChange={(val) => {
              setOpen(val);
              // Reset if closed
              if (!val) {
                setStep(1);
                setModelWallet(null);
                setFormValues({});
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Model
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                {step === 1 && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Create New Model (Step 1/2)</DialogTitle>
                      <DialogDescription>
                        Generate a new wallet for your model
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      ref={formRef}
                      onSubmit={handleGenerateWallet}
                      className="space-y-4"
                    >
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
                          <Label htmlFor="model-description">
                            Model Description
                          </Label>
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
                          <Label htmlFor="token-icon-uri">
                            Token Icon URI (Optional)
                          </Label>
                          <Input
                            id="token-icon-uri"
                            name="token-icon-uri"
                            placeholder="https://example.com/icon.png"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="token-project-uri">
                            Project URI (Optional)
                          </Label>
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
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isCreating}>
                          {isCreating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Wallet...
                            </>
                          ) : (
                            "Generate Wallet"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </>
                )}

                {step === 2 && modelWallet && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Fund Model Wallet (Step 2/2)</DialogTitle>
                      <DialogDescription>
                        Please send at least 0.01 APT to the wallet below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Wallet Address</Label>
                        <p className="font-mono text-sm bg-muted p-2 rounded-md break-all">
                          {modelWallet.address}
                        </p>
                      </div>
                      <div>
                        <Label>Private Key</Label>
                        <p className="font-mono text-sm bg-muted p-2 rounded-md break-all">
                          {modelWallet.privateKey}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        After funding, click below to create the token.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateToken}
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Token...
                          </>
                        ) : (
                          "I've Funded It, Create Token"
                        )}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
                <CardTitle className="text-sm font-medium">Inference Requests</CardTitle>
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
                <CardTitle className="text-sm font-medium">Token Value</CardTitle>
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
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 since last month</p>
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
                      <Card
                        key={model.id}
                        className="hover:border-primary transition-colors"
                      >
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
                              {model.token_symbol}/Prompt: 1
                            </p>
                            <p className="text-sm text-muted-foreground pb-5">
                              Created:{" "}
                              {new Date(model.created_at).toLocaleDateString()}
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
                                      <p className="font-mono text-sm break-all">
                                        {model.token_address}
                                      </p>
                                    </div>
                                  </div>
                                  <DrawerFooter>
                                    <Button
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          model.token_address || ""
                                        );
                                        toast.success(
                                          "Token address copied to clipboard!"
                                        );
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
                                  Mint 1 {model.token_symbol}{" "}
                                  to Self
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
