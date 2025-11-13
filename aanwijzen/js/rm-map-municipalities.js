(() => {
  // ===== CONFIG =====
  const ENDPOINT = "https://api.linkeddata.cultureelerfgoed.nl/datasets/rce/cho/services/cho/sparql";

  // Top-20 gemeenten (OWMS labels, NL). Default: Amsterdam
  const MUNICIPALITIES = [
    "Amsterdam",
    "Rotterdam",
    "Maastricht",
    "'s-Gravenhage",
    "Leiden",
    "Utrecht",
    "Haarlem",
    "Groningen",
    "Delft",
    "Leeuwarden",
    "Dordrecht",
    "Middelburg",
    "Arnhem",
    "'s-Hertogenbosch",
    "Breda",
    "Deventer",
    "Nijmegen",
    "Amersfoort",
    "Gouda",
    "Zwolle"
  ];

  // ===== SPARQL =====
  // Filter op gemeente (NL label, exacte stringvergelijking) + inschrijvingsjaren.
  // Neem alle subfuncties onder de hoofdcategorieboom (zoals in je voorbeeld),
  // en bouw een HTML-label met link naar het RM-nummer.
  const QUERY_TMPL = `
PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>
PREFIX owms:  <http://standaarden.overheid.nl/owms/terms/>
PREFIX overheid: <http://standaarden.overheid.nl/owms/terms/>
PREFIX graph: <https://linkeddata.cultureelerfgoed.nl/graph/>
PREFIX xsd:   <http://www.w3.org/2001/XMLSchema#>
PREFIX ceo:   <https://linkeddata.cultureelerfgoed.nl/def/ceo#>
PREFIX geo:   <http://www.opengis.net/ont/geosparql#>
PREFIX rn:    <https://data.cultureelerfgoed.nl/term/id/rn/2/>

SELECT ?shape ?shapeLabel ?wkt ?jaarInschrijving
WHERE {
  GRAPH graph:instanties-rce {
    ?rijksmonument a ceo:Rijksmonument ;
      ceo:datumInschrijvingInMonumentenregister ?datumInschrijving ;
      ceo:heeftOorspronkelijkeFunctie ?functie ;
      ceo:rijksmonumentnummer ?rmnr ;
      ceo:heeftBasisregistratieRelatie/ceo:heeftGemeente ?gem ;
      ceo:heeftGeometrie/geo:asWKT ?wkt .
    ?functie ceo:heeftFunctieNaam ?uri .

    MINUS { ?rijksmonument ceo:heeftJuridischeStatus rn:3e79bb7c-b459-4998-a9ed-78d91d069227 }

    BIND(year(xsd:dateTime(?datumInschrijving)) AS ?jaarInschrijving)
    FILTER (?jaarInschrijving >= {{BEGIN}} && ?jaarInschrijving <= {{EIND}})
  }

  GRAPH graph:owms {
    ?gem skos:prefLabel ?gemeenteLabel .
    FILTER (LANG(?gemeenteLabel) = "nl" && STR(?gemeenteLabel) = "{{GEMEENTE}}")
  }

  GRAPH graph:bebouwdeomgeving {
    # Hoofdcategorieboom ⇒ subbegrippen ⇒ nette sublabel zonder haakjes
    <https://data.cultureelerfgoed.nl/term/id/rn/2/1eeb48df-adbb-44b2-bcf1-33e3fe902413> skos:narrower ?narrow .
    VALUES (?narrowLabel ?narrow) {
      ("Archeologie (N)" <https://data.cultureelerfgoed.nl/term/id/rn/2/d60159d2-8b55-47b7-8301-5ac82b0f2d7f>)
      ("Bestuursgebouwen, rechtsgebouwen en overheidsgebouwen" <https://data.cultureelerfgoed.nl/term/id/rn/2/74a847b5-1e0f-4f66-b910-90d2c8d9fa04>)
      ("Boerderijen, molens en bedrijven" <https://data.cultureelerfgoed.nl/term/id/rn/2/b8077035-db8f-47f1-ae1d-e64f75344fcf>)
      ("Cultuur, gezondheid en wetenschap" <https://data.cultureelerfgoed.nl/term/id/rn/2/0be0a6c9-0738-41cc-aaac-550d258c4261>)
      ("Handelsgebouwen, opslag- en transportgebouwen" <https://data.cultureelerfgoed.nl/term/id/rn/2/e88ccbf4-e41d-49bf-9876-0f71db0e6646>)
      ("Kastelen, landhuizen en parken" <https://data.cultureelerfgoed.nl/term/id/rn/2/b2511baf-3b70-4667-98dd-1b850c7ea53f>)
      ("Religieuze gebouwen" <https://data.cultureelerfgoed.nl/term/id/rn/2/25fac0f1-77a2-4587-ab04-dfcb66959dd8>)
      ("Sport, recreatie, vereniging en horeca" <https://data.cultureelerfgoed.nl/term/id/rn/2/b797b89c-1e0a-4ce7-869b-817cd98259b0>)
      ("Uitvaartcentra en begraafplaatsen" <https://data.cultureelerfgoed.nl/term/id/rn/2/1680dfc0-666a-4a01-9781-59e9af26ec51>)
      ("Verdedigingswerken en militaire gebouwen" <https://data.cultureelerfgoed.nl/term/id/rn/2/5013dcbc-1090-42e9-bc22-92de47e43783>)
      ("Voorwerpen op pleinen en dergelijke" <https://data.cultureelerfgoed.nl/term/id/rn/2/92cda3e4-8c6a-41dc-9a81-02f8aba88b25>)
      ("Weg- en waterbouwkundige werken" <https://data.cultureelerfgoed.nl/term/id/rn/2/11c897ed-d35e-4191-9254-7ab95d9d63bc>)
      ("Woningen en woningbouwcomplexen" <https://data.cultureelerfgoed.nl/term/id/rn/2/5b7dd16c-fa8d-4d68-984a-9ec0efc650d4>)
    }
    ?narrow skos:narrower+ ?uri .
    ?uri skos:prefLabel ?uriSub .
    BIND(REPLACE(STR(?uriSub), "\\\\s\\\\(.*\\\\)|\\\\(.*\\\\)", "") AS ?uriSubs)
  }

  # Bouw een nette HTML-tekst zoals in je voorbeeld
  BIND(
    strdt(
      concat(?uriSubs, " - ", STR(?jaarInschrijving), " - rijksmonument ",
        "<a href=\\"https://monumentenregister.cultureelerfgoed.nl/monumenten/", STR(?rmnr),
        "\\" target=\\"_blank\\" rel=\\"noopener\\">", STR(?rmnr), "</a>"
      ),
      rdf:HTML
    )
    AS ?shapeLabel
  )
  BIND(?wkt AS ?shape)    # alias tbv consistentie met geo-viz
}
LIMIT 5000
`;

  function buildQuery(gemeente, begin, eind) {
    return QUERY_TMPL
      .replaceAll("{{GEMEENTE}}", gemeente.replace(/"/g, '\\"'))
      .replaceAll("{{BEGIN}}", String(begin))
      .replaceAll("{{EIND}}", String(eind));
  }

  async function runSparql(query) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Accept": "application/sparql-results+json",
        "Content-Type": "application/sparql-query; charset=utf-8"
      },
      body: query
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`SPARQL ${res.status} ${res.statusText}${txt ? ` — ${txt}` : ""}`);
    }
    return res.json();
  }

  // ===== WKT → [lat, lon] (POINT én eerste coord van POLYGON/LINESTRING) =====
  function wktToLatLng(wkt) {
    if (!wkt) return null;
    const s = String(wkt).trim();

    // POINT(lon lat)
    let m = s.match(/^POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)$/i);
    if (m) return [parseFloat(m[2]), parseFloat(m[1])];

    // LINESTRING(...) of POLYGON((...)) : pak eerste coördinaatpaar
    m = s.match(/\(\s*([-\d.]+)\s+([-\d.]+)/);
    if (m) return [parseFloat(m[2]), parseFloat(m[1])];

    return null;
  }

  // ===== Leaflet kaart =====
  let map, layer;
  function ensureMap() {
    if (map) return map;
    map = L.map("mm-map", { preferCanvas: true }).setView([52.1, 5.3], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
    return map;
  }

  function renderOnMap(rows) {
    ensureMap();
    layer.clearLayers();

    if (!rows.length) {
      L.popup().setLatLng(map.getCenter())
        .setContent("Geen resultaten voor deze selectie.")
        .openOn(map);
      return;
    }

    const bounds = [];
    rows.forEach(r => {
      const latlng = wktToLatLng(r.wkt?.value || r.shape?.value);
      if (!latlng) return;
      bounds.push(latlng);

      const html = r.shapeLabel?.value ||
        `<div style="min-width:220px">Rijksmonument</div>`;

      L.marker(latlng).bindPopup(html, { maxWidth: 320 }).addTo(layer);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [16, 16] });
  }

  // ===== INIT UI =====
  document.addEventListener("DOMContentLoaded", () => {
    const selGem = document.getElementById("mm-gemeente");
    const inBeg = document.getElementById("mm-begin");
    const inEind = document.getElementById("mm-eind");
    const btnRun = document.getElementById("mm-run");

    // Dropdown vullen
    // Zet "Amsterdam (default)" als label bovenaan, maar waarde = "Amsterdam"
    const optDefault = document.createElement("option");
    optDefault.value = "Amsterdam";
    optDefault.textContent = "Amsterdam (default)";
    selGem.appendChild(optDefault);

    MUNICIPALITIES.forEach((g) => {
      const o = document.createElement("option");
      o.value = g; o.textContent = g;
      selGem.appendChild(o);
    });

    // Defaults
    selGem.value = "Amsterdam";
    if (!inBeg.value) inBeg.value = 1965;
    if (!inEind.value) inEind.value = 1969;

    async function run() {
      try {
        btnRun.disabled = true;
        const begin = Math.max(1961, Math.min(2026, Number(inBeg.value) || 1961));
        const eind = Math.max(begin, Math.min(2026, Number(inEind.value) || 2026));
        inBeg.value = begin; inEind.value = eind;

        const gem = selGem.value;
        const q = buildQuery(gem, begin, eind);
        console.log("[rm-map-municipalities] query →\n", q);

        const json = await runSparql(q);
        const rows = json?.results?.bindings || [];
        console.log("[rm-map-municipalities] rows:", rows.length);

        renderOnMap(rows);
      } catch (e) {
        console.error(e);
        ensureMap();
        layer.clearLayers();
        L.popup()
          .setLatLng(map.getCenter())
          .setContent(`<div class="alert alert-warning">Kon data niet laden: ${L.Util.escapeHtml(e.message)}</div>`)
          .openOn(map);
      } finally {
        btnRun.disabled = false;
      }
    }

    btnRun.addEventListener("click", run);
    run(); // eerste run
  });
})();
