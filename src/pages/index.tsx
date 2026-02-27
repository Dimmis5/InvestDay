import Head from "next/head";
import homeStyles from "../styles/Home.module.css";
import DashBoardLayout from "../components/layouts/DashBoard.layout";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useLanguage } from "../context/LanguageContext";
import NextImage from "next/image"; 

export default function Home() {
  const router = useRouter();
  const { lang } = useLanguage(); 
  const {
    wallets,
    walletsLines,
    selectedId,
    actualiseWalletsLines,
  } = useWallet();

  const translations = {
    fr: {
      title: "Bourse",
      sub: "Consultez et négociez des actions en temps réel",
      buy: "Acheter",
      sell: "Vendre",
      all: "Toutes les actions",
      tech: "Technologie",
      auto: "Automobile",
      fin: "Finance",
      empty: "Aucun actif dans ce portefeuille. Commencez à trader !",
      today: "aujourd'hui",
    },
    en: {
      title: "Stock Market",
      sub: "Browse and trade stocks in real-time",
      buy: "Buy",
      sell: "Sell",
      all: "All Stocks",
      tech: "Technology",
      auto: "Automotive",
      fin: "Finance",
      empty: "No assets in this portfolio. Start trading!",
      today: "today",
    }
  };

  const t = translations[lang as keyof typeof translations];

  useEffect(() => {
    if (wallets && wallets[selectedId]) {
      if (!(walletsLines && walletsLines[selectedId]))
        actualiseWalletsLines(selectedId);
    }
  }, [wallets, selectedId, walletsLines, actualiseWalletsLines]);

  return (
    <>
      <Head>
        <title>InvestDays - {t.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon3.ico" />
      </Head>

      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.welcomeSection} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingRight: '0px' 
        }}>
          <div>
            <h1 className={homeStyles.marketTitle}>{t.title}</h1>
            <p className={homeStyles.marketSub}>{t.sub}</p>
          </div>
          
          <a 
            href="https://twelvedata.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              marginRight: '-50px', 
              overflow: 'hidden'    
            }}
          >
            <NextImage 
              src="/assets/partners/twelve_data.svg" 
              alt="Twelve Data Logo" 
              width={350}  
              height={100} 
              style={{ 
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </a>
        </div>

        <div className={homeStyles.filterBar}>
          <button className={homeStyles.filterActive}>{t.all}</button>
          <button className={homeStyles.filterItem}>{t.tech}</button>
          <button className={homeStyles.filterItem}>{t.auto}</button>
          <button className={homeStyles.filterItem}>{t.fin}</button>
        </div>

        <div className={homeStyles.assetsGrid}>
          {wallets && wallets[selectedId]?.transactions.map((transaction: any, index: number) => (
            <div key={index} className={homeStyles.assetCard}>
              <div className={homeStyles.cardHeader}>
                <div>
                  <span className={homeStyles.symbol}>{transaction.symbol}</span>
                  <p className={homeStyles.fullName}>
                    {transaction.companyName || (lang === "fr" ? "Entreprise Cotée" : "Listed Company")}
                  </p> 
                </div>
                <div className={homeStyles.performanceBadge}>+2.65%</div>
              </div>

              <div className={homeStyles.priceSection}>
                <div className={homeStyles.price}>
                  ${((transaction.currentPrice || transaction.valueAtExecution) || 0).toFixed(2)}
                </div>
                <div className={homeStyles.todayChange}>+$4.60 {t.today}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  className={homeStyles.buyButton}
                  style={{ flex: 1 }}
                  onClick={() => router.push(`/market/${transaction.symbol}`)}
                >
                  {t.buy}
                </button>
                <button 
                  className={homeStyles.buyButton}
                  style={{ flex: 1, backgroundColor: '#e36355', color: 'white' }} 
                  onClick={() => router.push('/wallet')} 
                >
                  {t.sell}
                </button>
              </div>
            </div>
          ))}

          {wallets && wallets[selectedId]?.transactions.length === 0 && (
            <p className={homeStyles.emptyMessage}>{t.empty}</p>
          )}
        </div>
      </main>
    </>
  );
}

Home.getLayout = function getLayout(page: any) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};