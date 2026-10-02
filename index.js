import { ethers } from "ethers";

export class QuickbrewClient {
  /**
   * Initialize the Quickbrew API Client
   * @param {string} privateKey - Your agent's Web3 wallet private key (must have Base USDC)
   */
  constructor(privateKey) {
    if (!privateKey) throw new Error("QuickbrewClient requires a valid private key.");
    this.wallet = new ethers.Wallet(privateKey);
    this.merchantWallet = "0x63419c2d5d06795fec77c5d124e4779fdf279b16";
    this.usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    this.baseUrl = "https://api.quickbrew.io";
  }

  async _generatePaymentHeader(priceAtomic) {
    const message = {
      from: this.wallet.address,
      to: this.merchantWallet,
      value: priceAtomic,
      validAfter: 0,
      validBefore: Math.floor(Date.now() / 1000) + 3600,
      nonce: ethers.hexlify(ethers.randomBytes(32))
    };

    const domain = { name: 'USD Coin', version: '2', chainId: 8453, verifyingContract: this.usdcAddress };
    const types = { TransferWithAuthorization: [
      { name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' }, { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' }
    ]};

    const signature = await this.wallet.signTypedData(domain, types, message);
    return Buffer.from(JSON.stringify({ ...message, signature })).toString('base64');
  }

  /**
   * Execute a Clean Markdown Scrape (Cost: 0.001 USDC)
   */
  async scrape(targetUrl) {
    const header = await this._generatePaymentHeader("1000");
    const res = await fetch(`${this.baseUrl}/scrape?url=${encodeURIComponent(targetUrl)}`, { headers: { 'PAYMENT-SIGNATURE': header } });
    return await res.json();
  }

  /**
   * Execute an AI Context Condense (Cost: 0.005 USDC)
   */
  async condense(targetUrl) {
    const header = await this._generatePaymentHeader("5000");
    const res = await fetch(`${this.baseUrl}/condense?url=${encodeURIComponent(targetUrl)}`, { headers: { 'PAYMENT-SIGNATURE': header } });
    return await res.json();
  }

  /**
   * Execute Live Wholesale Sentiment (Cost: 0.002 USDC)
   */
  async sentiment(targetUrl) {
    const header = await this._generatePaymentHeader("2000");
    const res = await fetch(`${this.baseUrl}/sentiment?url=${encodeURIComponent(targetUrl)}`, { headers: { 'PAYMENT-SIGNATURE': header } });
    return await res.json();
  }
}