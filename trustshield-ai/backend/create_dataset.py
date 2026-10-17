import json, os

dataset = [
  {
    "id": "DS-001",
    "category": "Government/Financial Scheme",
    "claim_text": "URGENT! RBI has announced a ₹50,000 scholarship for every college student. Apply now at https://example.com and submit your Aadhaar details.",
    "input_type": "News",
    "url": "https://example.com",
    "ground_truth_verdict": "UNVERIFIABLE",
    "risk_level": "HIGH",
    "official_circular": "RBI-CIR-2023-112: Caution Against Fraudulent Offers of Financial Benefits",
    "description": "Viral scholarship scam misusing Reserve Bank of India authority to harvest Aadhaar numbers."
  },
  {
    "id": "DS-002",
    "category": "Banking KYC Phishing",
    "claim_text": "Dear customer, your SBI / HDFC bank account will be blocked today within 24 hours. Immediately update your KYC by clicking http://bit.ly/sbi-kyc-update and enter your OTP.",
    "input_type": "SMS",
    "url": "http://bit.ly/sbi-kyc-update",
    "ground_truth_verdict": "REFUTED",
    "risk_level": "HIGH",
    "official_circular": "RBI-DIR-2024-45: Master Direction on Protection Against KYC Fraud",
    "description": "Classic urgent SMS phishing targeting bank credentials and OTPs through shortened malicious links."
  },
  {
    "id": "DS-003",
    "category": "Government Welfare Subsidy",
    "claim_text": "Central Government is disbursing ₹6,000 in 17th installment of PM Kisan Samman Nidhi. Beneficiaries must complete e-KYC on official portal pmkisan.gov.in.",
    "input_type": "News",
    "url": "https://pmkisan.gov.in",
    "ground_truth_verdict": "SUPPORTED",
    "risk_level": "LOW",
    "official_circular": "GOI-AGRI-2024-17: PM-Kisan Samman Nidhi Operational Guidelines",
    "description": "Legitimate Government welfare release verified on the official Ministry of Agriculture portal."
  },
  {
    "id": "DS-004",
    "category": "Financial Investment Scam",
    "claim_text": "Join our VIP Telegram group! Guaranteed 400% daily profit on intraday stocks and crypto. Approved by SEBI. Deposit ₹10,000 to get ₹40,000 in 2 hours.",
    "input_type": "Telegram",
    "url": "https://t.me/sebi_vip_stocks",
    "ground_truth_verdict": "REFUTED",
    "risk_level": "HIGH",
    "official_circular": "SEBI-ADV-2024-78: Advisory on Fake Social Media Groups and Guaranteed Returns",
    "description": "High-yield investment scam falsely claiming SEBI authorization with impossible guaranteed returns."
  },
  {
    "id": "DS-005",
    "category": "Utility Disconnection Threat",
    "claim_text": "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Call electricity officer at 9876543210 immediately.",
    "input_type": "SMS",
    "url": "",
    "ground_truth_verdict": "REFUTED",
    "risk_level": "HIGH",
    "official_circular": "MOP-CYBER-2024-12: Ministry of Power Warning on Fake Disconnection SMS",
    "description": "Urgent utility disconnection social engineering scam targeting bill payments via remote screen-sharing apps."
  },
  {
    "id": "DS-006",
    "category": "Education & Student Aid",
    "claim_text": "National Scholarship Portal invites applications for Central Sector Scheme of Scholarship for College and University Students. Apply at scholarships.gov.in.",
    "input_type": "News",
    "url": "https://scholarships.gov.in",
    "ground_truth_verdict": "SUPPORTED",
    "risk_level": "LOW",
    "official_circular": "NSP-GUIDE-2024-02: National Scholarship Portal Guidelines and Direct Benefit Transfer Rules",
    "description": "Authentic scholarship scheme administered by Ministry of Education with direct bank transfer verification."
  },
  {
    "id": "DS-007",
    "category": "Telecom / Free Recharge Scam",
    "claim_text": "Jio & Airtel offering free 84-day 5G recharge to all citizens on occasion of festival! Claim your free recharge now at http://free-5g-recharge-offer.online before midnight.",
    "input_type": "WhatsApp",
    "url": "http://free-5g-recharge-offer.online",
    "ground_truth_verdict": "REFUTED",
    "risk_level": "HIGH",
    "official_circular": "DOT-ADV-2024-09: Department of Telecommunications Alert on Free Recharge Messages",
    "description": "Viral WhatsApp forward redirecting to ad-revenue click farms and credential harvesting."
  },
  {
    "id": "DS-008",
    "category": "Identity & Taxation",
    "claim_text": "Income Tax Department has approved a tax refund of ₹24,490. Submit your bank account number and debit card CVV at http://incometax-refund-gov.in to receive payment.",
    "input_type": "Email",
    "url": "http://incometax-refund-gov.in",
    "ground_truth_verdict": "REFUTED",
    "risk_level": "HIGH",
    "official_circular": "CBDT-ALERT-2024-05: Caution Against Fake Income Tax Refund Notifications",
    "description": "Phishing email spoofing Income Tax Department with fake refund link seeking card CVV numbers."
  }
]

data_dir = r'C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\backend\data'
os.makedirs(data_dir, exist_ok=True)
json_path = os.path.join(data_dir, 'claims_dataset.json')

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(dataset, f, indent=2, ensure_ascii=False)

print(f"Dataset written with {len(dataset)} verified entries to {json_path}")
