import Head from "next/head";
import Image from "next/image";
import homeStyles from "../../styles/Home.module.css";
import DashBoardLayout from "../../components/layouts/DashBoard.layout";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFetch } from "../../context/FetchContext.js";
import Popup from "../../components/Popup.component.jsx";
import { Request } from "../../types/request.type";
import { useWallet } from "../../context/WalletContext";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { useAuthentification } from "../../context/AuthContext";

export default function DetailAction(req: Request) {
  const [logo, setLogo] = useState("");
  const [data, setData] = useState([] as any);
  const [isOpen, setIsOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [detail, setDetail] = useState({} as any);
  const [chartReady, setChartReady] = useState(false);
  const { user, isAuthenticated } = useAuthentification();
  const { wallets, selectedId, getPrice } = useWallet();
  const router = useRouter();
  const { nameAction } = router.query;
  const fetch = useFetch();

  const [dataCleaned, setDataCleaned] = useState({
    name: "-",
    market_cap: "-",
    number: "-",
  });

  // Charger Highcharts Exporting
  useEffect(() => {
    const loadExporting = async () => {
      if (typeof window !== "undefined") {
        try {
          const exportingModule = await import("highcharts/modules/exporting");
          (exportingModule.default as any)(Highcharts);
          setChartReady(true);
        } catch (err) {
          setChartReady(true);
        }
      }
    };
    loadExporting();
  }, []);

  // Formatage des grands nombres (K, M, B)
  function format(n: any) {
    if (!n || isNaN(n)) return "-";
    const num = Number(n);
    if (num >= 1e9) return (num / 1e9).toFixed(2) + " B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + " M";
    if (num >= 1000) return (num / 1000).toFixed(2) + " K";
    return num.toString();
  }

  async function fetchDetail(symbol: string) {
    try {
      const response = await fetch.get("/api/stock/detail?symbol=" + symbol);
      const price = await getPrice(symbol);
      setDetail({ ...response.results, price });
      if (response.results?.branding?.logo_url) {
        fetchLogo(response.results.branding.logo_url);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchLogo(url: string) {
    const logoData = await fetch.get("/api/stock/getLogo?url=" + url, true);
    setLogo(logoData);
  }

  function fetchData(symbol: string) {
    fetch.get("/api/stock/info?symbol=" + symbol)
      .then((res) => setData(res))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    if (user && isAuthenticated && nameAction) {
      fetchData(nameAction as string);
      fetchDetail(nameAction as string);
    }
  }, [nameAction, isAuthenticated, user]);

  useEffect(() => {
    if (detail) {
      setDataCleaned({
        name: detail.name || nameAction,
        market_cap: detail.market_cap,
        number: detail.weighted_shares_outstanding,
      });
    }
  }, [detail]);

  // Options du graphique
  let options = {
    chart: { height: 500, backgroundColor: 'transparent' },
    rangeSelector: { enabled: true },
    title: { text: null },
    series: [{
      name: nameAction,
      data: data.results?.map((i: any) => [i.t, i.c]) || [],
      color: '#f3ca3e',
      tooltip: { valueDecimals: 2 }
    }]
  };

  return (
    <>
      <Head>
        <title>InvestDays - {nameAction}</title>
      </Head>

      <main className={homeStyles.pageContainer}>
        {/* HEADER : Titre, Prix et Actions */}
        <div className={homeStyles.marketHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div>
                <h1 className={homeStyles.marketTitle}>{dataCleaned.name}</h1>
                <p className={homeStyles.marketSub}>{nameAction} • {detail.price?.toFixed(2)}$</p>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className={homeStyles.statCard} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
              <Image src="/assets/cash.svg" width={25} height={25} alt="cash" style={{ marginRight: '10px' }} />
              <div>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Cash (P.{selectedId + 1})</span>
                <span style={{ fontWeight: '700' }}>{(wallets[selectedId]?.cash || 0).toFixed(2)} $</span>
              </div>
            </div>
            <button 
              className={homeStyles.buyButton} 
              style={{ width: '140px' }} 
              onClick={() => setIsOpen(true)}
            >
              Acheter
            </button>
          </div>
        </div>

        {/* GRAPHIQUE */}
        <div className={homeStyles.assetCard} style={{ marginBottom: '30px', padding: '20px' }}>
          {chartReady && data.results && (
            <HighchartsReact
              highcharts={Highcharts}
              constructorType={"stockChart"}
              options={options}
            />
          )}
        </div>

        {/* STATISTIQUES EN CARTES */}
        <div className={homeStyles.summaryGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div className={homeStyles.statCard} style={{ padding: '20px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>Capitalisation boursière</span>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>
              {format(dataCleaned.market_cap)} $
            </div>
          </div>
          <div className={homeStyles.statCard} style={{ padding: '20px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>Actions en circulation</span>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>
              {format(dataCleaned.number)}
            </div>
          </div>
        </div>

        <Popup
          title="Acheter"
          subtitle={`Achat d'actions ${nameAction}`}
          maxCount={detail.price ? Math.floor((wallets[selectedId]?.cash || 0) / detail.price) : 0}
          symbol={nameAction}
          sell={false}
          open={isOpen}
          close={() => setIsOpen(false)}
        />
      </main>
    </>
  );
}

DetailAction.getLayout = function getLayout(page: AppProps) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};