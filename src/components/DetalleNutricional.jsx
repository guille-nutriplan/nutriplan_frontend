import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Fuente máximos: IOM Dietary Reference Intakes (UL = Tolerable Upper Intake Level)
const NUTRIENTES = [
  { key: 'energia_kcal', label: 'Energía',       unit: 'kcal', reqKey: 'energia_min',  maxKey: 'energia_max' },
  { key: 'proteinas_g',  label: 'Proteínas',     unit: 'g',    reqKey: 'proteinas_min' },
  { key: 'grasas_g',     label: 'Grasas',        unit: 'g',    reqKey: 'grasas_min',   maxKey: 'grasas_max' },
  { key: 'hc_g',         label: 'Carbohidratos', unit: 'g',    reqKey: 'hc_min',       maxKey: 'hc_max' },
  { key: 'fibra_g',      label: 'Fibra',         unit: 'g',    reqKey: 'fibra_min',    estimada: true },
  { key: 'calcio_mg',    label: 'Calcio',        unit: 'mg',   reqKey: 'calc_min',     maxKey: 'calc_max' },
  { key: 'hierro_mg',    label: 'Hierro',        unit: 'mg',   reqKey: 'hierro_min',   maxKey: 'hierro_max' },
  { key: 'vit_a_ui',     label: 'Vitamina A',    unit: 'UI',   reqKey: 'vit_a_min_ui', maxKey: 'vit_a_max_ui' },
  { key: 'vit_c_mg',     label: 'Vitamina C',    unit: 'mg',   reqKey: 'vit_c_min',    maxKey: 'vit_c_max' },
  { key: 'vit_b1_mg',    label: 'Vitamina B1',   unit: 'mg',   reqKey: 'vit_b1_min' },
  { key: 'vit_b2_mg',    label: 'Vitamina B2',   unit: 'mg',   reqKey: 'vit_b2_min' },
  { key: 'zinc_mg',      label: 'Zinc',          unit: 'mg',   reqKey: 'zinc_min',     maxKey: 'zinc_max',    estimada: true },
  { key: 'yodo_ug',      label: 'Yodo',          unit: 'µg',   reqKey: 'yodo_min',     maxKey: 'yodo_max',    estimada: true },
  { key: 'selenio_ug',   label: 'Selenio',       unit: 'µg',   reqKey: 'selenio_min',  maxKey: 'selenio_max', estimada: true },
]

const COLORES_PIE = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444']

function formatNum(n, decimales = 0) {
  if (n === undefined || n === null || isNaN(n)) return '—'
  return Number(n).toFixed(decimales).replace('.', ',')
}

function claseEstado(aporte, minimo, maximo, sinExceso) {
  if (aporte < minimo * 0.9)                    return 'bajo'
  if (!sinExceso && maximo && aporte > maximo)  return 'exceso'
  if (!sinExceso && !maximo && aporte > minimo * 2) return 'exceso'
  return 'ok'
}

function etiquetaEstado(aporte, minimo, maximo, sinExceso) {
  if (aporte < minimo * 0.9)                    return '⚠ Bajo'
  if (!sinExceso && maximo && aporte > maximo)  return 'ℹ Excede'
  if (!sinExceso && !maximo && aporte > minimo * 2) return 'ℹ Excede'
  return '✓ OK'
}

function BarraNutriente({ nutriente, aporte, req, maxReq }) {
  const a = aporte ?? 0
  const r = req    ?? 0

  // Para nutrientes con rango (min-max) calcular % sobre el máximo
  const pct = r > 0 ? Math.round(a / r * 100) : 100

  const sinExceso = !nutriente.maxKey  // sin UL → no marcar como exceso
  const estado = claseEstado(a, r, maxReq, sinExceso)
  const anchoVisual = Math.min(pct, 150)
  const anchoMax    = 150

  const detalleLabel = maxReq
    ? `Rango OMS: ${formatNum(r, 0)}–${formatNum(maxReq, 0)} ${nutriente.unit}`
    : `Mínimo OMS: ${formatNum(r, 0)} ${nutriente.unit}`

  return (
    <div className="nutriente-row">
      <div className="nutriente-header">
        <span className="nutriente-nombre">
          {nutriente.label}
          {nutriente.estimada && (
            <span style={{ fontSize: '.72rem', color: 'var(--gris-suave)', marginLeft: 4 }}>
              *estimada
            </span>
          )}
        </span>
        <span className={`nutriente-pct ${estado}`}>
          {etiquetaEstado(a, r, maxReq, sinExceso)} · {Math.round(pct)}%
        </span>
      </div>
      <div className="barra-fondo">
        <div
          className={`barra-relleno ${estado}`}
          style={{ width: `${(anchoVisual / anchoMax) * 100}%` }}
        />
      </div>
      <div className="nutriente-detalle">
        Aporte: {formatNum(a, nutriente.unit === 'mg' || nutriente.unit === 'g' ? 1 : 0)} {nutriente.unit}
        {' · '}
        {detalleLabel}
      </div>
    </div>
  )
}

export default function DetalleNutricional({ resultado, onVolver }) {
  const { aportes, req_oms } = resultado

  const cal_proteinas = aportes.proteinas_g * 4
  const cal_grasas    = aportes.grasas_g * 9
  const cal_hc        = aportes.hc_g * 4

  const dataTorta = [
    { name: 'Proteínas',     value: Math.round(cal_proteinas), pct: Math.round(cal_proteinas / aportes.energia_kcal * 100) },
    { name: 'Carbohidratos', value: Math.round(cal_hc),        pct: Math.round(cal_hc / aportes.energia_kcal * 100) },
    { name: 'Grasas',        value: Math.round(cal_grasas),    pct: Math.round(cal_grasas / aportes.energia_kcal * 100) },
  ]

  const macros = NUTRIENTES.slice(0, 4)
  const micros = NUTRIENTES.slice(4)

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

      {/* Distribución calórica */}
      <div className="card">
        <div className="card-titulo">🍕 Distribución calórica</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={dataTorta} cx="50%" cy="50%"
              innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {dataTorta.map((_, i) => <Cell key={i} fill={COLORES_PIE[i]} />)}
            </Pie>
            <Tooltip formatter={(value, name, props) =>
              [`${value} kcal (${props.payload.pct}%)`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
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
          <BarraNutriente key={n.key} nutriente={n}
            aporte={aportes[n.key] ?? 0}
            req={req_oms[n.reqKey] ?? 0}
            maxReq={n.maxKey ? (req_oms[n.maxKey] ?? null) : null}
          />
        ))}
      </div>

      {/* Micronutrientes */}
      <div className="card">
        <div className="card-titulo">🔬 Micronutrientes vs OMS</div>
        {micros.map(n => (
          <BarraNutriente key={n.key} nutriente={n}
            aporte={aportes[n.key] ?? 0}
            req={req_oms[n.reqKey] ?? 0}
            maxReq={n.maxKey ? (req_oms[n.maxKey] ?? null) : null}
          />
        ))}
        <div className="alerta aviso" style={{ marginTop: 16 }}>
          * Los valores de fibra, zinc, yodo y selenio son estimaciones por grupo alimentario.
        </div>
      </div>

      {/* Tabla referencia OMS */}
      <div className="card">
        <div className="card-titulo">📋 Referencia OMS — {resultado.rango_label}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gris-borde)' }}>
              <th style={{ textAlign: 'left',  padding: '6px 4px', color: 'var(--gris-suave)' }}>Nutriente</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>Mínimo</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>Máximo (UL)</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--gris-suave)' }}>Aporte</th>
            </tr>
          </thead>
          <tbody>
            {NUTRIENTES.map(n => {
              const aporte = aportes[n.key]   ?? 0
              const minimo = req_oms[n.reqKey] ?? 0
              const maximo = n.maxKey ? (req_oms[n.maxKey] ?? null) : null
              const pct = minimo > 0 ? Math.round(aporte / minimo * 100) : 100
              const sinExceso = !n.maxKey
              const estado = claseEstado(aporte, minimo, maximo, sinExceso)
              return (
                <tr key={n.key} style={{ borderBottom: '1px solid var(--gris-fondo)' }}>
                  <td style={{ padding: '7px 4px', fontWeight: 600 }}>
                    {n.label}{n.estimada ? ' *' : ''}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', color: 'var(--gris-suave)' }}>
                    {formatNum(minimo, 0)} {n.unit}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', color: 'var(--gris-suave)' }}>
                    {maximo ? `${formatNum(maximo, 0)} ${n.unit}` : '—'}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: 700 }}
                      className={`nutriente-pct ${estado}`}>
                    {formatNum(aporte, n.unit === 'mg' || n.unit === 'g' ? 1 : 0)} {n.unit}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p style={{ fontSize: '.72rem', color: 'var(--gris-suave)', marginTop: 8 }}>
          * Estimado por grupo alimentario · UL = Nivel de Ingesta Máxima Tolerable (IOM/OMS)
          · B1 y B2 sin UL establecido
        </p>
      </div>

      <button className="btn-primary" onClick={onVolver} style={{ marginBottom: 8 }}>
        ← Ver lista de alimentos
      </button>
    </div>
  )
}
