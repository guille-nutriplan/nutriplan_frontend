import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Definición de nutrientes con sus unidades y rangos
const NUTRIENTES = [
  { key: 'energia_kcal', label: 'Energía',     unit: 'kcal', reqKey: 'energia_min',   maxKey: 'energia_max' },
  { key: 'proteinas_g',  label: 'Proteínas',   unit: 'g',    reqKey: 'proteinas_min' },
  { key: 'grasas_g',     label: 'Grasas',      unit: 'g',    reqKey: 'grasas_min',    maxKey: 'grasas_max' },
  { key: 'hc_g',         label: 'Carbohidratos', unit: 'g',  reqKey: 'hc_min' },
  { key: 'calcio_mg',    label: 'Calcio',       unit: 'mg',  reqKey: 'calc_min' },
  { key: 'hierro_mg',    label: 'Hierro',       unit: 'mg',  reqKey: 'hierro_min' },
  { key: 'vit_a_ui',     label: 'Vitamina A',   unit: 'UI',  reqKey: 'vit_a_min_ui' },
  { key: 'vit_c_mg',     label: 'Vitamina C',   unit: 'mg',  reqKey: 'vit_c_min' },
  { key: 'vit_b1_mg',    label: 'Vitamina B1',  unit: 'mg',  reqKey: 'vit_b1_min' },
  { key: 'vit_b2_mg',    label: 'Vitamina B2',  unit: 'mg',  reqKey: 'vit_b2_min' },
]

const COLORES_PIE = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444']

function formatNum(n, decimales = 0) {
  return n.toFixed(decimales).replace('.', ',')
}

function claseEstado(pct) {
  if (pct < 90)  return 'bajo'
  if (pct > 150) return 'exceso'
  return 'ok'
}

function etiquetaEstado(pct) {
  if (pct < 90)  return '⚠ Bajo'
  if (pct > 150) return 'ℹ Excede'
  return '✓ OK'
}

function BarraNutriente({ nutriente, aporte, req, maxReq }) {
  const pct = req > 0 ? (aporte / req) * 100 : 100
  const estado = claseEstado(pct)
  // La barra se llena hasta 100% (mínimo), el exceso no alarga la barra
  const anchoVisual = Math.min(pct, 150)
  const anchoMax = 150  // referencia visual del 150%

  return (
    <div className="nutriente-row">
      <div className="nutriente-header">
        <span className="nutriente-nombre">{nutriente.label}</span>
        <span className={`nutriente-pct ${estado}`}>
          {etiquetaEstado(pct)} · {Math.round(pct)}%
        </span>
      </div>
      <div className="barra-fondo">
        <div
          className={`barra-relleno ${estado}`}
          style={{ width: `${(anchoVisual / anchoMax) * 100}%` }}
        />
      </div>
      <div className="nutriente-detalle">
        Aporte: {formatNum(aporte, nutriente.unit === 'mg' || nutriente.unit === 'g' ? 1 : 0)} {nutriente.unit}
        {' · '}
        Mínimo OMS: {formatNum(req, 0)} {nutriente.unit}
        {maxReq ? ` · Máximo: ${formatNum(maxReq, 0)} ${nutriente.unit}` : ''}
      </div>
    </div>
  )
}

export default function DetalleNutricional({ resultado, onVolver }) {
  const { aportes, req_oms } = resultado

  // Datos para el gráfico de torta (distribución calórica)
  const cal_proteinas = aportes.proteinas_g * 4
  const cal_grasas    = aportes.grasas_g * 9
  const cal_hc        = aportes.hc_g * 4

  const dataTorta = [
    { name: 'Proteínas',     value: Math.round(cal_proteinas), pct: Math.round(cal_proteinas / aportes.energia_kcal * 100) },
    { name: 'Carbohidratos', value: Math.round(cal_hc),        pct: Math.round(cal_hc / aportes.energia_kcal * 100) },
    { name: 'Grasas',        value: Math.round(cal_grasas),    pct: Math.round(cal_grasas / aportes.energia_kcal * 100) },
  ]

  // Agrupar nutrientes: macros primero, luego micronutrientes
  const macros  = NUTRIENTES.slice(0, 4)
  const micros  = NUTRIENTES.slice(4)

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Detalle nutricional</div>
            <div style={{ fontSize: '.85rem', color: 'var(--gris-suave)', marginTop: 2 }}>
              {resultado.rango_label} · {resultado.provincia}
            </div>
          </div>
          <button className="btn-secundario" onClick={onVolver}>← Volver</button>
        </div>
      </div>

      {/* Distribución calórica — torta */}
      <div className="card">
        <div className="card-titulo">🍕 Distribución calórica</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dataTorta}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {dataTorta.map((_, i) => (
                  <Cell key={i} fill={COLORES_PIE[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} kcal (${props.payload.pct}%)`, name
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="macro-grid" style={{ marginTop: 8 }}>
          {dataTorta.map((m, i) => (
            <div key={m.name} className="macro-item" style={{ borderColor: COLORES_PIE[i] + '44' }}>
              <div className="macro-valor" style={{ color: COLORES_PIE[i] }}>{m.pct}%</div>
              <div className="macro-label">{m.name}</div>
            </div>
          ))}
          <div className="macro-item">
            <div className="macro-valor">{Math.round(aportes.energia_kcal)}</div>
            <div className="macro-label">Total kcal</div>
          </div>
        </div>
      </div>

      {/* Macronutrientes */}
      <div className="card">
        <div className="card-titulo">⚡ Macronutrientes vs OMS</div>
        {macros.map(n => (
          <BarraNutriente
            key={n.key}
            nutriente={n}
            aporte={aportes[n.key]}
            req={req_oms[n.reqKey]}
            maxReq={n.maxKey ? req_oms[n.maxKey] : null}
          />
        ))}
      </div>

      {/* Micronutrientes */}
      <div className="card">
        <div className="card-titulo">🔬 Micronutrientes vs OMS</div>
        {micros.map(n => (
          <BarraNutriente
            key={n.key}
            nutriente={n}
            aporte={aportes[n.key]}
            req={req_oms[n.reqKey]}
            maxReq={n.maxKey ? req_oms[n.maxKey] : null}
          />
        ))}

        <div className="alerta aviso" style={{ marginTop: 16 }}>
          ⚠ Los valores de micronutrientes dependen de la completitud de la tabla nutricional.
          Los nutrientes sin dato en la tabla no se incluyen en la optimización.
        </div>
      </div>

      {/* Referencia OMS */}
      <div className="card">
        <div className="card-titulo">📋 Referencia OMS — {resultado.rango_label}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gris-borde)' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--gris-suave)' }}>Nutriente</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>Mínimo</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>Máximo</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>Aporte</th>
            </tr>
          </thead>
          <tbody>
            {NUTRIENTES.map(n => {
              const aporte = aportes[n.key]
              const minimo = req_oms[n.reqKey]
              const maximo = n.maxKey ? req_oms[n.maxKey] : null
              const pct    = minimo > 0 ? (aporte / minimo * 100) : 100
              const estado = claseEstado(pct)
              return (
                <tr key={n.key} style={{ borderBottom: '1px solid var(--gris-fondo)' }}>
                  <td style={{ padding: '7px 4px', fontWeight: 600 }}>{n.label}</td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', color: 'var(--gris-suave)' }}>
                    {formatNum(minimo, 0)} {n.unit}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', color: 'var(--gris-suave)' }}>
                    {maximo ? `${formatNum(maximo, 0)} ${n.unit}` : '—'}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: 700 }}
                      className={`nutriente-pct ${estado}`}>
                    {formatNum(aporte, n.unit === 'mg' ? 1 : 0)} {n.unit}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button className="btn-primary" onClick={onVolver} style={{ marginBottom: 8 }}>
        ← Ver lista de alimentos
      </button>
    </div>
  )
}
