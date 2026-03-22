import { Resend } from 'resend'
import type { Booking } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Банско Апартамент <noreply@bansko-apartment.com>'

function formatDateBG(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  if (!booking.guest_email) return

  const nights = booking.start_date && booking.end_date
    ? Math.round((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 86_400_000)
    : 0

  const checkInFmt = booking.start_date ? formatDateBG(booking.start_date) : '—'
  const checkOutFmt = booking.end_date ? formatDateBG(booking.end_date) : '—'

  const html = `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Потвърждение за резервация</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.65); margin: 0; font-size: 14px; }
    .badge { display: inline-block; background: #4f46e5; color: #fff; padding: 4px 14px; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 24px; }
    .details { background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: 600; color: #111827; }
    .total { background: #ede9fe; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .total-label { font-size: 15px; font-weight: 600; color: #4f46e5; }
    .total-value { font-size: 22px; font-weight: 800; color: #4f46e5; }
    .note { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 24px; background: #f0fdf4; padding: 14px 16px; border-radius: 10px; border-left: 3px solid #22c55e; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
    .footer a { color: #4f46e5; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">✓ Потвърдена</div>
      <h1>Резервацията е потвърдена!</h1>
      <p>Апартамент Банско — SPA комплекс</p>
    </div>
    <div class="body">
      <p class="greeting">Здравейте${booking.guest_name ? `, ${booking.guest_name}` : ''}!</p>
      <p style="color:#374151;font-size:14px;margin-bottom:24px;">Плащането е прието успешно. По-долу ще намерите детайлите на вашата резервация.</p>

      <div class="details">
        <div class="row">
          <span class="label">Пристигане</span>
          <span class="value">${checkInFmt}</span>
        </div>
        <div class="row">
          <span class="label">Напускане</span>
          <span class="value">${checkOutFmt}</span>
        </div>
        <div class="row">
          <span class="label">Нощи</span>
          <span class="value">${nights}</span>
        </div>
        ${booking.guests_count ? `<div class="row"><span class="label">Гости</span><span class="value">${booking.guests_count}</span></div>` : ''}
        <div class="row">
          <span class="label">Номер на резервация</span>
          <span class="value" style="font-family:monospace;font-size:12px;">${booking.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      ${booking.total_price ? `
      <div class="total">
        <span class="total-label">Платена сума</span>
        <span class="total-value">€${booking.total_price}</span>
      </div>
      ` : ''}

      <div class="note">
        <strong>Информация при пристигане:</strong><br/>
        Настаняване от 15:00 ч. Освобождаване до 11:00 ч. При въпроси свържете се с нас на имейл или телефон.
      </div>
    </div>
    <div class="footer">
      <p>Благодарим ви, че избрахте нашия апартамент в Банско!</p>
      <p style="margin-top:8px;">При въпроси: <a href="mailto:info@bansko-apartment.com">info@bansko-apartment.com</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()

  await resend.emails.send({
    from: FROM,
    to: booking.guest_email,
    subject: `✓ Резервация потвърдена — ${checkInFmt} – ${checkOutFmt}`,
    html,
  })

  // Notify owner
  await resend.emails.send({
    from: FROM,
    to: 'danimarkov81@gmail.com',
    subject: `🏠 Нова резервация — ${checkInFmt} – ${checkOutFmt}`,
    html: `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
  <h2 style="margin:0 0 16px;color:#111827;">Нова резервация</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Гост</td><td style="padding:8px 0;font-weight:600;border-bottom:1px solid #e5e7eb;">${booking.guest_name ?? '—'}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Имейл</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${booking.guest_email}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Телефон</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${booking.guest_phone ?? '—'}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Пристигане</td><td style="padding:8px 0;font-weight:600;border-bottom:1px solid #e5e7eb;">${checkInFmt}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Напускане</td><td style="padding:8px 0;font-weight:600;border-bottom:1px solid #e5e7eb;">${checkOutFmt}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Нощи</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${nights}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Гости</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${booking.guests_count ?? '—'}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;">Сума</td><td style="padding:8px 0;font-weight:700;font-size:18px;color:#4f46e5;">${booking.total_price ? `€${booking.total_price}` : '—'}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#9ca3af;">ID: ${booking.id}</p>
</div>
    `.trim(),
  })
}
