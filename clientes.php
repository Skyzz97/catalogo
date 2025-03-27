<?php
header('Content-Type: application/json'); // Define o tipo de resposta como JSON

$acao = $_GET['acao'] ?? ''; // Ação a ser executada (ler, salvar, excluir)
$dados = json_decode(file_get_contents('php://input'), true); // Recebe os dados enviados

$arquivo = 'clientes.txt'; // Arquivo onde os clientes são armazenados

// Verifica se o arquivo existe, se não, cria um array vazio
if (!file_exists($arquivo)) {
    file_put_contents($arquivo, json_encode([]));
}

switch ($acao) {
    case 'ler':
        // Retorna a lista de clientes
        echo file_get_contents($arquivo);
        break;

    case 'salvar':
        // Salva ou atualiza um cliente
        if (isset($dados['cliente'])) {
            $clientes = json_decode(file_get_contents($arquivo), true);
            
            if ($clientes === null) {
                $clientes = [];
            }
            
            if (isset($dados['id']) && $dados['id'] !== null) {
                // Atualização de cliente existente
                $clientes[$dados['id']] = $dados['cliente'];
            } else {
                // Novo cliente
                $clientes[] = $dados['cliente'];
            }
            
            file_put_contents($arquivo, json_encode($clientes));
            echo json_encode(['status' => 'sucesso']);
        } else {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Dados inválidos']);
        }
        break;

    case 'excluir':
        // Exclui um cliente
        if (isset($dados['id'])) {
            $clientes = json_decode(file_get_contents($arquivo), true);
            
            if ($clientes === null) {
                echo json_encode(['status' => 'erro', 'mensagem' => 'Arquivo de clientes corrompido']);
                break;
            }
            
            if (isset($clientes[$dados['id']])) {
                unset($clientes[$dados['id']]);
                file_put_contents($arquivo, json_encode(array_values($clientes)));
                echo json_encode(['status' => 'sucesso']);
            } else {
                echo json_encode(['status' => 'erro', 'mensagem' => 'Cliente não encontrado']);
            }
        } else {
            echo json_encode(['status' => 'erro', 'mensagem' => 'ID não informado']);
        }
        break;

    default:
        echo json_encode(['status' => 'erro', 'mensagem' => 'Ação inválida']);
        break;
}
?>
