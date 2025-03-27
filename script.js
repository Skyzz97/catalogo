// Variáveis globais
let produtosData = [];
let filtroFavoritosAtivo = false;
let filtroCategoria = '';
let filtroCultura = '';
let termoPesquisa = '';

// Funções do Menu Lateral
function abrirMenu() {
    document.getElementById("sidebar").style.left = "0";
}

function fecharMenu() {
    document.getElementById("sidebar").style.left = "-250px";
}

// Carregar produtos ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    
    // Configurar eventos
    document.getElementById('searchButton').addEventListener('click', pesquisarProdutos);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            pesquisarProdutos();
        }
    });
    
    document.getElementById('filterFavorites').addEventListener('click', filtrarFavoritos);
});

// Função para carregar produtos da API
async function carregarProdutos() {
    try {
        const produtosGrid = document.getElementById('produtosGrid');
        produtosGrid.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p>Carregando produtos...</p>
            </div>
        `;
        
        // Obter produtos do servidor
        const response = await fetch('index.php');
        if (!response.ok) {
            throw new Error('Falha ao carregar produtos');
        }
        
        const data = await response.json();
        produtosData = data;
        
        // Aplicar filtros se houver
        exibirProdutos(filtrarProdutos());
        atualizarTagsFiltro();
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        const produtosGrid = document.getElementById('produtosGrid');
        produtosGrid.innerHTML = `
            <div class="text-center mt-5">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                <p class="mt-3">Erro ao carregar produtos. Por favor, tente novamente mais tarde.</p>
                <button class="btn btn-primary mt-3" onclick="carregarProdutos()">Tentar Novamente</button>
            </div>
        `;
    }
}

// Função para exibir produtos na grade
function exibirProdutos(produtos) {
    const produtosGrid = document.getElementById('produtosGrid');
    
    // Se não houver produtos, mostrar mensagem
    if (produtos.length === 0) {
        produtosGrid.innerHTML = `
            <div class="text-center mt-5" style="grid-column: 1 / -1;">
                <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                <p class="mt-3">Nenhum produto encontrado.</p>
            </div>
        `;
        return;
    }
    
    // Carregar favoritos do localStorage
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
    
    // Renderizar produtos
    produtosGrid.innerHTML = produtos.map(produto => {
        const isFavorito = favoritos[produto.id] || false;
        return `
            <div class="produto-card" onclick="abrirDetalhesProduto(${produto.id}, event)">
                <div class="produto-favorito ${isFavorito ? 'active' : ''}" onclick="toggleFavorito(event, ${produto.id})">
                    <i class="bi bi-star${isFavorito ? '-fill' : ''}"></i>
                </div>
                <div class="produto-categoria">${produto.categoria || 'Sem categoria'}</div>
                <img src="${produto.imagemPrincipal || 'https://via.placeholder.com/300x200?text=Produto'}" alt="${produto.nome}" class="produto-image">
                <div class="produto-info">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao ? produto.descricao.substring(0, 100) + (produto.descricao.length > 100 ? '...' : '') : 'Sem descrição'}</p>
                    <span class="badge bg-primary">${produto.cultura || 'Geral'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Função para abrir detalhes do produto
function abrirDetalhesProduto(id, event) {
    // Evitar abrir se clicou no botão de favorito
    if (event.target.closest('.produto-favorito')) {
        return;
    }
    window.location.href = `detalhes.html?id=${id}`;
}

// Função para marcar/desmarcar favorito
function toggleFavorito(event, id) {
    event.stopPropagation();
    
    // Obter favoritos do localStorage
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
    
    // Inverter estado do favorito
    favoritos[id] = !favoritos[id];
    
    // Se for false, remover do objeto
    if (!favoritos[id]) {
        delete favoritos[id];
    }
    
    // Salvar no localStorage
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    
    // Atualizar visual
    const btnFavorito = event.currentTarget;
    btnFavorito.classList.toggle('active', favoritos[id]);
    btnFavorito.innerHTML = `<i class="bi bi-star${favoritos[id] ? '-fill' : ''}"></i>`;
    
    // Se o filtro de favoritos estiver ativo, recarregar produtos
    if (filtroFavoritosAtivo) {
        exibirProdutos(filtrarProdutos());
    }
}

// Função para pesquisar produtos
function pesquisarProdutos() {
    const input = document.getElementById('searchInput');
    termoPesquisa = input.value.trim();
    
    exibirProdutos(filtrarProdutos());
    atualizarTagsFiltro();
}

// Função para filtrar por categoria
function filtrarCategoria(categoria) {
    document.getElementById('categoriaFilter').value = categoria;
    filtroCategoria = categoria;
    
    exibirProdutos(filtrarProdutos());
    atualizarTagsFiltro();
    fecharMenu();
}

// Função para filtrar por cultura
function filtrarCultura(cultura) {
    document.getElementById('culturaFilter').value = cultura;
    filtroCultura = cultura;
    
    exibirProdutos(filtrarProdutos());
    atualizarTagsFiltro();
    fecharMenu();
}

// Função para filtrar favoritos
function filtrarFavoritos() {
    filtroFavoritosAtivo = !filtroFavoritosAtivo;
    document.getElementById('filterFavorites').classList.toggle('active', filtroFavoritosAtivo);
    
    exibirProdutos(filtrarProdutos());
    atualizarTagsFiltro();
}

// Função para aplicar todos os filtros
function filtrarProdutos() {
    let produtosFiltrados = [...produtosData];
    
    // Filtrar por termo de pesquisa
    if (termoPesquisa) {
        produtosFiltrados = produtosFiltrados.filter(produto => 
            produto.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) || 
            (produto.descricao && produto.descricao.toLowerCase().includes(termoPesquisa.toLowerCase()))
        );
    }
    
    // Filtrar por categoria
    if (filtroCategoria) {
        produtosFiltrados = produtosFiltrados.filter(produto => 
            produto.categoria && produto.categoria.toLowerCase() === filtroCategoria.toLowerCase()
        );
    }
    
    // Filtrar por cultura
    if (filtroCultura) {
        produtosFiltrados = produtosFiltrados.filter(produto => 
            produto.cultura && produto.cultura.toLowerCase() === filtroCultura.toLowerCase()
        );
    }
    
    // Filtrar favoritos
    if (filtroFavoritosAtivo) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
        produtosFiltrados = produtosFiltrados.filter(produto => favoritos[produto.id]);
    }
    
    return produtosFiltrados;
}

// Função para atualizar as tags de filtro
function atualizarTagsFiltro() {
    const filterTags = document.getElementById('filterTags');
    filterTags.innerHTML = '';
    
    if (termoPesquisa) {
        filterTags.innerHTML += `
            <div class="filter-tag">
                <span>Pesquisa: ${termoPesquisa}</span>
                <i class="bi bi-x-circle" onclick="limparPesquisa()"></i>
            </div>
        `;
    }
    
    if (filtroCategoria) {
        filterTags.innerHTML += `
            <div class="filter-tag">
                <span>Categoria: ${filtroCategoria}</span>
                <i class="bi bi-x-circle" onclick="limparCategoria()"></i>
            </div>
        `;
    }
    
    if (filtroCultura) {
        filterTags.innerHTML += `
            <div class="filter-tag">
                <span>Cultura: ${filtroCultura}</span>
                <i class="bi bi-x-circle" onclick="limparCultura()"></i>
            </div>
        `;
    }
    
    if (filtroFavoritosAtivo) {
        filterTags.innerHTML += `
            <div class="filter-tag">
                <span>Apenas Favoritos</span>
                <i class="bi bi-x-circle" onclick="filtrarFavoritos()"></i>
            </div>
        `;
    }
}

// Funções para limpar filtros
function limparPesquisa() {
    document.getElementById('searchInput').value = '';
    termoPesquisa = '';
    exibirProdutos(filtrarProdutos());
    atualizarTagsFiltro();
}

function limparCategoria() {
    document.getElementById('categoriaFilter').value = '';
    filtroCategoria = '';
    exibirProdutos(filtrarProdutos());
    atualizarTagsFiltro();
}

function limparCultura() {
    document.getElementById('culturaFilter').value = '';
    filtroCultura = '';
    exibirProdutos(filtrarProdutos());
    atualizarTagsFiltro();
}

// Função para limpar todos os filtros
function limparTodosFiltros() {
    termoPesquisa = '';
    filtroCategoria = '';
    filtroCultura = '';
    filtroFavoritosAtivo = false;
    
    document.getElementById('searchInput').value = '';
    document.getElementById('categoriaFilter').value = '';
    document.getElementById('culturaFilter').value = '';
    document.getElementById('filterFavorites').classList.remove('active');
    
    exibirProdutos(produtosData);
    atualizarTagsFiltro();
}
