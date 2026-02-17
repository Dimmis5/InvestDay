import Head from "next/head";
import Image from "next/image";
import { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useFetch } from "../../context/FetchContext.js";
import { useWallet } from "../../context/WalletContext";
import { useLanguage } from "../../context/LanguageContext"; // Import du context global

import homeStyles from "../../styles/Home.module.css";
import marketStyles from "../../styles/Market.module.css";
import TableSearch from "../../components/TableSearch.component.jsx";
import DashBoardLayout from "../../components/layouts/DashBoard.layout";

export default function Market() {
  const { wallets, selectedId, selectWallet } = useWallet();
  const { lang } = useLanguage(); // Récupération de la langue globale
  const [data, setData] = useState([] as any);
  const [input, setInput] = useState("");
  const fetch = useFetch();

  // Traductions de la page Marchés
  const translations = {
    fr: {
      headTitle: "InvestTrade - Marchés",
      title: "Marchés",
      sub: "Recherchez des valeurs sans saturer l'API",
      cashLabel: "Disponible",
      portfolioLabel: "Portfolio n°",
      placeholder: "Tapez le nom d'une entreprise...",
      noWarrants: "warrant"
    },
    en: {
      headTitle: "InvestTrade - Markets",
      title: "Markets",
      sub: "Search for stocks without saturating the API",
      cashLabel: "Available",
      portfolioLabel: "Portfolio #",
      placeholder: "Type a company name...",
      noWarrants: "warrant"
    }
  };

  // Sécurisation du typage pour TypeScript
  const t = translations[lang as keyof typeof translations];

  const defaultStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "WMT", name: "Walmart Inc." },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (input.trim().length > 1) {
        fetch.get("/api/stock/search?term=" + input)
          .then((data) => setData(data))
          .catch((err) => console.error("API Limit reached or Error:", err));
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

  const list = (data && data.length > 0) 
    ? data.filter((item: any) => !item.name?.toLowerCase().includes(t.noWarrants))
          .map((item: any) => ({ symbol: item.symbol, name: item.name }))
    : defaultStocks;

  return (
    <>
      <Head>
        <title>{t.headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.marketHeader}>
          <div>
            <h1 className={homeStyles.marketTitle}>{t.title}</h1>
            <p className={homeStyles.marketSub}>{t.sub}</p>
          </div>

          <div className={homeStyles.statCard} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
            <Image src="/assets/cash.svg" width={25} height={25} alt="cash" style={{ marginRight: '12px' }} />
            <div>
              <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>{t.cashLabel}</span>
              <span style={{ fontWeight: '700' }}>{(wallets[selectedId]?.cash || 0).toFixed(2)} $</span>
            </div>
          </div>
        </div>

        <div className={homeStyles.filterBar}>
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

        <div className={marketStyles.searchInput} style={{ width: '100%', maxWidth: '500px', margin: '0 auto 30px' }}>
          <div style={{ borderRadius: '12px', border: '2px solid #f3ca3e', backgroundColor: 'white' }}>
            <input
              className={marketStyles.formSubmit}
              type="text"
              placeholder={t.placeholder}
              value={input}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              style={{ height: '45px', border: 'none' }}
            />
          </div>
        </div>

        <div className={homeStyles.assetCard} style={{ padding: '20px' }}>
          {/* Passage de la langue au tableau de recherche */}
          <TableSearch data={list} lang={lang} />
        </div>
      </main>
    </>
  );
}

Market.getLayout = function getLayout(page: any) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};