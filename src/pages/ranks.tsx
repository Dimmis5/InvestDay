import Head from "next/head";
import homeStyles from "../styles/Home.module.css";
import TableRanks from "../components/TableRanks.component.jsx";
import DashBoardLayout from "../components/layouts/DashBoard.layout";
import { AppProps } from "next/app";
import { useEffect, useState, useMemo } from "react";
import { useFetch } from "../context/FetchContext";
import { useWallet } from "../context/WalletContext";
import { useAuthentification } from "../context/AuthContext";

// Définition de l'interface pour corriger l'erreur de build Docker
interface TableRanksProps {
  data: any[];
  selectedId: number;
}

export default function Ranks() {
  const [dataRanks, setDataRanks] = useState<any[]>([]); 
  const { selectedId } = useWallet();
  const { user } = useAuthentification();
  const fetch = useFetch();

  useEffect(() => {
    fetch.get("/api/wallet/rank")
      .then((data) => setDataRanks(data))
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  const myPerformance = useMemo(() => {
    if (!dataRanks || !user || !Array.isArray(dataRanks)) return null;

    // Nouveau tri basé sur le CASH pour le classement
    const sortedData = [...dataRanks]
      .filter((item: any) => item?.user?.isAdmin === false)
      .sort((a: any, b: any) => (Number(b.cash) || 0) - (Number(a.cash) || 0));

    const myIndex = (sortedData as any[]).findIndex((item: any) => item?.user?.id === (user as any)?.id);
    
    if (myIndex === -1) return null;

    const myData = sortedData[myIndex];
    const startingCash = 10000; 
    const currentVal = Number(myData.cash) || 0; // Utilisation du cash

    return {
      rank: myIndex + 1,
      total: currentVal,
      profit: currentVal - startingCash,
      percent: ((currentVal - startingCash) / startingCash) * 100
    };
  }, [dataRanks, user]);

  return (
    <>
      <Head><title>InvestDays - Classement Global</title></Head>
      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.marketHeader} style={{ marginBottom: '30px' }}>
          <div>
            <h1 className={homeStyles.marketTitle}>Classement Global</h1>
            <p className={homeStyles.marketSub}>Basé sur le cash disponible</p>
          </div>
          <div className={homeStyles.rankIconBadge}>🏆</div>
        </div>

        {/* Carte de performance personnelle */}
        <div className={homeStyles.performanceCard}>
          <div className={homeStyles.perfHeader}>
            <span className={homeStyles.perfTitle}>Ta Performance</span>
            <span className={homeStyles.rankBadge}>
                {myPerformance ? `Classement #${myPerformance.rank}` : "Classement #--"}
            </span>
          </div>
          <div className={homeStyles.perfGrid}>
            <div className={homeStyles.perfItem}>
              <label>ARGENT DISPONIBLE</label>
              <div className={homeStyles.perfValue}>
                {myPerformance ? myPerformance.total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"} $
              </div>
            </div>
            <div className={homeStyles.perfItem}>
              <label>PROFIT/PERTE</label>
              <div className={homeStyles.perfValue} style={{ color: (myPerformance?.profit || 0) >= 0 ? '#2ecc71' : '#e74c3c' }}>
                {myPerformance ? `${myPerformance.profit >= 0 ? "+" : ""}${myPerformance.profit.toLocaleString()}` : "0.00"} $
              </div>
            </div>
          </div>
        </div>

        <div className={homeStyles.assetCard} style={{ marginTop: '40px', padding: '30px', backgroundColor: '#fff' }}>
          <h3 style={{ marginBottom: '25px', fontWeight: '700' }}>Top Investisseur</h3>
          {/* Correction de l'appel : ajout de la prop selectedId requise */}
          <TableRanks 
            data={dataRanks as any} 
            selectedId={selectedId || 0} 
          />
        </div>
      </main>
    </>
  );
}

Ranks.getLayout = (page: React.ReactNode) => <DashBoardLayout>{page}</DashBoardLayout>;