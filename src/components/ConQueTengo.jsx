import { useState } from 'react'
import Analizador from './Analizador.jsx'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts'

const GRUPOS_ICONOS = {
  Cereales:'🌾', Leguminosas:'🫘', Hortalizas:'🥦', Frutas:'🍎',
  FrutosSecos:'🥜', Lacteos:'🥛', Huevos:'🥚', Aceites:'🫙',
  Azucares:'🍯', Pescados:'🐟', Carnes:'🥩', Embutidos:'🌭', Aves:'🍗',
}

function PctBarra({ label, aporte, minimo, color }) {
  const pct = minimo > 0 ? Math.min(aporte / minimo * 100, 100) : 100
  const cubierto = pct >= 90
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:'flex', justifyContent:'space-between',
        fontSize:'.8rem', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color: cubierto ? '#16a34a' : '#f59e0b', fontWeight: 700 }}>
          {cubierto ? '✓' : '⚠'} {Math.round(pct)}%
        </span>
      </div>
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3 }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: cubierto ? '#16a34a' : '#f59e0b',
          width: `${pct}%`, transition: 'width .4s ease',
        }} />
      </div>
    </div>
  )
}

export default function ConQueTengo({ apiUrl, onNuevoPlan }) {
  const [paso,        setPaso]        = useState('input')  // input | resultado
  const [resultado,   setResultado]   = useState(null)
  const [cargando,    setCargando]    = useState(false)
  const [error,       setError]       = useState(null)

  async function handleCompletar(params) {
    setCargando(true); setError(null)
    try {
      const resp = await fetch(`${apiUrl}/api/completar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!resp.ok) throw new Error((await resp.json()).detail || 'Error en el servidor')
      setResultado(await resp.json())
      setPaso('resultado')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  if (paso === 'input') {
    return (
      <div>
        <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>🧊 ¿Con qué tengo?</div>
          <div style={{ fontSize: '.85rem', color: '#1e40af' }}>
            Ingresá los alimentos que ya tenés en casa con sus cantidades.
            La app calculará qué nutrientes ya cubrís y qué necesitás agregar
            para completar los requerimientos OMS del día.
          </div>
        </div>
        <Analizador
          onAnalizar={handleCompletar}
          cargando={cargando}
          error={error}
          apiUrl={apiUrl}
          textoBoton="🔍 Ver qué me falta agregar"
        />
      </div>
    )
  }

  const r = resultado
  const ap = r.aportes_actuales
  const req = r.req_oms

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              🧊 Completar dieta — {r.rango_label}
            </div>
            <div style={{ fontSize: '.82rem', color: 'var(--gris-suave)', marginTop: 2 }}>
              {r.ya_tienes.length} alimentos ingresados
            </div>
          </div>
          <button className="btn-texto" onClick={() => { setPaso('input'); setResultado(null) }}>
            ← Cambiar alimentos
          </button>
        </div>
      </div>

      {/* Semáforo de nutrientes */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-titulo">📊 Cobertura con lo que tenés</div>
        <PctBarra label="Energía"       aporte={ap.energia_kcal} minimo={req.energia_min} />
        <PctBarra label="Proteínas"     aporte={ap.proteinas_g}  minimo={req.proteinas_min} />
        <PctBarra label="Calcio"        aporte={ap.calcio_mg}    minimo={req.calc_min} />
        <PctBarra label="Hierro"        aporte={ap.hierro_mg}    minimo={req.hierro_min} />
        <PctBarra label="Vitamina A"    aporte={ap.vit_a_ui}     minimo={req.vit_a_min_ui} />
        <PctBarra label="Vitamina C"    aporte={ap.vit_c_mg}     minimo={req.vit_c_min} />

        {r.nutrientes_cubiertos.length > 0 && (
          <div style={{ marginTop: 8, fontSize: '.8rem' }}>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Ya cubrís: </span>
            {r.nutrientes_cubiertos.join(' · ')}
          </div>
        )}
        {r.nutrientes_faltantes.length > 0 && (
          <div style={{ marginTop: 4, fontSize: '.8rem' }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>⚠ Falta cubrir: </span>
            {r.nutrientes_faltantes.join(' · ')}
          </div>
        )}
      </div>

      {/* Radar antes/después */}
      {r.agregar.length > 0 && (() => {
        const req = r.req_oms
        const ap1 = r.aportes_actuales
        const ap2 = r.aportes_totales
        const datos = [
          { nut: 'Energía',   antes: Math.round(ap1.energia_kcal/req.energia_min*100), despues: Math.round(ap2.energia_kcal/req.energia_min*100) },
          { nut: 'Proteínas', antes: Math.round(ap1.proteinas_g/req.proteinas_min*100), despues: Math.round(ap2.proteinas_g/req.proteinas_min*100) },
          { nut: 'Calcio',    antes: Math.round(ap1.calcio_mg/req.calc_min*100), despues: Math.round(ap2.calcio_mg/req.calc_min*100) },
          { nut: 'Hierro',    antes: Math.round(ap1.hierro_mg/req.hierro_min*100), despues: Math.round(ap2.hierro_mg/req.hierro_min*100) },
          { nut: 'Vit A',     antes: Math.round(ap1.vit_a_ui/req.vit_a_min_ui*100), despues: Math.round(ap2.vit_a_ui/req.vit_a_min_ui*100) },
          { nut: 'Vit C',     antes: Math.round(ap1.vit_c_mg/req.vit_c_min*100), despues: Math.round(ap2.vit_c_mg/req.vit_c_min*100) },
          { nut: 'Fibra',     antes: Math.round(ap1.fibra_g/(req.fibra_min||25)*100), despues: Math.round(ap2.fibra_g/(req.fibra_min||25)*100) },
          { nut: 'Zinc',      antes: Math.round(ap1.zinc_mg/(req.zinc_min||8)*100), despues: Math.round(ap2.zinc_mg/(req.zinc_min||8)*100) },
        ].map(d => ({
          ...d,
          antes:   Math.min(d.antes, 120),
          despues: Math.min(d.despues, 120),
        }))
        return (
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-titulo">📈 Cobertura antes y después de agregar</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={datos}>
                <PolarGrid />
                <PolarAngleAxis dataKey="nut" tick={{ fontSize: 11 }} />
                <Radar name="Con lo que tenés" dataKey="antes"
                  stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                <Radar name="Dieta completa" dataKey="despues"
                  stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: '.72rem', color: 'var(--gris-suave)', textAlign: 'center' }}>
              Valores capped en 120% del mínimo OMS
            </div>
          </div>
        )
      })()}

      {/* Lo que ya tenés */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-titulo">🏠 Lo que ya tenés</div>
        {r.ya_tienes.map((item, i) => (
          <div key={i} className="alimento-fila">
            <span>{GRUPOS_ICONOS[item.grupo]}</span>
            <span className="alimento-nombre">{item.nombre}</span>
            <span style={{ fontSize:'.82rem', color:'var(--gris-suave)' }}>
              {item.gramos}g
            </span>
            <span style={{ fontSize:'.78rem', color:'var(--verde)', marginLeft:'auto' }}>
              {item.aporte_cal.toFixed(0)} kcal
            </span>
          </div>
        ))}
      </div>

      {/* Lo que necesitás agregar */}
      {r.agregar.length > 0 && (
        <div className="card" style={{
          border: '2px solid #16a34a', marginBottom: 12,
        }}>
          <div className="card-titulo">🛒 Necesitás agregar</div>
          {r.agregar.map((item, i) => (
            <div key={i} className="alimento-fila">
              <span>{GRUPOS_ICONOS[item.grupo]}</span>
              <span className="alimento-nombre">{item.nombre}</span>
              <span style={{ fontSize:'.82rem', color:'var(--gris-suave)' }}>
                {item.gramos}g
              </span>
              <span style={{ fontSize:'.82rem', color:'var(--verde)',
                fontWeight:700, marginLeft:'auto' }}>
                ${item.costo_ars.toFixed(0)}
              </span>
            </div>
          ))}
          <div style={{
            marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--gris-borde)',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <div style={{ fontSize:'.82rem', color:'var(--gris-suave)' }}>
              Costo de lo que agregás
            </div>
            <div style={{ fontWeight: 800, color:'var(--verde)', fontSize:'1.1rem' }}>
              ${r.costo_adicional.toFixed(0)}/día
            </div>
          </div>
        </div>
      )}

      {r.agregar.length === 0 && (
        <div className="card" style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0' }}>
          <div style={{ textAlign:'center', padding: '8px 0' }}>
            <div style={{ fontSize:'1.5rem', marginBottom: 4 }}>✅</div>
            <div style={{ fontWeight: 700, color:'#16a34a' }}>
              ¡Con lo que tenés alcanza para cubrir todos los requerimientos!
            </div>
          </div>
        </div>
      )}

      {/* Resumen total */}
      <div className="card">
        <div className="card-titulo">📋 Resumen del día completo</div>
        {[
          ['Energía',    r.aportes_totales.energia_kcal.toFixed(0) + ' kcal', r.req_oms.energia_min + ' kcal'],
          ['Proteínas',  r.aportes_totales.proteinas_g.toFixed(1)  + ' g',    r.req_oms.proteinas_min + ' g'],
          ['Calcio',     r.aportes_totales.calcio_mg.toFixed(0)    + ' mg',   r.req_oms.calc_min + ' mg'],
          ['Hierro',     r.aportes_totales.hierro_mg.toFixed(1)    + ' mg',   r.req_oms.hierro_min + ' mg'],
          ['Vitamina C', r.aportes_totales.vit_c_mg.toFixed(0)     + ' mg',   r.req_oms.vit_c_min + ' mg'],
        ].map(([nom, val, min]) => (
          <div key={nom} style={{
            display:'flex', justifyContent:'space-between',
            padding:'5px 0', borderBottom:'1px solid var(--gris-fondo)',
            fontSize:'.85rem',
          }}>
            <span>{nom}</span>
            <span style={{ fontWeight:700, color:'var(--verde)' }}>{val}</span>
            <span style={{ color:'var(--gris-suave)' }}>mín {min}</span>
          </div>
        ))}
      </div>

      <button className="btn-secundario" style={{ marginTop: 8 }}
        onClick={() => onNuevoPlan && onNuevoPlan()}>
        🔍 Calcular plan completo desde cero
      </button>
    </div>
  )
}
