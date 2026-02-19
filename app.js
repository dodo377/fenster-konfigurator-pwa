const DB_NAME = "window-door-db";
const STORE_NAME = "materials";
const DB_VERSION = 6;

const dimensionForm = document.getElementById("dimensionForm");
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
    dreh: "dreh.svg",
    kipp: "kipp.svg",
    drehkipp: "drehkipp.svg",
    stulp: "stulp.svg"
};

const updateOfflineState = () => {
    offlineState.textContent = navigator.onLine ? "Online" : "Offline";
};

const openDatabase = () =>
    new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
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
            }
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
    
    // Links: basierend auf FFH (Höhe)
    const left = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.position === "left" &&
            height >= m.minHeight &&
            height <= m.maxHeight
    );
    
    // Rechts: basierend auf FFB (Breite)
    const right = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.position === "right" &&
            width >= m.minWidth &&
            width <= m.maxWidth
    );
    
    // Oben: basierend auf FFH (Höhe)
    const top = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.position === "top" &&
            height >= m.minHeight &&
            height <= m.maxHeight
    );
    
    // Unten: basierend auf FFB (Breite)
    const bottom = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.position === "bottom" &&
            width >= m.minWidth &&
            width <= m.maxWidth
    );
    
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
    if (count.length > 0) return;

    // DREH - LINKS (basierend auf FFH = Höhe)
    const drehLeft = [
        { windowType: "dreh", position: "left", minHeight: 231, maxHeight: 325, minWidth: 0, maxWidth: 99999, material: "GAK.465" },
        { windowType: "dreh", position: "left", minHeight: 326, maxHeight: 510, minWidth: 0, maxWidth: 99999, material: "GAM.800" },
        { windowType: "dreh", position: "left", minHeight: 511, maxHeight: 710, minWidth: 0, maxWidth: 99999, material: "GAM.800" },
        { windowType: "dreh", position: "left", minHeight: 711, maxHeight: 980, minWidth: 0, maxWidth: 99999, material: "GAM.1050-1" },
        { windowType: "dreh", position: "left", minHeight: 981, maxHeight: 1400, minWidth: 0, maxWidth: 99999, material: "GAM.1400-1" },
        { windowType: "dreh", position: "left", minHeight: 1401, maxHeight: 1800, minWidth: 0, maxWidth: 99999, material: "GAM.1800-2" },
        { windowType: "dreh", position: "left", minHeight: 1801, maxHeight: 2300, minWidth: 0, maxWidth: 99999, material: "GAM.2300-3" },
        { windowType: "dreh", position: "left", minHeight: 2301, maxHeight: 2725, minWidth: 0, maxWidth: 99999, material: "GAM.2300-3 + MK.250-1 + MK.250-1" }
    ];

    // DREH - RECHTS (basierend auf FFB = Breite)
    const drehRight = [
        { windowType: "dreh", position: "right", minWidth: 0, maxWidth: 860, minHeight: 0, maxHeight: 99999, material: "AWDR" },
        { windowType: "dreh", position: "right", minWidth: 861, maxWidth: 1285, minHeight: 0, maxHeight: 99999, material: "M.500-1" },
        { windowType: "dreh", position: "right", minWidth: 1286, maxWidth: 1535, minHeight: 0, maxHeight: 99999, material: "M.750-1" },
        { windowType: "dreh", position: "right", minWidth: 1536, maxWidth: 1785, minHeight: 0, maxHeight: 99999, material: "MK.500-1 + M.500-1" },
        { windowType: "dreh", position: "right", minWidth: 1786, maxWidth: 2035, minHeight: 0, maxHeight: 99999, material: "MK.750-1 + M.500-1" },
        { windowType: "dreh", position: "right", minWidth: 2036, maxWidth: 2285, minHeight: 0, maxHeight: 99999, material: "MK.750-1 + M.750-1" },
        { windowType: "dreh", position: "right", minWidth: 2286, maxWidth: 2535, minHeight: 0, maxHeight: 99999, material: "MK.750-1 + MK.500-1 + M.500-1" },
        { windowType: "dreh", position: "right", minWidth: 2536, maxWidth: 2725, minHeight: 0, maxHeight: 99999, material: "MK.750-1 + MK.750-1 + M.500-1" }
    ];

    // DREH - OBEN (basierend auf FFH = Höhe)
    const drehTop = [
        { windowType: "dreh", position: "top", minHeight: 271, maxHeight: 600, minWidth: 0, maxWidth: 99999, material: "OS1.600" },
        { windowType: "dreh", position: "top", minHeight: 601, maxHeight: 800, minWidth: 0, maxWidth: 99999, material: "OS2.800" },
        { windowType: "dreh", position: "top", minHeight: 801, maxHeight: 1025, minWidth: 0, maxWidth: 99999, material: "OS2.1025-1" },
        { windowType: "dreh", position: "top", minHeight: 1026, maxHeight: 1250, minWidth: 0, maxWidth: 99999, material: "OS2.1250-1" },
        { windowType: "dreh", position: "top", minHeight: 1251, maxHeight: 1475, minWidth: 0, maxWidth: 99999, material: "OS2.1475-1" },
        { windowType: "dreh", position: "top", minHeight: 1476, maxHeight: 1725, minWidth: 0, maxWidth: 99999, material: "OS2.1475-1 + ZSR" }
    ];

    // DREH - UNTEN (basierend auf FFB = Breite)
    const drehBottom = [
        { windowType: "dreh", position: "bottom", minWidth: 0, maxWidth: 840, minHeight: 0, maxHeight: 99999, material: "AWDR" },
        { windowType: "dreh", position: "bottom", minWidth: 841, maxWidth: 1250, minHeight: 0, maxHeight: 99999, material: "M.500-1" },
        { windowType: "dreh", position: "bottom", minWidth: 1251, maxWidth: 1500, minHeight: 0, maxHeight: 99999, material: "M.750-1" },
        { windowType: "dreh", position: "bottom", minWidth: 1501, maxWidth: 1725, minHeight: 0, maxHeight: 99999, material: "MK.500-1 + M.500-1" }
    ];

    // KIPP - LINKS (basierend auf FFH = Höhe)
    const kippLeft = [
        { windowType: "kipp", position: "left", minHeight: 0, maxHeight: 860, minWidth: 0, maxWidth: 99999, material: "AWDR" },
        { windowType: "kipp", position: "left", minHeight: 861, maxHeight: 1285, minWidth: 0, maxWidth: 99999, material: "M.500-1" },
        { windowType: "kipp", position: "left", minHeight: 1286, maxHeight: 1525, minWidth: 0, maxWidth: 99999, material: "M.750-1" }
    ];

    // KIPP - RECHTS (basierend auf FFH = Höhe - gleich wie links)
    const kippRight = [
        { windowType: "kipp", position: "right", minHeight: 0, maxHeight: 860, minWidth: 0, maxWidth: 99999, material: "AWDR" },
        { windowType: "kipp", position: "right", minHeight: 861, maxHeight: 1285, minWidth: 0, maxWidth: 99999, material: "M.500-1" },
        { windowType: "kipp", position: "right", minHeight: 1286, maxHeight: 1525, minWidth: 0, maxWidth: 99999, material: "M.750-1" }
    ];

    // KIPP - OBEN (basierend auf FFB = Breite)
    const kippTop = [
        { windowType: "kipp", position: "top", minWidth: 326, maxWidth: 710, minHeight: 0, maxHeight: 99999, material: "GAM.800 + GRT" },
        { windowType: "kipp", position: "top", minWidth: 711, maxWidth: 1050, minHeight: 0, maxHeight: 99999, material: "GAM.1050-1 + GRT" },
        { windowType: "kipp", position: "top", minWidth: 1051, maxWidth: 1400, minHeight: 0, maxHeight: 99999, material: "GAM.1400-1 + GRT (2x)" },
        { windowType: "kipp", position: "top", minWidth: 1401, maxWidth: 1800, minHeight: 0, maxHeight: 99999, material: "GAM.1800-2 + GRT (2x)" },
        { windowType: "kipp", position: "top", minWidth: 1801, maxWidth: 2300, minHeight: 0, maxHeight: 99999, material: "GAM.2300-3 + GRT (2x)" }
    ];

    // KIPP - UNTEN (basierend auf FFB = Breite)
    const kippBottom = [
        { windowType: "kipp", position: "bottom", minWidth: 326, maxWidth: 990, minHeight: 0, maxHeight: 99999, material: "KB + SL (2x)" },
        { windowType: "kipp", position: "bottom", minWidth: 991, maxWidth: 1790, minHeight: 0, maxHeight: 99999, material: "KB + SL (3x)" },
        { windowType: "kipp", position: "bottom", minWidth: 1791, maxWidth: 2300, minHeight: 0, maxHeight: 99999, material: "KB + SL (4x)" }
    ];

    // DREHKIPP - LINKS (basierend auf FFH = Höhe)
    const drehkippLeft = [
        { windowType: "drehkipp", position: "left", minHeight: 231, maxHeight: 325, minWidth: 0, maxWidth: 99999, material: "GAK.465" },
        { windowType: "drehkipp", position: "left", minHeight: 326, maxHeight: 510, minWidth: 0, maxWidth: 99999, material: "GAM.800" },
        { windowType: "drehkipp", position: "left", minHeight: 511, maxHeight: 710, minWidth: 0, maxWidth: 99999, material: "GAM.800" },
        { windowType: "drehkipp", position: "left", minHeight: 711, maxHeight: 980, minWidth: 0, maxWidth: 99999, material: "GAM.1050-1" },
        { windowType: "drehkipp", position: "left", minHeight: 981, maxHeight: 1400, minWidth: 0, maxWidth: 99999, material: "GAM.1400-1" },
        { windowType: "drehkipp", position: "left", minHeight: 1401, maxHeight: 1800, minWidth: 0, maxWidth: 99999, material: "GAM.1800-2" },
        { windowType: "drehkipp", position: "left", minHeight: 1801, maxHeight: 2300, minWidth: 0, maxWidth: 99999, material: "GAM.2300-3" },
        { windowType: "drehkipp", position: "left", minHeight: 2301, maxHeight: 2725, minWidth: 0, maxWidth: 99999, material: "GAM.2300-3 + MK.250-1 + MK.250-1" }
    ];

    // DREHKIPP - RECHTS (basierend auf FFB = Breite)
    const drehkippRight = [
        { windowType: "drehkipp", position: "right", minWidth: 0, maxWidth: 860, minHeight: 0, maxHeight: 99999, material: "AWDR" },
        { windowType: "drehkipp", position: "right", minWidth: 861, maxWidth: 1285, minHeight: 0, maxHeight: 99999, material: "M.500-1" },
        { windowType: "drehkipp", position: "right", minWidth: 1286, maxWidth: 1535, minHeight: 0, maxHeight: 99999, material: "M.750-1" },
        { windowType: "drehkipp", position: "right", minWidth: 1536, maxWidth: 1785, minHeight: 0, maxHeight: 99999, material: "MK.500-1 + M.500-1" },
        { windowType: "drehkipp", position: "right", minWidth: 1786, maxWidth: 2035, minHeight: 0, maxHeight: 99999, material: "MK.750-1 + M.500-1" },
        { windowType: "drehkipp", position: "right", minWidth: 2036, maxWidth: 2285, minHeight: 0, maxHeight: 99999, material: "MK.750-1 + M.750-1" },
        { windowType: "drehkipp", position: "right", minWidth: 2286, maxWidth: 2535, minHeight: 0, maxHeight: 99999, material: "MK.750-1 + MK.500-1 + M.500-1" },
        { windowType: "drehkipp", position: "right", minWidth: 2536, maxWidth: 2725, minHeight: 0, maxHeight: 99999, material: "MK.750-1 + MK.750-1 + M.500-1" }
    ];

    // DREHKIPP - OBEN (basierend auf FFH = Höhe)
    const drehkippTop = [
        { windowType: "drehkipp", position: "top", minHeight: 271, maxHeight: 600, minWidth: 0, maxWidth: 99999, material: "OS1.600" },
        { windowType: "drehkipp", position: "top", minHeight: 601, maxHeight: 800, minWidth: 0, maxWidth: 99999, material: "OS2.800" },
        { windowType: "drehkipp", position: "top", minHeight: 801, maxHeight: 1025, minWidth: 0, maxWidth: 99999, material: "OS2.1025-1" },
        { windowType: "drehkipp", position: "top", minHeight: 1026, maxHeight: 1250, minWidth: 0, maxWidth: 99999, material: "OS2.1250-1" },
        { windowType: "drehkipp", position: "top", minHeight: 1251, maxHeight: 1475, minWidth: 0, maxWidth: 99999, material: "OS2.1475-1" },
        { windowType: "drehkipp", position: "top", minHeight: 1476, maxHeight: 1725, minWidth: 0, maxWidth: 99999, material: "OS2.1475-1 + ZSR" }
    ];

    // DREHKIPP - UNTEN (basierend auf FFB = Breite)
    const drehkippBottom = [
        { windowType: "drehkipp", position: "bottom", minWidth: 0, maxWidth: 840, minHeight: 0, maxHeight: 99999, material: "AWDR" },
        { windowType: "drehkipp", position: "bottom", minWidth: 841, maxWidth: 1250, minHeight: 0, maxHeight: 99999, material: "M.500-1" },
        { windowType: "drehkipp", position: "bottom", minWidth: 1251, maxWidth: 1500, minHeight: 0, maxHeight: 99999, material: "M.750-1" },
        { windowType: "drehkipp", position: "bottom", minWidth: 1501, maxWidth: 1725, minHeight: 0, maxHeight: 99999, material: "MK.500-1 + M.500-1" }
    ];

    // STULP - LINKS (basierend auf FFH = Höhe)
    const stulpLeft = [
        { windowType: "stulp", position: "left", minHeight: 411, maxHeight: 710, minWidth: 0, maxWidth: 99999, material: "GASM.800" },
        { windowType: "stulp", position: "left", minHeight: 711, maxHeight: 980, minWidth: 0, maxWidth: 99999, material: "GASM.1050-1.E3" },
        { windowType: "stulp", position: "left", minHeight: 981, maxHeight: 1400, minWidth: 0, maxWidth: 99999, material: "GASM.GZ.1400-1" },
        { windowType: "stulp", position: "left", minHeight: 1401, maxHeight: 1800, minWidth: 0, maxWidth: 99999, material: "GASM.GZ.1800-2" },
        { windowType: "stulp", position: "left", minHeight: 1801, maxHeight: 2300, minWidth: 0, maxWidth: 99999, material: "GASM.GZ.2300-3" },
        { windowType: "stulp", position: "left", minHeight: 2301, maxHeight: 2725, minWidth: 0, maxWidth: 99999, material: "GASM.GZ.2300-3 + MS.SU.250-1 + MS.SO.250-1" }
    ];

    // STULP - RECHTS (basierend auf FFH = Höhe)
    const stulpRight = [
        { windowType: "stulp", position: "right", minHeight: 801, maxHeight: 1600, minWidth: 0, maxWidth: 99999, material: "ZV-FT (1x)" },
        { windowType: "stulp", position: "right", minHeight: 1601, maxHeight: 2400, minWidth: 0, maxWidth: 99999, material: "ZV-FT (2x)" },
        { windowType: "stulp", position: "right", minHeight: 2401, maxHeight: 2725, minWidth: 0, maxWidth: 99999, material: "ZV-FT (3x)" }
    ];

    // STULP - OBEN (basierend auf FFB = Breite)
    const stulpTop = [
        { windowType: "stulp", position: "top", minWidth: 0, maxWidth: 840, minHeight: 0, maxHeight: 99999, material: "AWDR" },
        { windowType: "stulp", position: "top", minWidth: 841, maxWidth: 1250, minHeight: 0, maxHeight: 99999, material: "M.500-1" },
        { windowType: "stulp", position: "top", minWidth: 1251, maxWidth: 1500, minHeight: 0, maxHeight: 99999, material: "M.750-1" },
        { windowType: "stulp", position: "top", minWidth: 1501, maxWidth: 1725, minHeight: 0, maxHeight: 99999, material: "MK.500-1 + M.500-1" }
    ];

    // STULP - UNTEN (basierend auf FFB = Breite - gleich wie oben)
    const stulpBottom = [
        { windowType: "stulp", position: "bottom", minWidth: 0, maxWidth: 840, minHeight: 0, maxHeight: 99999, material: "AWDR" },
        { windowType: "stulp", position: "bottom", minWidth: 841, maxWidth: 1250, minHeight: 0, maxHeight: 99999, material: "M.500-1" },
        { windowType: "stulp", position: "bottom", minWidth: 1251, maxWidth: 1500, minHeight: 0, maxHeight: 99999, material: "M.750-1" },
        { windowType: "stulp", position: "bottom", minWidth: 1501, maxWidth: 1725, minHeight: 0, maxHeight: 99999, material: "MK.500-1 + M.500-1" }
    ];

    const allMaterials = [
        ...drehLeft,
        ...drehRight,
        ...drehTop,
        ...drehBottom,
        ...kippLeft,
        ...kippRight,
        ...kippTop,
        ...kippBottom,
        ...drehkippLeft,
        ...drehkippRight,
        ...drehkippTop,
        ...drehkippBottom,
        ...stulpLeft,
        ...stulpRight,
        ...stulpTop,
        ...stulpBottom
    ];

    for (const material of allMaterials) {
        await addMaterial(material);
    }
};

const initApp = async () => {
    db = await openDatabase();
    await initSampleData();
    updateWindowImage();
};

windowTypeRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
        currentWindowType = event.target.value;
        updateWindowImage();
        materialTop.textContent = "—";
        materialBottom.textContent = "—";
        materialLeft.textContent = "—";
        materialRight.textContent = "—";
    });
});

dimensionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    if (!width || !height) {
        return;
    }

    const material = await findMaterial(currentWindowType, width, height);
    updateMaterialDisplay(material);
});

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
        await navigator.serviceWorker.register("sw.js");
    } catch (error) {
        console.error(error);
    }
};

updateOfflineState();
registerServiceWorker();
initApp();
