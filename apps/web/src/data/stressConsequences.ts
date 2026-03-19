/** Real-world consequences for each stress level, bilingual FR/EN.
 *  Used to provide pedagogical context in simulation results. */

export interface StressConsequenceLevel {
  label: { en: string; fr: string };
  summary: { en: string; fr: string };
  consequences: { en: string[]; fr: string[] };
  historicalExample: { en: string; fr: string };
  oilPriceRange: { en: string; fr: string };
}

export const stressConsequences: Record<string, StressConsequenceLevel> = {
  stable: {
    label: { en: "Stable", fr: "Stable" },
    summary: {
      en: "The country's oil supply chain is functioning normally. Domestic demand is fully covered by production, imports, and existing contracts.",
      fr: "La chaîne d'approvisionnement pétrolier du pays fonctionne normalement. La demande intérieure est entièrement couverte par la production, les importations et les contrats existants.",
    },
    consequences: {
      en: [
        "No disruption to fuel availability at gas stations",
        "Refineries operate at normal capacity",
        "Strategic reserves remain untouched",
        "No price impact on domestic fuel market",
      ],
      fr: [
        "Aucune perturbation de la disponibilité du carburant aux stations-service",
        "Les raffineries fonctionnent à capacité normale",
        "Les réserves stratégiques restent intactes",
        "Aucun impact sur les prix du carburant domestique",
      ],
    },
    historicalExample: {
      en: "Normal market conditions, as experienced by most OECD countries in 2023.",
      fr: "Conditions de marché normales, comme vécues par la plupart des pays de l'OCDE en 2023.",
    },
    oilPriceRange: {
      en: "No additional price pressure",
      fr: "Aucune pression supplémentaire sur les prix",
    },
  },

  tension: {
    label: { en: "Tension", fr: "Tension" },
    summary: {
      en: "Supply is under pressure but still manageable. Some import routes are disrupted or reduced, but alternatives exist. Governments begin monitoring the situation closely.",
      fr: "L'approvisionnement est sous pression mais encore gérable. Certaines routes d'importation sont perturbées ou réduites, mais des alternatives existent. Les gouvernements commencent à surveiller la situation de près.",
    },
    consequences: {
      en: [
        "Fuel prices rise 10–25% at the pump",
        "Shipping costs increase — longer delivery times",
        "Governments activate emergency monitoring committees",
        "Spot market prices surge as buyers compete for available cargoes",
        "Some refineries may switch crude sources, temporarily reducing output",
        "Consumer anxiety begins — some precautionary fuel hoarding",
      ],
      fr: [
        "Les prix du carburant augmentent de 10 à 25 % à la pompe",
        "Les coûts de transport augmentent — délais de livraison plus longs",
        "Les gouvernements activent les comités de surveillance d'urgence",
        "Les prix du marché spot s'envolent car les acheteurs rivalisent pour les cargaisons disponibles",
        "Certaines raffineries changent de source de brut, réduisant temporairement la production",
        "Anxiété des consommateurs — début de stockage préventif de carburant",
      ],
    },
    historicalExample: {
      en: "Similar to the market impact during Houthi attacks on Red Sea shipping (2024): rerouting around Africa, +15% transport costs, moderate price increases.",
      fr: "Comparable à l'impact sur le marché lors des attaques houthies sur la navigation en mer Rouge (2024) : déroutement via l'Afrique, +15 % de coûts de transport, hausses de prix modérées.",
    },
    oilPriceRange: {
      en: "+$5–20/barrel above baseline",
      fr: "+5 à 20 $/baril au-dessus de la référence",
    },
  },

  critical: {
    label: { en: "Critical", fr: "Critique" },
    summary: {
      en: "Significant supply deficit. Major import routes are cut or severely reduced. The country cannot fully meet demand through normal channels and must activate emergency measures.",
      fr: "Déficit d'approvisionnement significatif. Des routes d'importation majeures sont coupées ou sévèrement réduites. Le pays ne peut pas pleinement satisfaire la demande par les canaux normaux et doit activer des mesures d'urgence.",
    },
    consequences: {
      en: [
        "Fuel prices spike 30–60% — some localized shortages appear",
        "Governments begin releasing strategic petroleum reserves (SPR)",
        "IEA may coordinate a collective reserve release among member countries",
        "Industries with high oil dependency (transport, petrochemicals) face cost crises",
        "Airlines may reduce flights; trucking companies increase surcharges",
        "Central banks face inflation pressure — interest rate dilemmas",
        "Stock markets fall sharply, especially energy-dependent sectors",
        "Diplomatic pressure intensifies to resolve the crisis",
      ],
      fr: [
        "Les prix du carburant bondissent de 30 à 60 % — des pénuries localisées apparaissent",
        "Les gouvernements commencent à libérer les réserves stratégiques de pétrole (RSP)",
        "L'AIE peut coordonner une libération collective de réserves entre pays membres",
        "Les industries à forte dépendance pétrolière (transport, pétrochimie) font face à des crises de coûts",
        "Les compagnies aériennes réduisent les vols ; les transporteurs routiers augmentent les surcharges",
        "Les banques centrales font face à une pression inflationniste — dilemme sur les taux d'intérêt",
        "Les marchés boursiers chutent fortement, surtout les secteurs dépendants de l'énergie",
        "La pression diplomatique s'intensifie pour résoudre la crise",
      ],
    },
    historicalExample: {
      en: "Comparable to the 1990 Gulf War oil shock: Iraqi invasion of Kuwait removed ~4.3 Mb/d from the market, oil prices doubled from $17 to $36/barrel, and IEA coordinated a 2.5 million barrel/day reserve release.",
      fr: "Comparable au choc pétrolier de la guerre du Golfe de 1990 : l'invasion irakienne du Koweït a retiré ~4,3 Mb/j du marché, les prix du pétrole ont doublé de 17 à 36 $/baril, et l'AIE a coordonné une libération de réserves de 2,5 millions de barils/jour.",
    },
    oilPriceRange: {
      en: "+$20–50/barrel — possible doubling of crude prices",
      fr: "+20 à 50 $/baril — doublement possible du prix du brut",
    },
  },

  emergency: {
    label: { en: "Emergency", fr: "Urgence" },
    summary: {
      en: "Severe supply crisis. The country faces acute shortages and cannot cover a large portion of its oil demand. This is a national security-level event requiring extraordinary government intervention.",
      fr: "Crise d'approvisionnement sévère. Le pays fait face à des pénuries aiguës et ne peut couvrir une grande partie de sa demande pétrolière. C'est un événement de niveau sécurité nationale nécessitant une intervention gouvernementale extraordinaire.",
    },
    consequences: {
      en: [
        "Fuel rationing implemented — purchase limits at gas stations",
        "Long queues at fuel stations; some stations run dry",
        "Governments may impose driving restrictions (odd/even license plates)",
        "Priority fuel allocation: military, emergency services, hospitals first",
        "Factory shutdowns in energy-intensive industries (chemicals, steel, glass)",
        "Massive inflation spike — food prices rise as transport costs soar",
        "Public transport capacity strained as people abandon cars",
        "Economic recession begins — GDP contraction of 2–5%",
        "Social unrest possible — protests over fuel prices and shortages",
        "International emergency diplomacy and potential military intervention to restore supply",
      ],
      fr: [
        "Rationnement du carburant mis en place — limites d'achat aux stations-service",
        "Longues files d'attente aux stations ; certaines sont à sec",
        "Les gouvernements peuvent imposer des restrictions de circulation (plaques paires/impaires)",
        "Allocation prioritaire du carburant : armée, services d'urgence, hôpitaux en premier",
        "Arrêt d'usines dans les industries énergivores (chimie, acier, verre)",
        "Pic d'inflation massif — les prix alimentaires augmentent avec les coûts de transport",
        "Capacité des transports en commun sous tension avec l'abandon des voitures",
        "Début de récession économique — contraction du PIB de 2 à 5 %",
        "Troubles sociaux possibles — manifestations contre les prix et pénuries de carburant",
        "Diplomatie d'urgence internationale et intervention militaire potentielle pour rétablir l'approvisionnement",
      ],
    },
    historicalExample: {
      en: "Similar to the 1973 Arab oil embargo: OPEC quadrupled oil prices from $3 to $12/barrel, Western nations faced fuel rationing, speed limits were imposed, Sunday driving bans enacted in several European countries, and the crisis triggered the worst recession since WWII.",
      fr: "Comparable à l'embargo pétrolier arabe de 1973 : l'OPEP a quadruplé les prix du pétrole de 3 à 12 $/baril, les nations occidentales ont subi un rationnement du carburant, des limitations de vitesse ont été imposées, des interdictions de rouler le dimanche ont été instaurées dans plusieurs pays européens, et la crise a déclenché la pire récession depuis la Seconde Guerre mondiale.",
    },
    oilPriceRange: {
      en: "+$50–150/barrel — oil prices could triple or more",
      fr: "+50 à 150 $/baril — les prix du pétrole pourraient tripler ou plus",
    },
  },
};
