// Variáveis globais
let produtos = [];
let filtroFavoritosAtivo = false;

// Função para carregar produtos
async function carregarProdutos(termo = '', categoria = '', cultura = '') {
    try {
        const response = await fetch('produtos.php');
        const data = await response.json();
        
        // Armazena os dados originais
        produtos = data;
        
        // Aplica os filtros aos produtos
        exibirProdutos(termo, categoria, cultura);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        document.getElementById("listaProdutos").innerHTML = `
            <div class="alert alert-danger w-100" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i> 
                Erro ao carregar produtos. Por favor, tente novamente.
            </div>
        `;
    }
}

// Função para exibir produtos com filtros
function exibirProdutos(termo = '', categoria = '', cultura = '') {
    const listaProdutos = document.getElementById("listaProdutos");
    
    // Filtra os produtos com base nos critérios
    let produtosFiltrados = produtos.filter(produto => {
        // Filtro por termo de pesquisa
        const matchTermo = !termo || 
            produto.nome.toLowerCase().includes(termo.toLowerCase()) || 
            produto.descricao.toLowerCase().includes(termo.toLowerCase());
        
        // Filtro por categoria
        const matchCategoria = !categoria || produto.categoria === categoria;
        
        // Filtro por cultura
        const matchCultura = !cultura || produto.cultura === cultura;
        
        // Filtro de favoritos
        const matchFavorito = !filtroFavoritosAtivo || isFavorito(produto.id);
        
        return matchTermo && matchCategoria && matchCultura && matchFavorito;
    });
    
    // Exibe mensagem se não houver resultados
    if (produtosFiltrados.length === 0) {
        listaProdutos.innerHTML = `
            <div class="alert alert-info w-100" role="alert">
                <i class="bi bi-info-circle-fill"></i> 
                Nenhum produto encontrado com os filtros atuais.
            </div>
        `;
        return;
    }
    
    // Constrói HTML dos produtos
    listaProdutos.innerHTML = produtosFiltrados.map(produto => {
        // Verifica se o produto é favorito
        const favoritoClass = isFavorito(produto.id) ? 'active' : '';
        
        // Determina o ícone a ser usado
        const favoritoIcon = isFavorito(produto.id) ? 'bi-star-fill' : 'bi-star';
        
        // Determina o ícone para a imagem caso não exista
        const placeholderIcon = produto.categoria === 'sementes' ? 'bi-flower1' : 
                               (produto.categoria === 'adubos' ? 'bi-droplet-fill' : 'bi-spray');
        
        return `
            <div class="produto-card">
                <div class="card-img" onclick="abrirDetalhesProduto(${produto.id})">
                    ${produto.imagemPrincipal ? 
                      `<img src="${produto.imagemPrincipal}" alt="${produto.nome}">` : 
                      `<i class="bi ${placeholderIcon}"></i>`}
                </div>
                <div class="card-body" onclick="abrirDetalhesProduto(${produto.id})">
                    <h5>${produto.nome}</h5>
                    <p>${produto.descricao.substring(0, 100)}${produto.descricao.length > 100 ? '...' : ''}</p>
                    <span class="tag">${produto.categoria}</span>
                    ${produto.cultura ? `<span class="tag">${produto.cultura}</span>` : ''}
                </div>
                <button class="btn-favorite ${favoritoClass}" onclick="toggleFavorito(event, ${produto.id})">
                    <i class="bi ${favoritoIcon}"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Função para marcar/desmarcar favorito
function toggleFavorito(event, id) {
    event.stopPropagation(); // Impede que o clique abra o produto
    
    const isFav = gerenciarFavorito(id);
    
    // Atualiza a UI
    const button = event.currentTarget;
    button.classList.toggle('active', isFav);
    button.innerHTML = `<i class="bi bi-star${isFav ? '-fill' : ''}"></i>`;
    
    // Exibe uma notificação
    mostrarNotificacao(
        isFav ? 'Produto adicionado aos favoritos!' : 'Produto removido dos favoritos',
        isFav ? 'success' : 'info'
    );
    
    // Se o filtro de favoritos estiver ativo, atualiza a lista
    if (filtroFavoritosAtivo) {
        const termo = document.getElementById('pesquisaProduto').value;
        const categoria = document.getElementById('categoriaFilter').value;
        const cultura = document.getElementById('culturaFilter').value;
        exibirProdutos(termo, categoria, cultura);
    }
}

// Função para abrir detalhes do produto
function abrirDetalhesProduto(id) {
    window.location.href = `produto.html?id=${id}`;
}

// Função para filtrar por categoria
function filtrarCategoria(categoria) {
    document.getElementById('categoriaFilter').value = categoria;
    const termo = document.getElementById('pesquisaProduto').value;
    const cultura = document.getElementById('culturaFilter').value;
    exibirProdutos(termo, categoria, cultura);
    fecharMenu();
}

// Função para filtrar por cultura
function filtrarCultura(cultura) {
    document.getElementById('culturaFilter').value = cultura;
    const termo = document.getElementById('pesquisaProduto').value;
    const categoria = document.getElementById('categoriaFilter').value;
    exibirProdutos(termo, categoria, cultura);
    fecharMenu();
}

// Função para alternar filtro de favoritos
function toggleFiltroFavoritos() {
    filtroFavoritosAtivo = !filtroFavoritosAtivo;
    document.getElementById('btnFavoritos').classList.toggle('active', filtroFavoritosAtivo);
    
    const termo = document.getElementById('pesquisaProduto').value;
    const categoria = document.getElementById('categoriaFilter').value;
    const cultura = document.getElementById('culturaFilter').value;
    exibirProdutos(termo, categoria, cultura);
}

// Função para verificar e sincronizar dados com o servidor
async function sincronizarDados() {
    try {
        // Mostra um pequeno indicador de sincronização apenas na primeira vez
        const jaVerificado = sessionStorage.getItem('sincronizacaoVerificada');
        
        if (!jaVerificado) {
            const statusElement = document.createElement('div');
            statusElement.style.position = 'fixed';
            statusElement.style.bottom = '10px';
            statusElement.style.right = '10px';
            statusElement.style.padding = '8px 15px';
            statusElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
            statusElement.style.color = '#fff';
            statusElement.style.borderRadius = '5px';
            statusElement.style.fontSize = '14px';
            statusElement.style.zIndex = '9999';
            statusElement.innerHTML = 'Verificando atualizações...';
            document.body.appendChild(statusElement);

            // Faz a requisição para o arquivo de sincronização
            const response = await fetch('sincronizar_culturas.php');
            const resultado = await response.json();

            // Atualiza o indicador com o resultado
            if (resultado.status === 'atualizado') {
                statusElement.innerHTML = 'Catálogo atualizado!';
                statusElement.style.backgroundColor = '#28a745';
            } else if (resultado.status === 'atual') {
                statusElement.innerHTML = 'Catálogo já está atualizado';
                statusElement.style.backgroundColor = '#17a2b8';
            } else {
                statusElement.innerHTML = resultado.mensagem;
                statusElement.style.backgroundColor = '#ffc107';
            }

            // Marca que já verificamos a sincronização nesta sessão
            sessionStorage.setItem('sincronizacaoVerificada', 'true');

            // Remove o indicador após alguns segundos
            setTimeout(() => {
                statusElement.style.opacity = '0';
                statusElement.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    document.body.removeChild(statusElement);
                }, 500);
            }, 3000);
        }

        // Retornamos true para indicar que a sincronização terminou
        return true;
    } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
        return false;
    }
}

// Adiciona listeners de evento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Sincroniza dados com o servidor primeiro
    sincronizarDados().then(() => {
        // Carrega produtos iniciais após a sincronização
        carregarProdutos();
    });
    
    // Configura listener para pesquisa
    document.getElementById('pesquisaProduto').addEventListener('input', (e) => {
        const termo = e.target.value;
        const categoria = document.getElementById('categoriaFilter').value;
        const cultura = document.getElementById('culturaFilter').value;
        exibirProdutos(termo, categoria, cultura);
    });
    
    // Configura listener para filtro de categoria
    document.getElementById('categoriaFilter').addEventListener('change', (e) => {
        const categoria = e.target.value;
        const termo = document.getElementById('pesquisaProduto').value;
        const cultura = document.getElementById('culturaFilter').value;
        exibirProdutos(termo, categoria, cultura);
    });
    
    // Configura listener para filtro de cultura
    document.getElementById('culturaFilter').addEventListener('change', (e) => {
        const cultura = e.target.value;
        const termo = document.getElementById('pesquisaProduto').value;
        const categoria = document.getElementById('categoriaFilter').value;
        exibirProdutos(termo, categoria, cultura);
    });
    
    // Configura listener para botão de favoritos
    document.getElementById('btnFavoritos').addEventListener('click', toggleFiltroFavoritos);
});
