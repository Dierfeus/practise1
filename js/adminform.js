document.addEventListener("DOMContentLoaded", () => {
    openDB().then((db) => {
        const username = localStorage.getItem("currentUser");
        if (username !== "Admin") {
            alert("Доступ запрещён!");
            return;
        }

        // --- Отображение заявок ---
        function displayRequests(db) {
            const store = db.transaction(["requests"], "readonly").objectStore("requests");
            const req = store.getAll();

            req.onsuccess = () => {
                const newList = document.getElementById("requestList");
                const inProgressList = document.getElementById("acceptedRequestList");
                const completedList = document.getElementById("rejectedRequestList");
                const reviewList = document.getElementById("reviewList");

                newList.innerHTML = "";
                inProgressList.innerHTML = "";
                completedList.innerHTML = "";
                reviewList.innerHTML = "";

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

                    // --- Смена статуса ---
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

                    // --- Удаление ---
                    card.querySelector(".delete-btn").addEventListener("click", () => {
                        const deleteTx = db.transaction(["requests"], "readwrite");
                        const deleteStore = deleteTx.objectStore("requests");
                        deleteStore.delete(item.id);
                        card.remove();
                    });

                    // --- Добавление отзывов ---
                    if (item.review && item.review.trim() !== "") {
                        const reviewCard = document.createElement("li");
                        reviewCard.classList.add("review-card");
                        reviewCard.innerHTML = `
                            <p><strong>${item.lastname} ${item.firstname}:</strong> ${item.review}</p>
                            <p><em>Курс: ${item.course}</em></p>
                        `;
                        reviewList.appendChild(reviewCard);
                    }
                });
            };
        }

        // --- Показываем все заявки при загрузке ---
        displayRequests(db);

    }).catch(err => console.log("Ошибка при открытии базы:", err));
});
