import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * Formats messages with markdown support:
 * - Code blocks (```language ... ```)
 * - Inline code (`...`)
 * - Bold (**...** or __...__) 
 * - Italic (*...* or _..._)
 * - Headers (#, ##, ###)
 * - Bullet lists (-, *, •)
 * - Numbered lists (1., 2., etc)
 * - Links [text](url)
 */
export const MessageFormatter = ({ content }: { content: string }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks first
  const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;
  const parts: Array<{
    type: 'code' | 'text';
    language?: string;
    content: string;
  }> = [];

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-3 text-sm">
      {parts.map((part, partIdx) => {
        if (part.type === 'code') {
          return (
            <div
              key={partIdx}
              className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700"
            >
              {/* Language badge */}
              <div className="absolute top-2 right-2 text-xs text-slate-400 font-mono">
                {part.language}
              </div>

              {/* Copy button */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 left-2 h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                onClick={() => copyCode(part.content, partIdx)}
              >
                {copiedIndex === partIdx ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              {/* Code content */}
              <pre className="p-4 pt-8 pr-16 overflow-x-auto text-xs text-slate-200 font-mono">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }

        // Text with markdown formatting
        return (
          <TextWithMarkdown key={partIdx} text={part.content} />
        );
      })}
    </div>
  );
};

/**
 * Parse and render text with markdown formatting
 */
const TextWithMarkdown = ({ text }: { text: string }) => {
  // Split by lines to handle lists and headers
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let currentListType: 'ul' | 'ol' | null = null;
  let currentListStart = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = currentListType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag
          key={`list-${currentListStart}`}
          className={`space-y-1 ${
            currentListType === 'ol'
              ? 'list-decimal list-inside'
              : 'list-disc list-inside'
          }`}
        >
          {currentList.map((item, idx) => (
            <li key={idx} className="text-sm">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ListTag>
      );
      currentList = [];
      currentListType = null;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Header
    if (trimmed.startsWith('#')) {
      flushList();
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.slice(level).trim();
      const HeadingLevel = Math.min(level, 6);
      const className = `font-bold ${
        HeadingLevel === 1
          ? 'text-lg'
          : HeadingLevel === 2
          ? 'text-base'
          : 'text-sm'
      } mt-2 mb-1`;
      
      // Dynamically create the heading element based on level
      const HeadingElement = (() => {
        switch (HeadingLevel) {
          case 1: return <h1 key={`heading-${idx}`} className={className}><InlineMarkdown text={text} /></h1>;
          case 2: return <h2 key={`heading-${idx}`} className={className}><InlineMarkdown text={text} /></h2>;
          case 3: return <h3 key={`heading-${idx}`} className={className}><InlineMarkdown text={text} /></h3>;
          case 4: return <h4 key={`heading-${idx}`} className={className}><InlineMarkdown text={text} /></h4>;
          case 5: return <h5 key={`heading-${idx}`} className={className}><InlineMarkdown text={text} /></h5>;
          default: return <h6 key={`heading-${idx}`} className={className}><InlineMarkdown text={text} /></h6>;
        }
      })();
      elements.push(HeadingElement);
    }
    // Bullet list
    else if (/^[\-\*•]\s/.test(trimmed)) {
      const itemText = trimmed.slice(2).trim();
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
        currentListStart = idx;
      }
      currentList.push(itemText);
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s/, '').trim();
      if (currentListType !== 'ol') {
        flushList();
        currentListType = 'ol';
        currentListStart = idx;
      }
      currentList.push(itemText);
    }
    // Normal paragraph
    else if (trimmed.length > 0) {
      flushList();
      elements.push(
        <p key={`p-${idx}`} className="text-sm leading-relaxed">
          <InlineMarkdown text={trimmed} />
        </p>
      );
    } else {
      flushList();
      // Empty line = space
      if (idx < lines.length - 1) {
        elements.push(<div key={`space-${idx}`} className="h-2" />);
      }
    }
  });

  flushList();

  return <div className="space-y-2">{elements}</div>;
};

/**
 * Parse inline markdown: bold, italic, inline code, links
 */
const InlineMarkdown = ({ text }: { text: string }) => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Pattern: **bold**, __bold__, *italic*, _italic_, `code`, [link](url)
  const pattern =
    /(\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*(?!\*)[^*]+\*(?!\*)|(?<!_)_(?!_)[^_]+_(?!_)|`[^`]+`|\[[^\]]+\]\([^\)]+\))/g;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];

    // Bold
    if (matched.startsWith('**') && matched.endsWith('**')) {
      parts.push(
        <strong key={`bold-${match.index}`}>
          {matched.slice(2, -2)}
        </strong>
      );
    } else if (matched.startsWith('__') && matched.endsWith('__')) {
      parts.push(
        <strong key={`bold-${match.index}`}>
          {matched.slice(2, -2)}
        </strong>
      );
    }
    // Italic
    else if (matched.startsWith('*') && matched.endsWith('*')) {
      parts.push(
        <em key={`italic-${match.index}`}>
          {matched.slice(1, -1)}
        </em>
      );
    } else if (matched.startsWith('_') && matched.endsWith('_')) {
      parts.push(
        <em key={`italic-${match.index}`}>
          {matched.slice(1, -1)}
        </em>
      );
    }
    // Inline code
    else if (matched.startsWith('`') && matched.endsWith('`')) {
      parts.push(
        <code
          key={`code-${match.index}`}
          className="bg-slate-900/50 px-1.5 py-0.5 rounded text-xs font-mono text-amber-400 border border-slate-700/50"
        >
          {matched.slice(1, -1)}
        </code>
      );
    }
    // Link
    else if (matched.startsWith('[') && matched.includes('](')) {
      const linkMatch = matched.match(/\[([^\]]+)\]\(([^\)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + matched.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};
