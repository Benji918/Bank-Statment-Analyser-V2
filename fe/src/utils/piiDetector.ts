/**
 * Browser-based PII Detection Engine for Bank Statements.
 *
 * This module replaces the non-functional `@openredaction/openredaction` package
 * with a comprehensive, pure-TypeScript regex + heuristic detection engine.
 *
 * It targets PII commonly found in bank statements:
 *  - Full names (contextual line-start detection)
 *  - Email addresses
 *  - Phone numbers (international + local formats)
 *  - Account numbers / IBANs / Sort codes
 *  - Physical addresses (street, city patterns)
 *  - Dates of birth
 *  - National ID / SSN patterns
 *
 * Designed for high recall (catch as much as possible) since over-redaction
 * is safer than under-redaction for a privacy-focused application.
 */

export interface PiiEntity {
    entity_type: string
    start: number
    end: number
    score: number
    text: string
}

interface PiiRule {
    type: string
    pattern: RegExp
    score: number
}

// --- Core PII Regex Rules ---

const PII_RULES: PiiRule[] = [
    // Email addresses
    {
        type: 'EMAIL_ADDRESS',
        pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
        score: 0.95,
    },
    // Phone numbers — international and local
    {
        type: 'PHONE_NUMBER',
        pattern: /(?:\+?\d{1,4}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/g,
        score: 0.85,
    },
    // IBAN (International Bank Account Number)
    {
        type: 'IBAN_CODE',
        pattern: /\b[A-Z]{2}\d{2}[\s]?[\dA-Z]{4}[\s]?[\dA-Z]{4}[\s]?[\dA-Z]{4}(?:[\s]?[\dA-Z]{1,4}){0,5}\b/g,
        score: 0.95,
    },
    // Bank account numbers (8-20 digit sequences, common in statements)
    {
        type: 'ACCOUNT_NUMBER',
        pattern: /\b\d{8,20}\b/g,
        score: 0.70,
    },
    // Sort codes (UK style: XX-XX-XX)
    {
        type: 'SORT_CODE',
        pattern: /\b\d{2}-\d{2}-\d{2}\b/g,
        score: 0.90,
    },
    // Credit / Debit Card numbers (16 digits, grouped)
    {
        type: 'CREDIT_CARD',
        pattern: /\b(?:\d{4}[\s\-]?){3}\d{4}\b/g,
        score: 0.90,
    },
    // National ID / SSN patterns (US: XXX-XX-XXXX, Nigeria NIN: 11 digits)
    {
        type: 'NATIONAL_ID',
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        score: 0.90,
    },
    // Date of birth patterns (DD/MM/YYYY, MM-DD-YYYY, etc.)
    {
        type: 'DATE_OF_BIRTH',
        pattern: /\b(?:0?[1-9]|[12]\d|3[01])[\/\-.](?:0?[1-9]|1[0-2])[\/\-.]\d{4}\b/g,
        score: 0.60,
    },
    // BVN (Bank Verification Number — Nigeria, 11 digits)
    {
        type: 'BVN',
        pattern: /\bBVN[\s:]*\d{11}\b/gi,
        score: 0.95,
    },
    // Physical addresses — street numbers or common prefixes followed by words (heuristic)
    {
        type: 'ADDRESS',
        pattern: /\b(?:Plot|Flat|Block|Suite|No\.?)?\s?\d{1,5}\s+(?:[A-Z][a-z0-9/,-]+\s?){1,6}(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Close|Crescent|Terrace|Court|Place|Square|Building|Estate|Layout|Quarters|Village|Area|LGA)\b/gi,
        score: 0.80,
    },
]

// --- Financial Context Guards ---

const FINANCIAL_KEYWORDS = [
    'balance', 'amount', 'credit', 'debit', 'total', 'vat', 'tax', 'fee', 'charge', 'interest', 'payment',
    'transfer', 'pos', 'cash', 'merchant', 'airtime', 'commission', 'withdrawal', 'deposit'
]

// --- Contextual Name Detection ---

/**
 * Common "label" keywords that precede names in bank statements.
 * We look for these followed by a capitalized multi-word sequence.
 */
const NAME_LABEL_PATTERNS: RegExp[] = [
    /(?:Account\s*(?:Name|Holder|Owner)|Customer\s*(?:Name)?|Name|Beneficiary|Recipient|Payee|From|To|Mr\.?|Mrs\.?|Ms\.?|Dr\.?)[\s:]+([A-Z][a-zA-Z''-]+(?:\s+[A-Z][a-zA-Z''-]+){1,4})/gi,
]

/**
 * Detect PII entities in a given text string.
 * Returns an array of detected entities with their positions and types.
 */
export function detectPii(text: string): PiiEntity[] {
    const entities: PiiEntity[] = []
    const coveredRanges: Array<[number, number]> = []

    function isOverlapping(start: number, end: number): boolean {
        return coveredRanges.some(
            ([s, e]) => (start >= s && start < e) || (end > s && end <= e) || (start <= s && end >= e)
        )
    }

    function addEntity(entity: PiiEntity) {
        if (!isOverlapping(entity.start, entity.end)) {
            entities.push(entity)
            coveredRanges.push([entity.start, entity.end])
        }
    }

    // --- 1. Contextual Name Detection (higher priority) ---
    for (const pattern of NAME_LABEL_PATTERNS) {
        pattern.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = pattern.exec(text)) !== null) {
            const fullMatch = match[0]
            const nameGroup = match[1]
            if (nameGroup && nameGroup.trim().length > 2) {
                const nameStart = match.index + fullMatch.indexOf(nameGroup)
                addEntity({
                    entity_type: 'PERSON_NAME',
                    start: nameStart,
                    end: nameStart + nameGroup.length,
                    score: 0.85,
                    text: nameGroup.trim(),
                })
            }
        }
    }

    // --- 2. Regex-based PII rules ---
    for (const rule of PII_RULES) {
        rule.pattern.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = rule.pattern.exec(text)) !== null) {
            const matchedText = match[0].trim()

            // Skip very short matches (likely false positives)
            if (matchedText.length < 3) continue

            // For ACCOUNT_NUMBER, skip if it looks like a transaction amount or date
            if (rule.type === 'ACCOUNT_NUMBER') {
                // Skip if preceded by currency symbols or looks like money
                const preceding = text.substring(Math.max(0, match.index - 5), match.index)
                if (/[₦$€£#]/.test(preceding) || /[\.,]\d{2}$/.test(matchedText)) continue
                
                // Skip if it is surrounded by financial keywords (likely a sum or reference)
                const windowStart = Math.max(0, match.index - 20)
                const windowEnd = Math.min(text.length, match.index + matchedText.length + 20)
                const windowText = text.substring(windowStart, windowEnd).toLowerCase()
                
                if (FINANCIAL_KEYWORDS.some(k => windowText.includes(k))) {
                    // If it has decimals or is very short, it's likely an amount, not an account number
                    if (matchedText.includes('.') || matchedText.includes(',') || matchedText.length < 8) continue
                }

                // Skip short digit sequences in context of dates
                if (matchedText.length < 10) continue
            }

            // For ADDRESS, skip if it matches common transaction types (e.g. "Direct Debit")
            if (rule.type === 'ADDRESS') {
                 if (/Direct Debit|Standing Order|ATM Withdrawal/i.test(matchedText)) continue
            }

            addEntity({
                entity_type: rule.type,
                start: match.index,
                end: match.index + matchedText.length,
                score: rule.score,
                text: matchedText,
            })
        }
    }

    // Sort by position
    entities.sort((a, b) => a.start - b.start)

    return entities
}
