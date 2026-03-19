/** Pedagogical trade relationship profiles for key countries.
 *  Explains WHY each country imports/exports oil, what makes them strategic. */

export interface CountryTradeProfile {
  role: { en: string; fr: string };
  whyExporter?: { en: string; fr: string };
  whyImporter?: { en: string; fr: string };
  keyFact: { en: string; fr: string };
}

export const countryTradeProfiles: Record<string, CountryTradeProfile> = {
  SAU: {
    role: { en: "Major exporter (OPEC leader)", fr: "Exportateur majeur (leader OPEP)" },
    whyExporter: {
      en: "Holds the world's 2nd largest proven oil reserves (~267 billion barrels). The state oil company Saudi Aramco is the world's most profitable company. Oil revenues fund 60-70% of the Saudi government budget.",
      fr: "Détient les 2e plus grandes réserves prouvées de pétrole au monde (~267 milliards de barils). Saudi Aramco est l'entreprise la plus rentable au monde. Les revenus pétroliers financent 60 à 70 % du budget saoudien.",
    },
    keyFact: { en: "Can increase production by ~2 Mb/d in 90 days — the world's only significant spare capacity.", fr: "Peut augmenter sa production de ~2 Mb/j en 90 jours — la seule capacité de réserve significative au monde." },
  },
  USA: {
    role: { en: "Top producer + top consumer + major exporter", fr: "1er producteur + 1er consommateur + exportateur majeur" },
    whyExporter: {
      en: "The shale revolution (2010s) made the US the world's #1 oil producer at ~13 Mb/d. Exports light sweet crude globally since the 2015 export ban lift. Still imports heavy crude for Gulf Coast refineries.",
      fr: "La révolution du schiste (années 2010) a fait des USA le 1er producteur mondial à ~13 Mb/j. Exporte du brut léger depuis la levée de l'interdiction d'export en 2015. Importe encore du brut lourd pour les raffineries du Golfe.",
    },
    keyFact: { en: "Became a net petroleum exporter in 2020 for the first time since 1949.", fr: "Devenu exportateur net de pétrole en 2020 pour la première fois depuis 1949." },
  },
  RUS: {
    role: { en: "Major exporter (sanctions-impacted)", fr: "Exportateur majeur (sous sanctions)" },
    whyExporter: {
      en: "World's 3rd largest oil producer. Since 2022 EU sanctions, Russia redirected exports from Europe to India and China at discounted prices. The Urals crude benchmark trades $10-20 below Brent.",
      fr: "3e producteur mondial de pétrole. Depuis les sanctions UE de 2022, la Russie a redirigé ses exports d'Europe vers l'Inde et la Chine à prix réduit. Le brut Oural se négocie 10 à 20 $ sous le Brent.",
    },
    keyFact: { en: "Oil & gas revenues represent ~40% of Russia's federal budget.", fr: "Les revenus pétrole & gaz représentent ~40 % du budget fédéral russe." },
  },
  FRA: {
    role: { en: "Net importer (no significant production)", fr: "Importateur net (production négligeable)" },
    whyImporter: {
      en: "France produces only 0.02 Mb/d (tiny fields in Paris Basin and overseas). Relies on diversified imports: USA (#1 since 2023), Nigeria, Kazakhstan, Algeria. Has 1.1 Mb/d refining capacity. 75% of electricity is nuclear, reducing oil dependency for power but transport still needs oil.",
      fr: "La France ne produit que 0,02 Mb/j (petits champs du Bassin parisien et outre-mer). S'appuie sur des imports diversifiés : USA (n°1 depuis 2023), Nigeria, Kazakhstan, Algérie. Capacité de raffinage de 1,1 Mb/j. 75 % de l'électricité est nucléaire, réduisant la dépendance au pétrole pour l'énergie mais le transport en a toujours besoin.",
    },
    keyFact: { en: "France's strategic reserves (180 Mb) cover ~120 days of consumption.", fr: "Les réserves stratégiques françaises (180 Mb) couvrent ~120 jours de consommation." },
  },
  DEU: {
    role: { en: "Major importer (industrial economy)", fr: "Importateur majeur (économie industrielle)" },
    whyImporter: {
      en: "Europe's largest economy and oil consumer. Germany's powerful chemical industry (BASF, Bayer) requires large petrochemical feedstock. Kazakhstan became #1 supplier (~30%) after the 2022 Russia pivot. Has significant refining capacity in Hamburg and Rhine region.",
      fr: "Plus grande économie et consommatrice de pétrole d'Europe. L'industrie chimique puissante (BASF, Bayer) nécessite d'importants intrants pétrochimiques. Le Kazakhstan est devenu le 1er fournisseur (~30 %) après le pivot russe de 2022. Capacité de raffinage importante à Hambourg et en Rhénanie.",
    },
    keyFact: { en: "Germany shut down its last nuclear plants in 2023, increasing energy vulnerability.", fr: "L'Allemagne a fermé ses dernières centrales nucléaires en 2023, augmentant sa vulnérabilité énergétique." },
  },
  NLD: {
    role: { en: "Major refining & trading hub", fr: "Hub de raffinage & trading majeur" },
    whyExporter: {
      en: "Rotterdam is Europe's largest port and #1 oil trading hub. The Netherlands imports crude, refines it, and re-exports refined products (diesel, gasoline, jet fuel) to neighboring countries. ARA (Amsterdam-Rotterdam-Antwerp) is the European oil pricing benchmark region.",
      fr: "Rotterdam est le plus grand port d'Europe et le 1er hub de trading pétrolier. Les Pays-Bas importent du brut, le raffinent et réexportent les produits raffinés (diesel, essence, kérosène) vers les pays voisins. ARA (Amsterdam-Rotterdam-Anvers) est la zone de référence européenne pour les prix du pétrole.",
    },
    keyFact: { en: "Rotterdam handles ~100 million tonnes of oil products per year.", fr: "Rotterdam traite ~100 millions de tonnes de produits pétroliers par an." },
  },
  NGA: {
    role: { en: "Major African exporter (OPEC member)", fr: "Exportateur africain majeur (membre OPEP)" },
    whyExporter: {
      en: "Africa's largest oil producer. Nigeria's Bonny Light is a premium sweet crude highly valued by European refineries. Oil represents 90% of export revenues but only 10% of GDP. Suffers from oil theft (~400,000 b/d stolen) and Niger Delta militancy.",
      fr: "Plus grand producteur de pétrole d'Afrique. Le Bonny Light nigérian est un brut doux premium très prisé par les raffineries européennes. Le pétrole représente 90 % des revenus d'exportation mais seulement 10 % du PIB. Souffre de vol de pétrole (~400 000 b/j volés) et du militantisme du delta du Niger.",
    },
    keyFact: { en: "Despite being a major oil exporter, Nigeria imports most of its gasoline due to broken refineries.", fr: "Bien qu'étant un exportateur majeur, le Nigeria importe l'essentiel de son essence en raison de raffineries défaillantes." },
  },
  KAZ: {
    role: { en: "Caspian exporter (growing importance)", fr: "Exportateur caspien (importance croissante)" },
    whyExporter: {
      en: "Kazakhstan's giant Kashagan and Tengiz fields produce high-quality crude. CPC pipeline exports via Black Sea to Europe. Became Germany's #1 and France's #3 supplier after EU shifted away from Russian crude in 2022.",
      fr: "Les champs géants Kashagan et Tengiz du Kazakhstan produisent un brut de haute qualité. Le pipeline CPC exporte via la mer Noire vers l'Europe. Devenu le 1er fournisseur de l'Allemagne et le 3e de la France après le pivot européen loin du brut russe en 2022.",
    },
    keyFact: { en: "Kashagan cost $55 billion to develop — the most expensive oil project in history.", fr: "Kashagan a coûté 55 milliards $ à développer — le projet pétrolier le plus cher de l'histoire." },
  },
  CHN: {
    role: { en: "World's #1 oil importer", fr: "1er importateur mondial de pétrole" },
    whyImporter: {
      en: "China imports ~11 Mb/d to fuel the world's largest manufacturing base. Buys heavily from Saudi Arabia, Russia (at discount), Iraq, and West Africa. Building the largest strategic petroleum reserve after the US. The 'Malacca Dilemma' drives investment in overland pipelines from Myanmar and Central Asia.",
      fr: "La Chine importe ~11 Mb/j pour alimenter la plus grande base industrielle mondiale. Achète massivement à l'Arabie saoudite, la Russie (avec remise), l'Irak et l'Afrique de l'Ouest. Construit la plus grande réserve stratégique après les USA. Le 'dilemme de Malacca' pousse à investir dans des pipelines terrestres depuis le Myanmar et l'Asie centrale.",
    },
    keyFact: { en: "China's oil imports are expected to reach 15 Mb/d by 2030.", fr: "Les importations de pétrole chinoises devraient atteindre 15 Mb/j d'ici 2030." },
  },
  JPN: {
    role: { en: "Major importer (almost zero production)", fr: "Importateur majeur (production quasi nulle)" },
    whyImporter: {
      en: "Japan has virtually no domestic oil resources. Imports ~98% of its oil, mostly from Middle East (Saudi Arabia, UAE, Kuwait). After the 2011 Fukushima nuclear disaster, oil and LNG dependence increased sharply. Maintains one of the world's largest strategic reserves (~500 million barrels).",
      fr: "Le Japon n'a pratiquement aucune ressource pétrolière domestique. Importe ~98 % de son pétrole, principalement du Moyen-Orient (Arabie saoudite, EAU, Koweït). Après Fukushima en 2011, la dépendance au pétrole et GNL a fortement augmenté. Maintient l'une des plus grandes réserves stratégiques au monde (~500 millions de barils).",
    },
    keyFact: { en: "A Hormuz blockade would cut off ~80% of Japan's oil supply within weeks.", fr: "Un blocage d'Ormuz couperait ~80 % de l'approvisionnement pétrolier du Japon en quelques semaines." },
  },
  IND: {
    role: { en: "3rd largest importer (fast-growing demand)", fr: "3e importateur (demande en forte croissance)" },
    whyImporter: {
      en: "India's 1.4 billion people drive rapid demand growth (~5 Mb/d consumption). Became a major buyer of discounted Russian crude since 2022 — Russia is now India's #1 supplier. Indian refineries (Jamnagar is the world's largest) process crude and re-export refined products to Europe and Africa.",
      fr: "Les 1,4 milliard d'habitants de l'Inde alimentent une demande en croissance rapide (~5 Mb/j). Devenu un acheteur majeur de brut russe à prix réduit depuis 2022 — la Russie est maintenant le 1er fournisseur de l'Inde. Les raffineries indiennes (Jamnagar est la plus grande au monde) traitent le brut et réexportent les produits raffinés vers l'Europe et l'Afrique.",
    },
    keyFact: { en: "India's Jamnagar refinery (1.4 Mb/d capacity) is larger than most countries' total refining capacity.", fr: "La raffinerie de Jamnagar en Inde (1,4 Mb/j de capacité) est plus grande que la capacité totale de raffinage de la plupart des pays." },
  },
  KOR: {
    role: { en: "Major importer & refining hub", fr: "Importateur majeur & hub de raffinage" },
    whyImporter: {
      en: "South Korea has zero domestic oil. Imports ~2.7 Mb/d to power Asia's 4th largest economy. SK Energy and GS Caltex are major Asian refiners that export refined products across Asia-Pacific.",
      fr: "La Corée du Sud n'a aucun pétrole domestique. Importe ~2,7 Mb/j pour alimenter la 4e économie asiatique. SK Energy et GS Caltex sont des raffineurs asiatiques majeurs qui exportent des produits raffinés dans toute l'Asie-Pacifique.",
    },
    keyFact: { en: "South Korea's economy is so oil-dependent that a 10% price increase reduces GDP growth by ~0.3%.", fr: "L'économie sud-coréenne est si dépendante du pétrole qu'une hausse de 10 % des prix réduit la croissance du PIB de ~0,3 %." },
  },
  IRQ: {
    role: { en: "Major OPEC exporter (post-war recovery)", fr: "Exportateur OPEP majeur (reconstruction post-guerre)" },
    whyExporter: {
      en: "Iraq holds the world's 5th largest proven reserves. Production recovered to ~4.5 Mb/d after decades of war. Basra crude is a key Middle Eastern benchmark. Oil revenue represents 95% of government income.",
      fr: "L'Irak détient les 5e plus grandes réserves prouvées au monde. La production a récupéré à ~4,5 Mb/j après des décennies de guerre. Le brut de Bassorah est un benchmark clé du Moyen-Orient. Les revenus pétroliers représentent 95 % des revenus du gouvernement.",
    },
    keyFact: { en: "Iraq's oil infrastructure was severely damaged in the 2003 invasion — production only recovered to pre-war levels in 2012.", fr: "L'infrastructure pétrolière irakienne a été gravement endommagée lors de l'invasion de 2003 — la production n'a retrouvé les niveaux d'avant-guerre qu'en 2012." },
  },
  DZA: {
    role: { en: "North African exporter (key for southern Europe)", fr: "Exportateur nord-africain (clé pour l'Europe du Sud)" },
    whyExporter: {
      en: "Algeria is a major supplier of crude and natural gas to southern Europe, especially France (historical ties), Spain, and Italy. The Saharan Blend is a light sweet crude ideal for Mediterranean refineries. Transmed and Medgaz pipelines supply gas to Europe.",
      fr: "L'Algérie est un fournisseur majeur de brut et de gaz naturel pour l'Europe du Sud, surtout la France (liens historiques), l'Espagne et l'Italie. Le Saharan Blend est un brut léger doux idéal pour les raffineries méditerranéennes. Les gazoducs Transmed et Medgaz alimentent l'Europe.",
    },
    keyFact: { en: "France-Algeria oil trade has roots in the colonial era — Algerian independence in 1962 didn't break energy ties.", fr: "Le commerce pétrolier France-Algérie a des racines coloniales — l'indépendance algérienne en 1962 n'a pas rompu les liens énergétiques." },
  },
  NOR: {
    role: { en: "European exporter (North Sea)", fr: "Exportateur européen (Mer du Nord)" },
    whyExporter: {
      en: "Norway is Western Europe's largest oil producer. The Government Pension Fund Global ($1.7 trillion), funded by oil revenues, is the world's largest sovereign wealth fund. Norwegian crude is prized for its short shipping distance to European refineries.",
      fr: "La Norvège est le plus grand producteur de pétrole d'Europe occidentale. Le fonds souverain ($1 700 milliards), financé par les revenus pétroliers, est le plus grand fonds souverain au monde. Le brut norvégien est prisé pour sa courte distance de transport vers les raffineries européennes.",
    },
    keyFact: { en: "Every Norwegian citizen is a 'petroleum millionaire' — the fund holds ~$330,000 per person.", fr: "Chaque citoyen norvégien est un 'millionnaire du pétrole' — le fonds détient ~330 000 $ par personne." },
  },
  SGP: {
    role: { en: "Asia's #1 refining & trading hub", fr: "1er hub de raffinage & trading d'Asie" },
    whyExporter: {
      en: "Singapore has zero oil but is Asia's refining capital. Imports crude, processes it at massive refineries (Shell Pulau Bukom), and re-exports refined products across Asia-Pacific. Also the world's #1 bunkering (ship refueling) port.",
      fr: "Singapour n'a aucun pétrole mais est la capitale asiatique du raffinage. Importe du brut, le traite dans d'immenses raffineries (Shell Pulau Bukom), et réexporte les produits raffinés dans toute l'Asie-Pacifique. Aussi le 1er port de soutage (ravitaillement maritime) au monde.",
    },
    keyFact: { en: "Singapore refines ~1.5 Mb/d — more than France — despite being a city-state of 6 million people.", fr: "Singapour raffine ~1,5 Mb/j — plus que la France — malgré une cité-État de 6 millions d'habitants." },
  },
  BRA: {
    role: { en: "Major producer (pre-salt deepwater)", fr: "Producteur majeur (pré-sel en eaux profondes)" },
    whyExporter: {
      en: "Brazil's pre-salt deepwater fields (Tupi, Búzios) transformed it from importer to exporter. Petrobras is a world leader in ultra-deepwater drilling. Production reached ~3.4 Mb/d in 2023. Exports light sweet crude to China and Europe.",
      fr: "Les champs pré-sel en eaux profondes du Brésil (Tupi, Búzios) l'ont transformé d'importateur en exportateur. Petrobras est un leader mondial du forage en ultra-profond. Production de ~3,4 Mb/j en 2023. Exporte du brut léger vers la Chine et l'Europe.",
    },
    keyFact: { en: "Brazil's pre-salt oil lies under 2km of water, 1km of rock, and 2km of salt — a technical marvel.", fr: "Le pétrole pré-sel brésilien se trouve sous 2 km d'eau, 1 km de roche et 2 km de sel — une prouesse technique." },
  },
  ARE: {
    role: { en: "Major Gulf exporter (Abu Dhabi)", fr: "Exportateur majeur du Golfe (Abu Dhabi)" },
    whyExporter: {
      en: "The UAE (mainly Abu Dhabi's ADNOC) produces ~3.4 Mb/d. Murban crude is a key global benchmark. The UAE is investing heavily in refining and petrochemicals (Ruwais complex) to move up the value chain. Also a major LNG exporter.",
      fr: "Les EAU (principalement ADNOC d'Abu Dhabi) produisent ~3,4 Mb/j. Le brut Murban est un benchmark mondial clé. Les EAU investissent massivement dans le raffinage et la pétrochimie (complexe de Ruwais) pour monter en gamme. Aussi un exportateur majeur de GNL.",
    },
    keyFact: { en: "The Habshan-Fujairah pipeline bypasses the Strait of Hormuz — the UAE's insurance policy against blockades.", fr: "Le pipeline Habshan-Fujairah contourne le détroit d'Ormuz — la police d'assurance des EAU contre les blocages." },
  },
  GBR: {
    role: { en: "Declining North Sea producer + major refiner", fr: "Producteur de la Mer du Nord en déclin + raffineur majeur" },
    whyImporter: {
      en: "UK North Sea production has declined from 2.7 Mb/d peak (1999) to ~0.7 Mb/d. Now a net importer. Brent crude (from the North Sea) remains the world's most important oil price benchmark despite declining production. London is the world's center for oil futures trading (ICE).",
      fr: "La production de la Mer du Nord britannique a décliné de 2,7 Mb/j au pic (1999) à ~0,7 Mb/j. Maintenant importateur net. Le Brent (de la Mer du Nord) reste le benchmark de prix du pétrole le plus important au monde malgré le déclin de la production. Londres est le centre mondial du trading de futures pétroliers (ICE).",
    },
    keyFact: { en: "Brent crude, named after a North Sea field, sets the price for 80% of the world's internationally traded oil.", fr: "Le Brent, nommé d'après un champ de la Mer du Nord, fixe le prix de 80 % du pétrole échangé internationalement." },
  },
};

/** Get trade profile for a country, returns undefined if not available */
export function getTradeProfile(code: string): CountryTradeProfile | undefined {
  return countryTradeProfiles[code];
}
