const GRUPOS_ICONOS = {
  Cereales: '🌾', Leguminosas: '🫘', Hortalizas: '🥦',
  Frutas: '🍎', FrutosSecos: '🥜', Lacteos: '🥛',
  Huevos: '🥚', Aceites: '🫙', Azucares: '🍯',
  Pescados: '🐟', Carnes: '🥩', Embutidos: '🌭', Aves: '🍗',
}

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}

function formatPeso(g) {
  if (g >= 1000) return `${(g / 1000).toFixed(1)} kg`
  return `${Math.round(g)} g`
}

export default function ResultadosFamilia({ resultado, onNuevoCalculo }) {
  const grupos = {}
  for (const al of resultado.lista_compras) {
    if (!grupos[al.grupo]) grupos[al.grupo] = []
    grupos[al.grupo].push(al)
  }

  const totalGramos = resultado.lista_compras.reduce((s, a) => s + a.gramos_total, 0)

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              Plan familiar — {resultado.n_miembros} miembro{resultado.n_miembros > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--gris-suave)', marginTop: 2 }}>
              📍 {resultado.provincia} · {resultado.lista_compras.length} alimentos · {formatPeso(totalGramos)} totales/día
            </div>
          </div>
          <button className="btn-texto" onClick={onNuevoCalculo}>← Nueva consulta</button>
        </div>
      </div>

      {/* Banner de costos */}
      <div className="costo-banner">
        <div className="costo-item">
          <div className="costo-label">Costo diario familiar</div>
          <div className="costo-valor">{formatARS(resultado.costo_diario_total)}</div>
        </div>
        <div className="costo-item">
          <div className="costo-label">Costo mensual familiar</div>
          <div className="costo-valor">{formatARS(resultado.costo_mensual_total)}</div>
        </div>
        <div className="costo-item">
          <div className="costo-label">Costo por persona/día</div>
          <div className="costo-valor">{formatARS(resultado.costo_diario_total / resultado.n_miembros)}</div>
        </div>
      </div>

      {/* Resumen por miembro */}
      <div className="card">
        <div className="card-titulo">👥 Resumen por miembro</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gris-borde)' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--gris-suave)' }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--gris-suave)' }}>Perfil</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>kcal</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>Costo/día</th>
            </tr>
          </thead>
          <tbody>
            {resultado.miembros.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--gris-fondo)' }}>
                <td style={{ padding: '8px 4px', fontWeight: 600 }}>
                  {m.exito ? '✅' : '⚠'} {m.nombre}
                </td>
                <td style={{ padding: '8px 4px', color: 'var(--gris-suave)', fontSize: '.8rem' }}>
                  {m.rango_label}
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                  {m.exito ? Math.round(m.energia_kcal) : '—'}
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700, color: 'var(--verde)' }}>
                  {m.exito ? formatARS(m.costo_diario) : '—'}
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--verde-borde)', background: 'var(--verde-fondo)' }}>
              <td colSpan={3} style={{ padding: '8px 4px', fontWeight: 700 }}>Total familiar</td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 800, color: 'var(--verde)', fontSize: '1rem' }}>
                {formatARS(resultado.costo_diario_total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Lista de compras consolidada */}
      <div className="card">
        <div className="card-titulo">🛒 Lista de compras consolidada</div>
        <p style={{ fontSize: '.8rem', color: 'var(--gris-suave)', marginBottom: 12 }}>
          Cantidades sumadas para todos los miembros del hogar · {resultado.lista_compras.length} productos
        </p>

        {Object.entries(grupos).map(([grupo, alimentos]) => (
          <div key={grupo}>
            <div className="grupo-titulo">
              {GRUPOS_ICONOS[grupo] || '•'} {grupo}
            </div>
            {alimentos.map((al, i) => (
              <div key={i} className="alimento-fila">
                <span className="alimento-nombre">{al.nombre}</span>
                <span className="alimento-gramos">{formatPeso(al.gramos_total)}</span>
                <span className="alimento-costo">{formatARS(al.costo_total)}</span>
              </div>
            ))}
          </div>
        ))}

        <div style={{
          marginTop: 16, paddingTop: 12, borderTop: '2px solid var(--verde-borde)',
          display: 'flex', justifyContent: 'space-between', fontWeight: 700,
        }}>
          <span>Total</span>
          <span style={{ color: 'var(--verde)' }}>{formatARS(resultado.costo_diario_total)}</span>
        </div>
      </div>

      {resultado.miembros.some(m => !m.exito) && (
        <div className="alerta aviso">
          ⚠ Algunos miembros no pudieron calcularse correctamente.
          Revisá las restricciones dietarias o el rango etario seleccionado.
        </div>
      )}
    </div>
  )
}
