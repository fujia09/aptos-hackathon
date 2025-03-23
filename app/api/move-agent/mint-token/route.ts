// app/api/move-agent/mint-token/route.ts
import {
    Account,
    Aptos,
    AptosConfig,
    Ed25519PrivateKey,
    Network,
    AccountAddress,
  } from "@aptos-labs/ts-sdk";
  import { AgentRuntime, LocalSigner } from "move-agent-kit";
  import { NextResponse } from "next/server";
  import { supabase } from "@/lib/supabase";



  // Initialize Aptos configuration DO NOT CHANGE TO TESTNET
  const aptosConfig = new AptosConfig({ network: Network.MAINNET });
  const aptos = new Aptos(aptosConfig);
  
  
  async function mintToken(
    agent: AgentRuntime,
    to: AccountAddress,
    tokenAddress: string,
    amount: number
  ): Promise<string> {
    try {
      const transaction = await agent.aptos.transaction.build.simple({
        sender: agent.account.getAddress(),
        options: {
            maxGasAmount: 90000,       // Try 60,000
            gasUnitPrice: 100,         // Optional, tweak if network is congested
          },
        data: {
          function: "0x67c8564aee3799e9ac669553fdef3a3828d4626f24786b6a5642152fa09469dd::launchpad::mint_to_address",
          functionArguments: [to.toString(), tokenAddress, amount],
        },
      });

  
      const committedTransactionHash = await agent.account.sendTransaction(transaction);
      const signedTransaction = await agent.aptos.waitForTransaction({
        transactionHash: committedTransactionHash,
      });
  
      if (!signedTransaction.success) {
        console.error(signedTransaction, "Token mint failed");
        throw new Error("Token mint failed");
      }
  
      return signedTransaction.hash;
    } catch (error: any) {
      console.error("Detailed mint error:", error);
      throw new Error(`Token mint failed: ${error.message}`);
    }
  }
  
  export async function POST(request: Request) {
    try {
        const appSecret = request.headers.get("x-app-secret");
        if (appSecret !== process.env.NEXT_PUBLIC_INTERNAL_API_SECRET) {
        return NextResponse.json(
            { error: "Unauthorized - Invalid secret" },
            { status: 401 }
        );
        }

        const body = await request.json();
        console.log("API received mint request body:", body);
        let { modelID, recipientAddress, amount } = body;

        // Validate inputs
        if (!modelID || !amount) {
            return NextResponse.json(
            { error: "Model ID and Mint Amount are needed" },
            { status: 400 }
            );
        }

        const {data: model, error} = await supabase
            .from("models")
            .select("*")
            .eq("id", modelID)
            .maybeSingle()
        
        if (error || !model) {
            return NextResponse.json(
                { error: `Model not found ${error?.message}` },
                { status: 404 }
            );
        }

        if (!recipientAddress) {
            recipientAddress = model.model_wallet_public_address
        }

        const tokenAddress = model.token_address
        
        console.log("Parsed mint values:", {
        tokenAddress,
        recipientAddress,
        amount
        });


    
  
      // Get private key from environment
      const privateKeyStr = model.model_wallet_private_address
      if (!privateKeyStr) {
        throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
      }
  
      // DO NOT CHANGE THIS ACCOUNT PRIVATE KEY LOGIC
      const privateKey = new Ed25519PrivateKey(privateKeyStr);
      const account = Account.fromPrivateKey({ privateKey });
      const signer = new LocalSigner(account, Network.MAINNET);
      const aptosAgent = new AgentRuntime(signer, aptos);
  
      console.log("Minting token with parameters:", {
        tokenAddress,
        recipientAddress,
        amount
      });
  
      const recipientAccountAddress = AccountAddress.fromString(recipientAddress);
      const mintHash = await mintToken(
        aptosAgent,
        recipientAccountAddress,
        tokenAddress,
        Number(amount) * 1e6
      );
  
      console.log("Token mint result:", { mintHash });
  
      return NextResponse.json({
        message: "Token minted successfully!",
        mintTransactionHash: mintHash,
        tokenAddress,
        recipientAddress,
        amount
      });
    } catch (error: any) {
      console.error("Token mint error:", error);
      return NextResponse.json(
        { error: error.message || "Token mint failed" },
        { status: 500 }
      );
    }
  }
  