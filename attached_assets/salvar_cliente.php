<?php
// Verifica se a requisição é do tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recebe os dados do cliente enviados via POST
    $input = file_get_contents('php://input');
    $cliente = json_decode($input, true);

    if ($cliente === null) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Dados inválidos']);
        exit;
    }

    // Carrega os clientes existentes do arquivo
    $clientes = [];
    if (file_exists('clientes.txt')) {
        $dados = file_get_contents('clientes.txt');
        $clientes = json_decode($dados, true) ?? [];
    }

    // Adiciona o novo cliente ao array
    $clientes[] = $cliente;

    // Salva o array atualizado no arquivo
    file_put_contents('clientes.txt', json_encode($clientes));

    // Retorna uma resposta de sucesso
    echo json_encode(['status' => 'sucesso']);
} else {
    // Retorna uma resposta de erro se a requisição não for POST
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
}
?>