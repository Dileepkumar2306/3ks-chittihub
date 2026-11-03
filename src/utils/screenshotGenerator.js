// Generates realistic UPI & Bank Payment Proof SVG Data URLs for PhonePe, Google Pay, and Paytm receipts

export const generatePaymentScreenshot = ({
  app = 'phonepe', // 'phonepe' | 'gpay' | 'paytm' | 'bank'
  amount = 5000,
  memberName = 'Ravi Kumar',
  memberPhone = '9848012345',
  groupName = 'Group A - Sri Venkateswara',
  utr = '410294812392',
  date = '05 Jan 2026, 11:24 AM',
  recipient = '3KS Chit Funds'
}) => {
  const formattedAmount = Number(amount).toLocaleString('en-IN');
  const safeMember = memberName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeGroup = groupName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeRecipient = recipient.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let svg = '';

  if (app === 'phonepe') {
    svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 620" width="100%" height="100%">
      <defs>
        <linearGradient id="ppGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5f259f"/>
          <stop offset="100%" stop-color="#3c136b"/>
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.25"/>
        </filter>
      </defs>

      <!-- Phone Body -->
      <rect width="380" height="620" rx="24" fill="#0f1015"/>

      <!-- PhonePe Header -->
      <rect width="380" height="110" rx="24" fill="url(#ppGrad)"/>
      <rect y="86" width="380" height="24" fill="url(#ppGrad)"/>

      <!-- Header content -->
      <text x="24" y="45" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">9:41</text>
      <circle cx="330" cy="40" r="3" fill="#ffffff"/>
      <circle cx="340" cy="40" r="3" fill="#ffffff"/>
      <rect x="348" y="34" width="16" height="10" rx="2" fill="none" stroke="#ffffff" stroke-width="1.5"/>

      <!-- PhonePe Brand Bar -->
      <text x="24" y="85" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="20" font-weight="800" letter-spacing="0.5">PhonePe</text>
      <text x="356" y="85" text-anchor="end" fill="#f3c969" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">PAID ✓</text>

      <!-- Main Receipt Card -->
      <rect x="18" y="125" width="344" height="475" rx="16" fill="#1b1c24" stroke="#2d2e3d" stroke-width="1"/>

      <!-- Success Checkmark Circle -->
      <circle cx="190" cy="180" r="30" fill="#00b875" filter="url(#shadow)"/>
      <path d="M178 180 L186 188 L204 170" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>

      <text x="190" y="235" text-anchor="middle" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="18" font-weight="700">Transaction Successful</text>
      <text x="190" y="256" text-anchor="middle" fill="#9ca3af" font-family="-apple-system, sans-serif" font-size="12">${date}</text>

      <!-- Amount -->
      <text x="190" y="305" text-anchor="middle" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="34" font-weight="900" letter-spacing="-0.5">₹${formattedAmount}</text>

      <!-- Divider -->
      <line x1="36" y1="330" x2="344" y2="330" stroke="#2d2e3d" stroke-width="1" stroke-dasharray="4 4"/>

      <!-- Details List -->
      <g font-family="-apple-system, sans-serif">
        <text x="36" y="360" fill="#9ca3af" font-size="12">Paid To</text>
        <text x="344" y="360" text-anchor="end" fill="#ffffff" font-size="13" font-weight="700">${safeRecipient}</text>

        <text x="36" y="390" fill="#9ca3af" font-size="12">Chit Group</text>
        <text x="344" y="390" text-anchor="end" fill="#f3c969" font-size="12" font-weight="600">${safeGroup}</text>

        <text x="36" y="420" fill="#9ca3af" font-size="12">Sent by Member</text>
        <text x="344" y="420" text-anchor="end" fill="#ffffff" font-size="13" font-weight="600">${safeMember} (${memberPhone})</text>

        <text x="36" y="450" fill="#9ca3af" font-size="12">Banking Name</text>
        <text x="344" y="450" text-anchor="end" fill="#ffffff" font-size="12">3KS CHIT FUNDS PVT LTD</text>

        <text x="36" y="480" fill="#9ca3af" font-size="12">UPI Ref No (UTR)</text>
        <text x="344" y="480" text-anchor="end" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="700">${utr}</text>

        <text x="36" y="510" fill="#9ca3af" font-size="12">Payment Mode</text>
        <text x="344" y="510" text-anchor="end" fill="#a78bfa" font-size="12" font-weight="700">PhonePe UPI</text>
      </g>

      <!-- Footer Security Note -->
      <rect x="36" y="535" width="308" height="42" rx="8" fill="#14151d"/>
      <text x="190" y="560" text-anchor="middle" fill="#6b7280" font-family="-apple-system, sans-serif" font-size="11">
        🔒 256-bit Encrypted • Verified WhatsApp Proof
      </text>
    </svg>`;
  } else if (app === 'gpay') {
    svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 620" width="100%" height="100%">
      <defs>
        <filter id="shadow2" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.2"/>
        </filter>
      </defs>

      <!-- GPay White Theme Background -->
      <rect width="380" height="620" rx="24" fill="#ffffff"/>

      <!-- Status bar -->
      <text x="24" y="38" fill="#1f2937" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">11:24</text>
      <circle cx="330" cy="34" r="3" fill="#1f2937"/>
      <circle cx="340" cy="34" r="3" fill="#1f2937"/>
      <rect x="348" y="28" width="16" height="10" rx="2" fill="none" stroke="#1f2937" stroke-width="1.5"/>

      <!-- Google Pay Logo Marks -->
      <g transform="translate(160, 60)">
        <path d="M0 0 L15 0 C25 0 25 15 15 15 L0 15 Z" fill="#4285f4"/>
        <circle cx="35" cy="8" r="6" fill="#34a853"/>
        <circle cx="48" cy="8" r="6" fill="#fbbc05"/>
        <circle cx="61" cy="8" r="6" fill="#ea4335"/>
      </g>

      <!-- Center Big Amount Card -->
      <circle cx="190" cy="160" r="34" fill="#1e8e3e" filter="url(#shadow2)"/>
      <path d="M176 160 L186 170 L206 150" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>

      <text x="190" y="225" text-anchor="middle" fill="#1f2937" font-family="-apple-system, sans-serif" font-size="34" font-weight="900">₹${formattedAmount}</text>
      <text x="190" y="250" text-anchor="middle" fill="#1e8e3e" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">Completed ✓</text>
      <text x="190" y="272" text-anchor="middle" fill="#6b7280" font-family="-apple-system, sans-serif" font-size="12">${date}</text>

      <!-- Receipt Box -->
      <rect x="22" y="295" width="336" height="295" rx="14" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>

      <g font-family="-apple-system, sans-serif">
        <text x="40" y="330" fill="#64748b" font-size="12">Paid to</text>
        <text x="338" y="330" text-anchor="end" fill="#0f172a" font-size="14" font-weight="700">${safeRecipient}</text>
        <text x="338" y="348" text-anchor="end" fill="#64748b" font-size="11">3kschits@upi</text>

        <line x1="40" y1="365" x2="338" y2="365" stroke="#e2e8f0" stroke-width="1"/>

        <text x="40" y="390" fill="#64748b" font-size="12">From Member</text>
        <text x="338" y="390" text-anchor="end" fill="#0f172a" font-size="13" font-weight="600">${safeMember}</text>
        <text x="338" y="408" text-anchor="end" fill="#64748b" font-size="11">+91 ${memberPhone}</text>

        <text x="40" y="435" fill="#64748b" font-size="12">Chitti Group</text>
        <text x="338" y="435" text-anchor="end" fill="#b45309" font-size="13" font-weight="700">${safeGroup}</text>

        <line x1="40" y1="450" x2="338" y2="450" stroke="#e2e8f0" stroke-width="1"/>

        <text x="40" y="475" fill="#64748b" font-size="12">UPI Transaction ID</text>
        <text x="338" y="475" text-anchor="end" fill="#0f172a" font-size="12" font-family="monospace" font-weight="700">${utr}</text>

        <text x="40" y="505" fill="#64748b" font-size="12">Google Transaction ID</text>
        <text x="338" y="505" text-anchor="end" fill="#64748b" font-size="11" font-family="monospace">CICAgODV79mJPA</text>

        <text x="40" y="535" fill="#64748b" font-size="12">Payment Mode</text>
        <text x="338" y="535" text-anchor="end" fill="#2563eb" font-size="12" font-weight="700">Google Pay (GPay)</text>

        <rect x="40" y="552" width="298" height="26" rx="6" fill="#e0f2fe"/>
        <text x="189" y="569" text-anchor="middle" fill="#0369a1" font-size="11" font-weight="600">✓ Screenshot Shared in WhatsApp Group</text>
      </g>
    </svg>`;
  } else {
    // Paytm / Fast UPI
    svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 620" width="100%" height="100%">
      <!-- Paytm Dark Slate Theme -->
      <rect width="380" height="620" rx="24" fill="#0d1b2a"/>

      <!-- Header with Cyan -->
      <rect width="380" height="90" rx="24" fill="#1b263b"/>
      <text x="24" y="42" fill="#e0e1dd" font-family="-apple-system, sans-serif" font-size="13">10:15</text>
      <text x="190" y="65" text-anchor="middle" fill="#00b4d8" font-family="-apple-system, sans-serif" font-size="19" font-weight="900" letter-spacing="1">Paytm UPI</text>

      <g transform="translate(150, 110)">
        <circle cx="40" cy="40" r="32" fill="#06d6a0"/>
        <path d="M28 40 L36 48 L54 28" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <text x="190" y="210" text-anchor="middle" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="17" font-weight="700">Money Sent Successfully</text>
      <text x="190" y="255" text-anchor="middle" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="34" font-weight="900">₹${formattedAmount}</text>
      <text x="190" y="280" text-anchor="middle" fill="#778da9" font-family="-apple-system, sans-serif" font-size="12">${date}</text>

      <rect x="20" y="305" width="340" height="280" rx="14" fill="#1b263b" stroke="#415a77" stroke-width="1"/>

      <g font-family="-apple-system, sans-serif">
        <text x="36" y="340" fill="#778da9" font-size="12">To</text>
        <text x="344" y="340" text-anchor="end" fill="#ffffff" font-size="14" font-weight="700">${safeRecipient}</text>

        <text x="36" y="375" fill="#778da9" font-size="12">Chit Group</text>
        <text x="344" y="375" text-anchor="end" fill="#f3c969" font-size="13" font-weight="600">${safeGroup}</text>

        <text x="36" y="410" fill="#778da9" font-size="12">Sender</text>
        <text x="344" y="410" text-anchor="end" fill="#ffffff" font-size="13" font-weight="600">${safeMember} (${memberPhone})</text>

        <text x="36" y="445" fill="#778da9" font-size="12">UPI Ref (UTR)</text>
        <text x="344" y="445" text-anchor="end" fill="#00b4d8" font-size="12" font-family="monospace" font-weight="700">${utr}</text>

        <text x="36" y="480" fill="#778da9" font-size="12">Status</text>
        <text x="344" y="480" text-anchor="end" fill="#06d6a0" font-size="12" font-weight="700">Payment Successful ✓</text>

        <text x="36" y="515" fill="#778da9" font-size="12">Source</text>
        <text x="344" y="515" text-anchor="end" fill="#e0e1dd" font-size="12">WhatsApp Group Media</text>
      </g>

      <rect x="36" y="540" width="308" height="32" rx="6" fill="#0d1b2a"/>
      <text x="190" y="561" text-anchor="middle" fill="#778da9" font-family="-apple-system, sans-serif" font-size="11">
        Verified 3KS Chit Hub Transaction Receipt
      </text>
    </svg>`;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

