'use client'

import { useCallback, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { useAppContext } from '@/contexts/AppContext'
import { useWallet } from '@/hooks/useWallet'
import { getClientConfig } from '@/lib/config'
import { GenerateRequest, GenerateResponse, APIError } from '@/types'

// Contract ABI for the mint function
const PROMPT_MINT_ABI = [
  {
    inputs: [
      { name: 'promptHash', type: 'bytes32' },
      { name: 'tokenURI', type: 'string' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'promptHash', type: 'bytes32' }],
    name: 'isPromptUsed',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export function useAppOperations() {
  const {
    state,
    startGeneration,
    updateGenerationProgress,
    completeGeneration,
    failGeneration,
    startMinting,
    updateMintingStatus,
    completeMinting,
    failMinting,
    addOperationToHistory,
    updateOperationInHistory,
    clearError
  } = useAppContext()

  const { isConnected, isWrongNetwork } = useWallet()
  const config = getClientConfig()

  // Wagmi hooks for contract interaction
  const { 
    writeContract, 
    isPending: isWritePending, 
    error: writeError, 
    data: txHash,
    reset: resetWrite
  } = useWriteContract()

  const { 
    isLoading: isTxLoading, 
    isSuccess: isTxSuccess,
    error: txError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Input validation
  const validatePrompt = useCallback((prompt: string): { isValid: boolean; error?: string } => {
    const trimmedPrompt = prompt.trim()
    
    if (!trimmedPrompt) {
      return { isValid: false, error: 'Please enter a prompt to generate an image' }
    }
    
    if (trimmedPrompt.length < 3) {
      return { isValid: false, error: 'Prompt must be at least 3 characters long' }
    }
    
    if (trimmedPrompt.length > 500) {
      return { isValid: false, error: 'Prompt must be less than 500 characters' }
    }
    
    return { isValid: true }
  }, [])

  // Generate image operation
  const generateImage = useCallback(async () => {
    const validation = validatePrompt(state.prompt)
    if (!validation.isValid) {
      failGeneration(validation.error!)
      return
    }

    // Start generation and add to history
    startGeneration()
    const operationId = addOperationToHistory({
      type: 'generation',
      prompt: state.prompt.trim(),
      status: 'pending'
    })

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        updateGenerationProgress(
          Math.min(state.generationState.progress + 10, 80),
          'generating'
        )
      }, 500)

      const requestBody: GenerateRequest = { prompt: state.prompt.trim() }
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData: APIError = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Update progress to uploading
      updateGenerationProgress(90, 'uploading')

      const data: GenerateResponse = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Generation failed')
      }

      if (!data.previewURL || !data.tokenURI) {
        throw new Error('Invalid response: missing image URL or token URI')
      }

      // Success - update state and history
      completeGeneration(data.previewURL, data.tokenURI)
      updateOperationInHistory(operationId, {
        status: 'success',
        result: {
          imageUrl: data.previewURL,
          tokenURI: data.tokenURI
        }
      })

    } catch (error) {
      console.error('Image generation failed:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      failGeneration(errorMessage)
      updateOperationInHistory(operationId, {
        status: 'error',
        error: errorMessage
      })
    }
  }, [
    state.prompt,
    state.generationState.progress,
    validatePrompt,
    startGeneration,
    updateGenerationProgress,
    completeGeneration,
    failGeneration,
    addOperationToHistory,
    updateOperationInHistory
  ])

  // Mint NFT operation
  const mintNFT = useCallback(async () => {
    if (!isConnected || isWrongNetwork || !state.tokenURI || !state.prompt.trim()) {
      return
    }

    // Start minting and add to history
    startMinting()
    const operationId = addOperationToHistory({
      type: 'minting',
      prompt: state.prompt.trim(),
      status: 'pending'
    })

    try {
      // Set minting state to preparing
      updateMintingStatus('preparing')

      // Calculate prompt hash
      const promptHash = keccak256(toBytes(state.prompt.trim()))
      console.log('Calculated prompt hash:', promptHash)

      // Set minting state to signing
      updateMintingStatus('signing')

      // Reset any previous write errors
      resetWrite()

      // Call the smart contract mint function
      await writeContract({
        address: config.contractAddress as `0x${string}`,
        abi: PROMPT_MINT_ABI,
        functionName: 'mint',
        args: [promptHash, state.tokenURI],
      })

      console.log('Transaction submitted successfully')

    } catch (error) {
      console.error('Minting failed:', error)
      
      let errorMessage = 'Failed to mint NFT'
      
      if (error instanceof Error) {
        if (error.message.includes('PromptAlreadyUsed')) {
          errorMessage = 'This prompt has already been used to mint an NFT. Please try a different prompt.'
        } else if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction was rejected by user'
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to pay for gas fees'
        } else {
          errorMessage = error.message
        }
      }

      failMinting(errorMessage)
      updateOperationInHistory(operationId, {
        status: 'error',
        error: errorMessage
      })
    }
  }, [
    isConnected,
    isWrongNetwork,
    state.tokenURI,
    state.prompt,
    config.contractAddress,
    writeContract,
    resetWrite,
    startMinting,
    updateMintingStatus,
    failMinting,
    addOperationToHistory,
    updateOperationInHistory
  ])

  // Handle transaction hash received
  useEffect(() => {
    if (txHash && state.mintingState.status === 'signing') {
      console.log('Transaction hash received:', txHash)
      updateMintingStatus('mining', txHash)
      
      // Update operation history with transaction hash
      const mintingOperation = state.operationHistory.find(
        op => op.type === 'minting' && op.status === 'pending'
      )
      if (mintingOperation) {
        updateOperationInHistory(mintingOperation.id, {
          result: {
            ...mintingOperation.result,
            txHash,
            explorerUrl: `https://testnet.monadexplorer.com/tx/${txHash}`
          }
        })
      }
    }
  }, [txHash, state.mintingState.status, state.operationHistory, updateMintingStatus, updateOperationInHistory])

  // Handle transaction completion
  useEffect(() => {
    if (isTxSuccess && state.mintingState.status === 'mining' && txHash) {
      completeMinting(txHash)
      
      // Update operation history with success
      const mintingOperation = state.operationHistory.find(
        op => op.type === 'minting' && op.status === 'pending'
      )
      if (mintingOperation) {
        updateOperationInHistory(mintingOperation.id, {
          status: 'success'
        })
      }
    }
  }, [isTxSuccess, state.mintingState.status, txHash, state.operationHistory, completeMinting, updateOperationInHistory])

  // Handle write contract errors
  useEffect(() => {
    if (writeError && state.mintingState.status !== 'error') {
      console.error('Write contract error:', writeError)
      const errorMessage = writeError.message || 'Failed to submit transaction'
      
      failMinting(errorMessage)
      
      // Update operation history with error
      const mintingOperation = state.operationHistory.find(
        op => op.type === 'minting' && op.status === 'pending'
      )
      if (mintingOperation) {
        updateOperationInHistory(mintingOperation.id, {
          status: 'error',
          error: errorMessage
        })
      }
    }
  }, [writeError, state.mintingState.status, state.operationHistory, failMinting, updateOperationInHistory])

  // Handle transaction errors
  useEffect(() => {
    if (txError && state.mintingState.status === 'mining') {
      console.error('Transaction error:', txError)
      const errorMessage = txError.message || 'Transaction failed'
      
      failMinting(errorMessage)
      
      // Update operation history with error
      const mintingOperation = state.operationHistory.find(
        op => op.type === 'minting' && op.status === 'pending'
      )
      if (mintingOperation) {
        updateOperationInHistory(mintingOperation.id, {
          status: 'error',
          error: errorMessage
        })
      }
    }
  }, [txError, state.mintingState.status, state.operationHistory, failMinting, updateOperationInHistory])

  // Retry operations
  const retryGeneration = useCallback(() => {
    clearError()
    generateImage()
  }, [clearError, generateImage])

  const retryMinting = useCallback(() => {
    clearError()
    mintNFT()
  }, [clearError, mintNFT])

  // Get explorer link for transaction
  const getExplorerLink = useCallback((txHash: string) => {
    return `https://testnet.monadexplorer.com/tx/${txHash}`
  }, [])

  return {
    // Operations
    generateImage,
    mintNFT,
    retryGeneration,
    retryMinting,
    
    // Validation
    validatePrompt,
    
    // Utilities
    getExplorerLink,
    
    // Loading states (from wagmi)
    isWritePending,
    isTxLoading,
    
    // Transaction info
    txHash,
    isTxSuccess
  }
}