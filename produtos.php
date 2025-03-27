<?php
header('Content-Type: application/json'); // Define o tipo de resposta como JSON

$acao = $_GET['acao'] ?? ''; // Ação a ser executada (ler, salvar, excluir)
$dados = json_decode(file_get_contents('php://input'), true); // Recebe os dados enviados

$arquivo = 'produtos.txt'; // Arquivo onde os produtos são armazenados

// Verifica se o arquivo existe, se não, cria um array vazio
if (!file_exists($arquivo)) {
    file_put_contents($arquivo, json_encode([]));
}

switch ($acao) {
    case 'ler':
        // Retorna a lista de produtos
        echo file_get_contents($arquivo);
        break;

    case 'salvar':
        // Salva ou atualiza um produto
        if (isset($dados['id']) && isset($dados['produto'])) {
            $produtos = json_decode(file_get_contents($arquivo), true);
            
            // Se o ID for novo, adiciona ao final do array
            if (!isset($produtos[$dados['id']])) {
                $produtos[] = $dados['produto'];
                $novoId = count($produtos) - 1;
                echo json_encode(['status' => 'sucesso', 'id' => $novoId]);
            } else {
                // Se o ID já existir, atualiza o produto
                $produtos[$dados['id']] = $dados['produto'];
                file_put_contents($arquivo, json_encode($produtos));
                echo json_encode(['status' => 'sucesso', 'id' => $dados['id']]);
            }
        } else {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Dados inválidos']);
        }
        break;

    case 'excluir':
        // Exclui um produto
        if (isset($dados['id'])) {
            $produtos = json_decode(file_get_contents($arquivo), true);
            if (isset($produtos[$dados['id']])) {
                unset($produtos[$dados['id']]);
                file_put_contents($arquivo, json_encode(array_values($produtos)));
                echo json_encode(['status' => 'sucesso']);
            } else {
                echo json_encode(['status' => 'erro', 'mensagem' => 'Produto não encontrado']);
            }
        } else {
            echo json_encode(['status' => 'erro', 'mensagem' => 'ID não informado']);
        }
        break;

    case 'importar_culturas':
        // Importa produtos do arquivo culturas.txt
        if (file_exists('culturas.txt')) {
            $conteudoCulturas = file_get_contents('culturas.txt');
            $linhas = explode("\n", $conteudoCulturas);
            
            $produtos = [];
            $culturaAtual = '';
            $produtoAtual = null;
            
            foreach ($linhas as $linha) {
                $linha = trim($linha);
                
                if (empty($linha)) {
                    // Linha vazia indica o fim de um produto
                    if ($produtoAtual !== null) {
                        $produtos[] = $produtoAtual;
                        $produtoAtual = null;
                    }
                    continue;
                }
                
                if (strpos($linha, 'Cultura:') === 0) {
                    $culturaAtual = trim(substr($linha, 8));
                } else if (strpos($linha, 'Variedade:') === 0) {
                    // Novo produto
                    if ($produtoAtual !== null) {
                        $produtos[] = $produtoAtual;
                    }
                    
                    $produtoAtual = [
                        'nome' => trim(substr($linha, 11)),
                        'categoria' => 'sementes',
                        'cultura' => $culturaAtual,
                        'descricao' => '',
                        'resistencias' => '',
                        'imagemPrincipal' => '',
                        'outrasImagens' => []
                    ];
                } else if ($produtoAtual !== null) {
                    // Adiciona informações ao produto atual
                    if (strpos($linha, 'Características:') === 0) {
                        $produtoAtual['descricao'] = trim(substr($linha, 17));
                    } else if (strpos($linha, 'Resistências:') === 0) {
                        $produtoAtual['resistencias'] = trim(substr($linha, 13));
                    } else if (strpos($linha, 'Período de Plantio:') === 0) {
                        $produtoAtual['periodoPlantio'] = trim(substr($linha, 19));
                    } else if (strpos($linha, 'Empresa:') === 0) {
                        $produtoAtual['empresa'] = trim(substr($linha, 8));
                    } else if (strpos($linha, 'Imagem Principal:') === 0) {
                        $produtoAtual['imagemPrincipal'] = trim(substr($linha, 17));
                    } else if (strpos($linha, 'Outras Imagens:') === 0) {
                        $imagens = trim(substr($linha, 15));
                        $produtoAtual['outrasImagens'] = explode(', ', $imagens);
                    }
                }
            }
            
            // Adiciona o último produto se existir
            if ($produtoAtual !== null) {
                $produtos[] = $produtoAtual;
            }
            
            // Salva os produtos no arquivo
            file_put_contents($arquivo, json_encode($produtos));
            echo json_encode(['status' => 'sucesso', 'produtos' => count($produtos)]);
        } else {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Arquivo culturas.txt não encontrado']);
        }
        break;

    default:
        echo json_encode(['status' => 'erro', 'mensagem' => 'Ação inválida']);
        break;
}
?>
