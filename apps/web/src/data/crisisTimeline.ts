/** Timeline of sectoral impacts during an oil supply crisis.
 *  Based on historical crises (1973, 1979, 1990, 2024 Red Sea)
 *  and IEA/OECD analysis of petroleum dependency cascades. */

export interface SectorImpact {
  id: string;
  icon: string;
  name: { en: string; fr: string };
  oilDependency: { en: string; fr: string };
  timeline: TimelinePhase[];
}

export interface TimelinePhase {
  phase: "0-3d" | "4-14d" | "2-6w" | "2-6m" | "6m+";
  phaseLabel: { en: string; fr: string };
  severity: 0 | 1 | 2 | 3;
  impact: { en: string; fr: string };
}

const P = (phase: TimelinePhase["phase"], severity: TimelinePhase["severity"], en: string, fr: string): TimelinePhase => {
  const labels: Record<string, { en: string; fr: string }> = {
    "0-3d": { en: "0–3 days", fr: "0–3 jours" },
    "4-14d": { en: "4–14 days", fr: "4–14 jours" },
    "2-6w": { en: "2–6 weeks", fr: "2–6 semaines" },
    "2-6m": { en: "2–6 months", fr: "2–6 mois" },
    "6m+": { en: "6+ months", fr: "6+ mois" },
  };
  return { phase, phaseLabel: labels[phase]!, severity, impact: { en, fr } };
};

export const sectorImpacts: SectorImpact[] = [
  {
    id: "aviation",
    icon: "✈️",
    name: { en: "Aviation & Air Cargo", fr: "Aviation & fret aérien" },
    oilDependency: {
      en: "Jet fuel (kerosene) = 25–30% of airline operating costs. No viable alternative at scale. Global aviation uses ~8 Mb/d.",
      fr: "Le kérosène = 25 à 30 % des coûts d'exploitation des compagnies aériennes. Aucune alternative viable à grande échelle. L'aviation mondiale consomme ~8 Mb/j.",
    },
    timeline: [
      P("0-3d", 3, "Immediate fuel surcharges, some flight cancellations. Jet fuel reprices within hours on spot markets.", "Surcharges carburant immédiates, annulations de vols. Le kérosène se reprice en quelques heures sur les marchés spot."),
      P("4-14d", 3, "Airlines cut unprofitable routes, reduce frequencies. Air cargo rates double. Fresh goods (flowers, seafood, electronics) delivery disrupted.", "Les compagnies suppriment les routes non rentables, réduisent les fréquences. Les tarifs fret aérien doublent. Livraisons de biens frais perturbées."),
      P("2-6w", 2, "Ticket prices up 30–60%. Tourism industry contracts. Business travel shifts to video calls.", "Billets en hausse de 30 à 60 %. L'industrie touristique se contracte. Les voyages d'affaires basculent en visioconférence."),
      P("2-6m", 2, "Airlines request state aid or go bankrupt (as in 1973 and 2020). Airport workers laid off.", "Les compagnies demandent des aides d'État ou font faillite (comme en 1973 et 2020). Licenciements dans les aéroports."),
    ],
  },
  {
    id: "shipping",
    icon: "🚢",
    name: { en: "Maritime Shipping & Freight", fr: "Transport maritime & fret" },
    oilDependency: {
      en: "Heavy fuel oil (HFO) and marine diesel power ~60,000 cargo ships globally. 90% of world trade by volume travels by sea.",
      fr: "Le fioul lourd et le diesel marin alimentent ~60 000 navires cargo mondiaux. 90 % du commerce mondial en volume transite par mer.",
    },
    timeline: [
      P("0-3d", 3, "War-risk insurance cancelled for affected zones. Ships anchor or reroute. Tanker rates spike 200–500%.", "Assurances risque de guerre annulées pour les zones touchées. Navires à l'ancre ou déroutés. Tarifs tankers en hausse de 200 à 500 %."),
      P("4-14d", 3, "Container shipping rates triple. Port congestion as schedules collapse. Delivery times from Asia to Europe +10–15 days.", "Les tarifs conteneurs triplent. Congestion portuaire. Délais de livraison Asie-Europe +10 à 15 jours."),
      P("2-6w", 2, "Global supply chains visibly disrupted. Shortages of imported goods begin. Companies switch to air freight (at 10x cost).", "Chaînes d'approvisionnement mondiales visiblement perturbées. Pénuries de biens importés. Les entreprises passent au fret aérien (10x le coût)."),
      P("2-6m", 2, "Sustained shipping crisis reshapes trade routes. New alliances form. Some small island nations face critical supply issues.", "Crise maritime durable qui redessine les routes commerciales. De nouvelles alliances se forment. Certaines nations insulaires font face à des crises d'approvisionnement."),
    ],
  },
  {
    id: "trucking",
    icon: "🚛",
    name: { en: "Trucking & Road Transport", fr: "Transport routier & camionnage" },
    oilDependency: {
      en: "Diesel powers virtually all freight trucks. Road transport moves 70–80% of goods in most countries. 'Diesel is the hidden tax inside everything you buy.'",
      fr: "Le diesel alimente la quasi-totalité des camions. Le transport routier achemine 70 à 80 % des marchandises dans la plupart des pays. « Le diesel est la taxe cachée dans tout ce que vous achetez. »",
    },
    timeline: [
      P("0-3d", 2, "Diesel surcharges applied. Long-haul truckers may hoard fuel. Some deliveries delayed.", "Surcharges diesel appliquées. Les routiers longue distance peuvent stocker du carburant. Certaines livraisons retardées."),
      P("4-14d", 3, "Delivery delays become widespread. Supermarket restocking slows. Fuel queues at truck stops.", "Les retards de livraison se généralisent. Le réapprovisionnement des supermarchés ralentit. Files d'attente aux stations de carburant routier."),
      P("2-6w", 3, "Rationing may prioritize essential goods transport. Non-essential deliveries suspended. E-commerce delivery times double.", "Le rationnement peut prioriser le transport de biens essentiels. Livraisons non essentielles suspendues. Délais e-commerce doublés."),
      P("2-6m", 2, "Permanent price increases across all consumer goods. Some logistics companies fail.", "Hausses de prix permanentes sur tous les biens de consommation. Certaines entreprises de logistique font faillite."),
    ],
  },
  {
    id: "fuel",
    icon: "⛽",
    name: { en: "Gasoline & Personal Transport", fr: "Essence & transport personnel" },
    oilDependency: {
      en: "Gasoline powers 1.4 billion vehicles worldwide. Even in countries with high EV adoption, 85%+ of cars still run on petrol/diesel.",
      fr: "L'essence alimente 1,4 milliard de véhicules dans le monde. Même dans les pays à forte adoption de VE, 85 %+ des voitures roulent encore à l'essence/diesel.",
    },
    timeline: [
      P("0-3d", 2, "Pump prices jump 15–30%. Panic buying begins. Some stations run dry in affected regions.", "Les prix à la pompe bondissent de 15 à 30 %. Achats de panique. Certaines stations à sec dans les régions touchées."),
      P("4-14d", 3, "Government may impose purchase limits (e.g. 30L max). Long queues at stations. Odd/even license plate rationing possible.", "Le gouvernement peut imposer des limites d'achat (ex. 30L max). Longues files aux stations. Rationnement plaques paires/impaires possible."),
      P("2-6w", 3, "Commuting patterns disrupted. Carpooling surges. Public transport overcrowded. Remote work mandates.", "Déplacements domicile-travail perturbés. Covoiturage en forte hausse. Transports en commun surchargés. Télétravail imposé."),
      P("2-6m", 2, "Demand for EVs and bicycles spikes. Used car market for efficient vehicles booms. Suburban sprawl becomes economically painful.", "La demande de VE et vélos explose. Le marché de l'occasion pour véhicules économes bondit. L'étalement urbain devient économiquement douloureux."),
    ],
  },
  {
    id: "petrochemicals",
    icon: "🧪",
    name: { en: "Petrochemicals & Plastics", fr: "Pétrochimie & plastiques" },
    oilDependency: {
      en: "12% of global oil is feedstock for petrochemicals (not burned as fuel). This produces all plastics, synthetic fibers, solvents, detergents, adhesives, paints, and thousands of industrial chemicals.",
      fr: "12 % du pétrole mondial sert de matière première à la pétrochimie (pas brûlé comme carburant). Cela produit tous les plastiques, fibres synthétiques, solvants, détergents, adhésifs, peintures et des milliers de produits chimiques industriels.",
    },
    timeline: [
      P("0-3d", 1, "Petrochemical feedstock prices spike on futures markets. No immediate physical shortage.", "Les prix des matières premières pétrochimiques bondissent sur les marchés à terme. Pas de pénurie physique immédiate."),
      P("4-14d", 2, "Resin and polymer prices increase 20–40%. Packaging industry begins cost pass-through.", "Les prix des résines et polymères augmentent de 20 à 40 %. L'industrie de l'emballage commence à répercuter les coûts."),
      P("2-6w", 3, "Plastic bottle, packaging, and container shortages. Medical device production affected. Food packaging disrupted.", "Pénuries de bouteilles plastiques, emballages et conteneurs. Production de dispositifs médicaux affectée. Emballages alimentaires perturbés."),
      P("2-6m", 3, "Widespread material shortages in manufacturing. Products requiring nylon, polyester, PVC, polypropylene unavailable or rationed.", "Pénuries de matériaux généralisées dans l'industrie. Produits nécessitant nylon, polyester, PVC, polypropylène indisponibles ou rationnés."),
    ],
  },
  {
    id: "pharma",
    icon: "💊",
    name: { en: "Pharmaceuticals & Healthcare", fr: "Pharmacie & santé" },
    oilDependency: {
      en: "Most synthetic drugs derive from petrochemical precursors: aspirin, paracetamol, antihistamines, antiseptics, heart medications. Medical plastics (syringes, IV bags, tubing, gloves) are petroleum-based. Pharmaceutical logistics depend on temperature-controlled transport.",
      fr: "La plupart des médicaments de synthèse dérivent de précurseurs pétrochimiques : aspirine, paracétamol, antihistaminiques, antiseptiques, médicaments cardiaques. Les plastiques médicaux (seringues, poches IV, tubulures, gants) sont à base de pétrole. La logistique pharmaceutique dépend du transport à température contrôlée.",
    },
    timeline: [
      P("0-3d", 0, "No immediate impact — hospitals and pharmacies have 1–4 weeks of stock.", "Pas d'impact immédiat — hôpitaux et pharmacies ont 1 à 4 semaines de stock."),
      P("4-14d", 1, "Pharmaceutical companies begin securing alternative supply chains. Some specialty drugs face import delays.", "Les entreprises pharmaceutiques cherchent des chaînes d'approvisionnement alternatives. Certains médicaments spécialisés subissent des retards d'importation."),
      P("2-6w", 2, "Generic drug shortages appear. Surgical supply disruptions (gloves, syringes). Hospital costs surge.", "Des pénuries de médicaments génériques apparaissent. Perturbation des fournitures chirurgicales (gants, seringues). Les coûts hospitaliers flambent."),
      P("2-6m", 3, "Critical drug shortages. Rationing of certain medications. Cancer treatments, insulin, antibiotics affected. Public health crisis.", "Pénuries critiques de médicaments. Rationnement de certains traitements. Traitements anti-cancer, insuline, antibiotiques affectés. Crise de santé publique."),
    ],
  },
  {
    id: "food",
    icon: "🌾",
    name: { en: "Food & Agriculture", fr: "Alimentation & agriculture" },
    oilDependency: {
      en: "Modern agriculture is petroleum-intensive: diesel for tractors/harvesters, natural gas → ammonia → fertilizers (Haber-Bosch process), pesticides from petrochemicals, refrigerated transport, plastic packaging. It takes ~10 calories of fossil energy to produce 1 calorie of food in industrialized countries.",
      fr: "L'agriculture moderne est très dépendante du pétrole : diesel pour tracteurs/moissonneuses, gaz naturel → ammoniac → engrais (procédé Haber-Bosch), pesticides pétrochimiques, transport réfrigéré, emballages plastiques. Il faut ~10 calories d'énergie fossile pour produire 1 calorie de nourriture dans les pays industrialisés.",
    },
    timeline: [
      P("0-3d", 1, "Fresh produce prices begin rising due to transport costs. Import-dependent items (tropical fruits, coffee) affected first.", "Les prix des produits frais commencent à augmenter à cause des coûts de transport. Les produits dépendants des importations (fruits tropicaux, café) affectés en premier."),
      P("4-14d", 2, "Supermarket shelves thin out for imported goods. Refrigerated transport delays spoil perishables. Dairy and meat distribution disrupted.", "Les rayons de supermarchés se vident pour les produits importés. Les retards de transport réfrigéré gâchent les denrées périssables. Distribution de produits laitiers et viande perturbée."),
      P("2-6w", 3, "Fertilizer prices double or triple — farmers reduce application, threatening next harvest. Food prices up 20–50%. Food banks overwhelmed.", "Les prix des engrais doublent ou triplent — les agriculteurs réduisent l'application, menaçant la prochaine récolte. Prix alimentaires en hausse de 20 à 50 %. Les banques alimentaires débordées."),
      P("2-6m", 3, "Crop yields decline 15–30% without adequate fertilizer. Food insecurity spreads. Import-dependent nations (Middle East, North Africa, island states) face famine risk.", "Les rendements agricoles baissent de 15 à 30 % sans engrais adéquats. L'insécurité alimentaire se propage. Les nations dépendantes des importations (Moyen-Orient, Afrique du Nord, États insulaires) risquent la famine."),
      P("6m+", 3, "Structural food crisis. Agricultural practices must adapt. Governments stockpile grain. International food aid required for vulnerable nations.", "Crise alimentaire structurelle. Les pratiques agricoles doivent s'adapter. Les gouvernements stockent du grain. Aide alimentaire internationale nécessaire pour les nations vulnérables."),
    ],
  },
  {
    id: "textile",
    icon: "👕",
    name: { en: "Textiles & Fashion", fr: "Textile & mode" },
    oilDependency: {
      en: "65% of global textile fibers are synthetic (polyester, nylon, acrylic) — all petroleum-derived. Even cotton requires diesel farming equipment and petrochemical dyes/finishes.",
      fr: "65 % des fibres textiles mondiales sont synthétiques (polyester, nylon, acrylique) — toutes dérivées du pétrole. Même le coton nécessite des engins agricoles diesel et des teintures/finitions pétrochimiques.",
    },
    timeline: [
      P("0-3d", 0, "No immediate impact — retailers have months of inventory.", "Pas d'impact immédiat — les détaillants ont des mois de stock."),
      P("4-14d", 1, "Factory orders from Asia delayed. Fast fashion supply chains (2-week cycles) disrupted first.", "Commandes d'usines asiatiques retardées. Les chaînes fast fashion (cycles de 2 semaines) perturbées en premier."),
      P("2-6w", 2, "Polyester and nylon prices up 30–50%. Clothing prices rise. Retailers reduce collections.", "Prix du polyester et nylon en hausse de 30 à 50 %. Les prix des vêtements augmentent. Les détaillants réduisent les collections."),
      P("2-6m", 2, "Structural shift: consumers repair rather than replace. Second-hand market booms. Natural fibers (cotton, wool, linen) surge in demand.", "Changement structurel : les consommateurs réparent plutôt que remplacent. Le marché de l'occasion explose. La demande de fibres naturelles (coton, laine, lin) bondit."),
    ],
  },
  {
    id: "construction",
    icon: "🏗️",
    name: { en: "Construction & Infrastructure", fr: "Construction & infrastructures" },
    oilDependency: {
      en: "Asphalt/bitumen (roads) is a direct petroleum product. Diesel powers cranes, excavators, concrete mixers. Plastics (PVC pipes, insulation, wiring coatings), paints, sealants are petrochemical-derived.",
      fr: "L'asphalte/bitume (routes) est un produit pétrolier direct. Le diesel alimente grues, pelleteuses, bétonnières. Les plastiques (tuyaux PVC, isolation, gaines de câbles), peintures, mastics sont dérivés de la pétrochimie.",
    },
    timeline: [
      P("0-3d", 1, "Diesel costs for equipment rise immediately. Project budgets under pressure.", "Les coûts diesel des engins augmentent immédiatement. Les budgets de projets sous pression."),
      P("4-14d", 1, "Material delivery delays begin. Asphalt prices spike. Some contractors pause non-urgent work.", "Les retards de livraison de matériaux commencent. Les prix de l'asphalte flambent. Certains entrepreneurs suspendent les travaux non urgents."),
      P("2-6w", 2, "PVC, insulation, and paint shortages. Road construction and maintenance halted. New housing starts decline.", "Pénuries de PVC, isolation et peinture. Construction et entretien routier à l'arrêt. Les mises en chantier de logements baissent."),
      P("2-6m", 3, "Construction sector contracts 15–25%. Massive job losses. Infrastructure maintenance backlog grows.", "Le secteur de la construction se contracte de 15 à 25 %. Pertes d'emplois massives. Le retard d'entretien des infrastructures s'aggrave."),
    ],
  },
  {
    id: "manufacturing",
    icon: "🏭",
    name: { en: "Manufacturing & Industry", fr: "Industrie manufacturière" },
    oilDependency: {
      en: "Petroleum is used for lubricants, process heat, raw materials (synthetic rubber, carbon black for tires), and powers the entire logistics chain feeding factories. Automobile, electronics, and appliance production all depend heavily on petrochemical inputs.",
      fr: "Le pétrole est utilisé pour les lubrifiants, la chaleur industrielle, les matières premières (caoutchouc synthétique, noir de carbone pour les pneus), et alimente toute la chaîne logistique des usines. L'automobile, l'électronique et l'électroménager dépendent fortement des intrants pétrochimiques.",
    },
    timeline: [
      P("0-3d", 0, "Factories run on existing inventory. Purchasing departments begin panic-buying components.", "Les usines fonctionnent sur les stocks existants. Les services achats commencent à acheter en panique."),
      P("4-14d", 1, "Just-in-time supply chains fail. Auto plants may idle lines waiting for parts. Lubricant shortages slow precision manufacturing.", "Les chaînes d'approvisionnement en juste-à-temps échouent. Les usines auto peuvent arrêter les lignes en attendant des pièces. Les pénuries de lubrifiants ralentissent la fabrication de précision."),
      P("2-6w", 2, "Production cutbacks across automotive, electronics, appliances. Tire manufacturing severely impacted (synthetic rubber + carbon black). Chip fabrication disrupted.", "Réductions de production dans l'automobile, l'électronique, l'électroménager. Fabrication de pneus sévèrement touchée (caoutchouc synthétique + noir de carbone). Fabrication de puces perturbée."),
      P("2-6m", 3, "Factory closures. Industrial output down 10–20%. Unemployment rises in manufacturing regions. Supply chains restructure.", "Fermetures d'usines. Production industrielle en baisse de 10 à 20 %. Chômage en hausse dans les régions industrielles. Les chaînes d'approvisionnement se restructurent."),
    ],
  },
  {
    id: "energy",
    icon: "⚡",
    name: { en: "Electricity & Heating", fr: "Électricité & chauffage" },
    oilDependency: {
      en: "Oil generates ~3% of global electricity (but much more in oil-dependent nations like Saudi Arabia, Iraq, Caribbean islands). Heating oil warms millions of homes in NE USA, Northern Europe. Backup diesel generators power hospitals, data centers, telecom towers.",
      fr: "Le pétrole génère ~3 % de l'électricité mondiale (mais beaucoup plus dans les nations dépendantes comme l'Arabie saoudite, l'Irak, les îles des Caraïbes). Le fioul domestique chauffe des millions de foyers dans le NE des USA, en Europe du Nord. Les groupes électrogènes diesel alimentent hôpitaux, data centers, antennes télécom.",
    },
    timeline: [
      P("0-3d", 1, "Heating oil prices spike. Oil-dependent power grids (islands, developing nations) face immediate cost increases.", "Les prix du fioul domestique flambent. Les réseaux électriques dépendants du pétrole (îles, pays en développement) font face à des hausses de coûts immédiates."),
      P("4-14d", 2, "Heating oil rationing in winter. Caribbean and Pacific islands may face power outages. Diesel generator fuel becomes scarce.", "Rationnement du fioul en hiver. Les îles des Caraïbes et du Pacifique peuvent faire face à des coupures. Le carburant pour groupes électrogènes se raréfie."),
      P("2-6w", 2, "Energy poverty increases. Grid instability in oil-dependent regions. Data center operations threatened.", "La précarité énergétique augmente. Instabilité du réseau dans les régions dépendantes du pétrole. Opérations des data centers menacées."),
      P("2-6m", 1, "Accelerated shift to renewables and nuclear where possible. But transition takes years, not months.", "Transition accélérée vers les renouvelables et le nucléaire si possible. Mais la transition prend des années, pas des mois."),
    ],
  },
  {
    id: "mining",
    icon: "⛏️",
    name: { en: "Mining & Raw Materials", fr: "Mines & matières premières" },
    oilDependency: {
      en: "Mining uses massive diesel-powered equipment (haul trucks, excavators, generators). Copper, lithium, iron ore, rare earths — all require petroleum for extraction and processing. Paradoxically, the green energy transition depends on mining metals that require oil to extract.",
      fr: "L'industrie minière utilise d'énormes engins diesel (camions de transport, pelleteuses, générateurs). Cuivre, lithium, minerai de fer, terres rares — tous nécessitent du pétrole pour l'extraction et le traitement. Paradoxalement, la transition énergétique verte dépend de métaux minés qui nécessitent du pétrole pour être extraits.",
    },
    timeline: [
      P("0-3d", 1, "Diesel costs for mining operations spike. Commodity trading volatility increases.", "Les coûts diesel des opérations minières flambent. La volatilité du commerce des matières premières augmente."),
      P("4-14d", 2, "Some remote mines reduce operations (diesel delivery disrupted). Copper and lithium prices rise.", "Certaines mines isolées réduisent les opérations (livraison diesel perturbée). Les prix du cuivre et du lithium augmentent."),
      P("2-6w", 2, "Mining output declines 5–15%. Metal prices surge. Paradox: green transition materials (lithium, cobalt) become scarcer and more expensive.", "La production minière baisse de 5 à 15 %. Les prix des métaux flambent. Paradoxe : les matériaux de la transition verte (lithium, cobalt) deviennent plus rares et plus chers."),
      P("2-6m", 2, "Strategic metal stockpiling by governments. New geopolitical tensions over remaining supply.", "Stockage stratégique de métaux par les gouvernements. Nouvelles tensions géopolitiques sur l'approvisionnement restant."),
    ],
  },
];

export const SEVERITY_LABELS: Record<number, { en: string; fr: string; color: string }> = {
  0: { en: "Minimal", fr: "Minimal", color: "text-green-400" },
  1: { en: "Moderate", fr: "Modéré", color: "text-yellow-400" },
  2: { en: "Severe", fr: "Sévère", color: "text-orange-400" },
  3: { en: "Critical", fr: "Critique", color: "text-red-400" },
};

export const SEVERITY_BG: Record<number, string> = {
  0: "bg-green-500/20",
  1: "bg-yellow-500/20",
  2: "bg-orange-500/20",
  3: "bg-red-500/20",
};
