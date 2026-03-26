import Head from "next/head";
import homeStyles from "../styles/Home.module.css";
import legalStyles from "../styles/Legal.module.css";
import DashBoardLayout from "../components/layouts/DashBoard.layout";

export default function Confidentialite() {
  return (
    <>
      <Head>
        <title>Invest Days - Politique de Confidentialité</title>
        <link rel="icon" href="/favicon3.ico" />
      </Head>

      <main className={homeStyles.pageContainer}>

        <div className={homeStyles.welcomeSection}>
          <div>
            <h1 className={homeStyles.marketTitle}>Confidentialité</h1>
            <p className={homeStyles.marketSub}>Comment nous protégeons vos données personnelles au Garage Isep.</p>
          </div>
        </div>

        <div className={legalStyles.legalContent}>
          <section className={legalStyles.section}>
            <h2>1. Responsable du traitement</h2>
            <p>
              Garage Isep — Association loi 1901 – R.N.A : W751249825
            </p>
            <p>Siège social : 28 Rue Notre-Dame des Champs, 75006 Paris, France</p>
            <p>Email : <strong>investdays@garageisep.com</strong></p>
          </section>

          <section className={legalStyles.section}>
            <h2>2. Données personnelles collectées</h2>
            <p>Les données suivantes peuvent être collectées :</p>
            <ul>
              <li><strong>Données d'identification :</strong> prénom, nom, email institutionnel Isep, identifiant utilisateur.</li>
              <li><strong>Données techniques :</strong> IP, logs de connexion, logs applicatifs.</li>
            </ul>
            <p>
              Aucun mot de passe utilisateur n'est stocké par Invest Days (authentification CAS), sauf pour les partenaires.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>3. Finalités du traitement</h2>
            <ul>
              <li>Fournir et gérer l'accès à Invest Days.</li>
              <li>Assurer la sécurité et prévenir les abus.</li>
              <li>Surveiller performances et stabilité.</li>
              <li>Respect des obligations légales.</li>
            </ul>
          </section>

          <section className={legalStyles.section}>
            <h2>4. Base légale du traitement</h2>
            <ul>
              <li>Intérêt légitime (article 6.1.f RGPD).</li>
              <li>Obligations légales (article 6.1.c RGPD).</li>
            </ul>
          </section>

          <section className={legalStyles.section}>
            <h2>5. Durée de conservation des données</h2>
            <ul>
              <li><strong>Données de compte :</strong> durée d'utilisation du service.</li>
              <li><strong>Logs :</strong> 12 mois maximum.</li>
            </ul>
          </section>

          <section className={legalStyles.section}>
            <h2>6. Destinataires des données</h2>
            <p>
              Membres habilités de l'équipe Invest Days et administrateurs techniques strictement nécessaires.
              Les données ne sont ni vendues ni cédées.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>7. Hébergement des données</h2>
            <p>
              Hébergement en France / UE. Mesures techniques et organisationnelles pour garantir sécurité et confidentialité.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>8. Droits des utilisateurs</h2>
            <p>
              Droit d'accès, rectification, effacement, limitation, opposition, portabilité.
            </p>
            <p>
              Contact : <strong>investdays@garageisep.com</strong> — réponse sous 30 jours.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>9. Cookies et traceurs</h2>
            <p>
              Utilisation uniquement de cookies strictement nécessaires. Aucun cookie publicitaire ou de traçage commercial.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>10. Modification de la politique</h2>
            <p>
              Garage Isep peut modifier cette politique à tout moment. Les utilisateurs sont informés via les canaux suivants :
            </p>
            <ul>
              <li>Groupe WhatsApp de l'événement.</li>
              <li>Serveur Discord de l'événement.</li>
            </ul>
          </section>

          <section className={legalStyles.section}>
            <h2>11. Réclamation CNIL</h2>
            <p>
              Commission Nationale de l'Informatique et des Libertés (CNIL) –{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

Confidentialite.getLayout = function getLayout(page: any) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};