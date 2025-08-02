/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { WalletConnection } from '../WalletConnection'
import { useWallet } from '@/hooks/useWallet'

// Mock the useWallet hook
jest.mock('@/hooks/useWallet')
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>

describe('WalletConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders connect button when wallet is not connected', () => {
    mockUseWallet.mockReturnValue({
      address: undefined,
      isConnected: false,
      isWrongNetwork: false,
      isLoading: false,
      connectors: [],
      connectWallet: jest.fn(),
      disconnectWallet: jest.fn(),
      switchToMonadTestnet: jest.fn(),
      formatAddress: jest.fn(),
      chainId: 10143,
      isConnecting: false,
      getWalletStatus: jest.fn(() => 'disconnected'),
      targetChain: {
        id: 10143,
        name: 'Monad Testnet',
        network: 'monad-testnet',
        nativeCurrency: { decimals: 18, name: 'MON', symbol: 'MON' },
        rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
        blockExplorers: { default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' } },
        testnet: true,
      },
    })

    render(<WalletConnection />)
    
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('renders connected state when wallet is connected', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'
    mockUseWallet.mockReturnValue({
      address: mockAddress,
      isConnected: true,
      isWrongNetwork: false,
      isLoading: false,
      connectors: [],
      connectWallet: jest.fn(),
      disconnectWallet: jest.fn(),
      switchToMonadTestnet: jest.fn(),
      formatAddress: jest.fn(() => '0x1234...7890'),
      chainId: 10143,
      isConnecting: false,
      getWalletStatus: jest.fn(() => 'connected'),
      targetChain: {
        id: 10143,
        name: 'Monad Testnet',
        network: 'monad-testnet',
        nativeCurrency: { decimals: 18, name: 'MON', symbol: 'MON' },
        rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
        blockExplorers: { default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' } },
        testnet: true,
      },
    })

    render(<WalletConnection />)
    
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
    expect(screen.getByText('Disconnect')).toBeInTheDocument()
  })

  it('renders wrong network state when connected to wrong network', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'
    mockUseWallet.mockReturnValue({
      address: mockAddress,
      isConnected: true,
      isWrongNetwork: true,
      isLoading: false,
      connectors: [],
      connectWallet: jest.fn(),
      disconnectWallet: jest.fn(),
      switchToMonadTestnet: jest.fn(),
      formatAddress: jest.fn(() => '0x1234...7890'),
      chainId: 1, // Wrong chain ID
      isConnecting: false,
      getWalletStatus: jest.fn(() => 'wrong-network'),
      targetChain: {
        id: 10143,
        name: 'Monad Testnet',
        network: 'monad-testnet',
        nativeCurrency: { decimals: 18, name: 'MON', symbol: 'MON' },
        rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
        blockExplorers: { default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' } },
        testnet: true,
      },
    })

    render(<WalletConnection />)
    
    expect(screen.getByText('Wrong Network')).toBeInTheDocument()
    expect(screen.getByText('Switch to Monad Testnet')).toBeInTheDocument()
  })
})