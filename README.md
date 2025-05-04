# Secure AI Medical System PoC

A proof-of-concept integrating Permit.io, Vercel AI SDK, and Google AI to create a secure AI system with fine-grained access controls for medical data.

## Overview

This project demonstrates how to implement attribute-based access control (ABAC) within an AI system using:

- **Vercel AI SDK**: For building and deploying AI-powered applications
- **Google AI**: For advanced language models (Gemini) with robust RAG capabilities
- **Permit.io**: For fine-grained authorization enforcement
- **EyeLevel GroundX**: For high-accuracy RAG and vector storage of medical data

The system enforces different access levels for doctors and patients, ensuring sensitive medical information is properly secured.

## Key Security Features

- **Prompt Filtering**: Block unauthorized queries based on user role and intent
- **Secure Raw Data Retrieval**: Attribute-based filtering for medical records
- **External Access Enforcement**: Controlled integration with external services
- **Response Enforcement**: Post-processing to prevent data leakage
- **Hallucination Prevention**: Using GroundX's proprietary chunking and context-aware RAG

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm/bun
- Permit.io account 
- EyeLevel GroundX API key
- Upstash account (for QStash)
- Google AI API key
- Vercel account for deployment

### Installation

1. Clone this repository
```bash
git clone https://github.com/jacksonkasi1/permit-aibac.git
cd permit-aibac
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Start the development server
```bash
bun run dev
```

5. Access the application
```
http://localhost:3000
```

### Deployment

To deploy to Vercel:

1. Push your code to a GitHub repository

2. Import the repository in Vercel
   
3. Configure environment variables in Vercel dashboard:
   - `PERMIT_API_KEY`
   - `GROUNDX_API_KEY`
   - `QSTASH_URL`
   - `QSTASH_TOKEN`
   - `GOOGLE_GENERATIVE_AI_API_KEY`

4. Deploy the application

## Project Structure

```
permit-aibac/
├── apps/
│   ├── api/         # Bun API backend (Hono, Drizzle, Clerk)
│   └── web/         # Next.js 15 frontend (App Router, shadcn/ui, React Query)
├── packages/        # Shared packages (code, integrations, utilities)
│   ├── db/          # Drizzle schema, types, and db utilities
│   ├── id/          # Identity utilities
│   ├── logs/        # Logging utilities
│   ├── typescript-config/ # Shared tsconfig
│   ├── permit/      # Permit.io integrations
│   ├── groundx/     # EyeLevel GroundX RAG integrations
│   └── upstash/     # QStash workflow configurations
├── .vscode/         # VSCode settings
├── .turbo/          # Turbo repo build cache
├── public/          # Static assets (if any)
├── docs/            # Documentation
├── README.md        # Project overview
├── PLAN.md          # Detailed architecture and implementation plan
└── ...              # Other config and root files
```

## Documentation

For detailed documentation, see [PLAN.md](PLAN.md) which contains:

- System architecture
- Implementation details
- Security controls
- Testing strategy

## License

MIT
