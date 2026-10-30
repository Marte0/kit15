# Kit 15 — direzione della prima bozza

Identità ereditata dal kit 10, su richiesta dell’utente. Font Cubano/Satoshi; fondo #f8efe0 e inchiostro #24251f; palette azzurro #95d9e5, lime #b9da49, corallo #ed7770, rosa #ffbcbc e pervinca #acb5f8. Contorni definiti e ombre nette come nel riferimento. Queste caratteristiche sono vincolanti; il layout resta una proposta da valutare.

## Superficie

Esperienza educativa web, due viste: “Dove nasce l’energia?” e “Quanta energia può fare?”. La seconda sostituisce la riserva dei bacini su richiesta dell’utente ed è un laboratorio su salto, portata e tempo. Nessun grafico a torta.

## Composizione della bozza

- Atlante dominante con punti geografici colorati per tipo e dettaglio di una centrale. Il menu “Scegli una centrale” rimane sempre visibile sotto la mappa e permette l’accesso anche da tastiera; rimossi i casi suggeriti e il passaggio apribile “Tutte le centrali”.
- Lente 3×: su desktop anteprima al passaggio e conferma con clic; su touch anteprima al contatto e conferma al rilascio. Il nome rimane fuori dalla lente; su touch la lente si sposta sopra il dito, anche fuori dall’area del disegno quando necessario. Raggio massimo di aggancio e annullamento su pointercancel/Escape. I filtri valgono anche nella lente.
- Focus Ticino con confine cantonale reale, cantoni vicini più discreti e ombra piena in basso a sinistra, come richiesto dall’utente.
- Lente ridotta a due terzi del diametro iniziale. Durante il gesto touch resta aperta anche fuori mappa, con fuoco vincolato al bordo e alle centrali inferiori visibili; su mouse l’uscita continua a nasconderla.
- Laboratorio come schema geometrico reattivo: quota della presa, flusso e turbina rispondono a salto e portata. Due risultati affiancati distinguono potenza ed energia. Il tempo cambia solo l’energia; non cambia la velocità della turbina. Tre cursori, esperimento sul raddoppio del tempo e collegamento al salto WASTA della centrale selezionata.
- Fonti e ipotesi sempre consultabili. Rendimento complessivo fisso ipotizzato all’85%, valori scelti dall’utente e salto WASTA distinguibili. Nessuna promessa di simulare l’esercizio effettivo di una centrale.
- Su schermo piccolo schema, risultati e controlli si impilano. Cursori nativi e possibilità di fermare l’animazione; movimento ridotto rispettato.

Il diagramma della centrale è uno schema geometrico per tipologia. La fotografia scontornata e il collage del kit 10 restano una possibilità successiva: non sono stati sostituiti con immagini sintetiche nella prima bozza.

## Pulizia editoriale — 30 ottobre 2026

Su richiesta dell’utente, la pagina riprende la gerarchia compatta del kit 10: titolo unico con fonte, navigazione, controlli e dati. Rimossi marchio provvisorio, etichetta di bozza, introduzione, titoli duplicati e messaggi didattici ripetuti. Le spiegazioni delle centrali sono in “Dati e funzionamento”; formule e ipotesi in “Modello e ipotesi”; provenienza dei dati in “Fonti e metodo”. Rimangono visibili unità, natura attesa della produzione, modello didattico e rendimento ipotizzato, oltre a una breve istruzione per la lente.

Satoshi Medium 500 per testi e controlli, Bold 700 per selezioni e valori; Cubano 400 per titolo, nomi delle centrali e numeri principali. Spaziature basate su gruppi di 8/12/20/24/28px. I tre cursori conservano descrizioni accessibili senza aggiungere paragrafi visivi. Favicon PNG e SVG copiate dal kit 10; il documento usa lo stesso PNG del riferimento. Rimossi gli stili obsoleti delle viste dismesse.

## Selettore delle centrali

“Scegli una centrale” è un campo combinato con ricerca locale, sempre visibile. Campo a 16px e larghezza massima 340px, bordo sottile neutro senza ombra, freccia discreta; elenco con nome e tipologia, senza dati numerici ridondanti. Su richiesta dell’utente, nessuna icona di ricerca o cancellazione e nessun focus blu; il focus per tastiera è neutro. La scelta corrente resta sincronizzata con mappa e scheda. Ricerca per nome senza distinzione di maiuscole o accenti, con corrispondenze iniziali prima delle altre. Frecce e Invio per scegliere, Escape per annullare; annullare o uscire ripristina il nome confermato. L’elenco si apre sopra o sotto in funzione dello spazio disponibile, anche durante il ridimensionamento della tastiera mobile. Se non ci sono risultati, lo stato vuoto è esplicito. Una scelta visibile nel focus Ticino mantiene l’inquadratura.

## Colore di accento

Su richiesta dell’utente, l’accento principale usa l’azzurro #95d9e5 al 55% di opacità (70% in hover): schede attive, pulsanti e selezione del testo. Il pulsante «Usa il salto di» mantiene sempre lo sfondo di accento, anche senza hover. L’azzurro #95d9e5 resta per legenda e disegni, separato dal colore di accento. Rosa e corallo rimossi dall’interfaccia. La sola ricircolazione usa il giallo #ffd12e, coerente in punti, legenda, schemi e risultati di ricerca; il cursore del salto usa il blu pervinca scuro #33489e. La palette conserva lime e pervinca per le altre categorie.

## Rifinitura del laboratorio

Rimossa la riga visibile sul rendimento; note del modello e fonti riunite in «Fonti, modello e ipotesi», con controllo pausa dell’animazione al suo interno. Rimossa la sezione «Dati e funzionamento» della card della centrale. Laboratorio centrato con larghezza massima 1100px; risultati limitati a 460px su desktop. Schema vettoriale con condotta raccordata, girante a pale curve, scarico dell’acqua e generatore separato, collegato alla turbina da un albero. Salto, flusso e rotazione restano interattivi.

Le pale della girante sono specchiate orizzontalmente dentro il gruppo rotante, mantenendo il verso di rotazione. Su richiesta dell’utente, la velocità delle particelle dipende soltanto dal salto e lo spessore del flusso soltanto dalla portata; la spaziatura delle particelle rimane costante. Il periodo dei trattini coincide con lo spostamento animato, evitando salti nel ciclo. A salto o portata zero il movimento si ferma. Le note chiariscono che non si simula una condotta a diametro fisso. La rotazione risponde più nettamente alla potenza (salto × portata), con velocità limitata per leggibilità. Il tempo non modifica la velocità. Le note dichiarano esplicitamente il significato simbolico della rotazione.

La velocità simbolica della girante usa una curva continua senza soglia di saturazione netta: a parità di portata, ridurre il salto rallenta sempre la rotazione per ogni valore positivo. Il periodo tende gradualmente a un limite minimo, senza appiattire i valori alti dello slider.

Su mobile, la vista Svizzera adatta il viewBox al confine nazionale con un margine minimo per contorno e ombra, così la cartina occupa la larghezza del contenitore. Desktop e focus Ticino mantengono l’inquadratura precedente. La lente conserva le coordinate della scena originale.

Su mobile (fino a 760px) il selettore delle centrali è di sola selezione: campo non modificabile, inputmode none, elenco completo in ordine alfabetico e nessuna tastiera virtuale. Su desktop resta la ricerca per nome. Il passaggio di breakpoint chiude il menu e ripristina la selezione confermata.
