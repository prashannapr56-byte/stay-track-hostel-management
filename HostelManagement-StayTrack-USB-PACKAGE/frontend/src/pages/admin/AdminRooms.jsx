import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [students, setStudents] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  /** null = loading, array = loaded */
  const [roomStudents, setRoomStudents] = useState(null)
  const [detailStudent, setDetailStudent] = useState(null)
  const [addStudentId, setAddStudentId] = useState('')
  const [quickReg, setQuickReg] = useState('')
  const [quickName, setQuickName] = useState('')
  const [quickDept, setQuickDept] = useState('')
  const [quickPhone, setQuickPhone] = useState('')
  const [quickParent, setQuickParent] = useState('')
  const [allocate, setAllocate] = useState({ studentId: '', roomId: '' })
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  function load() {
    api('/admin/rooms').then(setRooms).catch((e) => setErr(e.message))
    api('/admin/students').then(setStudents).catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  async function openRoom(r) {
    setSelectedRoom(r)
    setDetailStudent(null)
    setRoomStudents(null)
    setAddStudentId('')
    setQuickReg('')
    setQuickName('')
    setQuickDept('')
    setQuickPhone('')
    setQuickParent('')
    setAllocate((prev) => ({ ...prev, roomId: String(r.id) }))
    try {
      const list = await api(`/admin/rooms/${r.id}/students`)
      setRoomStudents(list)
    } catch (e) {
      setErr(e.message)
      setRoomStudents([])
    }
  }

  async function removeFromRoom(studentId, studentName) {
    if (!selectedRoom?.id) return
    if (!window.confirm(`Remove ${studentName} from room ${selectedRoom.blockCode}-${selectedRoom.roomNumber}?`)) return
    setErr('')
    setMsg('')
    try {
      await api(`/admin/rooms/${selectedRoom.id}/students/${studentId}`, { method: 'DELETE' })
      setMsg('Student removed from room.')
      const list = await api('/admin/rooms')
      setRooms(list)
      const listSt = await api(`/admin/rooms/${selectedRoom.id}/students`)
      setRoomStudents(listSt)
      setDetailStudent((cur) => (cur?.id === studentId ? null : cur))
    } catch (e) {
      setErr(e.message)
    }
  }

  async function openStudent(id) {
    try {
      const s = await api(`/admin/students/${id}`)
      setDetailStudent(s)
    } catch (e) {
      setErr(e.message)
    }
  }

  /** Type register no. + name — creates student if new, then adds to this room. */
  async function submitQuickAddByRoll(e) {
    e.preventDefault()
    if (!selectedRoom?.id) return
    const reg = quickReg.trim()
    const nm = quickName.trim()
    if (!reg || !nm) {
      setErr('Enter register number (roll no.) and name.')
      return
    }
    setMsg('')
    setErr('')
    try {
      const data = await api(`/admin/rooms/${selectedRoom.id}/students/quick-add`, {
        method: 'POST',
        body: JSON.stringify({
          registerNumber: reg,
          name: nm,
          department: quickDept.trim() || undefined,
          studentPhone: quickPhone.trim() || undefined,
          parentPhone: quickParent.trim() || undefined,
        }),
      })
      let m = `${data.name} added to this room.`
      if (data.created) {
        m += ' New account: login with this register number and password student123 (change after first login).'
      }
      setMsg(m)
      setQuickReg('')
      setQuickName('')
      setQuickDept('')
      setQuickPhone('')
      setQuickParent('')
      const list = await api('/admin/rooms')
      setRooms(list)
      setStudents(await api('/admin/students'))
      const listSt = await api(`/admin/rooms/${selectedRoom.id}/students`)
      const updatedRoom = list.find((x) => x.id === selectedRoom.id)
      setSelectedRoom((prev) => (updatedRoom && prev ? { ...updatedRoom, _list: listSt } : prev))
      setRoomStudents(listSt)
    } catch (err) {
      setErr(err.message)
    }
  }

  /** Add student to the currently selected room (form inside room panel). */
  async function submitAddToSelectedRoom(e) {
    e.preventDefault()
    if (!selectedRoom?.id) return
    if (!addStudentId) {
      setErr('Choose a student to add.')
      return
    }
    setMsg('')
    setErr('')
    try {
      await api('/admin/allocations', {
        method: 'POST',
        body: JSON.stringify({
          studentId: Number(addStudentId),
          roomId: Number(selectedRoom.id),
        }),
      })
      setMsg('Student added to this room.')
      setAddStudentId('')
      const list = await api('/admin/rooms')
      setRooms(list)
      const listSt = await api(`/admin/rooms/${selectedRoom.id}/students`)
      const updatedRoom = list.find((x) => x.id === selectedRoom.id)
      setSelectedRoom((prev) => (updatedRoom && prev ? { ...updatedRoom, _list: listSt } : prev))
      setRoomStudents(listSt)
    } catch (e) {
      setErr(e.message)
    }
  }

  /** Quick assign from top (any room) when no room focused — optional fallback */
  async function submitQuickAllocate(e) {
    e.preventDefault()
    setMsg('')
    setErr('')
    if (!allocate.studentId || !allocate.roomId) {
      setErr('Select both student and room.')
      return
    }
    try {
      await api('/admin/allocations', {
        method: 'POST',
        body: JSON.stringify({
          studentId: Number(allocate.studentId),
          roomId: Number(allocate.roomId),
        }),
      })
      setMsg('Student added to room.')
      setAllocate((prev) => ({ ...prev, studentId: '' }))
      const list = await api('/admin/rooms')
      setRooms(list)
      if (selectedRoom && String(selectedRoom.id) === String(allocate.roomId)) {
        const listSt = await api(`/admin/rooms/${selectedRoom.id}/students`)
        setRoomStudents(listSt)
      }
    } catch (e) {
      setErr(e.message)
    }
  }

  const selectedMaint = selectedRoom?.availabilityLabel === 'MAINTENANCE'
  const selectedFull = selectedRoom?.availabilityLabel === 'FULL'

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Rooms</h2>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-1">Quick assign (any room)</h3>
        <p className="text-xs text-slate-500 mb-3">
          Or select a room in the grid — the <strong>Add student to this room</strong> form appears there.
        </p>
        <form onSubmit={submitQuickAllocate} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Student</label>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 min-w-[200px]"
              value={allocate.studentId}
              onChange={(e) => setAllocate({ ...allocate, studentId: e.target.value })}
            >
              <option value="">Select…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.registerNumber})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Room</label>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 min-w-[160px]"
              value={allocate.roomId}
              onChange={(e) => setAllocate({ ...allocate, roomId: e.target.value })}
            >
              <option value="">Select…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.blockCode}-{r.roomNumber}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brand-orange text-white font-semibold px-5 py-2 text-sm"
          >
            Add to room
          </button>
        </form>
      </div>

      {msg && <p className="text-emerald-600 text-sm font-medium">{msg}</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {rooms.map((r) => {
          const full = r.availabilityLabel === 'FULL'
          const maint = r.availabilityLabel === 'MAINTENANCE'
          const sel = selectedRoom?.id === r.id
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => openRoom(r)}
              className={`rounded-xl p-4 text-left border-2 transition shadow-sm ${
                sel
                  ? 'border-brand-teal bg-brand-teal text-white'
                  : maint
                    ? 'border-rose-200 bg-rose-50'
                    : full
                      ? 'border-slate-200 bg-slate-100'
                      : 'border-teal-100 bg-white hover:border-brand-teal/50'
              }`}
            >
              <p className="font-bold text-lg">
                {r.blockCode}-{r.roomNumber}
              </p>
              <p className={`text-xs mt-1 ${sel ? 'text-teal-100' : 'text-slate-500'}`}>
                {r.occupiedCount}/{r.capacity} students
              </p>
              <p className={`text-xs font-medium mt-1 ${maint ? 'text-rose-600' : ''}`}>
                {r.availabilityLabel}
              </p>
            </button>
          )
        })}
      </div>

      {selectedRoom && (
        <div className="rounded-2xl bg-white border-2 border-brand-teal/30 shadow-lg p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-800">
            Room {selectedRoom.blockCode}-{selectedRoom.roomNumber}
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Add or remove students for this room only.
          </p>

          <div className="rounded-xl bg-teal-50/80 border border-teal-100 p-4 mb-6 space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-brand-tealDark mb-1">Add by register / roll no. & name</h4>
              <p className="text-xs text-slate-600 mb-3">
                Creates a new student if this register number is not already in the system, then places them in
                this room.
              </p>
              {selectedMaint ? (
                <p className="text-sm text-rose-600">This room is under maintenance — cannot add students.</p>
              ) : selectedFull ? (
                <p className="text-sm text-amber-800">This room is full. Remove a student before adding another.</p>
              ) : (
                <form onSubmit={submitQuickAddByRoll} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Register / roll no.</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-white"
                        value={quickReg}
                        onChange={(e) => setQuickReg(e.target.value)}
                        placeholder="e.g. 24CS105"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Full name</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-white"
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        placeholder="Student name"
                      />
                    </div>
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-brand-teal font-medium py-1">
                      Optional: department & phone numbers
                    </summary>
                    <div className="grid sm:grid-cols-2 gap-3 mt-2 pt-2 border-t border-teal-100">
                      <div className="sm:col-span-2">
                        <label className="text-slate-600 block mb-1">Department</label>
                        <input
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-sm"
                          value={quickDept}
                          onChange={(e) => setQuickDept(e.target.value)}
                          placeholder="Defaults to “Not set” if empty"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Student phone</label>
                        <input
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-sm"
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(e.target.value)}
                          placeholder="Optional — placeholder if empty"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Parent phone</label>
                        <input
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-sm"
                          value={quickParent}
                          onChange={(e) => setQuickParent(e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </details>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-teal text-white font-semibold px-6 py-2.5 text-sm shadow-sm w-full sm:w-auto"
                  >
                    Add to this room
                  </button>
                </form>
              )}
            </div>

            <div className="border-t border-teal-200 pt-4">
              <h4 className="text-sm font-semibold text-brand-tealDark mb-1">Or pick an existing student</h4>
              {selectedMaint || selectedFull ? (
                <p className="text-xs text-slate-500">Unavailable for this room.</p>
              ) : (
                <form onSubmit={submitAddToSelectedRoom} className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-slate-600 block mb-1">Student</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-white"
                      value={addStudentId}
                      onChange={(e) => setAddStudentId(e.target.value)}
                    >
                      <option value="">Choose student…</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.registerNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-orange text-white font-semibold px-6 py-2.5 text-sm shadow-sm"
                  >
                    Add to this room
                  </button>
                </form>
              )}
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-700 mb-2">Students in this room</h4>
          {roomStudents === null && <p className="text-slate-500 text-sm">Loading list…</p>}
          {roomStudents !== null && (
            <ul className="space-y-2">
              {roomStudents.length === 0 && (
                <li className="text-slate-500 text-sm py-2">No students yet — use the form above.</li>
              )}
              {roomStudents.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      className="text-brand-teal font-medium hover:underline text-left"
                      onClick={() => openStudent(s.id)}
                    >
                      {s.name}
                    </button>
                    <span className="text-slate-500 text-sm ml-2">{s.registerNumber}</span>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-sm font-medium text-rose-600 hover:text-rose-800 px-3 py-1 rounded-lg border border-rose-200 hover:bg-rose-50"
                    onClick={() => removeFromRoom(s.id, s.name)}
                  >
                    Remove from room
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!selectedRoom && (
        <p className="text-sm text-slate-500 text-center py-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="font-medium text-slate-700">Tip:</span> Click a room above to open the panel with{' '}
          <strong>Add student to this room</strong>.
        </p>
      )}

      {detailStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Student details</h3>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium">{detailStudent.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Department</dt>
                <dd>{detailStudent.department}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Register number</dt>
                <dd>{detailStudent.registerNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Student contact</dt>
                <dd>{detailStudent.studentContact}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Parent contact</dt>
                <dd>{detailStudent.parentContact}</dd>
              </div>
            </dl>
            {selectedRoom && (
              <button
                type="button"
                className="mt-3 w-full py-2 rounded-xl border border-rose-200 text-rose-700 font-medium text-sm hover:bg-rose-50"
                onClick={() => {
                  removeFromRoom(detailStudent.id, detailStudent.name)
                }}
              >
                Remove from room {selectedRoom.blockCode}-{selectedRoom.roomNumber}
              </button>
            )}
            <button
              type="button"
              className="mt-3 w-full py-2 rounded-xl bg-slate-800 text-white font-medium"
              onClick={() => setDetailStudent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
