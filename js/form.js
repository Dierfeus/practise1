openDB().then((db) => {
    const username = localStorage.getItem("currentUser");

    if (!username) {
        showErrorMessage("Вы не авторизованы! Пожалуйста, войдите.");
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

    req.onerror = () => showErrorMessage("Ошибка при получении пользователя");

    // --- Добавляем спаны для ошибок под input ---
    const inputs = [
        "form-fio-last-name",
        "form-fio-first-name",
        "form-fio-middle-name",
        "date",
        "courses",
        "pay"
    ];

    inputs.forEach(id => {
        const input = document.getElementById(id);
        const span = document.createElement("span");
        span.classList.add("input-error");
        span.style.color = "red";
        span.style.fontSize = "12px";
        span.style.display = "none";
        input.insertAdjacentElement("afterend", span);

        input.addEventListener("input", () => {
            input.style.borderColor = "";
            span.style.display = "none";
        });
    });

    // Отправка формы
    document.getElementById("coursesForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let isValid = true;
        const fioRegex = /^[А-Яа-яЁё\s-]+$/;

        const lastname = document.getElementById("form-fio-last-name");
        const firstname = document.getElementById("form-fio-first-name");
        const middlename = document.getElementById("form-fio-middle-name");
        const dateInput = document.getElementById("date");
        const course = document.getElementById("courses");
        const pay = document.getElementById("pay");

        // Проверка ФИО
        if (!fioRegex.test(lastname.value.trim())) {
            showError(lastname, "Фамилия должна содержать только кириллицу и пробелы");
            isValid = false;
        }
        if (!fioRegex.test(firstname.value.trim())) {
            showError(firstname, "Имя должно содержать только кириллицу и пробелы");
            isValid = false;
        }
        if (!fioRegex.test(middlename.value.trim())) {
            showError(middlename, "Отчество должно содержать только кириллицу и пробелы");
            isValid = false;
        }

        // Проверка даты — не раньше завтрашнего дня
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (isNaN(selectedDate.getTime()) || selectedDate < tomorrow) {
            showError(dateInput, "Дата должна быть не раньше завтрашнего дня");
            isValid = false;
        }

        // Проверка курса и оплаты
        if (!course.value.trim()) {
            showError(course, "Выберите курс");
            isValid = false;
        }

        if (!pay.value.trim()) {
            showError(pay, "Укажите оплату");
            isValid = false;
        }

        if (!isValid) return;

        const requestData = {
            username,
            lastname: lastname.value.trim(),
            firstname: firstname.value.trim(),
            middlename: middlename.value.trim(),
            course: course.value,
            date: dateInput.value,
            pay: pay.value,
            status: "Новая"
        };

        const tx2 = db.transaction(["requests"], "readwrite");
        const store2 = tx2.objectStore("requests");
        store2.add(requestData);

        tx2.oncomplete = () => showSuccessMessage("Заявка отправлена!");
    });

    // --- Вспомогательные функции ---
    function showError(input, message) {
        input.style.borderColor = "red";
        const span = input.nextElementSibling;
        if (span) {
            span.textContent = message;
            span.style.display = "block";
        }
    }

    function showErrorMessage(message) {
        const container = document.getElementById("coursesForm");
        let msgDiv = container.querySelector(".form-error");
        if (!msgDiv) {
            msgDiv = document.createElement("div");
            msgDiv.classList.add("form-error");
            msgDiv.style.color = "red";
            msgDiv.style.marginBottom = "10px";
            container.prepend(msgDiv);
        }
        msgDiv.textContent = message;
    }

    function showSuccessMessage(message) {
        const container = document.getElementById("coursesForm");
        let msgDiv = container.querySelector(".form-success");
        if (!msgDiv) {
            msgDiv = document.createElement("div");
            msgDiv.classList.add("form-success");
            msgDiv.style.color = "green";
            msgDiv.style.marginBottom = "10px";
            container.prepend(msgDiv);
        }
        msgDiv.textContent = message;

        // Сбрасываем форму
        document.getElementById("coursesForm").reset();
    }

}).catch(err => showErrorMessage("Ошибка базы данных: " + err));
