'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from '@/components/ui/dashcoin-card'
import { DashcoinButton } from '@/components/ui/dashcoin-button'

const DASHC_MINT = '7gkgsqE2Uip7LUyrqEi8fyLPNSbn7GYu9yFgtxZwYUVa'

export default function AlphaGroupPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async () => {
    setError(null)
    try {
      const provider = (window as any).solana
      if (!provider || !provider.isPhantom) {
        setError('Phantom wallet not found')
        return
      }
      const resp = await provider.connect()
      setWalletAddress(resp.publicKey.toString())
    } catch (e) {
      console.error(e)
      setError('Failed to connect wallet')
    }
  }

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) return
      setChecking(true)
      setError(null)
      try {
        const response = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountsByOwner',
            params: [walletAddress, { mint: DASHC_MINT }, { encoding: 'jsonParsed' }],
          }),
        })
        const json = await response.json()
        const value = json?.result?.value
        let amount = 0
        if (Array.isArray(value)) {
          for (const acc of value) {
            const uiAmount = Number(
              acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0
            )
            amount += uiAmount
          }
        }
        setBalance(amount)
      } catch (e) {
        console.error(e)
        setError('Failed to fetch token balance')
      } finally {
        setChecking(false)
      }
    }
    fetchBalance()
  }, [walletAddress])

  const hasAccess = balance > 0
  const inviteUrl = '#'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex flex-col items-center gap-6">
        <DashcoinCard className="max-w-lg w-full text-center">
          <DashcoinCardHeader>
            <DashcoinCardTitle>Alpha Group Access</DashcoinCardTitle>
          </DashcoinCardHeader>
          <DashcoinCardContent className="space-y-4">
            {!walletAddress ? (
              <DashcoinButton onClick={connectWallet}>Connect Wallet</DashcoinButton>
            ) : (
              <p className="dashcoin-text break-all">Connected: {walletAddress}</p>
            )}
            {walletAddress && (
              <>
                {checking && <p>Checking token balance...</p>}
                {!checking && (
                  hasAccess ? (
                    <div className="space-y-2">
                      <p>Your DASHC Balance: {balance}</p>
                      <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
                        <DashcoinButton>Join the Alpha Group</DashcoinButton>
                      </a>
                    </div>
                  ) : (
                    <p className="text-red-500">You must hold Dashcoin (DASHC) to join the Alpha Group.</p>
                  )
                )}
              </>
            )}
            {error && <p className="text-red-500">{error}</p>}
          </DashcoinCardContent>
        </DashcoinCard>
      </main>
    </div>
  )
}
