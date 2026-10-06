<?php
// Formulaire de contact IA-PER : enregistre le message dans la table "messages".
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

// 2. Récupération des données du formulaire
$nom     = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$objet   = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

// 3. Vérifications
if ($nom === '' || $email === '' || $objet === '' || $message === '') {
    die("Merci de remplir tous les champs.");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("L'adresse email n'est pas valide.");
}
if (mb_strlen($nom) > 100 || mb_strlen($email) > 255 || mb_strlen($objet) > 200 || mb_strlen($message) > 5000) {
    die("Un des champs est trop long.");
}

// 4. Insertion dans la table (requête préparée)
try {
    $pdo = new PDO("mysql:host=$serveur;dbname=$base;charset=utf8mb4", $user, $mdp);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $requete = $pdo->prepare("INSERT INTO messages (nom, email, objet, message) VALUES (:nom, :email, :objet, :message)");
    $requete->execute([
        ':nom'     => $nom,
        ':email'   => $email,
        ':objet'   => $objet,
        ':message' => $message
    ]);
} catch (PDOException $e) {
    die("Votre message n'a pas pu être enregistré. Veuillez réessayer plus tard.");
}

echo "OK";
