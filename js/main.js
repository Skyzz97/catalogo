// Funções compartilhadas entre todas as páginas

// Funções para abrir e fechar o menu lateral
function abrirMenu() {
    document.getElementById("sidebar").style.left = "0";
}

function fecharMenu() {
    document.getElementById("sidebar").style.left = "-250px";
}

// Função para formatar data de yyyy-mm-dd para dd/mm/yyyy
function formatarData(dataString) {
    if (!dataString) return '';
    
    const partes = dataString.split('-');
    if (partes.length !== 3) return dataString;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Função para formatar data de dd/mm/yyyy para yyyy-mm-dd
function formatarDataParaInput(dataString) {
    if (!dataString) return '';
    
    const partes = dataString.split('/');
    if (partes.length !== 3) return dataString;
    
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

// Função para extrair coordenadas de um link do Google Maps
function extrairCoordenadasDoLink(link) {
    if (!link) return null;
    
    const regex = /@([-\d.]+),([-\d.]+)/;
    const match = link.match(regex);

    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        return [lat, lng];
    } else {
        console.error("Link do Google Maps inválido.");
        return null;
    }
}

// Função para gerenciar favoritos
function gerenciarFavorito(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
    favoritos[id] = !favoritos[id];
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    return favoritos[id];
}

// Função para verificar se um item é favorito
function isFavorito(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
    return favoritos[id] || false;
}

// Função para exibir notificação toast
function mostrarNotificacao(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = mensagem;
    document.body.appendChild(toast);
    
    // Inicializa a animação
    setTimeout(() => {
        toast.classList.add('show');
        
        // Remove após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}

// Adiciona estilos para o toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: #28a745;
        color: white;
        border-radius: 5px;
        z-index: 9999;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .toast-success {
        background-color: #28a745;
    }
    
    .toast-error {
        background-color: #dc3545;
    }
    
    .toast-warning {
        background-color: #ffc107;
        color: #212529;
    }
    
    .toast-info {
        background-color: #17a2b8;
    }
`;
document.head.appendChild(toastStyles);
