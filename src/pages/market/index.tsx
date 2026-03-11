import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFetch } from "../../context/FetchContext.js";
import { useWallet } from "../../context/WalletContext";
import { useLanguage } from "../../context/LanguageContext";

import homeStyles from "../../styles/Home.module.css";
import marketStyles from "../../styles/Market.module.css";
import TableSearch from "../../components/TableSearch.component.jsx";
import DashBoardLayout from "../../components/layouts/DashBoard.layout";

export default function Market() {
  const { wallets, selectedId, selectWallet } = useWallet();
  const { lang } = useLanguage();
  const [data, setData] = useState([] as any);
  const [input, setInput] = useState("");
  const [marketFilter, setMarketFilter] = useState("all");
  const fetch = useFetch();

  const translations = {
    fr: {
      headTitle: "InvestTrade - Marchés",
      title: "Marchés",
      sub: "Recherchez et analysez les actions en temps réel via Finage",
      cashLabel: "Disponible",
      portfolioLabel: "Portfolio n°",
      placeholder: "Tapez le nom d'une entreprise...",
      noWarrants: "warrant",
      filterAll: "Tous",
      filterStocks: "Actions",
      filterCrypto: "Crypto",
      filterForex: "Forex",
    },
    en: {
      headTitle: "InvestTrade - Markets",
      title: "Markets",
      sub: "Search and analyze stocks in real-time via Finage",
      cashLabel: "Available",
      portfolioLabel: "Portfolio #",
      placeholder: "Type a company name...",
      noWarrants: "warrant",
      filterAll: "All",
      filterStocks: "Stocks",
      filterCrypto: "Crypto",
      filterForex: "Forex",
    }
  };

  const t = translations[lang as keyof typeof translations] || translations.fr;

  const defaultStocks = [
    // Actions
    { symbol: "AAPL",  name: "Apple Inc.",             market: "stocks" },
    { symbol: "MSFT",  name: "Microsoft Corporation",  market: "stocks" },
    { symbol: "GOOGL", name: "Alphabet Inc.",           market: "stocks" },
    { symbol: "TSLA",  name: "Tesla, Inc.",             market: "stocks" },
    { symbol: "AMZN",  name: "Amazon.com, Inc.",        market: "stocks" },
    { symbol: "META",  name: "Meta Platforms, Inc.",    market: "stocks" },
    { symbol: "NVDA",  name: "NVIDIA Corporation",      market: "stocks" },
    { symbol: "JPM",   name: "JPMorgan Chase & Co.",    market: "stocks" },
    { symbol: "V",     name: "Visa Inc.",               market: "stocks" },
    { symbol: "WMT",   name: "Walmart Inc.",            market: "stocks" },
    // Crypto
    { symbol: "BTCUSD",  name: "Bitcoin",          market: "crypto" },
    { symbol: "ETHUSD",  name: "Ethereum",         market: "crypto" },
    { symbol: "BNBUSD",  name: "BNB",              market: "crypto" },
    { symbol: "SOLUSD",  name: "Solana",           market: "crypto" },
    { symbol: "XRPUSD",  name: "XRP",              market: "crypto" },
    { symbol: "ADAUSD",  name: "Cardano",          market: "crypto" },
    { symbol: "DOGEUSD", name: "Dogecoin",         market: "crypto" },
    { symbol: "AVAXUSD", name: "Avalanche",        market: "crypto" },
    // Forex
    { symbol: "EURUSD", name: "Euro / US Dollar",          market: "forex" },
    { symbol: "GBPUSD", name: "British Pound / US Dollar", market: "forex" },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen",  market: "forex" },
    { symbol: "USDCHF", name: "US Dollar / Swiss Franc",   market: "forex" },
    { symbol: "AUDUSD", name: "Australian Dollar / USD",   market: "forex" },
    { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", market: "forex" },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (input.trim().length > 1) {
        fetch.get("/api/stock/search?term=" + input)
          .then((results) => setData(results))
          .catch((err) => console.error("Search Error:", err));
      } else if (input === "") {
        setData([]);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [input]);

  const onChange = (e: any) => setInput(e.target.value);

  const handleKeyDown = (event: any) => {
    if (event.key === "Escape") {
      setInput("");
      setData([]);
    }
  };

  const rawList = (data && data.length > 0)
    ? data
        .filter((item: any) => !item.name?.toLowerCase().includes(t.noWarrants))
        .map((item: any) => ({ symbol: item.symbol, name: item.name, market: item.market || "stocks" }))
    : defaultStocks;

  // Filtre par marché
  const list = marketFilter === "all"
    ? rawList
    : rawList.filter((item: any) => item.market === marketFilter);

  const filters = [
    { key: "all",    label: t.filterAll },
    { key: "stocks", label: t.filterStocks },
    { key: "crypto", label: t.filterCrypto },
    { key: "forex",  label: t.filterForex },
  ];

  return (
    <>
      <Head>
        <title>{t.headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon3.ico" />
      </Head>

      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.marketHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 className={homeStyles.marketTitle}>{t.title}</h1>
            <p className={homeStyles.marketSub}>{t.sub}</p>
          </div>

          <div className={homeStyles.statCard} style={{ display: 'flex', alignItems: 'center', padding: '12px 25px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Image src="/assets/cash.svg" width={25} height={25} alt="cash" style={{ marginRight: '12px' }} />
            <div>
              <span style={{ fontSize: '11px', color: '#888', display: 'block', textTransform: 'uppercase' }}>{t.cashLabel}</span>
              <span style={{ fontWeight: '700', fontSize: '18px' }}>{(wallets[selectedId]?.cash || 0).toLocaleString()} $</span>
            </div>
          </div>
        </div>

        {/* Filtres portefeuille */}
        <div className={homeStyles.filterBar} style={{ marginBottom: '20px' }}>
          {wallets.map((_, index) => (
            <button
              key={index}
              className={selectedId === index ? homeStyles.filterActive : homeStyles.filterItem}
              onClick={() => selectWallet(index)}
            >
              {t.portfolioLabel}{index + 1}
            </button>
          ))}
        </div>

        {/* Barre de recherche */}
        <div className={marketStyles.searchInput} style={{ width: '100%', maxWidth: '600px', margin: '0 auto 20px' }}>
          <div style={{ borderRadius: '15px', border: '2px solid #f3ca3e', backgroundColor: 'white', display: 'flex', alignItems: 'center', padding: '0 15px', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={t.placeholder}
              value={input}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              style={{ height: '50px', border: 'none', width: '100%', paddingLeft: '0', outline: 'none', fontSize: '16px', backgroundColor: 'transparent' }}
            />
          </div>
        </div>

        {/* Filtres marché */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setMarketFilter(f.key)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                transition: 'all 0.15s ease',
                backgroundColor: marketFilter === f.key ? '#f3ca3e' : '#f0f0f0',
                color: marketFilter === f.key ? '#1a1a1a' : '#888',
                boxShadow: marketFilter === f.key ? '0 2px 8px rgba(243,202,62,0.4)' : 'none',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={homeStyles.assetCard} style={{ padding: '0', overflow: 'hidden', borderRadius: '15px' }}>
          <TableSearch data={list} lang={lang} />
        </div>
      </main>
    </>
  );
}

Market.getLayout = function getLayout(page: any) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};