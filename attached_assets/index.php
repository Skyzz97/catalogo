<?php
// index.php

// Caminho para o arquivo culturas.txt
$filePath = __DIR__ . '/culturas.txt';

// Verifica se o arquivo existe
if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Arquivo culturas.txt não encontrado.']);
    exit;
}

// Lê o conteúdo do arquivo
$fileContent = file_get_contents($filePath);

// Converte o conteúdo do arquivo em um array de produtos
$produtos = [];
$lines = explode("\n", $fileContent);
$currentCultura = '';
$currentProduto = [];

foreach ($lines as $line) {
    if (strpos($line, 'Cultura:') === 0) {
        // Define a cultura atual
        $currentCultura = trim(str_replace('Cultura:', '', $line));
    } elseif (strpos($line, 'Variedade:') === 0) {
        // Adiciona a variedade como um produto
        if (!empty($currentProduto)) {
            $produtos[] = $currentProduto;
        }
        $currentProduto = [
            'id' => count($produtos) + 1, // Gera um ID único
            'nome' => trim(str_replace('Variedade:', '', $line)),
            'categoria' => 'sementes', // Defina a categoria conforme necessário
            'cultura' => $currentCultura, // Associa a cultura atual
            'descricao' => '',
            'resistências' => '', // Novo campo para resistências
            'imagemPrincipal' => '',
        ];
    } elseif (strpos($line, 'Características:') === 0) {
        // Adiciona a descrição ao último produto
        $currentProduto['descricao'] = trim(str_replace('Características:', '', $line));
    } elseif (strpos($line, 'Resistências:') === 0) {
        // Adiciona as resistências ao último produto
        $currentProduto['resistências'] = trim(str_replace('Resistências:', '', $line));
    } elseif (strpos($line, 'Imagem Principal:') === 0) {
        // Adiciona a imagem ao último produto
        $currentProduto['imagemPrincipal'] = trim(str_replace('Imagem Principal:', '', $line));
    }
}

if (!empty($currentProduto)) {
    $produtos[] = $currentProduto;
}

// Retorna os produtos em formato JSON
header('Content-Type: application/json');
echo json_encode($produtos);
?>