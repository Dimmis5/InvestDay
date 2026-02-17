import Head from "next/head";
import homeStyles from "../styles/Home.module.css";
import DashBoardLayout from "../components/layouts/DashBoard.layout";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useWallet } from "../context/WalletContext";

export default function Home() {
  const router = useRouter();
  const {
    wallets,
    walletsLines,
    selectedId,
    actualiseWalletsLines,
  } = useWallet();

  useEffect(() => {
    if (wallets && wallets[selectedId]) {
      if (!(walletsLines && walletsLines[selectedId]))
        actualiseWalletsLines(selectedId);
    }
  }, [wallets, selectedId]);

  return (
    <>
      <Head>
        <title>InvestDays - Stock Market</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon3.ico" />
      </Head>

      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.marketHeader}>
          <div className={homeStyles.navTabs}></div>
        </div>

        <div className={homeStyles.welcomeSection}>
          <h1 className={homeStyles.marketTitle}>Bourse</h1>
          <p className={homeStyles.marketSub}>Consultez et négociez des actions en temps réel</p>
        </div>

        <div className={homeStyles.filterBar}>
          <button className={homeStyles.filterActive}>Toutes les actions</button>
          <button className={homeStyles.filterItem}>Technologie</button>
          <button className={homeStyles.filterItem}>Automobile</button>
          <button className={homeStyles.filterItem}>Finance</button>
        </div>

        <div className={homeStyles.assetsGrid}>
          {wallets && wallets[selectedId]?.transactions.map((transaction: any, index: number) => (
            <div key={index} className={homeStyles.assetCard}>
              <div className={homeStyles.cardHeader}>
                <div>
                  <span className={homeStyles.symbol}>{transaction.symbol}</span>
                  <p className={homeStyles.fullName}>
                    {transaction.companyName || "Entreprise Cotée"}
                  </p> 
                </div>
                <div className={homeStyles.performanceBadge}>+2.65%</div>
              </div>

              <div className={homeStyles.priceSection}>
                <div className={homeStyles.price}>
                  ${((transaction.currentPrice || transaction.valueAtExecution) || 0).toFixed(2)}
                </div>
                <div className={homeStyles.todayChange}>+$4.60 today</div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  className={homeStyles.buyButton}
                  style={{ flex: 1 }}
                  onClick={() => router.push(`/market/${transaction.symbol}`)}
                >
                  Acheter
                </button>
                
                {/* Bouton Vendre qui redirige vers le Portefeuille */}
                <button 
                  className={homeStyles.buyButton}
                  style={{ flex: 1, backgroundColor: '#e74c3c', color: 'white' }} 
                  onClick={() => router.push('/wallet')} // Redirection vers la page Portefeuille
                >
                  Vendre
                </button>
              </div>
            </div>
          ))}

          {wallets && wallets[selectedId]?.transactions.length === 0 && (
            <p className={homeStyles.emptyMessage}>Aucun actif dans ce portefeuille. Commencez à trader !</p>
          )}
        </div>
      </main>
    </>
  );
}

Home.getLayout = function getLayout(page: AppProps) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};