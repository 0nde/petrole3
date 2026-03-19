/** Rich pedagogical profiles for each chokepoint, bilingual FR/EN. */

export interface ChokepointProfile {
  id: string;
  location: { en: string; fr: string };
  dimensions: { en: string; fr: string };
  throughput: { en: string; fr: string };
  history: { en: string; fr: string };
  strategic: { en: string; fr: string };
  realWorldImpact: { en: string; fr: string };
  keyCountries: string[];
  funFact: { en: string; fr: string };
}

export const chokepointProfiles: Record<string, ChokepointProfile> = {
  hormuz: {
    id: "hormuz",
    location: {
      en: "Located between Iran (north) and Oman/United Arab Emirates (south), connecting the Persian Gulf to the Gulf of Oman and the Arabian Sea.",
      fr: "Situé entre l'Iran (nord) et Oman/Émirats arabes unis (sud), reliant le golfe Persique au golfe d'Oman et à la mer d'Arabie.",
    },
    dimensions: {
      en: "Width: 33 km at the narrowest point. Navigable shipping lanes are only 3 km wide in each direction, separated by a 3 km buffer zone.",
      fr: "Largeur : 33 km au point le plus étroit. Les couloirs de navigation ne font que 3 km de large dans chaque sens, séparés par une zone tampon de 3 km.",
    },
    throughput: {
      en: "Approximately 21 million barrels per day (Mb/d) transit through this strait — about 21% of global oil consumption. It is by far the world's most critical oil chokepoint.",
      fr: "Environ 21 millions de barils par jour (Mb/j) transitent par ce détroit — soit environ 21 % de la consommation mondiale de pétrole. C'est de loin le point de passage pétrolier le plus critique au monde.",
    },
    history: {
      en: "During the Iran-Iraq War (1980–1988), the 'Tanker War' saw both nations attack oil tankers in the Gulf, threatening Hormuz traffic. In 1988, the USS Vincennes shot down Iran Air Flight 655 over these waters. In 2019, Iran seized the British-flagged Stena Impero tanker, and several tankers were attacked with limpet mines, raising fears of full closure. Iran has repeatedly threatened to close the strait in response to sanctions.",
      fr: "Pendant la guerre Iran-Irak (1980–1988), la « guerre des pétroliers » a vu les deux nations attaquer des tankers dans le Golfe, menaçant le trafic d'Ormuz. En 1988, l'USS Vincennes a abattu le vol Iran Air 655 au-dessus de ces eaux. En 2019, l'Iran a saisi le pétrolier britannique Stena Impero, et plusieurs tankers ont été attaqués à la mine ventouse, ravivant les craintes de fermeture totale. L'Iran a menacé à plusieurs reprises de fermer le détroit en représailles aux sanctions.",
    },
    strategic: {
      en: "Hormuz is irreplaceable: there is no pipeline bypass with enough capacity to replace its flow. Saudi Arabia's East-West pipeline (5 Mb/d max) and the UAE's Habshan-Fujairah pipeline (1.5 Mb/d) offer only partial alternatives. A full blockade would instantly remove ~20% of world oil supply, triggering the most severe energy crisis in history.",
      fr: "Ormuz est irremplaçable : aucun oléoduc de contournement n'a la capacité suffisante pour remplacer son débit. L'oléoduc Est-Ouest de l'Arabie saoudite (5 Mb/j max) et l'oléoduc Habshan-Fujairah des EAU (1,5 Mb/j) n'offrent que des alternatives partielles. Un blocage total retirerait instantanément ~20 % de l'offre mondiale de pétrole, déclenchant la crise énergétique la plus grave de l'histoire.",
    },
    realWorldImpact: {
      en: "If blocked: oil prices would likely spike above $150–200/barrel within days. Gasoline rationing in importing countries within 2–4 weeks. Strategic reserves worldwide (≈1.2 billion barrels in IEA countries) would provide roughly 90 days of buffer. GDP impact: estimated 2–5% global recession.",
      fr: "En cas de blocage : les prix du pétrole grimperaient probablement au-delà de 150–200 $/baril en quelques jours. Rationnement de l'essence dans les pays importateurs sous 2 à 4 semaines. Les réserves stratégiques mondiales (≈1,2 milliard de barils dans les pays de l'AIE) offriraient environ 90 jours de tampon. Impact sur le PIB : récession mondiale estimée de 2 à 5 %.",
    },
    keyCountries: ["SAU", "IRQ", "ARE", "KWT", "IRN", "QAT"],
    funFact: {
      en: "Every day, roughly one oil tanker passes through Hormuz every 6 minutes. The strait is so narrow that ships entering and leaving can see each other.",
      fr: "Chaque jour, un pétrolier passe par Ormuz environ toutes les 6 minutes. Le détroit est si étroit que les navires entrant et sortant peuvent se voir mutuellement.",
    },
  },

  malacca: {
    id: "malacca",
    location: {
      en: "Located between the Malay Peninsula (Malaysia/Thailand) and the Indonesian island of Sumatra, connecting the Indian Ocean to the South China Sea.",
      fr: "Situé entre la péninsule malaise (Malaisie/Thaïlande) et l'île indonésienne de Sumatra, reliant l'océan Indien à la mer de Chine méridionale.",
    },
    dimensions: {
      en: "Length: 800 km. Width varies from 65 km to just 2.8 km at Phillips Channel (narrowest navigable point near Singapore). Depth can be as shallow as 25 meters in places.",
      fr: "Longueur : 800 km. Largeur variant de 65 km à seulement 2,8 km au chenal Phillips (point navigable le plus étroit près de Singapour). La profondeur peut descendre à 25 mètres par endroits.",
    },
    throughput: {
      en: "About 16 million barrels per day of oil transit this strait — nearly all Middle Eastern crude destined for East Asia passes here. It also handles about 25% of all global maritime trade by tonnage.",
      fr: "Environ 16 millions de barils par jour de pétrole transitent par ce détroit — la quasi-totalité du brut moyen-oriental destiné à l'Asie de l'Est y passe. Il gère aussi environ 25 % du commerce maritime mondial en tonnage.",
    },
    history: {
      en: "Malacca has been a strategic trade route for over 2,000 years, used by Indian, Chinese, and Arab merchants. The Portuguese captured Malacca city in 1511 to control spice trade. The British controlled it from 1824 to 1957. In the early 2000s, piracy was rampant (150+ attacks/year) until joint naval patrols by Malaysia, Indonesia, Singapore, and Thailand dramatically reduced incidents after 2006.",
      fr: "Malacca est une route commerciale stratégique depuis plus de 2 000 ans, utilisée par les marchands indiens, chinois et arabes. Les Portugais ont capturé la ville de Malacca en 1511 pour contrôler le commerce des épices. Les Britanniques l'ont contrôlé de 1824 à 1957. Au début des années 2000, la piraterie était endémique (150+ attaques/an) jusqu'aux patrouilles navales conjointes de la Malaisie, de l'Indonésie, de Singapour et de la Thaïlande qui ont drastiquement réduit les incidents après 2006.",
    },
    strategic: {
      en: "China calls its oil dependency on Malacca the 'Malacca Dilemma.' Over 80% of China's oil imports pass through this strait. To reduce this vulnerability, China is building overland pipelines through Myanmar (Sino-Myanmar pipeline, 0.44 Mb/d) and investing in Pakistan's Gwadar port (China-Pakistan Economic Corridor). Japan and South Korea are equally dependent.",
      fr: "La Chine appelle sa dépendance pétrolière envers Malacca le « dilemme de Malacca ». Plus de 80 % des importations pétrolières chinoises passent par ce détroit. Pour réduire cette vulnérabilité, la Chine construit des oléoducs terrestres via le Myanmar (pipeline sino-birman, 0,44 Mb/j) et investit dans le port pakistanais de Gwadar (Corridor économique Chine-Pakistan). Le Japon et la Corée du Sud sont tout aussi dépendants.",
    },
    realWorldImpact: {
      en: "If blocked: East Asian economies would face severe oil shortages within 1–2 weeks. Alternative routes via Lombok or Sunda Straits add 2–3 days and cost. China, Japan, South Korea — the world's 2nd, 3rd, and 10th largest economies — would be simultaneously hit. Oil prices would surge $40–80/barrel. Global supply chain disruption on par with the Suez blockage but far worse.",
      fr: "En cas de blocage : les économies d'Asie de l'Est feraient face à de graves pénuries de pétrole sous 1 à 2 semaines. Les routes alternatives via Lombok ou le détroit de la Sonde ajoutent 2 à 3 jours et des coûts. La Chine, le Japon, la Corée du Sud — les 2e, 3e et 10e économies mondiales — seraient simultanément touchés. Les prix du pétrole bondraient de 40 à 80 $/baril. Perturbation des chaînes d'approvisionnement mondiales comparable au blocage de Suez, mais bien pire.",
    },
    keyCountries: ["CHN", "JPN", "KOR", "SGP", "MYS", "IDN", "THA", "TWN"],
    funFact: {
      en: "About 100,000 vessels transit Malacca annually, making it one of the busiest waterways in the world — more than the Suez and Panama canals combined.",
      fr: "Environ 100 000 navires transitent par Malacca chaque année, en faisant l'une des voies navigables les plus fréquentées au monde — plus que les canaux de Suez et de Panama réunis.",
    },
  },

  suez: {
    id: "suez",
    location: {
      en: "An artificial waterway in Egypt connecting the Mediterranean Sea (Port Said) to the Red Sea (Suez). The parallel SUMED pipeline runs from Ain Sukhna on the Gulf of Suez to Sidi Kerir on the Mediterranean.",
      fr: "Voie navigable artificielle en Égypte reliant la mer Méditerranée (Port-Saïd) à la mer Rouge (Suez). L'oléoduc parallèle SUMED relie Ain Sokhna sur le golfe de Suez à Sidi Kerir sur la Méditerranée.",
    },
    dimensions: {
      en: "Length: 193 km. Width: 205–225 m (after 2015 expansion). Depth: 24 m. The 2015 'New Suez Canal' added a 35 km parallel channel allowing two-way traffic in part of the canal. No locks — it is a sea-level canal.",
      fr: "Longueur : 193 km. Largeur : 205–225 m (après l'agrandissement de 2015). Profondeur : 24 m. Le « nouveau canal de Suez » de 2015 a ajouté un chenal parallèle de 35 km permettant le trafic bidirectionnel sur une partie du canal. Pas d'écluses — c'est un canal à niveau de la mer.",
    },
    throughput: {
      en: "About 5.5 Mb/d of oil (canal + SUMED pipeline). The canal handles roughly 12–15% of global trade. About 50 ships transit daily. Revenue for Egypt: ~$9.4 billion/year (2023).",
      fr: "Environ 5,5 Mb/j de pétrole (canal + oléoduc SUMED). Le canal gère environ 12 à 15 % du commerce mondial. Environ 50 navires transitent quotidiennement. Revenus pour l'Égypte : ~9,4 milliards $/an (2023).",
    },
    history: {
      en: "Built between 1859 and 1869 under Ferdinand de Lesseps. The Suez Crisis of 1956 saw Britain, France, and Israel invade Egypt after Nasser nationalized the canal — a pivotal moment in decolonization. The canal was closed from 1967 to 1975 following the Six-Day War, with 15 ships trapped inside (the 'Yellow Fleet'). In March 2021, the Ever Given container ship blocked the canal for 6 days, disrupting $9.6 billion of trade daily.",
      fr: "Construit entre 1859 et 1869 sous Ferdinand de Lesseps. La crise de Suez de 1956 a vu la Grande-Bretagne, la France et Israël envahir l'Égypte après la nationalisation du canal par Nasser — moment pivot de la décolonisation. Le canal fut fermé de 1967 à 1975 après la guerre des Six Jours, piégeant 15 navires (la « Flotte Jaune »). En mars 2021, le porte-conteneurs Ever Given a bloqué le canal pendant 6 jours, perturbant 9,6 milliards $ de commerce par jour.",
    },
    strategic: {
      en: "The Suez Canal saves roughly 7,000 km and 10 days of travel compared to routing around Africa via the Cape of Good Hope. It is critical for Europe's oil supply from the Gulf and for Asian exports to Europe. The SUMED pipeline provides a partial bypass for crude oil if the canal is blocked.",
      fr: "Le canal de Suez économise environ 7 000 km et 10 jours de trajet par rapport au contournement de l'Afrique via le cap de Bonne-Espérance. Il est critique pour l'approvisionnement pétrolier de l'Europe depuis le Golfe et pour les exportations asiatiques vers l'Europe. L'oléoduc SUMED offre un contournement partiel pour le brut si le canal est bloqué.",
    },
    realWorldImpact: {
      en: "If blocked: shipping costs surge 30–50% for Europe-Asia routes. Oil deliveries to Europe delayed by 2 weeks. The Ever Given incident (just 6 days) caused an estimated $54 billion in trade disruption. A prolonged closure would add $5–15/barrel to oil prices and significantly impact European refinery supply.",
      fr: "En cas de blocage : les coûts de transport bondissent de 30 à 50 % pour les routes Europe-Asie. Livraisons de pétrole vers l'Europe retardées de 2 semaines. L'incident de l'Ever Given (seulement 6 jours) a causé une perturbation commerciale estimée à 54 milliards $. Une fermeture prolongée ajouterait 5 à 15 $/baril au prix du pétrole et impacterait significativement l'approvisionnement des raffineries européennes.",
    },
    keyCountries: ["EGY", "SAU", "IRQ", "ARE", "KWT"],
    funFact: {
      en: "The 'Yellow Fleet' — 15 ships trapped in the Great Bitter Lake during the 1967–1975 closure — formed their own micro-society with a postal service, sports competitions, and even their own stamps.",
      fr: "La « Flotte Jaune » — 15 navires piégés dans le Grand Lac Amer pendant la fermeture de 1967–1975 — a formé sa propre micro-société avec un service postal, des compétitions sportives et même ses propres timbres.",
    },
  },

  bab_el_mandeb: {
    id: "bab_el_mandeb",
    location: {
      en: "Located between Yemen (Arabian Peninsula) and Djibouti/Eritrea (Horn of Africa), connecting the Red Sea to the Gulf of Aden and the Indian Ocean.",
      fr: "Situé entre le Yémen (péninsule arabique) et Djibouti/Érythrée (Corne de l'Afrique), reliant la mer Rouge au golfe d'Aden et à l'océan Indien.",
    },
    dimensions: {
      en: "Width: 26 km between the coasts, but the navigable channel is divided by Perim Island (Yemen) into two passages — the eastern channel (3 km wide) used by most shipping, and the western channel (26 km wide but shallow).",
      fr: "Largeur : 26 km entre les côtes, mais le chenal navigable est divisé par l'île de Périm (Yémen) en deux passages — le chenal est (3 km de large) utilisé par la plupart des navires, et le chenal ouest (26 km de large mais peu profond).",
    },
    throughput: {
      en: "About 6.2 Mb/d of oil. This chokepoint is the mandatory southern gateway to the Suez Canal — any ship using Suez must first pass through Bab el-Mandeb. It also handles significant LNG traffic.",
      fr: "Environ 6,2 Mb/j de pétrole. Ce point de passage est la porte d'entrée sud obligatoire vers le canal de Suez — tout navire utilisant Suez doit d'abord passer par Bab el-Mandeb. Il gère aussi un trafic GNL important.",
    },
    history: {
      en: "The name means 'Gate of Tears' in Arabic, referring to the dangers of navigating its waters. In October 2016, Houthi rebels fired missiles at a US Navy destroyer (USS Mason) near the strait. Starting November 2023, Yemen's Houthi movement launched a sustained campaign of drone and missile attacks on commercial shipping in solidarity with Palestinians during the Gaza conflict, forcing major shipping lines (Maersk, MSC, Hapag-Lloyd) to reroute around Africa.",
      fr: "Le nom signifie « Porte des Larmes » en arabe, en référence aux dangers de navigation dans ses eaux. En octobre 2016, les rebelles houthis ont tiré des missiles sur un destroyer américain (USS Mason) près du détroit. À partir de novembre 2023, le mouvement houthi du Yémen a lancé une campagne soutenue d'attaques par drones et missiles contre la navigation commerciale en solidarité avec les Palestiniens pendant le conflit de Gaza, forçant les grandes compagnies maritimes (Maersk, MSC, Hapag-Lloyd) à dérouter via l'Afrique.",
    },
    strategic: {
      en: "Bab el-Mandeb and Suez form an inseparable pair — blocking either one forces ships to reroute around the Cape of Good Hope. The 2023–2024 Houthi crisis demonstrated this: Red Sea traffic dropped ~50% and shipping costs surged 300–400%. Major naval powers (US, UK, France) maintain military bases in nearby Djibouti to protect this passage.",
      fr: "Bab el-Mandeb et Suez forment un couple indissociable — bloquer l'un ou l'autre force les navires à contourner le cap de Bonne-Espérance. La crise houthie de 2023–2024 l'a démontré : le trafic en mer Rouge a chuté d'environ 50 % et les coûts de transport ont bondi de 300 à 400 %. Les grandes puissances navales (États-Unis, Royaume-Uni, France) maintiennent des bases militaires à Djibouti pour protéger ce passage.",
    },
    realWorldImpact: {
      en: "When disrupted (as in 2024): container shipping rates tripled, oil tanker insurance premiums surged 10x, and European imports faced 10–14 day delays. The rerouting around Africa added $1 million per voyage for large tankers. Supply chain disruptions rippled through European manufacturing and retail.",
      fr: "En cas de perturbation (comme en 2024) : les tarifs de transport de conteneurs ont triplé, les primes d'assurance des pétroliers ont été multipliées par 10, et les importations européennes ont subi des retards de 10 à 14 jours. Le déroutement via l'Afrique a ajouté 1 million $ par voyage pour les grands pétroliers. Les perturbations de la chaîne d'approvisionnement se sont propagées dans l'industrie et le commerce européens.",
    },
    keyCountries: ["SAU", "IRQ", "ARE", "KWT", "EGY"],
    funFact: {
      en: "Djibouti, the tiny nation on the western shore, hosts military bases from the US, France, China, Japan, and Italy — making it one of the most militarized places on Earth per square kilometer, all because of this strait.",
      fr: "Djibouti, la petite nation sur la rive ouest, accueille des bases militaires des États-Unis, de la France, de la Chine, du Japon et de l'Italie — en faisant l'un des endroits les plus militarisés au monde par kilomètre carré, tout cela à cause de ce détroit.",
    },
  },

  bosphorus: {
    id: "bosphorus",
    location: {
      en: "The Turkish Straits system includes the Bosphorus (Istanbul) and the Dardanelles, connected by the Sea of Marmara. They link the Black Sea to the Aegean Sea and the Mediterranean.",
      fr: "Le système des détroits turcs comprend le Bosphore (Istanbul) et les Dardanelles, reliés par la mer de Marmara. Ils relient la mer Noire à la mer Égée et à la Méditerranée.",
    },
    dimensions: {
      en: "Bosphorus: 31 km long, 700 m at the narrowest point — one of the world's narrowest waterways used for international shipping. Ships must navigate sharp turns and strong currents (up to 7 knots). The Dardanelles: 61 km long, 1.2 km at the narrowest.",
      fr: "Bosphore : 31 km de long, 700 m au point le plus étroit — l'une des voies navigables les plus étroites au monde utilisées pour la navigation internationale. Les navires doivent négocier des virages serrés et de forts courants (jusqu'à 7 nœuds). Les Dardanelles : 61 km de long, 1,2 km au point le plus étroit.",
    },
    throughput: {
      en: "About 2.4 Mb/d of oil, primarily Russian and Caspian crude exports. Approximately 42,000 vessels transit annually. Traffic is heavier than Suez but the waterway is far narrower.",
      fr: "Environ 2,4 Mb/j de pétrole, principalement des exportations de brut russe et caspien. Environ 42 000 navires transitent annuellement. Le trafic est plus dense qu'à Suez mais la voie navigable est bien plus étroite.",
    },
    history: {
      en: "The straits have been strategically vital for millennia — from the ancient Greeks and Romans to the Ottoman Empire and both World Wars. The disastrous Gallipoli Campaign (1915–16) was an Allied attempt to seize the Dardanelles. The Montreux Convention of 1936 gave Turkey sovereignty over the straits while guaranteeing free passage for civilian vessels. Turkey cannot legally close the straits to commercial traffic except in wartime.",
      fr: "Les détroits sont stratégiquement vitaux depuis des millénaires — des Grecs et Romains antiques à l'Empire ottoman et aux deux guerres mondiales. La désastreuse campagne de Gallipoli (1915–16) fut une tentative alliée de s'emparer des Dardanelles. La Convention de Montreux de 1936 a donné à la Turquie la souveraineté sur les détroits tout en garantissant le libre passage des navires civils. La Turquie ne peut légalement fermer les détroits au trafic commercial sauf en temps de guerre.",
    },
    strategic: {
      en: "The only maritime outlet for Russian Black Sea oil exports (ports of Novorossiysk, Tuapse). Also the exit route for Kazakh oil loaded at the CPC terminal in Novorossiysk. Turkey has leveraged its control position — in 2022, it invoked Montreux to restrict warship transit during the Russia-Ukraine war. The BTC pipeline (Baku-Tbilisi-Ceyhan) was built specifically to bypass these straits.",
      fr: "La seule sortie maritime pour les exportations pétrolières russes de la mer Noire (ports de Novorossiysk, Touapsé). Aussi la route de sortie du pétrole kazakh chargé au terminal CPC de Novorossiysk. La Turquie a utilisé sa position de contrôle — en 2022, elle a invoqué Montreux pour restreindre le transit des navires de guerre pendant la guerre Russie-Ukraine. L'oléoduc BTC (Bakou-Tbilissi-Ceyhan) a été construit spécifiquement pour contourner ces détroits.",
    },
    realWorldImpact: {
      en: "If blocked: 2.4 Mb/d of mostly Russian/Caspian exports stranded. European refineries dependent on Urals crude (especially in the Mediterranean) would face shortages. Impact moderated by pipeline alternatives (BTC, Druzhba) but still significant. Oil price impact: +$10–20/barrel for Mediterranean grades.",
      fr: "En cas de blocage : 2,4 Mb/j d'exportations principalement russes/caspiennes bloquées. Les raffineries européennes dépendantes du brut Oural (surtout en Méditerranée) feraient face à des pénuries. Impact modéré par les alternatives par pipeline (BTC, Droujba) mais néanmoins significatif. Impact sur les prix : +10 à 20 $/baril pour les bruts méditerranéens.",
    },
    keyCountries: ["RUS", "KAZ", "TUR", "AZE"],
    funFact: {
      en: "Istanbul is the only major city in the world built on two continents. The Bosphorus literally separates Europe from Asia, and over 15 million people live on both banks of this busy oil shipping lane.",
      fr: "Istanbul est la seule grande ville au monde construite sur deux continents. Le Bosphore sépare littéralement l'Europe de l'Asie, et plus de 15 millions de personnes vivent sur les deux rives de cette voie de transport pétrolier très fréquentée.",
    },
  },

  danish_straits: {
    id: "danish_straits",
    location: {
      en: "A set of three waterways between Denmark and Sweden/Germany: the Øresund (between Denmark and Sweden), the Great Belt (between Danish islands), and the Little Belt. They connect the Baltic Sea to the North Sea via the Kattegat and Skagerrak.",
      fr: "Un ensemble de trois voies navigables entre le Danemark et la Suède/Allemagne : l'Øresund (entre le Danemark et la Suède), le Grand Belt (entre les îles danoises) et le Petit Belt. Ils relient la mer Baltique à la mer du Nord via le Kattegat et le Skagerrak.",
    },
    dimensions: {
      en: "The Øresund is 4 km wide at the narrowest (under the Øresund Bridge). The Great Belt is the main shipping channel, 16 km wide but with a fixed bridge clearance of 65 m limiting very large vessels. Depth: 17–25 m in shipping lanes.",
      fr: "L'Øresund fait 4 km de large au point le plus étroit (sous le pont de l'Øresund). Le Grand Belt est le principal chenal maritime, large de 16 km mais avec un tirant d'air fixe de 65 m sous le pont limitant les très grands navires. Profondeur : 17 à 25 m dans les chenaux de navigation.",
    },
    throughput: {
      en: "About 3.2 Mb/d of oil, primarily Russian Baltic exports (from Primorsk, Ust-Luga), plus Norwegian and other North Sea oil. Approximately 60,000 vessel transits per year.",
      fr: "Environ 3,2 Mb/j de pétrole, principalement des exportations russes de la Baltique (depuis Primorsk, Oust-Louga), plus du pétrole norvégien et d'autres pétroles de la mer du Nord. Environ 60 000 transits de navires par an.",
    },
    history: {
      en: "The Danish Straits have been a strategic trade route since the Viking era (8th–11th centuries). Denmark levied the 'Sound Dues' toll on all ships passing through the Øresund from 1429 to 1857 — one of the longest-running tolls in history. The Treaty of Copenhagen (1857) abolished the toll in exchange for a one-time payment by maritime nations. During both World Wars, control of these straits was strategically significant.",
      fr: "Les détroits danois sont une route commerciale stratégique depuis l'ère viking (VIIIe–XIe siècles). Le Danemark a prélevé le péage du « Droit du Sund » sur tous les navires passant par l'Øresund de 1429 à 1857 — l'un des péages les plus anciens de l'histoire. Le traité de Copenhague (1857) a aboli le péage en échange d'un paiement unique par les nations maritimes. Pendant les deux guerres mondiales, le contrôle de ces détroits était stratégiquement important.",
    },
    strategic: {
      en: "The only exit route for Russian Baltic oil exports, which increased after the closure of the Druzhba pipeline to some European countries post-2022. Also important for Swedish, Finnish, and Polish imports. The Druzhba (Friendship) pipeline through Belarus and Poland provides a partial alternative for Russian oil reaching Europe overland.",
      fr: "La seule route de sortie pour les exportations pétrolières russes de la Baltique, qui ont augmenté après la fermeture de l'oléoduc Droujba vers certains pays européens après 2022. Également important pour les importations suédoises, finlandaises et polonaises. L'oléoduc Droujba (Amitié) via la Biélorussie et la Pologne offre une alternative partielle pour le pétrole russe atteignant l'Europe par voie terrestre.",
    },
    realWorldImpact: {
      en: "If blocked: 3.2 Mb/d of oil stranded in the Baltic. Northern European refineries (Sweden, Finland, Poland, Germany) would face supply disruptions. However, this chokepoint is less critical than Hormuz or Malacca because volumes are lower and pipeline alternatives exist. Price impact: +$5–10/barrel on European grades.",
      fr: "En cas de blocage : 3,2 Mb/j de pétrole bloqués dans la Baltique. Les raffineries d'Europe du Nord (Suède, Finlande, Pologne, Allemagne) feraient face à des ruptures d'approvisionnement. Cependant, ce point de passage est moins critique qu'Ormuz ou Malacca car les volumes sont plus faibles et des alternatives par pipeline existent. Impact sur les prix : +5 à 10 $/baril sur les bruts européens.",
    },
    keyCountries: ["RUS", "NOR", "SWE", "FIN", "DEU", "POL"],
    funFact: {
      en: "The Øresund Bridge (2000) connecting Denmark and Sweden runs directly over one of the world's busiest oil shipping lanes. Ships must pass under its 57-meter clearance while cars and trains cross above.",
      fr: "Le pont de l'Øresund (2000) reliant le Danemark et la Suède passe directement au-dessus de l'une des voies de transport pétrolier les plus fréquentées au monde. Les navires passent sous ses 57 mètres de tirant d'air tandis que voitures et trains circulent au-dessus.",
    },
  },

  panama: {
    id: "panama",
    location: {
      en: "An artificial waterway in Panama connecting the Atlantic Ocean (Caribbean Sea) to the Pacific Ocean, cutting through the Isthmus of Panama.",
      fr: "Voie navigable artificielle au Panama reliant l'océan Atlantique (mer des Caraïbes) à l'océan Pacifique, traversant l'isthme de Panama.",
    },
    dimensions: {
      en: "Length: 82 km. The canal uses a lock system (unlike Suez) to raise ships 26 m above sea level through Gatun Lake. The 2016 expansion added 'Neopanamax' locks allowing ships up to 366 m long and 49 m wide. Transit time: 8–10 hours.",
      fr: "Longueur : 82 km. Le canal utilise un système d'écluses (contrairement à Suez) pour élever les navires de 26 m au-dessus du niveau de la mer via le lac Gatún. L'agrandissement de 2016 a ajouté des écluses « Néopanamax » permettant des navires jusqu'à 366 m de long et 49 m de large. Temps de transit : 8 à 10 heures.",
    },
    throughput: {
      en: "About 0.9 Mb/d of oil and petroleum products. The canal is more important for container ships and LNG carriers than for crude oil tankers (most supertankers are too large). However, it is critical for US Gulf Coast refined product exports to Asia-Pacific.",
      fr: "Environ 0,9 Mb/j de pétrole et produits pétroliers. Le canal est plus important pour les porte-conteneurs et les méthaniers que pour les pétroliers de brut (la plupart des supertankers sont trop grands). Cependant, il est critique pour les exportations de produits raffinés de la côte du Golfe américaine vers l'Asie-Pacifique.",
    },
    history: {
      en: "France attempted to build a sea-level canal (1881–1894) under Ferdinand de Lesseps (who built Suez), but the project failed catastrophically — over 20,000 workers died from malaria and yellow fever. The US completed the lock-based canal in 1914. The Canal Zone was US-controlled territory until the 1977 Torrijos-Carter Treaties transferred sovereignty to Panama in 1999. In 2023–2024, severe drought reduced Gatun Lake water levels, forcing the Panama Canal Authority to cut daily transits from ~38 to ~24, creating major shipping backlogs.",
      fr: "La France a tenté de construire un canal à niveau de la mer (1881–1894) sous Ferdinand de Lesseps (qui avait construit Suez), mais le projet a échoué de façon catastrophique — plus de 20 000 ouvriers sont morts du paludisme et de la fièvre jaune. Les États-Unis ont achevé le canal à écluses en 1914. La Zone du Canal était un territoire sous contrôle américain jusqu'aux traités Torrijos-Carter de 1977 qui ont transféré la souveraineté au Panama en 1999. En 2023–2024, une sécheresse sévère a réduit le niveau du lac Gatún, forçant l'Autorité du Canal à réduire les transits quotidiens de ~38 à ~24, créant d'importants retards maritimes.",
    },
    strategic: {
      en: "Less critical for crude oil than other chokepoints because most supertankers (VLCCs/ULCCs) are too large for even the expanded locks. Its importance is growing for LNG exports from the US Gulf Coast to Asia and for refined petroleum products. The alternative is the much longer route around Cape Horn (South America), adding ~13,000 km.",
      fr: "Moins critique pour le brut que d'autres détroits car la plupart des supertankers (VLCC/ULCC) sont trop grands même pour les écluses agrandies. Son importance croît pour les exportations de GNL de la côte du Golfe américaine vers l'Asie et pour les produits pétroliers raffinés. L'alternative est la route beaucoup plus longue par le cap Horn (Amérique du Sud), ajoutant ~13 000 km.",
    },
    realWorldImpact: {
      en: "If blocked: limited direct impact on crude oil (only 0.9 Mb/d) but significant impact on US refined product exports and LNG trade. Shipping costs and delivery times increase sharply. The 2023 drought restrictions alone caused estimated $500 million in extra shipping costs globally.",
      fr: "En cas de blocage : impact direct limité sur le brut (seulement 0,9 Mb/j) mais impact significatif sur les exportations de produits raffinés américains et le commerce de GNL. Les coûts et délais de transport augmentent fortement. Les seules restrictions de sécheresse de 2023 ont causé environ 500 millions $ de surcoûts de transport dans le monde.",
    },
    keyCountries: ["USA", "CHN", "JPN", "KOR"],
    funFact: {
      en: "Due to the S-shape of the Isthmus of Panama, ships entering the canal from the Atlantic actually exit into the Pacific further east than where they entered. The Pacific entrance is east of the Atlantic entrance!",
      fr: "En raison de la forme en S de l'isthme de Panama, les navires entrant dans le canal depuis l'Atlantique sortent dans le Pacifique plus à l'est qu'à leur point d'entrée. L'entrée Pacifique est à l'est de l'entrée Atlantique !",
    },
  },

  cape_good_hope: {
    id: "cape_good_hope",
    location: {
      en: "The southern tip of Africa, near Cape Town, South Africa. Not technically a strait but a maritime passage — ships round the Cape to travel between the Atlantic and Indian Oceans.",
      fr: "La pointe sud de l'Afrique, près du Cap, Afrique du Sud. Pas techniquement un détroit mais un passage maritime — les navires contournent le Cap pour voyager entre les océans Atlantique et Indien.",
    },
    dimensions: {
      en: "Open ocean — no physical constraints on vessel size. However, the waters are among the most dangerous in the world, with 30-meter waves possible, strong currents (Agulhas Current), and frequent storms. Known to sailors as the 'Cape of Storms.'",
      fr: "Pleine mer — aucune contrainte physique sur la taille des navires. Cependant, les eaux sont parmi les plus dangereuses au monde, avec des vagues de 30 mètres possibles, de forts courants (courant des Aiguilles) et des tempêtes fréquentes. Connu des marins comme le « Cap des Tempêtes ».",
    },
    throughput: {
      en: "About 6 Mb/d under normal conditions. This volume surges significantly when the Red Sea route (Suez/Bab el-Mandeb) is disrupted — as seen in 2024 when Houthi attacks diverted huge volumes around the Cape.",
      fr: "Environ 6 Mb/j en conditions normales. Ce volume augmente considérablement lorsque la route de la mer Rouge (Suez/Bab el-Mandeb) est perturbée — comme en 2024 quand les attaques houthies ont dérouté d'énormes volumes autour du Cap.",
    },
    history: {
      en: "First rounded by Portuguese navigator Bartolomeu Dias in 1488, who named it 'Cape of Storms.' King John II of Portugal renamed it 'Cape of Good Hope' to encourage trade. Vasco da Gama used this route to reach India in 1498, opening the spice trade. For 400 years (until the Suez Canal opened in 1869), it was THE main sea route between Europe and Asia. During the Suez Canal closures (1956, 1967–75), it regained its importance overnight.",
      fr: "Premier contournement par le navigateur portugais Bartolomeu Dias en 1488, qui le nomma « Cap des Tempêtes ». Le roi Jean II du Portugal le renomma « Cap de Bonne-Espérance » pour encourager le commerce. Vasco de Gama utilisa cette route pour atteindre l'Inde en 1498, ouvrant le commerce des épices. Pendant 400 ans (jusqu'à l'ouverture du canal de Suez en 1869), c'était LA principale route maritime entre l'Europe et l'Asie. Lors des fermetures du canal de Suez (1956, 1967–75), il a retrouvé son importance du jour au lendemain.",
    },
    strategic: {
      en: "The Cape is the world's primary 'insurance route' — whenever Suez, Bab el-Mandeb, or Hormuz are disrupted, traffic reroutes here. It is also the natural route for West African oil exports to Asia and for very large crude carriers (VLCCs/ULCCs) too big for the Suez Canal. South African ports (Saldanha Bay, Durban) serve as resupply and bunkering points.",
      fr: "Le Cap est la principale « route d'assurance » au monde — chaque fois que Suez, Bab el-Mandeb ou Ormuz sont perturbés, le trafic se réoriente ici. C'est aussi la route naturelle pour les exportations pétrolières d'Afrique de l'Ouest vers l'Asie et pour les très grands transporteurs de brut (VLCC/ULCC) trop grands pour le canal de Suez. Les ports sud-africains (Saldanha Bay, Durban) servent de points de ravitaillement et de soutage.",
    },
    realWorldImpact: {
      en: "Not a chokepoint that can be 'blocked,' but rerouting via the Cape adds 10–15 days and $1–2 million per voyage compared to Suez. During the 2024 Red Sea crisis, Cape traffic surged 60%, leading to tanker shortages, higher freight rates, and increased CO₂ emissions from longer voyages. It effectively acts as the world's 'pressure valve' for maritime oil trade.",
      fr: "Pas un point de passage qui peut être « bloqué », mais le déroutement via le Cap ajoute 10 à 15 jours et 1 à 2 millions $ par voyage par rapport à Suez. Pendant la crise de la mer Rouge de 2024, le trafic au Cap a bondi de 60 %, entraînant des pénuries de pétroliers, des taux de fret plus élevés et des émissions de CO₂ accrues dues aux voyages plus longs. Il agit effectivement comme la « soupape de pression » mondiale du commerce pétrolier maritime.",
    },
    keyCountries: ["NGA", "AGO", "SAU", "IRQ", "ZAF"],
    funFact: {
      en: "The Cape is where the warm Agulhas Current from the Indian Ocean meets the cold Benguela Current from the Atlantic, creating some of the world's most extreme 'rogue waves' — up to 30 meters high. More than 3,000 shipwrecks litter the coast nearby.",
      fr: "Le Cap est le lieu où le chaud courant des Aiguilles de l'océan Indien rencontre le froid courant de Benguela de l'Atlantique, créant certaines des « vagues scélérates » les plus extrêmes au monde — jusqu'à 30 mètres de haut. Plus de 3 000 épaves jonchent la côte alentour.",
    },
  },
};
