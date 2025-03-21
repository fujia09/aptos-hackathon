"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = (walletType: string) => {
    // In a real implementation, this would connect to the actual wallet
    setWalletAddress("0x1234...5678")
    setIsConnected(true)
  }

  const disconnectWallet = () => {
    setWalletAddress("")
    setIsConnected(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          {isConnected ? "Connected" : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isConnected ? "Wallet Connected" : "Connect Your Wallet"}</DialogTitle>
          <DialogDescription>
            {isConnected
              ? "Your wallet is connected to AITokenize"
              : "Connect your Aptos wallet to manage your tokens and transactions"}
          </DialogDescription>
        </DialogHeader>
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Wallet Address</div>
              <div className="font-mono text-sm">{walletAddress}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Balance</div>
                <div className="text-xl font-bold">$1,234.56</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tokens</div>
                <div className="text-xl font-bold">3</div>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={disconnectWallet}>
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            <Card
              className="p-4 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => connectWallet("petra")}
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Petra Wallet</div>
                  <div className="text-sm text-muted-foreground">Connect to Petra Wallet</div>
                </div>
              </div>
            </Card>
            <Card
              className="p-4 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => connectWallet("martian")}
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Martian Wallet</div>
                  <div className="text-sm text-muted-foreground">Connect to Martian Wallet</div>
                </div>
              </div>
            </Card>
            <Card
              className="p-4 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => connectWallet("pontem")}
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Pontem Wallet</div>
                  <div className="text-sm text-muted-foreground">Connect to Pontem Wallet</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

