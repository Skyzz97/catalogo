// Variáveis globais
let clientes = [];
let modoEdicao = false;

// Função para carregar clientes do servidor
async function carregarClientes() {
    try {
        const response = await fetch('clientes.php?acao=ler');
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transforma o objeto em array mantendo o índice original como 'id'
        clientes = Array.isArray(data) ? data : Object.keys(data).map(id => ({
            ...data[id],
            id
        }));
        
        exibirClientes();
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        document.getElementById("listaClientes").innerHTML = `
            <div class="alert alert-danger w-100" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i> 
                Erro ao carregar clientes. Por favor, tente novamente.
            </div>
        `;
    }
}

// Função para exibir clientes na página
function exibirClientes(termo = '') {
    const listaClientes = document.getElementById("listaClientes");
    
    // Filtra os clientes pelo termo de pesquisa
    const clientesFiltrados = clientes.filter(cliente => 
        !termo || 
        cliente.nome.toLowerCase().includes(termo.toLowerCase()) ||
        cliente.cultivo.toLowerCase().includes(termo.toLowerCase())
    );
    
    // Exibe mensagem se não houver resultados
    if (clientesFiltrados.length === 0) {
        listaClientes.innerHTML = `
            <div class="alert alert-info w-100" role="alert">
                <i class="bi bi-info-circle-fill"></i> 
                ${termo ? 'Nenhum cliente encontrado com este termo de pesquisa.' : 'Nenhum cliente cadastrado ainda.'}
            </div>
        `;
        return;
    }
    
    // Constrói HTML dos clientes
    listaClientes.innerHTML = clientesFiltrados.map(cliente => `
        <div class="cliente-card" onclick="abrirDetalhesCliente('${cliente.id}')">
            <div class="card-body">
                <h5>${cliente.nome}</h5>
                <p><strong>Cultivo:</strong> ${cliente.cultivo}</p>
                <p><strong>Quantidade:</strong> ${cliente.quantidade}</p>
                <p><strong>Última Visita:</strong> ${formatarData(cliente.dataVisita)}</p>
            </div>
        </div>
    `).join("");
}

// Função para abrir o formulário de cliente
function abrirFormularioCliente(id = null) {
    const modal = document.getElementById("formularioCliente");
    const form = document.getElementById("clienteForm");
    const modalTitulo = document.getElementById("modalTitulo");
    
    // Reseta o formulário
    form.reset();
    
    if (id !== null) {
        // Modo de edição
        modoEdicao = true;
        modalTitulo.textContent = "Editar Cliente";
        
        // Encontra o cliente pelo ID
        const cliente = clientes.find(c => c.id == id);
        
        if (cliente) {
            // Preenche o formulário com os dados do cliente
            document.getElementById("clienteId").value = cliente.id;
            document.getElementById("nome").value = cliente.nome;
            document.getElementById("cultivo").value = cliente.cultivo;
            document.getElementById("quantidade").value = cliente.quantidade;
            document.getElementById("dataVisita").value = cliente.dataVisita;
            document.getElementById("consideracoes").value = cliente.consideracoes;
            document.getElementById("produtosSugeridos").value = cliente.produtosSugeridos;
            document.getElementById("localizacao").value = cliente.localizacao || '';
        }
    } else {
        // Modo de adição
        modoEdicao = false;
        modalTitulo.textContent = "Adicionar Cliente";
        document.getElementById("clienteId").value = '';
    }
    
    // Exibe o modal
    modal.style.display = "block";
}

// Função para fechar o formulário de cliente
function fecharFormularioCliente() {
    document.getElementById("formularioCliente").style.display = "none";
}

// Função para abrir a página de detalhes do cliente
function abrirDetalhesCliente(id) {
    window.location.href = `cliente.html?id=${id}`;
}

// Função para salvar cliente
async function salvarCliente(event) {
    event.preventDefault();
    
    // Obtém os dados do formulário
    const id = document.getElementById("clienteId").value;
    const cliente = {
        nome: document.getElementById("nome").value,
        cultivo: document.getElementById("cultivo").value,
        quantidade: document.getElementById("quantidade").value,
        dataVisita: document.getElementById("dataVisita").value,
        consideracoes: document.getElementById("consideracoes").value,
        produtosSugeridos: document.getElementById("produtosSugeridos").value,
        localizacao: document.getElementById("localizacao").value
    };
    
    try {
        // Envia para o servidor
        const response = await fetch('clientes.php?acao=salvar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: modoEdicao ? id : null,
                cliente: cliente
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'sucesso') {
            // Fecha o modal e recarrega a lista de clientes
            fecharFormularioCliente();
            await carregarClientes();
            
            // Exibe notificação de sucesso
            mostrarNotificacao(
                modoEdicao ? 'Cliente atualizado com sucesso!' : 'Cliente adicionado com sucesso!',
                'success'
            );
        } else {
            throw new Error(data.mensagem || 'Erro ao salvar cliente');
        }
    } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        mostrarNotificacao(`Erro ao salvar cliente: ${error.message}`, 'error');
    }
}

// Adiciona listeners de evento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carrega clientes iniciais
    carregarClientes();
    
    // Configura listener para pesquisa
    document.getElementById('pesquisaCliente').addEventListener('input', (e) => {
        const termo = e.target.value;
        exibirClientes(termo);
    });
    
    // Configura listener para o formulário
    document.getElementById('clienteForm').addEventListener('submit', salvarCliente);
    
    // Fecha o modal quando clicar fora dele
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('formularioCliente');
        if (event.target === modal) {
            fecharFormularioCliente();
        }
    });
});
