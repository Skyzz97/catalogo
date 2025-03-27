import os
import json
from flask import Flask, send_from_directory, redirect, jsonify, request

app = Flask(__name__, static_folder='.')

@app.route('/')
def root():
    return redirect('/catalogo.html')

@app.route('/produtos.php')
def produtos():
    # Simulação da função de produtos.php
    try:
        # Caminho para o arquivo culturas.txt
        file_path = 'culturas.txt'
        
        # Verifica se o arquivo existe
        if not os.path.exists(file_path):
            return jsonify({"error": "Arquivo culturas.txt não encontrado."}), 404
        
        # Lê o conteúdo do arquivo
        with open(file_path, 'r') as f:
            file_content = f.read()
        
        # Converte o conteúdo do arquivo em um array de produtos
        produtos = []
        lines = file_content.split('\n')
        current_cultura = ''
        current_produto = {}
        produto_id = 1
        
        for line in lines:
            line = line.strip()
            
            # Pula linhas vazias
            if not line:
                if current_produto:
                    produtos.append(current_produto)
                    current_produto = {}
                    produto_id += 1
                continue
            
            if line.startswith('Cultura:'):
                # Define a cultura atual
                current_cultura = line.replace('Cultura:', '').strip()
            elif line.startswith('Variedade:'):
                # Adiciona a variedade como um produto
                if current_produto:
                    produtos.append(current_produto)
                    produto_id += 1
                
                current_produto = {
                    'id': produto_id,
                    'nome': line.replace('Variedade:', '').strip(),
                    'categoria': 'sementes',
                    'cultura': current_cultura,
                    'descricao': '',
                    'resistencias': '',
                    'periodo': '',
                    'empresa': '',
                    'imagemPrincipal': '',
                    'outrasImagens': []
                }
            elif line.startswith('Características:'):
                # Adiciona a descrição ao último produto
                current_produto['descricao'] = line.replace('Características:', '').strip()
            elif line.startswith('Resistências:'):
                # Adiciona as resistências ao último produto
                current_produto['resistencias'] = line.replace('Resistências:', '').strip()
            elif line.startswith('Período de Plantio:'):
                # Adiciona o período de plantio ao último produto
                current_produto['periodo'] = line.replace('Período de Plantio:', '').strip()
            elif line.startswith('Empresa:'):
                # Adiciona a empresa ao último produto
                current_produto['empresa'] = line.replace('Empresa:', '').strip()
            elif line.startswith('Imagem Principal:'):
                # Adiciona a imagem principal ao último produto
                current_produto['imagemPrincipal'] = line.replace('Imagem Principal:', '').strip()
            elif line.startswith('Outras Imagens:'):
                # Adiciona outras imagens ao último produto
                imagens = line.replace('Outras Imagens:', '').strip()
                current_produto['outrasImagens'] = [img.strip() for img in imagens.split(',')] if imagens else []
        
        # Adiciona o último produto se existir
        if current_produto:
            produtos.append(current_produto)
        
        return jsonify(produtos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/sincronizar_culturas.php')
def sincronizar_culturas():
    # Simulação da função de sincronizar_culturas.php
    arquivo_local = 'culturas.txt'
    servidor_url = 'http://35.222.74.101/culturas.txt'
    
    resposta = {'status': '', 'mensagem': ''}
    
    try:
        # Tentar buscar os dados do servidor remoto
        import requests
        from urllib.request import urlopen
        
        try:
            # Primeiro tenta com requests se estiver disponível
            r = requests.get(servidor_url, timeout=5)
            dados_remotos = r.text
            success = r.status_code == 200
        except:
            # Caso contrário, usa urllib
            try:
                with urlopen(servidor_url, timeout=5) as response:
                    dados_remotos = response.read().decode('utf-8')
                    success = True
            except:
                success = False
                dados_remotos = None
        
        if not success:
            # Não conseguiu acessar o servidor
            resposta['status'] = 'offline'
            resposta['mensagem'] = 'Servidor indisponível, usando dados locais.'
        else:
            # Verifica se o conteúdo é diferente do arquivo local
            dados_locais = ''
            if os.path.exists(arquivo_local):
                with open(arquivo_local, 'r') as f:
                    dados_locais = f.read()
            
            if dados_remotos != dados_locais:
                # Atualiza o arquivo local
                with open(arquivo_local, 'w') as f:
                    f.write(str(dados_remotos))
                resposta['status'] = 'atualizado'
                resposta['mensagem'] = 'Dados atualizados com sucesso.'
            else:
                resposta['status'] = 'atual'
                resposta['mensagem'] = 'Dados já estão atualizados.'
    
    except Exception as e:
        resposta['status'] = 'erro'
        resposta['mensagem'] = f'Erro ao sincronizar: {str(e)}'
    
    return jsonify(resposta)

@app.route('/<path:path>')
def serve_file(path):
    if path.endswith('.php'):
        # Processar arquivo PHP (simplificado para ambiente de desenvolvimento)
        # Redireciona para as rotas específicas acima
        return jsonify({"error": "PHP file not supported directly"}), 404
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)