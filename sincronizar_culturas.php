<?php
header('Content-Type: application/json');

// No ambiente de desenvolvimento, usamos o arquivo local em attached_assets
// No ambiente real, isso seria substituído pelo URL do servidor real
$arquivo_referencia = 'attached_assets/culturas.txt';
$arquivo_local = 'culturas.txt';

// Em ambiente de desenvolvimento, sempre retornamos sucesso
$resposta = array('status' => 'atual', 'mensagem' => 'Usando dados locais (ambiente de desenvolvimento).');

// Função para verificar conexão com internet testando múltiplos servidores
function verificar_conexao() {
    // Em ambiente de teste, consideramos sempre online
    if ($_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_ADDR'] == '127.0.0.1' || $_SERVER['SERVER_ADDR'] == '0.0.0.0') {
        return true;
    }
    
    // Em ambiente de produção, verificamos múltiplos servidores
    $hosts = array("www.google.com", "www.cloudflare.com", "www.amazon.com");
    foreach ($hosts as $host) {
        $conectado = @fsockopen($host, 80, $errno, $errstr, 2); 
        if ($conectado) {
            fclose($conectado);
            return true;
        }
    }
    return false;
}

// No ambiente de desenvolvimento, verificamos se o arquivo local existe
// Se não existir, criamos uma cópia do arquivo de referência
if (!file_exists($arquivo_local) && file_exists($arquivo_referencia)) {
    // Copia o arquivo de referência para o local se não existir
    copy($arquivo_referencia, $arquivo_local);
    $resposta['status'] = 'atualizado';
    $resposta['mensagem'] = 'Arquivo local criado com sucesso.';
} 

// Em produção, verificaríamos a conexão com a internet
// e sincronizaríamos com o servidor remoto
// Mas no ambiente de desenvolvimento, isso não é necessário

echo json_encode($resposta);
?>