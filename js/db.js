// db.js
let db;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("EducationDB", 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;

            if (!db.objectStoreNames.contains("users")) {
                const usersStore = db.createObjectStore("users", { keyPath: "username" });
                usersStore.createIndex("email", "email", { unique: true });
            }

            if (!db.objectStoreNames.contains("requests")) {
                const requestStore = db.createObjectStore("requests", { keyPath: "id", autoIncrement: true });
                requestStore.createIndex("username", "username", { unique: false });
                 reqStore.createIndex("status", "status", { unique: false });
            }
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = function () {
            reject("Ошибка при открытии базы");
        };
    });
}
