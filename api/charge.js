// ============================================
// VISION SHOP — Culqi Charge API (Vercel)
// POST /api/charge
//
// Recibe: { token, amount, email, description }
// Procesa cargo con Culqi API v2
// Devuelve: { success, chargeId, message }
// ============================================

export default async function handler(req, res) {
  // Solo acepta POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { token, amount, email, description } = req.body;

  if (!token || !amount || !email) {
    return res.status(400).json({ success: false, message: "Faltan datos: token, amount, email" });
  }

  // ⚠️ CULQI SECRET KEY — configurar en Vercel Environment Variables
  // https://vercel.com/dashboard → Project → Settings → Environment Variables
  const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY;

  if (!CULQI_SECRET_KEY) {
    return res.status(500).json({ success: false, message: "Error de configuración del servidor" });
  }

  const auth = Buffer.from(CULQI_SECRET_KEY + ":").toString("base64");

  try {
    const response = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        source_id: token,
        amount: Math.round(amount * 100),   // Culqi usa céntimos (enteros)
        currency_code: "PEN",
        description: description || "VISION SHOP — Pedido online",
        email: email,
        metadata: {
          origin: "web",
          platform: "visionshop"
        }
      })
    });

    const data = await response.json();

    if (response.ok && data.object === "charge") {
      return res.status(200).json({
        success: true,
        chargeId: data.id,
        message: "Pago procesado exitosamente",
        data: {
          amount: data.amount / 100,
          currency: data.currency_code,
          receiptEmail: data.email
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: data.user_message || data.merchant_message || "Error al procesar el pago",
        code: data.error_code || "unknown"
      });
    }
  } catch (err) {
    console.error("Culqi API error:", err);
    return res.status(500).json({
      success: false,
      message: "Error de conexión con la pasarela de pago"
    });
  }
}
