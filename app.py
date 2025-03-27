import os
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Servidor Flask está rodando! Favor acessar: http://localhost:8000/catalogo.html"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)