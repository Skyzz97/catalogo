import os
from flask import Flask, send_from_directory, redirect

app = Flask(__name__, static_folder='.')

@app.route('/')
def root():
    return redirect('/catalogo.html')

@app.route('/<path:path>')
def serve_file(path):
    if path.endswith('.php'):
        # Processar arquivo PHP (simplificado para ambiente de desenvolvimento)
        with open(path, 'r') as f:
            content = f.read()
        return content
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)