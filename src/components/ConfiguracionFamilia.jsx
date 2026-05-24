import { useState } from 'react'

const GRUPOS_ETARIOS = [
  { grupo: 'Bebés', rangos: [
    { clave: '0-6m',  label: 'Lactante 0–6 meses' },
    { clave: '6-12m', label: 'Lactante 6–12 meses' },
  ]},
  { grupo: 'Niños y Niñas', rangos: [
    { clave: '1-3',  label: 'Niño/a 1–3 años' },
    { clave: '4-6',  label: 'Niño/a 4–6 años' },
    { clave: '7-9',  label: 'Niño/a 7–9 años' },
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

const PROVINCIAS = [
  { codigo: null,   nombre: 'Precios de referencia nacionales' },
  { codigo: 'AR-B', nombre: 'Buenos Aires' },
  { codigo: 'AR-C', nombre: 'CABA' },
  { codigo: 'AR-K', nombre: 'Catamarca' },
  { codigo: 'AR-H', nombre: 'Chaco' },
  { codigo: 'AR-U', nombre: 'Chubut' },
  { codigo: 'AR-X', nombre: 'Córdoba' },
  { codigo: 'AR-W', nombre: 'Corrientes' },
  { codigo: 'AR-E', nombre: 'Entre Ríos' },
  { codigo: 'AR-P', nombre: 'Formosa' },
  { codigo: 'AR-Y', nombre: 'Jujuy' },
  { codigo: 'AR-L', nombre: 'La Pampa' },
  { codigo: 'AR-F', nombre: 'La Rioja' },
  { codigo: 'AR-M', nombre: 'Mendoza' },
  { codigo: 'AR-N', nombre: 'Misiones' },
  { codigo: 'AR-Q', nombre: 'Neuquén' },
  { codigo: 'AR-R', nombre: 'Río Negro' },
  { codigo: 'AR-A', nombre: 'Salta' },
  { codigo: 'AR-J', nombre: 'San Juan' },
  { codigo: 'AR-D', nombre: 'San Luis' },
  { codigo: 'AR-Z', nombre: 'Santa Cruz' },
  { codigo: 'AR-S', nombre: 'Santa Fe' },
  { codigo: 'AR-G', nombre: 'Santiago del Estero' },
  { codigo: 'AR-V', nombre: 'Tierra del Fuego' },
  { codigo: 'AR-T', nombre: 'Tucumán' },
]

const ICONOS_RANGO = {
  '0-6m': '👶', '6-12m': '👶',
  '1-3': '🧒', '4-6': '🧒', '7-9': '🧒',
  '10-13M': '👦', '10-13F': '👧',
  '14-17M': '🧑', '14-17F': '🧑',
  '18-29M': '👨', '18-29F': '👩',
  '30-59M': '🧔', '30-59F': '👩',
  '60+M': '👴', '60+F': '👵',
  'embarazada': '🤰', 'lactante_madre': '🤱',
}

const NOMBRES_SUGERIDOS = ['Papá', 'Mamá', 'Abuelo', 'Abuela', 'Hijo', 'Hija']

function MiembroCard({ miembro, index, onUpdate, onRemove, totalMiembros }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="card" style={{ marginBottom: 10, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>

        {/* Icono */}
        <div style={{ fontSize: '1.8rem', lineHeight: 1, paddingTop: 4 }}>
          {ICONOS_RANGO[miembro.rango_etario] || '👤'}
        </div>

        {/* Datos principales */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Nombre (ej: Papá)"
              value={miembro.nombre}
              onChange={e => onUpdate(index, 'nombre', e.target.value)}
              list={`nombres-${index}`}
            />
            <datalist id={`nombres-${index}`}>
              {NOMBRES_SUGERIDOS.map(n => <option key={n} value={n} />)}
            </datalist>

            <select
              className="form-select"
              style={{ flex: 2 }}
              value={miembro.rango_etario}
              onChange={e => onUpdate(index, 'rango_etario', e.target.value)}
            >
              {GRUPOS_ETARIOS.map(g => (
                <optgroup key={g.grupo} label={g.grupo}>
                  {g.rangos.map(r => (
                    <option key={r.clave} value={r.clave}>{r.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Filtros expandibles */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn-texto"
              style={{ fontSize: '.8rem' }}
              onClick={() => setExpandido(!expandido)}
            >
              {expandido ? '▲ Ocultar filtros' : '▼ Restricciones dietarias'}
            </button>

            {/* Badges de filtros activos */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {miembro.filtros.celiaco    && <span style={badge}>Celíaco</span>}
              {miembro.filtros.sin_lactosa && <span style={badge}>Sin lactosa</span>}
              {miembro.filtros.vegetariano && <span style={badge}>Vegetariano</span>}
              {miembro.filtros.vegano      && <span style={badge}>Vegano</span>}
            </div>
          </div>

          {expandido && (
            <div className="checks-grid" style={{ marginTop: 8 }}>
              {[
                { key: 'celiaco',     label: 'Celíaco/a' },
                { key: 'sin_lactosa', label: 'Sin lactosa' },
                { key: 'vegetariano', label: 'Vegetariano/a' },
                { key: 'vegano',      label: 'Vegano/a' },
              ].map(f => (
                <label
                  key={f.key}
                  className={`check-item${miembro.filtros[f.key] ? ' activo' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={miembro.filtros[f.key]}
                    onChange={e => onUpdate(index, `filtros.${f.key}`, e.target.checked)}
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Botón eliminar */}
        {totalMiembros > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
              background: 'none', border: 'none', color: '#ef4444',
              cursor: 'pointer', fontSize: '1.2rem', padding: '4px',
              lineHeight: 1,
            }}
            title="Quitar miembro"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

const badge = {
  background: '#dcfce7', color: '#15803d', borderRadius: 4,
  padding: '2px 6px', fontSize: '.72rem', fontWeight: 600,
}

export default function ConfiguracionFamilia({ onCalcular, cargando, error }) {
  const [provincia, setProvincia]   = useState(null)
  const [miembros, setMiembros]     = useState([
    { nombre: 'Adulto', rango_etario: '30-59M', filtros: { celiaco: false, sin_lactosa: false, vegetariano: false, vegano: false, alergenos: [] } },
  ])

  function agregarMiembro() {
    if (miembros.length >= 10) return
    setMiembros([...miembros, {
      nombre: '', rango_etario: '30-59M',
      filtros: { celiaco: false, sin_lactosa: false, vegetariano: false, vegano: false, alergenos: [] },
    }])
  }

  function quitarMiembro(idx) {
    setMiembros(miembros.filter((_, i) => i !== idx))
  }

  function actualizarMiembro(idx, campo, valor) {
    const nuevos = [...miembros]
    if (campo.startsWith('filtros.')) {
      const clave = campo.split('.')[1]
      nuevos[idx] = { ...nuevos[idx], filtros: { ...nuevos[idx].filtros, [clave]: valor } }
      // vegano implica vegetariano y sin_lactosa
      if (clave === 'vegano' && valor) {
        nuevos[idx].filtros.vegetariano = true
        nuevos[idx].filtros.sin_lactosa = true
      }
    } else {
      nuevos[idx] = { ...nuevos[idx], [campo]: valor }
    }
    setMiembros(nuevos)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onCalcular({
      provincia_codigo: provincia,
      miembros: miembros.map(m => ({
        nombre: m.nombre || 'Sin nombre',
        rango_etario: m.rango_etario,
        filtros: m.filtros,
      }))
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alerta error">⚠ {error}</div>}

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
        </div>
      </div>

      {/* Miembros */}
      <div className="card">
        <div className="card-titulo">👨‍👩‍👧‍👦 Miembros del hogar</div>

        {miembros.map((m, i) => (
          <MiembroCard
            key={i}
            miembro={m}
            index={i}
            onUpdate={actualizarMiembro}
            onRemove={quitarMiembro}
            totalMiembros={miembros.length}
          />
        ))}

        {miembros.length < 10 && (
          <button
            type="button"
            className="btn-secundario"
            style={{ width: '100%', marginTop: 4 }}
            onClick={agregarMiembro}
          >
            + Agregar miembro
          </button>
        )}
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={cargando}
      >
        {cargando ? '⚙ Calculando…' : `🔍 Calcular plan familiar (${miembros.length} miembro${miembros.length > 1 ? 's' : ''})`}
      </button>

      {cargando && <div className="spinner" />}
    </form>
  )
}
