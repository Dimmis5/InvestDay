import Head from "next/head";
import { useEffect, useState } from "react";
import { useAuthentification } from "../context/AuthContext";
import homeStyles from "../styles/Home.module.css";
import loginStyles from "../styles/Login.module.css";
import Image from "next/image";
import { useFetch } from "../context/FetchContext.js";
import { toast } from "react-toastify";
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const fetch = useFetch();
  const { login, register } = useAuthentification();

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailR, setEmailRegister] = useState("");
  const [passwordR, setPasswordRegister] = useState("");
  const [name, setName] = useState("");
  const [toggleLogin, setToggle] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      if (router.query.verified === 'true') {
        setSuccessMsg("Email vérifié avec succès ! Tu peux maintenant te connecter.");
        toast.success("Compte activé !");
      }
      if (router.query.error) {
        setError(String(router.query.error).replace(/_/g, ' '));
        toast.error("Erreur de vérification");
      }
    }
  }, [router.isReady, router.query]);

  function handleError(err: any) {
    const message = err?.response?.data?.message || "Identifiants invalides";
    setError(message);
    toast.error(message);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (email === "" || password === "")
      return setError("Veuillez remplir tous les champs");

    if (!email.includes("@")) return setError("Email invalide");

    login(fetch, email, password, handleError);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    if (emailR === "" || passwordR === "" || name === "")
      return setError("Veuillez remplir tous les champs");

    const isepIdRegex = /^\d{5}$/;
    if (!isepIdRegex.test(name)) {
      return setError("L'identifiant ISEP doit être composé de 5 chiffres");
    }

    if (!emailR.includes("@eleve.isep.fr") && !emailR.includes("@isep.fr"))
      return setError("Merci d'utiliser votre mail ISEP");

    if (passwordR.length < 8)
      return setError("Le mot de passe doit contenir au moins 8 caractères");

    const handleRegisterSuccess = () => {
        setSuccessMsg("Inscription réussie ! Un mail de confirmation a été envoyé.");
        toast.info("Vérifie tes mails ISEP !");
        setToggle(false); 
    };

    register(fetch, emailR, passwordR, name, handleRegisterSuccess, handleError);
  }

  function toggleLoginState() {
    setToggle((prevState) => !prevState);
    setError("");
    setSuccessMsg("");
  }

  return (
    <>
      <Head>
        <title>InvestDays - Connexion</title>
        <meta name="description" content="Plateforme de trading ISEP" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon3.ico" />
      </Head>
      <main className={homeStyles.pageContainer}>
        <div className={loginStyles.container}>
          <div className={loginStyles.imageDessus}>
            <Image src="/assets/INVEST.png" width={300} height={300} alt="logo" priority />
          </div>
      {successMsg && (
        <div style={{
          backgroundColor: "#fffdf2", 
          color: "#000000",           
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          textAlign: "center",
          fontSize: "0.95rem",
          fontWeight: "600",
          width: "100%",
          border: "2px solid #f3ca3e", 
          boxShadow: "0 4px 12px rgba(243, 202, 62, 0.1)"
        }}>
          <span style={{ marginRight: "10px" }}>📩</span>
          {successMsg}
        </div>
      )}

          <div className={`${loginStyles.main} ${toggleLogin ? loginStyles.active : ""}`}>
            <div className={loginStyles.login}>
              <form onSubmit={handleLogin}>
                <label onClick={toggleLoginState} className={`${toggleLogin ? loginStyles.inactive : ""}`}>
                  Connexion
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Mail ISEP"
                  autoComplete="email"
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                />
                <button type="submit" className={loginStyles.button}>
                  Connexion
                </button>
                {error && !toggleLogin && <p className={loginStyles.error}>{error}</p>}
              </form>
            </div>

            <div className={`${loginStyles.signin} ${toggleLogin ? loginStyles.active : ""}`}>
              <form onSubmit={handleRegister}>
                <label onClick={toggleLoginState} className={`${toggleLogin ? loginStyles.active : ""}`}>
                  Inscription
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Identifiant ISEP (5 chiffres)"
                />
                <input
                  value={emailR}
                  onChange={(e) => setEmailRegister(e.target.value)}
                  type="email"
                  placeholder="Mail ISEP"
                />
                <input
                  value={passwordR}
                  onChange={(e) => setPasswordRegister(e.target.value)}
                  type="password"
                  placeholder="Mot de passe (min. 8)"
                />
                <button type="submit" className={loginStyles.button}>
                  Inscription
                </button>
                {error && toggleLogin && (
                  <p className={loginStyles.error} style={{ color: "white" }}>
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center", width: "100%" }}>
             <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: "10px" }}>Powered by</p>
             <a href="https://finage.co.uk" target="_blank" rel="noreferrer">
                <img 
                  src="/assets/partners/finage_logo.svg" 
                  alt="Finage Logo" 
                  style={{ width: "180px", height: "auto", opacity: "0.7" }}
                />
             </a>
          </div>
        </div>
      </main>
    </>
  );
}