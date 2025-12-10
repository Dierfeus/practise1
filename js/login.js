openDB().then((db) => {
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = event.target.login.value;
        const password = event.target.password.value;

        // Если это админ, сразу открываем админку
        if (username === "Admin" && password === "KorokNET") {
            localStorage.setItem("currentUser", "Admin"); // сохраняем, чтобы при необходимости можно было отслеживать
            window.open("adminform.html", "_self");
            return;
        }

        const tx = db.transaction(["users"], "readonly");
        const store = tx.objectStore("users");

        const req = store.get(username);

        req.onsuccess = () => {
            const user = req.result;

            if (!user) {
                alert("Пользователь не найден");
                return;
            }

            if (user.password !== password) {
                alert("Неверный пароль");
                return;
            }

            // Сохраняем текущего пользователя в localStorage
            localStorage.setItem("currentUser", username);

            // Обычный пользователь → форма заявки
            window.open("form.html", "_self");
        };

        req.onerror = () => {
            alert("Ошибка при проверке пользователя");
        };
    });
}).catch(err => console.log("Ошибка при открытии базы:", err));
