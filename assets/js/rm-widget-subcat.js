// --- CONFIG ---
const ENDPOINT = "https://api.linkeddata.cultureelerfgoed.nl/datasets/rce/cho/services/cho/sparql";

// label -> uri (exact als jouw VALUES-lijst)
const CATEGORIES = [
  ["Archeologie (N)", "https://data.cultureelerfgoed.nl/term/id/rn/d60159d2-8b55-47b7-8301-5ac82b0f2d7f"],
  ["Bestuursgebouwen, rechtsgebouwen en overheidsgebouwen", "https://data.cultureelerfgoed.nl/term/id/rn/74a847b5-1e0f-4f66-b910-90d2c8d9fa04"],
  ["Boerderijen, molens en bedrijven", "https://data.cultureelerfgoed.nl/term/id/rn/b8077035-db8f-47f1-ae1d-e64f75344fcf"],
  ["Cultuur, gezondheid en wetenschap", "https://data.cultureelerfgoed.nl/term/id/rn/0be0a6c9-0738-41cc-aaac-550d258c4261"],
  ["Handelsgebouwen, opslag- en transportgebouwen", "https://data.cultureelerfgoed.nl/term/id/rn/e88ccbf4-e41d-49bf-9876-0f71db0e6646"],
  ["Kastelen, landhuizen en parken", "https://data.cultureelerfgoed.nl/term/id/rn/b2511baf-3b70-4667-98dd-1b850c7ea53f"],
  ["N.V.T.", "https://data.cultureelerfgoed.nl/term/id/rn/8d4228b6-7f8d-4b78-b870-901879af8c04"],
  ["Religieuze gebouwen", "https://data.cultureelerfgoed.nl/term/id/rn/25fac0f1-77a2-4587-ab04-dfcb66959dd8"],
  ["Sport, recreatie, vereniging en horeca", "https://data.cultureelerfgoed.nl/term/id/rn/b797b89c-1e0a-4ce7-869b-817cd98259b0"],
  ["Uitvaartcentra en begraafplaatsen", "https://data.cultureelerfgoed.nl/term/id/rn/1680dfc0-666a-4a01-9781-59e9af26ec51"],
  ["Verdedigingswerken en militaire gebouwen", "https://data.cultureelerfgoed.nl/term/id/rn/5013dcbc-1090-42e9-bc22-92de47e43783"],
  ["Voorwerpen op pleinen en dergelijke", "https://data.cultureelerfgoed.nl/term/id/rn/92cda3e4-8c6a-41dc-9a81-02f8aba88b25"],
  ["Weg- en waterbouwkundige werken", "https://data.cultureelerfgoed.nl/term/id/rn/11c897ed-d35e-4191-9254-7ab95d9d63bc"],
  ["Woningen en woningbouwcomplexen", "https://data.cultureelerfgoed.nl/term/id/rn/5b7dd16c-fa8d-4d68-984a-9ec0efc650d4"]
];

// --- SPARQL TEMPLATE ---
// BELANGRIJK: géén Triply-variabelen meer (zoals ?beginJaarInschrijving); we plakken nummers in.
const QUERY_TMPL = `
PREFIX graph: <https://linkeddata.cultureelerfgoed.nl/graph/>
PREFIX xsd:   <http://www.w3.org/2001/XMLSchema#>
PREFIX ceo:   <https://linkeddata.cultureelerfgoed.nl/def/ceo#>
PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>

SELECT ?uriSubs (COUNT(DISTINCT ?rijksmonumentnummer) AS ?aantal)
WHERE {
  GRAPH graph:instanties-rce {
    ?rijksmonument a ceo:Rijksmonument ;
                   ceo:datumInschrijvingInMonumentenregister ?datumInschrijving ;
                   ceo:heeftOorspronkelijkeFunctie ?functie ;
                   ceo:rijksmonumentnummer ?rijksmonumentnummer .
    ?functie ceo:heeftFunctieNaam ?uri .
    MINUS { ?rijksmonument ceo:heeftJuridischeStatus <https://data.cultureelerfgoed.nl/term/id/rn/3e79bb7c-b459-4998-a9ed-78d91d069227> }

    BIND(year(xsd:dateTime(?datumInschrijving)) AS ?jaarInschrijving)
    FILTER (?jaarInschrijving >= {{BEGIN}} && ?jaarInschrijving <= {{EIND}})
  }
  GRAPH graph:bebouwdeomgeving {
    <https://data.cultureelerfgoed.nl/term/id/rn/1eeb48df-adbb-44b2-bcf1-33e3fe902413> skos:narrower ?narrow .
    ?narrow skos:prefLabel ?label_ .
    # vergelijk zonder taal-tag en strip "(default)" van de UI-waarde
    BIND(REPLACE("{{LABEL}}", "\\\\s*\\\\(default\\\\)\\\\s*$", "") AS ?labelClean)
    FILTER(STR(?label_) = ?labelClean)

    ?narrow skos:narrower+ ?uri .
    ?uri skos:prefLabel ?uriSub .
    BIND(REPLACE(STR(?uriSub), "\\\\s\\\\(.*\\\\)|\\\\(.*\\\\)", "") AS ?uriSubs)
  }
}
GROUP BY ?uriSubs
ORDER BY DESC(?aantal)
`;

// --- HELPERS ---
function buildQuery(label, narrowUri, begin, eind) {
  return QUERY_TMPL
    .replaceAll("{{LABEL}}", label.replace(/"/g, '\\"'))
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
  if (!res.ok) throw new Error(`SPARQL ${res.status} ${res.statusText}`);
  return res.json();
}

// --- CHART ---
google.charts.load("current", { packages: ["corechart"] });

function drawPie3D(json, label, begin, eind) {
  const el = document.getElementById("sc-chart");
  const b  = json.results.bindings || [];
  if (!b.length) {
    el.innerHTML = `<div class="alert alert-info">Geen resultaten voor ${label} (${begin}–${eind}).</div>`;
    return;
  }
  const data = new google.visualization.DataTable();
  data.addColumn("string", "Subcategorie");
  data.addColumn("number", "aantal");
  b.forEach(row => data.addRow([ row.uriSubs.value, Number(row.aantal.value) ]));

  const opts = {
    title: `Subcategorieën — ${label} (${begin}–${eind})`,
    width: "100%",
    height: 420,
    legend: { position: "right" },
    is3D: true,
    sliceVisibilityThreshold: 0
  };
  new google.visualization.PieChart(el).draw(data, opts);
}

// --- INIT (na DOM renderen) ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("[subcat] init");
  const sel    = document.getElementById("sc-label");
  const inBeg  = document.getElementById("sc-begin");
  const inEind = document.getElementById("sc-eind");
  const btn    = document.getElementById("sc-run");

  if (!sel) {
    console.error("[subcat] #sc-label niet gevonden. Staat het HTML-blok boven de scripts?");
    return;
  }

  // dropdown vullen
  CATEGORIES.forEach(([label, uri]) => {
    const o = document.createElement("option");
    o.value = uri; o.textContent = label; sel.appendChild(o);
  });
  // default: "Kastelen, landhuizen en parken" (of eerste)
  sel.value = (CATEGORIES.find(c => c[0] === "Kastelen, landhuizen en parken") || CATEGORIES[0])[1];

  async function refresh() {
    try {
      const narrow = sel.value;
      const label  = sel.options[sel.selectedIndex].textContent;
      const begin  = Math.max(1961, Math.min(2026, Number(inBeg.value || 1961)));
      const eind   = Math.max(begin, Math.min(2026, Number(inEind.value || 2026)));
      inBeg.value = begin; inEind.value = eind;

      const q = buildQuery(label, narrow, begin, eind);
      console.log("[subcat] query →\n", q);
      const json = await runSparql(q);
      console.log("[subcat] rows:", json.results.bindings.length);

      if (google.visualization?.PieChart) drawPie3D(json, label, begin, eind);
      else google.charts.setOnLoadCallback(() => drawPie3D(json, label, begin, eind));
    } catch (e) {
      document.getElementById("sc-chart").innerHTML =
        `<div class="alert alert-warning">Kon data niet laden: ${e.message}</div>`;
      console.error(e);
    }
  }

  btn?.addEventListener("click", refresh);
  // eerste render
  refresh();
});
