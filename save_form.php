<?php

$db = new SQLite3('database.db');

$data = json_decode(file_get_contents("php://input"), true);

$surname    = $data["surname"];
$name       = $data["name"];
$patronymic = $data["patronymic"];
$course     = $data["course"];
$date       = $data["date"];
$pay        = $data["pay"];

$stmt = $db->prepare("
    INSERT INTO applications (surname, name, patronymic, course, start_date, pay_method)
    VALUES (:surname, :name, :patronymic, :course, :start_date, :pay_method)
");

$stmt->bindValue(':surname', $surname, SQLITE3_TEXT);
$stmt->bindValue(':name', $name, SQLITE3_TEXT);
$stmt->bindValue(':patronymic', $patronymic, SQLITE3_TEXT);
$stmt->bindValue(':course', $course, SQLITE3_TEXT);
$stmt->bindValue(':start_date', $date, SQLITE3_TEXT);
$stmt->bindValue(':pay_method', $pay, SQLITE3_TEXT);

$stmt->execute();

echo "OK";
?>
