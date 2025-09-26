(() => {
  // ===== CONFIG =====
  const ENDPOINT = "https://api.linkeddata.cultureelerfgoed.nl/datasets/rce/cho/services/cho/sparql";

  // Hoofdcategorie -> URI
  const CATEGORIES = [
    ["Archeologie (N)", "https://data.cultureelerfgoed.nl/term/id/rn/d60159d2-8b55-47b7-8301-5ac82b0f2d7f"],
    ["Bestuursgebouwen, rechtsgebouwen en overheidsgebouwen", "https://data.cultureelerfgoed.nl/term/id/rn/74a847b5-1e0f-4f66-b910-90d2c8d9fa04"],
    ["Boerderijen, molens en bedrijven", "https://data.cultureelerfgoed.nl/term/id/rn/b8077035-db8f-47f1-ae1d-e64f75344fcf"],
    ["Cultuur, gezondheid en wetenschap", "https://data.cultureelerfgoed.nl/term/id/rn/0be0a6c9-0738-41cc-aaac-550d258c4261"],
    ["Handelsgebouwen, opslag- en transportgebouwen", "https://data.cultureelerfgoed.nl/term/id/rn/e88ccbf4-e41d-49bf-9876-0f71db0e6646"],
    ["Kastelen, landhuizen en parken", "https://data.cultureelerfgoed.nl/term/id/rn/b2511baf-3b70-4667-98dd-1b850c7ea53f"],
    ["Religieuze gebouwen", "https://data.cultureelerfgoed.nl/term/id/rn/25fac0f1-77a2-4587-ab04-dfcb66959dd8"],
    ["Sport, recreatie, vereniging en horeca", "https://data.cultureelerfgoed.nl/term/id/rn/b797b89c-1e0a-4ce7-869b-817cd98259b0"],
    ["Uitvaartcentra en begraafplaatsen", "https://data.cultureelerfgoed.nl/term/id/rn/1680dfc0-666a-4a01-9781-59e9af26ec51"],
    ["Verdedigingswerken en militaire gebouwen", "https://data.cultureelerfgoed.nl/term/id/rn/5013dcbc-1090-42e9-bc22-92de47e43783"],
    ["Voorwerpen op pleinen en dergelijke", "https://data.cultureelerfgoed.nl/term/id/rn/92cda3e4-8c6a-41dc-9a81-02f8aba88b25"],
    ["Weg- en waterbouwkundige werken", "https://data.cultureelerfgoed.nl/term/id/rn/11c897ed-d35e-4191-9254-7ab95d9d63bc"],
    ["Woningen en woningbouwcomplexen", "https://data.cultureelerfgoed.nl/term/id/rn/5b7dd16c-fa8d-4d68-984a-9ec0efc650d4"]
  ];

  // Provincie-labels (NL)
  const PROVINCES = [
    "Drenthe", "Fryslân", "Flevoland", "Groningen", "Limburg", "Noord-Brabant", "Noord-Holland",
    "Gelderland", "Overijssel", "Utrecht", "Zeeland", "Zuid-Holland"
  ];

  // ===== SPARQL: filter op (label, URI) van hoofdcategorie + provincie + jaartal
  const QUERY_TMPL = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owms: <http://standaarden.overheid.nl/owms/terms/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX graph: <https://linkeddata.cultureelerfgoed.nl/graph/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX ceo: <https://linkeddata.cultureelerfgoed.nl/def/ceo#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rn: <https://data.cultureelerfgoed.nl/term/id/rn/>

SELECT ?rmnr ?jaarInschrijving ?wkt ?uriSubs ?provLabel
WHERE {
  GRAPH graph:instanties-rce {
    ?rm a ceo:Rijksmonument ;
        ceo:datumInschrijvingInMonumentenregister ?datum ;
        ceo:heeftOorspronkelijkeFunctie ?functie ;
        ceo:rijksmonumentnummer ?rmnr ;
        ceo:heeftBasisregistratieRelatie/ceo:heeftProvincie ?prov .
    OPTIONAL { ?rm ceo:heeftGeometrie/geo:asWKT ?wkt }
    ?functie ceo:heeftFunctieNaam ?uri .
    MINUS { ?rm ceo:heeftJuridischeStatus rn:3e79bb7c-b459-4998-a9ed-78d91d069227 }
    BIND(year(xsd:dateTime(?datum)) AS ?jaarInschrijving)
    FILTER (?jaarInschrijving >= {{BEGIN}} && ?jaarInschrijving <= {{EIND}})
  }
  # Koppel provincie op NL-label
  GRAPH graph:owms {
    ?prov skos:prefLabel ?provLabel .
    FILTER(LANG(?provLabel) = "nl" && STR(?provLabel) = "{{PROV}}")
  }
  # Koppel gekozen hoofdcategorie -> alle onderliggende begrippen (incl. zichzelf)
  GRAPH graph:bebouwdeomgeving {
    VALUES (?label ?narrow) {
      ("{{LABEL_RAW}}" <{{NARROW}}>)
    }
    ?narrow skos:narrower* ?uri .
    ?uri skos:prefLabel ?uriSub .
    BIND(REPLACE(STR(?uriSub), "\\s\\(.*\\)|\\(.*\\)", "") AS ?uriSubs)
  }
}
LIMIT 4000`;

  // ===== HULPFUNCTIES =====
  function buildQuery(labelRaw, narrowUri, begin, eind, provLabel) {
    return QUERY_TMPL
      .replaceAll("{{LABEL_RAW}}", labelRaw.replace(/"/g, '\\"'))
      .replaceAll("{{NARROW}}", narrowUri)
      .replaceAll("{{BEGIN}}", String(begin))
      .replaceAll("{{EIND}}", String(eind))
      .replaceAll("{{PROV}}", provLabel.replace(/"/g, '\\"'));
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
      const errorText = await res.text();
      throw new Error(`SPARQL ${res.status} ${res.statusText}: ${errorText}`);
    }

    return res.json();
  }

  // WKT -> [lat, lon]
  function wktToLatLng(wkt) {
    if (!wkt) return null;
    const s = String(wkt).trim();
    const pointMatch = s.match(/^POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)$/i);
    if (pointMatch) return [parseFloat(pointMatch[2]), parseFloat(pointMatch[1])];
    return null;
  }

  // ===== KAART =====
  let map, layer;

  function ensureMap() {
    if (map) return map;
    map = L.map("mp-map", { preferCanvas: true }).setView([52.1, 5.3], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
      const latlng = wktToLatLng(r.wkt?.value);
      if (!latlng) return;

      bounds.push(latlng);
      const rm = r.rmnr?.value || "";
      const jaar = r.jaarInschrijving?.value || "";
      const sub = r.uriSubs?.value || "";
      const link = rm ? `https://monumentenregister.cultureelerfgoed.nl/monumenten/${rm}` : null;

      const html = `
        <div style="min-width:220px">
          <div><strong>${L.Util.escapeHtml(sub)}</strong></div>
          <div>Jaar: ${L.Util.escapeHtml(jaar)}</div>
          ${link ? `<div>RM: <a href="${link}" target="_blank" rel="noopener">${L.Util.escapeHtml(rm)}</a></div>` : ""}
        </div>`;

      L.marker(latlng).bindPopup(html).addTo(layer);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [16, 16] });
  }

  // ===== INIT =====
  document.addEventListener("DOMContentLoaded", () => {
    const selLabel = document.getElementById("mp-label");
    const inBeg = document.getElementById("mp-begin");
    const inEind = document.getElementById("mp-eind");
    const selProv = document.getElementById("mp-prov");
    const btnRun = document.getElementById("mp-run");

    // Dropdowns vullen
    CATEGORIES.forEach(([label, uri]) => {
      const o = document.createElement("option");
      o.value = uri;
      o.textContent = label;
      selLabel.appendChild(o);
    });

    PROVINCES.forEach(p => {
      const o = document.createElement("option");
      o.value = p;
      o.textContent = p;
      selProv.appendChild(o);
    });

    // Defaults
    selLabel.value = CATEGORIES.find(c => c[0] === "Kastelen, landhuizen en parken")?.[1] || CATEGORIES[0][1];
    selProv.value = "Utrecht";

    // Run functie
    async function run() {
      try {
        btnRun.disabled = true;
        btnRun.textContent = "Laden...";

        const narrow = selLabel.value;
        const labelRaw = selLabel.options[selLabel.selectedIndex].textContent;
        const begin = Math.max(1961, Math.min(2026, Number(inBeg.value) || 1961));
        const eind = Math.max(begin, Math.min(2026, Number(inEind.value) || 2026));
        const prov = selProv.value;

        inBeg.value = begin;
        inEind.value = eind;

        // Debug logging
        console.log("Label:", labelRaw);
        console.log("Narrow URI:", narrow);
        console.log("Begin jaar:", begin);
        console.log("Eind jaar:", eind);
        console.log("Provincie:", prov);

        const q = buildQuery(labelRaw, narrow, begin, eind, prov);
        console.log("[map-prov] query →\n", q);

        const json = await runSparql(q);
        const rows = json?.results?.bindings || [];
        console.log("[map-prov] rows:", rows.length);

        renderOnMap(rows);
      } catch (e) {
        console.error(e);
        ensureMap();
        layer.clearLayers();
        L.popup().setLatLng(map.getCenter())
          .setContent(`<div class="alert alert-warning">Kon data niet laden: ${L.Util.escapeHtml(e.message)}</div>`)
          .openOn(map);
      } finally {
        btnRun.disabled = false;
        btnRun.textContent = "Uitvoeren";
      }
    }

    btnRun.addEventListener("click", run);
    run(); // Eerste run
  });
})();
