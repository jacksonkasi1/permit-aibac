# Secure AI Medical System PoC

A proof-of-concept integrating Permit.io, LangChain.js, and Langflow to create a secure AI system with fine-grained access controls for medical data.

## Overview

This project demonstrates how to implement attribute-based access control (ABAC) within an AI system using:

- **Langflow**: For visual orchestration of LLM workflows
- **LangChain.js**: For building RAG and agentic workflows in Node.js/TypeScript
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

- Node.js 18+ and npm/yarn
- Permit.io account 
- EyeLevel GroundX API key
- Upstash account (for QStash)
- OpenAI API key (or alternative LLM provider)
- Vercel account for deployment

### Installation

1. Clone this repository
```bash
git clone https://github.com/jacksonkasi1/permit-aibac.git
cd permit-aibac
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Access the application
```
http://localhost:3000
```

6. Access the Langflow UI (if running separately)
```
http://localhost:7860
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
   - `OPENAI_API_KEY`

4. Deploy the application

## Project Structure

```
permit-aibac/
├── src/                    # Source code
│   ├── api/                # API routes
│   │   ├── chat/          # Chat API endpoints
│   │   └── workflow/      # Upstash Workflow endpoints
│   ├── components/         # React components
│   ├── lib/                # Shared utilities
│   │   ├── langchain/     # LangChain.js configurations
│   │   ├── permit/        # Permit.io integrations
│   │   ├── groundx/       # EyeLevel GroundX RAG integrations
│   │   └── upstash/       # QStash workflow configurations
│   ├── pages/             # Next.js pages
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── docs/                  # Documentation
```

## Documentation

For detailed documentation, see [PLAN.md](PLAN.md) which contains:

- System architecture
- Implementation details
- Security controls
- Testing strategy

## License

MIT
