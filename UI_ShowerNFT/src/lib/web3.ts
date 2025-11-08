import { ethers } from 'ethers';
import { writable, get } from 'svelte/store';

// Base Sepolia Testnet Configuration
export const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532 in decimal
export const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// Stores
export const walletAddress = writable<string | null>(null);
export const isConnecting = writable(false);
export const connectionError = writable<string | null>(null);
export const provider = writable<ethers.BrowserProvider | null>(null);
export const signer = writable<ethers.Signer | null>(null);

// Contract address - will be set after deployment
export const CONTRACT_ADDRESS = writable<string>('0x4068028D9161B31c3dde5C5C99C4F12205b6C7b7');

// Basic ERC-721 ABI for minting (we'll update this after contract deployment)
export const CONTRACT_ABI = [
    "function mint(address to) public returns (uint256)",
    "function balanceOf(address owner) public view returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet(): Promise<string | null> {
    if (!isMetaMaskInstalled()) {
        connectionError.set('MetaMask is not installed. Please install MetaMask to continue.');
        return null;
    }

    isConnecting.set(true);
    connectionError.set(null);

    try {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const address = accounts[0];
        
        // Create provider and signer
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const ethersSigner = await ethersProvider.getSigner();

        // Update stores
        walletAddress.set(address);
        provider.set(ethersProvider);
        signer.set(ethersSigner);

        // Check if we're on Base Sepolia, if not, prompt to switch
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
            await switchToBaseSepolia();
        }

        isConnecting.set(false);
        return address;
    } catch (error: any) {
        console.error('Error connecting wallet:', error);
        connectionError.set(error.message || 'Failed to connect wallet');
        isConnecting.set(false);
        return null;
    }
}

/**
 * Switch to Base Sepolia network
 */
export async function switchToBaseSepolia(): Promise<boolean> {
    if (!window.ethereum) {
        return false;
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
        });
        return true;
    } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: BASE_SEPOLIA_CHAIN_ID,
                            chainName: 'Base Sepolia',
                            nativeCurrency: {
                                name: 'Ethereum',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: [BASE_SEPOLIA_RPC],
                            blockExplorerUrls: ['https://sepolia.basescan.org/'],
                        },
                    ],
                });
                return true;
            } catch (addError) {
                console.error('Error adding Base Sepolia network:', addError);
                return false;
            }
        }
        console.error('Error switching to Base Sepolia:', switchError);
        return false;
    }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet() {
    walletAddress.set(null);
    provider.set(null);
    signer.set(null);
}

/**
 * Mint a Shower NFT
 */
export async function mintShowerNFT(): Promise<{ success: boolean; tokenId?: number; txHash?: string; error?: string }> {
    const currentSigner = get(signer);
    const contractAddress = get(CONTRACT_ADDRESS);
    const address = get(walletAddress);

    if (!currentSigner || !address) {
        return { success: false, error: 'Wallet not connected' };
    }

    if (!contractAddress) {
        return { success: false, error: 'Contract address not set. Please deploy the contract first.' };
    }

    try {
        // Create contract instance
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, currentSigner);

        // Call mint function
        const tx = await contract.mint(address);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();

        // Extract token ID from event logs (if available)
        // For now, we'll just return success
        return { 
            success: true, 
            txHash: receipt.hash,
            tokenId: 0 // We'll parse this from events later
        };
    } catch (error: any) {
        console.error('Error minting NFT:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to mint NFT' 
        };
    }
}

/**
 * Format wallet address for display (0x1234...5678)
 */
export function formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Listen for account changes
 */
if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            walletAddress.set(accounts[0]);
        }
    });

    window.ethereum.on('chainChanged', () => {
        // Reload the page when chain changes
        window.location.reload();
    });
}
