'use client'

import { useWallet } from '@/hooks/useWallet'
import { useAppContext } from '@/contexts/AppContext'
import { useAppOperations } from '@/hooks/useAppOperations'
import React from 'react'
import Image from 'next/image'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { WalletConnection } from '@/components/WalletConnection'
import { OperationHistory } from '@/components/OperationHistory'

export default function Home() {
  const { isConnected, isWrongNetwork, address, formatAddress } = useWallet()
  const { 
    state, 
    setPrompt, 
    canGenerate, 
    canMint, 
    isGenerating, 
    isMinting,
    clearError 
  } = useAppContext()
  const { 
    generateImage, 
    mintNFT, 
    retryGeneration, 
    retryMinting, 
    validatePrompt,
    getExplorerLink 
  } = useAppOperations()

  const handlePromptChange = (value: string) => {
    setPrompt(value)
    // Clear errors when user starts typing
    if (state.error) {
      clearError()
    }
  }

  const handleGenerate = () => {
    const validation = validatePrompt(state.prompt)
    if (!validation.isValid) {
      // The error will be handled by the useAppOperations hook
      return
    }
    generateImage()
  }

  const handleMint = () => {
    if (!isConnected || isWrongNetwork || !state.tokenURI || !state.prompt.trim()) {
      return
    }
    mintNFT()
  }

  const handleRetryGeneration = () => {
    retryGeneration()
  }

  const handleRetryMinting = () => {
    retryMinting()
  }



  const finalCanMint = canMint && isConnected && !isWrongNetwork
  const promptValidation = validatePrompt(state.prompt)
  const promptError = !promptValidation.isValid ? promptValidation.error : undefined

  // Progress text based on generation state
  const getProgressText = () => {
    switch (state.generationState.status) {
      case 'generating':
        return 'Generating your unique AI image...'
      case 'uploading':
        return 'Uploading to IPFS for permanent storage...'
      case 'completed':
        return 'Image generated successfully!'
      case 'error':
        return 'Generation failed'
      default:
        return ''
    }
  }

  // Minting status text
  const getMintingStatusText = () => {
    switch (state.mintingState.status) {
      case 'preparing':
        return 'Preparing transaction...'
      case 'signing':
        return 'Please sign the transaction in your wallet'
      case 'mining':
        return 'Transaction submitted, waiting for confirmation...'
      case 'completed':
        return 'NFT minted successfully!'
      case 'error':
        return 'Minting failed'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PromptMint
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Generate unique AI images from text prompts and mint them as NFTs on Monad Testnet.
            Transform your creativity into digital assets with the power of artificial intelligence.
          </p>
        </div>

        {/* Status Banners */}
        <div className="space-y-4 mb-8">
          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-blue-800 font-medium">Connect your wallet to get started</p>
                  <p className="text-blue-600 text-sm mt-1">
                    You&apos;ll need a wallet connected to Monad Testnet to mint NFTs. 
                    You can still generate images without connecting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isWrongNetwork && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-800 font-medium">Wrong network detected</p>
                  <p className="text-yellow-600 text-sm mt-1">
                    Please switch to Monad Testnet to mint NFTs. Click the network switcher in your wallet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isConnected && !isWrongNetwork && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-green-800 font-medium">Wallet connected successfully</p>
                  <p className="text-green-600 text-sm mt-1">
                    Connected as {formatAddress(address!)} on Monad Testnet. Ready to mint NFTs!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          {/* Image Preview Area */}
          <div className="mb-8">
            <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
              {/* Generated Image */}
              {state.generatedImage && state.generationState.status === 'completed' && (
                <div className="w-full h-full relative">
                  <Image
                    src={state.generatedImage}
                    alt="Generated AI image"
                    fill
                    className="object-cover rounded-xl"
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={() => console.error('Failed to load generated image')}
                    unoptimized // Since this is an external IPFS URL
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    ✓ Ready to mint
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="text-center text-gray-600 w-full px-4">
                  <div className="mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-medium mb-2">{getProgressText()}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${state.generationState.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{state.generationState.progress}% complete</p>
                  
                  {state.generationState.status === 'generating' && (
                    <p className="text-xs text-gray-400 mt-2">This may take 10-30 seconds...</p>
                  )}
                </div>
              )}

              {/* Error State */}
              {state.generationState.status === 'error' && (
                <div className="text-center text-gray-600 w-full px-4">
                  <div className="mb-4">
                    <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-red-600 mb-2">Generation Failed</p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">{state.generationState.error}</p>
                  <Button
                    onClick={handleRetryGeneration}
                    size="sm"
                    className="mx-auto"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Default State */}
              {state.generationState.status === 'idle' && !state.generatedImage && (
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm sm:text-base font-medium">Generated image will appear here</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Enter a prompt below to get started</p>
                </div>
              )}
            </div>

            {/* Generation Success Message */}
            {state.generationState.status === 'completed' && state.generatedImage && state.mintingState.status === 'idle' && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-green-800 font-medium text-sm">Image generated successfully!</p>
                    <p className="text-green-600 text-xs">Your image has been stored on IPFS and is ready to mint as an NFT.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Minting Status Messages */}
            {isMinting && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium text-sm">{getMintingStatusText()}</p>
                    {state.mintingState.status === 'signing' && (
                      <p className="text-blue-600 text-xs">Check your wallet for the transaction approval</p>
                    )}
                    {state.mintingState.status === 'mining' && state.mintingState.txHash && (
                      <p className="text-blue-600 text-xs">
                        <a 
                          href={getExplorerLink(state.mintingState.txHash)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          View transaction on Monad Explorer
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Minting Success Message */}
            {state.mintingState.status === 'completed' && state.mintingState.txHash && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-green-800 font-medium text-sm">NFT minted successfully! 🎉</p>
                    <p className="text-green-600 text-xs">
                      <a 
                        href={getExplorerLink(state.mintingState.txHash)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-green-800"
                      >
                        View your NFT on Monad Explorer
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 mb-3">
                Describe your image
              </label>
              <Textarea
                id="prompt"
                rows={4}
                value={state.prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="A majestic dragon flying over a mystical forest at sunset, digital art style..."
                error={promptError}
                className="text-base"
                disabled={isGenerating || isMinting}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Be descriptive for better results. Include style, mood, and details.
                </p>
                <p className="text-xs text-gray-400">
                  {state.prompt.length}/500
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                loading={isGenerating}
                size="lg"
                className="flex-1 sm:flex-none sm:min-w-[160px]"
              >
                {isGenerating 
                  ? (state.generationState.status === 'generating' ? 'Generating...' : 'Uploading...')
                  : state.generatedImage 
                  ? 'Generate New Image' 
                  : 'Generate Image'
                }
              </Button>
              
              <Button
                onClick={handleMint}
                disabled={!finalCanMint}
                loading={isMinting}
                variant="success"
                size="lg"
                className="flex-1 sm:flex-none sm:min-w-[160px]"
                title={
                  !isConnected 
                    ? 'Connect wallet to Monad Testnet to mint NFTs'
                    : isWrongNetwork
                    ? 'Switch to Monad Testnet to mint NFTs'
                    : !state.generatedImage
                    ? 'Generate an image first to mint as NFT'
                    : 'Mint your generated image as an NFT'
                }
              >
                {isMinting ? 'Minting...' : 'Mint NFT'}
              </Button>
            </div>

            {/* Helper Text */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {!isConnected 
                  ? 'Connect your wallet to mint NFTs after generating an image'
                  : isWrongNetwork
                  ? 'Switch to Monad Testnet to enable minting'
                  : !state.generatedImage
                  ? 'Generate an image first, then mint it as an NFT'
                  : state.mintingState.status === 'completed'
                  ? 'NFT successfully minted! Generate a new image to mint another.'
                  : 'Your image is ready to mint as an NFT!'
                }
              </p>
            </div>

            {/* Generation Error Display */}
            {state.generationState.status === 'error' && state.generationState.error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium text-sm">Generation Failed</p>
                    <p className="text-red-600 text-sm mt-1">{state.generationState.error}</p>
                    <div className="mt-3">
                      <Button
                        onClick={handleRetryGeneration}
                        size="sm"
                        variant="danger"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Minting Error Display */}
            {state.mintingState.status === 'error' && state.mintingState.error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium text-sm">Minting Failed</p>
                    <p className="text-red-600 text-sm mt-1">{state.mintingState.error}</p>
                    <div className="mt-3">
                      <Button
                        onClick={handleRetryMinting}
                        size="sm"
                        variant="danger"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Connection Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Connection</h3>
              <p className="text-sm text-gray-600">
                Connect your wallet to Monad Testnet to mint NFTs
              </p>
            </div>
            <WalletConnection />
          </div>
        </div>

        {/* Operation History Section */}
        <OperationHistory className="mb-8" />

        {/* How it Works Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Enter Prompt</h3>
              <p className="text-gray-600 leading-relaxed">
                Describe the image you want to create with AI. Be creative and detailed for the best results.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Generate & Store</h3>
              <p className="text-gray-600 leading-relaxed">
                AI creates your unique image and automatically stores it on IPFS for permanent decentralized storage.
              </p>
            </div>
            
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Mint NFT</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your unique NFT on Monad Testnet blockchain with proof of ownership and authenticity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}