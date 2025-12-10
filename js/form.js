openDB().then((db) => {
    const username = localStorage.getItem("currentUser");
    if (!username) {
        alert("Вы не авторизованы!");
        window.open("login.html", "_self");
        return;
    }

    // Получаем пользователя и заполняем ФИО
    const tx = db.transaction(["users"], "readonly");
    const store = tx.objectStore("users");
    const req = store.get(username);

    req.onsuccess = () => {
        const user = req.result;
        if (user) {
            document.getElementById("form-fio-last-name").value = user.lastname;
            document.getElementById("form-fio-first-name").value = user.firstname;
            document.getElementById("form-fio-middle-name").value = user.middlename;
        }
    };

    req.onerror = () => console.log("Ошибка при получении пользователя");

    // Отправка формы
    document.getElementById("cleaningForm").addEventListener("submit", function (event) {
        event.preventDefault();


        const requestData = {
            username,
            lastname: document.getElementById("form-fio-last-name").value,
            firstname: document.getElementById("form-fio-first-name").value,
            middlename: document.getElementById("form-fio-middle-name").value,
            course: document.getElementById("courses").value,
            date: document.getElementById("date").value,
            pay: document.getElementById("pay").value,
            status: "Новая"
        };

        const tx2 = db.transaction(["requests"], "readwrite");
        const store2 = tx2.objectStore("requests");
        store2.add(requestData);

        tx2.oncomplete = () => alert("Заявка отправлена!");
    });

}).catch(err => console.log(err));
