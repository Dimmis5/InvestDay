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
import { useLanguage } from "../../context/LanguageContext"; // Import du contexte global
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { useAuthentification } from "../../context/AuthContext";

export default function DetailAction(req: Request) {
  const [logo, setLogo] = useState("");
  const [data, setData] = useState([] as any);
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState({} as any);
  const [chartReady, setChartReady] = useState(false);
  const { user, isAuthenticated } = useAuthentification();
  const { wallets, selectedId, getPrice } = useWallet();
  const { lang } = useLanguage(); // Utilisation de la langue globale
  const router = useRouter();
  const { nameAction } = router.query;
  const fetch = useFetch();

  const [dataCleaned, setDataCleaned] = useState({
    name: "-",
    market_cap: "-",
    number: "-",
  });

  // Traductions de la page Détail
  const translations = {
    fr: {
      cashLabel: "Cash (P.",
      buyBtn: "Acheter",
      capLabel: "Capitalisation boursière",
      sharesLabel: "Actions en circulation",
      popTitle: "Acheter",
      popSub: "Achat d'actions"
    },
    en: {
      cashLabel: "Cash (P.",
      buyBtn: "Buy",
      capLabel: "Market Capitalization",
      sharesLabel: "Shares Outstanding",
      popTitle: "Buy",
      popSub: "Purchase shares"
    }
  };

  const t = translations[lang as keyof typeof translations]; // Cast TypeScript

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

  let options = {
    chart: { height: 500, backgroundColor: 'transparent' },
    rangeSelector: { 
      enabled: true,
      buttons: lang === "fr" ? [
        { type: 'month', count: 1, text: '1m' },
        { type: 'month', count: 3, text: '3m' },
        { type: 'year', count: 1, text: '1an' },
        { type: 'all', text: 'Tout' }
      ] : undefined // Utilise les défauts anglais de Highcharts
    },
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
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>
                  {t.cashLabel}{selectedId + 1})
                </span>
                <span style={{ fontWeight: '700' }}>{(wallets[selectedId]?.cash || 0).toFixed(2)} $</span>
              </div>
            </div>
            <button 
              className={homeStyles.buyButton} 
              style={{ width: '140px' }} 
              onClick={() => setIsOpen(true)}
            >
              {t.buyBtn}
            </button>
          </div>
        </div>

        <div className={homeStyles.assetCard} style={{ marginBottom: '30px', padding: '20px' }}>
          {chartReady && data.results && (
            <HighchartsReact
              highcharts={Highcharts}
              constructorType={"stockChart"}
              options={options}
            />
          )}
        </div>

        <div className={homeStyles.summaryGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div className={homeStyles.statCard} style={{ padding: '20px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>{t.capLabel}</span>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>
              {format(dataCleaned.market_cap)} $
            </div>
          </div>
          <div className={homeStyles.statCard} style={{ padding: '20px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>{t.sharesLabel}</span>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>
              {format(dataCleaned.number)}
            </div>
          </div>
        </div>

        <Popup
          title={t.popTitle}
          subtitle={`${t.popSub} ${nameAction}`}
          maxCount={detail.price ? Math.floor((wallets[selectedId]?.cash || 0) / detail.price) : 0}
          symbol={nameAction}
          sell={false}
          open={isOpen}
          close={() => setIsOpen(false)}
          lang={lang}
        />
      </main>
    </>
  );
}

DetailAction.getLayout = function getLayout(page: any) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};