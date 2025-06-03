import { Navbar } from "@/components/navbar";
import { fetchDefaultTokens } from "../actions/dexscreener-actions";
import { fetchCreatorWalletLinks } from "../actions/googlesheet-action";

export default async function CreatorWalletsPage() {
  const tokens = await fetchDefaultTokens();
  const walletData = await fetchCreatorWalletLinks();

  const walletMap = new Map(
    walletData.map((d) => [d.symbol.toUpperCase(), { link: d.walletLink, activity: d.walletActivity }])
  );

  const tokensWithWallets = tokens.map((token) => {
    const entry = walletMap.get(token.symbol.toUpperCase()) || { link: "", activity: "" };
    return {
      name: token.name || token.symbol,
      symbol: token.symbol,
      walletLink: entry.link,
      walletActivity: entry.activity,
    };
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="dashcoin-text text-3xl text-dashYellow mb-2">Creator Wallets</h1>
        <p className="mb-4 text-dashYellow-light">Track what your favorite creator is doing with their earned fees!</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dashGreen-card dark:bg-dashGreen-cardDark border-b-2 border-dashBlack">
                <th className="text-left py-3 px-4 text-dashYellow">Token Name</th>
                <th className="text-left py-3 px-4 text-dashYellow">Creator Wallet Link</th>
                <th className="text-left py-3 px-4 text-dashYellow">Wallet Activity</th>
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
                  <td className="py-3 px-4">{token.walletActivity || <span className="opacity-60">N/A</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
