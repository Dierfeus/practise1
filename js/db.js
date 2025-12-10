function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("myDatabase", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Создаём хранилище заявок
            if (!db.objectStoreNames.contains("requests")) {
                const requestStore = db.createObjectStore("requests", { keyPath: "id", autoIncrement: true });
                requestStore.createIndex("username", "username", { unique: false });
            }

            // Создаём хранилище пользователей
            if (!db.objectStoreNames.contains("users")) {
                const userStore = db.createObjectStore("users", { keyPath: "username" });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
