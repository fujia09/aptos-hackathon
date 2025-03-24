"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { Model } from "@/types/models" // adjust if needed
import { toast } from "sonner"
import { Coins, Plus, Settings, Loader2, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
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

type CreateFormValues = {
  modelName: string
  modelType: string
  modelDescription: string
  tokenName: string
  tokenSymbol: string
  iconURI?: string
  projectURI?: string
  pricePerToken: string
}
import {
    Account,
    Aptos,
    AptosConfig,
    Ed25519PrivateKey,
    Network,
    AccountAddress,
  } from "@aptos-labs/ts-sdk";

import { AptosClient } from "aptos";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


const aptosConfig = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(aptosConfig);

export default function Browse() {
    const [models, setModels] = useState<Model[]>([])
    const [loading, setLoading] = useState(true)
    const [mintAmount, setMintAmount] = useState<string>("");
    const [isMinting, setIsMinting] = useState<{ [key: string]: boolean }>({})
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const router = useRouter()

    const connectPetra = async () => {
        if (!window.aptos) {
          toast.error("Petra wallet not installed")
          return
        }
    
        try {
          const response = await window.aptos.connect()
          const account = await window.aptos.account()
          setWalletAddress(account.address)
          setIsWalletConnected(true)
          toast.success("Wallet connected")
        } catch (err: any) {
          console.error("Wallet connection error:", err)
          toast.error(err.message || "Failed to connect wallet")
        }
      }
    
      const disconnectPetra = async () => {
        try {
          if (!window.aptos) {
            throw new Error("Petra wallet not installed")
          }
          await window.aptos.disconnect()
          setWalletAddress(null)
          setIsWalletConnected(false)
          toast.success("Disconnected from wallet")
        } catch (err: any) {
          console.error("Disconnect error:", err)
          toast.error(err.message || "Failed to disconnect")
        }
      }

    useEffect(() => {
    fetchModels()
    }, [])

  // Fetch models for the user
  const fetchModels = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("models")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setModels(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMintToken = async (model: Model) => {
    try {
      if (!window.aptos) {
        throw new Error("Petra wallet not installed");
      }
  
      if (!isWalletConnected) {
        await connectPetra();
      }
  
      const account = await window.aptos.account();
      const walletAddress = account.address;

      const mint = mintAmount;
  
      const priceOctas = Math.floor(Number(model.apt_per_token) * 1e8 * Number(mint)); // APT -> Octas
      const modelOwnerAddress = model.model_wallet_public_address;
  
      const txPayload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [modelOwnerAddress, priceOctas],
      };

      const client = new AptosClient('https://mainnet.aptoslabs.com');
  
      // User pays APT via wallet
      const pendingTransaction = await (window as any).aptos.signAndSubmitTransaction(txPayload);
  
      const txn = await client.waitForTransactionWithResult(
        pendingTransaction.hash,
      );
    //   if (!txn.success) {
    //     throw new Error("Transaction failed");
    //   }
  
      console.log("Transaction successful:", txn);
      setIsMinting((prev) => ({ ...prev, [model.id]: true }));
  
      
  
      const response = await fetch("/api/move-agent/mint-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-secret": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({
          modelID: model.id,
          recipientAddress: account.address,
          amount: mintAmount,
        }),
      });
  
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to mint tokens");
      }
      setMintAmount("");
  
      toast.success(`Successfully minted 1 ${model.token_symbol} token!`);
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      toast.error(error.message || "Failed to mint tokens");
    } finally {
      setIsMinting((prev) => ({ ...prev, [model.id]: false }));
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
            {isWalletConnected ? (
                <Button variant="outline" onClick={disconnectPetra}>
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)} (Disconnect)
                </Button>
            ) : (
                <Button variant="outline" onClick={connectPetra}>
                Connect Petra
                </Button>
            )}
            <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
            </Button>
            </div>
        </div>
        </header>
      <main className="flex-1 container py-6">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to <span className="text-primary">AITokenize</span>
            </h1>
            <Coins className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Here you can browse all your available tokenized AI models and manage your tokens. Each model has its own
            unique token that can be used to purchase prompts and access the model's capabilities.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Browse Models</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View all your tokenized AI models and their associated tokens.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mint Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Mint new tokens for your models to use for prompting or trading.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Token Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View token addresses and manage your token inventory.</p>
              </CardContent>
            </Card>
          </div>
        </div>

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
                      <p className="text-sm text-muted-foreground">Token Symbol: {model.token_symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        APT/{model.token_symbol}: {model.apt_per_token}
                      </p>
                      <p className="text-sm text-muted-foreground">{model.token_symbol}/Prompt: 1</p>
                      <p className="text-sm text-muted-foreground pb-5">
                        Created: {new Date(model.created_at).toLocaleDateString()}
                      </p>
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full text-left font-normal">
                            <span className="truncate">Token Address</span>
                            <Copy className="h-4 w-4 ml-2" />
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <div className="mx-auto w-full max-w-sm">
                            <DrawerHeader>
                              <DrawerTitle>Token Address</DrawerTitle>
                              <DrawerDescription>The address for {model.token_symbol} token</DrawerDescription>
                            </DrawerHeader>
                            <div className="pt-4">
                              <div className="rounded-lg border bg-muted pt-4">
                                <p className="font-mono text-sm break-all">{model.token_address}</p>
                              </div>
                            </div>
                            <DrawerFooter>
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(model.token_address || "")
                                  toast.success("Token address copied to clipboard!")
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
                      <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className="w-full mt-4"
                                >
                                  Mint Tokens
                                  <Coins className="mr-2 h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Mint Tokens</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Enter the amount of tokens you want to mint.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="mint-amount">Amount to Mint</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        id="mint-amount"
                                        type="number"
                                        min="1"
                                        placeholder="Enter amount"
                                        className="flex-1"
                                        value={mintAmount}
                                        onChange={(e) => setMintAmount(e.target.value)}
                                      />
                                      <span className="text-sm text-muted-foreground">
                                        {model.token_symbol}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setMintAmount("")}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleMintToken(model)}
                                    disabled={!mintAmount || Number(mintAmount) < 1 || isMinting[model.id]}
                                  >
                                    {isMinting[model.id] ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Minting...
                                      </>
                                    ) : (
                                      "Mint Tokens"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

