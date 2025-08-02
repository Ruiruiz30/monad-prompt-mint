'use client'

import { useWallet } from '@/hooks/useWallet'
import { useState } from 'react'

export default function Home() {
  const { isConnected, isWrongNetwork, address, formatAddress } = useWallet()
  const [prompt, setPrompt] = useState('')

  const canGenerate = prompt.trim().length > 0
  const canMint = isConnected && !isWrongNetwork

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to PromptMint
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Generate unique AI images from text prompts and mint them as NFTs on Monad Testnet.
          Transform your creativity into digital assets.
        </p>
      </div>

      {/* Wallet Status Banner */}
      {!isConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-800 font-medium">Connect your wallet to get started</p>
              <p className="text-blue-600 text-sm">You&apos;ll need a wallet connected to Monad Testnet to mint NFTs</p>
            </div>
          </div>
        </div>
      )}

      {isWrongNetwork && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium">Wrong network detected</p>
              <p className="text-yellow-600 text-sm">Please switch to Monad Testnet to continue</p>
            </div>
          </div>
        </div>
      )}

      {isConnected && !isWrongNetwork && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800 font-medium">Wallet connected successfully</p>
              <p className="text-green-600 text-sm">Connected as {formatAddress(address!)} on Monad Testnet</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center">
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
            <div className="text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Generated image will appear here</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your prompt
              </label>
              <textarea
                id="prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the image you want to generate..."
              />
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                disabled={!canGenerate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Image
              </button>
              
              <button
                type="button"
                disabled={!canMint}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!canMint ? 'Connect wallet to Monad Testnet to mint NFTs' : 'Mint your generated image as an NFT'}
              >
                Mint NFT
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Enter Prompt</h3>
            <p className="text-sm text-gray-600">
              Describe the image you want to create with AI
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Generate & Store</h3>
            <p className="text-sm text-gray-600">
              AI creates your image and stores it on IPFS
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Mint NFT</h3>
            <p className="text-sm text-gray-600">
              Create your unique NFT on Monad Testnet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}