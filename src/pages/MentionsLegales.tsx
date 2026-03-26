import Head from "next/head";
import homeStyles from "../styles/Home.module.css";
import legalStyles from "../styles/Legal.module.css";
import DashBoardLayout from "../components/layouts/DashBoard.layout";

export default function MentionsLegales() {
  return (
    <>
      <Head>
        <title>Invest Days - Conditions d'Utilisation</title>
        <link rel="icon" href="/favicon3.ico" />
      </Head>

      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.welcomeSection}>
          <div>
            <h1 className={homeStyles.marketTitle}>Conditions d'Utilisation</h1>
            <p className={homeStyles.marketSub}>
              En utilisant Invest Days, vous acceptez les conditions suivantes. Veuillez les lire attentivement.
            </p>
          </div>
        </div>

        <div className={legalStyles.legalContent}>
          <section className={legalStyles.section}>
            <h2>1. Acceptation des conditions</h2>
            <p>
              En accédant à Invest Days et en déployant des applications, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.
            </p>
            <p>
              Ces conditions peuvent être modifiées à tout moment. Les modifications prendront effet immédiatement après leur publication sur cette page.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>2. Éligibilité</h2>
            <p>
              Invest Days est réservé exclusivement aux étudiants de l’Isep inscrit via le Tally avant le 29 mars 23h59 pour participation et aux partenaires pour visualisation.
            </p>
            <p>
              Vous devez disposer d'identifiants Isep ou partenaires valides pour accéder à la plateforme.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>3. Disponibilité du service</h2>
            <p>
              Garage Isep s'efforce de maintenir Invest Days disponible 24h/24 et 7j/7, mais ne peut garantir une disponibilité à 100%.
            </p>
            <p>
              Des maintenances programmées peuvent entraîner des interruptions temporaires. Nous nous efforçons de les annoncer à l'avance.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>4. Confidentialité et sécurité</h2>
            <p>
              Vos identifiants de connexion sont gérés via le système CAS de l'Isep et un système spécifique pour les partenaires. 
              Nous ne stockons pas vos mots de passe, sauf pour les partenaires.
            </p>
            <p>
              Les logs d'accès sont conservés pour des raisons de sécurité et de débogage.
            </p>
            <p>
              <strong>Note importante :</strong> Cette plateforme a un but strictement éducatif et n’est en aucun cas un conseil en investissement.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>5. Propriété intellectuelle</h2>
            <p>
              Le code source de Invest Days est l’unique propriété de Garage Isep.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>6. Résiliation</h2>
            <p>
              Garage Isep se réserve le droit de suspendre ou supprimer tout compte en cas de violation de ces conditions.
            </p>
            <p>
              En cas de fin d'études ou de départ de l'Isep, votre compte pourra être désactivé après un délai de grâce de 30 jours après la fin du concours.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>7. Contact et support</h2>
            <p>
              Pour toute question concernant ces conditions d'utilisation, contactez-nous à : 
              <a href="mailto:investdays@garageisep.com"> investdays@garageisep.com</a>
            </p>
            <p>
              Le support technique est fourni dans la mesure du possible, sans garantie de délai de réponse.
            </p>
          </section>

          <section className={legalStyles.section}>
            <h2>8. Triche et respect des règles</h2>
            <p>
              Tout manquement au règlement du concours, consultable pendant toute la durée du concours sur la page d’Accueil, mènera à une disqualification.
            </p>
            <p>
              De plus, toute triche de quelque sorte qu’elle soit est proscrite et induira une disqualification 
              (développement / implémentation / utilisation d'un bot non validé par l'équipe Invest Days).
            </p>
            <p>
              L’utilisation de tout système comme un effet de levier qui aurait été oublié lors du développement de la plateforme mènera à une disqualification.
            </p>
          </section>

          <section className={legalStyles.section}>
            <p style={{ fontStyle: 'italic', marginTop: '20px' }}>
              En utilisant Invest Days, vous confirmez avoir lu, compris et accepté ces conditions d'utilisation.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

MentionsLegales.getLayout = function getLayout(page: any) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};