import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SMTP_HOST = Deno.env.get("SMTP_HOST") || "127.0.0.1"
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587", 10)
const SMTP_USER = Deno.env.get("SMTP_USER") || "admin@dossier.local"
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "admin"
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "Dossier Admin <noreply@dossier.local>"

interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

async function sendSmtp(
  host: string,
  port: number,
  user: string,
  pass: string,
  from: string,
  to: string[],
  subject: string,
  html: string,
  text?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const conn = await Deno.connect({ hostname: host, port })
    const reader = conn.readable.getReader()
    const writer = conn.writable.getWriter()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    async function readLine(): Promise<string> {
      let result = ""
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        result += decoder.decode(value, { stream: true })
        if (result.includes("\r\n")) break
      }
      return result.trim()
    }

    async function sendLine(line: string) {
      await writer.write(encoder.encode(line + "\r\n"))
    }

    await readLine() // greeting
    await sendLine(`EHLO localhost`)
    await readLine()

    await sendLine(`AUTH LOGIN`)
    await readLine()
    await sendLine(btoa(user))
    await readLine()
    await sendLine(btoa(pass))
    await readLine()

    await sendLine(`MAIL FROM:<${from}>`)
    await readLine()
    for (const addr of to) {
      await sendLine(`RCPT TO:<${addr}>`)
      await readLine()
    }
    await sendLine(`DATA`)
    await readLine()

    const plainText = text || html.replace(/<[^>]+>/g, "")
    const boundary = `----=_Part_${crypto.randomUUID()}`
    await sendLine(
      `From: ${from}\r\nTo: ${to.join(",")}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n--${boundary}\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n${plainText}\r\n\r\n--${boundary}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n${html}\r\n\r\n--${boundary}--\r\n.`
    )
    await readLine()
    await sendLine(`QUIT`)
    await readLine()

    conn.close()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Verify the request comes from a logged-in user via the Authorization header
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const payload: EmailPayload = await req.json()
    const to = Array.isArray(payload.to) ? payload.to : [payload.to]
    const from = payload.from || EMAIL_FROM

    const result = await sendSmtp(
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      from,
      to,
      payload.subject,
      payload.html,
      payload.text
    )

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
