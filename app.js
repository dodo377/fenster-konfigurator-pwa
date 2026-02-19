const DB_NAME = "window-door-db";
const STORE_NAME = "materials";
const DB_VERSION = 1;

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
    return materials.find(
        (m) =>
            m.windowType === windowType &&
            width >= m.minWidth &&
            width <= m.maxWidth &&
            height >= m.minHeight &&
            height <= m.maxHeight
    );
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

    const sampleMaterials = [
        {
            windowType: "dreh",
            minWidth: 800,
            maxWidth: 1400,
            minHeight: 1200,
            maxHeight: 1800,
            top: "Oberprofil Dreh 80x120",
            bottom: "Unterprofil Dreh 80x120",
            left: "Seitenprofil Dreh Links",
            right: "Seitenprofil Dreh Rechts"
        },
        {
            windowType: "kipp",
            minWidth: 600,
            maxWidth: 1200,
            minHeight: 800,
            maxHeight: 1400,
            top: "Oberprofil Kipp 60x80",
            bottom: "Unterprofil Kipp 60x80",
            left: "Seitenprofil Kipp Links",
            right: "Seitenprofil Kipp Rechts"
        },
        {
            windowType: "drehkipp",
            minWidth: 900,
            maxWidth: 1600,
            minHeight: 1400,
            maxHeight: 2000,
            top: "Oberprofil DK 90x140",
            bottom: "Unterprofil DK 90x140",
            left: "Seitenprofil DK Links",
            right: "Seitenprofil DK Rechts"
        },
        {
            windowType: "stulp",
            minWidth: 1200,
            maxWidth: 2000,
            minHeight: 1500,
            maxHeight: 2200,
            top: "Oberprofil Stulp 120x150",
            bottom: "Unterprofil Stulp 120x150",
            left: "Seitenprofil Stulp Links",
            right: "Seitenprofil Stulp Rechts"
        }
    ];

    for (const material of sampleMaterials) {
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
