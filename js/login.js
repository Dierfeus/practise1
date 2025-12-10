openDB().then((db) => {
    const form = document.getElementById("loginForm");

    // Добавляем span для ошибок под каждым input
    form.querySelectorAll("input").forEach(input => {
        const errorSpan = document.createElement("span");
        errorSpan.classList.add("input-error");
        errorSpan.style.color = "red";
        errorSpan.style.fontSize = "12px";
        errorSpan.style.display = "none"; // скрыт по умолчанию
        input.insertAdjacentElement("afterend", errorSpan);

        // Очистка ошибки при вводе
        input.addEventListener("input", () => {
            input.style.borderColor = "";
            errorSpan.style.display = "none";
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const usernameInput = event.target.login;
        const passwordInput = event.target.password;

        let isValid = true;

        // Очищаем предыдущие ошибки
        clearError(usernameInput);
        clearError(passwordInput);

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Проверка на пустые поля
        if (!username) {
            showError(usernameInput, "Введите логин");
            isValid = false;
        }
        if (!password) {
            showError(passwordInput, "Введите пароль");
            isValid = false;
        }

        if (!isValid) return;

        // Если это админ, сразу открываем админку
        if (username === "Admin" && password === "KorokNET") {
            localStorage.setItem("currentUser", "Admin"); 
            window.open("adminform.html", "_self");
            return;
        }

        const tx = db.transaction(["users"], "readonly");
        const store = tx.objectStore("users");

        const req = store.get(username);

        req.onsuccess = () => {
            const user = req.result;

            if (!user) {
                showError(usernameInput, "Пользователь не найден");
                return;
            }

            if (user.password !== password) {
                showError(passwordInput, "Неверный пароль");
                return;
            }

            // Сохраняем текущего пользователя в localStorage
            localStorage.setItem("currentUser", username);

            // Обычный пользователь → форма заявки
            window.open("form.html", "_self");
        };

        req.onerror = () => {
            showErrorMessage("Ошибка при проверке пользователя");
        };
    });

    // --- Вспомогательные функции ---
    function showError(input, message) {
        input.style.borderColor = "red";
        const errorSpan = input.nextElementSibling;
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = "block";
        }
    }

    function clearError(input) {
        input.style.borderColor = "";
        const errorSpan = input.nextElementSibling;
        if (errorSpan) errorSpan.style.display = "none";
    }

    function showErrorMessage(message) {
        // вывод ошибки в контейнер формы
        let container = form.querySelector(".form-error");
        if (!container) {
            container = document.createElement("div");
            container.classList.add("form-error");
            container.style.color = "red";
            container.style.marginBottom = "10px";
            form.prepend(container);
        }
        container.textContent = message;
    }

}).catch(err => console.log("Ошибка при открытии базы:", err));
