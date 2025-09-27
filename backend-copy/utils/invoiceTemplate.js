export function buildInvoiceHtml({ order, user }) {
    const currency = 'INR';
    const orderId = String(order._id || '').slice(-6).toUpperCase();
    const itemsRows = (order.items || [])
      .map(
        (it) => `
          <tr>
            <td style="padding:12px 15px; border:1px solid #ddd;">${it.name}</td>
            <td style="padding:12px 15px; border:1px solid #ddd; text-align:center;">${it.quantity}</td>
            <td style="padding:12px 15px; border:1px solid #ddd; text-align:right;">₹${Number(it.price).toFixed(2)}</td>
            <td style="padding:12px 15px; border:1px solid #ddd; text-align:right;">₹${(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
          </tr>`
      )
      .join('');
  
    const shippingAddress = order.address
      ? `${order.address.firstName || ''} ${order.address.lastName || ''}<br/>${order.address.street || ''}<br/>${order.address.city || ''}, ${order.address.state || ''} ${order.address.zip || ''}<br/>${order.address.country || ''}`
      : '';
  
    const total = Number(order.amount || 0);
  
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333; max-width:650px; margin:auto; background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.05); padding:30px;">
      <h1 style="color:#0073e6; margin-bottom:10px;">Order Confirmation</h1>
      <p style="font-size:16px; margin-top:0;">Hi <strong>${user?.name || 'Customer'}</strong>, thank you for your purchase! Your order <strong>#${orderId}</strong> has been received and is being processed.</p>
  
      <h2 style="border-bottom:2px solid #0073e6; padding-bottom:8px; margin-top:30px; margin-bottom:15px; color:#0073e6;">Order Summary</h2>
      <table style="width:100%; border-collapse:collapse; font-size:15px;">
        <thead>
          <tr style="background:#f7f9fc;">
            <th style="padding:12px 15px; border:1px solid #ddd; text-align:left; color:#555;">Item</th>
            <th style="padding:12px 15px; border:1px solid #ddd; text-align:center; color:#555;">Qty</th>
            <th style="padding:12px 15px; border:1px solid #ddd; text-align:right; color:#555;">Price</th>
            <th style="padding:12px 15px; border:1px solid #ddd; text-align:right; color:#555;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
          <tr style="font-weight:bold; background:#e6f0ff;">
            <td colspan="3" style="padding:12px 15px; border:1px solid #ddd; text-align:right;">Grand Total</td>
            <td style="padding:12px 15px; border:1px solid #ddd; text-align:right;">₹${total.toFixed(2)} ${currency}</td>
          </tr>
        </tbody>
      </table>
  
      <h2 style="border-bottom:2px solid #0073e6; padding-bottom:8px; margin-top:40px; margin-bottom:15px; color:#0073e6;">Shipping Address</h2>
      <p style="font-size:15px; line-height:1.6; color:#555;">
        ${shippingAddress.replace(/\n/g, '<br>') || 'No shipping address provided.'}
      </p>
  
      <p style="margin-top:40px; font-size:13px; color:#999; text-align:center;">
        This email serves as your invoice. If you have any questions, simply reply to this email.
      </p>
    </div>
    `;
  }