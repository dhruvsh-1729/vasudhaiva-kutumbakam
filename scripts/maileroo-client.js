/**
 * Minimal Maileroo client used by scripts to replace Brevo.
 * Uses Maileroo's API v2 endpoints with a Brevo-compatible interface.
 */
const fetchFn = (...args) => {
  if (typeof fetch !== "undefined") return fetch(...args);
  throw new Error("Global fetch is not available. Use Node 18+ or provide a fetch polyfill.");
};

function toEmailObject(recipient) {
  if (!recipient) return null;
  if (typeof recipient === "string") return { address: recipient };
  const { email, address, name, display_name } = recipient;
  return {
    address: email || address,
    display_name: name || display_name || undefined,
  };
}

function mapAddresses(value) {
  if (!value) return undefined;
  const list = Array.isArray(value) ? value : [value];
  const mapped = list
    .map(toEmailObject)
    .filter((entry) => entry && entry.address);
  return mapped.length ? (mapped.length === 1 ? mapped[0] : mapped) : undefined;
}

function mapAttachments(list) {
  if (!list) return undefined;
  const attachments = list.map((item) => ({
    file_name: item.file_name || item.name,
    content_type: item.content_type || item.contentType,
    content: item.content,
    inline: item.inline,
  }));
  return attachments.length ? attachments : undefined;
}

async function mailerooRequest(path, payload) {
  const apiKey = process.env.MAILEROO_API_KEY;
  if (!apiKey) {
    throw new Error("MAILEROO_API_KEY is not set in environment variables.");
  }

  const baseUrl = process.env.MAILEROO_BASE_URL || "https://smtp.maileroo.com/api/v2";

  const response = await fetchFn(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok || data?.success === false) {
    const error = new Error(`Maileroo request failed: ${response.status} ${response.statusText}`);
    error.response = { status: response.status, body: data };
    throw error;
  }

  const referenceId =
    data?.data?.reference_id || data?.data?.reference_ids?.[0] || data?.reference_id || data?.id;

  return {
    messageId: referenceId,
    body: data,
  };
}

/**
 * Brevo-compatible sendTransacEmail wrapper.
 * Expects payload shape similar to Brevo's SDK and calls Maileroo /emails endpoint.
 */
async function sendTransacEmail(sendSmtpEmail) {
  const payload = {
    from: toEmailObject(sendSmtpEmail.sender),
    to: mapAddresses(sendSmtpEmail.to),
    cc: mapAddresses(sendSmtpEmail.cc),
    bcc: mapAddresses(sendSmtpEmail.bcc),
    reply_to: mapAddresses(sendSmtpEmail.replyTo || sendSmtpEmail.reply_to),
    subject: sendSmtpEmail.subject,
    html: sendSmtpEmail.htmlContent,
    plain: sendSmtpEmail.textContent,
    tracking: sendSmtpEmail.tracking,
    tags: sendSmtpEmail.tags,
    headers: sendSmtpEmail.headers,
    attachments: mapAttachments(sendSmtpEmail.attachment || sendSmtpEmail.attachments),
    reference_id: sendSmtpEmail.reference_id,
  };

  // Remove undefined keys to keep payload clean
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === null) {
      delete payload[key];
    }
  });

  return mailerooRequest("/emails", payload);
}

/**
 * Bulk helper for scripts that want a single API call (max 500 recipients per request).
 * messages: array of { to, from?, cc?, bcc?, reply_to?, reference_id?, template_data? }
 */
async function sendBulkEmails({ subject, html, plain, messages, tracking, tags, headers, attachments, template_id }) {
  const payload = {
    subject,
    html,
    plain,
    tracking,
    tags,
    headers,
    template_id,
    attachments: mapAttachments(attachments),
    messages: (messages || []).map((msg) => ({
      from: toEmailObject(msg.from),
      to: mapAddresses(msg.to),
      cc: mapAddresses(msg.cc),
      bcc: mapAddresses(msg.bcc),
      reply_to: mapAddresses(msg.reply_to || msg.replyTo),
      reference_id: msg.reference_id,
      template_data: msg.template_data,
      headers: msg.headers,
    })),
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === null) {
      delete payload[key];
    }
  });

  return mailerooRequest("/emails/bulk", payload);
}

module.exports = {
  sendTransacEmail,
  sendBulkEmails,
};
