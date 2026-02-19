const DB_NAME = "window-door-db";
const STORE_NAME = "materials";
const DB_VERSION = 2;

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
                store.createIndex("direction", "direction", { unique: false });
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
    
    // Finde horizontales Material (oben/unten) basierend auf FFB (Breite)
    const horizontal = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.direction === "horizontal" &&
            width >= m.minWidth &&
            width <= m.maxWidth
    );
    
    // Finde vertikales Material (links/rechts) basierend auf FFH (Höhe)
    const vertical = materials.find(
        (m) =>
            m.windowType === windowType &&
            m.direction === "vertical" &&
            height >= m.minHeight &&
            height <= m.maxHeight
    );
    
    if (!horizontal || !vertical) return null;
    
    return {
        top: horizontal.material,
        bottom: horizontal.material,
        left: vertical.material,
        right: vertical.material
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

    // Dreh-Fenster Daten - Vertikale Profile (Links/Rechts) basierend auf FFH
    const drehVertical = [
        { windowType: "dreh", direction: "vertical", minHeight: 231, maxHeight: 325, material: "GAK.465" },
        { windowType: "dreh", direction: "vertical", minHeight: 326, maxHeight: 510, material: "GAM.800" },
        { windowType: "dreh", direction: "vertical", minHeight: 511, maxHeight: 710, material: "GAM.800" },
        { windowType: "dreh", direction: "vertical", minHeight: 711, maxHeight: 980, material: "GAM.1050-1" },
        { windowType: "dreh", direction: "vertical", minHeight: 981, maxHeight: 1400, material: "GAM.1400-1" },
        { windowType: "dreh", direction: "vertical", minHeight: 1401, maxHeight: 1800, material: "GAM.1800-2" },
        { windowType: "dreh", direction: "vertical", minHeight: 1801, maxHeight: 2300, material: "GAM.2300-3" },
        { windowType: "dreh", direction: "vertical", minHeight: 2301, maxHeight: 2725, material: "GAM.2300-3 + MK.250-1 + MK.250-1" }
    ];

    // Dreh-Fenster Daten - Horizontale Profile (Oben/Unten) basierend auf FFB - Teil 1
    const drehHorizontal1 = [
        { windowType: "dreh", direction: "horizontal", minWidth: 0, maxWidth: 860, material: "AWDR" },
        { windowType: "dreh", direction: "horizontal", minWidth: 861, maxWidth: 1285, material: "M.500-1" },
        { windowType: "dreh", direction: "horizontal", minWidth: 1286, maxWidth: 1535, material: "M.750-1" },
        { windowType: "dreh", direction: "horizontal", minWidth: 1536, maxWidth: 1785, material: "MK.500-1 + M.500-1" },
        { windowType: "dreh", direction: "horizontal", minWidth: 1786, maxWidth: 2035, material: "MK.750-1 + M.500-1" },
        { windowType: "dreh", direction: "horizontal", minWidth: 2036, maxWidth: 2285, material: "MK.750-1 + M.750-1" },
        { windowType: "dreh", direction: "horizontal", minWidth: 2286, maxWidth: 2535, material: "MK.750-1 + MK.500-1 + M.500-1" },
        { windowType: "dreh", direction: "horizontal", minWidth: 2536, maxWidth: 2725, material: "MK.750-1 + MK.750-1 + M.500-1" }
    ];

    // Dreh-Fenster Daten - Vertikale Profile Teil 2 (OS-Profile) basierend auf FFH
    const drehVertical2 = [
        { windowType: "dreh", direction: "vertical", minHeight: 271, maxHeight: 370, material: "OS1.600" },
        { windowType: "dreh", direction: "vertical", minHeight: 371, maxHeight: 600, material: "OS1.600" },
        { windowType: "dreh", direction: "vertical", minHeight: 601, maxHeight: 800, material: "OS2.800" },
        { windowType: "dreh", direction: "vertical", minHeight: 801, maxHeight: 1025, material: "OS2.1025-1" },
        { windowType: "dreh", direction: "vertical", minHeight: 1026, maxHeight: 1250, material: "OS2.1250-1" },
        { windowType: "dreh", direction: "vertical", minHeight: 1251, maxHeight: 1475, material: "OS2.1475-1" },
        { windowType: "dreh", direction: "vertical", minHeight: 1476, maxHeight: 1725, material: "OS2.1475-1 + ZSR" }
    ];

    // Dreh-Fenster Daten - Horizontale Profile Teil 2 basierend auf FFB
    const drehHorizontal2 = [
        { windowType: "dreh", direction: "horizontal", minWidth: 0, maxWidth: 840, material: "AWDR" },
        { windowType: "dreh", direction: "horizontal", minWidth: 841, maxWidth: 1250, material: "M.500-1" },
        { windowType: "dreh", direction: "horizontal", minWidth: 1251, maxWidth: 1500, material: "M.750-1" },
        { windowType: "dreh", direction: "horizontal", minWidth: 1501, maxWidth: 1725, material: "MK.500-1 + M.500-1" }
    ];

    // Beispieldaten für andere Fenstertypen (Kipp, DrehKipp, Stulp)
    const otherTypes = [
        {
            windowType: "kipp",
            direction: "vertical",
            minHeight: 800,
            maxHeight: 1400,
            material: "Seitenprofil Kipp"
        },
        {
            windowType: "kipp",
            direction: "horizontal",
            minWidth: 600,
            maxWidth: 1200,
            material: "Profil Kipp 60x80"
        },
        {
            windowType: "drehkipp",
            direction: "vertical",
            minHeight: 1400,
            maxHeight: 2000,
            material: "Seitenprofil DK"
        },
        {
            windowType: "drehkipp",
            direction: "horizontal",
            minWidth: 900,
            maxWidth: 1600,
            material: "Profil DK 90x140"
        },
        {
            windowType: "stulp",
            direction: "vertical",
            minHeight: 1500,
            maxHeight: 2200,
            material: "Seitenprofil Stulp"
        },
        {
            windowType: "stulp",
            direction: "horizontal",
            minWidth: 1200,
            maxWidth: 2000,
            material: "Profil Stulp 120x150"
        }
    ];

    const allMaterials = [
        ...drehVertical,
        ...drehHorizontal1,
        ...otherTypes
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
