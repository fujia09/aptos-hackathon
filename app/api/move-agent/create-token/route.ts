// app/api/create-model-token/route.ts
import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  PrivateKey,
  PrivateKeyVariants,
  AccountAddress,
  MoveStructId,
} from "@aptos-labs/ts-sdk";
import { AgentRuntime, LocalSigner } from "move-agent-kit";
import { NextResponse } from "next/server";

// Initialize Aptos configuration DO NOT CHANGE TO TESTNET
const aptosConfig = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(aptosConfig);

async function createToken(
  agent: AgentRuntime,
  name: string,
  symbol: string,
  iconURI: string,
  projectURI: string,
): Promise<{ hash: string; token: any }> {
  try {
    const transaction = await agent.aptos.transaction.build.simple({
      sender: agent.account.getAddress(),
      data: {
        function: "0x67c8564aee3799e9ac669553fdef3a3828d4626f24786b6a5642152fa09469dd::launchpad::create_fa_simple",
        functionArguments: [name, symbol, iconURI, projectURI],
      },
    });

    const committedTransactionHash = await agent.account.sendTransaction(transaction);
    const signedTransaction = await agent.aptos.waitForTransaction({
      transactionHash: committedTransactionHash,
    });

    if (!signedTransaction.success) {
      console.error(signedTransaction, "Token creation failed");
      throw new Error("Token creation failed");
    }

    const tokenData = (signedTransaction as any).events?.[0]?.data?.fa_obj?.inner;
    if (!tokenData) {
      throw new Error("Token creation succeeded but no token data was returned");
    }

    return {
      hash: signedTransaction.hash,
      token: tokenData,
    };
  } catch (error: any) {
    console.error("Detailed error:", error);
    throw new Error(`Token creation failed: ${error.message}`);
  }
}



export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("API received request body:", body);
    const { tokenName, tokenSymbol, iconURI, projectURI } = body;
    
    console.log("Parsed values:", {
      tokenName,
      tokenSymbol,
      iconURI,
      projectURI
    });

    // Validate inputs
    if (!tokenName || !tokenSymbol) {
      return NextResponse.json(
        { error: "Token name and symbol are required" },
        { status: 400 }
      );
    }

    // Get private key from environment
    const privateKeyStr = process.env.APTOS_PRIVATE_KEY;
    if (!privateKeyStr) {
      throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
    }

    // DO NOT CHANGE THIS ACCOUNT PRIVATE KEY LOGIC
    const aptos = new Aptos(aptosConfig);
    const privateKey = new Ed25519PrivateKey(privateKeyStr);
    const account = Account.fromPrivateKey({ privateKey });
    const signer = new LocalSigner(account, Network.MAINNET);
    const aptosAgent = new AgentRuntime(signer, aptos);

    console.log("Creating token with parameters:", {
      tokenName,
      tokenSymbol,
      iconURI: iconURI || "",
      projectURI: projectURI || ""
    });

    const { hash: creationHash, token } = await createToken(
      aptosAgent,
      tokenName,
      tokenSymbol,
      iconURI || "",
      projectURI || ""
    );

    console.log("Token creation result:", { creationHash, token });

    const creatorAddress = aptosAgent.account.getAddress();
    
    return NextResponse.json({
      message: "Token created successfully!",
      tokenCreationHash: creationHash,
      tokenAddress: token,
      creatorAddress: creatorAddress.toString(),
    });
  } catch (error: any) {
    console.error("Token creation error:", error);
    return NextResponse.json(
      { error: error.message || "Token creation failed" },
      { status: 500 }
    );
  }
}
