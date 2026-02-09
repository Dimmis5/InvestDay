import Head from "next/head";
import Image from "next/image";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import DashBoardLayout from "../components/layouts/DashBoard.layout";
import TableWallet from "../components/TableWallet.component.jsx";
import { useFetch } from "../context/FetchContext.js";
import homeStyles from "../styles/Home.module.css";
import { useWallet } from "../context/WalletContext";
import { toast } from "react-toastify";

export default function Wallet() {
  const {
    wallets,
    selectedId,
    assetsCached,
    actualiseWalletsList,
  } = useWallet();
  const router = useRouter();
  const fetch = useFetch();

  // Fonction pour créer un nouveau portfolio
  async function handleNewWallet() {
    try {
      await fetch.get("/api/wallet/new");
      toast.success("Nouveau portefeuille créé !");
      actualiseWalletsList();
    } catch (error) {
      toast.error("Erreur lors de la création.");
    }
  }

  const totalValue = (wallets[selectedId]?.cash || 0) + assetsCached;

  return (
    <>
      <Head>
        <title>InvestDays - Portefeuille</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon3.ico" />
      </Head>

      <main className={homeStyles.pageContainer}>
        {/* HEADER : Titre et Boutons d'action alignés à droite */}
        <div className={homeStyles.marketHeader}>
          <div>
            <h1 className={homeStyles.marketTitle}>Portefeuille</h1>
            <p className={homeStyles.marketSub}>Gérez vos actifs et visualisez vos performances</p>
          </div>
          
          {/* Conteneur pour regrouper les deux boutons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             {/* Bouton Ajouter un portfolio */}
             {wallets && wallets.length < 4 && (
                <button 
                  className={homeStyles.filterItem} 
                  onClick={handleNewWallet}
                  style={{ padding: '10px 18px', fontWeight: '600' }}
                >
                  + Nouveau Portfolio
                </button>
             )}
             {/* Bouton Chercher une action */}
             <button 
                className={homeStyles.buyButton} 
                onClick={() => router.push("/market")}
                style={{ width: 'auto', padding: '12px 25px' }}
              >
                Chercher une action
              </button>
          </div>
        </div>

        {/* SECTION RÉSUMÉ : 3 encadrés blancs avec icônes à gauche */}
        <div className={homeStyles.summaryGrid} style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          
          {/* CARTE 1: VALEUR ACTIONS */}
          <div className={homeStyles.statCard} style={{ display: 'flex', alignItems: 'center', padding: '20px'}}>
            <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
              <Image src="/assets/wallet.svg" width={32} height={32} alt="wallet" />
            </div>
            <div>
              <span className={homeStyles.statLabel}>Valeur des actions</span>
              <div className={homeStyles.statValue}>{assetsCached.toFixed(2)} $</div>
            </div>
          </div>
          
          {/* CARTE 2: CASH */}
          <div className={homeStyles.statCard} style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
            <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
              <Image src="/assets/cash.svg" width={32} height={32} alt="cash" />
            </div>
            <div>
              <span className={homeStyles.statLabel}>Cash portefeuille n°{selectedId + 1}</span>
              <div className={homeStyles.statValue}>{wallets[selectedId]?.cash?.toFixed(2) || "0.00"} $</div>
            </div>
          </div>

          {/* CARTE 3: TOTAL (Bordure Jaune Figma) */}
          <div className={homeStyles.statCard} style={{ display: 'flex', alignItems: 'center', padding: '20px'}}>
            <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
              <Image src="/assets/total.svg" width={32} height={32} alt="total" />
            </div>
            <div>
              <span className={homeStyles.statLabel}>Valeur totale indicative</span>
              <div className={homeStyles.statValue}>{totalValue.toFixed(2)} $</div>
            </div>
          </div>
        </div>

        {/* SECTION TABLEAU : Encadré blanc avec coins arrondis */}
        <div className={homeStyles.assetCard} style={{ padding: '25px', borderRadius: '15px', backgroundColor: '#fff' }}>
          <TableWallet
            selectedId={selectedId}
            activeWalletTransactions={wallets[selectedId]?.transactions}
          />
        </div>
      </main>
      
    </>
  );
}

Wallet.getLayout = function getLayout(page: AppProps) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};