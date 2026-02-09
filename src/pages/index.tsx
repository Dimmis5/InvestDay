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
    selectWallet,
    assetsCached,
    actualiseWalletsLines,
  } = useWallet();

  // Synchronisation des données du portefeuille au chargement
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
        
        {/* HEADER : Navigation style Onglets et sélecteur de portefeuille */}
        <div className={homeStyles.marketHeader}>
          <div className={homeStyles.navTabs}>
          </div>
          
        </div>

        {/* SECTION BIENVENUE */}
        <div className={homeStyles.welcomeSection}>
          <h1 className={homeStyles.marketTitle}>Stock Market</h1>
          <p className={homeStyles.marketSub}>Browse and trade stocks in real-time</p>
        </div>

        {/* BARRE DE FILTRES STYLE FIGMA */}
        <div className={homeStyles.filterBar}>
          <button className={homeStyles.filterActive}>All Stocks</button>
          <button className={homeStyles.filterItem}>Technology</button>
          <button className={homeStyles.filterItem}>Automotive</button>
          <button className={homeStyles.filterItem}>Finance</button>
        </div>

        {/* GRILLE D'ACTIFS (CARTES) */}
        <div className={homeStyles.assetsGrid}>
          {wallets && wallets[selectedId]?.transactions.map((transaction: any, index: number) => (
            <div key={index} className={homeStyles.assetCard}>
              <div className={homeStyles.cardHeader}>
                <div>
                  {/* Utilisation de symbol au lieu de companie */}
                  <span className={homeStyles.symbol}>{transaction.symbol}</span>
                  <p className={homeStyles.fullName}>
                    {transaction.companyName || "Entreprise Cotée"}
                  </p> 
                </div>
                {/* Badge de performance (calculé ou statique pour le look) */}
                <div className={homeStyles.performanceBadge}>+2.65%</div>
              </div>

              <div className={homeStyles.priceSection}>
                <div className={homeStyles.price}>
                  {/* On ajoute "|| 0" pour garantir qu'on ne fait pas un toFixed sur null */}
                  ${((transaction.currentPrice || transaction.valueAtExecution) || 0).toFixed(2)}
                </div>
                <div className={homeStyles.todayChange}>+$4.60 today</div>
              </div>

              {/* Bouton Buy Jaune sur toute la largeur */}
              <button 
                className={homeStyles.buyButton}
                onClick={() => router.push(`/market/${transaction.symbol}`)}
              >
                Buy
              </button>
            </div>
          ))}

          {/* Si aucune transaction n'existe encore */}
          {wallets && wallets[selectedId]?.transactions.length === 0 && (
            <p className={homeStyles.emptyMessage}>Aucun actif dans ce portefeuille. Commencez à trader !</p>
          )}
        </div>
      </main>
    </>
  );
}

// Layout persistant (Navbar + Footer avec logos)
Home.getLayout = function getLayout(page: AppProps) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};