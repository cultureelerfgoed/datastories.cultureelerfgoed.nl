# RCE Datastories — Handleiding & Checklist

Deze handleiding beschrijft hoe je een nieuwe datastory maakt, publiceert en opneemt op [datastories.cultureelerfgoed.nl](https://datastories.cultureelerfgoed.nl). Onderin vind je een korte én uitgebreide checklist.

---

## 1. Structuur van de site

```
/
├─ index.html                 ← Landingpagina
├─ template/
│  └─ template.html           ← Startpunt voor nieuwe stories
├─ [story-map]/               ← Eén map per story
├─ assets/
│  ├─ css/
│  ├─ js/
│  ├─ imgs/
│  └─ manifest.webmanifest
├─ CNAME
└─ README.md
```

---

## 2. Nieuwe story aanmaken

1. Kopieer `template/template.html` naar een nieuwe map, bijv. `verloren-erfgoed/`
2. Hernoem het bestand naar `verloren-erfgoed.html`
3. Pas de inhoud, metadata en queries aan (zie volgende secties)
4. Voeg eventuele afbeeldingen toe aan `assets/imgs/`
5. Voeg een bannerblok toe in `index.html` (zie bestaande stories als voorbeeld)
6. Commit + push → GitHub Pages publiceert automatisch

---

## 3. Head & metadata

- `<title>` – unieke, korte titel
- `<meta name="description">` – max. 155 tekens
- `<link rel="canonical">` – definitieve URL (géén `.html`)
- Open Graph tags: `og:title`, `og:description`, `og:url`, `og:image`
- Twitter card: `summary_large_image`
- JSON-LD (schema.org Article), bijv.:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Titel van de datastory",
  "description": "Korte omschrijving...",
  "author": { "@type": "Organization", "name": "Rijksdienst voor het Cultureel Erfgoed" },
  "datePublished": "2024-10-28",
  "dateModified": "2024-10-28",
  "mainEntityOfPage": "https://datastories.cultureelerfgoed.nl/jouw-story/"
}
```

---

## 4. Navigatie & structuur

- Gebruik altijd een **skiplink** bovenaan:
  ```html
  <a href="#main" class="visually-hidden-focusable">Direct naar hoofdinhoud</a>
  ```
- Eén `<h1>` per pagina
- Gebruik logische koppen: `<h2>` voor hoofdsecties, `<h3>` voor subsecties
- Gebruik `<main>` met `aria-label`, bijv.:
  ```html
  <main id="main" class="container story" aria-label="Titel van de datastory">
  ```

---

## 5. Queries & visualisaties

- Omring `<query>` elementen met `<figure>` + `<figcaption>`
- Voeg altijd `aria-labelledby` en `aria-describedby` toe
- Voeg fallback toe in `<query>`: uitleg of link naar data

Voorbeeld:

```html
<figure role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">
  <h3 id="chart-title" class="visually-hidden">Aantal afgevoerde rijksmonumenten</h3>
  <query data-config="...">
    <p class="visually-hidden">Alternatief: open de data als tabel.</p>
    <p><a href="https://api.linkeddata.cultureelerfgoed.nl/" target="_blank" rel="noopener">Bekijk de SPARQL-query</a></p>
  </query>
  <div id="chart-desc" class="visually-hidden">Toelichting bij de grafiek.</div>
  <figcaption>Afgevoerde rijksmonumenten per jaar</figcaption>
</figure>
```

---

## 6. Afbeeldingen

Gebruik dit patroon:

```html
<figure>
  <img src="../assets/imgs/voorbeeld.png"
       alt="Korte beschrijving van de afbeelding"
       width="1200" height="800"
       loading="lazy" decoding="async">
  <figcaption>© Rijksdienst voor het Cultureel Erfgoed</figcaption>
</figure>
```

---

## 7. Footer

Gebruik:

```html
<footer class="footer-rce-full" role="contentinfo">
  <div class="footer-inner">
    © Rijksdienst voor het Cultureel Erfgoed ·
    <nav aria-label="Footer">
      <a href="mailto:info@cultureelerfgoed.nl" class="footer-link">Contact</a> ·
      <a href="https://www.cultureelerfgoed.nl/disclaimer" class="footer-link">Disclaimer</a> ·
      <a href="https://www.cultureelerfgoed.nl/toegankelijkheid" class="footer-link">Toegankelijkheid</a>
    </nav>
  </div>
</footer>
```

---

## 8. Checklist (kort)

- [ ] Metadata ingevuld (title, description, OG, canonical)
- [ ] Koppenstructuur klopt (`<h1>`–`<h2>`–`<h3>`)
- [ ] Afbeeldingen hebben alt, juiste grootte, lazy loading
- [ ] Queries hebben fallback, aria, figcaption
- [ ] Methode & disclaimer staan erin
- [ ] Nieuwe tegel staat in `index.html`
- [ ] Alle links werken

---

## 9. Checklist (uitgebreid)

### Head & SEO
- [ ] `<title>` en `<meta description>` zijn uniek
- [ ] `<link rel="canonical">` is correct
- [ ] OG en Twitter tags zijn ingevuld
- [ ] JSON-LD aanwezig met juiste datums

### Structuur & toegankelijkheid
- [ ] Skiplink bovenaan
- [ ] Eén `<h1>` per pagina
- [ ] Breadcrumb heeft `aria-current="page"`
- [ ] Queries hebben `aria-label` en fallback
- [ ] Afbeeldingen hebben `alt`, `width`, `height`
- [ ] Contrast, leesbaarheid en toetsenbordtoegankelijkheid zijn getest

### Content & performance
- [ ] Geen placeholdertekst zoals `[LINK VOLGT]`
- [ ] Story-afbeeldingen gecomprimeerd
- [ ] JS is `defer`, fonts zijn `font-display: swap`
- [ ] Landingpagina bevat een geldige tegel

---

## Veelgemaakte fouten

- Canonical ≠ OG-url
- `<h2>` wordt overgeslagen → structuurfout
- Geen fallback in `<query>`
- Geen vaste breedte/hoogte op `<img>` → layout shift
- `index.html` niet bijgewerkt → story niet vindbaar

---

## 10. Snippets

<!-- =============================== -->
<!-- INLEIDING                       -->
<!-- =============================== -->
<section id="inleiding" aria-labelledby="inleiding-title" class="mt-4">
  <h2 id="inleiding-title" class="mb-2">Inleiding</h2>

  <p>In deze datastory geven we achtergrondinformatie en context 
  bij het gekozen thema. We lichten toe waarom dit onderwerp 
  relevant is en welke vragen we met de data willen beantwoorden.</p>
</section>

<!-- =============================== -->
<!-- WAT VIND JE IN DEZE STORY       -->
<!-- =============================== -->
<section id="wat-vind-je" aria-labelledby="wat-vind-je-title" class="mt-4">
  <h2 id="wat-vind-je-title" class="mb-2">Wat vind je in deze story?</h2>

  <p>Deze datastory bevat de volgende onderdelen:</p>
  <ul>
    <li>Kernvragen die we onderzoeken</li>
    <li>Overzicht van relevante data en visualisaties</li>
    <li>Toelichting op methode en bronnen</li>
    <li>Conclusies of observaties</li>
  </ul>
</section>

<!-- =============================== -->
<!-- INHOUDSOPGAVE                   -->
<!-- =============================== -->
<nav id="inhoudsopgave" aria-labelledby="inhoudsopgave-title" class="mt-4">
  <h2 id="inhoudsopgave-title" class="mb-2">Inhoudsopgave</h2>

  <ol>
    <li><a href="#inleiding">Inleiding</a></li>
    <li><a href="#wat-vind-je">Wat vind je in deze story?</a></li>
    <li><a href="#methode">Methode en verantwoording</a></li>
    <li><a href="#disclaimer">Disclaimer</a></li>
  </ol>
</nav>

<!-- =============================== -->
<!-- DISCLAIMER                      -->
<!-- =============================== -->
<section id="disclaimer" aria-labelledby="disclaimer-title" class="mt-4">
  <h2 id="disclaimer-title" class="mb-2">Disclaimer</h2>

  <details class="disclaimer-box">
    <summary><strong>Lees de disclaimer</strong></summary>

    <p><strong>Let op</strong></p>
    <p><em>U kunt aan de getoonde resultaten geen rechten ontlenen. 
    De informatie is bedoeld om te informeren en biedt geen garantie 
    op volledigheid, juistheid of actualiteit.</em></p>

    <dl class="row small">
      <dt class="col-sm-3">Titel</dt>
      <dd class="col-sm-9">Titel van de datastory</dd>

      <dt class="col-sm-3">Beschrijving</dt>
      <dd class="col-sm-9">Korte beschrijving van de gebruikte dataset</dd>
    </dl>
  </details>
</section>

<!-- =============================== -->
<!-- METHODE EN VERANTWOORDING       -->
<!-- =============================== -->
<section id="methode" aria-labelledby="methode-title" class="mt-4">
  <h2 id="methode-title" class="mb-2">Methode en verantwoording</h2>

  <details class="methode-box">
    <summary><strong>Lees meer over de methode</strong></summary>

    <p>Hier komt een toelichting op de werkwijze: 
    welke data zijn gebruikt, hoe zijn de queries opgesteld, 
    welke aannames zijn gemaakt en welke beperkingen gelden.</p>

    <p>Vermeld ook bronvermeldingen en eventueel links naar 
    documentatie of aanvullende informatie.</p>
  </details>
</section>

Gereed? **Commit + push → klaar.**

## Literatuur

- Netwerk Digitaal Erfgoed. *Gids Linked Data Stories: databeheerders en communicatieadviseurs werken samen*.  
  [https://netwerkdigitaalerfgoed.nl/nieuws/gids-linked-data-stories-databeheerders-communicatieadviseurs-samenwerken/](https://netwerkdigitaalerfgoed.nl/nieuws/gids-linked-data-stories-databeheerders-communicatieadviseurs-samenwerken/)

- Timmermans, M., Boskaljon, B., Mout, P., & Vanderheiden, J. (2023).  
  *Gids voor het maken van linked data stories – Storytelling aan de hand van LOD*.  
  Zenodo. [https://doi.org/10.5281/zenodo.7936890](https://doi.org/10.5281/zenodo.7936890)
