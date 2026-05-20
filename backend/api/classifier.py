INCIDENT_PATTERNS = {
    'ransomware': ['ransomware','encrypted files','ransom','bitcoin payment','locked files','decrypt','crypto locker','wannacry','lockbit','.locked','.encrypted'],
    'phishing': ['phishing','suspicious email','credential harvesting','fake login','spear phishing','whaling','email fraud','malicious link','spoofed email','fake page'],
    'ddos': ['ddos','denial of service','traffic flood','server overload','bandwidth exhaustion','service unavailable','botnet','80gbps','traffic spike'],
    'data_breach': ['data breach','data leak','exfiltration','stolen data','pii exposed','database dump','credentials leaked','sensitive data','s3 bucket','misconfigured'],
    'insider_threat': ['insider','malicious employee','privilege abuse','unauthorized download','data theft','rogue admin','disgruntled','terminated employee'],
    'malware': ['malware','trojan','worm','spyware','rootkit','keylogger','backdoor','virus','infected','c2 server','command and control','rat'],
    'zero_day': ['zero day','0day','unknown vulnerability','unpatched exploit','novel attack','undisclosed vulnerability'],
    'social_engineering': ['social engineering','vishing','pretexting','baiting','impersonation','phone scam','identity fraud'],
}

SEVERITY_SIGNALS = {
    'critical': ['production down','all systems','complete outage','payment systems','hospital','critical infrastructure','nation state','entire network','all servers'],
    'high':     ['multiple systems','customer data','financial data','spreading','executive','admin credentials','database','several servers'],
    'medium':   ['single system','isolated','contained','one department','endpoint','few machines'],
    'low':      ['suspected','potential','minor','test environment','sandbox'],
}

ORG_SIZE_PATTERNS = {
    'enterprise': ['enterprise','large org','fortune','multinational','thousands of employees'],
    'mid':        ['mid-size','medium','hundreds of employees','regional','400 employees','200 employees'],
    'small':      ['small business','startup','smb','few employees','small team','60 people'],
}

def classify_incident(text: str) -> dict:
    text_lower = text.lower()
    scores = {k: 0 for k in INCIDENT_PATTERNS}
    for incident_type, keywords in INCIDENT_PATTERNS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[incident_type] += 1
    incident_type = max(scores, key=scores.get)
    if scores[incident_type] == 0:
        incident_type = 'general'
    severity = 'medium'
    for level, signals in SEVERITY_SIGNALS.items():
        if any(s in text_lower for s in signals):
            severity = level
            break
    org_size = 'mid'
    for size, patterns in ORG_SIZE_PATTERNS.items():
        if any(p in text_only for p in patterns):
            org_size = size
            break
    confidence = min(100, scores.get(incident_type, 0) * 20 + 40)
    return {
        'incident_type': incident_type,
        'severity':      severity,
        'org_size':      org_size,
        'entities':      {'organizations': [], 'locations': [], 'systems': []},
        'confidence':    confidence,
    }
