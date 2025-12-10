// --- Модальное окно для отзыва ---
const modal = document.getElementById("reviewModal");
const reviewText = document.getElementById("reviewText");
const sendReviewBtn = document.getElementById("sendReviewBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

let currentItem = null;

function openReviewModal(item) {
    currentItem = item;
    reviewText.value = item.review || "";
    modal.classList.remove("hidden");
    clearModalError();
}

// Закрытие окна
closeModalBtn.onclick = () => {
    modal.classList.add("hidden");
    currentItem = null;
    clearModalError();
};

// Отправка отзыва
sendReviewBtn.onclick = () => {
    if (!currentItem) return;

    const text = reviewText.value.trim();

    if (text.length < 3) {
        showModalError("Отзыв слишком короткий!");
        return;
    }

    openDB().then(db => {
        const tx = db.transaction(["requests"], "readwrite");
        const store = tx.objectStore("requests");

        currentItem.review = text;

        store.put(currentItem);

        tx.oncomplete = () => {
            showModalSuccess("Отзыв отправлен!");
            modal.classList.add("hidden");

            // Обновляем отзыв прямо на карточке
            const cards = document.querySelectorAll(".request-card");
            cards.forEach(card => {
                const h3 = card.querySelector("h3");
                if (h3.textContent.includes(currentItem.lastname) && h3.textContent.includes(currentItem.firstname) && card.querySelector("p strong").textContent.includes(currentItem.course)) {
                    let reviewDiv = card.querySelector(".existing-review");
                    if (!reviewDiv) {
                        reviewDiv = document.createElement("div");
                        reviewDiv.classList.add("existing-review");
                        card.appendChild(reviewDiv);
                    }
                    reviewDiv.textContent = "Ваш отзыв: " + text;
                }
            });
        };
    });
};

// --- Вспомогательные функции для модального окна ---
function showModalError(message) {
    let errorSpan = modal.querySelector(".modal-error");
    if (!errorSpan) {
        errorSpan = document.createElement("div");
        errorSpan.classList.add("modal-error");
        errorSpan.style.color = "red";
        errorSpan.style.marginBottom = "10px";
        modal.querySelector(".modal-content").prepend(errorSpan);
    }
    errorSpan.textContent = message;
}

function clearModalError() {
    const errorSpan = modal.querySelector(".modal-error");
    if (errorSpan) errorSpan.remove();
}

function showModalSuccess(message) {
    let successSpan = modal.querySelector(".modal-success");
    if (!successSpan) {
        successSpan = document.createElement("div");
        successSpan.classList.add("modal-success");
        successSpan.style.color = "green";
        successSpan.style.marginBottom = "10px";
        modal.querySelector(".modal-content").prepend(successSpan);
    }
    successSpan.textContent = message;
}

// --- Общие ошибки страницы ---
function showErrorMessage(message) {
    const container = document.getElementById("requestList");
    container.innerHTML = `<p style="color:red;">${message}</p>`;
}

// --- Загрузка заявок ---
openDB().then((db) => {
    const username = localStorage.getItem("currentUser");

    if (!username) {
        showErrorMessage("Вы не авторизованы! Пожалуйста, войдите.");
        return;
    }

    const tx = db.transaction(["requests"], "readonly");
    const store = tx.objectStore("requests");

    const req = store.getAll(); // получаем все заявки

    req.onsuccess = () => {
        const container = document.getElementById("requestList");
        container.innerHTML = "";

        const results = req.result.filter(item => item.username === username);

        if (results.length === 0) {
            container.innerHTML = "<p>Заявок нет</p>";
            return;
        }

        const uniqueCourses = {};
        results.forEach(item => {
            if (!uniqueCourses[item.course]) {
                uniqueCourses[item.course] = item;
            }
        });

        Object.values(uniqueCourses).forEach(item => {
            const card = document.createElement("div");
            card.classList.add("request-card");

            card.innerHTML = `
                <h3>${item.lastname} ${item.firstname} ${item.middlename}</h3>
                <p><strong>Курс:</strong> ${item.course}</p>
                <p><strong>Дата начала:</strong> ${item.date}</p>
                <p><strong>Оплата:</strong> ${item.pay}</p>
                <p><strong>Статус:</strong> <span class="status">${item.status || 'Новая'}</span></p>
                 <p class="review-text"><strong>Отзыв:</strong> ${item.review ? item.review : "Нет"} </p>
            `;

            if (item.status && item.status.toLowerCase() === "обучение завершено") {
                const reviewBtn = document.createElement("button");
                reviewBtn.classList.add("review-btn");
                reviewBtn.textContent = "Оставить отзыв";
                reviewBtn.onclick = () => openReviewModal(item);
                card.appendChild(reviewBtn);

                if (item.review) {
                    const reviewDiv = document.createElement("div");
                    reviewDiv.classList.add("existing-review");
                    reviewDiv.textContent = "Ваш отзыв: " + item.review;
                    card.appendChild(reviewDiv);
                }
            }

            container.appendChild(card);
        });
    };

    req.onerror = () => showErrorMessage("Ошибка при получении заявок пользователя");

}).catch(err => showErrorMessage("Ошибка при открытии базы: " + err));
