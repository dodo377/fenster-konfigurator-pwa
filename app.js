const DB_NAME = "window-door-db";
const STORE_NAME = "materials";
const DB_VERSION = 9;

const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const offlineState = document.getElementById("offlineState");
const installBtn = document.getElementById("installBtn");

const materialTop = document.getElementById("materialTop");
const materialBottom = document.getElementById("materialBottom");
const materialLeft = document.getElementById("materialLeft");
const materialRight = document.getElementById("materialRight");
const windowImg = document.getElementById("windowImg");

const windowTypeRadios = document.querySelectorAll('input[name="windowType"]');

let db;
let deferredPrompt;
let currentWindowType = "dreh";

const windowImages = {
    dreh: "images/dreh.png",
    kipp: "images/kipp.png",
    drehkipp: "images/dreh_kipp.png",
    stulp: "images/dreh.png"
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
    windowImg.src = windowImages[currentWindowType];
    windowImg.alt = `Fenster ${currentWindowType}`;
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

const initSampleData = async () => {
    const count = await getAllMaterials();
    console.log("Vorhandene Materialien:", count.length);
    // Immer neu laden, wenn nicht die erwartete Anzahl vorhanden ist
    if (count.length === 83) return; // 26+14+26+17 = 83 erwartete Materialien
    
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
    db = await openDatabase();
    await initSampleData();
    updateWindowImage();
};

const updateMaterials = async () => {
    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    console.log("updateMaterials called:", { width, height, currentWindowType });

    if (!width || !height) {
        console.log("Keine Werte, zeige null");
        updateMaterialDisplay(null);
        return;
    }

    // 40mm von Breite und Höhe abziehen
    const adjustedWidth = width - 40;
    const adjustedHeight = height - 40;

    console.log("Angepasste Werte:", { adjustedWidth, adjustedHeight });

    const material = await findMaterial(currentWindowType, adjustedWidth, adjustedHeight);
    console.log("Material gefunden:", material);
    updateMaterialDisplay(material);
};

windowTypeRadios.forEach((radio) => {
    radio.addEventListener("change", async (event) => {
        currentWindowType = event.target.value;
        updateWindowImage();
        await updateMaterials();
    });
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
