import { useState, useEffect } from 'react'

const GRUPOS_ETARIOS = [
  { grupo: 'Bebés',              rangos: [
    { clave: '0-6m',   label: 'Lactante 0–6 meses' },
    { clave: '6-12m',  label: 'Lactante 6–12 meses' },
  ]},
  { grupo: 'Niños y Niñas',     rangos: [
    { clave: '1-3',    label: 'Niño/a 1–3 años' },
    { clave: '4-6',    label: 'Niño/a 4–6 años' },
    { clave: '7-9',    label: 'Niño/a 7–9 años' },
  ]},
  { grupo: 'Adolescentes',      rangos: [
    { clave: '10-13M', label: 'Varón 10–13 años' },
    { clave: '10-13F', label: 'Mujer 10–13 años' },
    { clave: '14-17M', label: 'Varón 14–17 años' },
    { clave: '14-17F', label: 'Mujer 14–17 años' },
  ]},
  { grupo: 'Adultos',           rangos: [
    { clave: '18-29M', label: 'Varón 18–29 años' },
    { clave: '18-29F', label: 'Mujer 18–29 años' },
    { clave: '30-59M', label: 'Varón 30–59 años' },
    { clave: '30-59F', label: 'Mujer 30–59 años' },
  ]},
  { grupo: 'Adultos Mayores',   rangos: [
    { clave: '60+M',   label: 'Varón 60+ años' },
    { clave: '60+F',   label: 'Mujer 60+ años' },
  ]},
  { grupo: 'Situaciones especiales', rangos: [
    { clave: 'embarazada',     label: 'Mujer embarazada' },
    { clave: 'lactante_madre', label: 'Mujer en lactancia' },
  ]},
]

const PROVINCIAS = [
  { codigo: null,    nombre: 'Precios de referencia nacionales' },
  { codigo: 'AR-B',  nombre: 'Buenos Aires' },
  { codigo: 'AR-C',  nombre: 'CABA' },
  { codigo: 'AR-K',  nombre: 'Catamarca' },
  { codigo: 'AR-H',  nombre: 'Chaco' },
  { codigo: 'AR-U',  nombre: 'Chubut' },
  { codigo: 'AR-X',  nombre: 'Córdoba' },
  { codigo: 'AR-W',  nombre: 'Corrientes' },
  { codigo: 'AR-E',  nombre: 'Entre Ríos' },
  { codigo: 'AR-P',  nombre: 'Formosa' },
  { codigo: 'AR-Y',  nombre: 'Jujuy' },
  { codigo: 'AR-L',  nombre: 'La Pampa' },
  { codigo: 'AR-F',  nombre: 'La Rioja' },
  { codigo: 'AR-M',  nombre: 'Mendoza' },
  { codigo: 'AR-N',  nombre: 'Misiones' },
  { codigo: 'AR-Q',  nombre: 'Neuquén' },
  { codigo: 'AR-R',  nombre: 'Río Negro' },
  { codigo: 'AR-A',  nombre: 'Salta' },
  { codigo: 'AR-J',  nombre: 'San Juan' },
  { codigo: 'AR-D',  nombre: 'San Luis' },
  { codigo: 'AR-Z',  nombre: 'Santa Cruz' },
  { codigo: 'AR-S',  nombre: 'Santa Fe' },
  { codigo: 'AR-G',  nombre: 'Santiago del Estero' },
  { codigo: 'AR-V',  nombre: 'Tierra del Fuego' },
  { codigo: 'AR-T',  nombre: 'Tucumán' },
]

export default function Configuracion({ onCalcular, cargando, error }) {
  const [provincia, setProvincia]       = useState(null)
  const [rangoEtario, setRangoEtario]   = useState('30-59M')
  const [celiaco, setCeliaco]           = useState(false)
  const [sinLactosa, setSinLactosa]     = useState(false)
  const [vegetariano, setVegetariano]   = useState(false)
  const [vegano, setVegano]             = useState(false)

  // vegano implica vegetariano y sin lactosa
  useEffect(() => {
    if (vegano) { setVegetariano(true); setSinLactosa(true) }
  }, [vegano])

  function handleSubmit(e) {
    e.preventDefault()
    onCalcular({
      provincia_codigo: provincia,
      rango_etario: rangoEtario,
      filtros: {
        celiaco,
        sin_lactosa: sinLactosa,
        vegetariano,
        vegano,
        alergenos: [],
      },
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alerta error">
          ⚠ {error}
        </div>
      )}

      {/* Provincia */}
      <div className="card">
        <div className="card-titulo">📍 Ubicación</div>
        <div className="form-grupo">
          <label className="form-label">Provincia</label>
          <select
            className="form-select"
            value={provincia ?? ''}
            onChange={e => setProvincia(e.target.value === '' ? null : e.target.value)}
          >
            {PROVINCIAS.map(p => (
              <option key={p.codigo ?? 'nacional'} value={p.codigo ?? ''}>
                {p.nombre}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '.78rem', color: 'var(--gris-suave)', marginTop: 6 }}>
            Los precios locales se obtienen de la base SEPA (datos.gob.ar, actualización diaria).
          </p>
        </div>
      </div>

      {/* Rango etario */}
      <div className="card">
        <div className="card-titulo">👤 Perfil nutricional</div>
        <div className="form-grupo">
          <label className="form-label">Grupo etario</label>
          <select
            className="form-select"
            value={rangoEtario}
            onChange={e => setRangoEtario(e.target.value)}
          >
            {GRUPOS_ETARIOS.map(g => (
              <optgroup key={g.grupo} label={g.grupo}>
                {g.rangos.map(r => (
                  <option key={r.clave} value={r.clave}>{r.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <p style={{ fontSize: '.78rem', color: 'var(--gris-suave)', marginTop: 6 }}>
            Requerimientos diarios según OMS/FAO/UNU 2004.
          </p>
        </div>
      </div>

      {/* Filtros dietarios */}
      <div className="card">
        <div className="card-titulo">🥦 Restricciones dietarias</div>
        <div className="checks-grid">
          {[
            { label: 'Celíaco/a',       val: celiaco,     set: setCeliaco },
            { label: 'Sin lactosa',     val: sinLactosa,  set: setSinLactosa, disabled: vegano },
            { label: 'Vegetariano/a',   val: vegetariano, set: setVegetariano, disabled: vegano },
            { label: 'Vegano/a',        val: vegano,      set: setVegano },
          ].map(({ label, val, set, disabled }) => (
            <label
              key={label}
              className={`check-item${val ? ' activo' : ''}${disabled ? ' deshabilitado' : ''}`}
              style={disabled ? { opacity: .5, pointerEvents: 'none' } : {}}
            >
              <input
                type="checkbox"
                checked={val}
                onChange={e => set(e.target.checked)}
                disabled={disabled}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={cargando}
      >
        {cargando ? '⚙ Calculando…' : '🔍 Calcular plan nutricional'}
      </button>

      {cargando && <div className="spinner" />}
    </form>
  )
}
