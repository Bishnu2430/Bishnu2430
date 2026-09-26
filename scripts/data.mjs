// Content mirrored from the portfolio (D:\Portfolio\portfolio-site\src\data). Keep the two in sync.
export const SITE = "https://bishnuprasadkar.vercel.app";

export const profile = {
  name: "Bishnu Prasad Kar",
  firstName: "Bishnu",
  title: "AI/ML Engineer",
  summary:
    "I build AI systems you can inspect: models that explain their predictions, agents that leave a verifiable trail, and the math underneath them.",
  location: "Bhubaneswar, India",
  availability: "Open to AI/ML roles",
  email: "karbishnu2430@gmail.com",
  github: "https://github.com/Bishnu2430",
  linkedin: "https://www.linkedin.com/in/bishnu-prasad-kar",
  resume: `${SITE}/resume.pdf`,
};

export const education = {
  degree: "B.Tech, Computer Science and Engineering",
  school: "Gandhi Institute of Excellent Technocrats (GIET)",
  place: "Bhubaneswar",
  period: "Expected Aug 2027",
  cgpa: "8.8 / 10",
};

export const projects = [
  {
    slug: "q-consensus",
    title: "Q-CONSENSUS",
    hook: "Five AI agents debate, a quantum optimizer picks the consensus, and a blockchain keeps the receipts.",
    year: "2026",
    categories: ["Quantum", "GenAI", "Systems"],
    context: "Solo project",
    status: "In active development",
    size: "large",
    visual: "consensus",
    github: "https://github.com/Bishnu2430/Q-CONSENSUS",
  },
  {
    slug: "quantumlab",
    title: "QuantumLab",
    hook: "Poke a qubit and watch it answer: an interactive quantum lab where every number comes from a real Qiskit simulation.",
    year: "2026",
    categories: ["Quantum", "Systems"],
    context: "Smart India Hackathon 2026 · Team Creative Cartel",
    size: "large",
    visual: "bloch",
    github: "https://github.com/Bishnu2430/quantumLab",
  },
  {
    slug: "misinformation-vaccine",
    title: "Misinformation Vaccine",
    hook: "Paste a news link, get a verdict with confidence from a DistilBERT model trained on 44K articles.",
    year: "2025",
    categories: ["AI/ML"],
    context: "Solo project",
    size: "large",
    visual: "verdict",
    github: "https://github.com/Bishnu2430/Misinformation-Vaccine",
  },
  {
    slug: "floodwatch",
    title: "Floodwatch",
    hook: "An Arduino watches the water rise, a random forest scores the risk, and a local LLM explains it in plain words.",
    year: "2026",
    categories: ["AI/ML", "GenAI", "Systems"],
    context: "Suravi 2K26 · Team project",
    award: "1st place · Model Fiesta, Suravi 2K26",
    size: "large",
    visual: "flood",
    github: "https://github.com/Bishnu2430/Flood_Detection_System",
  },
  {
    slug: "soil-to-shelf",
    title: "Soil-to-Shelf",
    hook: "Every Ayurvedic herb traced from the field it was picked in to the QR code on the bottle.",
    year: "2025",
    categories: ["Systems"],
    context: "Smart India Hackathon 2025 · Team Creative Cartel",
    size: "medium",
    visual: "ledger",
    github: "https://github.com/Bishnu2430/ayurvedic-blockchain",
  },
  {
    slug: "cyclesense",
    title: "CycleSense",
    hook: "Smart-washroom sensors and an AI health assistant in one menstrual health platform.",
    year: "2026",
    categories: ["GenAI", "Systems"],
    context: "ReFlow Hackathon, IIT Bhubaneswar · Team project",
    award: "3rd place · ReFlow Hackathon, IIT Bhubaneswar",
    size: "medium",
    visual: "cycle",
    github: "https://github.com/Bishnu2430/MENSTRUAL_HEALTH_-_HYGIENE",
  },
  {
    slug: "shelfsight",
    title: "ShelfSight",
    hook: "Point a phone camera at a shelf: QR and OCR identify the product, and a model flags what to restock.",
    year: "2025",
    categories: ["AI/ML"],
    context: "Solo project",
    size: "medium",
    visual: "scanner",
    github: "https://github.com/Bishnu2430/Smart_Product_Scanner",
  },
];

export const experience = [
  {
    role: "Generative AI Trainee",
    org: "Central Tool Room & Training Centre (CTTC), Ministry of MSME",
    period: "Jun 2026",
    points: [
      "Built AI/ML applications in an industry-focused training programme.",
      "Worked across LLMs, RAG, LangChain and Hugging Face, from model integration to working apps.",
    ],
  },
  {
    role: "Data Science Trainee & Intern",
    org: "Jyesta Corporate Entity × E-Cell IIT Roorkee",
    period: "Dec 2025 – Feb 2026",
    points: [
      "Built a movie recommendation and analysis system from raw, messy data.",
      "Built a loan prediction system with feature engineering, several models and explainability, focused on why a model decides, not only what.",
    ],
  },
  {
    role: "Backend Engineering Trainee",
    org: "Boot.dev (remote)",
    period: "Jul 2025 – Jul 2026",
    points: ["Completed backend projects in Python, SQL, Linux, Docker, networking and system design."],
  },
];

export const publications = [
  { title: "Entropy-Optimized Adaptive Hybrid Thresholding for Retinal Blood Vessel Segmentation", venue: "SPARK-2K26 Research Conclave, GIET Bhubaneswar", year: "2026" },
  { title: "CityFlow: A Scalable Big Data Framework for Real-Time Analytics in Computing 4.0", venue: "National Conference on Computing 4.0 (NCCENGT-2025)", year: "2025" },
  { title: "A Modular and Scalable Arithmetic and Logical Unit Design through Multiplexer-Based Controller", venue: "Intl. Conference on Semiconductor Technologies and Renewable Energy (ICSTRE-2024)", year: "2024" },
];

export const awards = [
  { title: "1st place · Floodwatch", event: "Model Fiesta, Suravi 2K26 (Feb 2026)" },
  { title: "Top performer · 94%", event: "8-week Machine Learning training, Internshala (2025)" },
  { title: "3rd place · CycleSense", event: "ReFlow Hackathon, IIT Bhubaneswar (Nov 2025)" },
  { title: "Merit certificate, 81.67%", event: "Quantum Computing, C-DAC with IIT Roorkee" },
];

export const certifications = [
  { id: "nvidia", name: "Getting Started with Deep Learning", issuer: "NVIDIA Deep Learning Institute", href: `${SITE}/certificates/nvidia-deep-learning.pdf` },
  { id: "cs50", name: "Introduction to AI with Python", issuer: "Harvard CS50", href: `${SITE}/certificates/cs50-ai.pdf` },
  { id: "microsoft", name: "Career Essentials in Generative AI", issuer: "Microsoft & LinkedIn Learning", href: `${SITE}/certificates/microsoft-genai.pdf` },
  { id: "quantum", name: "Quantum Computing", issuer: "IIT Roorkee & C-DAC", href: `${SITE}/certificates/quantum-computing.pdf` },
];

export const toolbox = [
  {
    job: "Models that explain themselves",
    story: "A simple baseline first, a bigger model only if it earns its cost, and a reason next to every prediction.",
    tools: ["scikit-learn", "PyTorch", "Transformers", "SHAP"],
    usedIn: ["Misinformation Vaccine", "Floodwatch"],
  },
  {
    job: "LLMs that run where the data is",
    story: "Local models with a fallback, prompts scoped to one job, and explanations streamed into the product rather than a chat box.",
    tools: ["llama.cpp", "Ollama", "Gemini", "LangChain + RAG"],
    usedIn: ["Q-CONSENSUS", "Floodwatch", "CTTC internship"],
  },
  {
    job: "Quantum, judged against classical",
    story: "Every quantum step ships with a classical baseline, so the comparison is on the page, not assumed.",
    tools: ["Qiskit", "Qiskit Aer", "QAOA", "Quantum kernels"],
    usedIn: ["Q-CONSENSUS", "QuantumLab"],
  },
  {
    job: "Records nobody can quietly edit",
    story: "Hash chains and ledgers where provenance matters, kept optional so the rest of the system still runs without them.",
    tools: ["SHA-256 event chains", "Solidity on Geth", "Hyperledger Fabric"],
    usedIn: ["Q-CONSENSUS", "Soil-to-Shelf"],
  },
  {
    job: "Hardware in the loop",
    story: "Cheap sensors and phone cameras feeding the same pipelines as everything else.",
    tools: ["Arduino", "ESP32", "OpenCV", "PaddleOCR"],
    usedIn: ["Floodwatch", "CycleSense", "ShelfSight"],
  },
  {
    job: "Shipping it",
    story: "APIs, databases and containers that start the same way on every machine, tested as a whole system.",
    tools: ["FastAPI", "Node.js", "PostgreSQL", "Docker Compose", "React"],
    usedIn: ["Every project above"],
  },
];

// Oldest first, as on the portfolio.
export const journey = [
  { year: "2024", note: "Started close to the hardware", milestones: [
    { date: "2024", kind: "paper", title: "First paper: a multiplexer-based ALU controller", detail: "Presented at ICSTRE-2024, an international conference on semiconductor technologies." },
  ] },
  { year: "2025", note: "Moved from circuits to models", milestones: [
    { date: "Apr 2025", kind: "build", title: "ShelfSight", detail: "First computer-vision build: QR + OCR product scanning with a restock model." },
    { date: "Jul 2025", kind: "learn", title: "Started Boot.dev's backend engineering track", detail: "A year of Python, SQL, Linux, Docker, networking and system design." },
    { date: "Sep 2025", kind: "build", title: "Soil-to-Shelf for the internal Smart India Hackathon", detail: "Built the Hyperledger Fabric layer that traces herbs from farm to shelf." },
    { date: "Oct 2025", kind: "build", title: "Misinformation Vaccine", detail: "Fine-tuned DistilBERT on 44K news articles to flag fake news from a URL." },
    { date: "Sep 2025", kind: "paper", title: "CityFlow: a big data framework for real-time analytics", detail: "Presented at the National Conference on Computing 4.0 (NCCENGT-2025)." },
    { date: "Nov 2025", kind: "award", title: "CycleSense takes 3rd at ReFlow", detail: "ReFlow Menstrual Health Innovation Hackathon, IIT Bhubaneswar: an IoT and LLM health platform." },
    { date: "Dec 2025", kind: "work", title: "Data Science Trainee & Intern", detail: "Jyesta Corporate Entity × E-Cell IIT Roorkee. Recommendation and loan-prediction systems with model explainability." },
  ] },
  { year: "2026", note: "Agents, explainability and quantum", milestones: [
    { date: "Feb 2026", kind: "award", title: "Floodwatch wins Model Fiesta", detail: "1st place at Suravi 2K26: Arduino sensors, a random forest with SHAP, and a local LLM that explains flood risk." },
    { date: "Feb 2026", kind: "build", title: "Started Q-CONSENSUS", detail: "Multi-agent debate with quantum-optimized consensus and blockchain provenance." },
    { date: "Jan 2026", kind: "paper", title: "Entropy-optimized thresholding for retinal vessel segmentation", detail: "Presented at the SPARK-2K26 Research Conclave, GIET Bhubaneswar." },
    { date: "Jun 2026", kind: "work", title: "Generative AI Trainee", detail: "CTTC, Ministry of MSME. LLMs, RAG, LangChain and Hugging Face, with an end-to-end capstone." },
    { date: "Jul 2026", kind: "learn", title: "Completed Boot.dev backend engineering", detail: "Finished the full track after twelve months." },
    { date: "Aug 2026", kind: "build", title: "QuantumLab for Smart India Hackathon 2026", detail: "With Team Creative Cartel: an interactive quantum lab backed by real Qiskit Aer simulations." },
  ] },
  { year: "2027", note: "Next layer", milestones: [
    { date: "Aug 2027", kind: "learn", title: "Graduating B.Tech CSE", detail: "GIET Bhubaneswar, currently at 8.8 CGPA." },
  ] },
];
