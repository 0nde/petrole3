"""API routes for geographic data (country boundaries GeoJSON proxy)."""

from __future__ import annotations

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/geo", tags=["geo"])

# Natural Earth 110m admin boundaries (~530KB) — lightweight, has ISO_A3 property
_NE_URL = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson"

# In-memory cache
_cached_geojson: dict | None = None


@router.get("/countries")
async def get_country_boundaries():
    """Return simplified country boundary polygons as GeoJSON.
    Fetched once from Natural Earth 110m and cached in memory."""
    global _cached_geojson

    if _cached_geojson is not None:
        return JSONResponse(content=_cached_geojson, headers={"Cache-Control": "public, max-age=86400"})

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            resp = await client.get(_NE_URL, headers={"User-Agent": "PetroSim/1.0"})
            resp.raise_for_status()
            geojson = resp.json()

            # Strip unnecessary properties to reduce payload size
            if "features" in geojson:
                for feature in geojson["features"]:
                    props = feature.get("properties", {})
                    feature["properties"] = {
                        "ISO_A3": props.get("ISO_A3", ""),
                        "NAME": props.get("NAME", ""),
                        "ISO_A3_EH": props.get("ISO_A3_EH", props.get("ISO_A3", "")),
                    }

            _cached_geojson = geojson
            return JSONResponse(content=geojson, headers={"Cache-Control": "public, max-age=86400"})
    except Exception as e:
        return JSONResponse(
            content={"type": "FeatureCollection", "features": []},
            status_code=200,
            headers={"X-Error": str(e)[:200]},
        )
