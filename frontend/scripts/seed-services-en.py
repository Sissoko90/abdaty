#!/usr/bin/env python3
"""
Seed des traductions ANGLAISES des sous-sections riches des services
(statistiques / avantages / processus / technologies).

Pré-requis : backend démarré sur http://localhost:8080 et services déjà
renseignés en français. Idempotent : réécrit uniquement les tableaux EN de
valueEn en les alignant sur l'ordre des tableaux FR existants.

Usage :
    python3 scripts/seed-services-en.py
    ADMIN_EMAIL=... ADMIN_PASSWORD=... python3 scripts/seed-services-en.py
"""
import json, os, urllib.request

BASE = os.environ.get("API_BASE", "http://localhost:8080/api/v1")
EMAIL = os.environ.get("ADMIN_EMAIL", "makenzyks6@gmail.com")
PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@123")


def req(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    if token:
        r.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(r) as resp:
            t = resp.read().decode()
            return resp.status, (json.loads(t) if t else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]


# Traductions EN, alignées sur l'ordre des tableaux FR seedés.
# Format : label / (title, description) / (title, description) / category
EN = {
 "developpement-web": {
  "stats": ["Sites delivered", "Uptime", "Load time", "Responsive"],
  "benefits": [("Lightning fast", "Optimized performance with Next.js and modern frameworks."), ("Scalable architecture", "Built to grow with your business."), ("Secure by design", "Enterprise-grade security standards."), ("User-centric", "Interfaces your users will love.")],
  "process": [("Discovery & scoping", "Requirements analysis and detailed roadmap."), ("Design & mockups", "Interactive prototypes to visualize the product."), ("Development", "Clean, maintainable, best-practice code."), ("Launch & support", "Smooth deployment and ongoing maintenance.")],
  "technologies": ["Frontend", "Framework", "Language", "Backend", "Database", "DevOps"]
 },
 "mobile-apps": {
  "stats": ["Apps published", "Average rating", "Downloads", "Platforms"],
  "benefits": [("Native performance", "Smooth 60fps animations and instant response."), ("Cross-platform", "One codebase for iOS and Android."), ("Offline mode", "Works without an internet connection."), ("Push notifications", "Engage your users at the right time.")],
  "process": [("Strategy & research", "Market analysis and persona definition."), ("UI/UX design", "Platform-specific mockups."), ("Native development", "React Native or Flutter implementation."), ("App store release", "Publishing and store optimization.")],
  "technologies": ["Framework", "Framework", "iOS", "Android", "Backend", "Tools"]
 },
 "ui-ux-design": {
  "stats": ["Designs created", "Client satisfaction", "Conversion", "Accessible"],
  "benefits": [("User-centered", "Research-driven design decisions."), ("Design systems", "Visual consistency across all your media."), ("Accessibility", "WCAG 2.1 AA compliance."), ("Conversion-focused", "Designs that drive results.")],
  "process": [("Research & discovery", "User interviews and competitive analysis."), ("Wireframes", "Low-fidelity layouts and user flows."), ("Visual design", "High-fidelity mockups and prototypes."), ("Testing & iteration", "User testing and continuous improvement.")],
  "technologies": ["Design", "Design", "Design", "Prototype", "Collaboration", "Testing"]
 },
 "cybersecurity": {
  "stats": ["Breaches", "Audits performed", "Monitoring", "Certified"],
  "benefits": [("Threat protection", "Advanced attack detection and prevention."), ("Compliance", "GDPR, ISO 27001 and SOC 2 ready."), ("Encryption", "End-to-end data encryption."), ("24/7 SOC", "Round-the-clock security operations center.")],
  "process": [("Security audit", "Comprehensive vulnerability assessment."), ("Risk analysis", "Threat identification and prioritization."), ("Implementation", "Deployment of security controls and tools."), ("Continuous monitoring", "Real-time threat detection.")],
  "technologies": ["Network", "Detection", "Monitoring", "Data", "Testing", "Architecture"]
 },
 "network-infrastructure": {
  "stats": ["Guaranteed SLA", "Networks deployed", "Latency", "Monitoring"],
  "benefits": [("High availability", "Redundant systems for zero downtime."), ("Scalable", "Grows with your needs."), ("Secure", "Multi-layer security architecture."), ("Monitored", "Real-time performance tracking.")],
  "process": [("Network assessment", "Audit of existing infrastructure."), ("Design & planning", "Topology and sizing."), ("Deployment", "Hardware and software installation."), ("Monitoring & support", "Proactive maintenance and optimization.")],
  "technologies": ["Hardware", "Virtualization", "Containers", "Orchestration", "Cloud", "IaC"]
 },
 "data-ai": {
  "stats": ["AI projects", "Accuracy", "Data processed", "ML models"],
  "benefits": [("Predictive analytics", "AI insights for better decisions."), ("Big Data", "Processing of massive datasets."), ("Data security", "Enterprise-grade protection."), ("Custom models", "Tailored machine learning solutions.")],
  "process": [("Data collection", "Aggregation and cleaning of sources."), ("Analysis & modeling", "Model building and training."), ("Production deployment", "Deployment of AI solutions."), ("Optimization", "Continuous model improvement.")],
  "technologies": ["Language", "ML", "ML", "Analysis", "Big Data", "Visualization"]
 },
}


def main():
    st, res = req("POST", "/auth/login", body={"email": EMAIL, "password": PASSWORD})
    if not isinstance(res, dict) or "accessToken" not in res:
        print("Échec login:", st, res)
        return
    token = res["accessToken"]

    st, items = req("GET", "/content/admin/section/services", token=token)
    if not isinstance(items, list):
        print("Lecture services KO:", st, items)
        return
    by_slug = {json.loads(b.get("valueFr") or "{}").get("slug"): b for b in items}

    for slug, en in EN.items():
        b = by_slug.get(slug)
        if not b:
            print("absent:", slug)
            continue
        fr = json.loads(b.get("valueFr") or "{}")
        env = json.loads(b.get("valueEn") or "{}")
        try:
            env["stats"] = [{"value": fr["stats"][i]["value"], "label": en["stats"][i]} for i in range(len(en["stats"]))]
            env["benefits"] = [{"icon": fr["benefits"][i]["icon"], "title": en["benefits"][i][0], "description": en["benefits"][i][1]} for i in range(len(en["benefits"]))]
            env["process"] = [{"title": en["process"][i][0], "description": en["process"][i][1]} for i in range(len(en["process"]))]
            env["technologies"] = [{"name": fr["technologies"][i]["name"], "category": en["technologies"][i]} for i in range(len(en["technologies"]))]
        except (KeyError, IndexError) as e:
            print(f"{slug}: tableaux FR incomplets, ignoré ({e})")
            continue
        body = {"section": "services", "contentKey": b["contentKey"],
                "valueFr": b.get("valueFr"), "valueEn": json.dumps(env, ensure_ascii=False),
                "contentType": b.get("contentType", "json"), "displayOrder": b.get("displayOrder", 0),
                "active": b.get("active", True)}
        s, _ = req("PUT", f"/content/upsert/services/{b['contentKey']}", token=token, body=body)
        print(f"{b['contentKey']} {slug} EN -> {s}")


if __name__ == "__main__":
    main()
