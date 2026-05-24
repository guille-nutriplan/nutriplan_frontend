const GRUPOS_ICONOS = {
  Cereales: '🌾', Leguminosas: '🫘', Hortalizas: '🥦',
  Frutas: '🍎', FrutosSecos: '🥜', Lacteos: '🥛',
  Huevos: '🥚', Aceites: '🫙', Azucares: '🍯',
  Pescados: '🐟', Carnes: '🥩', Embutidos: '🌭', Aves: '🍗',
}

function BarraComparacion({ item }) {
  const { nutriente, unidad, aporte, minimo, maximo, pct, estado } = item
  const ancho = Math.min(pct, 150)
  const ref   = 150

  const color = estado === 'bajo' ? '#f59e0b'
              : estado === 'exceso' ? '#3b82f6'
              : '#16a34a'

  const etiqueta = estado === 'bajo'   ? '⚠ Bajo'
                 : estado === 'exceso' ? 'ℹ Excede'
                 : '✓ OK'

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: 3 }}>
        <span style={{ fontWeight: 600 }}>{nutriente}</span>
        <span style={{ color, fontWeight: 700 }}>{etiqueta} · {pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4, background: color,
          width: `${(ancho / ref) * 100}%`,
          transition: 'width .5s ease',
        }} />
      </div>
      <div style={{ fontSize: '.73rem', color: '#6b7280', marginTop: 2 }}>
        Aporte: {aporte} {unidad} · Mínimo OMS: {minimo} {unidad}
        {maximo ? ` · Máx: ${maximo} ${unidad}` : ''}
      </div>
    </div>
  )
}

export default function ResultadosAnalisis({ resultado, onNuevoAnalisis, onNuevoPlan }) {
  const ok    = resultado.comparacion.filter(c => c.estado === 'ok').length
  const bajos = resultado.comparacion.filter(c => c.estado === 'bajo')
  const total = resultado.comparacion.length

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              Análisis nutricional — {resultado.rango_label}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--gris-suave)', marginTop: 2 }}>
              {resultado.n_alimentos} alimentos · {Math.round(resultado.gramos_total)}g total
            </div>
          </div>
          <button className="btn-texto" onClick={onNuevoAnalisis}>← Nuevo análisis</button>
        </div>
      </div>

      {/* Semáforo general */}
      <div style={{
        background: ok === total ? 'var(--verde)' : bajos.length > 3 ? '#ef4444' : '#f59e0b',
        color: 'white', borderRadius: 10, padding: '14px 20px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            {ok === total ? '✅ Dieta completa'
              : bajos.length > 3 ? '⚠ Varios nutrientes deficitarios'
              : '⚠ Algunos nutrientes por revisar'}
          </div>
          <div style={{ fontSize: '.82rem', opacity: .9, marginTop: 2 }}>
            {ok}/{total} nutrientes dentro del rango OMS
          </div>
        </div>
        {bajos.length > 0 && (
          <div>
            <div style={{ fontSize: '.75rem', opacity: .85 }}>Déficits detectados:</div>
            <div style={{ fontWeight: 700 }}>
              {bajos.map(b => b.nutriente).join(' · ')}
            </div>
          </div>
        )}
      </div>

      {/* Detalle por alimento */}
      <div className="card">
        <div className="card-titulo">🥗 Alimentos analizados</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.83rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gris-borde)' }}>
              <th style={{ textAlign: 'left',  padding: '5px 4px', color: 'var(--gris-suave)' }}>Alimento</th>
              <th style={{ textAlign: 'right', padding: '5px 4px', color: 'var(--gris-suave)' }}>g</th>
              <th style={{ textAlign: 'right', padding: '5px 4px', color: 'var(--gris-suave)' }}>kcal</th>
              <th style={{ textAlign: 'right', padding: '5px 4px', color: 'var(--gris-suave)' }}>Prot</th>
              <th style={{ textAlign: 'right', padding: '5px 4px', color: 'var(--gris-suave)' }}>Vit C</th>
              <th style={{ textAlign: 'right', padding: '5px 4px', color: 'var(--gris-suave)' }}>Fe</th>
            </tr>
          </thead>
          <tbody>
            {resultado.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--gris-fondo)',
                background: i % 2 === 0 ? 'white' : 'var(--gris-fondo)' }}>
                <td style={{ padding: '6px 4px' }}>
                  {GRUPOS_ICONOS[item.grupo]} {item.nombre}
                </td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{item.gramos}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}>{item.aporte_cal.toFixed(0)}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{item.aporte_pr.toFixed(1)}g</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{item.aporte_vitc.toFixed(1)}mg</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{item.aporte_fe.toFixed(2)}mg</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--verde-borde)', background: 'var(--verde-fondo)' }}>
              <td style={{ padding: '6px 4px', fontWeight: 700 }}>TOTAL</td>
              <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{Math.round(resultado.gramos_total)}</td>
              <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700, color: 'var(--verde)' }}>
                {resultado.aportes.energia_kcal.toFixed(0)}
              </td>
              <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700, color: 'var(--verde)' }}>
                {resultado.aportes.proteinas_g.toFixed(1)}g
              </td>
              <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700, color: 'var(--verde)' }}>
                {resultado.aportes.vit_c_mg.toFixed(1)}mg
              </td>
              <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700, color: 'var(--verde)' }}>
                {resultado.aportes.hierro_mg.toFixed(2)}mg
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comparación vs OMS */}
      <div className="card">
        <div className="card-titulo">📊 Comparación vs requerimientos OMS</div>
        {resultado.comparacion.map((item, i) => (
          <BarraComparacion key={i} item={item} />
        ))}
      </div>

      {/* Sugerencia si hay déficits */}
      {bajos.length > 0 && (
        <div className="card" style={{ background: 'var(--verde-fondo)', border: '1.5px solid var(--verde-borde)' }}>
          <div className="card-titulo">💡 Sugerencia</div>
          <p style={{ fontSize: '.88rem', color: 'var(--gris-texto)', marginBottom: 12 }}>
            Tu dieta tiene déficit de <strong>{bajos.map(b => b.nutriente).join(', ')}</strong>.
            Podés usar NutriPlan para calcular automáticamente un plan que cubra todos los requerimientos OMS.
          </p>
          <button className="btn-primary" onClick={onNuevoPlan}>
            🔍 Calcular plan nutricional óptimo
          </button>
        </div>
      )}
    </div>
  )
}
