import { Navbar } from "@/components/navbar";
import { fetchAllTokensFromDune } from "../actions/dune-actions";
import { fetchCreatorWalletLinks } from "../actions/googlesheet-action";

export default async function CreatorWalletsPage() {
  const tokens = await fetchAllTokensFromDune();
  const walletData = await fetchCreatorWalletLinks();

  const walletMap = new Map(walletData.map(d => [d.symbol.toUpperCase(), d.walletLink]));

  const tokensWithWallets = tokens.map(token => ({
    name: token.name || token.symbol,
    symbol: token.symbol,
    walletLink: walletMap.get(token.symbol.toUpperCase()) || ""
  }));

  return (
    <div className="min-h-screen">
      <Navbar dashcoinTradeLink="https://axiom.trade/meme/Fjq9SmWmtnETAVNbir1eXhrVANi1GDoHEA4nb4tNn7w6/@dashc" />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="dashcoin-text text-3xl text-dashYellow mb-2">Creator Wallets</h1>
        <p className="mb-4 text-dashYellow-light">Track what your favorite creator is doing with their earned fees!</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dashGreen-card dark:bg-dashGreen-cardDark border-b-2 border-dashBlack">
                <th className="text-left py-3 px-4 text-dashYellow">Token Name</th>
                <th className="text-left py-3 px-4 text-dashYellow">Creator Wallet Link</th>
              </tr>
            </thead>
            <tbody>
              {tokensWithWallets.map((token, idx) => (
                <tr key={idx} className="border-b border-dashGreen-light hover:bg-dashGreen-card dark:hover:bg-dashGreen-cardDark">
                  <td className="py-3 px-4">{token.name}</td>
                  <td className="py-3 px-4">
                    {token.walletLink ? (
                      <a href={token.walletLink} target="_blank" rel="noopener noreferrer" className="text-dashYellow hover:text-dashYellow-dark underline">
                        View Wallet
                      </a>
                    ) : (
                      <span className="opacity-60">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
