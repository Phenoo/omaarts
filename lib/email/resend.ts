import nodemailer from 'nodemailer';
import { Booking, Order, TransactionalEmailPayload } from '../types';

const resendApiKey = process.env.RESEND_API_KEY;
const requiredSupportAddress = 'support@artsybyoma.com';
const defaultSupportSender = `Arts by Oma <${requiredSupportAddress}>`;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artsybyoma.com';

function getApprovedSender(value?: string) {
  return value?.includes(requiredSupportAddress) ? value : defaultSupportSender;
}

const resendFromEmail = getApprovedSender(process.env.RESEND_FROM_EMAIL);
const smtpFromEmail = getApprovedSender(process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL);

function getBookingReceiptUrl(bookingId: string) {
  return `${siteUrl}/checkout/confirmation?type=booking&id=${bookingId}`;
}

function getOrderReceiptUrl(orderId: string) {
  return `${siteUrl}/checkout/confirmation?type=order&id=${orderId}`;
}

type EmailDispatchPayload = Omit<TransactionalEmailPayload, 'to'> & {
  to: string | string[];
};

function normalizeRecipients(to: EmailDispatchPayload['to']) {
  return Array.isArray(to) ? to : [to];
}

function getCustomBookingConfirmationPayload(booking: Booking): EmailDispatchPayload | null {
  const customEmail = booking.confirmationEmail;
  if (!customEmail) {
    return null;
  }

  if (
    typeof customEmail.subject !== 'string' ||
    customEmail.subject.trim().length === 0 ||
    typeof customEmail.html !== 'string' ||
    customEmail.html.trim().length === 0 ||
    typeof customEmail.text !== 'string' ||
    customEmail.text.trim().length === 0
  ) {
    return null;
  }

  return {
    to: customEmail.to && customEmail.to.length > 0 ? customEmail.to : booking.email,
    subject: customEmail.subject,
    html: customEmail.html,
    text: customEmail.text,
  };
}

async function sendEmail(payload: EmailDispatchPayload) {
  const resendDelivered = await sendWithResend(payload);
  if (resendDelivered) {
    return;
  }

  const smtpDelivered = await sendWithSmtp(payload);
  if (smtpDelivered) {
    return;
  }

  console.error('Email delivery failed: neither Resend nor SMTP transport succeeded.');
}

async function sendWithResend(payload: EmailDispatchPayload) {
  if (!resendApiKey) {
    console.warn('Resend API key is not configured. Trying SMTP fallback instead.');
    return false;
  }

  try {
    const recipients = normalizeRecipients(payload.to);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer re_ZZtNoJjE_4X5ffDuyVUu5YXEcXs2MguqG`,
        'Content-Type': 'application/json',
        'User-Agent': 'my-app/1.0',
      },
      body: JSON.stringify({
        from: 'support@artsybyoma.com',
        to: recipients,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend API error:', data);
      return false;
    }

    console.log(`Email successfully sent via Resend to ${recipients.join(', ')}. ID: ${data.id}`);
    return true;
  } catch (err) {
    console.error('Failed to dispatch email via Resend:', err);
    return false;
  }
}

async function sendWithSmtp(payload: EmailDispatchPayload) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP credentials are not configured. Cannot use Nodemailer fallback.');
    return false;
  }

  try {
    const recipients = normalizeRecipients(payload.to);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: smtpFromEmail,
      to: recipients,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    console.log(`Email successfully sent via Nodemailer to ${recipients.join(', ')}. ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('Failed to dispatch email via Nodemailer:', err);
    return false;
  }
}

export async function sendBookingConfirmationEmail(booking: Booking) {
  const customConfirmationEmail = getCustomBookingConfirmationPayload(booking);
  if (customConfirmationEmail) {
    await sendEmail(customConfirmationEmail);
    return;
  }

  const receiptUrl = getBookingReceiptUrl(booking.id);
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcf9ff; color: #2d1658; margin: 0; padding: 20px; }
          .container { max-width: 600px; background-color: #ffffff; border: 1px solid #eae1f5; border-radius: 16px; margin: 0 auto; padding: 30px; box-shadow: 0 4px 12px rgba(111, 59, 210, 0.05); }
          .logo { text-align: center; margin-bottom: 25px; }
          .header { text-align: center; border-bottom: 1px solid #f0e6fc; padding-bottom: 20px; }
          .header h1 { color: #6f3bd2; font-family: Georgia, serif; font-size: 28px; margin: 0; }
          .details { margin: 25px 0; font-size: 14px; line-height: 1.6; }
          .details-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #f0e6fc; padding: 8px 0; }
          .details-row strong { color: #f47b20; }
          .extra-box { background-color: #fcf9ff; border: 1px solid #eae1f5; border-radius: 12px; padding: 15px; margin: 20px 0; font-size: 13px; }
          .extra-box strong { color: #6f3bd2; display: block; margin-bottom: 5px; }
          .footer { text-align: center; font-size: 12px; color: #8c7fa6; margin-top: 30px; border-top: 1px solid #f0e6fc; padding-top: 20px; }
          .btn { display: inline-block; padding: 12px 25px; background-color: #6f3bd2; color: #ffffff !important; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 15px; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h2 style="font-family: Georgia, serif; color: #6f3bd2; margin: 0;">PAINT &amp; SIP WITH OMA</h2>
            <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.1em; color: #f47b20; text-transform: uppercase;">Creative Studio</span>
          </div>
          
          <div class="header">
            <h1>Booking Confirmed!</h1>
            <p style="font-size: 14px; margin: 5px 0 0 0; color: #8c7fa6;">Reference Code: ${booking.bookingNumber}</p>
          </div>

          <div class="details">
            <p>Hi <strong>${booking.customerName}</strong>,</p>
            <p>Your creative experience has been booked and paid successfully. Here is your receipt summary:</p>
            
            <div class="details-row">
              <span>Experience:</span>
              <span><strong>${booking.activitySnapshot.name}</strong></span>
            </div>
            ${booking.variant ? `
              <div class="details-row">
                <span>Option Selected:</span>
                <span>${booking.variant.name}</span>
              </div>
            ` : ''}
            <div class="details-row">
              <span>Scheduled Date:</span>
              <span>${booking.date}</span>
            </div>
            <div class="details-row">
              <span>Time Slot:</span>
              <span>${booking.startTime}</span>
            </div>
            <div class="details-row">
              <span>Guests / Seats:</span>
              <span>${booking.numberOfGuests} pax</span>
            </div>
            <div class="details-row" style="border-bottom: none; font-size: 16px; margin-top: 10px;">
              <span>Amount Paid:</span>
              <span style="color: #6f3bd2; font-weight: bold;">₦${booking.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="extra-box">
            <strong>Studio Address &amp; Directions</strong>
            ABO Gallery, No. 40 Majuo Street, Umudioka, Awka, Anambra State, Nigeria.<br/>
            Please arrive 10-15 minutes early to select your canvas layout and settle in.
          </div>

          <div class="extra-box" style="border-left: 3px solid #f47b20;">
            <strong>Studio Policy</strong>
            Guests are responsible for damage caused during their stay. Studio equipment and facilities should be treated with care and left in appropriate condition after use.
          </div>

          <div style="text-align: center;">
            <a href="${receiptUrl}" class="btn">View Printable Receipt</a>
          </div>

          <div class="footer">
            <p>If you need to reschedule or have questions, please call us at +2348167009545 or reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Arts by Oma. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = [
    `Booking Confirmed: ${booking.activitySnapshot.name}`,
    `Booking Number: ${booking.bookingNumber}`,
    `Customer: ${booking.customerName}`,
    `Date: ${booking.date}`,
    `Time: ${booking.startTime}`,
    `Guests: ${booking.numberOfGuests}`,
    `Amount Paid: NGN ${booking.total.toLocaleString()}`,
    `Receipt: ${receiptUrl}`,
  ].join('\n');

  await sendEmail({
    to: booking.email,
    subject: `Booking Confirmed: ${booking.activitySnapshot.name} (#${booking.bookingNumber})`,
    html,
    text,
  });
}

export async function sendOrderConfirmationEmail(order: Order) {
  const receiptUrl = getOrderReceiptUrl(order.id);
  const itemsHtml = order.items.map((item) => `
    <tr style="border-bottom: 1px dashed #f0e6fc; font-size: 13px;">
      <td style="padding: 10px 0; font-family: Georgia, serif; font-weight: bold;">${item.title}</td>
      <td style="padding: 10px 0; text-align: right; font-family: monospace;">₦${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcf9ff; color: #2d1658; margin: 0; padding: 20px; }
          .container { max-width: 600px; background-color: #ffffff; border: 1px solid #eae1f5; border-radius: 16px; margin: 0 auto; padding: 30px; box-shadow: 0 4px 12px rgba(111, 59, 210, 0.05); }
          .logo { text-align: center; margin-bottom: 25px; }
          .header { text-align: center; border-bottom: 1px solid #f0e6fc; padding-bottom: 20px; }
          .header h1 { color: #6f3bd2; font-family: Georgia, serif; font-size: 28px; margin: 0; }
          .details { margin: 25px 0; font-size: 14px; line-height: 1.6; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .details-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #f0e6fc; padding: 8px 0; }
          .extra-box { background-color: #fcf9ff; border: 1px solid #eae1f5; border-radius: 12px; padding: 15px; margin: 20px 0; font-size: 13px; }
          .extra-box strong { color: #6f3bd2; display: block; margin-bottom: 5px; }
          .footer { text-align: center; font-size: 12px; color: #8c7fa6; margin-top: 30px; border-top: 1px solid #f0e6fc; padding-top: 20px; }
          .btn { display: inline-block; padding: 12px 25px; background-color: #6f3bd2; color: #ffffff !important; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 15px; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h2 style="font-family: Georgia, serif; color: #6f3bd2; margin: 0;">ARTS BY OMA</h2>
            <span style="font-size: 10px; font-family: monospace; letter-spacing: 0.1em; color: #f47b20; text-transform: uppercase;">Gallery &amp; E-commerce</span>
          </div>
          
          <div class="header">
            <h1>Thank You for Your Art Purchase!</h1>
            <p style="font-size: 14px; margin: 5px 0 0 0; color: #8c7fa6;">Order Code: ${order.orderNumber}</p>
          </div>

          <div class="details">
            <p>Hi <strong>${order.customerName}</strong>,</p>
            <p>We are preparing your artwork order. Below is your detailed receipt:</p>
            
            <table width="100%" class="items-table">
              <thead>
                <tr style="border-bottom: 2px solid #6f3bd2; font-size: 11px; text-transform: uppercase; font-family: monospace; color: #8c7fa6; text-align: left;">
                  <th style="padding-bottom: 8px;">Artwork</th>
                  <th style="padding-bottom: 8px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="details-row">
              <span>Fulfillment Option:</span>
              <span style="text-transform: uppercase; font-weight: bold;">${order.deliveryOption === 'delivery' ? 'Shipment' : 'Studio Pickup'}</span>
            </div>
            ${order.deliveryOption === 'delivery' ? `
              <div class="details-row">
                <span>Shipping Fee:</span>
                <span>₦${order.deliveryFee.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="details-row" style="border-bottom: none; font-size: 16px; margin-top: 10px;">
              <span>Grand Total Paid:</span>
              <span style="color: #6f3bd2; font-weight: bold;">₦${order.total.toLocaleString()}</span>
            </div>
          </div>

          ${order.deliveryOption === 'delivery' ? `
            <div class="extra-box">
              <strong>Delivery Address</strong>
              ${order.deliveryAddress}<br/>
              Orders are packaged inside high-safety crates and shipped within 3-5 business days. We will email you the tracking details once shipped.
            </div>
          ` : `
            <div class="extra-box">
              <strong>Pickup Location</strong>
              ABO Gallery, No. 40 Majuo Street, Umudioka, Awka, Anambra State, Nigeria.<br/>
              Please call us at +2348167009545 to coordinate your preferred pickup hour.
            </div>
          `}

          <div style="text-align: center;">
            <a href="${receiptUrl}" class="btn">View Printable Invoice</a>
          </div>

          <div class="footer">
            <p>If you have any questions about shipment or custom framing options, please reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Arts by Oma. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = [
    `Order Confirmed`,
    `Order Number: ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Items: ${order.items.map((item) => item.title).join(', ')}`,
    `Grand Total Paid: NGN ${order.total.toLocaleString()}`,
    `Receipt: ${receiptUrl}`,
  ].join('\n');

  await sendEmail({
    to: order.email,
    subject: `Order Confirmed: Thank you for your art purchase! (#${order.orderNumber})`,
    html,
    text,
  });
}

export async function sendBookingRequestReceivedEmail(booking: Booking) {
  const receiptUrl = getBookingReceiptUrl(booking.id);
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcf9ff; color: #2d1658; margin: 0; padding: 20px; }
          .container { max-width: 600px; background-color: #ffffff; border: 1px solid #eae1f5; border-radius: 16px; margin: 0 auto; padding: 30px; box-shadow: 0 4px 12px rgba(111, 59, 210, 0.05); }
          .header { text-align: center; border-bottom: 1px solid #f0e6fc; padding-bottom: 20px; }
          .header h1 { color: #6f3bd2; font-family: Georgia, serif; font-size: 28px; margin: 0; }
          .details-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #f0e6fc; padding: 8px 0; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 25px; background-color: #6f3bd2; color: #ffffff !important; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 18px; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Request Received</h1>
            <p style="font-size: 14px; margin: 8px 0 0; color: #8c7fa6;">Booking Number: ${booking.bookingNumber}</p>
          </div>
          <p>Hi <strong>${booking.customerName}</strong>,</p>
          <p>We have received your booking request and saved your details. Our team will follow up with pricing or confirmation details shortly.</p>
          <div class="details-row">
            <span>Experience</span>
            <span>${booking.activitySnapshot.name}</span>
          </div>
          <div class="details-row">
            <span>Date</span>
            <span>${booking.date}</span>
          </div>
          <div class="details-row">
            <span>Time</span>
            <span>${booking.startTime}</span>
          </div>
          <div class="details-row">
            <span>Guests</span>
            <span>${booking.numberOfGuests}</span>
          </div>
          <div style="text-align: center;">
            <a href="${receiptUrl}" class="btn">View Booking Details</a>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = [
    `Booking Request Received`,
    `Booking Number: ${booking.bookingNumber}`,
    `Experience: ${booking.activitySnapshot.name}`,
    `Date: ${booking.date}`,
    `Time: ${booking.startTime}`,
    `Guests: ${booking.numberOfGuests}`,
    `Details: ${receiptUrl}`,
  ].join('\n');

  await sendEmail({
    to: booking.email,
    subject: `Booking Request Received (#${booking.bookingNumber})`,
    html,
    text,
  });
}
