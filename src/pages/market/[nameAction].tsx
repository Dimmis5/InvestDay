import Head from "next/head";
import Image from "next/image";
import homeStyles from "../../styles/Home.module.css";
import DashBoardLayout from "../../components/layouts/DashBoard.layout";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFetch } from "../../context/FetchContext.js";
import Popup from "../../components/Popup.component.jsx";
import jwt from "jsonwebtoken";
import { Request } from "../../types/request.type";
import InfoBox from "../../components/InfoBox.component";
import { useWallet } from "../../context/WalletContext";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { useAuthentification } from "../../context/AuthContext";
import Button from "../../components/Button.component";

export default function DetailAction(req: Request) {
  const [logo, setLogo] = useState("");
  const [data, setData] = useState([] as any);
  const [isOpen, setIsOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [maxCount, setMaxCount] = useState(0);
  const [detail, setDetail] = useState({} as any);
  const [chartReady, setChartReady] = useState(false);
  const { user, isAuthenticated } = useAuthentification();
  const [dataCleaned, setDataCleaned] = useState({
    name: "-",
    market_cap: "-",
    number: "-",
    prix: "-",
  });
  
  // Charger le module d'exportation
  useEffect(() => {
    const loadExporting = async () => {
      if (typeof window !== "undefined") {
        try {
          const exportingModule = await import("highcharts/modules/exporting");
          // Appeler la fonction d'initialisation en utilisant any pour éviter l'erreur TypeScript
          (exportingModule.default as any)(Highcharts);
          setChartReady(true);
        } catch (err) {
          console.log("Module exporting non chargé:", err);
          // Le graphique fonctionnera quand même sans le module d'exportation
          setChartReady(true);
        }
      }
    };
    
    loadExporting();
  }, []);
  
  const router = useRouter();
  const { wallets, selectedId, selectWallet, assetsCached, getPrice } =
    useWallet();
  const { nameAction } = router.query;
  
  var floor = Math.floor,
    abs = Math.abs,
    log = Math.log,
    round = Math.round,
    min = Math.min;
  var abbrev = ["K", "M", "B"];

  function rnd(n: number, precision: number) {
    var prec = 10 ** precision;
    return round(n * prec) / prec;
  }

  function format(n: number) {
    var base = floor(log(abs(n)) / log(1000));
    var suffix = abbrev[min(abbrev.length - 1, base - 1)];
    base = abbrev.indexOf(suffix) + 1;
    return suffix ? rnd(n / 1000 ** base, 2) + suffix : "" + n;
  }

  const fetch = useFetch();

  async function fetchDetail(symbol: string) {
    try {
      const response = await fetch.get("/api/stock/detail?symbol=" + symbol);
      let data = response;
      let urlToPass = data["results"]?.branding?.logo_url;
      fetchLogo(urlToPass);
      const price = await getPrice(symbol);
      return setDetail({ ...data["results"], price });
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchLogo(url: string) {
    const logo = await fetch.get("/api/stock/getLogo?url=" + url, true);
    setLogo(logo);
  }

  useEffect(() => {
    if (!detail) return;

    if (detail[0]) {
      setDataCleaned({
        name: detail[0].name,
        market_cap: "",
        number: "",
        prix: String(detail[0].price),
      });
    } else {
      setDataCleaned({
        name: detail.name,
        market_cap: format(detail.market_cap),
        number: format(detail.weighted_shares_outstanding),
        prix: String(
          (Number(detail.market_cap) / Number(detail.number)).toFixed(2)
        ),
      });
    }
  }, [detail]);

  function fetchData(symbol: string, time: string) {
    return fetch
      .get("/api/stock/info?symbol=" + symbol)
      .then((response) => {
        return response;
      })
      .then((data) => setData(data))
      .catch((error) => {
        console.log(error);
      });
  }

  let options = {};

  if (typeof data["queryCount"] !== "undefined" && data["queryCount"] > 0) {
    var donneesFinancieres;
    donneesFinancieres = data["results"];
    let list = [] as any;

    if (
      typeof donneesFinancieres !== "undefined" &&
      donneesFinancieres.length > 0
    ) {
      for (let i = 0; i < donneesFinancieres.length; i++) {
        list.push([donneesFinancieres[i].t, donneesFinancieres[i].c]);
      }
    }

    options = {
      chart: {
        height: 600,
      },
      title: {
        text: "Graphique : " + nameAction,
      },
      series: [
        {
          data: list,
          name: "prix",
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              chart: {
                height: 300,
              },
              subtitle: {
                text: null,
              },
              navigator: {
                enabled: false,
              },
            },
          },
        ],
      },
    };
  }

  useEffect(() => {
    if (user && isAuthenticated && nameAction) {
      fetchData(nameAction as string, "1d");
      fetchDetail(nameAction as string);
    }
  }, [router, isAuthenticated, user]);

  return (
    <>
      <Head>
        <title>InvestTrade - Home</title>
        <meta name="description" content="Page d'accueil" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon3.ico" />
      </Head>
      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.headerContainer}>
          <div className={homeStyles.infoBoxContainer}>
            <InfoBox
              title={`Cash portefeuille n°${selectedId + 1}`}
              desc={
                typeof wallets !== "undefined" && wallets.length > 0
                  ? (wallets[selectedId]?.cash || 0).toFixed(2) + " $"
                  : "$"
              }
              icon="/assets/wallet.svg" 
            />
          </div>
          <div className={homeStyles.titleContainer}>
            <Button
              title={"Acheter"}
              onClick={() => {
                setIsOpen(!isOpen);
                setSymbol(nameAction as string);
              }}
            />
          </div>
        </div>
        <div className={homeStyles.chartContainer}>
          <div className={homeStyles.chartHeaderContainer}>
            <div className={homeStyles.logoName}>
              <h1>{dataCleaned.name}</h1>
            </div>
            <div>
              <p className={homeStyles.priceText}>{detail.price}$</p>
            </div>
          </div>
          <div className={homeStyles.plotContainer}>
            {chartReady && (
              <HighchartsReact
                containerProps={{ style: { width: "90%" } }}
                highcharts={Highcharts}
                constructorType={"stockChart"}
                options={options}
              />
            )}
          </div>

          <div className={homeStyles.buyContainer}>
            <p>
              {dataCleaned.market_cap && dataCleaned.market_cap !== undefined
                ? "Capitalisation boursière :"
                : ""}{" "}
              <br />{" "}
              {dataCleaned.market_cap && dataCleaned.market_cap !== undefined
                ? format(dataCleaned.market_cap as unknown as number)
                : ""}
            </p>
            <p>
              {dataCleaned.number && dataCleaned.number !== undefined
                ? "Actions en circulations :"
                : ""}{" "}
              <br />
              {dataCleaned.number && dataCleaned.number !== undefined
                ? format(dataCleaned.number as unknown as number)
                : ""}
            </p>
          </div>
        </div>
        <Popup
          title="Acheter"
          subtitle="Achat"
          maxCount={Number(
            ((wallets[selectedId]?.cash || 0) / detail.price).toFixed(1)
          )}
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