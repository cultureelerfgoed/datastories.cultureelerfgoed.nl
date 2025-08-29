// ====== Config ======
const ENDPOINT = "https://api.linkeddata.cultureelerfgoed.nl/datasets/rce/cho/services/cho/sparql";

// label -> URI (jouw lijst)
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

// SPARQL template met placeholder {{VALUES}}
const QUERY_TMPL = `
PREFIX graph: <https://linkeddata.cultureelerfgoed.nl/graph/>
PREFIX xsd:   <http://www.w3.org/2001/XMLSchema#>
PREFIX ceo:   <https://linkeddata.cultureelerfgoed.nl/def/ceo#>
PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>

SELECT ?jaar (COUNT(?rijksmonument) AS ?aantal)
WHERE {
  GRAPH graph:instanties-rce {
    ?rijksmonument a ceo:Rijksmonument ;
                   ceo:datumInschrijvingInMonumentenregister ?datumInschrijving ;
                   ceo:heeftOorspronkelijkeFunctie ?functie .
    ?functie ceo:heeftFunctieNaam ?uri .
    MINUS { ?rijksmonument ceo:heeftJuridischeStatus <https://data.cultureelerfgoed.nl/term/id/rn/3e79bb7c-b459-4998-a9ed-78d91d069227> }
  }
  GRAPH graph:bebouwdeomgeving {
    <https://data.cultureelerfgoed.nl/term/id/rn/1eeb48df-adbb-44b2-bcf1-33e3fe902413> skos:narrower ?narrow .
    ?narrow skos:prefLabel ?label_ .
    FILTER(?label_ = ?label)
    ?narrow skos:narrower+ ?uri .
    {{VALUES}}
  }
  BIND(year(xsd:dateTime(?datumInschrijving)) AS ?jaar)
  FILTER(?jaar >= 1964 && ?jaar <= 2026)
}
GROUP BY ?jaar
ORDER BY ?jaar
`;

function buildQuery(label, uri) {
  const values = `VALUES (?label ?narrow) { ("${label}" <${uri}>) }`;
  return QUERY_TMPL.replace("{{VALUES}}", values);
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
  if (!res.ok) throw new Error("SPARQL error: " + res.status + " " + res.statusText);
  return res.json();
}

google.charts.load("current", { packages: ["corechart"] });

function drawChart(json, label) {
  const rows = json.results.bindings.map(b => [ Number(b.jaar.value), Number(b.aantal.value) ])
                                   .sort((a,b)=>a[0]-b[0]);

  const data = new google.visualization.DataTable();
  data.addColumn("string", "Inschrijvingsjaar");
  data.addColumn("number", "aantal");
  data.addRows(rows.map(([y,n]) => [String(y), n]));

  const opts = {
    title: `Aantal monumenten per inschrijvingsjaar — ${label}`,
    legend: { position: "none" },
    width: "100%",
    height: 420,
    hAxis: { slantedText: true },
    bar: { groupWidth: "85%" }
  };
  new google.visualization.ColumnChart(document.getElementById("rm-chart")).draw(data, opts);
}

async function initRmWidget() {
  const sel = document.getElementById("rm-select");
  CATEGORIES.forEach(([label, uri]) => {
    const opt = document.createElement("option");
    opt.value = uri; opt.textContent = label; sel.appendChild(opt);
  });

  // standaardkeuze (pas aan naar wens)
  sel.value = CATEGORIES[CATEGORIES.length - 1][1]; // Woningen…

  async function refresh() {
    const uri   = sel.value;
    const label = sel.options[sel.selectedIndex].textContent;
    const query = buildQuery(label, uri);
    const json  = await runSparql(query);
    if (google.visualization?.ColumnChart) {
      drawChart(json, label);
    } else {
      google.charts.setOnLoadCallback(() => drawChart(json, label));
    }
  }

  sel.addEventListener("change", refresh);
  await refresh();
}

document.addEventListener("DOMContentLoaded", initRmWidget);
