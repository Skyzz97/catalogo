<?php
header('Content-Type: application/json');

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
$produtoId = 1;

foreach ($lines as $line) {
    $line = trim($line);
    
    // Pula linhas vazias
    if (empty($line)) {
        if (!empty($currentProduto)) {
            $produtos[] = $currentProduto;
            $currentProduto = [];
            $produtoId++;
        }
        continue;
    }
    
    if (strpos($line, 'Cultura:') === 0) {
        // Define a cultura atual
        $currentCultura = trim(str_replace('Cultura:', '', $line));
    } elseif (strpos($line, 'Variedade:') === 0) {
        // Adiciona a variedade como um produto
        if (!empty($currentProduto)) {
            $produtos[] = $currentProduto;
            $produtoId++;
        }
        
        $currentProduto = [
            'id' => $produtoId,
            'nome' => trim(str_replace('Variedade:', '', $line)),
            'categoria' => 'sementes',
            'cultura' => $currentCultura,
            'descricao' => '',
            'resistencias' => '',
            'periodo' => '',
            'empresa' => '',
            'imagemPrincipal' => '',
            'outrasImagens' => []
        ];
    } elseif (strpos($line, 'Características:') === 0) {
        // Adiciona a descrição ao último produto
        $currentProduto['descricao'] = trim(str_replace('Características:', '', $line));
    } elseif (strpos($line, 'Resistências:') === 0) {
        // Adiciona as resistências ao último produto
        $currentProduto['resistencias'] = trim(str_replace('Resistências:', '', $line));
    } elseif (strpos($line, 'Período de Plantio:') === 0) {
        // Adiciona o período de plantio ao último produto
        $currentProduto['periodo'] = trim(str_replace('Período de Plantio:', '', $line));
    } elseif (strpos($line, 'Empresa:') === 0) {
        // Adiciona a empresa ao último produto
        $currentProduto['empresa'] = trim(str_replace('Empresa:', '', $line));
    } elseif (strpos($line, 'Imagem Principal:') === 0) {
        // Adiciona a imagem principal ao último produto
        $currentProduto['imagemPrincipal'] = trim(str_replace('Imagem Principal:', '', $line));
    } elseif (strpos($line, 'Outras Imagens:') === 0) {
        // Adiciona outras imagens ao último produto
        $imagens = trim(str_replace('Outras Imagens:', '', $line));
        $currentProduto['outrasImagens'] = array_map('trim', explode(',', $imagens));
    }
}

// Adiciona o último produto se existir
if (!empty($currentProduto)) {
    $produtos[] = $currentProduto;
}

// Retorna os produtos em formato JSON
echo json_encode($produtos);
?>
