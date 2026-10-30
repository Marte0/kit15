# L’energia dell’acqua — Watt About · Kit 15

Esperienza interattiva educativa sull’idroelettrico in Svizzera e in Ticino, destinata a ragazzi dai 12 ai 18 anni. Progettata per l’esplorazione individuale, l’uso in classe e la consultazione da computer, tablet e smartphone.

## L’esperienza

### Dove nasce l’energia?

Una mappa interattiva permette di esplorare 728 impianti dell’inventario WASTA dell’Ufficio federale dell’energia (UFE).

- Vista della Svizzera e inquadratura sul Ticino, con confini cantonali.
- Filtri per acqua fluente, serbatoio, pompaggio misto e sola ricircolazione.
- Punti dimensionati secondo la produzione annua attesa.
- Lente di ingrandimento per individuare le centrali: passaggio del puntatore e clic su desktop; pressione, trascinamento e rilascio su touch.
- Selettore con ricerca per nome, utilizzabile anche da tastiera.
- Scheda della centrale con tipologia, produzione annua attesa e salto, con accesso diretto al laboratorio.

Il focus Ticino è un’inquadratura geografica: può includere impianti vicini fuori cantone. Il conteggio riguarda le centrali visibili con i filtri attivi.

### Quanta energia può fare?

Un laboratorio consente di modificare **salto**, **portata** e **tempo**, osservando separatamente potenza ed energia prodotta.

Lo schema animato rende visibili gli effetti dei parametri:

- Il salto modifica il dislivello e la velocità rappresentata dell’acqua.
- La portata modifica lo spessore del flusso.
- Salto e portata determinano la potenza e la velocità simbolica della turbina.
- Il tempo modifica l’energia prodotta, senza cambiare la velocità dell’animazione.
- A salto o portata zero, il movimento si ferma.

È possibile usare il salto della centrale selezionata sulla mappa. Portata, durata e rendimento rimangono ipotesi del modello.

Le spiegazioni, le formule e il controllo per mettere in pausa l’animazione sono raccolti sotto **“Fonti, modello e ipotesi”**. Le animazioni rispettano la preferenza di sistema per il movimento ridotto.

## Avvio locale

Il progetto usa HTML, CSS e JavaScript nativi, senza dipendenze esterne, installazione di pacchetti o compilazione.

Dalla cartella del progetto:

```bash
python3 -m http.server 8015 --bind 127.0.0.1
```

Aprire [http://127.0.0.1:8015/](http://127.0.0.1:8015/).

È possibile anche aprire `index.html` direttamente nel browser. Font, dati e geometrie sono inclusi nel progetto: l’esperienza funziona offline. I collegamenti alle fonti esterne richiedono una connessione.

## Dati e modello

### Centrali idroelettriche

Fonte: [UFE — Statistica degli impianti idroelettrici WASTA](https://www.bfe.admin.ch/en/hydropower-statistics), con dati al **31 dicembre 2025**.

Il [CSV originale](https://www.uvek-gis.admin.ch/BFE/storymaps/WK_WASTA/WASTA20251231.csv) è conservato in `data/wasta-source.csv`. I campi utilizzati sono nome, identificativo WASTA, produzione annua attesa, salto, tipologia e coordinate. Le coordinate LV95 sono convertite in WGS84 con formule approssimate.

L’inventario comprende impianti da almeno 300 kW: 605 ad acqua fluente, 99 con serbatoio, 21 a pompaggio misto e 3 a sola ricircolazione. L’area dei punti rappresenta la produzione attesa, con una dimensione minima per rendere selezionabili anche gli impianti più piccoli.

La produzione attesa riguarda gli apporti naturali e non è una misura della produzione effettiva del 2025. Per gli impianti di confine è considerata la quota svizzera. Un valore nullo degli apporti naturali non implica assenza di produzione da ricircolazione.

I dati sono inclusi localmente e **non si aggiornano automaticamente**.

### Calcoli del laboratorio

```text
Potenza (kW) = ρ × g × Q × H × η / 1000
Energia (kWh) = potenza (kW) × tempo (ore)
Volume transitato (m³) = Q × tempo (ore) × 3600
```

Il modello assume densità dell’acqua di 1’000 kg/m³, gravità di 9,81 m/s² e rendimento complessivo fisso dell’85%. Salto e portata restano costanti per la durata scelta.

Con i valori iniziali di 100 m di salto, 4 m³/s di portata e 2 ore, si ottengono 3’335,4 kW e 6’670,8 kWh. L’interfaccia adatta le unità alla scala dei risultati.

L’animazione è una rappresentazione didattica: non simula la velocità dell’acqua in una condotta a diametro fisso e i giri della turbina non corrispondono a quelli di un impianto reale. Il modello non ricostruisce disponibilità d’acqua, limiti delle turbine, regolazione, pompaggio o rendimento effettivo di una centrale.

Riferimento: [guida tecnica idroelettrica IFC / Banca Mondiale](https://ppp.worldbank.org/sites/default/files/2021-10/Hydroelectric%20Power%20-%20A%20Guide%20for%20Developers%20and%20Investors.pdf).

### Geografia e identità visiva

- Confine nazionale: [Natural Earth, scala 1:50 milioni](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), public domain.
- Confini cantonali: BFS, geometrie generalizzate del 2025, distribuite tramite [Swiss Geography Look Ups](https://github.com/samkhavandi/Swiss_Geography_Look_Ups/blob/main/geometries/canton.geojson) e semplificate per la visualizzazione.
- Identità Watt About: font Cubano e Satoshi, fondo crema, palette azzurro/lime/pervinca/giallo e ombre nette. Favicon e riferimenti tipografici ripresi dal kit 10.

## Struttura del progetto

```text
index.html               Struttura dell’esperienza
style.css                Stili e layout responsive
main.js                  Mappa, selettore, lente e laboratorio
data.js                  Dati degli impianti e geometria nazionale
cantons.js               Geometrie dei cantoni
assets/                  Font e favicon
data/                    Copie delle fonti importate
previews/                Anteprime dell’interfaccia
DESIGN.md                Scelte di interfaccia e identità visiva
PRODUCT.md               Destinatari, obiettivi e requisiti
RICERCA-fonti-e-concept.md Ricerca delle fonti e del concept
```

La copia dei dati sui bacini in `data/storage-source.json` è conservata come archivio di ricerca e non è utilizzata dall’esperienza attuale.

## Verifiche

Sono stati verificati i calcoli del laboratorio, i casi a salto e portata zero, l’indipendenza della potenza dal tempo, l’importazione del salto dalla mappa, la ricerca delle centrali e il comportamento responsive. Le interazioni touch della lente sono state verificate tramite simulazione; la verifica su hardware touch resta distinta da questi controlli.

Per controllare la sintassi JavaScript:

```bash
node --check main.js
```
