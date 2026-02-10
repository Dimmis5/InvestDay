import Head from "next/head";
import homeStyles from "../styles/Home.module.css";
import TableRanks from "../components/TableRanks.component.jsx";
import DashBoardLayout from "../components/layouts/DashBoard.layout";
import { AppProps } from "next/app";
import { useEffect, useState, useMemo } from "react";
import { useFetch } from "../context/FetchContext";
import { useWallet } from "../context/WalletContext";
import { useAuthentification } from "../context/AuthContext";

export default function Ranks() {
  const [dataRanks, setDataRanks] = useState<any[]>([]); 
  const { assetsCached } = useWallet();
  const { user } = useAuthentification();
  const fetch = useFetch();

  useEffect(() => {
    fetch.get("/api/wallet/rank")
      .then((data) => setDataRanks(data))
      .catch((err) => console.error("Erreur API:", err));
  }, []);

  const myPerformance = useMemo(() => {
    if (!dataRanks || !user || !Array.isArray(dataRanks)) return null;

    // Tri strict sur publicWalletValue
    const sortedData = [...dataRanks]
      .filter((item: any) => item?.user?.isAdmin === false)
      .sort((a: any, b: any) => (Number(b.publicWalletValue) || 0) - (Number(a.publicWalletValue) || 0));

    // Correction de l'erreur .id avec un cast explicite (sortedData as any[])
    const myIndex = (sortedData as any[]).findIndex((item: any) => item?.user?.id === (user as any)?.id);
    
    if (myIndex === -1) return null;

    const myData = sortedData[myIndex];
    const startingCash = 10000; 
    const currentVal = Number(myData.publicWalletValue) || 0;

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

        <div className={homeStyles.assetCard} style={{ marginTop: '40px', padding: '30px' }}>
          <h3 style={{ marginBottom: '25px', fontWeight: '700' }}>Top Traders</h3>
          {/* On passe tout le tableau sans slice pour voir tous les wallets */}
          <TableRanks data={dataRanks as any} />
        </div>
      </main>
    </>
  );
}

Ranks.getLayout = (page: AppProps) => <DashBoardLayout>{page}</DashBoardLayout>;