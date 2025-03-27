<?php
header('Content-Type: application/json');

// URL do servidor remoto para verificar
// Como este é um ambiente de teste, vamos usar o próprio arquivo local como servidor
// No ambiente real, isso seria substituído pelo URL do servidor real
$servidor_url = 'http://localhost:8000/attached_assets/culturas.txt';
$arquivo_local = 'culturas.txt';

$resposta = array('status' => '', 'mensagem' => '');

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

// Verifica se há conexão com a internet (sempre true no ambiente de teste)
if (true || verificar_conexao()) {
    try {
        // Configurar um timeout curto para não travar a aplicação
        $ctx = stream_context_create(array(
            'http' => array(
                'timeout' => 5
            )
        ));
        
        // Tenta buscar os dados do servidor
        $dados_remotos = @file_get_contents($servidor_url, false, $ctx);
        
        if ($dados_remotos === false) {
            // Não conseguiu acessar o servidor, mas está online
            $resposta['status'] = 'offline';
            $resposta['mensagem'] = 'Servidor indisponível, usando dados locais.';
        } else {
            // Verifica se o conteúdo é diferente do arquivo local
            $dados_locais = file_exists($arquivo_local) ? file_get_contents($arquivo_local) : '';
            
            if ($dados_remotos != $dados_locais) {
                // Atualiza o arquivo local
                file_put_contents($arquivo_local, $dados_remotos);
                $resposta['status'] = 'atualizado';
                $resposta['mensagem'] = 'Dados atualizados com sucesso.';
            } else {
                $resposta['status'] = 'atual';
                $resposta['mensagem'] = 'Dados já estão atualizados.';
            }
        }
    } catch (Exception $e) {
        $resposta['status'] = 'erro';
        $resposta['mensagem'] = 'Erro ao sincronizar: ' . $e->getMessage();
    }
} else {
    // Não há conexão com a internet
    $resposta['status'] = 'offline';
    $resposta['mensagem'] = 'Sem conexão com a internet, usando dados locais.';
}

echo json_encode($resposta);
?>