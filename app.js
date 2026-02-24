const DB_NAME = "window-door-db";
const STORE_NAME = "materials";
const DB_VERSION = 13;

document.addEventListener('DOMContentLoaded', () => {
    const badge = document.getElementById('dbVersionBadge');
    if (badge) badge.textContent = `DB v${DB_VERSION}`;
});

// Alte Datenbank löschen bei Versionsmismatch
const cleanOldDatabase = () => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    deleteRequest.onsuccess = () => console.log("Alte DB gelöscht");
    deleteRequest.onerror = () => console.warn("Konnte alte DB nicht löschen");
};

// Prüfe ob wir eine neue Version brauchen
const checkDatabaseVersion = () => {
    return new Promise((resolve) => {
        try {
            const request = indexedDB.open(DB_NAME);
            request.onsuccess = () => {
                const db = request.result;
                const currentVersion = db.version;
                db.close();
                if (currentVersion !== DB_VERSION) {
                    cleanOldDatabase();
                }
                resolve();
            };
            request.onerror = () => resolve();
        } catch {
            resolve();
        }
    });
};

const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const offlineState = document.getElementById("offlineState");
const installBtn = document.getElementById("installBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFileInput = document.getElementById("importFile");

const orderNumberInput = document.getElementById("orderNumber");
const customerNameInput = document.getElementById("customerName");
const positionInput = document.getElementById("position");
const quantityInput = document.getElementById("quantity");

const materialTop = document.getElementById("materialTop");
const materialBottom = document.getElementById("materialBottom");
const materialLeft = document.getElementById("materialLeft");
const materialRight = document.getElementById("materialRight");
const windowImg = document.getElementById("windowImg");

const windowTypeRadios = document.querySelectorAll('input[name="windowType"]');
const productCategoryRadios = document.querySelectorAll('input[name="productCategory"]');
const typeSelector = document.getElementById("typeSelector");

let db;
let deferredPrompt;
let currentWindowType = "dreh";
let currentCategory = "fenster";
let loadedFileName = null; // Speichert den Namen der geladenen Datei

const windowImages = {
    fenster: {
        dreh: "images/dreh.png",
        kipp: "images/kipp.png",
        drehkipp: "images/dreh_kipp.png",
        stulp: "images/dreh.png"
    },
    tuer: {
        drehkipp: "images/tuer_drehkipp.png",
        stulp: "images/tuer_stulp.png"
    }
};

const updateOfflineState = () => {
    offlineState.textContent = navigator.onLine ? "Online" : "Offline";
};

const openDatabase = () =>
    new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            // Alte Daten löschen und Store neu erstellen
            if (dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.deleteObjectStore(STORE_NAME);
            }
            const store = dbInstance.createObjectStore(STORE_NAME, {
                keyPath: "id",
                autoIncrement: true,
            });
            store.createIndex("windowType", "windowType", { unique: false });
            store.createIndex("position", "position", { unique: false });
            store.createIndex("minWidth", "minWidth", { unique: false });
            store.createIndex("maxWidth", "maxWidth", { unique: false });
            store.createIndex("minHeight", "minHeight", { unique: false });
            store.createIndex("maxHeight", "maxHeight", { unique: false });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

const runTransaction = (mode, callback) =>
    new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const result = callback(store);

        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
    });

const addMaterial = async (material) => {
    await runTransaction("readwrite", (store) => store.add(material));
};

const getAllMaterials = async () =>
    new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

const findMaterial = async (windowType, width, height) => {
    const materials = await getAllMaterials();
    console.log("Alle Materialien:", materials.length);
    console.log("Suche für:", { windowType, width, height });
    
    // Für ALLE Fenstertypen:
    // Links + Rechts: basierend auf FFH (Höhe)
    // Oben + Unten: basierend auf FFB (Breite)
    
    const left = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.position === "left" &&
            height >= m.minHeight &&
            height <= m.maxHeight
    );
    
    const right = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.position === "right" &&
            height >= m.minHeight &&
            height <= m.maxHeight
    );
    
    const top = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.position === "top" &&
            width >= m.minWidth &&
            width <= m.maxWidth
    );
    
    const bottom = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.position === "bottom" &&
            width >= m.minWidth &&
            width <= m.maxWidth
    );
    
    console.log("Gefundene Materialien:", { left, right, top, bottom });
    
    if (!left || !right || !top || !bottom) return null;
    
    return {
        top: top.material,
        bottom: bottom.material,
        left: left.material,
        right: right.material
    };
};

const updateWindowImage = () => {
    const imagePath = windowImages[currentCategory]?.[currentWindowType];
    if (imagePath) {
        windowImg.src = imagePath;
        windowImg.alt = `${currentCategory === 'tuer' ? 'Balkontür' : 'Fenster'} ${currentWindowType}`;
    }
};

const updateTypeSelector = () => {
    if (currentCategory === 'fenster') {
        typeSelector.innerHTML = `
            <option value="dreh">Dreh</option>
            <option value="kipp">Kipp</option>
            <option value="drehkipp">Drehkipp</option>
            <option value="stulp">Stulp</option>
        `;
        currentWindowType = 'dreh';
    } else {
        typeSelector.innerHTML = `
            <option value="drehkipp">Drehkipp</option>
            <option value="stulp">Stulp</option>
        `;
        currentWindowType = 'drehkipp';
    }
    typeSelector.value = currentWindowType;
};

const updateMaterialDisplay = (material) => {
    if (!material) {
        materialTop.textContent = "—";
        materialBottom.textContent = "—";
        materialLeft.textContent = "—";
        materialRight.textContent = "—";
        return;
    }

    materialTop.textContent = material.top || "—";
    materialBottom.textContent = material.bottom || "—";
    materialLeft.textContent = material.left || "—";
    materialRight.textContent = material.right || "—";
};

const formatDateForFilename = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

const ensureXlsxLoaded = () =>
    new Promise((resolve, reject) => {
        if (window.XLSX) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "vendor/xlsx.full.min.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("XLSX konnte nicht geladen werden"));
        document.head.appendChild(script);
    });

const getExportRows = () => {
    try {
        const raw = localStorage.getItem("exportRows");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveExportRows = (rows) => {
    localStorage.setItem("exportRows", JSON.stringify(rows));
};

const getTypeLabel = (category, windowType) => {
    if (category === "tuer") {
        return windowType === "stulp" ? "Stulptür" : "Drehkipptür";
    }

    switch (windowType) {
        case "kipp":
            return "Kippfenster";
        case "drehkipp":
            return "Drehkippfenster";
        case "stulp":
            return "Stulpfenster";
        case "dreh":
        default:
            return "Drehfenster";
    }
};

const normalizeExportRows = (rows) =>
    rows
        .filter(Boolean)
        .map((row) => {
            if (Array.isArray(row)) return row;
            return [
                row["Vorgangsnummer"],
                row["Kunde"],
                row["Pos"],
                row["Menge"],
                row["Typ"],
                row["Flügelbreite"],
                row["Flügelhöhe"],
                row["Beschlag Rechts"],
                row["Beschlag Links"],
                row["Beschlag Oben"],
                row["Beschlag Unten"],
            ];
        });

const saveRowToMemory = () => {
    const orderNumber = orderNumberInput.value.trim();
    const customerName = customerNameInput.value.trim();
    const position = positionInput.value.trim();
    const quantity = Number(quantityInput.value);
    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    if (!orderNumber || !customerName || !position || !quantity || !width || !height) {
        alert("Bitte alle Pflichtfelder ausfüllen (Vorgangsnummer, Name, Position, Menge, FFB, FFH).");
        return;
    }

    const materialData = {
        top: materialTop.textContent.trim(),
        bottom: materialBottom.textContent.trim(),
        left: materialLeft.textContent.trim(),
        right: materialRight.textContent.trim(),
    };

    const typeLabel = getTypeLabel(currentCategory, currentWindowType);
    const row = [
        orderNumber,
        customerName,
        position,
        quantity,
        typeLabel,
        width,
        height,
        materialData.right,
        materialData.left,
        materialData.top,
        materialData.bottom,
    ];

    const rows = normalizeExportRows(getExportRows());
    rows.push(row);
    saveExportRows(rows);
    alert("Zeile gespeichert. Jetzt können Sie weitere Daten eingeben oder auf 'In Datei schreiben' klicken.");
    
    // Eingabefelder leeren
    orderNumberInput.value = "";
    customerNameInput.value = "";
    positionInput.value = "";
    quantityInput.value = "1";
    widthInput.value = "";
    heightInput.value = "";
    updateMaterials();
};

const exportToExcel = async () => {
    try {
        await ensureXlsxLoaded();
    } catch (error) {
        alert("Export nicht möglich. Bitte prüfen Sie die Internetverbindung.");
        return;
    }

    const rows = normalizeExportRows(getExportRows());
    if (!rows.length) {
        alert("Keine Daten zum Exportieren. Bitte speichern Sie zunächst Daten mit 'Daten Zwischenspeichern'.");
        return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Konfiguration");

    const arrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Verwende geladenen Dateinamen oder generiere neuen
    const fileName = loadedFileName || `Vorgaenge_${formatDateForFilename(new Date())}.xlsx`;
    const file = new File([blob], fileName, { type: blob.type });

    // Direkter Download (Share API ist oft nicht verfügbar)
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    
    alert("Datei heruntergeladen: " + fileName);
};

const importFromExcel = async (file) => {
    try {
        await ensureXlsxLoaded();
    } catch (error) {
        alert("Import nicht möglich. Bitte prüfen Sie die Internetverbindung.");
        return;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        if (!rows.length) {
            alert("Keine Daten in der Datei gefunden.");
            return;
        }
        // Speichere alle vorhandenen Zeilen (inklusive evtl. vorhandener Überschriften)
        saveExportRows(rows);
        // Speichere den Dateinamen für späteren Export
        loadedFileName = file.name;
        alert("Datei geladen. Neue Vorgänge werden jetzt angehängt.");
    } catch (error) {
        alert("Datei konnte nicht gelesen werden.");
    }
};

const initSampleData = async () => {
    const count = await getAllMaterials();
    console.log("Vorhandene Materialien:", count.length);
    // Immer neu laden, wenn nicht die erwartete Anzahl vorhanden ist
    if (count.length === 108) return; // 83 Fenster + 15 Tür-Drehkipp + 10 Tür-Stulp = 108 erwartete Materialien
    
    console.log("Lade Materialien aus JSON-Datei...");
    const materials = await loadMaterialsFromJSON();
    
    if (materials.length === 0) {
        console.error("Keine Materialien geladen!");
        return;
    }
    
    for (const material of materials) {
        await addMaterial(material);
    }
    
    console.log(`${materials.length} Materialien erfolgreich geladen.`);
};

const loadMaterialsFromJSON = async () => {
    try {
        const response = await fetch('materials.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const materials = await response.json();
        console.log(`Lade ${materials.length} Materialien aus JSON...`);
        return materials;
    } catch (error) {
        console.error('Fehler beim Laden der materials.json:', error);
        return [];
    }
};

const initApp = async () => {
    await checkDatabaseVersion();
    db = await openDatabase();
    await initSampleData();
    updateTypeSelector();
    updateWindowImage();
};

const updateMaterials = async () => {
    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    console.log("updateMaterials called:", { width, height, currentWindowType, currentCategory });

    if (!width || !height) {
        console.log("Keine Werte, zeige null");
        updateMaterialDisplay(null);
        return;
    }

    // 40mm von Breite und Höhe abziehen
    const adjustedWidth = width - 40;
    const adjustedHeight = height - 40;

    console.log("Angepasste Werte:", { adjustedWidth, adjustedHeight });

    // Erstelle den kombinierten Typ für die Datenbank (z.B. "fenster-dreh" oder "tuer-drehkipp")
    const dbType = `${currentCategory}-${currentWindowType}`;
    const material = await findMaterial(dbType, adjustedWidth, adjustedHeight);
    console.log("Material gefunden:", material);
    updateMaterialDisplay(material);
};

productCategoryRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
        currentCategory = e.target.value;
        updateTypeSelector();
        updateWindowImage();
        updateMaterials();
    });
});

typeSelector.addEventListener("change", (e) => {
    currentWindowType = e.target.value;
    updateWindowImage();
    updateMaterials();
});

const saveRowBtn = document.getElementById("saveRowBtn");
saveRowBtn.addEventListener("click", saveRowToMemory);

exportBtn.addEventListener("click", exportToExcel);

importBtn.addEventListener("click", () => {
    importFileInput.click();
});

importFileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) {
        importFromExcel(file);
    }
    event.target.value = "";
});

widthInput.addEventListener("input", updateMaterials);
heightInput.addEventListener("input", updateMaterials);

window.addEventListener("online", updateOfflineState);
window.addEventListener("offline", updateOfflineState);

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
});

const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
        const registration = await navigator.serviceWorker.register("sw.js");
        console.log("Service Worker registriert");
        
        // Automatisches Update prüfen
        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "activated" && navigator.serviceWorker.controller) {
                    console.log("Neue Version verfügbar - Seite wird neu geladen...");
                    window.location.reload();
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
};

// Auf Service Worker Controller-Wechsel reagieren
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker aktualisiert");
        window.location.reload();
    });
}

// Long press zum Neuladen (Tablet)
let longPressTimer = null;

document.body.addEventListener("touchstart", (e) => {
    longPressTimer = setTimeout(() => {
        console.log("Long press detected - Seite wird neu geladen");
        window.location.reload();
    }, 2000); // 2 Sekunden
});

document.body.addEventListener("touchend", () => {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
});

document.body.addEventListener("touchmove", () => {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
});

updateOfflineState();
registerServiceWorker();
initApp();
