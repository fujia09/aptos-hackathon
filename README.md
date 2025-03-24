# AITokenize

AITokenize is a decentralized marketplace for AI models with dynamic token-based pricing and seamless monetization on Aptos.

## Overview

AITokenize enables AI model creators to monetize their models through fungible asset tokens on the Aptos blockchain. Each model gets its own token, which users need to purchase and spend to make API calls to the model.

### Key Features

- 🪙 **Token-Based Access**: Each model has its own fungible asset token
- 📈 **Dynamic Pricing**: Token prices automatically adjust based on supply and demand
- 🔄 **Seamless Integration**: Simple authentication checks for token ownership
- 📊 **On-Chain Analytics**: Transparent usage tracking and metrics
- 👛 **Petra Wallet Integration**: Easy token purchases through Aptos's Petra wallet

## Getting Started

### Prerequisites

- Node.js 16+
- Aptos CLI
- Petra Wallet Browser Extension

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fujia09/aptos-hackathon.git
cd aptos-hackathon
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

### For Model Creators

1. Create an account and connect your Petra wallet
2. Click "Add New Model" in the dashboard
3. Fill in model details and create your token
4. Integrate token checking in your API:

```typescript
import { checkTokenBalance } from '@aitokenize/sdk';

async function handleModelRequest(userAddress: string, modelId: string) {
  const hasToken = await checkTokenBalance(userAddress, modelId);
  if (!hasToken) {
    throw new Error('Insufficient tokens');
  }
  // Process model request
}
```

### For Users

1. Browse available models
2. Connect Petra wallet
3. Purchase tokens for your chosen model
4. Make API calls using your tokens

## Architecture

### Smart Contracts

- `launchpad.move`: Handles token creation and management
- Token minting/burning with dynamic price impact
- Automatic price adjustments based on supply

### Backend

- Next.js API routes for token operations
- Supabase for model metadata storage
- GraphQL integration for real-time supply tracking

### Frontend

- React/Next.js with TypeScript
- shadcn/ui components
- TailwindCSS for styling
- Petra wallet integration

## Development

### Local Setup

1. Install Aptos CLI and set up local network
2. Deploy contracts:
```bash
aptos move publish
```

3. Run tests:
```bash
npm test
```

### Environment Variables

- `NEXT_PUBLIC_INTERNAL_API_SECRET`: API secret for internal routes
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `APTOS_NODE_URL`: Aptos node URL (mainnet)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Aptos Labs for the Move language and tools
- MoveAI for inspiration and support
- The Aptos community for feedback and testing
