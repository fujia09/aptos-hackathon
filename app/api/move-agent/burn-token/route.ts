import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk";
import { AgentRuntime, LocalSigner } from "move-agent-kit";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Initialize Aptos configuration DO NOT CHANGE TO TESTNET
const aptosConfig = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(aptosConfig);

// GraphQL endpoint
const GRAPHQL_URL = "https://indexer.mainnet.aptoslabs.com/v1/graphql";

async function burnToken(
  agent: AgentRuntime,
  tokenAddress: string,
  amount: number
): Promise<string> {
  try {
    const transaction = await agent.aptos.transaction.build.simple({
      sender: agent.account.getAddress(),
      options: {
        maxGasAmount: 90000,
        gasUnitPrice: 100,
      },
      data: {
        function: "0x67c8564aee3799e9ac669553fdef3a3828d4626f24786b6a5642152fa09469dd::launchpad::burn_fa",
        functionArguments: [tokenAddress, amount],
      },
    });

    const committedTransactionHash = await agent.account.sendTransaction(transaction);
    const signedTransaction = await agent.aptos.waitForTransaction({
      transactionHash: committedTransactionHash,
    });

    if (!signedTransaction.success) {
      console.error(signedTransaction, "Token burn failed");
      throw new Error("Token burn failed");
    }

    return signedTransaction.hash;
  } catch (error: unknown) {
    console.error("Detailed burn error:", error);
    throw new Error(`Token burn failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    console.log("API received burn request body:", body);
    const { modelID, amount, userAddress } = body;

    // Validate inputs
    if (!modelID || !amount || !userAddress) {
      return NextResponse.json(
        { error: "Model ID, Burn Amount, and User Address are needed" },
        { status: 400 }
      );
    }

    const { data: model, error } = await supabase
      .from("models")
      .select("*")
      .eq("id", modelID)
      .maybeSingle();

    if (error || !model) {
      return NextResponse.json(
        { error: `Model not found ${error?.message}` },
        { status: 404 }
      );
    }

    const tokenAddress = model.token_address;
    if (!tokenAddress) {
      return NextResponse.json(
        { error: "Token address not found" },
        { status: 400 }
      );
    }

    console.log("Parsed burn values:", {
      tokenAddress,
      amount,
      userAddress,
    });

    // Get private key from environment
    const privateKeyStr = model.model_wallet_private_address;
    if (!privateKeyStr) {
      throw new Error("Missing model wallet private key");
    }

    // DO NOT CHANGE THIS ACCOUNT PRIVATE KEY LOGIC
    const privateKey = new Ed25519PrivateKey(privateKeyStr);
    const account = Account.fromPrivateKey({ privateKey });
    const signer = new LocalSigner(account, Network.MAINNET);
    const aptosAgent = new AgentRuntime(signer, aptos);

    console.log("Burning token with parameters:", {
      tokenAddress,
      amount,
      userAddress,
    });

    const burnHash = await burnToken(
      aptosAgent,
      tokenAddress,
      Number(amount) * 1e6 // Convert to smaller units
    );

    // Get total supply and calculate new price
    const totalSupply = await getTotalSupply(aptosAgent, tokenAddress);
    const currentPrice = model.apt_per_token || 0;
    const burnAmount = Number(amount);
    
    // Calculate price impact based on supply BEFORE burning
    // For example, burning 100 tokens when supply is 1000 = 10% price increase
    const priceImpact = (burnAmount / totalSupply) * 100;
    const newPrice = currentPrice * (1 + priceImpact / 100);

    // Update price in Supabase
    await updateTokenPrice(modelID, newPrice);

    console.log("Token burn result:", { 
      burnHash,
      oldPrice: currentPrice,
      newPrice,
      burnAmount,
      totalSupply,
      priceImpact
    });

    return NextResponse.json({
      message: "Token burned successfully!",
      burnTransactionHash: burnHash,
      tokenAddress,
      amount,
      newPrice,
      totalSupply,
      priceImpact
    });
  } catch (error: unknown) {
    console.error("Token burn error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token burn failed" },
      { status: 500 }
    );
  }
} 