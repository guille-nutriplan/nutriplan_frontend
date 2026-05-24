import { useState, useEffect, useRef } from 'react'

const GRUPOS_ETARIOS = [
  { grupo: 'Niños y Niñas', rangos: [
    { clave: '1-3', label: 'Niño/a 1–3 años' },
    { clave: '4-6', label: 'Niño/a 4–6 años' },
    { clave: '7-9', label: 'Niño/a 7–9 años' },
  ]},
  { grupo: 'Adolescentes', rangos: [
    { clave: '10-13M', label: 'Varón 10–13 años' },
    { clave: '10-13F', label: 'Mujer 10–13 años' },
    { clave: '14-17M', label: 'Varón 14–17 años' },
    { clave: '14-17F', label: 'Mujer 14–17 años' },
  ]},
  { grupo: 'Adultos', rangos: [
    { clave: '18-29M', label: 'Varón 18–29 años' },
    { clave: '18-29F', label: 'Mujer 18–29 años' },
    { clave: '30-59M', label: 'Varón 30–59 años' },
    { clave: '30-59F', label: 'Mujer 30–59 años' },
  ]},
  { grupo: 'Adultos Mayores', rangos: [
    { clave: '60+M', label: 'Varón 60+ años' },
    { clave: '60+F', label: 'Mujer 60+ años' },
  ]},
  { grupo: 'Situaciones especiales', rangos: [
    { clave: 'embarazada',     label: 'Mujer embarazada' },
    { clave: 'lactante_madre', label: 'Mujer en lactancia' },
  ]},
]

const GRUPOS_ICONOS = {
  Cereales: '🌾', Leguminosas: '🫘', Hortalizas: '🥦',
  Frutas: '🍎', FrutosSecos: '🥜', Lacteos: '🥛',
  Huevos: '🥚', Aceites: '🫙', Azucares: '🍯',
  Pescados: '🐟', Carnes: '🥩', Embutidos: '🌭', Aves: '🍗',
}

// Búsqueda con debounce
function useBusqueda(apiUrl, query) {
  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setResultados([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setCargando(true)
      try {
        const resp = await fetch(`${apiUrl}/api/alimentos?q=${encodeURIComponent(query)}`)
        const data = await resp.json()
        setResultados(data.alimentos || [])
      } catch { setResultados([]) }
      finally { setCargando(false) }
    }, 300)
    return () => clearTimeout(timer.current)
  }, [query, apiUrl])

  return { resultados, cargando }
}

export default function Analizador({ onAnalizar, cargando, error, apiUrl }) {
  const [rangoEtario, setRangoEtario] = useState('30-59M')
  const [alimentos,   setAlimentos]   = useState([])
  const [busqueda,    setBusqueda]    = useState('')
  const [gramos,      setGramos]      = useState('')
  const [mostrarDrop, setMostrarDrop] = useState(false)
  const [seleccion,   setSeleccion]   = useState(null)
  const inputRef = useRef(null)

  const { resultados, cargando: buscando } = useBusqueda(apiUrl, busqueda)

  function seleccionarAlimento(alim) {
    setSeleccion(alim)
    setBusqueda(alim.nombre_completo)
    setMostrarDrop(false)
    setTimeout(() => document.getElementById('input-gramos')?.focus(), 50)
  }

  function agregarAlimento() {
    if (!seleccion || !gramos || parseFloat(gramos) <= 0) return
    setAlimentos(prev => [...prev, {
      nombre:          seleccion.nombre,
      nombre_completo: seleccion.nombre_completo,
      grupo:           seleccion.grupo,
      gramos:          parseFloat(gramos),
    }])
    setBusqueda(''); setGramos(''); setSeleccion(null)
    inputRef.current?.focus()
  }

  function quitarAlimento(idx) {
    setAlimentos(prev => prev.filter((_, i) => i !== idx))
  }

  function actualizarGramos(idx, val) {
    setAlimentos(prev => prev.map((a, i) =>
      i === idx ? { ...a, gramos: parseFloat(val) || a.gramos } : a
    ))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (alimentos.length === 0) return
    onAnalizar({
      rango_etario: rangoEtario,
      alimentos: alimentos.map(a => ({ nombre: a.nombre, gramos: a.gramos })),
    })
  }

  const totalGramos = alimentos.reduce((s, a) => s + a.gramos, 0)

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alerta error">⚠ {error}</div>}

      {/* Rango etario */}
      <div className="card">
        <div className="card-titulo">👤 Perfil de referencia OMS</div>
        <div className="form-grupo">
          <label className="form-label">Grupo etario</label>
          <select className="form-select" value={rangoEtario}
            onChange={e => setRangoEtario(e.target.value)}>
            {GRUPOS_ETARIOS.map(g => (
              <optgroup key={g.grupo} label={g.grupo}>
                {g.rangos.map(r => (
                  <option key={r.clave} value={r.clave}>{r.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Buscador de alimentos */}
      <div className="card">
        <div className="card-titulo">🔍 Agregar alimentos</div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Búsqueda */}
          <div style={{ flex: 2, minWidth: 180, position: 'relative' }}>
            <label className="form-label">Alimento</label>
            <input
              ref={inputRef}
              className="form-input"
              placeholder="Ej: arroz, pollo, manzana..."
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setSeleccion(null); setMostrarDrop(true) }}
              onFocus={() => busqueda.length >= 2 && setMostrarDrop(true)}
              autoComplete="off"
            />
            {/* Dropdown */}
            {mostrarDrop && (resultados.length > 0 || buscando) && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'white', border: '1.5px solid var(--gris-borde)',
                borderRadius: 8, maxHeight: 220, overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,.1)',
              }}>
                {buscando && (
                  <div style={{ padding: '8px 12px', color: 'var(--gris-suave)', fontSize: '.85rem' }}>
                    Buscando...
                  </div>
                )}
                {resultados.map((a, i) => (
                  <div key={i}
                    style={{
                      padding: '8px 12px', cursor: 'pointer', fontSize: '.88rem',
                      borderBottom: '1px solid var(--gris-fondo)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                    onMouseDown={() => seleccionarAlimento(a)}
                    onTouchStart={() => seleccionarAlimento(a)}
                  >
                    <span>{a.nombre_completo}</span>
                    <span style={{ fontSize: '.75rem', color: 'var(--verde)' }}>
                      {GRUPOS_ICONOS[a.grupo]} {a.cal_100g} kcal/100g
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gramos */}
          <div style={{ flex: 1, minWidth: 90 }}>
            <label className="form-label">Gramos</label>
            <input
              id="input-gramos"
              className="form-input"
              type="number"
              min="1"
              max="2000"
              placeholder="100"
              value={gramos}
              onChange={e => setGramos(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregarAlimento())}
            />
          </div>

          {/* Botón agregar */}
          <button
            type="button"
            className="btn-primary"
            style={{ flex: 'none', padding: '10px 16px', marginBottom: 0 }}
            onClick={agregarAlimento}
            disabled={!seleccion || !gramos}
          >
            + Agregar
          </button>
        </div>

        {/* Lista de alimentos cargados */}
        {alimentos.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--verde)',
              marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Alimentos ingresados ({alimentos.length}) — {Math.round(totalGramos)}g total
            </div>
            {alimentos.map((a, i) => (
              <div key={i} className="alimento-fila">
                <span style={{ fontSize: '.8rem', color: 'var(--verde)' }}>
                  {GRUPOS_ICONOS[a.grupo]}
                </span>
                <span className="alimento-nombre" style={{ fontSize: '.9rem' }}>
                  {a.nombre_completo || a.nombre}
                </span>
                <input
                  type="number"
                  min="1"
                  value={a.gramos}
                  onChange={e => actualizarGramos(i, e.target.value)}
                  style={{
                    width: 64, textAlign: 'right', border: '1px solid var(--gris-borde)',
                    borderRadius: 6, padding: '3px 6px', fontSize: '.85rem',
                  }}
                />
                <span style={{ color: 'var(--gris-suave)', fontSize: '.82rem' }}>g</span>
                <button type="button" onClick={() => quitarAlimento(i)}
                  style={{ background: 'none', border: 'none', color: '#ef4444',
                    cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary"
        disabled={cargando || alimentos.length === 0}>
        {cargando ? '⚙ Analizando...' : `📊 Analizar perfil nutricional (${alimentos.length} alimentos)`}
      </button>
      {cargando && <div className="spinner" />}
    </form>
  )
}
