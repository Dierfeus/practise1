openDB().then((db) => {
    const form = document.getElementById("registrationForm");

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

        let isValid = true;

        const lastname = document.getElementById("form-fio-last-name");
        const firstname = document.getElementById("form-fio-first-name");
        const middlename = document.getElementById("form-fio-middle-name");
        const phone = event.target.phone;
        const email = event.target.email;
        const username = event.target.username;
        const password = event.target.password;

        const fioRegex = /^[А-Яа-яЁё\s-]+$/;
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

        const loginRegex = /^[A-Za-z0-9]{6,}$/;
        if (!loginRegex.test(username.value.trim())) {
            showError(username, "Логин должен быть минимум 6 символов, латиница + цифры");
            isValid = false;
        }

        if (password.value.length < 8) {
            showError(password, "Пароль должен быть минимум 8 символов");
            isValid = false;
        }

        const phoneRegex = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
        if (!phoneRegex.test(phone.value.trim())) {
            showError(phone, "Телефон должен быть в формате +7(XXX)XXX-XX-XX");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            showError(email, "Введите корректный email");
            isValid = false;
        }

        if (!isValid) return; // если есть ошибки — выходим

        // ==== Добавление в IndexedDB ====
        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");

        const newUser = {
            firstname: firstname.value.trim(),
            lastname: lastname.value.trim(),
            middlename: middlename.value.trim(),
            phone: phone.value.trim(),
            email: email.value.trim(),
            username: username.value.trim(),
            password: password.value.trim()
        };

        const addReq = store.add(newUser);

        addReq.onsuccess = () => {
            alert("Регистрация успешно выполнена!");
            window.open("index.html", "_self");
        };

        addReq.onerror = (e) => {
            console.log(e);
            showError(username, "Логин, телефон или email уже заняты");
        };
    });

    function showError(input, message) {
        input.style.borderColor = "red";
        const errorSpan = input.nextElementSibling;
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = "block";
        }
    }

}).catch(err => console.log(err));
