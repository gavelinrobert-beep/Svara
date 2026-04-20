import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <Link to="/" className="text-xl font-semibold text-accent-700">Svara</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12 prose">
        <h1 className="text-3xl font-bold mb-6">Integritetspolicy</h1>

        <p className="text-gray-600 mb-6">
          Senast uppdaterad: 2024-01-01
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">1. Personuppgiftsansvarig</h2>
        <p className="text-gray-700">
          [Företagsnamn AB], org.nr [XXXXXX-XXXX], [adress], är personuppgiftsansvarig för behandlingen
          av dina personuppgifter i samband med användningen av Svara-plattformen.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">2. Vilka uppgifter vi samlar in</h2>
        <p className="text-gray-700">Vi behandlar följande personuppgifter:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Namn</li>
          <li>E-postadress</li>
          <li>Telefonnummer</li>
          <li>Postadress (postnummer och ort)</li>
          <li>Beskrivning av serviceuppdrag</li>
          <li>Bilder på uppdragsplatsen (valfritt)</li>
          <li>Tidpunkt för samtycke</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">3. Ändamål och rättslig grund</h2>
        <p className="text-gray-700">
          Dina uppgifter används för att förmedla kontakt med serviceföretag, generera offertförfrågningar
          och kommunicera med dig angående ditt ärende. Den rättsliga grunden är ditt samtycke (GDPR art. 6.1.a).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">4. Lagringstid</h2>
        <p className="text-gray-700">
          Personuppgifter lagras så länge ärendet är aktivt och i upp till 24 månader därefter,
          om inte annat krävs enligt lag.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">5. Dina rättigheter</h2>
        <p className="text-gray-700">Du har rätt att:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Begära tillgång till dina personuppgifter (dataportabilitet)</li>
          <li>Begära rättelse av felaktiga uppgifter</li>
          <li>Begära radering av dina uppgifter ("rätten att bli glömd")</li>
          <li>Återkalla ditt samtycke</li>
          <li>Lämna klagomål till Integritetsskyddsmyndigheten (IMY)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">6. Kontakt</h2>
        <p className="text-gray-700">
          För frågor om hur vi behandlar dina personuppgifter, kontakta oss på:{' '}
          <a href="mailto:gdpr@svara.se" className="text-accent-600">gdpr@svara.se</a>
        </p>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link to="/" className="text-accent-600 hover:text-accent-800 text-sm">
            ← Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}
