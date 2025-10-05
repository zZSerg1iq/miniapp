<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_FILES['file'] ?? null) {
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $fileName = uniqid() . '_' . basename($_FILES['file']['name']);
    $filePath = $uploadDir . $fileName;
    
    if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
        $fileUrl = 'https://yourdomain.com/' . $filePath;
        echo json_encode([
            'success' => true,
            'url' => $fileUrl,
            'name' => $_FILES['file']['name'],
            'type' => $_FILES['file']['type'],
            'size' => $_FILES['file']['size']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to upload file']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No file provided']);
}
?>
