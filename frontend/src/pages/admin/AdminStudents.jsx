import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export function AdminStudents() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [name, setName] = useState('')
  const [registerNumber, setRegisterNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [studentContact, setStudentContact] = useState('')
  const [parentContact, setParentContact] = useState('')
  const [gender, setGender] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  async function loadStudents() {
    try {
      const list = await api('/admin/students')
      setStudents(list)
    } catch (e) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  async function selectStudent(id) {
    setErr('')
    setMsg('')
    try {
      const details = await api(`/admin/students/${id}`)
      setSelectedStudent(details)
      setName(details.name || '')
      setRegisterNumber(details.registerNumber || '')
      setDepartment(details.department || '')
      setStudentContact(details.studentContact || '')
      setParentContact(details.parentContact || '')
      setGender(details.gender || '')
    } catch (e) {
      setErr(e.message)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (!selectedStudent) return

    try {
      await api(`/admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          registerNumber,
          department,
          studentContact,
          parentContact,
          gender
        })
      })
      setMsg('Student profile and Parent connection details updated successfully!')
      loadStudents()
      // Refresh details
      setSelectedStudent({
        ...selectedStudent,
        name,
        registerNumber,
        department,
        studentContact,
        parentContact,
        gender
      })
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Student & Parent Directory</h2>
      </div>

      {err && <p className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 text-sm">{err}</p>}
      {msg && <p className="text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-sm font-semibold">{msg}</p>}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Student List Sidebar */}
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 flex flex-col h-[600px]">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
            <span>👥</span> Student Directory
          </h3>
          <div className="overflow-y-auto flex-1 pr-2 space-y-2">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => selectStudent(s.id)}
                className={`w-full text-left p-4 rounded-2xl border transition duration-200 flex flex-col ${
                  selectedStudent?.id === s.id
                    ? 'bg-brand-teal/10 border-brand-teal text-brand-tealDark shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-bold text-sm">{s.name}</span>
                <span className="text-xs text-slate-400 font-mono mt-0.5">{s.registerNumber}</span>
              </button>
            ))}
            {students.length === 0 && (
              <p className="text-slate-400 text-center py-8">No students enrolled yet.</p>
            )}
          </div>
        </div>

        {/* Profile Details & Connection Form */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="rounded-3xl bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 p-8">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                <span>🔗</span> Parent-Student Connection & Profile Info
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Profile Information</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Register Number</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition"
                        value={registerNumber}
                        onChange={(e) => setRegisterNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Student Contact Number</label>
                      <input
                        type="tel"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition"
                        value={studentContact}
                        onChange={(e) => setStudentContact(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
                      <select
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition bg-white"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50/30 p-5 rounded-2xl border border-orange-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-brand-orange/10 rounded-lg text-brand-orange text-sm">🔒</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orange">Connected Parent Credentials</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    The parent logs in at the Parent Portal using the student's Register Number and the Parent Phone Number specified below. Ensure this is matching exactly with the parent's device number.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Contact Number</label>
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition"
                      placeholder="e.g. 9876543210"
                      value={parentContact}
                      onChange={(e) => setParentContact(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white font-bold text-sm uppercase tracking-wide shadow-md transition"
                >
                  Save Profile & Connection Changes
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-50 border border-dashed border-slate-200 p-12 text-center h-[400px] flex flex-col items-center justify-center">
              <p className="text-slate-400 font-semibold text-lg">No student selected</p>
              <p className="text-slate-400 text-xs mt-2 max-w-sm">
                Select a student from the directory sidebar on the left to edit their details, view their profile, or update their connected parent's phone number.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
