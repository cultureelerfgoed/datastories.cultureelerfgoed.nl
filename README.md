# Datastories Cultureel Erfgoed

De Rijksdienst voor het Cultureel Erfgoed (RCE) gebruikt **datastories** om complexe gegevens rond cultureel erfgoed toegankelijk en begrijpelijk te maken. Deze verhalen koppelen uitleg en visualisaties direct aan de onderliggende data. Zo kunt je niet alleen lezen over de inzichten, maar ook zelf de data bekijken en, waar mogelijk, de visualisaties aanpassen om een ander perspectief te krijgen.

Bekijk de datastories hier:  
[https://linkeddata.cultureelerfgoed.nl](https://linkeddata.cultureelerfgoed.nl)

---

## Wat zijn datastories?

Datastories zijn een concept in het cultureel erfgoed (en de digitale geesteswetenschappen, datawetenschap en datajournalistiek). In tegenstelling tot blogs of wetenschappelijke artikelen zijn beweringen in een datastory direct gekoppeld aan de onderliggende data. Dit maakt de verhalen transparanter en beter controleerbaar.

Een belangrijk voordeel is dat je zelf kunt inzoomen of juist uitzoomen op de gegevens. Bijvoorbeeld: bij discussies over aanwijzingen tot rijksmonument wordt vaak alleen gekeken naar korte periodes (een maand of een kwartaal), wat kan leiden tot spectaculaire pieken en ongenuanceerde conclusies over de toekomst. Met een datastory kunt je de tijdspanne aanpassen en de cijfers vergelijken met eerdere aanwijzingsprocessen. Dit biedt een accurater beeld en plaatst de cijfers in historisch perspectief.

---

## Doel bij het cultureel erfgoed

De RCE past dit principe toe op **cultureel erfgoeddata**. Denk aan:

- Het tonen van de ontwikkeling van monumenten door de tijd.
- Het visualiseren van erfgoedlocaties in relatie tot gebeurtenssen (zoals aardbevingen).
- Het inzichtelijk maken van de geschiedenis van de monumentenzorg.

Door datastories te koppelen aan **Linked Open Data** uit de erfgoeddomeinen kunnen gebruikers zelf verder verkennen, hergebruiken en combineren met andere datasets.

---

## Dank aan Triply en Clariah

Deze datastories zijn mede mogelijk gemaakt dankzij de code en ideeën ontwikkeld door het Clariah en Triply. Hun werk heeft de basis gelegd voor de technische en conceptuele opzet die wij bij de RCE gebruiken.

---

## Meer informatie

- Bekijk de verhalen en data:  
  [https://linkeddata.cultureelerfgoed.nl](https://linkeddata.cultureelerfgoed.nl)

- Rijksdienst voor het Cultureel Erfgoed:  
  [https://www.cultureelerfgoed.nl](https://www.cultureelerfgoed.nl)

---

*Deze repository bevat de codebasis om datastories te ontwikkelen en te publiceren binnen de context van het cultureel erfgoed.*

---

## Voor ontwikkelaars

Wil je zelf een nieuwe datastory maken of bestaande aanpassen?  
Gebruik hiervoor de uitgebreide [handleiding](handleiding.md). Hieronder vind je een korte samenvatting:

### Stappen
1. Kopieer `template/template.html` naar een nieuwe map (bijv. `mijn-story/`).
2. Hernoem naar `mijn-story.html` en pas inhoud en metadata aan.
3. Voeg eventuele afbeeldingen toe in `assets/imgs/`.
4. Voeg een nieuwe tegel toe op `index.html` met link en bannerafbeelding.
5. Commit + push → publicatie via GitHub Pages gaat automatisch.

### Checklist
- Metadata ingevuld (title, description, OG, canonical)
- Koppenstructuur correct (`<h1>`, `<h2>`, `<h3>`)
- Afbeeldingen voorzien van `alt`, vaste grootte en lazy loading
- Queries hebben fallback en aria-attributen
- Disclaimer en methode zijn toegevoegd
- Nieuwe tegel staat in `index.html`
- Alle links werken

Zie [handleiding.md](handleiding.md) voor de volledige checklist en HTML-snippets (inleiding, inhoudsopgave, disclaimer, methode).

---

## Publicatie & Hosting

Deze repository wordt gehost via **GitHub Pages**.  
- Branch: `main`  
- Custom domain: `datastories.cultureelerfgoed.nl` (CNAME aanwezig)  
- HTTPS wordt automatisch ingeschakeld wanneer de DNS correct staat.  

---

## Licentie

- Code en handleiding: MIT-licentie (tenzij anders vermeld).
- Afbeeldingen en datasets: gebruik conform de aangegeven bron en licentie (bijv. Creative Commons).  
  Raadpleeg per story de specifieke vermelding in het bronmateriaal.

---

## Literatuur

- Netwerk Digitaal Erfgoed. *Gids Linked Data Stories: databeheerders en communicatieadviseurs werken samen*.  
  [https://netwerkdigitaalerfgoed.nl/nieuws/gids-linked-data-stories-databeheerders-communicatieadviseurs-samenwerken/](https://netwerkdigitaalerfgoed.nl/nieuws/gids-linked-data-stories-databeheerders-communicatieadviseurs-samenwerken/)

- Timmermans, M., Boskaljon, B., Mout, P., & Vanderheiden, J. (2023).  
  *Gids voor het maken van linked data stories – Storytelling aan de hand van LOD*.  
  Zenodo. [https://doi.org/10.5281/zenodo.7936890](https://doi.org/10.5281/zenodo.7936890)
