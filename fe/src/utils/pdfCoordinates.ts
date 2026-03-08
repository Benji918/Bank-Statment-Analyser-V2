/**
 * Maps character offsets from plain text extraction back to PDF canvas pixel coordinates.
 * Used to position redaction rectangles precisely over detected PII.
 */

export interface TextItem {
    str: string
    transform: number[]
    width: number
    height: number
}

export interface CharMapEntry {
    item: TextItem
    localOffset: number
}

/**
 * Build a char-offset → TextItem mapping from pdfjs TextContent items.
 * Returns the concatenated full text and the map.
 */
export function buildCharMap(textContent: { items: TextItem[] }): {
    fullText: string
    charMap: CharMapEntry[]
} {
    let fullText = ''
    const charMap: CharMapEntry[] = []

    for (const item of textContent.items) {
        const str = item.str
        for (let i = 0; i < str.length; i++) {
            charMap.push({ item, localOffset: i })
        }
        fullText += str + ' '
        charMap.push({ item, localOffset: str.length }) // space after item
    }

    return { fullText, charMap }
}

/**
 * Convert character-offset range to approximate bounding box in PDF coordinates.
 * Returns { x, y, width, height } in viewport coordinates.
 */
export function charOffsetToPdfCoords(
    start: number,
    end: number,
    charMap: CharMapEntry[],
    viewport: { width: number; height: number }
): { x: number; y: number; width: number; height: number } {
    const startEntry = charMap[Math.min(start, charMap.length - 1)]
    const endEntry = charMap[Math.min(end - 1, charMap.length - 1)]

    if (!startEntry || !endEntry) {
        return { x: 0, y: 0, width: 0, height: 0 }
    }

    const startItem = startEntry.item
    const endItem = endEntry.item

    // pdfjs transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
    const x = startItem.transform[4]
    const y = viewport.height - startItem.transform[5] - (startItem.height || 12)
    const width = endItem.transform[4] + endItem.width - x
    const height = startItem.height || 12

    return { x, y, width: Math.max(width, 10), height: Math.max(height, 10) }
}
