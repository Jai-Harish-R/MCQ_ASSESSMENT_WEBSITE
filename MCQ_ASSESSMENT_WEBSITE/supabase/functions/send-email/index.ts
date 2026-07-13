import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"
import nodemailer from "npm:nodemailer"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: smtpData, error: smtpError } = await supabaseAdmin
      .from('smtp_settings')
      .select('*')
      .limit(1)
      .single()

    if (smtpError || !smtpData) {
      throw new Error('SMTP credentials not found in database. Make sure you have created the smtp_settings table and inserted your email/password.')
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpData.email,
        pass: smtpData.password,
      },
    })

    const payload = await req.json()
    const { toEmail, subject, htmlContent } = payload

    if (!toEmail || !htmlContent) {
      throw new Error('Missing toEmail or htmlContent in request body')
    }

    const mailOptions = {
      from: smtpData.email,
      to: toEmail,
      subject: subject || 'Your Assessment Results',
      html: htmlContent,
    }

    const info = await transporter.sendMail(mailOptions)

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
