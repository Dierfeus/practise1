document.addEventListener("DOMContentLoaded", () => {
    openDB().then((db) => {
        const username = localStorage.getItem("currentUser");
        if (username !== "Admin") {
            alert("Доступ запрещён");
            window.open("index.html", "_self");
            return;
        }

        const form = document.getElementById("coursesForm");
        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();

                const requestData = {
                    username: "Admin", // админ сам создаёт заявку
                    lastname: document.getElementById("form-fio-last-name").value,
                    firstname: document.getElementById("form-fio-first-name").value,
                    middlename: document.getElementById("form-fio-middle-name").value,
                    course: document.getElementById("courses").value,
                    date: document.getElementById("date").value,
                    pay: document.getElementById("pay").value,
                    status: "Новая"
                };

                const tx = db.transaction(["requests"], "readwrite");
                const store = tx.objectStore("requests");
                const addReq = store.add(requestData);

                addReq.onsuccess = () => {
                    alert("Заявка добавлена!");
                    form.reset();
                    // Обновляем список заявок на странице
                    displayRequests(db);
                };

                addReq.onerror = (e) => {
                    console.log("Ошибка при добавлении заявки:", e.target.error);
                    alert("Ошибка при добавлении заявки");
                };
            });
        }

        // Функция для отображения всех заявок на странице
        function displayRequests(db) {
            const store = db.transaction(["requests"], "readonly").objectStore("requests");
            const req = store.getAll();

            req.onsuccess = () => {
                const newList = document.getElementById("requestList");
                const inProgressList = document.getElementById("acceptedRequestList");
                const completedList = document.getElementById("rejectedRequestList");

                newList.innerHTML = "";
                inProgressList.innerHTML = "";
                completedList.innerHTML = "";

                req.result.forEach(item => {
                    const card = document.createElement("li");
                    card.classList.add("request-card");

                    card.innerHTML = `
                        <h3>${item.lastname} ${item.firstname} ${item.middlename}</h3>
                        <p><strong>Курс:</strong> ${item.course}</p>
                        <p><strong>Дата начала:</strong> ${item.date}</p>
                        <p><strong>Оплата:</strong> ${item.pay}</p>
                        <p><strong>Статус:</strong> <span class="status">${item.status || 'Новая'}</span></p>
                        <div class="status-btn-wrp">
                            <button class="status-btn" data-status="Идет обучение">Идет обучение</button>
                            <button class="status-btn" data-status="Обучение завершено">Обучение завершено</button>
                            <button class="status-btn delete-btn">Удалить</button>
                        </div>
                    `;

                    const placeCard = (status) => {
                        if (status === "Новая") newList.appendChild(card);
                        else if (status === "Идет обучение") inProgressList.appendChild(card);
                        else if (status === "Обучение завершено") completedList.appendChild(card);
                    };

                    placeCard(item.status || "Новая");

                    // Смена статуса
                    card.querySelectorAll(".status-btn").forEach(btn => {
                        btn.addEventListener("click", () => {
                            const newStatus = btn.dataset.status;
                            if (newStatus) {
                                item.status = newStatus;
                                const updateTx = db.transaction(["requests"], "readwrite");
                                const updateStore = updateTx.objectStore("requests");
                                updateStore.put(item);
                                card.querySelector(".status").textContent = newStatus;
                                placeCard(newStatus);
                            }
                        });
                    });

                    // Удаление заявки
                    card.querySelector(".delete-btn").addEventListener("click", () => {
                        const deleteTx = db.transaction(["requests"], "readwrite");
                        const deleteStore = deleteTx.objectStore("requests");
                        deleteStore.delete(item.id);
                        card.remove();
                    });
                });
            };
        }

        // Показываем все заявки при загрузке страницы
        displayRequests(db);

    }).catch(err => console.log("Ошибка при открытии базы:", err));
});
