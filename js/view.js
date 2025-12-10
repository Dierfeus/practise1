openDB().then((db) => {
    const username = localStorage.getItem("currentUser");

    if (!username) {
        alert("Вы не авторизованы!");
        window.open("index.html", "_self");
        return;
    }

    const tx = db.transaction(["requests"], "readonly");
    const store = tx.objectStore("requests");
    const index = store.index("username");

    const req = index.getAll(username);

    req.onsuccess = () => {
        const container = document.getElementById("requestList");
        container.innerHTML = "";

        if (req.result.length === 0) {
            container.innerHTML = "<p>Заявок нет</p>";
            return;
        }

        req.result.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("request-card");

            card.innerHTML = `
                <h3>${item.lastname} ${item.firstname} ${item.middlename}</h3>
                <p><strong>Курс:</strong> ${item.course}</p>
                <p><strong>Дата начала:</strong> ${item.date}</p>
                <p><strong>Оплата:</strong> ${item.pay}</p>
                <p><strong>Статус:</strong> <span class="status">${item.status || 'Новая'}</span></p>
            `;
            container.appendChild(card);
        });
    };

    req.onerror = () => console.log("Ошибка при получении заявок пользователя");

}).catch(err => console.log("Ошибка при открытии базы:", err));
