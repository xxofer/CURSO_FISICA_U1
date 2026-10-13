"""Servidor local de la Unidad 1 (Flask). Ejecuta:  python app.py  y abre http://127.0.0.1:5000"""
import threading
import webbrowser
from flask import Flask, jsonify, render_template, request
import fisica

app = Flask(__name__)


def num(d, k, defecto=None):
    try:
        return float(d.get(k, defecto))
    except (TypeError, ValueError):
        raise ValueError(f"Valor inválido en '{k}'")


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/potencial")
def api_potencial():
    try:
        d = request.get_json(force=True)
        cargas = [(num(c, "q"), num(c, "x"), num(c, "y")) for c in d.get("cargas", [])]
        if not 1 <= len(cargas) <= fisica.MAX_CARGAS:
            raise ValueError("Debe haber entre 1 y 10 cargas")
        return jsonify(fisica.potencial_en_punto(cargas, num(d, "x"), num(d, "y")))
    except (ValueError, AttributeError) as e:
        return jsonify(error=str(e)), 400


@app.post("/api/trayectoria")
def api_trayectoria():
    try:
        d = request.get_json(force=True)
        r = fisica.trayectoria(q=num(d, "q"), m=num(d, "m"), ex=num(d, "ex"), ey=num(d, "ey"), v0=num(d, "v0"),
                               ang=num(d, "ang"), T=min(num(d, "T"), 60), gravedad=bool(d.get("gravedad")),
                               parar=bool(d.get("parar", True)))
        return jsonify(r)
    except (ValueError, AttributeError) as e:
        return jsonify(error=str(e)), 400


if __name__ == "__main__":
    PUERTO = 5000
    threading.Timer(1.0, lambda: webbrowser.open(f"http://127.0.0.1:{PUERTO}")).start()
    app.run(host="127.0.0.1", port=PUERTO, debug=False)
