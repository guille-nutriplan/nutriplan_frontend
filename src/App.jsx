import { useState } from 'react'
import Configuracion from './components/Configuracion.jsx'
import Resultados from './components/Resultados.jsx'
import DetalleNutricional from './components/DetalleNutricional.jsx'

// URL de la API — se configura en .env como VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  // 'form' | 'resultados' | 'detalle'
  const [vista, setVista] = useState('form')
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  async function calcular(params) {
    setCargando(true)
    setError(null)
    try {
      const resp = await fetch(`${API_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.detail || 'Error en el servidor')
      }
      const data = await resp.json()
      if (!data.exito) throw new Error(data.mensaje)
      setResultado(data)
      setVista('resultados')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🥗 NutriPlan</h1>
        <p>Dieta nutritiva y económica · Requerimientos OMS · Argentina</p>
      </header>

      {vista === 'form' && (
        <Configuracion
          onCalcular={calcular}
          cargando={cargando}
          error={error}
          apiUrl={API_URL}
        />
      )}

      {vista === 'resultados' && resultado && (
        <Resultados
          resultado={resultado}
          onVerDetalle={() => setVista('detalle')}
          onNuevoCalculo={() => { setVista('form'); setResultado(null) }}
        />
      )}

      {vista === 'detalle' && resultado && (
        <DetalleNutricional
          resultado={resultado}
          onVolver={() => setVista('resultados')}
        />
      )}

      <footer className="footer">
        NutriPlan v2.0 · Datos nutricionales: tabla de composición de alimentos ·
        Precios: <a href="https://datos.produccion.gob.ar" target="_blank" rel="noreferrer">SEPA datos.gob.ar</a>
        <br />
        Esta herramienta es orientativa. Consultá a un profesional de la salud.
      </footer>
    </div>
  )
}
