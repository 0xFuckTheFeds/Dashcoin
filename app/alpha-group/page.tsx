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
  const [tokenAccountMissing, setTokenAccountMissing] = useState(false)

  const connectWallet = async () => {
    setError(null)
    setTokenAccountMissing(false)
    try {
      const provider = (window as any).solana
      if (!provider || !provider.isPhantom) {
        setError('Phantom wallet not found')
        return
      }
      console.log('provider object', provider)
      const resp = await provider.connect({ network: 'mainnet-beta' })
      const address = resp.publicKey.toString()
      setWalletAddress(address)
      console.log('walletAddress', address)
      const network = provider.network || provider.networkVersion
      if (network && network !== 'mainnet-beta') {
        setError('Please switch your Phantom network to Mainnet Beta')
      }
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
      setTokenAccountMissing(false)
      try {
        const provider = (window as any).solana
        const json = await provider.request({
          method: 'getTokenAccountsByOwner',
          params: [walletAddress, { mint: DASHC_MINT }, { encoding: 'jsonParsed' }],
        })
        console.log('RPC response', json)
        const value = json?.value || json?.result?.value
        if (!Array.isArray(value)) {
          setError('Unable to fetch token accounts; please try again.')
          return
        }
        if (value.length === 0) {
          setBalance(0)
          setTokenAccountMissing(true)
          return
        }
        let amount = 0
        for (const acc of value) {
          const uiAmount = Number(
            acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0
          )
          amount += uiAmount
        }
        setBalance(amount)
      } catch (e) {
        console.error(e)
        setError('Unable to verify Dashcoin holdings. Please ensure you\'re on Mainnet Beta and try again.')
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
                  ) : tokenAccountMissing ? (
                    <p className="text-red-500">
                      It looks like your wallet doesn't have an active DASHC token account. Please click
                      "Create Token Account" in Phantom or send 0 DASHC to your own address, then refresh.
                    </p>
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
