// Variáveis globais
let clienteAtual = null;
let map = null;

// Função para voltar para a lista de clientes
function voltarParaClientes() {
    window.location.href = 'clientes.html';
}

// Função para carregar os detalhes do cliente
async function carregarDetalhesCliente() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id === null) {
        console.error("ID do cliente não encontrado na URL.");
        voltarParaClientes();
        return;
    }

    try {
        const response = await fetch('clientes.php?acao=ler');
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            // Se for array, procura pelo id
            clienteAtual = data.find(cliente => cliente.id == id);
        } else if (data[id]) {
            // Se for objeto, acessa diretamente pelo id
            clienteAtual = { ...data[id], id };
        }
        
        if (clienteAtual) {
            exibirDetalhesCliente(clienteAtual);
        } else {
            console.error("Cliente não encontrado.");
            document.getElementById("clienteDetalhes").innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i> 
                    Cliente não encontrado. <a href="clientes.html" class="alert-link">Voltar para a lista de clientes</a>
                </div>
            `;
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes do cliente:", error);
        document.getElementById("clienteDetalhes").innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i> 
                Erro ao carregar detalhes do cliente. <a href="clientes.html" class="alert-link">Voltar para a lista</a>
            </div>
        `;
    }
}

// Função para exibir os detalhes do cliente
function exibirDetalhesCliente(cliente) {
    const clienteDetalhes = document.getElementById("clienteDetalhes");

    clienteDetalhes.innerHTML = `
        <h1>${cliente.nome}</h1>
        <p><strong>Cultivo Atual:</strong> ${cliente.cultivo}</p>
        <p><strong>Quantidade:</strong> ${cliente.quantidade}</p>
        <p><strong>Data da Última Visita:</strong> ${formatarData(cliente.dataVisita)}</p>
        <p><strong>Considerações:</strong> ${cliente.consideracoes}</p>
        <p><strong>Produtos Sugeridos:</strong> ${cliente.produtosSugeridos}</p>
        <div class="mb-3">
            <h3>Localização da Propriedade</h3>
            <div id="mapaLocalizacao" style="width: 100%; height: 300px; border-radius: 10px;"></div>
        </div>
    `;

    // Inicializa o mapa, se houver localização
    if (cliente.localizacao) {
        const coordenadas = extrairCoordenadasDoLink(cliente.localizacao);
        if (coordenadas) {
            initMap(coordenadas);
        } else {
            document.getElementById('mapaLocalizacao').innerHTML = "<p class='text-warning p-3'>Link do Google Maps inválido.</p>";
        }
    } else {
        document.getElementById('mapaLocalizacao').innerHTML = "<p class='text-secondary p-3'>Nenhuma localização cadastrada.</p>";
    }
}

// Função para inicializar o mapa com OpenStreetMap
function initMap(coordenadas) {
    if (map) {
        map.remove(); // Remove o mapa existente
    }
    
    // Cria um novo mapa
    map = L.map('mapaLocalizacao').setView(coordenadas, 15);

    // Adiciona o tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Adiciona um marcador
    L.marker(coordenadas).addTo(map)
        .bindPopup('Localização do Cliente')
        .openPopup();
}

// Função para abrir o modal de edição
function abrirModalEdicao() {
    if (!clienteAtual) return;

    // Preenche o formulário de edição com os dados atuais
    document.getElementById("editarNome").value = clienteAtual.nome;
    document.getElementById("editarCultivo").value = clienteAtual.cultivo;
    document.getElementById("editarQuantidade").value = clienteAtual.quantidade;
    document.getElementById("editarDataVisita").value = clienteAtual.dataVisita;
    document.getElementById("editarConsideracoes").value = clienteAtual.consideracoes;
    document.getElementById("editarProdutosSugeridos").value = clienteAtual.produtosSugeridos;
    document.getElementById("editarLocalizacao").value = clienteAtual.localizacao || '';

    // Exibe o modal
    document.getElementById("modalEdicao").style.display = "block";
}

// Função para fechar o modal de edição
function fecharModalEdicao() {
    document.getElementById("modalEdicao").style.display = "none";
}

// Função para excluir cliente
function excluirCliente() {
    if (!clienteAtual) return;
    
    // Abre o modal de confirmação
    document.getElementById("modalConfirmacao").style.display = "block";
}

// Função para fechar o modal de confirmação
function fecharModalConfirmacao() {
    document.getElementById("modalConfirmacao").style.display = "none";
}

// Função para confirmar exclusão
async function confirmarExclusao() {
    if (!clienteAtual) return;

    try {
        const response = await fetch('clientes.php?acao=excluir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: clienteAtual.id
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === 'sucesso') {
            fecharModalConfirmacao();
            mostrarNotificacao('Cliente excluído com sucesso!', 'success');
            
            // Redireciona para a lista de clientes após 1 segundo
            setTimeout(() => {
                window.location.href = 'clientes.html';
            }, 1000);
        } else {
            throw new Error(data.mensagem || 'Erro ao excluir cliente');
        }
    } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        fecharModalConfirmacao();
        mostrarNotificacao(`Erro ao excluir cliente: ${error.message}`, 'error');
    }
}

// Função para salvar as alterações do cliente
async function salvarAlteracoesCliente(event) {
    event.preventDefault();

    if (!clienteAtual) return;

    const clienteAtualizado = {
        nome: document.getElementById("editarNome").value,
        cultivo: document.getElementById("editarCultivo").value,
        quantidade: document.getElementById("editarQuantidade").value,
        dataVisita: document.getElementById("editarDataVisita").value,
        consideracoes: document.getElementById("editarConsideracoes").value,
        produtosSugeridos: document.getElementById("editarProdutosSugeridos").value,
        localizacao: document.getElementById("editarLocalizacao").value
    };

    try {
        const response = await fetch('clientes.php?acao=salvar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: clienteAtual.id,
                cliente: clienteAtualizado
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === 'sucesso') {
            // Atualiza o cliente atual e recarrega a visualização
            clienteAtual = { ...clienteAtualizado, id: clienteAtual.id };
            exibirDetalhesCliente(clienteAtual);
            
            // Fecha o modal e exibe notificação
            fecharModalEdicao();
            mostrarNotificacao('Cliente atualizado com sucesso!', 'success');
        } else {
            throw new Error(data.mensagem || 'Erro ao atualizar cliente');
        }
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        mostrarNotificacao(`Erro ao atualizar cliente: ${error.message}`, 'error');
    }
}

// Adiciona listeners de evento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carrega detalhes do cliente
    carregarDetalhesCliente();
    
    // Configura listener para o formulário de edição
    document.getElementById('editarClienteForm').addEventListener('submit', salvarAlteracoesCliente);
    
    // Fecha o modal quando clicar fora dele
    window.addEventListener('click', (event) => {
        const modalEdicao = document.getElementById('modalEdicao');
        const modalConfirmacao = document.getElementById('modalConfirmacao');
        
        if (event.target === modalEdicao) {
            fecharModalEdicao();
        } else if (event.target === modalConfirmacao) {
            fecharModalConfirmacao();
        }
    });
});
