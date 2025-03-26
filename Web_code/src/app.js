const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ2x2dnp3bXlwZnJmbHRvZmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODg5MDYsImV4cCI6MjA1NzI2NDkwNn0.0kv9_bL5lLibR7Y4Ui6fUIq43MekqHNXAcKyIps2HMA";
const url = "https://obglvvzwmypfrfltofgr.supabase.co";
const database = supabase.createClient(url, key);
const tableName = "scritturagiroacc";

// audio variables
let currentVolume = 0;
let currentVolumeAgg = 0;
let currentVolumePow = 0;
let targetVolume = 0;
let targetVolumeAgg = 0;
let targetVolumePow = 0;
let volumeUpdateInterval = null;

// funzione per gestire il volume dell'audio
function updateVolumeSmooth() {
  // Aggiungi più log per il debug
  console.log(
    "Prima: currentVolume =",
    currentVolume,
    "targetVolume =",
    targetVolume,
    "targetVolumeAgg =",
    targetVolumeAgg
  );

  // Calcola la differenza tra volume attuale e target
  const diff = targetVolume - currentVolume;
  const diffAgg = targetVolumeAgg - currentVolumeAgg;
  const diffPow = targetVolumePow - currentVolumePow;

  // Se la differenza è molto piccola, imposta direttamente il volume finale
  if (Math.abs(diff) < 0.05) {
    currentVolume = targetVolume;
    currentVolumeAgg = targetVolumeAgg;
    currentVolumePow = targetVolumePow;

    ohmAudio.volume = currentVolume;
    bisbiglioAudio.volume = currentVolumeAgg;
    mantraAudio.volume = currentVolumePow;

    console.log("Volume raggiunto il target:", currentVolume);
    return;
  }

  // Altrimenti, avvicina gradualmente il volume attuale al target (interpolazione)
  currentVolume += diff * 0.2; // Aumentato per una transizione più veloce
  currentVolumeAgg += diffAgg * 0.2;
  currentVolumePow += diffPow * 0.2;

  // Assicurati che il volume sia limitato tra 0 e 1
  currentVolume = Math.max(0, Math.min(1, currentVolume));
  currentVolumeAgg = Math.max(0, Math.min(1, currentVolumeAgg));
  currentVolumePow = Math.max(0, Math.min(1, currentVolumePow));

  // Applica il nuovo volume
  ohmAudio.volume = currentVolume;
  bisbiglioAudio.volume = currentVolumeAgg;
  mantraAudio.volume = currentVolumePow;

  console.log(
    "Dopo: currentVolume applicato =",
    currentVolume,
    "ohmAudio.volume =",
    ohmAudio.volume
  );
}

//dom elements
const distance = document.getElementById("distance");

document.addEventListener("DOMContentLoaded", async () => {
  //subscribe to changes in the
  database
    .channel(tableName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: tableName },
      (payload) => {
        handleInserts(payload.new);
      }
    )
    .subscribe();

  //select all data from touch
  let { data, error } = await database
    .from(tableName)
    .select("*")
    .in("id", [1, 2, 3]);
  handleInserts(data[0]);

  data.forEach((record) => {
    console.log(`Record ID ${record.id}:`, record);
    handleInserts(record);
  });

  // Aggiorna il volume 60 volte al secondo per una transizione fluida
  volumeUpdateInterval = setInterval(updateVolumeSmooth, 16);
});

// Declare variables in global scope so they can be accessed outside the function
let x, y, z;
let a, b, c;
let e, f, g;
let displayTimerAgg = null; // Rinominato per chiarezza
let displayTimerCont = null;
let displayTimerPow = null;
let scrollTimerAgg = null; // Timer separato per lo scrolling
let scrollTimerCont = null;
let scrollTimerPow = null;

const ohmAudio = new Audio("./assets/audio/ohm.mp3");
ohmAudio.loop = true;
document.addEventListener(
  "click",
  function initialInteraction() {
    ohmAudio
      .play()
      .then(() => {
        console.log("Audio avviato con successo");
        ohmAudio.volume = 0; // Imposta il volume a 0 inizialmente
      })
      .catch((err) => {
        console.error("Errore nell'avvio dell'audio:", err);
      });

    // Rimuovi l'event listener dopo la prima interazione
    document.removeEventListener("click", initialInteraction);
  },
  { once: true }
);

const bisbiglioAudio = new Audio("./assets/audio/bisbiglio.mp3");
bisbiglioAudio.loop = true;
document.addEventListener(
  "click",
  function initialInteraction() {
    bisbiglioAudio
      .play()
      .then(() => {
        console.log("Audio avviato con successo");
        bisbiglioAudio.volume = 0; // Imposta il volume a 0 inizialmente
      })
      .catch((err) => {
        console.error("Errore nell'avvio dell'audio:", err);
      });

    // Rimuovi l'event listener dopo la prima interazione
    document.removeEventListener("click", initialInteraction);
  },
  { once: true }
);

const mantraAudio = new Audio("./assets/audio/bombombom.mp3");
mantraAudio.loop = true;
document.addEventListener(
  "click",
  function initialInteraction() {
    mantraAudio
      .play()
      .then(() => {
        console.log("Audio avviato con successo");
        mantraAudio.volume = 0; // Imposta il volume a 0 inizialmente
      })
      .catch((err) => {
        console.error("Errore nell'avvio dell'audio:", err);
      });

    // Rimuovi l'event listener dopo la prima interazione
    document.removeEventListener("click", initialInteraction);
  },
  { once: true }
);

function scrollArchiveAgg() {
  // Verifica se z è minore di 0.98
  if (z < 0.98) {
    // Seleziona tutte le immagini
    const images = document.querySelectorAll(".agg-archive");

    // Se non ci sono immagini, esci dalla funzione
    if (images.length === 0) return;

    // Trova l'immagine attualmente visibile
    let currentIndex = Array.from(images).findIndex(
      (img) => !img.classList.contains("hidden") || img.style.display !== "none"
    );

    // Se nessuna immagine è visibile, mostra la prima
    if (currentIndex === -1) currentIndex = 0;

    // Nascondi tutte le immagini
    images.forEach((img) => {
      img.classList.add("hidden");
      img.style.display = "none";
    });

    // Calcola l'indice della prossima immagine
    const nextIndex = (currentIndex + 1) % images.length;

    // Mostra la prossima immagine
    images[nextIndex].classList.remove("hidden");
    images[nextIndex].style.display = "block";

    // Cancella il timer esistente se presente
    if (scrollTimerAgg) {
      clearTimeout(scrollTimerAgg);
    }

    // Assicurati che z sia un valore positivo e nel range corretto
    const zSafe = Math.max(0, Math.min(0.98, z));

    // Calcola il timeout in base al valore di z
    const minTimeout = 700; // Timeout minimo (velocità massima)
    const maxTimeout = 3000; // Timeout massimo (velocità minima)

    // Mappiamo z da [0, 0.98] a [minTimeout, maxTimeout]
    const timeout = Math.round(
      minTimeout + (zSafe / 0.98) * (maxTimeout - minTimeout)
    );

    // Assicurati che il timeout sia sempre positivo e almeno pari al minimo
    const safeTimeout = Math.max(minTimeout, timeout);

    // Imposta un nuovo timer
    scrollTimerAgg = setTimeout(scrollArchiveAgg, safeTimeout);

    console.log("z:", z, "timeout:", safeTimeout);

    let volumeParameter = 1 - z;

    if (volumeParameter > 0) {
      targetVolumeAgg = Math.max(0, Math.min(1, volumeParameter));
    } else {
      targetVolumeAgg = 0.05;
    }

    console.log(
      "z:",
      z,
      "timeout:",
      safeTimeout,
      "targetVolumeAgg:",
      targetVolumeAgg
    );
  }
}

function scrollArchiveCont() {
  // Verifica se z è minore di 0.98
  if (c < 0.98) {
    // Seleziona tutte le immagini
    const images = document.querySelectorAll(".con-archive");

    // Se non ci sono immagini, esci dalla funzione
    if (images.length === 0) return;

    // Trova l'immagine attualmente visibile
    let currentIndex = Array.from(images).findIndex(
      (img) => !img.classList.contains("hidden") || img.style.display !== "none"
    );

    // Se nessuna immagine è visibile, mostra la prima
    if (currentIndex === -1) currentIndex = 0;

    // Nascondi tutte le immagini
    images.forEach((img) => {
      img.classList.add("hidden");
      img.style.display = "none";
    });

    // Calcola l'indice della prossima immagine
    const nextIndex = (currentIndex + 1) % images.length;

    // Mostra la prossima immagine
    images[nextIndex].classList.remove("hidden");
    images[nextIndex].style.display = "block";

    // Cancella il timer esistente se presente
    if (scrollTimerCont) {
      clearTimeout(scrollTimerCont);
    }

    // Assicurati che z sia un valore positivo e nel range corretto
    const cSafe = Math.max(0, Math.min(0.98, c));

    // Calcola il timeout in base al valore di z
    const minTimeout = 700; // Timeout minimo (velocità massima)
    const maxTimeout = 3000; // Timeout massimo (velocità minima)

    // Mappiamo z da [0, 0.98] a [minTimeout, maxTimeout]
    const timeout = Math.round(
      minTimeout + (cSafe / 0.98) * (maxTimeout - minTimeout)
    );

    // Assicurati che il timeout sia sempre positivo e almeno pari al minimo
    const safeTimeout = Math.max(minTimeout, timeout);

    // Imposta un nuovo timer
    scrollTimerCont = setTimeout(scrollArchiveCont, safeTimeout);

    console.log("c:", c, "timeout:", safeTimeout);

    let volumeParameter = 1 - c;

    if (volumeParameter > 0) {
      targetVolume = Math.max(0, Math.min(1, volumeParameter));
    } else {
      targetVolume = 0.05;
    }

    console.log(
      "c:",
      c,
      "timeout:",
      safeTimeout,
      "targetVolume:",
      targetVolume
    );
  }
}

function scrollArchivePow() {
  // Verifica se z è minore di 0.98
  if (g < 0.98) {
    // Seleziona tutte le immagini
    const images = document.querySelectorAll(".pow-archive");

    // Se non ci sono immagini, esci dalla funzione
    if (images.length === 0) return;

    // Trova l'immagine attualmente visibile
    let currentIndex = Array.from(images).findIndex(
      (img) => !img.classList.contains("hidden") || img.style.display !== "none"
    );

    // Se nessuna immagine è visibile, mostra la prima
    if (currentIndex === -1) currentIndex = 0;

    // Nascondi tutte le immagini
    images.forEach((img) => {
      img.classList.add("hidden");
      img.style.display = "none";
    });

    // Calcola l'indice della prossima immagine
    const nextIndex = (currentIndex + 1) % images.length;

    // Mostra la prossima immagine
    images[nextIndex].classList.remove("hidden");
    images[nextIndex].style.display = "block";

    // Cancella il timer esistente se presente
    if (scrollTimerPow) {
      clearTimeout(scrollTimerPow);
    }

    // Assicurati che z sia un valore positivo e nel range corretto
    const gSafe = Math.max(0, Math.min(0.98, g));

    // Calcola il timeout in base al valore di z
    const minTimeout = 700; // Timeout minimo (velocità massima)
    const maxTimeout = 3000; // Timeout massimo (velocità minima)

    // Mappiamo z da [0, 0.98] a [minTimeout, maxTimeout]
    const timeout = Math.round(
      minTimeout + (gSafe / 0.98) * (maxTimeout - minTimeout)
    );

    // Assicurati che il timeout sia sempre positivo e almeno pari al minimo
    const safeTimeout = Math.max(minTimeout, timeout);

    // Imposta un nuovo timer
    scrollTimerPow = setTimeout(scrollArchivePow, safeTimeout);

    console.log("g:", g, "timeout:", safeTimeout);

    let volumeParameter = 1 - g;

    if (volumeParameter > 0) {
      targetVolumePow = Math.max(0, Math.min(1, volumeParameter));
    } else {
      targetVolumePow = 0.05;
    }

    console.log(
      "z:",
      z,
      "timeout:",
      safeTimeout,
      "targetVolumePow:",
      targetVolumePow
    );
  }
}

function handleInserts(data) {
  console.log("Received data:", data);

  // Memorizza il valore precedente di z e c
  const prevZ = z;
  const prevC = c;
  const prevG = g;

  // Aggiorna i valori solo se sono presenti nei dati
  if (data.values) {
    if ("x" in data.values) x = data.values.x;
    if ("y" in data.values) y = data.values.y;
    if ("z" in data.values) z = data.values.z;
    if ("a" in data.values) a = data.values.a;
    if ("b" in data.values) b = data.values.b;
    if ("c" in data.values) c = data.values.c;
    if ("e" in data.values) e = data.values.e;
    if ("f" in data.values) f = data.values.f;
    if ("g" in data.values) g = data.values.g;
  }

  // Aggiorna il display con i valori correnti
  document.getElementById("res").innerHTML =
    "x: " +
    (x !== undefined ? x : "N/A") +
    " y: " +
    (y !== undefined ? y : "N/A") +
    " z: " +
    (z !== undefined ? z : "N/A") +
    "<br>" +
    "a: " +
    (a !== undefined ? a : "N/A") +
    " b: " +
    (b !== undefined ? b : "N/A") +
    " c: " +
    (c !== undefined ? c : "N/A") +
    "<br>" +
    "e: " +
    (e !== undefined ? e : "N/A") +
    " f: " +
    (f !== undefined ? f : "N/A") +
    " g: " +
    (g !== undefined ? g : "N/A");

  // checks if the object is on the table or in the hands of the user
  if (z < 0.98) {
    // the object is not on the table
    // Reset timer if present
    if (displayTimerAgg) {
      clearTimeout(displayTimerAgg);
      displayTimerAgg = null;
    }
    document.getElementById("agg").style.display = "block";

    // Avvia lo scrolling solo se non è già in corso o se c'è stato un cambio significativo
    // da sopra a sotto la soglia
    if (!scrollTimerAgg || (prevZ >= 0.98 && z < 0.98)) {
      // Se c'è già un timer attivo, lo cancelliamo per evitare sovrapposizioni
      if (scrollTimerAgg) {
        clearTimeout(scrollTimerAgg);
        scrollTimerAgg = null;
      }
      scrollArchiveAgg();
    }

    // Non riavviamo scrollArchive ad ogni aggiornamento se è già in esecuzione
    // La funzione scrollArchive si adatterà al nuovo valore di z al prossimo ciclo
  } else {
    // the object is on the table (perpendicular to g)
    // start timer if z > 0.98

    targetVolumeAgg = 0;

    if (!displayTimerAgg) {
      displayTimerAgg = setTimeout(() => {
        document.getElementById("agg").style.display = "none";
        displayTimerAgg = null;

        // Ferma lo scrolling quando l'oggetto è sul tavolo
        if (scrollTimerAgg) {
          clearTimeout(scrollTimerAgg);
          scrollTimerAgg = null;
        }
      }, 5000);
    }
  }

  // checks if the object is on the table or in the hands of the user
  if (c < 0.98) {
    // the object is not on the table
    // Reset timer if present
    if (displayTimerCont) {
      clearTimeout(displayTimerCont);
      displayTimerCont = null;
    }
    document.getElementById("cont").style.display = "block";

    // Avvia lo scrolling solo se non è già in corso o se c'è stato un cambio significativo
    // da sopra a sotto la soglia
    if (!scrollTimerCont || (prevC >= 0.98 && c < 0.98)) {
      // Se c'è già un timer attivo, lo cancelliamo per evitare sovrapposizioni
      if (scrollTimerCont) {
        clearTimeout(scrollTimerCont);
        scrollTimerCont = null;
      }
      scrollArchiveCont();
    }

    // Non riavviamo scrollArchive ad ogni aggiornamento se è già in esecuzione
    // La funzione scrollArchive si adatterà al nuovo valore di z al prossimo ciclo
  } else {
    // the object is on the table (perpendicular to g)
    // start timer if z > 0.98
    targetVolume = 0;

    if (!displayTimerCont) {
      displayTimerCont = setTimeout(() => {
        document.getElementById("cont").style.display = "none";

        displayTimerCont = null;

        // Ferma lo scrolling quando l'oggetto è sul tavolo
        if (scrollTimerCont) {
          clearTimeout(scrollTimerCont);
          scrollTimerCont = null;
        }
      }, 5000);
    }
  }

  // checks if the object is on the table or in the hands of the user
  if (g < 0.98) {
    // the object is not on the table
    // Reset timer if present
    if (displayTimerPow) {
      clearTimeout(displayTimerPow);
      displayTimerPow = null;
    }
    document.getElementById("pow").style.display = "block";

    // Avvia lo scrolling solo se non è già in corso o se c'è stato un cambio significativo
    // da sopra a sotto la soglia
    if (!scrollTimerPow || (prevG >= 0.98 && g < 0.98)) {
      // Se c'è già un timer attivo, lo cancelliamo per evitare sovrapposizioni
      if (scrollTimerPow) {
        clearTimeout(scrollTimerPow);
        scrollTimerPow = null;
      }
      scrollArchivePow();
    }

    // Non riavviamo scrollArchive ad ogni aggiornamento se è già in esecuzione
    // La funzione scrollArchive si adatterà al nuovo valore di z al prossimo ciclo
  } else {
    // the object is on the table (perpendicular to g)
    // start timer if z > 0.98

    targetVolumePow = 0;

    if (!displayTimerPow) {
      displayTimerPow = setTimeout(() => {
        document.getElementById("pow").style.display = "none";
        displayTimerPow = null;

        // Ferma lo scrolling quando l'oggetto è sul tavolo
        if (scrollTimerPow) {
          clearTimeout(scrollTimerPow);
          scrollTimerPow = null;
        }
      }, 5000);
    }
  }
}
