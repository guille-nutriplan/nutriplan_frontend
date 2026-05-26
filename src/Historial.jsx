import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const STORAGE_KEY = 'nutriplan_historial_v1'

export function cargarHistorial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export function guardarEnHistorial(resultado) {
  const historial = cargarHistorial()
  const nuevo = {
    id:            Date.now(),
    fecha:         new Date().toISOString(),
    fecha_display: new Date().toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    }),
    rango_label:   resultado.rango_label,
    provincia:     resultado.provincia || 'Nacional',
    costo_diario:  Math.round(resultado.costo_diario),
    costo_mensual: Math.round(resultado.costo_mensual),
    fuente_precios:resultado.fuente_precios || 'referencia',
    energia_kcal:  Math.round(resultado.aportes?.energia_kcal || 0),
    n_alimentos:   resultado.alimentos?.length || 0,
  }
  historial.push(nuevo)
  // Máximo 60 registros (5 años de datos mensuales)
  if (historial.length > 60) historial.splice(0, historial.length - 60)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historial))
  return nuevo
}

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}

// Tooltip personalizado para el gráfico
function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb',
      borderRadius: 8, padding: '10px 14px', fontSize: '.82rem',
      boxShadow: '0 2px 8px rgba(0,0,0,.1)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {formatARS(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function Historial() {
  const [historial, setHistorial] = useState([])
  const [filtroRango, setFiltroRango] = useState('todos')

  useEffect(() => {
    setHistorial(cargarHistorial())
  }, [])

  function eliminar(id) {
    const nuevo = historial.filter(h => h.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevo))
    setHistorial(nuevo)
  }

  function limpiarTodo() {
    if (!confirm('¿Eliminar todo el historial?')) return
    localStorage.removeItem(STORAGE_KEY)
    setHistorial([])
  }

  // Filtrar por rango etario
  const rangos = ['todos', ...new Set(historial.map(h => h.rango_label))]
  const datos  = historial
    .filter(h => filtroRango === 'todos' || h.rango_label === filtroRango)
    .sort((a, b) => a.id - b.id)

  // Variación porcentual desde el primer registro
  const variacion = datos.length >= 2
    ? ((datos[datos.length-1].costo_mensual - datos[0].costo_mensual) / datos[0].costo_mensual * 100)
    : null

  if (historial.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📈</div>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8 }}>
          Sin historial todavía
        </div>
        <div style={{ fontSize: '.88rem', color: 'var(--gris-suave)', maxWidth: 320, margin: '0 auto' }}>
          Calculá un plan nutricional y guardalo con el botón
          <strong> "💾 Guardar en historial"</strong> para empezar a
          registrar la evolución del costo de tu canasta.
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Resumen */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 140, padding: '12px 16px' }}>
          <div style={{ fontSize: '.75rem', color: 'var(--gris-suave)', textTransform: 'uppercase' }}>
            Registros
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--verde)' }}>
            {historial.length}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 140, padding: '12px 16px' }}>
          <div style={{ fontSize: '.75rem', color: 'var(--gris-suave)', textTransform: 'uppercase' }}>
            Último costo/mes
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--verde)' }}>
            {formatARS(datos[datos.length-1]?.costo_mensual || 0)}
          </div>
        </div>
        {variacion !== null && (
          <div className="card" style={{ flex: 1, minWidth: 140, padding: '12px 16px' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--gris-suave)', textTransform: 'uppercase' }}>
              Variación total
            </div>
            <div style={{
              fontWeight: 800, fontSize: '1.1rem',
              color: variacion > 0 ? '#ef4444' : '#16a34a',
            }}>
              {variacion > 0 ? '+' : ''}{variacion.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Filtro */}
      {rangos.length > 2 && (
        <div style={{ marginBottom: 10 }}>
          <select className="form-select" value={filtroRango}
            onChange={e => setFiltroRango(e.target.value)}>
            {rangos.map(r => (
              <option key={r} value={r}>{r === 'todos' ? 'Todos los perfiles' : r}</option>
            ))}
          </select>
        </div>
      )}

      {/* Gráfico */}
      {datos.length >= 2 && (
        <div className="card">
          <div className="card-titulo">📈 Evolución del costo de la canasta</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={datos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="fecha_display" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip content={<TooltipPersonalizado />} />
              <Legend />
              <Line
                type="monotone" dataKey="costo_mensual"
                name="Costo mensual" stroke="#16a34a"
                strokeWidth={2.5} dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone" dataKey="costo_diario"
                name="Costo diario" stroke="#3b82f6"
                strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        <div className="card-titulo">🗂 Registros guardados</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gris-borde)' }}>
                <th style={{ textAlign: 'left',  padding: '6px 4px', color: 'var(--gris-suave)' }}>Fecha</th>
                <th style={{ textAlign: 'left',  padding: '6px 4px', color: 'var(--gris-suave)' }}>Perfil</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>$/día</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>$/mes</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>Precios</th>
                <th style={{ padding: '6px 4px' }}></th>
              </tr>
            </thead>
            <tbody>
              {[...datos].reverse().map((h, i) => {
                const prev = datos[datos.indexOf(h) - 1]
                const var_mes = prev
                  ? ((h.costo_mensual - prev.costo_mensual) / prev.costo_mensual * 100)
                  : null
                return (
                  <tr key={h.id} style={{
                    borderBottom: '1px solid var(--gris-fondo)',
                    background: i % 2 === 0 ? 'white' : 'var(--gris-fondo)',
                  }}>
                    <td style={{ padding: '7px 4px', fontWeight: 600 }}>{h.fecha_display}</td>
                    <td style={{ padding: '7px 4px', color: 'var(--gris-suave)', fontSize: '.78rem' }}>
                      {h.rango_label}
                    </td>
                    <td style={{ padding: '7px 4px', textAlign: 'right' }}>
                      {formatARS(h.costo_diario)}
                    </td>
                    <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: 700, color: 'var(--verde)' }}>
                      {formatARS(h.costo_mensual)}
                      {var_mes !== null && (
                        <span style={{
                          fontSize: '.72rem', marginLeft: 4,
                          color: var_mes > 0 ? '#ef4444' : '#16a34a',
                        }}>
                          ({var_mes > 0 ? '+' : ''}{var_mes.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: '.75rem',
                      color: h.fuente_precios === 'SEPA' ? 'var(--verde)' : 'var(--gris-suave)' }}>
                      {h.fuente_precios === 'SEPA' ? '✓ SEPA' : 'ref.'}
                    </td>
                    <td style={{ padding: '7px 4px', textAlign: 'center' }}>
                      <button onClick={() => eliminar(h.id)}
                        style={{ background: 'none', border: 'none',
                          color: '#d1d5db', cursor: 'pointer', fontSize: '.85rem' }}>
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {historial.length > 0 && (
          <button className="btn-texto" onClick={limpiarTodo}
            style={{ marginTop: 12, color: '#ef4444', fontSize: '.78rem' }}>
            🗑 Limpiar todo el historial
          </button>
        )}
      </div>
    </div>
  )
}
