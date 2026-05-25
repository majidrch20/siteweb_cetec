<?php
header("Content-Type: application/json");

$host = "localhost";
$db_name = "cetec_db";
$username = "root";   // change si hébergement
$password = "";       // change si hébergement

$conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);

$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$message = $_POST['message'];

$sql = "INSERT INTO contact_messages (name, email, subject, message)
        VALUES (:name, :email, :subject, :message)";

$stmt = $conn->prepare($sql);

$stmt->execute([
    ":name" => $name,
    ":email" => $email,
    ":subject" => $subject,
    ":message" => $message
]);

echo json_encode(["status" => "success"]);
?>