import { useState } from 'react'
import Configuracion from './components/Configuracion.jsx'
import Resultados from './components/Resultados.jsx'
import DetalleNutricional from './components/DetalleNutricional.jsx'
import ConfiguracionFamilia from './components/ConfiguracionFamilia.jsx'
import ResultadosFamilia from './components/ResultadosFamilia.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [modo, setModo]           = useState('individual')  // 'individual' | 'familia'
  const [vista, setVista]         = useState('form')        // 'form' | 'resultados' | 'detalle'
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando]   = useState(false)
  const [error, setError]         = useState(null)

  function resetear() {
    setVista('form')
    setResultado(null)
    setError(null)
  }

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo)
    resetear()
  }

  async function calcularIndividual(params) {
    setCargando(true); setError(null)
    try {
      const resp = await fetch(`${API_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!resp.ok) throw new Error((await resp.json()).detail || 'Error en el servidor')
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

  async function calcularFamilia(params) {
    setCargando(true); setError(null)
    try {
      const resp = await fetch(`${API_URL}/api/plan/familia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!resp.ok) throw new Error((await resp.json()).detail || 'Error en el servidor')
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

      {/* Selector de modo */}
      {vista === 'form' && (
        <div className="tabs" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`tab${modo === 'individual' ? ' activo' : ''}`}
            onClick={() => cambiarModo('individual')}
          >
            👤 Individual
          </button>
          <button
            type="button"
            className={`tab${modo === 'familia' ? ' activo' : ''}`}
            onClick={() => cambiarModo('familia')}
          >
            👨‍👩‍👧‍👦 Modo Familia
          </button>
        </div>
      )}

      {/* Vistas individuales */}
      {modo === 'individual' && vista === 'form' && (
        <Configuracion
          onCalcular={calcularIndividual}
          cargando={cargando}
          error={error}
        />
      )}
      {modo === 'individual' && vista === 'resultados' && resultado && (
        <Resultados
          resultado={resultado}
          onVerDetalle={() => setVista('detalle')}
          onNuevoCalculo={resetear}
        />
      )}
      {modo === 'individual' && vista === 'detalle' && resultado && (
        <DetalleNutricional
          resultado={resultado}
          onVolver={() => setVista('resultados')}
        />
      )}

      {/* Vistas familia */}
      {modo === 'familia' && vista === 'form' && (
        <ConfiguracionFamilia
          onCalcular={calcularFamilia}
          cargando={cargando}
          error={error}
        />
      )}
      {modo === 'familia' && vista === 'resultados' && resultado && (
        <ResultadosFamilia
          resultado={resultado}
          onNuevoCalculo={resetear}
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
