<?php
$data = json_decode(file_get_contents("php://input"), true);
$familia = $data['familia'] ?? null;

if (!$familia) {
    echo json_encode(["ok" => false]);
    exit;
}

$file = "invitados.json";
$invitados = json_decode(file_get_contents($file), true);

foreach ($invitados as &$inv) {
    if ($inv['Familia'] === $familia) {
        $inv['Acepto'] = true;
        break;
    }
}

file_put_contents($file, json_encode($invitados, JSON_PRETTY_PRINT));

echo json_encode(["ok" => true]);
