import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { NFTGallery } from '../NFTGallery'
import { useAppContext, OperationHistoryItem } from '@/contexts/AppContext'
import { formatDistanceToNow } from 'date-fns'

// Mock the context and date-fns
jest.mock('@/contexts/AppContext')
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn()
}))

// Mock the blockchain library
jest.mock('@/lib/blockchain', () => ({
  getTransactionInfo: jest.fn(),
  formatGasPrice: jest.fn(),
  formatGasUsed: jest.fn(),
  formatAddress: jest.fn(),
  calculateGasFee: jest.fn(),
  ChainInfo: jest.fn()
}))

const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>
const mockFormatDistanceToNow = formatDistanceToNow as jest.MockedFunction<typeof formatDistanceToNow>

describe('NFTGallery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFormatDistanceToNow.mockReturnValue('2 minutes ago')
  })

  const createMockHistoryItem = (overrides: Partial<OperationHistoryItem> = {}): OperationHistoryItem => ({
    id: 'test-id',
    type: 'minting',
    prompt: 'Test prompt',
    status: 'success',
    timestamp: Date.now(),
    result: {
      txHash: '0x1234567890abcdef',
      explorerUrl: 'https://explorer.com/tx/0x1234567890abcdef',
      tokenURI: 'ipfs://test',
      imageUrl: 'https://example.com/image.jpg'
    },
    ...overrides
  })

  describe('empty state', () => {
    beforeEach(() => {
      mockUseAppContext.mockReturnValue({
        state: {
          operationHistory: [],
          prompt: '',
          generatedImage: null,
          tokenURI: null,
          generationState: { status: 'idle', progress: 0, error: null },
          mintingState: { status: 'idle', txHash: null, error: null },
          error: null,
          isLoading: false,
          lastUpdated: Date.now()
        }
      } as any)
    })

    it('should show empty state when no minted NFTs exist', () => {
      render(<NFTGallery />)
      
      expect(screen.getByText('NFT 历史画廊')).toBeInTheDocument()
      expect(screen.getByText('还没有铸造的NFT')).toBeInTheDocument()
      expect(screen.getByText('铸造NFT后，它们将显示在这里')).toBeInTheDocument()
    })

    it('should show empty state icon', () => {
      render(<NFTGallery />)
      
      const iconContainer = document.querySelector('.bg-gradient-to-br')
      expect(iconContainer).toBeInTheDocument()
      
      const icon = iconContainer?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('with minted NFTs', () => {
    const mockMintedNFTs = [
      createMockHistoryItem({
        id: '1',
        prompt: 'A beautiful sunset',
        result: { 
          txHash: '0x123', 
          explorerUrl: 'https://explorer.com/tx/0x123',
          tokenURI: 'ipfs://test1',
          imageUrl: 'https://example.com/image1.jpg'
        }
      }),
      createMockHistoryItem({
        id: '2',
        prompt: 'A cat on a windowsill',
        result: { 
          txHash: '0x456', 
          explorerUrl: 'https://explorer.com/tx/0x456',
          tokenURI: 'ipfs://test2',
          imageUrl: 'https://example.com/image2.jpg'
        }
      })
    ]

    beforeEach(() => {
      mockUseAppContext.mockReturnValue({
        state: {
          operationHistory: mockMintedNFTs,
          prompt: '',
          generatedImage: null,
          tokenURI: null,
          generationState: { status: 'idle', progress: 0, error: null },
          mintingState: { status: 'idle', txHash: null, error: null },
          error: null,
          isLoading: false,
          lastUpdated: Date.now()
        }
      } as any)
    })

    it('should display NFT count', () => {
      render(<NFTGallery />)
      
      expect(screen.getByText('2 个NFT')).toBeInTheDocument()
    })

    it('should display all minted NFTs', () => {
      render(<NFTGallery />)
      
      expect(screen.getByText(/A beautiful sunset/)).toBeInTheDocument()
      expect(screen.getByText(/A cat on a windowsill/)).toBeInTheDocument()
    })

    it('should show correct timestamps', () => {
      render(<NFTGallery />)
      
      expect(mockFormatDistanceToNow).toHaveBeenCalledTimes(2)
      expect(screen.getAllByText('2 minutes ago')).toHaveLength(2)
    })

    it('should show minted status indicators', () => {
      render(<NFTGallery />)
      
      const statusIndicators = document.querySelectorAll('.bg-green-500')
      expect(statusIndicators).toHaveLength(2)
      
      const statusTexts = screen.getAllByText('已铸造')
      expect(statusTexts).toHaveLength(2)
    })
  })

  describe('NFT selection and modal', () => {
    const mockNFT = createMockHistoryItem({
      id: '1',
      prompt: 'Test NFT',
      result: { 
        txHash: '0x123', 
        explorerUrl: 'https://explorer.com/tx/0x123',
        tokenURI: 'ipfs://test',
        imageUrl: 'https://example.com/image.jpg'
      }
    })

    beforeEach(() => {
      mockUseAppContext.mockReturnValue({
        state: {
          operationHistory: [mockNFT],
          prompt: '',
          generatedImage: null,
          tokenURI: null,
          generationState: { status: 'idle', progress: 0, error: null },
          mintingState: { status: 'idle', txHash: null, error: null },
          error: null,
          isLoading: false,
          lastUpdated: Date.now()
        }
      } as any)
    })

    it('should open modal when NFT is clicked', () => {
      render(<NFTGallery />)
      
      const nftCard = screen.getByText(/Test NFT/).closest('div')
      fireEvent.click(nftCard!)
      
      expect(screen.getByText('NFT 详细信息')).toBeInTheDocument()
    })

    it('should open modal when Enter key is pressed', () => {
      render(<NFTGallery />)
      
      const nftCard = screen.getByText(/Test NFT/).closest('div')
      fireEvent.keyDown(nftCard!, { key: 'Enter' })
      
      expect(screen.getByText('NFT 详细信息')).toBeInTheDocument()
    })

    it('should close modal when close button is clicked', () => {
      render(<NFTGallery />)
      
      // Open modal
      const nftCard = screen.getByText(/Test NFT/).closest('div')
      fireEvent.click(nftCard!)
      
      // Close modal
      const closeButton = screen.getByLabelText('关闭')
      fireEvent.click(closeButton)
      
      expect(screen.queryByText('NFT 详细信息')).not.toBeInTheDocument()
    })

    it('should close modal when clicking outside', () => {
      render(<NFTGallery />)
      
      // Open modal
      const nftCard = screen.getByText(/Test NFT/).closest('div')
      fireEvent.click(nftCard!)
      
      // Click outside modal
      const modalOverlay = screen.getByText('NFT 详细信息').closest('.fixed')
      fireEvent.click(modalOverlay!)
      
      expect(screen.queryByText('NFT 详细信息')).not.toBeInTheDocument()
    })

    it('should not close modal when clicking inside modal content', () => {
      render(<NFTGallery />)
      
      // Open modal
      const nftCard = screen.getByText(/Test NFT/).closest('div')
      fireEvent.click(nftCard!)
      
      // Click inside modal content
      const modalContent = screen.getByText('NFT 详细信息').closest('.bg-white')
      fireEvent.click(modalContent!)
      
      expect(screen.getByText('NFT 详细信息')).toBeInTheDocument()
    })
  })

  describe('custom className', () => {
    beforeEach(() => {
      mockUseAppContext.mockReturnValue({
        state: {
          operationHistory: [],
          prompt: '',
          generatedImage: null,
          tokenURI: null,
          generationState: { status: 'idle', progress: 0, error: null },
          mintingState: { status: 'idle', txHash: null, error: null },
          error: null,
          isLoading: false,
          lastUpdated: Date.now()
        }
      } as any)
    })

    it('should apply custom className', () => {
      const { container } = render(<NFTGallery className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('accessibility', () => {
    const mockNFT = createMockHistoryItem({
      id: '1',
      prompt: 'Test NFT',
      result: { 
        txHash: '0x123', 
        explorerUrl: 'https://explorer.com/tx/0x123',
        tokenURI: 'ipfs://test',
        imageUrl: 'https://example.com/image.jpg'
      }
    })

    beforeEach(() => {
      mockUseAppContext.mockReturnValue({
        state: {
          operationHistory: [mockNFT],
          prompt: '',
          generatedImage: null,
          tokenURI: null,
          generationState: { status: 'idle', progress: 0, error: null },
          mintingState: { status: 'idle', txHash: null, error: null },
          error: null,
          isLoading: false,
          lastUpdated: Date.now()
        }
      } as any)
    })

    it('should have proper ARIA labels', () => {
      render(<NFTGallery />)
      
      const nftCard = screen.getByText(/Test NFT/).closest('div')
      expect(nftCard).toHaveAttribute('role', 'button')
      expect(nftCard).toHaveAttribute('tabIndex', '0')
    })

    it('should handle keyboard navigation', () => {
      render(<NFTGallery />)
      
      const nftCard = screen.getByText(/Test NFT/).closest('div')
      
      // Test Enter key
      fireEvent.keyDown(nftCard!, { key: 'Enter' })
      expect(screen.getByText('NFT 详细信息')).toBeInTheDocument()
      
      // Close modal
      const closeButton = screen.getByLabelText('关闭')
      fireEvent.click(closeButton)
      
      // Test Space key
      fireEvent.keyDown(nftCard!, { key: ' ' })
      expect(screen.getByText('NFT 详细信息')).toBeInTheDocument()
    })
  })
}) 