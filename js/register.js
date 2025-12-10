openDB().then((db) => {
    document.getElementById("registrationForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const lastname = document.getElementById("form-fio-last-name").value;
        const firstname = document.getElementById("form-fio-first-name").value;
        const middlename = document.getElementById("form-fio-middle-name").value;
        const phone = event.target.phone.value;
        const email = event.target.email.value;
        const username = event.target.username.value;
        const password = event.target.password.value;

        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");

        const newUser = { firstname, lastname, middlename, phone, email, username, password };

        const addReq = store.add(newUser);

        addReq.onsuccess = () => {
            alert("Регистрация успешно выполнена!");
            window.open("login.html", "_self");
        };

        addReq.onerror = (e) => {
            console.log(e);
            alert("Ошибка: логин, никнейм, телефон или email уже заняты");
        };
    });
}).catch(err => console.log(err));
