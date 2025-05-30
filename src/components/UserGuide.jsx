import React, { useState } from 'react';

const UserGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const guides = [
    {
      title: "Aan de Slag",
      content: [
        "Klik op een radiozender kaart om te beginnen met luisteren",
        "Gebruik de afspeel/pauzeer knop of druk op spatiebalk om het afspelen te bedienen",
        "Pas het volume aan met de schuifregelaar in de speler bediening"
      ]
    },
    {
      title: "Reclamepauzes Instellen",
      content: [
        "Vouw de sectie 'Reclamepauze Instellingen' bovenaan uit",
        "Stel je gewenste reclamepauze minuut (wanneer) en duur (hoe lang) in",
        "Voeg een YouTube afspeellijst URL toe in het formaat: https://www.youtube.com/playlist?list=PLAYLIST_ID",
        "Klik 'Activeren' om automatische reclamepauze wisseling te activeren"
      ]
    },
    {
      title: "Hoe Reclamepauzes Werken",
      content: [
        "Wanneer het ingestelde tijdstip wordt bereikt, pauzeert je radio en start de afspeellijst",
        "Na de geconfigureerde duur stopt de afspeellijst en hervat de radio automatisch",
        "Je kunt handmatig een test reclamepauze activeren met de 'Test Reclamepauze' knop",
        "De timer herstart en gaat door met de cyclus terwijl actief"
      ]
    },
    {
      title: "Tips & Trucs",
      content: [
        "Je laatst afgespeelde zender en instellingen worden automatisch opgeslagen",
        "Gebruik toetsenbord sneltoets 'Spatiebalk' voor snel afspelen/pauzeren",
        "Zorg ervoor dat je YouTube afspeellijst openbaar is voor beste resultaten",
        "De app werkt het beste op Chrome, Firefox en Edge browsers"
      ]
    },    {
      title: "Probleemoplossing",
      content: [
        "Als een radiozender niet laadt, probeer een andere - sommige kunnen tijdelijk niet beschikbaar zijn",
        "Voor YouTube afspeellijst problemen, controleer of de URL correct is en de afspeellijst openbaar is",
        "Als audio niet afspeelt, controleer je browser's autoplay instellingen",
        "Ververs de pagina als je onverwachte problemen tegenkomt",
        "Meld niet-werkende radiozenders met de 'Melden dat deze radio niet werkt' knop bij foutmeldingen"
      ]
    },    {
      title: "Voor Ontwikkelaars",
      content: [
        "Klik driemaal snel op de rechterbovenhoek van de header om het Developer Dashboard te openen",
        "Voer het ontwikkelaarswachtwoord in wanneer daarom wordt gevraagd",
        "Bekijk gerapporteerde stations en beheer station URL/logo overrides",
        "Test station URLs direct vanuit het dashboard met de afspeel knoppen",
        "Doorzoek alle beschikbare stations en maak eenvoudig overrides aan",
        "Exporteer/importeer rapportage data voor backup doeleinden"
      ]
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-radio-accent hover:bg-radio-accent-hover text-white p-3 rounded-full shadow-lg transition-colors z-40"
        title="Open Gebruikershandleiding"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-radio-dark rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Gebruikershandleiding</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-radio-secondary hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {guides.map((guide, index) => (
              <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                <h3 className="text-lg font-semibold mb-3 text-radio-accent">
                  {guide.title}
                </h3>
                <ul className="space-y-2">
                  {guide.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-radio-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-radio-secondary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">            <p className="text-sm text-radio-secondary text-center">
              Meer hulp nodig? Bekijk het README.md bestand in de project repository.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
