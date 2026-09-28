import os
import re
import json
from enum import Enum
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
from pathlib import Path
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from database.models import JobPost

class TailoringIntensity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class CVBuilder:
    def __init__(self, profile: Dict[str, Any], base_output_dir: str = "cv/generated"):
        self.profile = profile
        self.base_output_dir = Path(base_output_dir)
        self.base_output_dir.mkdir(parents=True, exist_ok=True)

    def build_tailored_content(
        self,
        job: JobPost,
        intensity: TailoringIntensity = TailoringIntensity.MEDIUM
    ) -> Dict[str, Any]:
        """
        Truth-Preserving CV Tailoring:
        - NEVER inject skills or experiences not present in master profile.
        - Reorder and emphasize relevant existing skills and experience bullets.
        - Identify missing JD requirements as GAPS.
        """
        user_skills_dict = self.profile.get("skills", {})
        all_user_skills_flat = {}
        for cat, items in user_skills_dict.items():
            for item in items:
                all_user_skills_flat[item.lower().strip()] = (cat, item)

        jd_text = (job.job_description + " " + " ".join(job.requirements)).lower()

        # Identify matched skills vs gaps
        matched_user_skills = set()
        gaps = []
        for req in (job.requirements or []):
            req_clean = req.lower().strip()
            found = False
            for u_skill_lower, (cat, orig_item) in all_user_skills_flat.items():
                if u_skill_lower in req_clean or req_clean in u_skill_lower:
                    matched_user_skills.add(orig_item)
                    found = True
                    break
            if not found:
                gaps.append(req)

        # Reorder categories and skills within categories
        reordered_skills = {}
        for cat, items in user_skills_dict.items():
            # Put items matching JD at the beginning of the list
            matched_in_cat = [i for i in items if i in matched_user_skills or i.lower() in jd_text]
            unmatched_in_cat = [i for i in items if i not in matched_in_cat]
            reordered_skills[cat] = matched_in_cat + unmatched_in_cat

        # If a category has many matched skills, bubble it up to the front
        sorted_categories = sorted(
            reordered_skills.keys(),
            key=lambda c: len([i for i in reordered_skills[c] if i in matched_user_skills]),
            reverse=True
        )
        final_skills = {c: reordered_skills[c] for c in sorted_categories}

        # Tailor summary: emphasize target position and relevant domain
        base_summary = self.profile.get("summary", "")
        tailored_summary = base_summary
        if intensity in [TailoringIntensity.MEDIUM, TailoringIntensity.HIGH]:
            # Adjust role emphasis truth-preservingly
            target_role = job.position.strip()
            if "qa" in target_role.lower() and "qa" in base_summary.lower():
                tailored_summary = base_summary

        # Reorder experience bullet points to prioritize relevant tech/tasks
        tailored_experiences = []
        for exp in self.profile.get("experiences", []):
            exp_copy = dict(exp)
            bullets = exp.get("bullets", [])
            # Score bullets by keyword relevance to JD
            def bullet_score(b: str) -> int:
                b_low = b.lower()
                score = 0
                for ms in matched_user_skills:
                    if ms.lower() in b_low:
                        score += 2
                for word in ["regression", "api", "test", "automation", "sql", "playwright"]:
                    if word in jd_text and word in b_low:
                        score += 1
                return score

            sorted_bullets = sorted(bullets, key=bullet_score, reverse=True)
            exp_copy["bullets"] = sorted_bullets
            tailored_experiences.append(exp_copy)

        return {
            "name": self.profile.get("name", "User"),
            "title": self.profile.get("title", job.position),
            "email": self.profile.get("email", ""),
            "phone": self.profile.get("phone", ""),
            "location": self.profile.get("location", ""),
            "linkedin": self.profile.get("linkedin", ""),
            "github": self.profile.get("github", ""),
            "summary": tailored_summary,
            "skills": final_skills,
            "experiences": tailored_experiences,
            "educations": self.profile.get("educations", []),
            "certifications": self.profile.get("certifications", []),
            "languages": self.profile.get("languages", []),
            "matched_skills": list(matched_user_skills),
            "gaps": gaps,
            "intensity": intensity.value
        }

    def generate_documents(
        self,
        job: JobPost,
        tailored_content: Dict[str, Any]
    ) -> Tuple[str, str]:
        """
        Generate ATS-friendly single column DOCX and save JD Snapshot JSON.
        Returns:
            (docx_path, snapshot_path)
        """
        date_folder = datetime.now().strftime("%Y-%m-%d")
        target_dir = self.base_output_dir / date_folder
        target_dir.mkdir(parents=True, exist_ok=True)

        safe_company = re.sub(r"[^\w\-]", "", job.company.replace(" ", "_"))
        safe_role = re.sub(r"[^\w\-]", "", job.position.replace(" ", "_"))
        safe_name = re.sub(r"[^\w\-]", "", tailored_content.get("name", "Candidate").replace(" ", "_"))

        filename_base = f"{safe_name}_{safe_role}_{safe_company}"
        docx_path = target_dir / f"{filename_base}.docx"
        snapshot_path = target_dir / f"{filename_base}_snapshot.json"

        # Build ATS-Friendly DOCX Document
        doc = Document()

        # Set 0.75-inch standard margins
        for section in doc.sections:
            section.top_margin = Inches(0.75)
            section.bottom_margin = Inches(0.75)
            section.left_margin = Inches(0.75)
            section.right_margin = Inches(0.75)

        # Style standard font
        style = doc.styles['Normal']
        font = style.font
        font.name = 'Calibri'
        font.size = Pt(11)
        font.color.rgb = RGBColor(0x33, 0x33, 0x33)

        # 1. Header (Name, Title, Contact)
        p_name = doc.add_paragraph()
        run_name = p_name.add_run(tailored_content.get("name", "Candidate"))
        run_name.bold = True
        run_name.font.size = Pt(18)
        run_name.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
        p_name.paragraph_format.space_after = Pt(2)

        p_title = doc.add_paragraph()
        run_title = p_title.add_run(tailored_content.get("title", job.position))
        run_title.font.size = Pt(13)
        run_title.bold = True
        run_title.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        p_title.paragraph_format.space_after = Pt(4)

        # Contact info
        contacts = [
            tailored_content.get("location"),
            tailored_content.get("phone"),
            tailored_content.get("email"),
            tailored_content.get("linkedin"),
            tailored_content.get("github")
        ]
        contact_str = " | ".join([c for c in contacts if c])
        p_contact = doc.add_paragraph(contact_str)
        p_contact.paragraph_format.space_after = Pt(12)

        # Helper for Section Heading
        def add_section_heading(title: str):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(title.upper())
            run.bold = True
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

        # 2. Professional Summary
        add_section_heading("Professional Summary")
        p_summary = doc.add_paragraph(tailored_content.get("summary", ""))
        p_summary.paragraph_format.space_after = Pt(8)

        # 3. Technical Skills
        add_section_heading("Technical Skills")
        for cat, skills in tailored_content.get("skills", {}).items():
            if skills:
                p_sk = doc.add_paragraph()
                p_sk.paragraph_format.space_after = Pt(2)
                r_cat = p_sk.add_run(f"{cat}: ")
                r_cat.bold = True
                p_sk.add_run(", ".join(skills))

        # 4. Work Experience
        add_section_heading("Professional Experience")
        for exp in tailored_content.get("experiences", []):
            p_exp_head = doc.add_paragraph()
            p_exp_head.paragraph_format.space_before = Pt(6)
            p_exp_head.paragraph_format.space_after = Pt(2)
            r_role = p_exp_head.add_run(exp.get("role", ""))
            r_role.bold = True
            p_exp_head.add_run(f" — {exp.get('company', '')} ({exp.get('location', '')}) | {exp.get('start_date', '')} - {exp.get('end_date', '')}")

            for bullet in exp.get("bullets", []):
                p_bullet = doc.add_paragraph(style='List Bullet')
                p_bullet.paragraph_format.space_after = Pt(2)
                p_bullet.add_run(bullet)

        # 5. Certifications & Education
        add_section_heading("Education & Certifications")
        for edu in tailored_content.get("educations", []):
            p_edu = doc.add_paragraph(style='List Bullet')
            p_edu.paragraph_format.space_after = Pt(2)
            p_edu.add_run(f"{edu.get('degree', '')} — {edu.get('institution', '')} ({edu.get('graduation_year', '')})")

        for cert in tailored_content.get("certifications", []):
            p_cert = doc.add_paragraph(style='List Bullet')
            p_cert.paragraph_format.space_after = Pt(2)
            p_cert.add_run(f"{cert.get('name', '')} — {cert.get('issuer', '')} ({cert.get('year', '')})")

        # Save DOCX
        doc.save(str(docx_path))

        # Save JD Snapshot JSON
        snapshot_dict = {
            "job_id": job.id,
            "company": job.company,
            "position": job.position,
            "source": job.source,
            "job_url": job.job_url,
            "job_description_raw": job.job_description,
            "requirements": job.requirements,
            "tailored_content": tailored_content,
            "docx_path": str(docx_path),
            "generated_at": datetime.now().isoformat()
        }
        with open(snapshot_path, "w", encoding="utf-8") as f:
            json.dump(snapshot_dict, f, indent=2, ensure_ascii=False)

        # Optional PDF generation if tools available
        pdf_path = self.convert_to_pdf(docx_path)
        if pdf_path:
            snapshot_dict["pdf_path"] = pdf_path

        return str(docx_path), str(snapshot_path)

    def convert_to_pdf(self, docx_path: Path) -> Optional[str]:
        """
        Attempts to convert DOCX to PDF using LibreOffice or Word COM if available.
        Falls back gracefully if neither is installed.
        """
        import subprocess
        import shutil

        # Try LibreOffice if in PATH
        libreoffice = shutil.which("soffice") or shutil.which("libreoffice")
        if libreoffice:
            try:
                subprocess.run(
                    [libreoffice, "--headless", "--convert-to", "pdf", "--outdir", str(docx_path.parent), str(docx_path)],
                    check=True,
                    capture_output=True,
                    timeout=30
                )
                expected_pdf = docx_path.with_suffix(".pdf")
                if expected_pdf.exists():
                    return str(expected_pdf)
            except Exception:
                pass

        return None

