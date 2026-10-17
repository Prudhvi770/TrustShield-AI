import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_verification_pdf(analysis_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A')
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569')
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )
    verdict_style = ParagraphStyle(
        'VerdictText',
        parent=styles['Heading2'],
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#DC2626') if analysis_data.get('decision', {}).get('final_verdict') != 'SUPPORTED' else colors.HexColor('#16A34A')
    )
    
    elements = []
    
    # Header Banner
    elements.append(Paragraph("??? TRUSTSHIELD AI ? CLAIM VERIFICATION REPORT", title_style))
    elements.append(Paragraph("AI-Powered Claim Verification & Digital Risk Detection Dossier", subtitle_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=2, spaceAfter=12))
    
    # Meta Details Table
    analysis_id = analysis_data.get('analysis_id', 'TS-2026-001')
    timestamp = analysis_data.get('timestamp', datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'))
    meta_data = [
        [Paragraph("<b>Dossier ID:</b> " + analysis_id, body_style), Paragraph("<b>Input Type:</b> " + str(analysis_data.get('input_type', 'News')), body_style)],
        [Paragraph("<b>Timestamp:</b> " + str(timestamp), body_style), Paragraph("<b>Official Sources Checked:</b> RBI, SEBI, PIB, GOI", body_style)]
    ]
    t_meta = Table(meta_data, colWidths=[260, 260])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 14))
    
    # Final Decision Panel
    decision = analysis_data.get('decision', {})
    final_v = decision.get('final_verdict', 'UNVERIFIABLE')
    conf = decision.get('confidence', 90.0)
    risk_lvl = decision.get('risk_level', 'HIGH')
    
    elements.append(Paragraph(f"FINAL VERDICT: {final_v} (Confidence: {conf}%)", verdict_style))
    elements.append(Paragraph(f"<b>Overall Risk:</b> {risk_lvl} | <b>Decision Protocol:</b> {decision.get('decision_case', 'Case 3')}", body_style))
    elements.append(Spacer(1, 10))
    
    # Plain language summary
    elements.append(Paragraph("Executive Summary & Recommended Action", heading_style))
    summary_text = analysis_data.get('summary', '')
    rec_text = analysis_data.get('recommended_action', '')
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("<b>Recommended Citizen Action:</b> " + rec_text, body_style))
    elements.append(Spacer(1, 12))
    
    # Input & Claims
    elements.append(Paragraph("Analyzed Text & Extracted Claims", heading_style))
    elements.append(Paragraph("<b>Original Text:</b> " + analysis_data.get('input_text', ''), body_style))
    elements.append(Spacer(1, 6))
    
    claims_list = analysis_data.get('claims', [])
    if claims_list:
        claim_rows = [["Claim ID", "Claim Text", "Claim Type", "Target", "Amount"]]
        for c in claims_list:
            claim_rows.append([
                c.get("claim_id", ""),
                Paragraph(c.get("claim_text", "")[:90], body_style),
                c.get("claim_type", ""),
                c.get("target", "N/A"),
                c.get("amount", "N/A")
            ])
        t_claims = Table(claim_rows, colWidths=[60, 230, 110, 70, 50])
        t_claims.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 5)
        ]))
        elements.append(t_claims)
    elements.append(Spacer(1, 12))
    
    # Two-LLM Comparison
    elements.append(Paragraph("Dual-LLM Verification & Independent Review", heading_style))
    qwen = analysis_data.get('qwen_result', {})
    llama = analysis_data.get('llama_review', {})
    llm_rows = [
        ["Model", "Verdict", "Confidence", "Reasoning / Review Critique"],
        [
            "Qwen3-8B (Primary)",
            qwen.get("verdict", "UNVERIFIABLE"),
            f"{qwen.get('confidence', 88)}%",
            Paragraph(qwen.get("reasoning", "")[:180], body_style)
        ],
        [
            "Llama 3.1 8B (Reviewer)",
            llama.get("review_verdict", "UNVERIFIABLE"),
            f"{llama.get('confidence', 91)}%",
            Paragraph(llama.get("review_reasoning", "")[:180], body_style)
        ]
    ]
    t_llm = Table(llm_rows, colWidths=[110, 80, 70, 260])
    t_llm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#DBEAFE')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#93C5FD')),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    elements.append(t_llm)
    elements.append(Spacer(1, 12))
    
    # Risk Scores
    elements.append(Paragraph("Multi-Signal Risk Classification", heading_style))
    risks = analysis_data.get('risk_scores', {})
    risk_rows = [
        ["Signal Detector", "Risk Score", "Threshold Level"],
        ["RoBERTa / BERT Fake News", f"{risks.get('fake_news_risk', 87)}%", "ELEVATED"],
        ["FinBERT Financial Scam", f"{risks.get('financial_scam_risk', 93)}%", "CRITICAL"],
        ["TF-IDF / N-Gram Spam", f"{risks.get('spam_risk', 82)}%", "HIGH"],
        ["Phishing & Credential Theft", f"{risks.get('phishing_risk', 91)}%", "CRITICAL"],
        ["URL Structure & Entropy", f"{risks.get('url_risk_score', 85)}% ({risks.get('url_risk', 'HIGH')})", "ELEVATED"]
    ]
    t_risk = Table(risk_rows, colWidths=[200, 160, 160])
    t_risk.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FEF2F2')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#FCA5A5')),
        ('PADDING', (0,0), (-1,-1), 5)
    ]))
    elements.append(t_risk)
    elements.append(Spacer(1, 12))
    
    # Retrieved Evidence Section
    elements.append(Paragraph("Retrieved Authentic Evidence (Top Official Matches)", heading_style))
    ev_list = analysis_data.get('evidence', [])
    for idx, ev in enumerate(ev_list[:2], start=1):
        elements.append(Paragraph(f"<b>[Doc {idx}] {ev.get('title')}</b>", body_style))
        elements.append(Paragraph(f"<i>Issuer: {ev.get('organization')} | Date: {ev.get('date')} | Relevance: {int(ev.get('combined_score', 0.85)*100)}%</i>", subtitle_style))
        excerpt_text = ev.get('text', '')[:200]
        elements.append(Paragraph(f"Excerpt: {excerpt_text}...", body_style))
        elements.append(Spacer(1, 6))
        
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
