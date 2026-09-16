export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type Finding = { title: string; severity: 'HIGH' | 'MEDIUM'; location: string; preview: string };

const secretRules: Array<{ title: string; expression: RegExp }> = [
  { title: 'GitHub token detected', expression: /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g },
  { title: 'OpenAI API key detected', expression: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { title: 'AWS access key detected', expression: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { title: 'Private key detected', expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { title: 'Credential assignment detected', expression: /(?:password|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*["'][^"'\s]{8,}["']/gi },
];

function redact(value: string): string {
  const compact = value.replace(/\s+/g, ' ');
  return compact.length <= 12 ? '[redacted]' : `${compact.slice(0, 4)}…${compact.slice(-4)}`;
}
function fileAt(lines: string[], index: number): string {
  for (let position = index; position >= 0; position -= 1) if (lines[position].startsWith('+++ b/')) return lines[position].slice(6);
  return 'unknown file';
}
export function scanAddedLines(diff: string): Finding[] {
  const findings: Finding[] = [];
  const lines = diff.split('\n');
  lines.forEach((line, index) => {
    if (!line.startsWith('+') || line.startsWith('+++')) return;
    for (const rule of secretRules) {
      rule.expression.lastIndex = 0;
      const match = rule.expression.exec(line);
      if (!match) continue;
      findings.push({ title: rule.title, severity: 'HIGH', location: fileAt(lines, index), preview: redact(match[0]) });
      break;
    }
  });
  return findings.slice(0, 20);
}
export function riskFromFindings(findings: Finding[]): RiskLevel { return findings.some((finding) => finding.severity === 'HIGH') ? 'HIGH' : 'LOW'; }
