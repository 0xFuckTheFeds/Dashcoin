import { DashcoinButton } from "@/components/ui/dashcoin-button"
import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from "@/components/ui/dashcoin-card"
import type { NewTokenData } from "@/types/dune"
import { formatCurrency0 } from "@/lib/utils"
import { CopyAddress } from "@/components/copy-address"

interface NewTokensTableProps {
  data: NewTokenData[]
}

export function NewTokensTable({ data }: NewTokensTableProps) {
  const filteredTokens = data.filter((token) => (token.market_cap_usd || 0) > 10000)

  return (
    <DashcoinCard>
      <DashcoinCardHeader>
        <DashcoinCardTitle>Newest Tokens</DashcoinCardTitle>
        <p className="text-sm mt-1 opacity-70">Showing tokens with market cap above $10,000</p>
      </DashcoinCardHeader>
      <DashcoinCardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dashBlue-dark border-b border-dashBlack">
                <th className="text-left py-2 px-4 text-dashYellow">Symbol</th>
                <th className="text-left py-2 px-4 text-dashYellow">Market Cap</th>
                <th className="text-left py-2 px-4 text-dashYellow w-[60px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens && filteredTokens.length > 0 ? (
                filteredTokens.map((token, index) => {
                  const tokenAddress = token?.token_mint_address || ""
                  const tokenSymbol = token?.symbol || "???"
                  const marketCap = token?.market_cap_usd ? formatCurrency0(token.market_cap_usd) : "N/A"

                  return (
                    <tr key={index} className="border-b border-dashBlue-light hover:bg-dashBlue-dark">
                      <td className="py-2 px-4">
                        <div>
                          <p className="font-bold">{tokenSymbol}</p>
                          {tokenAddress && (
                            <CopyAddress
                              address={tokenAddress}
                              showBackground={false}
                              className="text-xs opacity-80 hover:opacity-100"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4">{marketCap}</td>
                      <td className="py-2 px-4">
                        <DashcoinButton
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs py-0 px-2 min-w-[60px]"
                        >
                          TRADE
                        </DashcoinButton>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-center opacity-80">
                    No new tokens with market cap above $10,000 available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashcoinCardContent>
    </DashcoinCard>
  )
}
