import os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
import fisica


class PruebasUnidad1(unittest.TestCase):
    def test_carga_unitaria(self):
        ex, ey, v = fisica.campo([(1, 0, 0)], 1.0, 0.0)
        self.assertAlmostEqual(float(v), 8.99, places=4)
        self.assertAlmostEqual(float(np.hypot(ex, ey)), 8.99, places=4)

    def test_dipolo_punto_medio(self):
        ex, ey, v = fisica.campo([(3, -1, 0), (-3, 1, 0)], 0.0, 0.0)
        self.assertAlmostEqual(float(v), 0.0, places=9)
        self.assertAlmostEqual(float(ex), 2 * 8.99 * 3, places=3)

    def test_ejemplo_del_manual(self):
        r = fisica.potencial_en_punto([(5, 0, 0), (-5, 4, 0)], 1, 0)
        self.assertAlmostEqual(r["V"], 29.967, places=3)
        self.assertAlmostEqual(r["Ex"], 49.944, places=3)

    def test_campo_es_menos_gradiente(self):
        ch = [(3, -1, .5), (-2, 1, 0), (4, 0, 2)]
        h = 1e-5
        vp = fisica.campo(ch, .3 + h, -.4)[2]
        vm = fisica.campo(ch, .3 - h, -.4)[2]
        ex = fisica.campo(ch, .3, -.4)[0]
        self.assertAlmostEqual(float(-(vp - vm) / (2 * h)), float(ex), places=3)

    def test_trayectoria_trabajo_energia(self):
        r = fisica.trayectoria()
        self.assertAlmostEqual(r["dK"], r["W"], places=6)
        self.assertLess(r["error"], 1e-9)
        self.assertAlmostEqual(r["alcance"], 13.4032, places=3)


if __name__ == "__main__":
    unittest.main()
