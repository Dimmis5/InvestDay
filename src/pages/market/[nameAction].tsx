import Head from "next/head";
import Image from "next/image";
import homeStyles from "../../styles/Home.module.css";
import DashBoardLayout from "../../components/layouts/DashBoard.layout";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { useFetch } from "../../context/FetchContext.js";
import Popup from "../../components/Popup.component.jsx";
import { Request } from "../../types/request.type";
import { useWallet } from "../../context/WalletContext";
import { useLanguage } from "../../context/LanguageContext"; 
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { useAuthentification } from "../../context/AuthContext";

export default function DetailAction(req: Request) {
  const [logo, setLogo] = useState("");
  const [data, setData] = useState<any>({ results: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [chartReady, setChartReady] = useState(false);
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");

  const { user, isAuthenticated } = useAuthentification();
  const { wallets, selectedId, getPrice } = useWallet();
  const { lang } = useLanguage();
  const router = useRouter();
  const { nameAction, name } = router.query;
  const fetch = useFetch();

  const [dataCleaned, setDataCleaned] = useState({
    name: "-",
    market_cap: "-",
    number: "-",
  });

  const translations = {
    fr: {
      cashLabel: "Cash (P.",
      buyBtn: "Acheter",
      popTitle: "Acheter",
      popSub: "Achat d'actions",
      loading: "Chargement du graphique...",
      line: "Courbe",
      candle: "Bougies",
    },
    en: {
      cashLabel: "Cash (P.",
      buyBtn: "Buy",
      popTitle: "Buy",
      popSub: "Purchase shares",
      loading: "Loading chart...",
      line: "Line",
      candle: "Candlestick",
    }
  };

  const t = translations[lang as keyof typeof translations] || translations.fr;

  // Données courbe : [timestamp, close]
  const lineData = useMemo(() => {
    if (data?.results && Array.isArray(data.results)) {
      return data.results.map((i: any) => [Number(i.t), i.c]);
    }
    return [];
  }, [data]);

  // Données bougies : [timestamp, open, high, low, close]
  const candleData = useMemo(() => {
    if (data?.results && Array.isArray(data.results)) {
      return data.results.map((i: any) => [
        Number(i.t),
        i.o ?? i.c,
        i.h ?? i.c,
        i.l ?? i.c,
        i.c,
      ]);
    }
    return [];
  }, [data]);

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
      console.error("Error fetching detail:", error);
    }
  }

  async function fetchLogo(url: string) {
    try {
      const logoData = await fetch.get("/api/stock/getLogo?url=" + url, true);
      setLogo(logoData);
    } catch (e) {
      setLogo("");
    }
  }

  function fetchData(symbol: string) {
    fetch.get("/api/stock/info?symbol=" + symbol)
      .then((res) => setData(res || { results: [] }))
      .catch((err) => console.error("Error fetching chart data:", err));
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
        name: (name as string) || detail.name || (nameAction as string) || "-",
        market_cap: detail.market_cap || "-",
        number: detail.weighted_shares_outstanding || "-",
      });
    }
  }, [detail, nameAction, name]);

  const commonConfig = {
    chart: {
      height: 500,
      backgroundColor: 'transparent',
      animation: false,
    },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#888' } },
      ordinal: true,
    },
    yAxis: {
      labels: { style: { color: '#888' }, format: '{value}$' },
      opposite: true,
    },
    rangeSelector: {
      enabled: true,
      selected: 3,
      inputDateFormat: lang === 'fr' ? '%e %B %Y' : '%B %e, %Y',
      inputEditDateFormat: '%Y-%m-%d',
      inputBoxWidth: 100,
      buttonTheme: {
        fill: 'none',
        stroke: 'none',
        r: 8,
        style: { color: '#888', fontWeight: '600' },
        states: { select: { fill: '#f3ca3e', style: { color: '#000' } } },
      },
      inputStyle: { color: '#f3ca3e', fontWeight: '700', fontSize: '13px' },
      labelStyle: { color: '#888', textTransform: 'uppercase', fontSize: '10px' },
      buttons: lang === "fr"
        ? [{ type: 'month', count: 1, text: '1m' }, { type: 'month', count: 3, text: '3m' }, { type: 'all', text: 'Tout' }]
        : [{ type: 'month', count: 1, text: '1m' }, { type: 'month', count: 3, text: '3m' }, { type: 'all', text: 'All' }],
    },
    plotOptions: {
      series: { animation: false, dataGrouping: { enabled: true } },
    },
    navigator: { enabled: true },
    scrollbar: { enabled: false },
    credits: { enabled: false },
  };

  const lineOptions = {
    ...commonConfig,
    series: [{
      type: 'line',
      name: nameAction || "Stock",
      data: lineData,
      color: '#f3ca3e',
      tooltip: {
        valueDecimals: 2,
        xDateFormat: lang === 'fr' ? '%A %e %B %Y' : '%A, %b %e, %Y',
      },
    }],
  };

  const candleOptions = {
    ...commonConfig,
    series: [{
      type: 'candlestick',
      name: nameAction || "Stock",
      data: candleData,
      color: '#e74c3c',
      upColor: '#2ecc71',
      lineColor: '#e74c3c',
      upLineColor: '#2ecc71',
      tooltip: {
        valueDecimals: 2,
        xDateFormat: lang === 'fr' ? '%A %e %B %Y' : '%A, %b %e, %Y',
      },
    }],
  };

  const hasData = chartType === "line" ? lineData.length > 0 : candleData.length > 0;

  const toggleBtnStyle = (active: boolean) => ({
    padding: '6px 18px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700' as const,
    fontSize: '13px',
    transition: 'all 0.15s ease',
    backgroundColor: active ? '#f3ca3e' : '#f0f0f0',
    color: active ? '#1a1a1a' : '#888',
    boxShadow: active ? '0 2px 8px rgba(243,202,62,0.4)' : 'none',
  });

  return (
    <>
      <Head>
        <title>InvestDays - {nameAction}</title>
      </Head>

      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.marketHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <h1 className={homeStyles.marketTitle}>{nameAction as string}</h1>
              <p className={homeStyles.marketSub}>
                {dataCleaned.name} • {detail?.price ? `${detail.price.toFixed(2)}$` : "- $"}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className={homeStyles.statCard} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
              <Image src="/assets/cash.svg" width={25} height={25} alt="cash" style={{ marginRight: '10px' }} />
              <div>
                <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>
                  {t.cashLabel}{selectedId + 1})
                </span>
                <span style={{ fontWeight: '700' }}>
                  {wallets[selectedId]?.cash ? wallets[selectedId].cash.toFixed(2) : "0.00"} $
                </span>
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

        <div className={homeStyles.assetCard} style={{ marginBottom: '30px', padding: '20px', minHeight: '500px' }}>

          {/* Toggle courbe / bougies */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => setChartType("line")} style={toggleBtnStyle(chartType === "line")}>
              📈 {t.line}
            </button>
            <button onClick={() => setChartType("candlestick")} style={toggleBtnStyle(chartType === "candlestick")}>
              🕯️ {t.candle}
            </button>
          </div>

          {chartReady && hasData ? (
            <HighchartsReact
              key={`chart-${lang}-${nameAction}-${chartType}-${lineData.length}`}
              highcharts={Highcharts}
              constructorType={"stockChart"}
              options={chartType === "line" ? lineOptions : candleOptions}
            />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#888' }}>
              {t.loading}
            </div>
          )}
        </div>

        <Popup
          title={t.popTitle}
          subtitle={`${t.popSub} ${nameAction}`}
          maxCount={detail?.price ? Math.floor((wallets[selectedId]?.cash || 0) / detail.price) : 0}
          symbol={nameAction as string}
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