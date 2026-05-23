const GRUPOS_ICONOS = {
  Cereales:    '🌾',
  Leguminosas: '🫘',
  Hortalizas:  '🥦',
  Frutas:      '🍎',
  FrutosSecos: '🥜',
  Lacteos:     '🥛',
  Huevos:      '🥚',
  Aceites:     '🫙',
  Azucares:    '🍯',
  Pescados:    '🐟',
  Carnes:      '🥩',
  Embutidos:   '🌭',
  Aves:        '🍗',
}

function formatPeso(g) {
  if (g >= 1000) return `${(g / 1000).toFixed(1)} kg`
  return `${Math.round(g)} g`
}

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}

export default function Resultados({ resultado, onVerDetalle, onNuevoCalculo }) {
  // Agrupar alimentos por grupo
  const grupos = {}
  for (const al of resultado.alimentos) {
    if (!grupos[al.grupo]) grupos[al.grupo] = []
    grupos[al.grupo].push(al)
  }

  const totalGramos = resultado.alimentos.reduce((s, a) => s + a.gramos, 0)

  return (
    <div>
      {/* Encabezado del resultado */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{resultado.rango_label}</div>
            <div style={{ fontSize: '.85rem', color: 'var(--gris-suave)', marginTop: 2 }}>
              📍 {resultado.provincia} · {resultado.alimentos.length} alimentos · {formatPeso(totalGramos)} totales
            </div>
          </div>
          <button className="btn-texto" onClick={onNuevoCalculo}>← Nuevo cálculo</button>
        </div>
      </div>

      {/* Banner de costos */}
      <div className="costo-banner">
        <div className="costo-item">
          <div className="costo-label">Costo diario estimado</div>
          <div className="costo-valor">{formatARS(resultado.costo_diario)}</div>
        </div>
        <div className="costo-item">
          <div className="costo-label">Costo mensual estimado</div>
          <div className="costo-valor">{formatARS(resultado.costo_mensual)}</div>
        </div>
        <div className="costo-item">
          <div className="costo-label">Fuente de precios</div>
          <div style={{ fontSize: '.85rem', fontWeight: 600 }}>
            {resultado.fuente_precios === 'SEPA' ? '🟢 SEPA' : '⚪ Referencia'}
          </div>
        </div>
      </div>

      {/* Lista de alimentos por grupo */}
      <div className="card">
        <div className="card-titulo">🛒 Lista de alimentos</div>

        {Object.entries(grupos).map(([grupo, alimentos]) => (
          <div key={grupo}>
            <div className="grupo-titulo">
              {GRUPOS_ICONOS[grupo] || '•'} {grupo}
            </div>
            {alimentos.map((al, i) => (
              <div key={i} className="alimento-fila">
                <span className="alimento-nombre">{al.nombre}</span>
                <span className="alimento-gramos">{formatPeso(al.gramos)}</span>
                <span className="alimento-costo">{formatARS(al.costo_ars)}</span>
              </div>
            ))}
          </div>
        ))}

        <div style={{
          marginTop: 16, paddingTop: 12, borderTop: '2px solid var(--verde-borde)',
          display: 'flex', justifyContent: 'space-between', fontWeight: 700,
        }}>
          <span>Total</span>
          <span style={{ color: 'var(--verde)' }}>{formatARS(resultado.costo_diario)}</span>
        </div>
      </div>

      {/* Resumen rápido de macros */}
      <div className="card">
        <div className="card-titulo">⚡ Macronutrientes</div>
        <div className="macro-grid">
          {[
            { label: 'Energía',       valor: Math.round(resultado.aportes.energia_kcal), unit: 'kcal' },
            { label: 'Proteínas',     valor: Math.round(resultado.aportes.proteinas_g),  unit: 'g' },
            { label: 'Grasas',        valor: Math.round(resultado.aportes.grasas_g),     unit: 'g' },
            { label: 'Carbohidratos', valor: Math.round(resultado.aportes.hc_g),         unit: 'g' },
            { label: 'Fibra*',        valor: resultado.aportes.fibra_g?.toFixed(1) ?? '—', unit: 'g' },
            { label: 'Peso total',    valor: Math.round(resultado.aportes.gramos_total ?? 0), unit: 'g' },
          ].map(m => (
            <div key={m.label} className="macro-item">
              <div className="macro-valor">{m.valor}<small style={{ fontSize: '.65rem' }}>{m.unit}</small></div>
              <div className="macro-label">{m.label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '.72rem', color: 'var(--gris-suave)', marginTop: 10 }}>
          * Fibra estimada según grupo alimentario — no proviene de la tabla nutricional original.
        </p>
      </div>

      {/* CTA detalle */}
      <button className="btn-primary" onClick={onVerDetalle} style={{ marginBottom: 8 }}>
        📊 Ver detalle nutricional completo
      </button>

      <div style={{ fontSize: '.78rem', color: 'var(--gris-suave)', textAlign: 'center', marginBottom: 16 }}>
        Incluye vitaminas, minerales y comparación con requerimientos OMS
      </div>
    </div>
  )
}
