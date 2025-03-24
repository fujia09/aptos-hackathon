// app/api/move-agent/init-wallet/route.ts

import { Account } from "@aptos-labs/ts-sdk";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Generate a new Aptos wallet (Ed25519 keypair)
    const modelAccount = Account.generate();

    // Extract private key (hex) and address
    const privateKeyHex = modelAccount.privateKey.toString();
    const address = modelAccount.accountAddress.toString();

    // const privateKeyHex = process.env.TEST_WALLET_PRIVATE
    // const address = process.env.TEST_WALLET_PUBLIC

    console.log(address, privateKeyHex)

    return NextResponse.json({
      modelWallet: {
        address,
        privateKey: privateKeyHex,
      },
      message: "Model wallet generated successfully",
    });
  } catch (error: any) {
    console.error("Error generating wallet:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate wallet" },
      { status: 500 }
    );
  }
}
