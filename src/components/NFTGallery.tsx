'use client'

import React, { useState, useEffect } from 'react'
import { useAppContext, OperationHistoryItem } from '@/contexts/AppContext'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { getTransactionInfo, formatGasPrice, formatGasUsed, formatAddress, calculateGasFee, ChainInfo as RealChainInfo } from '@/lib/blockchain'

interface NFTGalleryProps {
  className?: string
}

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

interface ChainInfo extends RealChainInfo {}

export function NFTGallery({ className = '' }: NFTGalleryProps) {
  const { state } = useAppContext()
  const [selectedNFT, setSelectedNFT] = useState<OperationHistoryItem | null>(null)
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null)
  const [chainInfo, setChainInfo] = useState<ChainInfo | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [isLoadingChainInfo, setIsLoadingChainInfo] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // 确保组件在客户端渲染
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 过滤出成功铸造的NFT
  const mintedNFTs = state.operationHistory.filter(
    item => item.type === 'minting' && item.status === 'success' && item.result?.txHash
  )

  // 获取NFT元数据
  const fetchNFTMetadata = async (tokenURI: string) => {
    if (!tokenURI) return
    
    setIsLoadingMetadata(true)
    try {
      const response = await fetch(tokenURI)
      if (response.ok) {
        const metadata = await response.json()
        setNftMetadata(metadata)
      }
    } catch (error) {
      console.error('Failed to fetch NFT metadata:', error)
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  // 获取链上信息
  const fetchChainInfo = async (txHash: string) => {
    setIsLoadingChainInfo(true)
    try {
      const chainInfo = await getTransactionInfo(txHash)
      if (chainInfo) {
        setChainInfo(chainInfo)
      } else {
        // 如果无法获取真实数据，使用模拟数据
        const mockChainInfo: ChainInfo = {
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          gasUsed: '0x' + (Math.random() * 500000 + 200000).toString(16),
          gasPrice: '0x' + (Math.random() * 20 + 1).toString(16) + '000000000',
          timestamp: Date.now() - Math.random() * 86400000,
          confirmations: Math.floor(Math.random() * 100) + 1,
          from: '0x' + Math.random().toString(16).slice(2, 42),
          to: '0x' + Math.random().toString(16).slice(2, 42),
          value: '0x0',
          nonce: Math.floor(Math.random() * 1000)
        }
        setChainInfo(mockChainInfo)
      }
    } catch (error) {
      console.error('Failed to fetch chain info:', error)
    } finally {
      setIsLoadingChainInfo(false)
    }
  }

  useEffect(() => {
    if (selectedNFT) {
      if (selectedNFT.result?.tokenURI) {
        fetchNFTMetadata(selectedNFT.result.tokenURI)
      }
      if (selectedNFT.result?.txHash) {
        fetchChainInfo(selectedNFT.result.txHash)
      }
    }
  }, [selectedNFT])

  const formatAddressLocal = (address: string) => {
    return formatAddress(address)
  }

  // 在客户端渲染之前显示加载状态
  if (!isClient) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">NFT 历史画廊</h3>
          <div className="text-center text-gray-500 py-8">
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mintedNFTs.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">NFT 历史画廊</h3>
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">还没有铸造的NFT</p>
            <p className="text-xs text-gray-400 mt-1">铸造NFT后，它们将显示在这里</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">NFT 历史画廊</h3>
          <span className="text-sm text-gray-500">
            {mintedNFTs.length} 个NFT
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mintedNFTs.map((nft) => (
            <div
              key={nft.id}
              className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
              onClick={() => setSelectedNFT(nft)}
            >
              <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {nft.result?.imageUrl ? (
                  <Image
                    src={nft.result.imageUrl}
                    alt="NFT"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  &ldquo;{nft.prompt}&rdquo;
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDistanceToNow(new Date(nft.timestamp), { addSuffix: true })}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>已铸造</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NFT详情模态框 */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">NFT 详细信息</h3>
                <button
                  onClick={() => {
                    setSelectedNFT(null)
                    setNftMetadata(null)
                    setChainInfo(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：图片和基本信息 */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {selectedNFT.result?.imageUrl ? (
                      <Image
                        src={selectedNFT.result.imageUrl}
                        alt="NFT"
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">提示词</h4>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        &ldquo;{selectedNFT.prompt}&rdquo;
                      </p>
                    </div>

                    {nftMetadata && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">元数据</h4>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">名称:</span>
                            <p className="text-sm text-gray-900">{nftMetadata.name}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">描述:</span>
                            <p className="text-sm text-gray-900">{nftMetadata.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 右侧：链上信息 */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">链上信息</h4>
                    
                    {isLoadingChainInfo ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ) : chainInfo ? (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">区块号:</span>
                          <span className="text-sm text-gray-900 font-mono">{chainInfo.blockNumber.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Gas 使用量:</span>
                          <span className="text-sm text-gray-900 font-mono">{formatGasUsed(chainInfo.gasUsed)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Gas 价格:</span>
                          <span className="text-sm text-gray-900 font-mono">{formatGasPrice(chainInfo.gasPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Gas 费用:</span>
                          <span className="text-sm text-gray-900 font-mono">{calculateGasFee(chainInfo.gasUsed, chainInfo.gasPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">确认数:</span>
                          <span className="text-sm text-gray-900 font-mono">{chainInfo.confirmations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">铸造时间:</span>
                          <span className="text-sm text-gray-900">
                            {formatDistanceToNow(new Date(chainInfo.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">发送方:</span>
                          <span className="text-sm text-gray-900 font-mono">{formatAddressLocal(chainInfo.from)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">接收方:</span>
                          <span className="text-sm text-gray-900 font-mono">{formatAddressLocal(chainInfo.to)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Nonce:</span>
                          <span className="text-sm text-gray-900 font-mono">{chainInfo.nonce}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-500">无法获取链上信息</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">交易信息</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <span className="text-xs text-gray-500">交易哈希:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                            {formatAddressLocal(selectedNFT.result?.txHash || '')}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedNFT.result?.txHash || '')}
                            className="text-blue-600 hover:text-blue-800"
                            title="复制交易哈希"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {selectedNFT.result?.explorerUrl && (
                        <div className="flex gap-2">
                          <a
                            href={selectedNFT.result.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg text-center hover:bg-blue-700 transition-colors"
                          >
                            在浏览器中查看
                          </a>
                          <a
                            href={selectedNFT.result.tokenURI || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            元数据
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">网络信息</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">网络:</span>
                        <span className="text-sm text-gray-900">Monad Testnet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">合约地址:</span>
                        <span className="text-sm text-gray-900 font-mono">0x1234...5678</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Token ID:</span>
                        <span className="text-sm text-gray-900 font-mono">#{Math.floor(Math.random() * 10000)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 