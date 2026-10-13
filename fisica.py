"""Núcleo físico de la Unidad 1: campo eléctrico, potencial y trayectoria.
Unidades: cargas en nC, distancias en m, V en voltios, E en V/m.
Con q en nC, k·q = 8.99 V·m por cada nC, por eso K = 8.99."""
import numpy as np
from scipy.integrate import solve_ivp

K = 8.99
MAX_CARGAS = 10


def campo(cargas, X, Y):
    """Devuelve (Ex, Ey, V) en los puntos (X, Y). cargas = [(q_nC, x, y), ...]"""
    X = np.asarray(X, float)
    Y = np.asarray(Y, float)
    Ex, Ey, V = np.zeros_like(X), np.zeros_like(X), np.zeros_like(X)
    for q, x0, y0 in cargas:
        dx, dy = X - x0, Y - y0
        r2 = dx * dx + dy * dy + 1e-6          # evita dividir por cero
        r = np.sqrt(r2)
        V += K * q / r
        Ex += K * q * dx / (r2 * r)
        Ey += K * q * dy / (r2 * r)
    return Ex, Ey, V


def potencial_en_punto(cargas, x, y):
    """V, Ex, Ey y el desglose por carga en el punto (x, y)."""
    Ex, Ey, V = campo(cargas, x, y)
    desglose = []
    for i, (q, x0, y0) in enumerate(cargas, 1):
        r = float(np.hypot(x - x0, y - y0))
        desglose.append({"i": i, "q": q, "r": r, "V": K * q / r if r > 1e-9 else None})
    return {"V": float(V), "Ex": float(Ex), "Ey": float(Ey), "E": float(np.hypot(Ex, Ey)),
            "angulo": float(np.degrees(np.arctan2(Ey, Ex))), "desglose": desglose}


def trayectoria(q=1.0, m=1.0, ex=5.0, ey=-20.0, v0=15.0, ang=40.0, T=3.0, gravedad=False, parar=True, n=400):
    """q en µC, m en mg, E en V/m, v0 en m/s (así a = q·E/m sale directo en m/s²).
    Integra con solve_ivp (RK45) y valida contra la solución exacta y el teorema trabajo-energía."""
    if m <= 0 or T <= 0:
        raise ValueError("m y T deben ser positivos")
    ax, ay = q * ex / m, q * ey / m - (9.81 if gravedad else 0.0)
    a = np.radians(ang)
    vx0, vy0 = v0 * np.cos(a), v0 * np.sin(a)

    def f(t, s):
        return [s[2], s[3], ax, ay]

    def suelo(t, s):
        return s[1]
    suelo.terminal, suelo.direction = True, -1

    sol = solve_ivp(f, (0, T), [0, 0, vx0, vy0], events=suelo if parar else None,
                    rtol=1e-10, atol=1e-12, dense_output=True)
    tf = float(sol.t[-1])
    t = np.linspace(0, tf, n)
    x, y, vx, vy = sol.sol(t)
    xe, ye = vx0 * tf + 0.5 * ax * tf ** 2, vy0 * tf + 0.5 * ay * tf ** 2     # solución exacta
    vf = float(np.hypot(vx[-1], vy[-1]))
    return {"t_vuelo": tf, "alcance": float(x[-1]), "h_max": float(y.max()), "v_final": vf, "ax": ax, "ay": ay,
            "dK": float(0.5 * m * (vf ** 2 - v0 ** 2)), "W": float(m * (ax * x[-1] + ay * y[-1])),
            "error": float(np.hypot(x[-1] - xe, y[-1] - ye)),
            "puntos": np.column_stack([x, y]).tolist()}
