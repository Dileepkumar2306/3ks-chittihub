import { generatePaymentScreenshot } from '../utils/screenshotGenerator';

export const initialGroups = [
  {
    id: "grp-1",
    name: "Group A - Sri Venkateswara (1 Lakh)",
    memberCount: 20,
    monthsCount: 20,
    monthlyAmount: 5000,
    totalValue: 100000, // 20 * 5000
    startDate: "2026-01-01",
    endDate: "2027-08-01",
    status: "Active",
    currentMonth: 4,
    createdAt: "2026-01-01"
  },
  {
    id: "grp-2",
    name: "Group B - Lakshmi Ganapathi (2 Lakhs)",
    memberCount: 20,
    monthsCount: 20,
    monthlyAmount: 10000,
    totalValue: 200000,
    startDate: "2025-10-01",
    endDate: "2027-05-01",
    status: "Active",
    currentMonth: 6,
    createdAt: "2025-10-01"
  },
  {
    id: "grp-3",
    name: "Group C - Sai Ram (50K Express)",
    memberCount: 10,
    monthsCount: 10,
    monthlyAmount: 5000,
    totalValue: 50000,
    startDate: "2025-05-01",
    endDate: "2026-02-01",
    status: "Completed",
    currentMonth: 10,
    createdAt: "2025-05-01"
  }
];

export const initialMembers = [
  // Group 1 Members
  {
    id: "mem-1",
    memberCode: "3KS-M001",
    groupId: "grp-1",
    name: "Ravi Kumar",
    mobile: "9848012345",
    joiningDate: "2026-01-01",
    monthlyAmount: 5000,
    remarks: "Regular payer via Google Pay"
  },
  {
    id: "mem-2",
    memberCode: "3KS-M002",
    groupId: "grp-1",
    name: "Suresh Reddy",
    mobile: "9848023456",
    joiningDate: "2026-01-01",
    monthlyAmount: 5000,
    remarks: "Requested reminder on 5th"
  },
  {
    id: "mem-3",
    memberCode: "3KS-M003",
    groupId: "grp-1",
    name: "Kumar Swamy",
    mobile: "9848034567",
    joiningDate: "2026-01-01",
    monthlyAmount: 5000,
    remarks: "Prefers cash payment"
  },
  {
    id: "mem-4",
    memberCode: "3KS-M004",
    groupId: "grp-1",
    name: "Anitha Devi",
    mobile: "9848045678",
    joiningDate: "2026-01-01",
    monthlyAmount: 5000,
    remarks: "Advance payer"
  },
  {
    id: "mem-5",
    memberCode: "3KS-M005",
    groupId: "grp-1",
    name: "Ramesh Babu",
    mobile: "9848056789",
    joiningDate: "2026-01-01",
    monthlyAmount: 5000,
    remarks: "Shop owner, paid via PhonePe"
  },
  {
    id: "mem-6",
    memberCode: "3KS-M006",
    groupId: "grp-1",
    name: "Lakshmi Prasanna",
    mobile: "9848067890",
    joiningDate: "2026-01-01",
    monthlyAmount: 5000,
    remarks: "Teacher"
  },
  {
    id: "mem-7",
    memberCode: "3KS-M007",
    groupId: "grp-1",
    name: "Venkat Rao",
    mobile: "9848078901",
    joiningDate: "2026-01-01",
    monthlyAmount: 5000,
    remarks: "Govt employee"
  },

  // Group 2 Members
  {
    id: "mem-8",
    memberCode: "3KS-M008",
    groupId: "grp-2",
    name: "Mahesh Naidu",
    mobile: "9849011223",
    joiningDate: "2025-10-01",
    monthlyAmount: 10000,
    remarks: "Real estate businessman"
  },
  {
    id: "mem-9",
    memberCode: "3KS-M009",
    groupId: "grp-2",
    name: "Rajesh Varma",
    mobile: "9849022334",
    joiningDate: "2025-10-01",
    monthlyAmount: 10000,
    remarks: "Pays by direct bank transfer"
  },
  {
    id: "mem-10",
    memberCode: "3KS-M010",
    groupId: "grp-2",
    name: "Pooja Sharma",
    mobile: "9849033445",
    joiningDate: "2025-10-01",
    monthlyAmount: 10000,
    remarks: "Software engineer"
  },
  {
    id: "mem-11",
    memberCode: "3KS-M011",
    groupId: "grp-2",
    name: "Kalyan Chakravarthy",
    mobile: "9849044556",
    joiningDate: "2025-10-01",
    monthlyAmount: 10000,
    remarks: "Contractor"
  },

  // Group 3 Members
  {
    id: "mem-12",
    memberCode: "3KS-M012",
    groupId: "grp-3",
    name: "Satyanarayana Murthy",
    mobile: "9849055667",
    joiningDate: "2025-05-01",
    monthlyAmount: 5000,
    remarks: "All 10 months cleared successfully"
  },
  {
    id: "mem-13",
    memberCode: "3KS-M013",
    groupId: "grp-3",
    name: "Bhavani Shankar",
    mobile: "9849066778",
    joiningDate: "2025-05-01",
    monthlyAmount: 5000,
    remarks: "Completed group"
  }
];

export const initialPayments = [
  // Group 1, Member 1: Ravi Kumar (All 4 months paid)
  {
    id: "pay-101",
    groupId: "grp-1",
    memberId: "mem-1",
    monthNumber: 1,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-01-05",
    paymentMode: "UPI",
    referenceNo: "UPI/260105/9821",
    remarks: "Paid through UPI",
    updatedAt: "2026-01-05"
  },
  {
    id: "pay-102",
    groupId: "grp-1",
    memberId: "mem-1",
    monthNumber: 2,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-02-04",
    paymentMode: "PhonePe",
    referenceNo: "PP/260204/1129",
    remarks: "Paid on time",
    updatedAt: "2026-02-04"
  },
  {
    id: "pay-103",
    groupId: "grp-1",
    memberId: "mem-1",
    monthNumber: 3,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-03-05",
    paymentMode: "GPay",
    referenceNo: "GP/260305/7781",
    remarks: "Paid through GPay",
    updatedAt: "2026-03-05"
  },
  {
    id: "pay-104",
    groupId: "grp-1",
    memberId: "mem-1",
    monthNumber: 4,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-04-03",
    paymentMode: "UPI",
    referenceNo: "UPI/260403/6541",
    remarks: "Paid via GPay (WhatsApp screenshot verified)",
    updatedAt: "2026-04-03",
    screenshot: generatePaymentScreenshot({
      app: 'gpay',
      amount: 5000,
      memberName: 'Ravi Kumar',
      memberPhone: '9848012345',
      groupName: 'Group A - Sri Venkateswara',
      utr: 'UPI/260403/6541',
      date: '03 Apr 2026, 11:24 AM'
    })
  },

  // Group 1, Member 2: Suresh Reddy (Months 1-3 paid, Month 4 Pending "Will pay tomorrow")
  {
    id: "pay-201",
    groupId: "grp-1",
    memberId: "mem-2",
    monthNumber: 1,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-01-08",
    paymentMode: "Cash",
    remarks: "Cash handed directly",
    updatedAt: "2026-01-08"
  },
  {
    id: "pay-202",
    groupId: "grp-1",
    memberId: "mem-2",
    monthNumber: 2,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-02-09",
    paymentMode: "Cash",
    remarks: "Cash paid",
    updatedAt: "2026-02-09"
  },
  {
    id: "pay-203",
    groupId: "grp-1",
    memberId: "mem-2",
    monthNumber: 3,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-03-10",
    paymentMode: "Cash",
    remarks: "Cash paid",
    updatedAt: "2026-03-10"
  },
  {
    id: "pay-204",
    groupId: "grp-1",
    memberId: "mem-2",
    monthNumber: 4,
    expectedAmount: 5000,
    paidAmount: 0,
    status: "Pending",
    remarks: "Will pay tomorrow",
    updatedAt: "2026-04-05"
  },

  // Group 1, Member 3: Kumar Swamy (Month 4 Partial ₹2,500)
  {
    id: "pay-301",
    groupId: "grp-1",
    memberId: "mem-3",
    monthNumber: 1,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-01-07",
    paymentMode: "Cash",
    remarks: "Paid",
    updatedAt: "2026-01-07"
  },
  {
    id: "pay-302",
    groupId: "grp-1",
    memberId: "mem-3",
    monthNumber: 2,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-02-07",
    paymentMode: "Cash",
    remarks: "Paid",
    updatedAt: "2026-02-07"
  },
  {
    id: "pay-303",
    groupId: "grp-1",
    memberId: "mem-3",
    monthNumber: 3,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-03-08",
    paymentMode: "Cash",
    remarks: "Paid",
    updatedAt: "2026-03-08"
  },
  {
    id: "pay-304",
    groupId: "grp-1",
    memberId: "mem-3",
    monthNumber: 4,
    expectedAmount: 5000,
    paidAmount: 2500,
    status: "Partial",
    paidDate: "2026-04-06",
    paymentMode: "Cash",
    remarks: "Partial payment, balance ₹2,500",
    updatedAt: "2026-04-06"
  },

  // Group 1, Member 4: Anitha Devi (Advance paid)
  {
    id: "pay-401",
    groupId: "grp-1",
    memberId: "mem-4",
    monthNumber: 1,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-01-03",
    paymentMode: "UPI",
    remarks: "Paid",
    updatedAt: "2026-01-03"
  },
  {
    id: "pay-402",
    groupId: "grp-1",
    memberId: "mem-4",
    monthNumber: 2,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-02-03",
    paymentMode: "UPI",
    remarks: "Paid",
    updatedAt: "2026-02-03"
  },
  {
    id: "pay-403",
    groupId: "grp-1",
    memberId: "mem-4",
    monthNumber: 3,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-03-03",
    paymentMode: "UPI",
    remarks: "Paid",
    updatedAt: "2026-03-03"
  },
  {
    id: "pay-404",
    groupId: "grp-1",
    memberId: "mem-4",
    monthNumber: 4,
    expectedAmount: 5000,
    paidAmount: 10000,
    status: "Advance",
    paidDate: "2026-04-01",
    paymentMode: "UPI",
    referenceNo: "UPI/260401/8892",
    remarks: "Advance paid for Month 4 & Month 5",
    updatedAt: "2026-04-01"
  },

  // Group 1, Member 5: Ramesh Babu
  {
    id: "pay-501",
    groupId: "grp-1",
    memberId: "mem-5",
    monthNumber: 1,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-01-10",
    paymentMode: "PhonePe",
    remarks: "Paid through PhonePe",
    updatedAt: "2026-01-10"
  },
  {
    id: "pay-502",
    groupId: "grp-1",
    memberId: "mem-5",
    monthNumber: 2,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-02-10",
    paymentMode: "PhonePe",
    remarks: "Paid",
    updatedAt: "2026-02-10"
  },
  {
    id: "pay-503",
    groupId: "grp-1",
    memberId: "mem-5",
    monthNumber: 3,
    expectedAmount: 5000,
    paidAmount: 5000,
    status: "Paid",
    paidDate: "2026-03-12",
    paymentMode: "PhonePe",
    remarks: "Paid",
    updatedAt: "2026-03-12"
  },
  {
    id: "pay-504",
    groupId: "grp-1",
    memberId: "mem-5",
    monthNumber: 4,
    expectedAmount: 5000,
    paidAmount: 0,
    status: "Pending",
    remarks: "Will pay on 25th",
    updatedAt: "2026-04-08"
  },

  // Group 2 Members (Months 1-6)
  {
    id: "pay-801",
    groupId: "grp-2",
    memberId: "mem-8",
    monthNumber: 6,
    expectedAmount: 10000,
    paidAmount: 10000,
    status: "Paid",
    paidDate: "2026-04-02",
    paymentMode: "Bank Transfer",
    referenceNo: "NEFT/88192301",
    remarks: "Paid through NEFT",
    updatedAt: "2026-04-02"
  },
  {
    id: "pay-901",
    groupId: "grp-2",
    memberId: "mem-9",
    monthNumber: 6,
    expectedAmount: 10000,
    paidAmount: 5000,
    status: "Partial",
    paidDate: "2026-04-05",
    paymentMode: "UPI",
    remarks: "Partial payment, remaining 5000 pending",
    updatedAt: "2026-04-05"
  },
  {
    id: "pay-1001",
    groupId: "grp-2",
    memberId: "mem-10",
    monthNumber: 6,
    expectedAmount: 10000,
    paidAmount: 0,
    status: "Pending",
    remarks: "Waiting for salary on 10th",
    updatedAt: "2026-04-07"
  }
];

export const initialSettings = {
  pin: "4554",
  language: "en",
  companyName: "3KS Chits",
  adminName: "Admin",
  phone: "9848011223",
  upiId: "3kschits@upi",
  autoLockMinutes: 15,
  isLocked: false,
  whatsappConnected: true,
  whatsappPhone: "9848011223"
};

export const initialWhatsAppGroups = [
  {
    id: "wa-grp-1",
    name: "3KS Group A - Sri Venkateswara Chitti",
    chitGroupId: "grp-1",
    groupJid: "1203630281928371@g.us",
    membersCount: 20,
    inviteLink: "https://chat.whatsapp.com/3ksGroupASriVenkat",
    status: "Active",
    lastActivity: "10 mins ago",
    autoSync: true
  },
  {
    id: "wa-grp-2",
    name: "3KS Group B - Lakshmi Ganapathi (2 Lakhs)",
    chitGroupId: "grp-2",
    groupJid: "1203630981726354@g.us",
    membersCount: 20,
    inviteLink: "https://chat.whatsapp.com/3ksGroupBLakshmiG",
    status: "Active",
    lastActivity: "2 hours ago",
    autoSync: true
  },
  {
    id: "wa-grp-3",
    name: "3KS All Members & Announcements",
    chitGroupId: "all",
    groupJid: "1203630554433221@g.us",
    membersCount: 45,
    inviteLink: "https://chat.whatsapp.com/3ksChitsOfficial",
    status: "Active",
    lastActivity: "Yesterday",
    autoSync: false
  }
];

export const initialWhatsAppMessages = [
  {
    id: "wa-msg-1",
    groupId: "wa-grp-1",
    chitGroupId: "grp-1",
    memberId: "mem-4",
    senderName: "Venkat Rao",
    senderMobile: "9848045678",
    memberCode: "3KS-M004",
    messageText: "Anna, Month 4 chit amount ₹5,000 sent through PhonePe just now. Sending screenshot proof here. Please check and confirm in app.",
    timestamp: "Today, 10:45 AM",
    timeAgo: "15m ago",
    amount: 5000,
    monthNumber: 4,
    paymentMode: "PhonePe",
    utr: "PP260408104592",
    status: "Pending",
    hasScreenshot: true,
    screenshot: generatePaymentScreenshot({
      app: 'phonepe',
      amount: 5000,
      memberName: 'Venkat Rao',
      memberPhone: '9848045678',
      groupName: 'Group A - Sri Venkateswara',
      utr: 'PP260408104592',
      date: 'Today, 10:44 AM'
    })
  },
  {
    id: "wa-msg-2",
    groupId: "wa-grp-1",
    chitGroupId: "grp-1",
    memberId: "mem-5",
    senderName: "Narasimha Murthy",
    senderMobile: "9848056789",
    memberCode: "3KS-M005",
    messageText: "GPay transfer completed for 3KS Chits Month 4: ₹5,000. Ref UTR: 410928374618. Screenshot attached for passbook update.",
    timestamp: "Today, 09:30 AM",
    timeAgo: "1h ago",
    amount: 5000,
    monthNumber: 4,
    paymentMode: "Google Pay",
    utr: "410928374618",
    status: "Pending",
    hasScreenshot: true,
    screenshot: generatePaymentScreenshot({
      app: 'gpay',
      amount: 5000,
      memberName: 'Narasimha Murthy',
      memberPhone: '9848056789',
      groupName: 'Group A - Sri Venkateswara',
      utr: '410928374618',
      date: 'Today, 09:28 AM'
    })
  },
  {
    id: "wa-msg-3",
    groupId: "wa-grp-2",
    chitGroupId: "grp-2",
    memberId: "mem-10",
    senderName: "Pooja Sharma",
    senderMobile: "9849033445",
    memberCode: "3KS-M010",
    messageText: "Hi sir, paid Month 6 installment ₹10,000 via Paytm UPI. Transaction screenshot attached. Please check.",
    timestamp: "Yesterday, 04:15 PM",
    timeAgo: "Yesterday",
    amount: 10000,
    monthNumber: 6,
    paymentMode: "Paytm",
    utr: "PTM4910293847",
    status: "Pending",
    hasScreenshot: true,
    screenshot: generatePaymentScreenshot({
      app: 'paytm',
      amount: 10000,
      memberName: 'Pooja Sharma',
      memberPhone: '9849033445',
      groupName: 'Group B - Lakshmi Ganapathi (2 Lakhs)',
      utr: 'PTM4910293847',
      date: 'Yesterday, 04:14 PM'
    })
  },
  {
    id: "wa-msg-4",
    groupId: "wa-grp-1",
    chitGroupId: "grp-1",
    memberId: "mem-1",
    senderName: "Ravi Kumar",
    senderMobile: "9848012345",
    memberCode: "3KS-M001",
    messageText: "Paid ₹5,000 for Month 4 installment via Google Pay. Screenshot attached.",
    timestamp: "03 Apr 2026",
    timeAgo: "3 days ago",
    amount: 5000,
    monthNumber: 4,
    paymentMode: "Google Pay",
    utr: "UPI/260403/6541",
    status: "Verified",
    hasScreenshot: true,
    screenshot: generatePaymentScreenshot({
      app: 'gpay',
      amount: 5000,
      memberName: 'Ravi Kumar',
      memberPhone: '9848012345',
      groupName: 'Group A - Sri Venkateswara',
      utr: 'UPI/260403/6541',
      date: '03 Apr 2026, 11:24 AM'
    })
  }
];
