import twilio from 'twilio'

const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim()
const token = (process.env.TWILIO_AUTH_TOKEN || '').trim()
const from = (process.env.TWILIO_FROM_NUMBER || '').trim()
const country = (process.env.SMS_COUNTRY_CODE || '91').replace(/\D/g, '') || '91'

export function smsConfigured() {
  return Boolean(sid && token && from)
}

function toE164(digits) {
  let d = digits.replace(/\D/g, '')
  if (d.startsWith('0')) d = d.slice(1)
  if (d.length >= 11 && d.startsWith(country)) return `+${d}`
  if (d.length === 10) return `+${country}${d}`
  return `+${d}`
}

export async function sendOtpSms(normalizedDigits, code) {
  if (!smsConfigured()) return
  const to = toE164(normalizedDigits)
  const body = `StayTrack: your verification code is ${code}. Valid for 10 minutes.`
  const client = twilio(sid, token)
  await client.messages.create({ body, from, to })
}
