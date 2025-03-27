from flask import Flask, send_from_directory
import os
import subprocess
import threading
import time

app = Flask(__name__)

# Função para iniciar o servidor PHP em uma thread separada
def start_php_server():
    subprocess.call(["php", "-S", "0.0.0.0:8000", "-t", "."])

# Inicie o servidor PHP em segundo plano
php_thread = threading.Thread(target=start_php_server)
php_thread.daemon = True
php_thread.start()

# Aguarde alguns segundos para o servidor PHP iniciar
time.sleep(2)

@app.route('/')
def root():
    return send_from_directory('.', 'catalogo.html')

@app.route('/<path:path>')
def serve_files(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)