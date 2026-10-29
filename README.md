# Acqua in movimento — Kit 15

Prima bozza navigabile per Watt About, ragazzi di 12–18 anni.

Aprire `index.html` direttamente nel browser. Font, dati e geometrie sono locali: l’esperienza funziona anche offline. Le fonti esterne e la mappa UFE richiedono una connessione. Per l’anteprima locale: `python3 -m http.server 8015 --bind 127.0.0.1`.

## Interazioni

- **Dove nasce l’energia?** Mappa con 728 righe WASTA, selezione degli impianti, filtro per tipo, inquadratura sul Ticino, sei casi suggeriti e selettore completo per nome. Dettaglio con produzione annua attesa, salto e schema del meccanismo.
- **Quanta ne conserviamo?** Riserva energetica percentuale e in GWh, selezione Svizzera/Ticino, 52 campioni settimanali, media di riferimento, cursore, riproduzione e confronto delle quattro regioni nella data selezionata.
- Controlli utilizzabili da tastiera, alternativa testuale alla selezione dei punti, layout mobile verificato a 390px. Il passaggio tra viste interrompe la riproduzione.

## Fonti e trasformazioni

Fotografia scaricata il 29 ottobre 2026. Nessun aggiornamento automatico attivo.

### Impianti

CSV pubblico caricato dalla storymap UFE:
https://www.uvek-gis.admin.ch/BFE/storymaps/WK_WASTA/WASTA20251231.csv

Copia originale: `data/wasta-source.csv`. Data nominale: 31 dicembre 2025. Campi usati: nome, identificativo WASTA, produzione attesa in GWh, salto in metri, tipologia, coordinate LV95. Le coordinate sono convertite con le formule approssimate LV95 → WGS84; proiezione locale equirettangolare con correzione a latitudine 46,8° per la visualizzazione.

Classi presenti nel file: 605 acqua fluente, 99 serbatoio, 21 pompaggio misto, 3 sola ricircolazione. Sono preservate tutte le righe. L’area dei punti segue la produzione attesa con raggio minimo di 2,3 unità SVG per leggibilità; il conteggio visualizzato è quello dei punti nell’inquadratura e nei filtri attivi. Il focus Ticino è un’inquadratura, non un filtro basato sui confini cantonali.

La produzione attesa non è una produzione misurata nel 2025. Le grandezze riguardano gli apporti naturali e la quota svizzera degli impianti di confine; zero per gli apporti naturali non significa assenza di produzione da pompaggio. Schema del meccanismo generico per tipologia, non ricostruzione tecnica del singolo impianto.

### Bacini

API pubblica usata dal sito ufficiale:
https://energiedashboard.admin.ch/api/strom/v2/fuellungsgrad-speicherseen

Copia della risposta: `data/storage-source.json`. Ultima data indicata dall’API: **26 ottobre 2026**. Si conservano solo i valori disponibili fino a questa data. La risposta contiene una griglia giornaliera; la bozza ne seleziona i lunedì, ottenendo 52 campioni dal 3 novembre 2025 al 26 ottobre 2026. Non si generano misure mancanti e non si costruisce una serie sintetica. L’UFE pubblica i dati di base settimanalmente; va verificato il rapporto tra timestamp API e data della misurazione prima dell’implementazione definitiva.

Usati `speicherstandProzent`, `speicherstandGWh` e `fiveYearMittelwert`. Quest’ultimo è etichettato come “media di riferimento UFE”: il campo ha un nome storico e la descrizione del portale parla anche di confronto su dieci anni. La bozza non assegna un intervallo di anni non verificato alla media.

Indicatore a serbatoio: rappresenta la percentuale della capacità energetica regionale, non il livello geometrico di un lago reale. Le barre regionali confrontano percentuali, con capacità differenti. Nessuna conversione in case alimentate o altri equivalenti non documentati.

### Geografia e identità

Confine Svizzera: Natural Earth, 1:50 milioni, public domain:
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson

Font Cubano e Satoshi, palette crema/azzurro/lime/rosa e ombre nette ripresi dal progetto del kit 10 fornito dall’utente. Progetto di riferimento non modificato. Il marchio in testata è una composizione tipografica provvisoria.

## Verifica svolta

Sintassi JavaScript verificata con `node --check`. Nel browser verificati: cambio vista, selezione Bavona (317 GWh, 878 m), passaggio Ticino (54,2%, 675 GWh al 26 ottobre), cursore al 16 febbraio 2026 (25,5%, 318 GWh), ripristino dell’ultima settimana e layout a 390px.

Il controllo di progetto non segnala problemi dopo l’aumento dei testi piccoli e la rimozione di animazioni di dimensioni. Il fondo crema è mantenuto come scelta di identità confermata dall’utente; eccezione limitata a questo file nella configurazione Impeccable. Nessuna altra segnalazione soppressa.

## Da sviluppare dopo il riscontro

Composizione visiva, fotografie/collage delle centrali, contenuti didattici del kit, confini cantonali per un vero filtro Ticino, verifica del periodo della media, pipeline di aggiornamento con cache e data dell’ultimo rilascio. Prima di pubblicare verificare le condizioni specifiche di riuso dei dati UFE e dei font forniti.

HTML, CSS e JavaScript nativi. Nessuna libreria esterna richiesta, nessuna pubblicazione eseguita.
