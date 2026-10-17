import os
from typing import List, Dict, Any
from services.bm25 import BM25SearchEngine
from services.embeddings import SemanticEmbeddingEngine

# Seed official documents from RBI, SEBI, and Government of India
SEED_OFFICIAL_DOCUMENTS = [
    {
        "document_id": "RBI-CIR-2023-112",
        "title": "Caution Against Fraudulent Offers of Financial Benefits, Scholarships and Lotteries in the Name of Reserve Bank of India",
        "organization": "Reserve Bank of India (RBI)",
        "date": "14 December 2023",
        "source_url": "https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=56789",
        "page_number": 1,
        "text": "The Reserve Bank of India (RBI) has repeatedly clarified that it does not maintain accounts of individuals nor does it disburse scholarships, lottery winnings, or monetary benefits to students or the public. The public is strongly advised not to respond to fake messages or letters promising scholarship amounts of ?50,000 or any other financial grants on behalf of RBI. Submitting personal identity documents like Aadhaar, PAN, or bank credentials on unverified websites leads to serious financial fraud."
    },
    {
        "document_id": "RBI-DIR-2024-45",
        "title": "Master Direction ? Protection Against KYC Fraud, Malicious Links and Unsolicited Messages",
        "organization": "Reserve Bank of India (RBI)",
        "date": "22 February 2024",
        "source_url": "https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12345",
        "page_number": 2,
        "text": "Regulated entities and citizens are notified that official agencies never mandate urgent submission of Aadhaar cards, PAN details, or one-time passwords (OTP) via unsolicited SMS, WhatsApp messages, or short-link websites. Any message threatening account suspension or offering cash rewards in exchange for immediate identity verification must be treated as a phishing attempt and reported to cybercrime authorities."
    },
    {
        "document_id": "PIB-FACT-2024-89",
        "title": "PIB Fact Check: Clarification on Purported ?50,000 Direct Benefit Scheme for College Students",
        "organization": "Press Information Bureau (Govt of India)",
        "date": "08 January 2024",
        "source_url": "https://pib.gov.in/FactCheckDisplay.aspx?id=9876",
        "page_number": 1,
        "text": "A fake message is circulating on WhatsApp and social media claiming that the central government and RBI are granting a ?50,000 scholarship to all college students. The Government of India has announced no such unconditional scholarship scheme. All official government scholarships for college and university students are governed strictly through the National Scholarship Portal (scholarships.gov.in). Do not click on unofficial links or submit Aadhaar card details."
    },
    {
        "document_id": "SEBI-ADV-2024-78",
        "title": "Advisory on Fake Social Media Groups, Unregistered Advisory Apps and Guaranteed Financial Returns",
        "organization": "Securities and Exchange Board of India (SEBI)",
        "date": "18 March 2024",
        "source_url": "https://sebi.gov.in/reports-and-statistics/press-releases/mar-2024/advisory",
        "page_number": 1,
        "text": "SEBI reiterates that guaranteed return schemes, high-yield investment offers, or unauthorized advisory services operating through Telegram, WhatsApp, or unregistered websites are illegal. Entities operating such portals often misuse logos of regulatory bodies like SEBI and RBI to deceive gullible citizens."
    },
    {
        "document_id": "NSP-GUIDE-2024-02",
        "title": "National Scholarship Portal Guidelines - Direct Benefit Transfer Rules and Identity Authentication",
        "organization": "Ministry of Education (Govt of India)",
        "date": "15 April 2024",
        "source_url": "https://scholarships.gov.in/guidelines",
        "page_number": 3,
        "text": "Scholarship disbursements under Central Sector Scheme of Scholarship for College and University Students require formal institutional verification by the respective college nodal officer. Disbursal occurs directly into the Aadhaar-seeded bank account of the verified student. No private third-party domain or urgent WhatsApp message is authorized to collect fees or documents for scholarship enrollment."
    }
]

class KnowledgeBaseVectorStore:
    def __init__(self):
        self.documents = list(SEED_OFFICIAL_DOCUMENTS)
        self.bm25_engine = BM25SearchEngine(self.documents)
        self.semantic_engine = SemanticEmbeddingEngine()
        
    def add_document(self, doc_dict: Dict[str, Any]):
        self.documents.append(doc_dict)
        self.bm25_engine = BM25SearchEngine(self.documents)
        
    def hybrid_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        bm25_results = self.bm25_engine.search(query, top_k=len(self.documents))
        bm25_dict = {d["document_id"]: d.get("bm25_score", 0.0) for d in bm25_results}
        
        scored_chunks = []
        for doc in self.documents:
            doc_id = doc["document_id"]
            bm25_s = bm25_dict.get(doc_id, 0.0)
            sem_s = self.semantic_engine.compute_similarity(query, doc["text"] + " " + doc["title"])
            
            # Hybrid combined score (0.4 * BM25 + 0.6 * Semantic)
            combined = round((0.4 * bm25_s) + (0.6 * sem_s), 4)
            
            chunk = dict(doc)
            chunk["chunk_id"] = f"{doc_id}_c1"
            chunk["bm25_score"] = bm25_s
            chunk["semantic_similarity"] = sem_s
            chunk["combined_score"] = combined
            scored_chunks.append(chunk)
            
        scored_chunks.sort(key=lambda x: x["combined_score"], reverse=True)
        return scored_chunks[:top_k]

# Global singleton
kb_store = KnowledgeBaseVectorStore()
