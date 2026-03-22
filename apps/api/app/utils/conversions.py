"""Unit conversion utilities for oil & energy data.

The simulation engine works exclusively in Mb/d (million barrels per day)
and Mb (million barrels). The petrole-datas backbone stores data in TWh,
kb/d, Mbbl, etc. This module bridges the two worlds.

Conversion factors (OWID / Energy Institute methodology):
  - 1 barrel of oil equivalent ≈ 6.12 GJ ≈ 1.7 MWh (thermal)
  - 1 TWh = 1,000,000 MWh
  - So 1 TWh ≈ 588,235 barrels of oil equivalent

For annual TWh → daily Mb/d:
  Mb/d = TWh_per_year × 588_235 / 365 / 1_000_000
       = TWh_per_year × 0.001612
"""

# Barrels of oil equivalent per TWh (thermal)
BARRELS_PER_TWH = 588_235.0
DAYS_PER_YEAR = 365.0

# TWh/year → Mb/d
TWH_TO_MBPD = BARRELS_PER_TWH / DAYS_PER_YEAR / 1_000_000


def twh_to_mbpd(twh: float) -> float:
    """Convert annual TWh (thermal) to million barrels per day."""
    return round(twh * TWH_TO_MBPD, 4)


def mbpd_to_twh(mbpd: float) -> float:
    """Convert million barrels per day to annual TWh (thermal)."""
    if TWH_TO_MBPD == 0:
        return 0.0
    return round(mbpd / TWH_TO_MBPD, 3)


def kbd_to_mbpd(kbd: float) -> float:
    """Convert thousand barrels per day (kb/d) to Mb/d."""
    return round(kbd / 1000.0, 4)


def mbpd_to_kbd(mbpd: float) -> float:
    """Convert Mb/d to thousand barrels per day (kb/d)."""
    return round(mbpd * 1000.0, 1)


def mbbl_to_mb(mbbl: float) -> float:
    """Convert Mbbl (million barrels) to Mb — same unit, identity."""
    return mbbl


# ISO-2 ↔ ISO-3 mapping (petrole-datas uses ISO-2, PetroSim uses ISO-3)
ISO2_TO_ISO3 = {
    "US": "USA", "FR": "FRA", "CN": "CHN", "RU": "RUS", "SA": "SAU",
    "DE": "DEU", "JP": "JPN", "IN": "IND", "GB": "GBR", "BR": "BRA",
    "KR": "KOR", "IT": "ITA", "ES": "ESP", "NL": "NLD", "CA": "CAN",
    "MX": "MEX", "NO": "NOR", "AU": "AUS", "NG": "NGA", "DZ": "DZA",
    "LY": "LBY", "AO": "AGO", "AE": "ARE", "KW": "KWT", "QA": "QAT",
    "IQ": "IRQ", "IR": "IRN", "OM": "OMN", "BH": "BHR", "IL": "ISR",
    "TR": "TUR", "PL": "POL", "CZ": "CZE", "IE": "IRL", "AT": "AUT",
    "DK": "DNK", "HU": "HUN", "SE": "SWE", "FI": "FIN", "PT": "PRT",
    "GR": "GRC", "SK": "SVK", "NZ": "NZL", "BE": "BEL", "CH": "CHE",
    "RO": "ROU", "BG": "BGR", "HR": "HRV", "SI": "SVN", "LT": "LTU",
    "EE": "EST", "LV": "LVA", "ID": "IDN", "TH": "THA", "MY": "MYS",
    "SG": "SGP", "PH": "PHL", "VN": "VNM", "TW": "TWN", "PK": "PAK",
    "BD": "BGD", "MM": "MMR", "EG": "EGY", "ZA": "ZAF", "CO": "COL",
    "VE": "VEN", "EC": "ECU", "PE": "PER", "CL": "CHL", "TT": "TTO",
    "CU": "CUB", "BO": "BOL", "AR": "ARG", "KZ": "KAZ", "AZ": "AZE",
    "TM": "TKM", "UZ": "UZB", "BY": "BLR", "GH": "GHA", "CI": "CIV",
    "CM": "CMR", "TN": "TUN", "GA": "GAB", "CG": "COG", "GQ": "GNQ",
    "TD": "TCD", "SS": "SSD", "SD": "SDN", "YE": "YEM", "LB": "LBN",
    "GY": "GUY", "JO": "JOR", "SY": "SYR", "MZ": "MOZ",
}

ISO3_TO_ISO2 = {v: k for k, v in ISO2_TO_ISO3.items()}


def iso2_to_iso3(code: str) -> str:
    """Convert ISO-2 country code to ISO-3."""
    return ISO2_TO_ISO3.get(code.upper(), code.upper())


def iso3_to_iso2(code: str) -> str:
    """Convert ISO-3 country code to ISO-2."""
    return ISO3_TO_ISO2.get(code.upper(), code.upper())
