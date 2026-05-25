<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Disable error display to prevent outputting warnings in JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Database configuration
// MODIFIEZ ces variables selon la configuration de votre serveur
$host = "localhost";
$db_name = "cetec_db";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Impossible de se connecter à la base de données : " . $exception->getMessage()));
    exit();
}

// Check if request is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get parameters from POST request
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    // Fallback: If raw JSON POST is used instead
    if (empty($name) && empty($email)) {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $name = isset($data['name']) ? trim($data['name']) : '';
            $email = isset($data['email']) ? trim($data['email']) : '';
            $subject = isset($data['subject']) ? trim($data['subject']) : '';
            $message = isset($data['message']) ? trim($data['message']) : '';
        }
    }

    // Server-side validation
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Veuillez remplir tous les champs obligatoires."));
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Adresse email invalide."));
        exit();
    }

    try {
        $query = "INSERT INTO contact_messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)";
        $stmt = $conn->prepare($query);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":subject", $subject);
        $stmt->bindParam(":message", $message);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("status" => "success", "message" => "Votre message a été enregistré avec succès !"));
        } else {
            http_response_code(500);
            echo json_encode(array("status" => "error", "message" => "Impossible d'enregistrer le message dans la base de données."));
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Erreur SQL : " . $e->getMessage()));
    }
} else {
    http_response_code(405);
    echo json_encode(array("status" => "error", "message" => "Méthode HTTP non autorisée."));
}
?>
