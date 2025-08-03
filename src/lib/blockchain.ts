// 区块链工具库
export interface ChainInfo {
  blockNumber: number
  gasUsed: string
  gasPrice: string
  timestamp: number
  confirmations: number
  from: string
  to: string
  value: string
  nonce: number
}

export interface NFTInfo {
  tokenId: string
  contractAddress: string
  owner: string
  tokenURI: string
  metadata?: any
}

// Monad Testnet RPC URL
const MONAD_RPC_URL = 'https://rpc.testnet.monad.xyz'

// 获取交易详情
export async function getTransactionInfo(txHash: string): Promise<ChainInfo | null> {
  try {
    const response = await fetch(MONAD_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1,
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      console.error('RPC Error:', data.error)
      return null
    }

    const tx = data.result
    if (!tx) {
      return null
    }

    // 获取交易收据
    const receiptResponse = await fetch(MONAD_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    })

    const receiptData = await receiptResponse.json()
    const receipt = receiptData.result

    // 获取最新区块号来计算确认数
    const blockResponse = await fetch(MONAD_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    })

    const blockData = await blockResponse.json()
    const currentBlock = parseInt(blockData.result, 16)
    const txBlock = parseInt(tx.blockNumber, 16)
    const confirmations = currentBlock - txBlock

    return {
      blockNumber: txBlock,
      gasUsed: receipt ? receipt.gasUsed : '0',
      gasPrice: tx.gasPrice,
      timestamp: Date.now(), // 实际应该从区块获取时间戳
      confirmations: Math.max(0, confirmations),
      from: tx.from,
      to: tx.to,
      value: tx.value,
      nonce: parseInt(tx.nonce, 16),
    }
  } catch (error) {
    console.error('Failed to fetch transaction info:', error)
    return null
  }
}

// 获取NFT信息
export async function getNFTInfo(contractAddress: string, tokenId: string): Promise<NFTInfo | null> {
  try {
    // 这里应该调用NFT合约的ownerOf和tokenURI方法
    // 由于这是示例，我们返回模拟数据
    return {
      tokenId,
      contractAddress,
      owner: '0x1234567890123456789012345678901234567890',
      tokenURI: `ipfs://QmExample/${tokenId}`,
      metadata: {
        name: `NFT #${tokenId}`,
        description: 'AI Generated NFT',
        image: 'ipfs://QmExample/image.png',
      },
    }
  } catch (error) {
    console.error('Failed to fetch NFT info:', error)
    return null
  }
}

// 格式化Gas价格
export function formatGasPrice(gasPriceHex: string): string {
  const gasPriceWei = parseInt(gasPriceHex, 16)
  const gasPriceGwei = gasPriceWei / 1e9
  return `${gasPriceGwei.toFixed(2)} Gwei`
}

// 格式化Gas使用量
export function formatGasUsed(gasUsedHex: string): string {
  const gasUsed = parseInt(gasUsedHex, 16)
  return gasUsed.toLocaleString()
}

// 格式化地址
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 计算Gas费用
export function calculateGasFee(gasUsed: string, gasPrice: string): string {
  const used = parseInt(gasUsed, 16)
  const price = parseInt(gasPrice, 16)
  const feeWei = used * price
  const feeEth = feeWei / 1e18
  return `${feeEth.toFixed(6)} ETH`
} 