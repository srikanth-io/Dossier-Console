export type ResumeTemplate = {
  id: string
  name: string
  description: string
  source: string
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "executive",
    name: "Executive",
    description: "ATS-friendly layout modeled on a real-world developer resume.",
    source: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Srikanth Sankar}} \\\\
  \\small
  Full-Stack Developer $|$ Angular, Next.js, React $|$ C\\#/.NET API, Node.js \\\\
  \\href{mailto:info.srikanthsankar@gmail.com}{info.srikanthsankar@gmail.com} $|$
  +91 96007 00375 $|$
  \\href{https://github.com/srikanth-io}{github.com/srikanth-io} $|$
  \\href{https://linkedin.com/in/srikanth-io}{linkedin.com/in/srikanth-io}
\\end{center}

\\section{Professional Summary}
Software Analyst with 2 years of experience in software development and full stack development -- back-end services in C\\#/.NET, Node.js, and Python, and front-end development with JavaScript, TypeScript, Angular, React, HTML, and CSS. Delivered 6 production web and mobile applications end-to-end, including distributed, event-driven microservices processing large-scale transactional data. Bachelor's degree in Computer Science and Engineering with a foundation in data structures and algorithms. Experienced in code reviews, debugging and issue triage, technical documentation, and Agile/Scrum collaboration -- versatile across the stack and enthusiastic about taking on new problems.

\\section{Technical Skills}
\\textbf{Programming:} TypeScript, JavaScript (ES6+), C\\#, SQL, Python, HTML5, CSS3 \\\\
\\textbf{Front-End:} Angular, React.js, Next.js, React Native, Tailwind CSS, shadcn/ui, Bootstrap, SASS, Material UI, responsive web design, UI/UX implementation \\\\
\\textbf{Back-End \\& APIs:} .NET 9 / ASP.NET Core, NestJS, Node.js, RESTful API development, microservices, event-driven architecture, RabbitMQ, Azure Service Bus \\\\
\\textbf{Databases \\& Cloud:} Microsoft SQL Server, MongoDB (NoSQL), Redis, Elasticsearch, Microsoft Azure, Docker, Kubernetes \\\\
\\textbf{CS Fundamentals:} data structures, algorithms, object-oriented programming (OOP), REST architecture, distributed systems concepts (microservices, message queues, caching) \\\\
\\textbf{AI \\& LLM:} Claude API, Claude Code CLI, Model Context Protocol (MCP), prompt engineering, AI-assisted development, GitHub Copilot, Ollama, local LLMs \\\\
\\textbf{Tools \\& Methodologies:} Git, GitLab, Bitbucket, Agile/Scrum, code review, unit testing, debugging, technical documentation, VS Code, JetBrains Rider

\\section{Work Experience}
\\textbf{Cybersecurity Trainee -- Web Application Penetration Testing} \\hfill Jan 2026 -- Present \\\\
\\textit{Swiftant IT Solutions, Hosur, Tamil Nadu, India}
\\begin{itemize}[leftmargin=1.5em]
  \\item Perform authorized vulnerability assessment and penetration testing (VAPT) of internal and client-facing web and mobile applications across all 10 OWASP Top 10 risk categories, including broken access control, SQL injection, cross-site scripting (XSS), and security misconfiguration.
  \\item Conduct reconnaissance and service enumeration with Nmap and manual security testing with Burp Suite; validate 100\\% of findings by hand to eliminate false positives and confirm exploitability.
  \\item Author professional VAPT reports rating each finding across 4 severity levels (Critical, High, Medium, Low), with step-by-step reproduction instructions and actionable remediation guidance for developers and non-technical stakeholders.
  \\item Accelerate vulnerability triage, security test-case generation, and report drafting with Claude and Model Context Protocol (MCP) workflows, reducing assessment turnaround time.
\\end{itemize}

\\textbf{Software Analyst -- Full-Stack Developer} \\hfill Aug 2024 -- Present \\\\
\\textit{Swiftant IT Solutions, Hosur, Tamil Nadu, India}
\\begin{itemize}[leftmargin=1.5em]
  \\item Delivered 6 production applications end-to-end across insurance and logistics domains in Agile/Scrum sprints -- gathering requirements, building front-end and back-end components, integrating RESTful APIs, testing, debugging, and deployment.
  \\item Developed distributed, event-driven back-end microservices for a multi-geography insurance platform using C\\#/.NET 9, SQL Server, MongoDB, Redis, RabbitMQ, and Elasticsearch, enabling rapid product launches across multiple markets.
  \\item Engineered the UI and REST API integration for a real-time dynamic routing engine spanning 4 transport modes (ocean, air, rail, truck), rerouting shipments based on live weather and traffic data, built with Next.js, Angular, and C\\#/.NET.
  \\item Built dynamic form engines, data tables with sorting, pagination, and filtering, and JSON-driven document rendering for an insurance certification platform covering 5 product lines (motor, marine, indemnity, life, travel) using Angular, C\\#/.NET, and SQL Server.
  \\item Implemented 4 core warehouse workflows -- lot-based packing, container tracking, inventory management, and cycle counts -- for an enterprise warehouse management system (WMS) processing large-scale transactional data using Angular and C\\#/.NET.
  \\item Led end-to-end development of an insurance claims mobile application shipped to 2 platforms (Android, iOS) from a single React Native and TypeScript codebase, owning architecture, implementation, and delivery.
  \\item Reviewed code developed by peers in Agile/Scrum sprints, providing feedback on style, correctness, testability, and efficiency; contributed to technical documentation and updated it as products evolved.
  \\item Optimized claims filing and reimbursement workflows in a customer-facing insurance portal with lazy loading, rendering views of 1,000+ records without performance degradation using Angular.
\\end{itemize}

\\textbf{Intern -- Electronic Data Interchange (EDI)} \\hfill Mar 2024 -- Jul 2024 \\\\
\\textit{Swiftant IT Solutions, Hosur, Tamil Nadu, India}
\\begin{itemize}[leftmargin=1.5em]
  \\item Built and monitored EDI mappings for 3 freight modes (sea, road, air); validated product tracking across FTP-based data exchanges supporting logistics and supply chain operations.
\\end{itemize}

\\textbf{AI-Powered Banking Chatbot -- Remote Internship} \\hfill 2023 \\\\
\\textit{IBM, Remote}
\\begin{itemize}[leftmargin=1.5em]
  \\item Developed an AI-powered banking chatbot using Python, Flask, natural language processing (NLP), and IBM Watson Assistant; conducted user acceptance testing (UAT) and survey-based research to improve conversation quality and user experience.
\\end{itemize}

\\section{Publication}
\\textbf{Virtual Top Try-On Using Deep Learning (peer-reviewed)} \\hfill May 2023 \\\\
\\textit{International Scientific Journal of Engineering and Management}
\\begin{itemize}[leftmargin=1.5em]
  \\item Built a convolutional neural network (CNN) / U-Net image-segmentation model for virtual clothing try-on, achieving approximately 70\\% accuracy in identifying clothing patterns and textures using computer vision and deep learning techniques.
\\end{itemize}

\\section{Education}
\\textbf{Bachelor of Engineering (B.E.), Computer Science and Engineering} \\hfill 2019 -- 2023 \\\\
\\textit{Info Institute of Engineering} $|$ CGPA: 8.09 / 10 $|$ Coimbatore, Tamil Nadu, India \\\\
Coursework: Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks

\\section{Certifications}
\\begin{itemize}[leftmargin=1.5em]
  \\item Cisco Certified CyberOps Associate -- currently pursuing
  \\item Java Full-Stack Development
  \\item Essential Linux Security
  \\item Cybersecurity Terminology
  \\item Anthropic AI Fluency
  \\item AI Capabilities and Limitations
  \\item AI Fluency: Framework \\& Foundations
  \\item Building with the Claude API
  \\item Claude 101
  \\item Claude Code 101
  \\item Claude Code in Action
  \\item Claude Platform 101
  \\item Introduction to Claude Cowork
\\end{itemize}

\\section{Interests}
Building web and mobile side projects, ethical hacking and capture-the-flag (CTF) labs (OWASP Juice Shop), and self-directed learning of new technology stacks and AI tooling.

\\end{document}
`,
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional single-column layout.",
    source: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{John Doe}} \\\\
  \\small
  Email: \\href{mailto:john@example.com}{john@example.com} $|$
  Phone: +1 (555) 123-4567 $|$
  Location: San Francisco, CA \\\\
  \\href{https://github.com}{github.com/johndoe} $|$
  \\href{https://linkedin.com}{linkedin.com/in/johndoe}
\\end{center}

\\section{Summary}
Results-driven software engineer with 5+ years of experience building
scalable web applications, leading cross-functional teams, and shipping
products used by millions.

\\section{Experience}
\\textbf{Senior Software Engineer} \\hfill Jan 2022 -- Present \\\\
\\textit{Acme Corp, San Francisco, CA}
\\begin{itemize}[leftmargin=1.5em]
  \\item Led migration to a microservices architecture serving 2M+ daily requests.
  \\item Reduced average API latency by 38\\% through query optimization and caching.
  \\item Mentored 4 junior engineers and introduced a team code review culture.
\\end{itemize}

\\textbf{Software Engineer} \\hfill Jun 2019 -- Dec 2021 \\\\
\\textit{Northwind Labs, Remote}
\\begin{itemize}[leftmargin=1.5em]
  \\item Built and shipped a real-time dashboard used by 50+ enterprise clients.
  \\item Automated deployment pipeline, cutting release time from days to hours.
\\end{itemize}

\\section{Education}
\\textbf{B.Sc. in Computer Science} \\hfill 2015 -- 2019 \\\\
\\textit{State University, GPA 3.8/4.0}

\\section{Skills}
\\textbf{Languages:} TypeScript, Python, Go, SQL \\\\
\\textbf{Frameworks:} React, Node.js, Django, PostgreSQL \\\\
\\textbf{Tools:} Docker, Kubernetes, AWS, Git

\\end{document}
`,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Two-tone headers with accent rules.",
    source: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}
\\definecolor{accent}{HTML}{495464}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Large \\textbf{Sarah Kim}} \\\\
  \\href{mailto:sarah@example.com}{sarah@example.com} $|$
  +1 (555) 987-6543 $|$
  Seattle, WA
\\end{center}

\\vspace{0.2em}
\\hrule
\\vspace{0.4em}

\\section*{Profile}
Product designer and front-end engineer who turns complex problems into
simple, elegant interfaces. Strong background in design systems and
accessibility.

\\section{Experience}
\\textbf{Product Designer} \\hfill Mar 2021 -- Present \\\\
\\textit{Lumina Studio, Seattle, WA}
\\begin{itemize}[leftmargin=1.5em]
  \\item Designed a component library adopted across 12 product teams.
  \\item Ran user research with 200+ participants to inform design decisions.
\\end{itemize}

\\textbf{Front-End Engineer} \\hfill Jul 2018 -- Feb 2021 \\\\
\\textit{Bluewave, Remote}
\\begin{itemize}[leftmargin=1.5em]
  \\item Developed accessible, responsive marketing pages that doubled signups.
\\end{itemize}

\\section{Education}
\\textbf{M.F.A. in Interaction Design} \\hfill 2016 -- 2018 \\\\
\\textit{Design Institute of Technology}

\\section{Skills}
Figma, React, TypeScript, Accessibility (WCAG), Design Systems, Prototyping

\\end{document}
`,
  },
  {
    id: "compact",
    name: "Compact",
    description: "Two-column, space-efficient resume.",
    source: `\\documentclass[9pt,a4paper]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{multicol}
\\usepackage{enumitem}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Alex Rivera}} \\\\
  \\small
  alex@example.com $|$ +1 (555) 246-8100 $|$ Austin, TX
\\end{center}

\\vspace{0.2em}

\\begin{multicols}{2}

\\section{Summary}
Backend engineer focused on distributed systems, data pipelines, and
developer tooling. 7 years shipping production systems.

\\section{Experience}
\\textbf{Staff Engineer} \\hfill 2020 -- Present \\\\
\\textit{Dataflow Inc.}
\\begin{itemize}[leftmargin=1.2em]
  \\item Architected a stream-processing platform handling 10B events/day.
  \\item Cut infrastructure costs by 30\\% with workload scheduling.
\\end{itemize}

\\textbf{Backend Engineer} \\hfill 2017 -- 2020 \\\\
\\textit{Pipeline Systems}
\\begin{itemize}[leftmargin=1.2em]
  \\item Built ETL frameworks used across 30+ data teams.
\\end{itemize}

\\section{Education}
\\textbf{B.S. in Computer Engineering} \\hfill 2013 -- 2017 \\\\
\\textit{Tech University}

\\section{Skills}
Go, Rust, Kafka, Spark, Kubernetes, Terraform, gRPC

\\end{multicols}

\\end{document}
`,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, whitespace-forward single column.",
    source: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.9in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}

\\begin{document}

{\\LARGE \\textbf{Elena Petrova}} \\\\
\\small
\\href{mailto:elena@example.com}{elena@example.com} $|$ +1 (555) 313-4000 $|$ Portland, OR

\\vspace{1.2em}

\\section*{Profile}
Quietly productive designer-engineer who cares about craft, accessibility, and performance. I have spent the last six years turning ambiguous problems into interfaces people rely on every day.

\\section*{Selected Experience}
\\textbf{Senior Product Engineer} \\hfill 2021 -- Present \\\\
\\textit{Fieldnote, Portland, OR}
\\begin{itemize}[leftmargin=1.5em]
  \\item Led a 4-person team rebuilding the company's flagship editor; shipped 3 major releases with zero regressions.
  \\item Introduced an accessibility review process that brought WCAG AA compliance from 40\\% to 95\\%.
\\end{itemize}

\\textbf{Product Engineer} \\hfill 2018 -- 2021 \\\\
\\textit{Northbeam, Remote}
\\begin{itemize}[leftmargin=1.5em]
  \\item Designed and shipped a design-system library used across 8 products and 30+ engineers.
  \\item Cut bundle size by 45\\% through code-splitting and image optimization.
\\end{itemize}

\\section*{Education}
\\textbf{B.S. in Computer Science} \\hfill 2014 -- 2018 \\\\
\\textit{Pacific State University, Portland, OR}

\\section*{Skills}
TypeScript, React, Node.js, Design Systems, Accessibility, Web Performance, Figma

\\end{document}
`,
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "Two-column layout with a compact side rail.",
    source: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.6in]{geometry}
\\usepackage{multicol}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Large \\textbf{Daniel Okafor}} \\\\
  \\small
  \\href{mailto:daniel@example.com}{daniel@example.com} $|$ +1 (555) 482-1133 $|$ Toronto, ON
\\end{center}

\\vspace{0.3em}

\\begin{multicols}{2}

\\section{Contact}
\\textbf{Email:} \\href{mailto:daniel@example.com}{daniel@example.com} \\\\
\\textbf{Phone:} +1 (555) 482-1133 \\\\
\\textbf{Location:} Toronto, ON \\\\
\\textbf{GitHub:} \\href{https://github.com}{github.com/danielokafor} \\\\
\\textbf{LinkedIn:} \\href{https://linkedin.com}{linkedin.com/in/danielokafor}

\\section{Skills}
\\textbf{Languages:} Go, TypeScript, Python \\\\
\\textbf{Platforms:} AWS, GCP, Kubernetes, Docker \\\\
\\textbf{Data:} PostgreSQL, Redis, Kafka \\\\
\\textbf{Other:} Terraform, gRPC, GraphQL, CI/CD

\\section{Education}
\\textbf{B.S. Computer Science} \\hfill 2016 -- 2020 \\\\
\\textit{University of Toronto}

\\section{Profile}
Platform engineer focused on reliable, observable infrastructure and pragmatic tooling. 5+ years building and operating systems that never fall over when it matters.

\\section{Experience}
\\textbf{Site Reliability Engineer} \\hfill 2021 -- Present \\\\
\\textit{Nimbus Cloud, Toronto}
\\begin{itemize}[leftmargin=1.2em]
  \\item Reduced p95 latency by 40\\% through cache and query optimization.
  \\item Cut cloud spend 25\\% by right-sizing workloads and automating scaling.
\\end{itemize}

\\textbf{Platform Engineer} \\hfill 2019 -- 2021 \\\\
\\textit{Canopy Labs, Remote}
\\begin{itemize}[leftmargin=1.2em]
  \\item Built CI/CD pipelines used by 20+ engineering teams.
  \\item Migrated 12 services from VMs to Kubernetes with zero downtime.
\\end{itemize}

\\end{multicols}

\\end{document}
`,
  },
  {
    id: "academic",
    name: "Academic",
    description: "Research-focused layout for CVs and academia.",
    source: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Large \\textbf{Dr. Priya Ramanathan}} \\\\
  \\small
  \\href{mailto:priya@example.com}{priya@example.com} $|$ +1 (555) 765-8899 $|$ Ithaca, NY
\\end{center}

\\section{Research Interests}
Computer vision, machine learning for medical imaging, deep generative models, and interpretable AI.

\\section{Education}
\\textbf{Ph.D. in Computer Science} \\hfill 2016 -- 2021 \\\\
\\textit{Cornell University, Ithaca, NY}
\\begin{itemize}[leftmargin=1.5em]
  \\item Dissertation: "Learning Robust Representations for Medical Image Segmentation."
  \\item Advised by Prof. A. Chen; funded by NSF Graduate Fellowship.
\\end{itemize}

\\textbf{M.Sc. in Computer Science} \\hfill 2014 -- 2016 \\\\
\\textit{Indian Institute of Technology, Madras, India}

\\section{Publications}
\\begin{enumerate}[leftmargin=1.5em]
  \\item Ramanathan, P. and Chen, A. "Uncertainty-Aware Segmentation with Diffusion Priors." CVPR 2023.
  \\item Ramanathan, P. et al. "Self-Supervised Pretraining for Pathology Images." MIDL 2022.
  \\item Ramanathan, P. et al. "Efficient Transformers for Volumetric Data." NeurIPS Workshop, 2021.
\\end{enumerate}

\\section{Teaching}
\\textbf{Teaching Assistant -- Machine Learning} \\hfill 2017 -- 2021 \\\\
\\textit{Cornell University}
\\begin{itemize}[leftmargin=1.5em]
  \\item Ran weekly sections for 120+ students; consistently rated in top 10\\% of TAs.
\\end{itemize}

\\section{Awards}
NSF Graduate Research Fellowship, 2016; Best Student Paper Award, CVPR 2023.

\\section{References}
Available upon request.

\\end{document}
`,
  },
  {
    id: "technical",
    name: "Technical",
    description: "Skills-first resume for engineering roles.",
    source: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Marcus Chen}} \\\\
  \\small
  Senior DevOps Engineer $|$
  \\href{mailto:marcus@example.com}{marcus@example.com} $|$ Berlin, DE
\\end{center}

\\section{Core Stack}
\\textbf{Infrastructure:} Kubernetes, Docker, Terraform, Ansible, Helm, ArgoCD \\\\
\\textbf{Cloud:} AWS (EKS, Lambda, S3, RDS), GCP \\\\
\\textbf{CI/CD \\& Observability:} GitHub Actions, Jenkins, Prometheus, Grafana, Loki \\\\
\\textbf{Languages:} Go, Python, Bash \\\\
\\textbf{Data:} PostgreSQL, Redis, Kafka, ClickHouse

\\section{Experience}
\\textbf{Senior DevOps Engineer} \\hfill 2020 -- Present \\\\
\\textit{Streamline GmbH, Berlin}
\\begin{itemize}[leftmargin=1.5em]
  \\item Standardized 60+ microservices on GitOps-driven EKS clusters with ArgoCD.
  \\item Built a self-service developer platform, cutting environment provisioning from days to minutes.
  \\item Reduced incident count by 55\\% with proactive SLO alerting in Prometheus.
\\end{itemize}

\\textbf{Platform Engineer} \\hfill 2017 -- 2020 \\\\
\\textit{Cloudscale AG, Munich}
\\begin{itemize}[leftmargin=1.5em]
  \\item Migrated 200+ VMs to Kubernetes with near-zero downtime.
  \\item Introduced cost dashboards and tagging, saving 30\\% on cloud spend.
\\end{itemize}

\\section{Projects}
\\begin{itemize}[leftmargin=1.5em]
  \\item \\textbf{clustercare} -- open-source cluster autoscaler toolkit; 1.2k GitHub stars.
  \\item \\textbf{pipeliner} -- declarative CI/CD orchestrator written in Go.
\\end{itemize}

\\section{Education}
\\textbf{B.Sc. in Computer Science} \\hfill 2013 -- 2017 \\\\
\\textit{Technical University of Berlin}

\\end{document}
`,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold header with rules for designers and artists.",
    source: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Large \\textbf{Amara Osei}} \\\\
  \\small
  Brand Designer $|$ Illustrator $|$ Art Director \\\\
  \\href{mailto:amara@example.com}{amara@example.com} $|$ +1 (555) 902-1144 $|$ Accra, GH
\\end{center}

\\hrule
\\vspace{0.4em}

\\section{About}
Designer with 8 years shaping brand identities for startups, publishers, and cultural institutions. I believe great design makes complex ideas feel inevitable.

\\section{Selected Work}
\\textbf{Brand Identity -- Northwind Magazine} \\hfill 2022 \\\\
\\textit{Art Direction, Typography, Print}
\\begin{itemize}[leftmargin=1.5em]
  \\item Rebuilt the visual language for a 50-year-old publication across print and web.
\\end{itemize}

\\textbf{Brand System -- Kite \\& Company} \\hfill 2021 \\\\
\\textit{Strategy, Logo, Guidelines}
\\begin{itemize}[leftmargin=1.5em]
  \\item Delivered a 140-page brand system adopted company-wide.
\\end{itemize}

\\textbf{Exhibition Design -- City Gallery} \\hfill 2020 \\\\
\\textit{Environmental Graphics}
\\begin{itemize}[leftmargin=1.5em]
  \\item Designed wayfinding and exhibition graphics for a retrospective drawing 40k visitors.
\\end{itemize}

\\section{Awards}
Adobe Design Achievement Award (Honorable Mention), 2021; Design Week Emerging Talent, 2019.

\\section{Tools}
Figma, Illustrator, Photoshop, After Effects, InDesign, Blender, Procreate

\\section{Education}
\\textbf{B.F.A. in Graphic Design} \\hfill 2012 -- 2016 \\\\
\\textit{Kwame Nkrumah University of Science and Technology}

\\end{document}
`,
  },
]

export function getTemplate(id: string): ResumeTemplate | undefined {
  return resumeTemplates.find((t) => t.id === id)
}
