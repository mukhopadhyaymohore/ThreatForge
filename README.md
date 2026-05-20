# ⚠ THREATFORGE — AI-Powered Incident Response Playbook Generator

![Python](https://img.shields.io/badge/Python-3.10-blue?style=flat-square&logo=python)
![Django](https://img.shields.io/badge/Django-4.2-green?style=flat-square&logo=django)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange?style=flat-square)
![Render](https://img.shields.io/badge/Deployed-Render-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-red?style=flat-square)

> Describe any security incident in plain language. Get a structured, AI-generated incident response playbook in seconds.

🔴 **Live Demo:** [threatforge-coq9.onrender.com](https://threatforge-coq9.onrender.com)

---

## 🚀 What is THREATFORGE?

THREATFORGE is a full stack cybersecurity web application that combines NLP-based incident classification with Groq AI (LLaMA 3.3 70B) to generate structured, actionable incident response playbooks — tailored to your specific incident type, severity, and organisation size.

No more starting from scratch during a crisis. Describe what happened, get a complete response plan in under 10 seconds.

---

## ✨ Features

- **8 Incident Types Supported** — Ransomware, Phishing, DDoS, Data Breach, Insider Threat, Malware, Zero-Day, Social Engineering
- **AI-Generated 5-Phase Playbook** — Identification → Containment → Eradication → Recovery → Post-Incident
- **Role-Based Step Ownership** — SOC Analyst, IR Lead, CISO, Legal, PR, System Admin
- **IOC Checklist** — Indicators of Compromise specific to each incident type
- **Communication Templates** — Pre-written messages for Internal IT, Executives, Legal, Customers, Regulators
- **Regulatory Guidance** — GDPR, HIPAA, PCI-DSS, SOX flagged automatically
- **Tools & Commands** — Specific security tools and terminal commands per step
- **Export** — Download playbook as JSON or Markdown
- **Animated Threat Map** — Live attack arc visualisation on landing page
- **Live Threat Feed** — Real-time simulated threat indicator panel

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Django 4.2, Django REST Framework |
| AI Model | Groq API — LLaMA 3.3 70B |
| NLP Classifier | Custom keyword-based incident classifier |
| Deployment | Render |
| Static Files | WhiteNoise |

---

## 📁 ProjThreatForge/

```
ThreatForge/
├── backend/
│   ├── api/
│   │   ├── classifier.py
│   │   ├── prompts.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── irplaybook/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   └── render.yaml
└── frontend/
    ├── index.html
    ├── app.html
    ├── style.css
    ├── landing.js
    └── app.js
```

---

## ⚙ Local Setup

```bash
git clone https://github.com/mukhopadhyaymohore/ThreatForge.git
cd ThreatForge/backend
py -3.10 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
echo GROQ_API_KEY=your_groq_key > .env
echo DJANGO_SECRET_KEY=your_secret_key >> .env
echo DEBUG=True >> .env
python manage.py runserver
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/classify/` | Classify incident type and severity |
| POST | `/api/generate/` | Generate full IR playbook |

---

## 🧠 How It Works

1. **Describe** — Write the incident in plain language
2. **Classify** — Keyword NLP engine detects incident type, severity, and org size
3. **Generate** — Groq LLaMA 3.3 70B builds a complete 5-phase playbook
4. **Export** — Download as JSON or Markdown for your SOC team

---

⭐ Star this repo if you found it useful!
