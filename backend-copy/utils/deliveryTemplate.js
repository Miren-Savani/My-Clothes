export function buildDeliveryHtml({ order, user }) {
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
      ? `${order.address.firstName || ''} ${order.address.lastName || ''}<br/>${order.address.street || ''}<br/>${order.address.city || ''}, ${order.address.state || ''} ${order.address.zipcode || ''}<br/>${order.address.country || ''}`
      : '';
  
    const subtotal = Number(order.subtotal || 0);
    const discount = Number(order.discount || 0);
    const deliveryFee = 10; // Fixed delivery fee
    const total = Number(order.amount || 0);
    const deliveryDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333; max-width:650px; margin:auto; background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.05); padding:30px;">
      
      <!-- Header with delivery confirmation -->
      <div style="text-align:center; margin-bottom:30px; padding:20px; background:linear-gradient(135deg, #10b981, #059669); border-radius:8px; color:white;">
        <h1 style="color:white; margin:0 0 10px 0; font-size:28px;">🎉 Order Delivered Successfully!</h1>
        <p style="font-size:16px; margin:0; opacity:0.9;">Your order has been delivered on ${deliveryDate}</p>
      </div>

      <p style="font-size:16px; margin-bottom:20px;">Hi <strong>${user?.name || 'Customer'}</strong>, great news! Your order <strong>#${orderId}</strong> has been successfully delivered to your address.</p>
  
      <h2 style="border-bottom:2px solid #10b981; padding-bottom:8px; margin-top:30px; margin-bottom:15px; color:#10b981;">📦 Order Details</h2>
      <table style="width:100%; border-collapse:collapse; font-size:15px;">
        <thead>
          <tr style="background:#f0fdf4;">
            <th style="padding:12px 15px; border:1px solid #ddd; text-align:left; color:#555;">Item</th>
            <th style="padding:12px 15px; border:1px solid #ddd; text-align:center; color:#555;">Qty</th>
            <th style="padding:12px 15px; border:1px solid #ddd; text-align:right; color:#555;">Price</th>
            <th style="padding:12px 15px; border:1px solid #ddd; text-align:right; color:#555;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <h2 style="border-bottom:2px solid #10b981; padding-bottom:8px; margin-top:30px; margin-bottom:15px; color:#10b981;">💰 Bill Summary</h2>
      <div style="background:#f9fafb; padding:20px; border-radius:8px; border:1px solid #e5e7eb;">
        <table style="width:100%; font-size:15px;">
          <tr>
            <td style="padding:8px 0; color:#555;">Subtotal:</td>
            <td style="padding:8px 0; text-align:right; font-weight:500;">₹${subtotal.toFixed(2)}</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td style="padding:8px 0; color:#555;">Discount (${order.couponCode || 'Coupon'}):</td>
            <td style="padding:8px 0; text-align:right; color:#10b981; font-weight:500;">-₹${discount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding:8px 0; color:#555;">Delivery Fee:</td>
            <td style="padding:8px 0; text-align:right; font-weight:500;">₹${deliveryFee.toFixed(2)}</td>
          </tr>
          <tr style="border-top:2px solid #10b981; font-weight:bold; font-size:16px;">
            <td style="padding:12px 0; color:#10b981;">Total Paid:</td>
            <td style="padding:12px 0; text-align:right; color:#10b981;">₹${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
  
      <h2 style="border-bottom:2px solid #10b981; padding-bottom:8px; margin-top:30px; margin-bottom:15px; color:#10b981;">📍 Delivery Address</h2>
      <div style="background:#f0fdf4; padding:15px; border-radius:8px; border-left:4px solid #10b981;">
        <p style="font-size:15px; line-height:1.6; color:#555; margin:0;">
          ${shippingAddress.replace(/\n/g, '<br>') || 'No shipping address provided.'}
        </p>
      </div>

      <h2 style="border-bottom:2px solid #10b981; padding-bottom:8px; margin-top:30px; margin-bottom:15px; color:#10b981;">💳 Payment Information</h2>
      <div style="background:#f9fafb; padding:15px; border-radius:8px;">
        <p style="margin:0; font-size:15px; color:#555;">
          <strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}<br/>
          <strong>Payment Status:</strong> ${order.paymentMethod === 'COD' ? '✅ Paid (Cash on Delivery)' : (order.payment ? '✅ Paid' : '✅ Paid (Delivered)')}
        </p>
      </div>

      <!-- Call to action -->
      <div style="text-align:center; margin:30px 0; padding:20px; background:#f0fdf4; border-radius:8px;">
        <h3 style="color:#10b981; margin:0 0 10px 0;">Thank you for shopping with us!</h3>
        <p style="margin:0; color:#555;">We hope you love your purchase. If you have any questions or need assistance, please don't hesitate to contact us.</p>
      </div>
  
      <p style="margin-top:40px; font-size:13px; color:#999; text-align:center;">
        This email serves as your delivery confirmation and invoice. Keep this for your records.
      </p>
    </div>
    `;
  }
