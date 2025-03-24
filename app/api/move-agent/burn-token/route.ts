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

async function burnToken(
  agent: AgentRuntime,
  tokenAddress: string,
  amount: number,
  userAddress: string
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
  } catch (error: any) {
    console.error("Detailed burn error:", error);
    throw new Error(`Token burn failed: ${error.message}`);
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
      Number(amount) * 1e6, // Convert to smaller units
      userAddress
    );

    console.log("Token burn result:", { burnHash });

    return NextResponse.json({
      message: "Token burned successfully!",
      burnTransactionHash: burnHash,
      tokenAddress,
      amount,
    });
  } catch (error: any) {
    console.error("Token burn error:", error);
    return NextResponse.json(
      { error: error.message || "Token burn failed" },
      { status: 500 }
    );
  }
} 