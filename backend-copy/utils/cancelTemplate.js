export function buildCancelHtml({ order, user }) {
  const currency = 'INR';
  const orderId = String(order._id || '').slice(-6).toUpperCase();
  const total = Number(order.amount || 0);

  return `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#222;">
    <h2 style="margin:0 0 8px">Order Cancellation</h2>
    <p style="margin:0 0 16px">Hi ${user?.name || ''}, your order <strong>#${orderId}</strong> has been cancelled as requested.</p>

    <p style="margin:0 0 8px">Summary</p>
    <p style="margin:0 0 16px">Amount: <strong>₹${total.toFixed(2)} ${currency}</strong></p>

    <p style="margin-top:24px;color:#555; font-size:12px;">If you didn't request this, please reply to this email.</p>
  </div>
  `;
}


