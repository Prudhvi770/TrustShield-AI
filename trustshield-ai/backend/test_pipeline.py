import main
from models.schemas import VerificationRequest

test_input = "URGENT! RBI has announced a ₹50,000 scholarship for every college student. Apply now at https://example.com and submit your Aadhaar details."
req = VerificationRequest(text=test_input, input_type="News", url="https://example.com")

with main.SessionLocal() as db:
    res = main.analyze_content(req, current_user=None, db=db)
    print("\n--- VERIFICATION TEST SUCCESSFUL ---")
    print("Analysis ID:", res.analysis_id)
    print("Final Verdict:", res.decision.final_verdict)
    print("Confidence:", res.decision.confidence, "%")
    print("Overall Risk:", res.risk_scores.overall_risk)
    print("Decision Case:", res.decision.decision_case)
    print("Agreement:", res.decision.agreement)
    print("Qwen Verdict:", res.qwen_result.verdict, f"({res.qwen_result.confidence}%)")
    print("Llama Review:", res.llama_review.review_verdict, f"({res.llama_review.confidence}%)")
    print("Extracted Claims:", len(res.claims))
    print("Retrieved Evidence Count:", len(res.evidence))
    print("Top Evidence:", res.evidence[0].title)
    print("SHAP/LIME Features:", [f.token for f in res.explainability[:4]])
    
    # Test PDF generation
    pdf_bytes = main.generate_verification_pdf(res.dict())
    print("Generated PDF Bytes:", len(pdf_bytes))
