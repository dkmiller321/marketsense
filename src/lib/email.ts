import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendAlert(to: string, url: string, changes: string[]) {
  const text = [
    `We detected pricing/plan changes on: ${url}`,
    "",
    ...changes,
    "",
    "— MarketSense (beta)"
  ].join("\n");

  await sgMail.send({
    to,
    from: process.env.FROM_EMAIL!,   // must be on your authenticated domain
    subject: "🚨 Pricing update detected",
    text,                            // keep transactional; no HTML required
    // If you add HTML later:
    // html: text.replace(/\n/g, "<br/>"),
    mailSettings: {
      sandboxMode: { enable: false },              // ensure real delivery
    },
    trackingSettings: {
      clickTracking: { enable: false, enableText: false }, // transactional-friendly
      openTracking: { enable: false },
      subscriptionTracking: { enable: false },
    },
  });
}
