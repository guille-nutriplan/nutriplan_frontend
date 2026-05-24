/**
 * ListaImprimible.jsx
 * Genera una lista de compras lista para imprimir o guardar como PDF.
 * Usa window.print() con estilos @media print — sin librerías extra.
 */

// Reagrupar por sección de supermercado (más útil que por grupo nutricional)
const SECCIONES_SUPER = {
  'Verduras y frutas':  ['Hortalizas', 'Frutas'],
  'Carnes y aves':      ['Carnes', 'Aves', 'Pescados'],
  'Lácteos y huevos':   ['Lacteos', 'Huevos'],
  'Almacén':            ['Cereales', 'Leguminosas', 'FrutosSecos', 'Aceites', 'Azucares'],
  'Fiambres':           ['Embutidos'],
}

const ICONOS_SECCION = {
  'Verduras y frutas':  '🥦',
  'Carnes y aves':      '🥩',
  'Lácteos y huevos':   '🥛',
  'Almacén':            '🌾',
  'Fiambres':           '🌭',
}

function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}

function formatPeso(g) {
  if (g >= 1000) return `${(g / 1000).toFixed(2).replace('.', ',')} kg`
  return `${Math.round(g)} g`
}

// Conversión aproximada a medidas caseras para los alimentos más comunes
function medidaCasera(nombre, gramos) {
  const n = nombre.toLowerCase()
  if (gramos < 5)   return null
  if (n.includes('aceite') || n.includes('mayonesa'))
    return `≈ ${Math.round(gramos / 14)} cda`   // 1 cda = ~14g
  if (n.includes('leche'))
    return `≈ ${Math.round(gramos / 240)} taza`
  if (n.includes('arroz') || n.includes('fideos') || n.includes('polenta'))
    return `≈ ${Math.round(gramos / 80)} taza cruda`
  if (n.includes('harina'))
    return `≈ ${Math.round(gramos / 120)} taza`
  if (n.includes('huevo'))
    return `≈ ${Math.round(gramos / 55)} huevo${Math.round(gramos/55) > 1 ? 's' : ''}`
  if (n.includes('queso') && gramos < 80)
    return `≈ ${Math.round(gramos / 20)} feta${Math.round(gramos/20) > 1 ? 's' : ''}`
  if (n.includes('azucar') || n.includes('azúcar'))
    return `≈ ${Math.round(gramos / 12)} cda`
  return null
}


// ─── Envases comerciales típicos en supermercados argentinos ─────────────────
// Tamaños en gramos (o ml para líquidos). null = se vende a granel.
const ENVASES_POR_KEYWORD = {
  'mayonesa':    [125, 250, 500, 1000],
  'aceite':      [500, 900, 1000, 1500],
  'manteca':     [200, 400],
  'margarina':   [200, 500],
  'arroz':       [500, 1000, 2000],
  'fideos':      [250, 500, 1000],
  'macarron':    [250, 500, 1000],
  'harina':      [500, 1000],
  'polenta':     [500, 1000],
  'avena':       [500, 1000],
  'maicena':     [250, 500],
  'azucar':      [1000, 2000],
  'sal ':        [500, 1000],
  'leche':       [1000, 2000],
  'yogur':       [190, 500, 1000],
  'queso':       [200, 400, 500],
  'ricota':      [200, 500],
  'crema':       [200, 500],
  'huevo':       [600, 900],   // docena (600g) o 18 (900g)
  'atun':        [170, 340],
  'sardina':     [100, 125],
  'caballa':     [170, 350],
  'lenteja':     [500, 1000],
  'garbanzo':    [500, 1000],
  'poroto':      [500, 1000],
  'arveja':      [400, 500],
  'soja':        [500, 1000],
  'almendra':    [100, 200, 500],
  'mani':        [100, 200, 500],
  'nuez':        [100, 200],
  'galletita':   [100, 200, 300],
  'pan ':        [300, 500, 700],
  'mermelada':   [300, 454],
  'dulce':       [400, 800],
  'chocolate':   [100, 200],
  'miel':        [500, 1000],
}

const ENVASES_POR_GRUPO = {
  'Cereales':    500,
  'Leguminosas': 500,
  'Lacteos':     1000,
  'Huevos':      600,
  'Aceites':     500,
  'Azucares':    1000,
  'Pescados':    170,
  'Embutidos':   200,
  'FrutosSecos': 200,
  // A granel — sin envase fijo
  'Hortalizas':  null,
  'Frutas':      null,
  'Carnes':      null,
  'Aves':        null,
}

function calcularEnvase(nombre, grupo, gramosNecesarios) {
  const n = nombre.toLowerCase()

  // Buscar por keyword
  for (const [kw, sizes] of Object.entries(ENVASES_POR_KEYWORD)) {
    if (n.includes(kw)) {
      const tamMin = sizes[0]
      const unidades = Math.ceil(gramosNecesarios / tamMin)
      const tamTotal = tamMin * unidades
      return { tamEnvase: tamMin, unidades, tamTotal }
    }
  }

  // Fallback por grupo
  const tamGrupo = ENVASES_POR_GRUPO[grupo]
  if (!tamGrupo) return null  // a granel

  const unidades = Math.ceil(gramosNecesarios / tamGrupo)
  const tamTotal = tamGrupo * unidades
  return { tamEnvase: tamGrupo, unidades, tamTotal }
}

function labelEnvase(envase, gramosNecesarios) {
  if (!envase) return 'a granel'
  if (envase.unidades === 1) return `1 × ${formatPeso(envase.tamEnvase)}`
  return `${envase.unidades} × ${formatPeso(envase.tamEnvase)}`
}

export default function ListaImprimible({ resultado, onCerrar }) {
  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  // Agrupar alimentos por sección de supermercado
  const secciones = {}
  for (const [seccion, grupos] of Object.entries(SECCIONES_SUPER)) {
    const items = resultado.alimentos.filter(a => grupos.includes(a.grupo))
    if (items.length > 0) secciones[seccion] = items
  }

  const handlePrint = () => window.print()

  return (
    <>
      {/* Estilos de impresión — se inyectan en <head> vía style tag */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .lista-imprimible, .lista-imprimible * { visibility: visible !important; }
          .lista-imprimible { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
        .lista-imprimible { font-family: Arial, sans-serif; }
      `}</style>

      {/* Modal superpuesto en pantalla */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        overflowY: 'auto', padding: '16px',
      }}>
        <div className="lista-imprimible" style={{
          background: 'white', maxWidth: 680, margin: '0 auto',
          borderRadius: 12, padding: '24px', position: 'relative',
        }}>

          {/* Botones — se ocultan al imprimir */}
          <div className="no-print" style={{
            display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 16,
          }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}
              onClick={handlePrint}>
              🖨 Imprimir / Guardar PDF
            </button>
            <button className="btn-secundario" onClick={onCerrar}>Cerrar</button>
          </div>

          {/* Encabezado */}
          <div style={{ borderBottom: '3px solid #16a34a', paddingBottom: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: 0, color: '#16a34a', fontSize: '1.4rem' }}>
                  🥗 NutriPlan — Lista de Compras
                </h1>
                <div style={{ color: '#6b7280', fontSize: '.85rem', marginTop: 4 }}>
                  {resultado.rango_label} · {resultado.provincia}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '.78rem', color: '#6b7280' }}>
                <div>{hoy}</div>
                <div>Precios: {resultado.fuente_precios === 'SEPA' ? 'SEPA datos.gob.ar' : 'Referencia'}</div>
              </div>
            </div>
          </div>

          {/* Lista por sección */}
          {Object.entries(secciones).map(([seccion, items]) => (
            <div key={seccion} style={{ marginBottom: 20, breakInside: 'avoid' }}>
              <h3 style={{
                margin: '0 0 8px 0', color: '#16a34a', fontSize: '.9rem',
                textTransform: 'uppercase', letterSpacing: '.5px',
                borderBottom: '1px solid #bbf7d0', paddingBottom: 4,
              }}>
                {ICONOS_SECCION[seccion]} {seccion}
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
                <tbody>
                  {items.map((item, i) => {
                    const medida = medidaCasera(item.nombre, item.gramos)
                    return (
                      <tr key={i} style={{
                        borderBottom: '1px solid #f3f4f6',
                        background: i % 2 === 0 ? 'white' : '#f9fafb',
                      }}>
                        {/* Checkbox */}
                        <td style={{ width: 28, paddingLeft: 4, color: '#d1d5db' }}>☐</td>
                        {/* Nombre */}
                        <td style={{ padding: '6px 4px', flex: 1 }}>
                          {item.nombre}
                        </td>
                        {/* Medida casera */}
                        <td style={{ padding: '6px 8px', color: '#9ca3af', fontSize: '.78rem', whiteSpace: 'nowrap' }}>
                          {medida || ''}
                        </td>
                        {/* Cantidad necesaria */}
                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatPeso(item.gramos)}
                        </td>
                        {/* Envase comercial */}
                        {(() => {
                          const envase = calcularEnvase(item.nombre, item.grupo, item.gramos)
                          const precioEnvase = envase && item.costo_ars > 0
                            ? item.costo_ars / item.gramos * (envase.tamEnvase * envase.unidades)
                            : null
                          return (
                            <>
                              <td style={{ padding: '6px 4px', textAlign: 'right', fontSize: '.78rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                {labelEnvase(envase, item.gramos)}
                              </td>
                              <td style={{ padding: '6px 4px 6px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {precioEnvase ? formatARS(precioEnvase) : formatARS(item.costo_ars)}
                              </td>
                            </>
                          )
                        })()}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}

          {/* Totales */}
          <div style={{
            borderTop: '2px solid #16a34a', marginTop: 8, paddingTop: 12,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 8,
          }}>
            <div style={{ fontSize: '.8rem', color: '#6b7280' }}>
              {resultado.alimentos.length} productos · {resultado.aportes.energia_kcal.toFixed(0)} kcal
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Costo diario</div>
                <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.1rem' }}>{formatARS(resultado.costo_diario)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Costo mensual</div>
                <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.1rem' }}>{formatARS(resultado.costo_mensual)}</div>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div style={{
            marginTop: 16, paddingTop: 8, borderTop: '1px solid #e5e7eb',
            fontSize: '.72rem', color: '#9ca3af', textAlign: 'center',
          }}>
            NutriPlan · nutriplan-oms.vercel.app · Requerimientos OMS/FAO · Guías Alimentarias Argentina
            <br/>Esta lista es orientativa. Consultá a un profesional de la salud.
          </div>

        </div>
      </div>
    </>
  )
}
