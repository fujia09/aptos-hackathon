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
        const transaction = await aptos.transaction.build.simple({
            sender: agent.account.getAddress(),
            options: {
              maxGasAmount: 90000,  
              gasUnitPrice: 100       
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
    } catch (error: unknown) {
      console.error("Detailed mint error:", error);
      throw new Error(`Token mint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async function updateTokenPrice(modelID: string, newPrice: number): Promise<void> {
    console.log(`Attempting to update price for model ${modelID} to ${newPrice}`);
    
    const { data, error } = await supabase
      .from("models")
      .update({ apt_per_token: newPrice })
      .eq("id", modelID)
      .select();

    if (error) {
      console.error("Error updating token price:", error);
      throw new Error("Failed to update token price");
    }

    console.log("Price update result:", data);
  }
  
  // GraphQL endpoint
  const GRAPHQL_URL = "https://indexer.mainnet.aptoslabs.com/v1/graphql";

  async function getTotalSupply(
    agent: AgentRuntime,
    tokenAddress: string
  ): Promise<number> {
    try {
      const query = `
        query GetFungibleAssetSupply($asset_type: String) {
          current_fungible_asset_balances(
            where: {asset_type: {_eq: $asset_type}}
          ) {
            amount
          }
        }
      `;

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            asset_type: tokenAddress
          }
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("GraphQL API response:", data);

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      // Sum up all balances to get total supply
      const totalSupply = data.data.current_fungible_asset_balances.reduce(
        (sum: number, balance: { amount: string }) => sum + Number(balance.amount),
        0
      );

      const supply = totalSupply / 1e6; // Convert from smaller units
      console.log(`Total supply: ${supply} tokens`);
      return supply;

    } catch (error: unknown) {
      console.error("Error getting total supply:", error);
      throw new Error(`Failed to get total supply: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        const { modelID, amount } = body;
        let recipientAddress = body.recipientAddress;

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
  
      // Get total supply and calculate new price
      const totalSupply = await getTotalSupply(aptosAgent, tokenAddress);
      const currentPrice = model.apt_per_token || 0;
      const mintAmount = Number(amount);
      
      let newPrice = currentPrice;
      let priceImpact = 0;

      // Only update price if minting from browse page (when recipientAddress is provided)
      if (recipientAddress && totalSupply > 0) {
        // Calculate price impact based on supply BEFORE minting
        // For example, minting 100 tokens when supply is 1000 = 10% price decrease
        priceImpact = (mintAmount / (totalSupply - mintAmount)) * 100;
        newPrice = Math.abs(currentPrice * (1 + priceImpact / 100));

        // Update price in Supabase
        await updateTokenPrice(modelID, newPrice);

        console.log("Token mint result:", { 
          mintHash,
          oldPrice: currentPrice,
          newPrice,
          mintAmount,
          totalSupply,
          priceImpact
        });
      } else {
        console.log("Minting from dashboard - price not updated");
      }
  
      return NextResponse.json({
        message: "Token minted successfully!",
        mintTransactionHash: mintHash,
        tokenAddress,
        recipientAddress,
        amount,
        newPrice,
        totalSupply,
        priceImpact
      });
    } catch (error: unknown) {
      console.error("Token mint error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Token mint failed" },
        { status: 500 }
      );
    }
  }
  