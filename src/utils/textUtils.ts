/**
 * textUtils.ts - Shared text processing and formatting utilities
 */

/**
 * Cleans chat content from AI responses.
 * Handles:
 * - Removal of XML tags (<response>, <analysis>)
 * - Removal of JSON blocks
 * - Removal of artifacts
 * - Normalization of newlines
 * - Unwrapping of hard-wrapped text while preserving paragraphs and lists
 */
export const cleanChatContent = (content: string): string => {
    if (!content) return '';

    let cleaned = content;

    // 1. Remove XML tags and generic cleanup
    cleaned = cleaned.replace(/<response>([\s\S]*?)<\/response>/gi, '$1');
    cleaned = cleaned.replace(/<analysis>[\s\S]*?<\/analysis>/gi, '');
    cleaned = cleaned.replace(/<\/?response>/gi, '');
    cleaned = cleaned.replace(/<\/?suggestions>/gi, '');

    // 2. Remove JSON blocks
    cleaned = cleaned.replace(/```json[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    // Also catch unclosed code blocks if at the end
    cleaned = cleaned.replace(/```json[\s\S]*$/g, '');

    // 3. Remove artifacts like python dict entries, token counts
    cleaned = cleaned.replace(/,\s*\{\s*['\"]?prompt_tokens['\"]?[\s\S]*?\}/g, '');
    cleaned = cleaned.replace(/\{\s*['\"]?prompt_tokens['\"]?[\s\S]*?\}/g, '');

    // 4. Decode escaped characters
    cleaned = cleaned.replace(/\\'/g, "'");
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\n/g, '\n'); // Convert literal \n to real newline

    // 5. UNWRAP LOGIC: Fix hard wrapping (newlines in sentences)
    // Normalize line endings
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');

    // Protect double newlines (paragraphs)
    // We use a very specific token
    cleaned = cleaned.replace(/\n\s*\n/g, '___PARAGRAPH_BREAK___');

    // Protect list items (newlines before bullet points or numbers)
    // Matches newline followed by optional whitespace and then -, *, •, or 1.
    cleaned = cleaned.replace(/\n(?=\s*[\-\*•]|\s*\d+\.)/g, '___LIST_ITEM_BREAK___');

    // Protect Headers (lines starting with #)
    cleaned = cleaned.replace(/\n(?=\s*#)/g, '___HEADER_BREAK___');

    // Replace single newlines with space to unwrap text
    cleaned = cleaned.replace(/\n/g, ' ');

    // Collapse multiple spaces into one
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    // Restore protected breaks
    cleaned = cleaned.replace(/___PARAGRAPH_BREAK___/g, '\n\n');
    cleaned = cleaned.replace(/___LIST_ITEM_BREAK___/g, '\n');
    cleaned = cleaned.replace(/___HEADER_BREAK___/g, '\n');

    // 6. Generic Trim
    cleaned = cleaned.trim();

    // Fallback check
    if (cleaned.length < 5 && content.length > 50) {
        // If we stripped everything but original was long, fallback to a simpler clean
        return content
            .replace(/<[^>]*>/g, ' ')
            .replace(/\\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    return cleaned || '...';
};

/**
 * processMessageContent - Wrapper for older usage compatibility, 
 * extracts suggestions if present in JSON.
 */
export const processMessageContent = (content: string): { cleanContent: string; suggestions?: string[] } => {
    let suggestions: string[] | undefined;

    // Extract JSON suggestions if present
    const jsonMatch = content.match(/```json\s*(\{\s*"suggestions":\s*\[.*?\]\s*\})\s*```/s);
    if (jsonMatch?.[1]) {
        try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (Array.isArray(parsed.suggestions)) {
                suggestions = parsed.suggestions;
            }
        } catch {
            // Ignore
        }
    }

    const cleanContent = cleanChatContent(content);

    return { cleanContent, suggestions };
};
