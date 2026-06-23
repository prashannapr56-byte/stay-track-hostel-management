import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const mealTimes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner']

export function AdminMenu() {
  const [menu, setMenu] = useState([])
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const [formParams, setFormParams] = useState({
    day: 'Monday',
    mealTime: 'Breakfast',
    dish: ''
  })

  async function load() {
    try {
      setMenu(await api('/admin/mess-menu'))
    } catch (e) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function saveMenu(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await api('/admin/mess-menu', {
        method: 'POST',
        body: JSON.stringify(formParams)
      })
      setMsg('Menu updated successfully')
      setFormParams(prev => ({...prev, dish: ''}))
      load()
    } catch (error) {
      setErr(error.message)
    }
  }

  const getMenuForSlot = (d, m) => {
    const item = menu.find(x => x.day === d && x.meal_time === m)
    return item ? item.dish : '-'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Mess Menu</h2>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {msg && <p className="text-emerald-600 text-sm">{msg}</p>}

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Update Menu Card</h3>
        <form onSubmit={saveMenu} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Day</label>
            <select
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={formParams.day}
              onChange={e => setFormParams({...formParams, day: e.target.value})}
            >
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Time</label>
            <select
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={formParams.mealTime}
              onChange={e => setFormParams({...formParams, mealTime: e.target.value})}
            >
              {mealTimes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm text-slate-600 mb-1">What Dish</label>
            <input
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="E.g. Idli, Sambar"
              value={formParams.dish}
              onChange={e => setFormParams({...formParams, dish: e.target.value})}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-orange text-white font-bold px-4 py-2 uppercase text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Day</th>
              {mealTimes.map(m => <th key={m} className="p-3">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map((d) => (
              <tr key={d} className="border-t border-slate-100">
                <td className="p-3 font-medium bg-slate-50/50">{d}</td>
                {mealTimes.map(m => (
                  <td key={m} className="p-3">
                    {getMenuForSlot(d, m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
