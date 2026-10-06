<?php
// Newsletter IA-PER : enregistre l'adresse email dans la table "newsletter".
// Réponse attendue par assets/vendor/php-email-form/validate.js :
// "OK" en cas de succès, sinon le texte de l'erreur (affiché sous le formulaire).

// 1. Connexion à la base de données
$serveur = "localhost";
$base    = "iaper";
$user    = "root";
$mdp     = "";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die("Méthode non autorisée.");
}

// 2. Récupération et vérification de l'email
$email = trim($_POST['email'] ?? '');

if ($email === '') {
    die("Merci d'indiquer votre adresse email.");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255) {
    die("L'adresse email n'est pas valide.");
}

// 3. Insertion dans la table (requête préparée)
try {
    $pdo = new PDO("mysql:host=$serveur;dbname=$base;charset=utf8mb4", $user, $mdp);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $requete = $pdo->prepare("INSERT INTO newsletter (email) VALUES (:email)");
    $requete->execute([':email' => mb_strtolower($email)]);
} catch (PDOException $e) {
    // 23000 : l'adresse est déjà dans la table (clé unique)
    if ($e->getCode() === '23000') {
        die("Cette adresse est déjà inscrite à la newsletter.");
    }
    die("Votre inscription n'a pas pu être enregistrée. Veuillez réessayer plus tard.");
}

echo "OK";
