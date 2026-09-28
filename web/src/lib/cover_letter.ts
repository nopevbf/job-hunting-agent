import { JobPostData } from "./types";

/**
 * Detects if the text is primarily in Indonesian or English.
 */
export function isIndonesianText(text: string): boolean {
  const lower = text.toLowerCase();
  const indoSignals = [
    "kami", "mencari", "yang", "dan", "untuk", "pengalaman", "kualifikasi",
    "tanggung", "jawab", "keahlian", "kemampuan", "bersedia", "di"
  ];
  let matchCount = 0;
  for (const signal of indoSignals) {
    const regex = new RegExp(`\\b${signal}\\b`, "i");
    if (regex.test(lower)) {
      matchCount++;
    }
  }
  return matchCount >= 3;
}

/**
 * Generates a truth-preserving, tailored cover letter.
 * Strictly adheres to facts: only mentions verified user skills and target company/role.
 */
export function generateTailoredCoverLetter(job: JobPostData, candidateName: string = "Firman Aji Prasetyo"): string {
  const isIndo = isIndonesianText(job.job_description + " " + job.position);
  const matched = (job.matched_skills && job.matched_skills.length > 0)
    ? job.matched_skills
    : ["Manual Testing", "Playwright", "Selenium", "Postman", "SQL"];

  const skillsList = matched.join(", ");

  if (isIndo) {
    return `Yth. Tim Rekrutmen ${job.company},

Sehubungan dengan dibukanya kesempatan karir untuk posisi ${job.position} di ${job.company}, perkenankan saya mengajukan diri untuk bergabung dan berkontribusi secara nyata bagi tim engineering Anda.

Dengan latar belakang lebih dari 1.5 tahun di bidang Software Quality Assurance pada domain PropertyTech dan Fintech, saya memiliki keahlian terverifikasi pada ${skillsList}. Pengalaman saya mencakup perancangan test case berbasis teknik ISTQB (EP, BVA, Decision Table), otomasi pengujian regresi web, monitoring bug dengan Grafana, serta validasi API yang terbukti mampu memangkas waktu regresi hingga 67% dan menekan defect leakage ke production hingga 30%.

Saya sangat antusias dengan produk teknologi ${job.company}, dan meyakini bahwa pendekatan pengujian terstruktur dan teliti yang saya miliki dapat memperkuat reliabilitas rilis aplikasi perusahaan.

Terima kasih atas waktu dan kesempatan yang diberikan untuk mempertimbangkan profil saya. Saya sangat menantikan kesempatan untuk berdiskusi lebih lanjut dalam tahap wawancara.

Hormat saya,

${candidateName}
firajitio@gmail.com | +62-851-7337-0796`;
  }

  // English version
  return `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.position} opportunity currently available at ${job.company}. With a proven track record in Software Quality Assurance, test automation (Selenium, Playwright), and API testing across PropertyTech and Fintech ecosystems, I am eager to contribute to your engineering excellence.

Throughout my 1.5+ years of QA engineering experience, I have developed solid expertise in ${skillsList}. My day-to-day responsibilities have included architecting comprehensive test suites, applying ISTQB-aligned techniques (EP, BVA, Decision Table), tracing bugs with Grafana, and automating end-to-end regression tests. These initiatives successfully cut regression execution time by 67% and drove a 30% reduction in production defects.

I am deeply impressed by ${job.company}'s technology and would welcome the opportunity to apply my structured testing principles to help maintain top-tier software quality across your releases.

Thank you for your time and consideration. I look forward to the possibility of discussing how my technical background and testing philosophy align with your team's goals.

Sincerely,

${candidateName}
firajitio@gmail.com | +62-851-7337-0796`;
}
