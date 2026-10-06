<?php
// Sondage IA-PER
// GET  sondage.php            -> renvoie les résultats en JSON
// POST sondage.php (choix=..) -> enregistre un vote puis renvoie les résultats

header('Content-Type: application/json; charset=utf-8');

// 1. Connexion à la base de données
$serveur = "localhost";
$base    = "iaper";
$user    = "root";
$mdp     = "";

$choixAutorises = ['positif', 'negatif', 'neutre'];

function repondre($code, $donnees) {
    http_response_code($code);
    echo json_encode($donnees);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$serveur;dbname=$base;charset=utf8mb4", $user, $mdp);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    repondre(500, ['error' => 'Connexion à la base impossible.']);
}

try {
    // 2. Enregistrement du vote (requête préparée)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $choix = $_POST['choix'] ?? '';
        if (!in_array($choix, $choixAutorises, true)) {
            repondre(400, ['error' => 'Choix invalide.']);
        }

        $requete = $pdo->prepare("UPDATE sondage SET total = total + 1 WHERE choix = :choix");
        $requete->execute([':choix' => $choix]);
    } elseif ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        repondre(405, ['error' => 'Méthode non autorisée.']);
    }

    // 3. Lecture des résultats
    $resultats = array_fill_keys($choixAutorises, 0);
    foreach ($pdo->query("SELECT choix, total FROM sondage") as $ligne) {
        if (isset($resultats[$ligne['choix']])) {
            $resultats[$ligne['choix']] = (int) $ligne['total'];
        }
    }

    repondre(200, $resultats);
} catch (PDOException $e) {
    repondre(500, ['error' => 'Erreur lors de l\'accès au sondage.']);
}
