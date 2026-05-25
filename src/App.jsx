import { useState, useEffect } from 'react'
import Configuracion from './components/Configuracion.jsx'
import Resultados from './components/Resultados.jsx'
import DetalleNutricional from './components/DetalleNutricional.jsx'
import ConfiguracionFamilia from './components/ConfiguracionFamilia.jsx'
import Analizador from './components/Analizador.jsx'
import ConQueTengo from './components/ConQueTengo.jsx'
import ResultadosAnalisis from './components/ResultadosAnalisis.jsx'
import ResultadosFamilia from './components/ResultadosFamilia.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [modo, setModo]           = useState('individual')
  const [sepaStatus, setSepaStatus] = useState(null)

  // Consultar estado SEPA al montar
  useEffect(() => {
    fetch(`${API_URL}/api/status`)
      .then(r => r.json())
      .then(d => setSepaStatus(d))
      .catch(() => {})
    // Reintentar cada 30s hasta que SEPA esté listo
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/status`)
        .then(r => r.json())
        .then(d => {
          setSepaStatus(d)
          if (d.sepa_listo) clearInterval(interval)
        })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])  // 'individual' | 'familia' | 'analizador'
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

  async function calcularAnalisis(params) {
    setCargando(true); setError(null)
    try {
      const resp = await fetch(`${API_URL}/api/analizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!resp.ok) throw new Error((await resp.json()).detail || 'Error en el servidor')
      const data = await resp.json()
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

      {/* Banner estado SEPA */}
      {sepaStatus && !sepaStatus.sepa_listo && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 8, padding: '8px 14px', marginBottom: 12,
          fontSize: '.78rem', color: '#92400e', display: 'flex',
          alignItems: 'center', gap: 8,
        }}>
          {sepaStatus.sepa_status === 'descargando'
            ? '⏳ Actualizando precios reales SEPA...'
            : sepaStatus.sepa_status === 'error'
            ? '⚠ No se pudo cargar SEPA — usando precios de referencia'
            : '⏳ Cargando precios SEPA...'}
          <span style={{ color: '#b45309', fontStyle: 'italic' }}>
            (los costos mostrados son estimados hasta que termine)
          </span>
        </div>
      )}
      {sepaStatus?.sepa_listo && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, padding: '6px 14px', marginBottom: 12,
          fontSize: '.78rem', color: '#15803d',
        }}>
          ✅ Precios SEPA datos.gob.ar
          {sepaStatus.sepa_mensaje && (
            <span style={{ marginLeft: 6, color: '#166534' }}>
              · {sepaStatus.sepa_mensaje.replace('Precios SEPA: ', '')}
            </span>
          )}
        </div>
      )}

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
          <button
            type="button"
            className={`tab${modo === 'analizador' ? ' activo' : ''}`}
            onClick={() => cambiarModo('analizador')}
          >
            🔬 Analizar dieta
          </button>
          <button
            type="button"
            className={`tab${modo === 'completar' ? ' activo' : ''}`}
            onClick={() => cambiarModo('completar')}
          >
            🧊 ¿Con qué tengo?
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

      {/* Vista completar dieta */}
      {modo === 'completar' && (
        <ConQueTengo
          apiUrl={API_URL}
          onNuevoPlan={() => cambiarModo('individual')}
        />
      )}

      {/* Vistas analizador */}
      {modo === 'analizador' && vista === 'form' && (
        <Analizador
          onAnalizar={calcularAnalisis}
          cargando={cargando}
          error={error}
          apiUrl={API_URL}
        />
      )}
      {modo === 'analizador' && vista === 'resultados' && resultado && (
        <ResultadosAnalisis
          resultado={resultado}
          onNuevoAnalisis={resetear}
          onNuevoPlan={() => cambiarModo('individual')}
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
