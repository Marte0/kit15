# Kit 15 Watt About — appunti di ricerca

Ricognizione: 29 ottobre 2026. Documento di lavoro, da integrare con le risorse del kit annunciate dall’utente.

## Brief confermato

- Pubblico: ragazzi di 12–18 anni.
- Tema: idroelettrico ed energia dall’acqua.
- Richiesta: capire le fonti di tre visualizzazioni, valutare dati riutilizzabili e integrazioni, proporre cosa mostrare e perché, confrontare librerie e plugin.
- Da definire con le risorse: obiettivi già coperti dal kit, contesto e dispositivi d’uso, durata dell’attività.

### Aggiornamento del brief

L’utente conferma che le risorse non sono ancora disponibili e chiede di procedere alla scelta del concept. Il territorio può essere Svizzera/Ticino. Sono interessanti dati quasi in tempo reale, settimanali o serie storiche aggiornate. La qualità estetica è un requisito esplicito; i tre siti iniziali sono riferimenti funzionali e di dati, non riferimenti visivi da imitare. Restano aperti contesto d’uso e grado di continuità con l’identità Watt About.

### Nuova fonte verificata: portate dei fiumi UFAM

- https://data.bafu.admin.ch/en/dataproduct-water-observations
- https://www.hydrodaten.admin.ch/it/seen-und-fluesse/messstationen-zustand
- https://www.hydrodaten.admin.ch/en/questions

La documentazione ufficiale offre metadati di stazione, portata Q, livello W, serie aggregate e osservazioni quasi in tempo reale via GraphQL. I dati attuali sono grezzi e possono essere corretti. La documentazione contiene indicazioni discordanti sulla finestra disponibile del feed live (7 giorni nella descrizione, 12 ore nelle note): verificare con una richiesta reale prima di progettare la cache. Nessuna chiamata al feed è stata ancora provata. Il dato di una stazione fluviale non equivale alla portata turbinata di una centrale e non permette di calcolarne la produzione effettiva senza ulteriori informazioni.

### Dati dei bacini: precisazione verificata

https://energiedashboard.admin.ch/strom/fuellstaende-speicherseen

La dashboard parla di contenuto energetico dei bacini per settimana, con confronto su dieci anni. Secondo la spiegazione, rilevazione a mezzanotte tra domenica e lunedì, trasmissione entro mercoledì e pubblicazione il giovedì. Verificare il timestamp effettivo di ogni rilascio. Un indicatore regionale non è il livello geometrico di un singolo lago: un paesaggio che visualizza questi dati va esplicitamente presentato come schema aggregato. Preferire un indicatore energetico separato e chiaramente etichettato per evitare un falso livello del lago.

### Tre ipotesi di esperienza, ancora da selezionare

1. **L’acqua che teniamo per dopo:** nucleo sui bacini, la stagionalità e l’accumulo. Serie settimanale Svizzera/Ticino, cursore annuale, confronto con anni precedenti e ultimi valori disponibili. Può diventare l’esperienza principale; richiede un breve confronto con acqua fluente e pompaggio per non far coincidere tutto l’idroelettrico con i bacini.
2. **Segui l’acqua:** sezione esplorabile dalla presa alla restituzione; centrali reali come casi e portata attuale di una stazione come contesto idrologico. Forte su funzionamento, salto, portata e trasformazione dell’energia; le animazioni e gli eventuali calcoli sono un modello didattico dichiarato.
3. **Il paesaggio dell’idroelettrico:** atlante che passa da posizione a confronto tra centrali per tipologia, salto e produzione annua attesa WASTA. Forte sulla geografia e sul confronto, meno legato agli aggiornamenti frequenti.

Indicazione preliminare: esperienza principale sui bacini e sul tempo, una breve sezione sul funzionamento e poche centrali scelte come collegamento al territorio. Non costruire tre applicazioni complete nello stesso kit. La proposta visiva dettagliata resta aperta: prima selezionare la domanda didattica e l’interazione principale.

## Riferimento visivo locale: kit 10

L’utente indica `/Users/marte/Documents/Lavoro/Watt About/esperienze interattive/data visualization kit 10/` come riferimento per forme e colori, con libertà di composizione. Conferma entrambi i contesti d’uso: individuale/a coppie e schermo condiviso.

Esaminati index.html, CSS, README, porzione iniziale del JavaScript e le viste “Chi consuma?” e “Come cambia?” nel browser. Il progetto di riferimento non è stato modificato.

Caratteri osservati:

- Fondo crema `#F8EFE0`, testo e contorni scuri `#24251F`.
- Palette: lime `#B9DA49`, giallo `#FFD12E`, azzurro `#95D9E5`, rosa `#FFB3D2`, corallo `#ED7770`, pervinca `#ACB5F8`; selezione rosa chiaro `#FFBCBC`.
- Cubano per titoli e numeri espressivi, Satoshi per testi e controlli.
- Contorni definiti, angoli arrotondati, ombre nette e brevi spostate, cerchi e forme piene.
- Immagini di oggetti/edifici scontornate in stile collage fotografico su campiture colorate.
- Un soggetto quantitativo centrale, selettori a domanda e cursore temporale con riproduzione.
- Le due viste condividono selezione e tempo; il passaggio consente letture diverse degli stessi dati.

Implicazione per il kit 15: estendere questa identità. Un paesaggio puramente vettoriale non è l’unica soluzione e potrebbe perdere il carattere del collage osservato. Valutare un grande diorama con fotografia scontornata di diga/roccia/turbina, forme piatte azzurre e contorni scuri; schema e misure devono restare separati e chiaramente identificati. La vista temporale può ereditare il linguaggio del kit 10 con settimana/data, confronto storico e unità energetiche esplicite. Ancora nessun concept o layout approvato.

## Riscontri sui tre siti

### ESI — produttori

https://elettricita.ch/produttori/

Verificati HTML pubblico e visualizzazione nel browser. La legenda indica società idroelettriche attive in Ticino e nel Grigione, produttori affiliati ESI con potenza produttiva superiore a 1 MW. Mostra nomi delle società, sedi/località e centrali associate, con riferimenti sulla mappa. Non equivale al censimento completo di tutti gli impianti.

Implementazione rilevata: WordPress, Slider Revolution, livelli SVG e azioni al passaggio/clic. Molti asset hanno percorsi di caricamento del 2019 e uno del 2022: queste date NON dimostrano la data di aggiornamento del contenuto. Nel codice esaminato non è emerso un feed tabellare per questa mappa. Gli SVG contengono grafica tracciata, senza testo estraibile nei campioni letti.

Il sito dichiara tutti i diritti riservati. Nessuna licenza aperta per gli asset è stata identificata; per ripubblicare SVG o grafica serve chiarire le condizioni con ESI. È preferibile ricostruire la visualizzazione da fonti ufficiali e usare ESI per verifica editoriale dei rapporti società/centrali.

### ESI — distributori

https://elettricita.ch/distributori/

Verificati HTML e visualizzazione nel browser. Il titolo specifica distributori e società di servizi presenti in Ticino e nel Grigioni italiano. La legenda distingue le due categorie; la mappa associa colori ad aree e riferimenti numerati alle organizzazioni.

Stessa struttura tecnica con Slider Revolution e SVG. Nessun feed aperto identificato nel codice esaminato. Non assumere che le aree illustrate siano confini giuridici aggiornati o tracciati fisici della rete. Per un kit sull’idroelettrico è un possibile approfondimento sul sistema elettrico, non la fonte centrale sul funzionamento della produzione.

### UFE — WASTA

https://www.uvek-gis.admin.ch/BFE/storymaps/WK_WASTA/?lang=it

Verificati HTML, JavaScript e CSV pubblico. Il file `assets/js/viz.js` carica direttamente:

https://www.uvek-gis.admin.ch/BFE/storymaps/WK_WASTA/WASTA20251231.csv

Nel file letto: 728 righe e campi `Name`, `WASTANumber`, `ProductionExpected`, `Type`, `X`, `Y`, `Order1`, `Order2`, `FallHeight`. Il suffisso indica una fotografia al 31 dicembre 2025; non è un flusso in tempo reale.

- Ogni cerchio rappresenta una centrale; l’area deriva dalla produzione annua attesa, mostrata in GWh.
- Il colore distingue acqua fluente, serbatoio, pompaggio-turbinaggio misto.
- Si può riordinare per produzione o tipologia.
- Il clic usa coordinate e numero WASTA per aprire la centrale nella mappa incorporata di geo.admin.ch.
- Layer della mappa: `ch.bfe.statistik-wasserkraftanlagen`.
- La fonte WASTA copre centrali di almeno 300 kW; la descrizione della storymap usa la formulazione “superiore a 300 kW”.
- La storymap dichiara che considera solo gli apporti naturali nel pompaggio misto, esclude dal grafico gli impianti di sola ricircolazione e indica la quota svizzera per gli impianti di confine.
- `ProductionExpected` è produzione attesa: non va presentata come produzione effettivamente misurata nel 2025.
- Gli ordinamenti `Order1/Order2` servono alla presentazione, non aggiungono fenomeni energetici.
- Esempi letti nel CSV: Biasca, 631 GWh attesi e salto 684 m; Bavona, 317 GWh e salto 878 m. Da verificare contro il dataset ufficiale e le relative definizioni prima dell’uso didattico definitivo.

Fonti ufficiali di documentazione:

- https://www.bfe.admin.ch/en/hydropower-statistics
- https://api3.geo.admin.ch/rest/services/api/MapServer/ch.bfe.statistik-wasserkraftanlagen/legend
- https://pubdb.bfe.admin.ch/de/sammlungen/statistik-der-wasserkraftanlagen-wasta
- https://pubdb.bfe.admin.ch/de/publication/download/6091

La documentazione WASTA descrive la relazione con prese e restituzioni d’acqua attraverso `WASTANumber`. Questo è un collegamento significativo per raccontare il percorso dell’acqua; non basta collegare sulla mappa gli oggetti geograficamente più vicini.

## Altre fonti individuate

### Inventario degli impianti di produzione elettrica UFE

https://opendata.swiss/it/dataset/elektrizitatsproduktionsanlagen

Dataset mensile con impianti in esercizio registrati nel sistema delle garanzie di origine: tutti quelli sopra 30 kVA, piccoli impianti sopra 2 kW registrati volontariamente e impianti incentivati. Non è un censimento assoluto di ogni microimpianto.

CSV verificato scaricando:

https://data.geo.admin.ch/ch.bfe.elektrizitaetsproduktionsanlagen/csv/2056/ch.bfe.elektrizitaetsproduktionsanlagen.zip

La tabella `ElectricityProductionPlant.csv` contiene identificativo, indirizzo, NPA, comune, cantone, EGID, entrata in esercizio, potenza iniziale e totale, categorie e coordinate. Presenti cataloghi con etichette in italiano. Nessuna colonna di produzione annua nella tabella esaminata. Alcune righe hanno coordinate mancanti.

Attenzione: l’identificativo `xtf_id` non va equiparato al numero WASTA. L’unione richiede una corrispondenza verificata. Evitare somme tra le due fonti che duplicano gli stessi impianti. Unità della potenza da confermare nel modello ufficiale prima di importare valori. Il primo download esplorativo ha salvato una tabella temporanea sovrascritta dai cataloghi: ripetere un’estrazione ordinata soltanto se serve all’implementazione.

### Comprensori di rete cantonali

https://geodienste.ch/services/stromversorgungssicherheit_netzgebiete?locale=it
https://geodienste.ch/downloads/stromversorgungssicherheit_netzgebiete?locale=de

Geometrie ufficiali dei comprensori e gestori. Disponibili GeoPackage, Shapefile, INTERLIS, WFS e altri servizi. La scheda Ticino consultata riporta disponibilità libera, completezza sì, citazione obbligatoria e condizioni cantonali; ultima pubblicazione indicata 21 ottobre 2025. È l’alternativa strutturata alla mappa ESI, se serve la distribuzione. Distinguerne i livelli di rete; non sono linee elettriche.

### Riempimento dei bacini UFE

https://www.bfe.admin.ch/de/fuellungsgrad-speicherseen
https://pubdb.bfe.admin.ch/en/sammlungen/energiestatistik-fuellungsgrad-der-speicherseen

Dati settimanali, riferiti alla domenica ore 24, per Svizzera, Vallese, Grigioni, Ticino e resto della Svizzera. Utili per stagionalità e funzione dell’accumulo. Non attribuire una serie regionale a una singola diga. Prima di disegnare il bacino verificare la definizione del riempimento: contenuto energetico e volume geometrico non sono intercambiabili.

### Statistica elettrica e dashboard UFE

https://pubdb.bfe.admin.ch/en/sammlungen/elektrizitaetsstatistik
https://www.dashboardenergie.admin.ch/strom/winterproduktion
https://opendata.swiss/de/dataset/energiedashboard-ch-stromproduktion-swissgrid/resource/0879ba1b-40ea-4e26-bba0-9cbb339f577e

Bilanci mensili/annuali per contestualizzare il ruolo dell’idroelettrico. Dashboard giornaliera basata anche su modelli e programmi di Swissgrid: non confonderla con la statistica ufficiale o con la produzione puntuale di una centrale. Risorsa CSV individuata: https://www.bfe-ogd.ch/ogd104_stromproduktion_swissgrid.csv (contenuto non ancora ispezionato).

### Micro-idroelettrico

https://www.envidat.ch/metadata/ch-kleinstwasserkraftwerke

Dataset di ricerca Wechsler e Zappa, 2024, DOI 10.16904/envidat.523, con 1’682 microimpianti ≤300 kW e risorse XLSX/Shapefile. Possibile integrazione se il racconto include piccoli impianti; verificare licenza, stato e sovrapposizioni al momento dell’importazione.

## Direzioni da discutere dopo la lettura delle risorse del kit

1. **Dal territorio al funzionamento:** una selezione di centrali reali su mappa, con passaggio a sezioni animate dei diversi tipi. Obiettivo: collegare paesaggio, impianti e trasformazione energetica.
2. **Stessa acqua, quanta energia?** Manipolare salto, portata e durata in un modello dichiaratamente didattico; visualizzare differenza tra potenza ed energia. I dati reali servono da ancoraggio, non da fonte di portate o rendimenti mancanti.
3. **La montagna come accumulo:** percorso stagionale dei bacini e sfida sulla scelta di quando produrre o pompare, dichiarando perdite e ipotesi. Richiede bilancio dell’acqua, limite della turbina e vincoli ecologici; non trasformare i soli cursori in una previsione di esercizio reale.

Per il pubblico 12–18 anni valutare due profondità: osservazione e scelte concrete come percorso base; unità, formule e confronto numerico come livello di approfondimento. Usare area e non raggio proporzionale al valore nei cerchi; confronto quantitativo supportato anche da barre. Distinguere centrale, diga, bacino, presa e restituzione. La vicinanza tra centrale e scuola non dimostra una fornitura elettrica diretta.

## Strumenti: verifiche iniziali

Documentazione primaria consultata:

- D3: https://d3js.org/ — visualizzazioni personalizzate, scale, geografia, interazioni e layout.
- Observable Plot: https://observablehq.github.io/plot/ — grafici esplorativi concisi, costruiti su D3.
- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/ — mappe vettoriali interattive.
- Leaflet: https://leafletjs.com/ — mappe 2D, GeoJSON, WMS, popup e interazioni mobili.

Non è ancora una selezione definitiva. Per una mappa illustrata regionale può bastare SVG con D3; valutare una libreria cartografica solo se lo zoom geografico risponde all’obiettivo.

Skill già letta e contesto inizializzato: Impeccable 4.3.1. Nessuna UI implementata; non sono stati creati PRODUCT.md o DESIGN.md, perché ricerca e proposta didattica sono ancora aperte.

Plugin Management consultato per la ricerca del catalogo. Risultati: Figma, Canva e Adobe risultano installati; tldraw, Product Design, MotherDuck e MagicPath disponibili ma non installati. Nessuna installazione o modifica di permessi effettuata. Impeccable è una skill/workflow di progettazione, non una libreria JavaScript né il motore che eseguirà l’esperienza nel sito. Proseguire il confronto distinguendo strumenti per progettare, per trattare dati, per sviluppare e per pubblicare.
