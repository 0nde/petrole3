/**
 * Rich pedagogical intelligence for each preset scenario.
 * Shows which chokepoints are involved, which flows transit through them,
 * which exporters and importers are directly affected, and the real-world
 * geopolitical context.
 */

export interface ScenarioIntel {
  /** Match key: first action's target_id + action_type (for multi-action: scenario name fragment) */
  matchKey: string;
  transitVolume: { en: string; fr: string };
  affectedExporters: { en: string[]; fr: string[] };
  affectedImporters: { en: string[]; fr: string[] };
  keyFlows: { en: string[]; fr: string[] };
  geopoliticalContext: { en: string; fr: string };
  whyItMatters: { en: string; fr: string };
}

export const scenarioIntelligence: Record<string, ScenarioIntel> = {
  "hormuz_full": {
    matchKey: "hormuz_full",
    transitVolume: {
      en: "~21 Mb/d transit — 20% of world oil consumption",
      fr: "~21 Mb/j en transit — 20 % de la consommation mondiale",
    },
    affectedExporters: {
      en: ["Saudi Arabia (5.6 Mb/d)", "Iraq (3.4 Mb/d)", "UAE (2.5 Mb/d)", "Kuwait (1.9 Mb/d)", "Qatar (1.3 Mb/d)", "Iran (1.2 Mb/d)", "Oman (0.8 Mb/d)"],
      fr: ["Arabie saoudite (5,6 Mb/j)", "Irak (3,4 Mb/j)", "EAU (2,5 Mb/j)", "Koweït (1,9 Mb/j)", "Qatar (1,3 Mb/j)", "Iran (1,2 Mb/j)", "Oman (0,8 Mb/j)"],
    },
    affectedImporters: {
      en: ["China (loses ~4 Mb/d Gulf crude)", "Japan (loses ~2 Mb/d — 90% of imports)", "South Korea (loses ~1.5 Mb/d)", "India (loses ~2.5 Mb/d)", "France (loses Gulf + Suez flows)", "Germany, Italy, Spain (Med route cut)"],
      fr: ["Chine (perd ~4 Mb/j de brut du Golfe)", "Japon (perd ~2 Mb/j — 90 % de ses imports)", "Corée du Sud (perd ~1,5 Mb/j)", "Inde (perd ~2,5 Mb/j)", "France (perd les flux Golfe + Suez)", "Allemagne, Italie, Espagne (route Med coupée)"],
    },
    keyFlows: {
      en: ["SAU→CHN 1.58 Mb/d via Hormuz+Malacca: BLOCKED", "SAU→JPN 0.95 Mb/d via Hormuz+Malacca: BLOCKED", "IRQ→IND 0.98 Mb/d via Hormuz: BLOCKED", "SAU→FRA 0.07 Mb/d via Hormuz+Suez: BLOCKED", "Pipeline bypass: SAU East-West pipeline can divert ~4.7 Mb/d"],
      fr: ["SAU→CHN 1,58 Mb/j via Ormuz+Malacca : BLOQUÉ", "SAU→JPN 0,95 Mb/j via Ormuz+Malacca : BLOQUÉ", "IRQ→IND 0,98 Mb/j via Ormuz : BLOQUÉ", "SAU→FRA 0,07 Mb/j via Ormuz+Suez : BLOQUÉ", "Contournement : pipeline Est-Ouest saoudien peut dévier ~4,7 Mb/j"],
    },
    geopoliticalContext: {
      en: "The Strait of Hormuz is a 33 km-wide passage between Iran and Oman. Iran has repeatedly threatened to close it in response to sanctions. 89% of crude transiting Hormuz goes to Asian markets. The US Fifth Fleet is based in Bahrain to secure this strait.",
      fr: "Le détroit d'Ormuz est un passage de 33 km entre l'Iran et Oman. L'Iran a menacé à plusieurs reprises de le fermer en réponse aux sanctions. 89 % du brut transitant par Ormuz va vers les marchés asiatiques. La 5e flotte US est basée à Bahreïn pour sécuriser ce détroit.",
    },
    whyItMatters: {
      en: "No viable alternative route exists for the full volume. Saudi Arabia's East-West pipeline can bypass ~4.7 Mb/d, but 16+ Mb/d would be stranded. Oil prices would likely triple within days.",
      fr: "Aucune route alternative viable n'existe pour le volume total. Le pipeline Est-Ouest saoudien peut contourner ~4,7 Mb/j, mais 16+ Mb/j seraient bloqués. Les prix du pétrole tripleraient probablement en quelques jours.",
    },
  },

  "hormuz_partial": {
    matchKey: "hormuz_partial",
    transitVolume: {
      en: "50% disruption → ~10.5 Mb/d blocked of 21 Mb/d transit",
      fr: "Perturbation 50 % → ~10,5 Mb/j bloqués sur 21 Mb/j en transit",
    },
    affectedExporters: {
      en: ["All Gulf exporters at 50% capacity", "Saudi Arabia still exports ~2.8 Mb/d (vs 5.6)"],
      fr: ["Tous les exportateurs du Golfe à 50 % de capacité", "L'Arabie saoudite exporte encore ~2,8 Mb/j (vs 5,6)"],
    },
    affectedImporters: {
      en: ["Japan, South Korea: severe impact (90%+ of imports via Hormuz)", "China: loses ~2 Mb/d Gulf crude", "Europe: partial loss via Suez route"],
      fr: ["Japon, Corée du Sud : impact sévère (90 %+ des imports via Ormuz)", "Chine : perd ~2 Mb/j de brut du Golfe", "Europe : perte partielle via route Suez"],
    },
    keyFlows: {
      en: ["All Hormuz flows reduced by 50%", "Realistic scenario: mine threats, military tensions, insurance costs skyrocket"],
      fr: ["Tous les flux Ormuz réduits de 50 %", "Scénario réaliste : menaces de mines, tensions militaires, coûts d'assurance en flèche"],
    },
    geopoliticalContext: {
      en: "A partial disruption is more likely than full blockade. In 2019, Iran seized tankers and attacked vessels near Hormuz, causing insurance premiums to spike 10x. Even a 50% reduction would trigger a global supply crisis.",
      fr: "Une perturbation partielle est plus probable qu'un blocage total. En 2019, l'Iran a saisi des tankers et attaqué des navires près d'Ormuz, faisant exploser les primes d'assurance ×10. Même une réduction de 50 % déclencherait une crise d'approvisionnement mondiale.",
    },
    whyItMatters: {
      en: "Insurance costs alone can effectively halt shipping — no full military blockade needed. War risk premiums jumped from 0.05% to 0.5% of hull value during 2019 tensions.",
      fr: "Les coûts d'assurance seuls peuvent stopper le trafic — pas besoin de blocage militaire total. Les primes de risque de guerre sont passées de 0,05 % à 0,5 % de la valeur de la coque lors des tensions de 2019.",
    },
  },

  "bab_el_mandeb": {
    matchKey: "bab_el_mandeb",
    transitVolume: {
      en: "~4.2 Mb/d transit (halved since 2023 due to Houthi attacks)",
      fr: "~4,2 Mb/j en transit (divisé par 2 depuis 2023 à cause des attaques houthies)",
    },
    affectedExporters: {
      en: ["Gulf exporters to Europe via Suez (SAU, IRQ, ARE)", "Russia (largest Suez crude exporter since 2022, targeting India)"],
      fr: ["Exportateurs du Golfe vers l'Europe via Suez (SAU, IRQ, EAU)", "Russie (1er exportateur de brut via Suez depuis 2022, vers l'Inde)"],
    },
    affectedImporters: {
      en: ["European importers: France, Italy, Spain, Netherlands, Belgium, Germany", "Ships reroute via Cape of Good Hope (+10 days, +$1M per voyage)"],
      fr: ["Importateurs européens : France, Italie, Espagne, Pays-Bas, Belgique, Allemagne", "Les navires se déroutent via le Cap (+10 jours, +1M$ par voyage)"],
    },
    keyFlows: {
      en: ["SAU→FRA/ITA/ESP via Hormuz+Bab+Suez: BLOCKED", "IRQ→ITA/GRC/ESP/NLD: BLOCKED", "Alternative: reroute via Cape of Good Hope adds 6,000 nautical miles"],
      fr: ["SAU→FRA/ITA/ESP via Ormuz+Bab+Suez : BLOQUÉ", "IRQ→ITA/GRC/ESP/NLD : BLOQUÉ", "Alternative : déroutement via le Cap ajoute 6 000 miles nautiques"],
    },
    geopoliticalContext: {
      en: "Since November 2023, Yemen-based Houthi militants have attacked commercial ships in the Red Sea, halving Bab el-Mandeb traffic. Russian ships have been largely spared from attacks. The EU's EUNAVFOR Aspides and the US-led Operation Prosperity Guardian patrol the area.",
      fr: "Depuis novembre 2023, les militants houthis du Yémen attaquent les navires commerciaux en mer Rouge, divisant par deux le trafic de Bab el-Mandeb. Les navires russes ont été largement épargnés. EUNAVFOR Aspides (UE) et l'opération Prosperity Guardian (US) patrouillent la zone.",
    },
    whyItMatters: {
      en: "This is not hypothetical — it's happening NOW. Rerouting via Cape adds 10+ days and $1M+ per voyage, raising consumer prices for fuel and goods worldwide.",
      fr: "Ce n'est pas hypothétique — c'est en cours MAINTENANT. Le déroutement via le Cap ajoute 10+ jours et 1M$+ par voyage, augmentant les prix du carburant et des biens dans le monde entier.",
    },
  },

  "malacca": {
    matchKey: "malacca",
    transitVolume: {
      en: "~16 Mb/d transit — primary route for Middle East oil to East Asia",
      fr: "~16 Mb/j en transit — route principale du pétrole moyen-oriental vers l'Asie de l'Est",
    },
    affectedExporters: {
      en: ["All Gulf exporters to East Asia (SAU, IRQ, ARE, KWT, QAT, OMN)", "Singapore (refining hub, 1.5 Mb/d capacity)"],
      fr: ["Tous les exportateurs du Golfe vers l'Asie de l'Est (SAU, IRQ, EAU, KWT, QAT, OMN)", "Singapour (hub de raffinage, 1,5 Mb/j de capacité)"],
    },
    affectedImporters: {
      en: ["China (catastrophic — 60%+ of oil imports via Malacca)", "Japan (devastating — almost all oil via Malacca)", "South Korea, Taiwan, Thailand, Vietnam, Philippines, Indonesia"],
      fr: ["Chine (catastrophique — 60 %+ des imports de pétrole via Malacca)", "Japon (dévastateur — quasi tout le pétrole via Malacca)", "Corée du Sud, Taïwan, Thaïlande, Vietnam, Philippines, Indonésie"],
    },
    keyFlows: {
      en: ["SAU→CHN 1.58 Mb/d: BLOCKED", "SAU→JPN 0.95 Mb/d: BLOCKED", "IRQ→CHN 1.10 Mb/d: BLOCKED", "Singapore refining 1.5 Mb/d → exports to AUS, IDN, VNM, PHL: BLOCKED"],
      fr: ["SAU→CHN 1,58 Mb/j : BLOQUÉ", "SAU→JPN 0,95 Mb/j : BLOQUÉ", "IRQ→CHN 1,10 Mb/j : BLOQUÉ", "Raffinage Singapour 1,5 Mb/j → exports vers AUS, IDN, VNM, PHL : BLOQUÉ"],
    },
    geopoliticalContext: {
      en: "The Strait of Malacca (2.5 km wide at narrowest) sits between Malaysia, Indonesia, and Singapore. China calls its dependence on Malacca the 'Malacca Dilemma' — Beijing is building pipelines through Myanmar and Pakistan (CPEC) to bypass it.",
      fr: "Le détroit de Malacca (2,5 km au plus étroit) se situe entre la Malaisie, l'Indonésie et Singapour. La Chine appelle sa dépendance à Malacca le « dilemme de Malacca » — Pékin construit des pipelines via le Myanmar et le Pakistan (CPEC) pour le contourner.",
    },
    whyItMatters: {
      en: "A Malacca blockade would devastate Asian economies. China imports 70% of its oil, and most of it transits Malacca. Japan imports 99% of its oil — Malacca is an existential threat.",
      fr: "Un blocage de Malacca dévasterait les économies asiatiques. La Chine importe 70 % de son pétrole, et la majorité transite par Malacca. Le Japon importe 99 % de son pétrole — Malacca est une menace existentielle.",
    },
  },

  "russian_embargo_europe": {
    matchKey: "russian_embargo_europe",
    transitVolume: {
      en: "Russia exports ~0.5 Mb/d to European countries in our model",
      fr: "La Russie exporte ~0,5 Mb/j vers les pays européens dans notre modèle",
    },
    affectedExporters: {
      en: ["Russia (all European export flows cut)", "Cascade: countries dependent on Druzhba pipeline (Hungary, Czech Republic, Poland)"],
      fr: ["Russie (tous les flux d'export vers l'Europe coupés)", "Cascade : pays dépendants du pipeline Druzhba (Hongrie, Tchéquie, Pologne)"],
    },
    affectedImporters: {
      en: ["Hungary (Druzhba south branch — EU exemption)", "Czech Republic (Druzhba pipeline)", "Turkey (Black Sea route via Bosphorus)", "Germany (Rosneft Schwedt refinery)"],
      fr: ["Hongrie (branche sud Druzhba — exemption UE)", "Tchéquie (pipeline Druzhba)", "Turquie (route Mer Noire via Bosphore)", "Allemagne (raffinerie Rosneft Schwedt)"],
    },
    keyFlows: {
      en: ["RUS→HUN 0.07 Mb/d via Druzhba: CUT", "RUS→CZE 0.04 via Druzhba: CUT", "RUS→TUR 0.30 via Bosphorus: CUT", "RUS→DEU 0.12 via Baltic: CUT"],
      fr: ["RUS→HUN 0,07 Mb/j via Druzhba : COUPÉ", "RUS→CZE 0,04 via Druzhba : COUPÉ", "RUS→TUR 0,30 via Bosphore : COUPÉ", "RUS→DEU 0,12 via Baltique : COUPÉ"],
    },
    geopoliticalContext: {
      en: "Since February 2022, the EU has imposed a price cap ($60/barrel) on Russian seaborne oil and banned most Russian crude imports. Hungary and Czech Republic obtained temporary exemptions for Druzhba pipeline oil. Russia has redirected most exports to India and China at discounted prices.",
      fr: "Depuis février 2022, l'UE a imposé un plafond de prix (60 $/baril) sur le pétrole russe maritime et interdit la plupart des importations de brut russe. La Hongrie et la Tchéquie ont obtenu des exemptions temporaires pour le pipeline Druzhba. La Russie a redirigé la majorité de ses exports vers l'Inde et la Chine à prix réduit.",
    },
    whyItMatters: {
      en: "This scenario already partially happened. The EU embargo has reshaped global oil trade: Russian crude now flows to India (1.70 Mb/d, up from near zero pre-2022) and India re-exports refined products to Europe.",
      fr: "Ce scénario s'est déjà partiellement réalisé. L'embargo européen a reconfiguré le commerce mondial du pétrole : le brut russe va désormais vers l'Inde (1,70 Mb/j, parti de quasi zéro avant 2022) et l'Inde ré-exporte des produits raffinés vers l'Europe.",
    },
  },

  "saudi_production": {
    matchKey: "saudi_production",
    transitVolume: {
      en: "Saudi Arabia produces 9.6 Mb/d — a 40% collapse = -3.84 Mb/d",
      fr: "L'Arabie saoudite produit 9,6 Mb/j — un effondrement de 40 % = -3,84 Mb/j",
    },
    affectedExporters: {
      en: ["Saudi Arabia: production drops from 9.6 to 5.76 Mb/d", "Cascading: less Saudi crude available for all buyers"],
      fr: ["Arabie saoudite : production chute de 9,6 à 5,76 Mb/j", "Cascade : moins de brut saoudien disponible pour tous les acheteurs"],
    },
    affectedImporters: {
      en: ["China (Saudi's #1 buyer, 1.58 Mb/d)", "Japan (0.95 Mb/d)", "India (0.78 Mb/d)", "South Korea (0.72 Mb/d)", "All European importers of Saudi crude"],
      fr: ["Chine (1er acheteur, 1,58 Mb/j)", "Japon (0,95 Mb/j)", "Inde (0,78 Mb/j)", "Corée du Sud (0,72 Mb/j)", "Tous les importateurs européens de brut saoudien"],
    },
    keyFlows: {
      en: ["All SAU export flows proportionally reduced", "Domestic priority kicks in: SAU reserves 30% for domestic use first"],
      fr: ["Tous les flux d'export SAU réduits proportionnellement", "Priorité domestique : l'Arabie saoudite réserve 30 % pour l'usage domestique d'abord"],
    },
    geopoliticalContext: {
      en: "In September 2019, drone and missile attacks on Saudi Aramco's Abqaiq and Khurais facilities temporarily knocked out 5.7 Mb/d (50% of Saudi output). Oil prices spiked 15% overnight. The scenario simulates a larger-scale version of this attack.",
      fr: "En septembre 2019, des attaques de drones et missiles sur les installations saoudiennes d'Abqaiq et Khurais ont temporairement mis hors service 5,7 Mb/j (50 % de la production saoudienne). Les prix du pétrole ont bondi de 15 % en une nuit. Ce scénario simule une version à plus grande échelle de cette attaque.",
    },
    whyItMatters: {
      en: "Saudi Arabia holds the world's largest spare production capacity (~2-3 Mb/d). A major attack that neutralizes this spare capacity would remove the global market's safety valve.",
      fr: "L'Arabie saoudite détient la plus grande capacité de production excédentaire au monde (~2-3 Mb/j). Une attaque majeure qui neutralise cette capacité retirerait la soupape de sécurité du marché mondial.",
    },
  },

  "combined_gulf": {
    matchKey: "combined_gulf",
    transitVolume: {
      en: "Multi-shock: Hormuz 80% blocked + Saudi -30% + global reserve release",
      fr: "Multi-chocs : Ormuz bloqué à 80 % + Saoudiens -30 % + libération mondiale des réserves",
    },
    affectedExporters: {
      en: ["All Gulf exporters at 20% capacity through Hormuz", "Saudi Arabia further reduced by 30% production collapse", "Reserve releases from USA (4.4 Mb/d), Japan (1.5), Korea (0.7), China (0.5)"],
      fr: ["Tous les exportateurs du Golfe à 20 % de capacité via Ormuz", "Arabie saoudite en plus réduite de 30 % par effondrement de production", "Libération de réserves : USA (4,4 Mb/j), Japon (1,5), Corée (0,7), Chine (0,5)"],
    },
    affectedImporters: {
      en: ["Every oil-importing country on the planet", "Asia: catastrophic impact (Japan, Korea, China, India)", "Europe: severe impact via Suez route loss"],
      fr: ["Chaque pays importateur de pétrole sur la planète", "Asie : impact catastrophique (Japon, Corée, Chine, Inde)", "Europe : impact sévère via perte de la route Suez"],
    },
    keyFlows: {
      en: ["80% of Hormuz flows cut → ~17 Mb/d disrupted", "Saudi production drops 30% on top → compound effect", "Strategic reserves provide temporary buffer (~7 Mb/d globally)"],
      fr: ["80 % des flux Ormuz coupés → ~17 Mb/j perturbés", "Production saoudienne chute de 30 % en plus → effet composé", "Les réserves stratégiques fournissent un tampon temporaire (~7 Mb/j mondial)"],
    },
    geopoliticalContext: {
      en: "This worst-case Gulf scenario combines a major maritime blockade with infrastructure attacks, like a full-scale regional war. Strategic reserves would buy ~90 days for major economies, after which prices would spiral uncontrollably.",
      fr: "Ce scénario catastrophe du Golfe combine un blocage maritime majeur avec des attaques d'infrastructure, comme une guerre régionale totale. Les réserves stratégiques achèteraient ~90 jours aux grandes économies, après quoi les prix spirateraient de manière incontrôlable.",
    },
    whyItMatters: {
      en: "This tests global resilience. Even with massive reserve releases, the world cannot sustain the loss of 17+ Mb/d for more than a few months. The 1973 oil crisis involved only a 5 Mb/d reduction.",
      fr: "Cela teste la résilience mondiale. Même avec des libérations massives de réserves, le monde ne peut pas supporter la perte de 17+ Mb/j pendant plus de quelques mois. La crise de 1973 n'impliquait qu'une réduction de 5 Mb/j.",
    },
  },

  "suez_bab": {
    matchKey: "suez_bab",
    transitVolume: {
      en: "~4.9 Mb/d via Suez + ~4.2 Mb/d via Bab el-Mandeb (some overlap)",
      fr: "~4,9 Mb/j via Suez + ~4,2 Mb/j via Bab el-Mandeb (chevauchement partiel)",
    },
    affectedExporters: {
      en: ["Gulf exporters to Europe (SAU, IRQ, ARE via Suez)", "Russia to India (Black Sea→Bosphorus→Suez route, 0.5 Mb/d)"],
      fr: ["Exportateurs du Golfe vers l'Europe (SAU, IRQ, EAU via Suez)", "Russie vers l'Inde (route Mer Noire→Bosphore→Suez, 0,5 Mb/j)"],
    },
    affectedImporters: {
      en: ["All European Med importers (France, Italy, Spain, Greece)", "Baltic importers for Gulf crude (Poland, Finland via Danish Straits)"],
      fr: ["Tous les importateurs méditerranéens (France, Italie, Espagne, Grèce)", "Importateurs baltes de brut du Golfe (Pologne, Finlande via Danish Straits)"],
    },
    keyFlows: {
      en: ["All pg_europe_suez flows: BLOCKED (12 flows, ~1.35 Mb/d)", "All pg_europe_baltic flows: BLOCKED (Gulf→Baltic via Suez, ~0.17 Mb/d)", "Reroute via Cape adds 10-15 days to European deliveries"],
      fr: ["Tous les flux pg_europe_suez : BLOQUÉS (12 flux, ~1,35 Mb/j)", "Tous les flux pg_europe_baltic : BLOQUÉS (Golfe→Balte via Suez, ~0,17 Mb/j)", "Le déroutement via le Cap ajoute 10-15 jours aux livraisons européennes"],
    },
    geopoliticalContext: {
      en: "The Suez Canal alone generates $9.4B/year in revenue for Egypt. In 2021, the Ever Given container ship blocked Suez for 6 days, costing $9.6B in daily trade. Combined with Houthi attacks at Bab el-Mandeb, the entire Red Sea shortcut becomes unusable.",
      fr: "Le canal de Suez seul génère 9,4 Mds$/an de revenus pour l'Égypte. En 2021, le porte-conteneurs Ever Given a bloqué Suez pendant 6 jours, coûtant 9,6 Mds$ en commerce quotidien. Combiné aux attaques houthies à Bab el-Mandeb, tout le raccourci de la mer Rouge devient inutilisable.",
    },
    whyItMatters: {
      en: "This forces ALL Europe-Asia trade around the Cape of Good Hope, adding 6,000+ nautical miles. Shipping costs spike, delivery times double, and fuel consumption increases dramatically.",
      fr: "Cela force TOUT le commerce Europe-Asie à contourner par le Cap de Bonne-Espérance, ajoutant 6 000+ miles nautiques. Les coûts de transport explosent, les délais doublent, et la consommation de carburant augmente dramatiquement.",
    },
  },

  "bosphorus_nigeria": {
    matchKey: "bosphorus_nigeria",
    transitVolume: {
      en: "Bosphorus: ~2.4 Mb/d + Nigeria: -0.77 Mb/d production loss",
      fr: "Bosphore : ~2,4 Mb/j + Nigéria : -0,77 Mb/j de perte de production",
    },
    affectedExporters: {
      en: ["Russia via Black Sea (RUS→TUR, 0.48 Mb/d)", "Kazakhstan/Azerbaijan via CPC/BTC pipeline (KAZ→EU, AZE→EU)", "Nigeria: all exports halved (0.77 Mb/d lost)"],
      fr: ["Russie via Mer Noire (RUS→TUR, 0,48 Mb/j)", "Kazakhstan/Azerbaïdjan via pipelines CPC/BTC (KAZ→UE, AZE→UE)", "Nigéria : tous les exports divisés par 2 (0,77 Mb/j perdus)"],
    },
    affectedImporters: {
      en: ["Turkey (loses Black Sea imports)", "Italy (loses CPC/BTC Caspian crude + Nigerian crude)", "Germany (loses Kazakh crude via Bosphorus)", "France (loses Nigerian crude, 12% of imports)"],
      fr: ["Turquie (perd les imports Mer Noire)", "Italie (perd le brut caspien CPC/BTC + brut nigérian)", "Allemagne (perd le brut kazakh via Bosphore)", "France (perd le brut nigérian, 12 % des imports)"],
    },
    keyFlows: {
      en: ["RUS→TUR 0.30+0.18 via Bosphorus: BLOCKED", "KAZ→DEU/ITA/FRA/NLD via CPC+Bosphorus: BLOCKED", "NGA→FRA/ESP/IND/NLD/ITA all halved"],
      fr: ["RUS→TUR 0,30+0,18 via Bosphore : BLOQUÉ", "KAZ→DEU/ITA/FRA/NLD via CPC+Bosphore : BLOQUÉ", "NGA→FRA/ESP/IND/NLD/ITA tous divisés par 2"],
    },
    geopoliticalContext: {
      en: "The Turkish Straits (Bosphorus + Dardanelles) are governed by the 1936 Montreux Convention. Turkey can restrict military vessel passage during wartime. CPC pipeline crude (Kazakhstan) exits at Novorossiysk on the Black Sea and must transit the Bosphorus to reach Mediterranean markets.",
      fr: "Les détroits turcs (Bosphore + Dardanelles) sont régis par la Convention de Montreux de 1936. La Turquie peut restreindre le passage de navires militaires en temps de guerre. Le brut du pipeline CPC (Kazakhstan) sort à Novorossiysk sur la Mer Noire et doit transiter par le Bosphore pour atteindre les marchés méditerranéens.",
    },
    whyItMatters: {
      en: "Dual supply shock: Europe loses both Caspian crude (via Bosphorus) AND West African crude (Nigeria) simultaneously. Italy and France are particularly exposed to both sources.",
      fr: "Double choc d'approvisionnement : l'Europe perd simultanément le brut caspien (via Bosphore) ET le brut ouest-africain (Nigéria). L'Italie et la France sont particulièrement exposées aux deux sources.",
    },
  },
};

/**
 * Find the best matching intelligence for a scenario based on its actions.
 */
export function getScenarioIntel(scenario: { name: string; actions: { action_type: string; target_id: string; severity: number }[] }): ScenarioIntel | null {
  const a0 = scenario.actions[0];
  if (!a0) return null;

  // Multi-action scenarios: match by name pattern
  const nameLower = scenario.name.toLowerCase();
  if (nameLower.includes("combined gulf") || nameLower.includes("combinée du golfe")) return scenarioIntelligence["combined_gulf"] ?? null;
  if (nameLower.includes("suez") && nameLower.includes("bab")) return scenarioIntelligence["suez_bab"] ?? null;
  if (nameLower.includes("nigeri") && nameLower.includes("bosphorus")) return scenarioIntelligence["bosphorus_nigeria"] ?? null;

  // Single-action scenarios
  if (a0.action_type === "chokepoint_block" && a0.target_id === "hormuz") {
    return a0.severity >= 0.9
      ? scenarioIntelligence["hormuz_full"] ?? null
      : scenarioIntelligence["hormuz_partial"] ?? null;
  }
  if (a0.action_type === "chokepoint_block" && a0.target_id === "bab_el_mandeb") return scenarioIntelligence["bab_el_mandeb"] ?? null;
  if (a0.action_type === "chokepoint_block" && a0.target_id === "malacca") return scenarioIntelligence["malacca"] ?? null;
  if (a0.action_type === "embargo_targeted" && a0.target_id === "RUS") return scenarioIntelligence["russian_embargo_europe"] ?? null;
  if (a0.action_type === "production_change" && a0.target_id === "SAU") return scenarioIntelligence["saudi_production"] ?? null;

  return null;
}
