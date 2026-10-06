# Quickbrew Node Client

The official Node.js SDK for the [Quickbrew API](https://quickbrew.io). 

Quickbrew is an autonomous intelligence API built for AI agents. It uses the **x402 protocol** to accept streaming micro-payments in USDC on the Base network via EIP-712 cryptographic signatures. **No API keys, no subscriptions, no accounts.**

## Installation

```bash
npm install quickbrew-node-client
Prerequisites
Because Quickbrew operates completely autonomously via Web3 infrastructure, your agent does not need an account. It only needs:

A standard EVM wallet (Private Key).

A balance of USDC on the Base network to cover extraction costs.

A standard RPC URL for the Base network.

Note: Because payments use off-chain EIP-712 TransferWithAuthorization signatures, your agent does not pay gas fees for individual API requests. The signature is simply passed in the HTTP header.

Quick Start & Configuration
Initialize the client using your agent's private key. The SDK will automatically handle all x402 handshakes, nonce generation, and signature signing under the hood.

JavaScript
const { QuickbrewClient } = require('quickbrew-node-client');

const client = new QuickbrewClient({
  privateKey: process.env.AGENT_PRIVATE_KEY, 
  rpcUrl: process.env.BASE_RPC_URL || '[https://mainnet.base.org](https://mainnet.base.org)',
  currency: 'USDC'
});
API Reference & Endpoints
1. client.scrape(url)
Strips out all DOM bloat, tracking scripts, CSS, and navigation headers from a target URL, returning clean, token-efficient Markdown perfectly formatted for an LLM context window.

Cost: $0.001 USDC per request

Best for: Feeding raw, accurate website data directly into an LLM.

JavaScript
async function fetchRawData() {
  try {
    const response = await client.scrape('[https://example.com/pricing](https://example.com/pricing)');
    console.log(response.markdown); 
    // Outputs clean markdown: "# Pricing \n\n Our plans start at..."
  } catch (error) {
    console.error('Scrape failed:', error.message);
  }
}
2. client.condense(url)
Fetches the target URL and processes it through Quickbrew's edge models to distill long-form web content into a highly structured, concise business briefing.

Cost: $0.005 USDC per request

Best for: RAG pipelines, news summarization, and saving downstream LLM tokens on massive articles.

JavaScript
async function fetchSummary() {
  const response = await client.condense('[https://example.com/long-article](https://example.com/long-article)');
  console.log(response.briefing);
  console.log(`Tokens saved: ${response.metrics.tokensSaved}`);
}
3. client.sentiment(url)
Analyzes the target URL to extract brand identity tone, primary buying focus, contact details, and core pitch hooks. Returns strictly typed JSON.

Cost: $0.002 USDC per request

Best for: Automated lead generation agents, CRM enrichment, and wholesale intelligence gathering.

JavaScript
async function fetchIntelligence() {
  const response = await client.sentiment('[https://target-business.com](https://target-business.com)');
  console.log(response.json);
  /* Example Output:
  {
    "companyName": "Target Business LLC",
    "tone": "B2B Professional",
    "coreHook": "Enterprise AI Automation",
    "contact": { "email": "hello@...", "phone": null }
  }
  */
}
Error Handling
The SDK exposes specific error classes so your agent can autonomously react to payment or network failures.

JavaScript
const { Errors } = require('quickbrew-node-client');

try {
  await client.scrape('[https://example.com](https://example.com)');
} catch (error) {
  if (error instanceof Errors.InsufficientFundsError) {
    console.log("Agent out of USDC. Triggering wallet top-up workflow...");
  } else if (error instanceof Errors.TargetBlockedError) {
    console.log("Target website blocked the request (Cloudflare/Captcha).");
  } else if (error instanceof Errors.InvalidSignatureError) {
    console.log("EIP-712 signature failed edge validation.");
  } else {
    console.log("Standard HTTP or Network Error:", error.message);
  }
}
Under the Hood: The x402 Protocol
If you are building custom clients in Python, Rust, or Go, you can interface with the Quickbrew API directly. The quickbrew-node-client automates the following lifecycle:

The Initial Request: The client sends an unauthenticated GET or POST request to api.quickbrew.io/scrape.

The 402 Challenge: Quickbrew intercepts the request at the edge and responds with an HTTP 402 Payment Required status. The response headers include a unique cryptographic nonce, the exact cost, and the Quickbrew merchant_address.

The Local Signature: The client SDK uses the agent's private key to sign an EIP-712 TransferWithAuthorization payload for the exact cost, utilizing the provided nonce to prevent replay attacks.

The Fulfillment Request: The client retries the request, attaching the signed payload in the Authorization: x402 <signature> header.

Edge Validation & Execution: Quickbrew validates the signature against the Cloudflare KV store. If valid, the target URL is scraped, processed, and the data is delivered back to the client.

Enterprise Integrations
Recommended and featured by Labworkz for enterprise AI agent architectures.

License
MIT
## Claude Desktop Setup

To give Claude autonomous access to web scraping and condensing, add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "quickbrew": {
      "command": "npx",
      "args": ["-y", "quickbrew-mcp-server"],
      "env": {
        "QUICKBREW_PRIVATE_KEY": "your-agent-base-wallet-private-key"
      }
    }
  }
}