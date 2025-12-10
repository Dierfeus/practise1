openDB().then((db) => {
    const username = localStorage.getItem("currentUser");
    if (username !== "Admin") {
        alert("Доступ запрещён");
        window.open("login.html", "_self");
        return;
    }

    const store = db.transaction(["requests"], "readwrite").objectStore("requests");

    const req = store.getAll();

    req.onsuccess = () => {
        const allList = document.getElementById("requestList");
        allList.innerHTML = "";

        req.result.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("request-card");

            card.innerHTML = `
                <h3>${item.lastname} ${item.firstname} ${item.middlename}</h3>
                <p><strong>Курс:</strong> ${item.course}</p>
                <p><strong>Дата начала:</strong> ${item.date}</p>
                <p><strong>Оплата:</strong> ${item.pay}</p>
                <p><strong>Статус:</strong> <span class="status">${item.status || 'Новая'}</span></p>
                <button class="status-btn" data-status="Идет обучение">Идет обучение</button>
                <button class="status-btn" data-status="Обучение завершено">Обучение завершено</button>
            `;

            // Смена статуса
            card.querySelectorAll(".status-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const newStatus = btn.dataset.status; // берем статус с кнопки
                    item.status = newStatus; // обновляем объект

                    // Сохраняем объект обратно в IndexedDB
                    const updateTx = db.transaction(["requests"], "readwrite");
                    const updateStore = updateTx.objectStore("requests");
                    updateStore.put(item);

                    // Обновляем текст на странице
                    card.querySelector(".status").textContent = newStatus;
                });
            });

            allList.appendChild(card);
        });
    };

    req.onerror = () => console.log("Ошибка при получении заявок");
}).catch(err => console.log("Ошибка при открытии базы:", err));
