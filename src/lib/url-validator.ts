import dns from "dns/promises"

const PRIVATE_IP_RANGES = [
  /^127\./,                    // Loopback
  /^10\./,                     // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
  /^192\.168\./,               // Class C private
  /^169\.254\./,               // Link-local
  /^0\.0\.0\.0$/,              // Unspecified
  /^::1$/,                     // IPv6 loopback
  /^fc00:/i,                   // IPv6 unique local
  /^fe80:/i,                   // IPv6 link-local
  /^::ffff:/i,                 // IPv6-mapped IPv4
  /^0\./,                      // 0.0.0.0/8
]

const BLOCKED_HOSTNAMES = [
  "metadata.google.internal",
  "metadata.google.internal.",
  "metadata.azure.com",
  "kubernetes.default.svc",
  "kubernetes.default",
  "host.docker.internal",
  "localhost",
]

export async function isUrlSafe(urlString: string): Promise<boolean> {
  let parsed: URL
  try {
    parsed = new URL(urlString)
  } catch {
    return false
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return false
  }

  const hostname = parsed.hostname

  // Block known cloud metadata hostnames
  if (BLOCKED_HOSTNAMES.includes(hostname.toLowerCase())) {
    return false
  }

  // Check if hostname is already an IP
  if (isBlockedIp(hostname)) {
    return false
  }

  // Resolve hostname to IP and check
  try {
    const { address } = await dns.lookup(hostname)
    if (isBlockedIp(address)) {
      return false
    }
  } catch {
    // DNS resolution failed — block to be safe
    return false
  }

  return true
}

function isBlockedIp(ip: string): boolean {
  // Specific cloud metadata IP
  if (ip === "169.254.169.254") {
    return true
  }

  return PRIVATE_IP_RANGES.some((range) => range.test(ip))
}
