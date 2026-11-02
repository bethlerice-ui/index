module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed"
    });
  }

  try {
    const webhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("Booking webhook is not configured");
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const responseText = await response.text();

    let result = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = {
        message: "Unexpected response from booking service."
      };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        message: result.message || "Booking could not be processed."
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Booking error:", error);

    return res.status(500).json({
      ok: false,
      message: "We couldn't process your booking. Please try again."
    });
  }
};
