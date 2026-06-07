import { Receipt } from '../types';

export const MOCK_RECEIPTS: Receipt[] = [
  {
    id: "rcpt-1",
    merchant: "Starbucks Coffee",
    date: "2026-06-05",
    amount: 14.58,
    category: "Food & Dining",
    tax: 1.17,
    status: "active",
    ocrText: "STARBUCKS COFFEE\nStore #48291\nJune 5, 2026 08:34 AM\n\n1x Caffe Latte $4.95\n1x Avocado Toast $6.75\n1x Blueberry Scone $3.50\nSubtotal: $13.41\nTax (8.75%): $1.17\nTotal: $14.58\n\nCard Ending in *4829\nAuth Code: 889211\nPrivacy-First OCR processing completed on-device."
  },
  {
    id: "rcpt-2",
    merchant: "Uber Trips",
    date: "2026-06-04",
    amount: 42.10,
    category: "Travel",
    tax: 3.37,
    status: "active",
    ocrText: "UBER RIDE REPORT\nJune 4, 2026 10:15 PM\nTrip ID: 9481a8-d931\n\nFare Details:\nBase Fare: $3.50\nDistance (6.8 mi): $18.20\nTime (22 mins): $11.00\nSurcharges: $4.00\nSubtotal: $38.73\nLocal Tax/Fees: $3.37\nTotal Amount: $42.10\n\nPayment Method: Apple Pay\nThank you for riding with Uber."
  },
  {
    id: "rcpt-3",
    merchant: "Office Depot",
    date: "2026-06-02",
    amount: 118.24,
    category: "Office Supplies",
    tax: 9.46,
    status: "active",
    ocrText: "OFFICE DEPOT #922\nW207S8686 Hillendale Dr, Muskego, WI 53150\nJune 2, 2026 02:45 PM\n\n1x USB-C Desktop Docking Station $89.99\n2x Premium Grid Notebooks $12.50 ea ($25.00)\nSubtotal: $108.78\nTax (8.7%): $9.46\nTotal: $118.24\n\nVisa Card *1182\nTransaction Approved.\nKeep this receipt for returns."
  },
  {
    id: "rcpt-4",
    merchant: "Netflix Premium",
    date: "2026-05-28",
    amount: 22.99,
    category: "Entertainment",
    tax: 1.84,
    status: "archived",
    ocrText: "NETFLIX BILLING STATEMENT\nDate: May 28, 2026\nAccount: grant@antigravity.io\n\nPremium Ultra HD Plan Monthly Subscription\nService Period: 05/28/2026 - 06/28/2026\n\nAmount: $21.15\nTax: $1.84\nTotal: $22.99\n\nBilled to Mastercard *5509\nNetflix, Inc. Los Gatos, CA"
  }
];

export const MOCK_OCR_TEMPLATES = [
  { merchant: "Target Stores", amount: 84.23, category: "Office Supplies" as const, tax: 5.89, ocrText: "TARGET STORES\nMuskego, WI 53150\n\nItems Purchased:\n1x Wireless Keyboard $39.99\n1x Ergonomic Mouse $29.99\n1x AA Batteries 8-pack $14.25\nTotal: $84.23\nTax (7%): $5.89\nThank you for shopping at Target." },
  { merchant: "McDonald's", amount: 18.75, category: "Food & Dining" as const, tax: 1.50, ocrText: "MCDONALD'S #4891\nMuskego, WI\n\nQty Item Total\n2x Big Mac Meal $15.50\n1x Large Fries $3.25\nSubtotal: $17.25\nTax: $1.50\nTotal: $18.75\nThank you!" },
  { merchant: "Shell Gasoline", amount: 55.00, category: "Travel" as const, tax: 4.40, ocrText: "SHELL OIL CO\nStation #8472911\n\nRegular Fuel: 13.88 Gallons @ $3.96/G\nTotal Sale: $55.00\nIncludes Tax: $4.40\nApproved Visa *9842" },
  { merchant: "Netflix Premium", amount: 22.99, category: "Entertainment" as const, tax: 1.84, ocrText: "NETFLIX STATEMENTS\nPremium Plan $22.99\nTax: $1.84" },
  { merchant: "Comcast Cable", amount: 89.99, category: "Utilities" as const, tax: 7.20, ocrText: "COMCAST / XFINITY\nMonthly Internet Service $82.79\nRegulatory Fees: $7.20\nTotal Charge: $89.99" },
  { merchant: "Blue Bottle Coffee", amount: 12.45, category: "Food & Dining" as const, tax: 1.00, ocrText: "BLUE BOTTLE COFFEE\n1x Single Origin Espresso $5.25\n1x Almond Croissant $6.20\nSubtotal: $11.45\nTax: $1.00\nTotal: $12.45" },
  { merchant: "Delta Air Lines", amount: 312.50, category: "Travel" as const, tax: 25.00, ocrText: "DELTA AIR LINES\nTicket #006-2948102941\nFlight DL1822 Chicago (ORD) -> New York (LGA)\nFare: $287.50\nTax/Fees: $25.00\nTotal: $312.50" }
];
