# Acqua in movimento — Kit 15

Prima bozza navigabile per Watt About, ragazzi di 12–18 anni.

Aprire `index.html` direttamente nel browser. Font, dati e geometrie sono locali: l’esperienza funziona anche offline. Le fonti esterne e la mappa UFE richiedono una connessione. Per l’anteprima locale: `python3 -m http.server 8015 --bind 127.0.0.1`.

## Interazioni

- **Dove nasce l’energia?** Mappa con 728 righe WASTA, selezione degli impianti, filtro per tipo, inquadratura sul Ticino, sei casi suggeriti e selettore completo per nome. Dettaglio con produzione annua attesa, salto e schema del meccanismo.
- **Lente sulla mappa:** ingrandimento 3×, anteprima della centrale più vicina e nome esterno alla lente. Mouse: hover e clic. Touch/penna: pressione, trascinamento e rilascio per confermare. La scheda resta invariata durante l’anteprima. Se nessun punto è abbastanza vicino non si seleziona nulla. Pointer cancel, perdita del gesto ed Escape annullano. Il trascinamento sulla mappa è riservato alla lente; lo scorrimento della pagina resta disponibile fuori dalla mappa. Il selettore per nome rimane l’alternativa da tastiera e per punti coincidenti.
- **Quanta energia può fare?** Laboratorio con cursori per salto, portata e durata; potenza ed energia calcolate separatamente. Lo schema risponde al salto e alla portata. Il tempo modifica solo l’energia. Pulsanti per raddoppiare la durata, ricominciare, fermare il movimento e usare il salto reale della centrale selezionata. Dalla scheda nella mappa si può aprire direttamente il laboratorio con quel salto.
- Controlli utilizzabili da tastiera, alternativa testuale alla selezione dei punti, layout mobile verificato a 390px. Le animazioni rispettano la preferenza di movimento ridotto e si possono fermare con un pulsante.

## Fonti e trasformazioni

Fotografia scaricata il 29 ottobre 2026. Nessun aggiornamento automatico attivo.

### Impianti

CSV pubblico caricato dalla storymap UFE:
https://www.uvek-gis.admin.ch/BFE/storymaps/WK_WASTA/WASTA20251231.csv

Copia originale: `data/wasta-source.csv`. Data nominale: 31 dicembre 2025. Campi usati: nome, identificativo WASTA, produzione attesa in GWh, salto in metri, tipologia, coordinate LV95. Le coordinate sono convertite con le formule approssimate LV95 → WGS84; proiezione locale equirettangolare con correzione a latitudine 46,8° per la visualizzazione.

Classi presenti nel file: 605 acqua fluente, 99 serbatoio, 21 pompaggio misto, 3 sola ricircolazione. Sono preservate tutte le righe. L’area dei punti segue la produzione attesa con raggio minimo di 2,3 unità SVG per leggibilità; il conteggio visualizzato è quello dei punti nell’inquadratura e nei filtri attivi. Il focus Ticino è un’inquadratura, non un filtro basato sui confini cantonali.

La produzione attesa non è una produzione misurata nel 2025. Le grandezze riguardano gli apporti naturali e la quota svizzera degli impianti di confine; zero per gli apporti naturali non significa assenza di produzione da pompaggio. Schema del meccanismo generico per tipologia, non ricostruzione tecnica del singolo impianto.

### Laboratorio: modello fisico

`P (kW) = ρ × g × Q × H × η / 1000`; `E (kWh) = P × t`. Densità 1’000 kg/m³, gravità 9,81 m/s² e rendimento complessivo ipotizzato 0,85. Il volume transitato è `Q × t × 3600` m³.

Valori iniziali: H = 100 m, Q = 4 m³/s, t = 2 h. Risultati prima dell’arrotondamento: 3335,4 kW e 6670,8 kWh. Potenza ed energia si mostrano con prefissi k/M/G, al massimo due decimali.

Solo il salto può essere importato da WASTA; portata, durata e rendimento sono ipotesi, anche quando si usa una centrale reale. Il modello a parametri costanti non simula disponibilità d’acqua, limiti di potenza, regolazione, pompaggio o il rendimento effettivo dell’impianto. Il rendimento complessivo riassume le perdite senza ricostruirle per componente.

Riferimento della formula: [guida tecnica idroelettrica IFC/Banca Mondiale](https://ppp.worldbank.org/sites/default/files/2021-10/Hydroelectric%20Power%20-%20A%20Guide%20for%20Developers%20and%20Investors.pdf). L’85% è una scelta didattica di questa bozza.

Otto verifiche sulla funzione effettiva dei calcoli: valore di riferimento, potenza invariata al raddoppio della durata, energia doppia, linearità rispetto a portata e salto, casi a salto/portata zero e volume transitato.

### Bacini — archivio della prima bozza

La vista dei bacini è stata sostituita su richiesta dell’utente. I dati originali restano conservati nel progetto; non sono usati nel laboratorio. La descrizione seguente documenta il precedente import.

API pubblica usata dal sito ufficiale:
https://energiedashboard.admin.ch/api/strom/v2/fuellungsgrad-speicherseen

Copia della risposta: `data/storage-source.json`. Ultima data indicata dall’API: **26 ottobre 2026**. Si conservano solo i valori disponibili fino a questa data. La risposta contiene una griglia giornaliera; la bozza ne seleziona i lunedì, ottenendo 52 campioni dal 3 novembre 2025 al 26 ottobre 2026. Non si generano misure mancanti e non si costruisce una serie sintetica. L’UFE pubblica i dati di base settimanalmente; va verificato il rapporto tra timestamp API e data della misurazione prima dell’implementazione definitiva.

Usati `speicherstandProzent`, `speicherstandGWh` e `fiveYearMittelwert`. Quest’ultimo è etichettato come “media di riferimento UFE”: il campo ha un nome storico e la descrizione del portale parla anche di confronto su dieci anni. La bozza non assegna un intervallo di anni non verificato alla media.

Indicatore a serbatoio: rappresenta la percentuale della capacità energetica regionale, non il livello geometrico di un lago reale. Le barre regionali confrontano percentuali, con capacità differenti. Nessuna conversione in case alimentate o altri equivalenti non documentati.

### Geografia e identità

Confine Svizzera: Natural Earth, 1:50 milioni, public domain:
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson

Confini cantonali: BFS, Generalisierte Gemeindegrenzen 2025-01-01, distribuiti in WGS84 da https://github.com/samkhavandi/Swiss_Geography_Look_Ups/blob/main/geometries/canton.geojson . Le 26 geometrie sono semplificate con tolleranza 0,0006 gradi e conservate in `cantons.js`; il Ticino è usato per calcolare l’inquadratura e disegnare il contorno. Il focus continua a mostrare anche punti vicini fuori cantone: il conteggio è dell’inquadratura, non del solo Ticino. Ombra geografica piena, senza sfocatura, spostata di 3px a sinistra e 4px in basso.

Font Cubano e Satoshi, palette crema/azzurro/lime/rosa e ombre nette ripresi dal progetto del kit 10 fornito dall’utente. Progetto di riferimento non modificato. Il marchio in testata è una composizione tipografica provvisoria.

## Verifica svolta

Sintassi JavaScript verificata con `node --check`. Prima bozza: selezione delle centrali, confronto delle riserve e layout a 390px. Versione laboratorio: verifiche numeriche descritte sopra; cambio vista, raddoppio della durata, portata zero, importazione del salto WASTA, ripristino e layout mobile verificati nel browser.

Il controllo di progetto non segnala problemi dopo l’aumento dei testi piccoli e la rimozione di animazioni di dimensioni. Il fondo crema è mantenuto come scelta di identità confermata dall’utente; eccezione limitata a questo file nella configurazione Impeccable. Nessuna altra segnalazione soppressa.

Lente: verificati clic nativo con aggancio della centrale vicina, anteprima mouse senza conferma, pressione touch senza conferma, selezione al rilascio e annullamento senza selezione. Le fasi touch sono state simulate in una pagina di verifica temporanea a 390px; l’acquisizione nativa del puntatore non è stata provata su hardware touch. Contorni e ombra verificati nel focus Ticino. La pagina di verifica è stata rimossa.

Correzione del bordo touch: durante un gesto attivo, il fuoco resta entro la mappa e si ferma al limite inferiore dei punti visibili; uscire con il dito non nasconde la lente. Verificati in simulazione a 390px l’aggancio della centrale più in basso (Hospitalet nella vista Svizzera) e la conferma al rilascio fuori mappa. Il comportamento mouse fuori mappa continua a chiudere la lente. Diametro ridotto a due terzi: 88px su touch e circa 101px con mouse; zoom invariato a 3×.

## Da sviluppare dopo il riscontro

Composizione visiva, fotografie/collage delle centrali, contenuti didattici del kit, confini cantonali per un vero filtro Ticino, eventuali ulteriori esperimenti e pipeline di aggiornamento dei dati WASTA. Prima di pubblicare verificare le condizioni specifiche di riuso dei dati UFE e dei font forniti.

HTML, CSS e JavaScript nativi. Nessuna libreria esterna richiesta, nessuna pubblicazione eseguita.
