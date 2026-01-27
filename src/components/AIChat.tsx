import { useState, useEffect } from 'react';
import { aiAPI, transitsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuota } from '@/hooks/useQuota';
import CentralizedChat, { type ChatMessage } from './CentralizedChat';
import { Star, Moon, ArrowLeft } from 'lucide-react';
import {
  trackMessageSent,
  trackFocusModeUsed,
  trackChatStarted,
  trackTransitsViewed,
} from '@/lib/analytics';

interface AIChatProps {
  chartId?: string;
  onViewChart?: () => void;
  onSwitchChart?: (chartId: string) => void;
  mode?: 'analysis' | 'daily';
  onBack?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What does this chart say about career?',
  'Are there any strong yogas for wealth?',
  'What is the current Dasha indicating?',
  'Tell me about relationships in this chart.',
  'What are the strengths and weaknesses?',
];

const DAILY_SUGGESTED_QUESTIONS = [
  'How will today go for me?',
  'Any challenges I should be aware of today?',
  'Is this a good time for new beginnings?',
  "What is the Moon's influence today?",
  'Focus areas for today?',
];

const FOCUS_MODES = [
  { id: 'general', label: 'General', color: 'hover:bg-slate-500/20 border-slate-500/50' },
  { id: 'career', label: 'Career', color: 'hover:bg-blue-500/20 border-blue-500/50' },
  { id: 'wealth', label: 'Wealth', color: 'hover:bg-amber-500/20 border-amber-500/50' },
  { id: 'relationships', label: 'Relationships', color: 'hover:bg-pink-500/20 border-pink-500/50' },
  { id: 'health', label: 'Health', color: 'hover:bg-red-500/20 border-red-500/50' },
  { id: 'family', label: 'Family', color: 'hover:bg-indigo-500/20 border-indigo-500/50' },
  { id: 'children', label: 'Children', color: 'hover:bg-rose-500/20 border-rose-500/50' },
  { id: 'travel', label: 'Travel', color: 'hover:bg-cyan-500/20 border-cyan-500/50' },
  { id: 'remedies', label: 'Remedies', color: 'hover:bg-purple-500/20 border-purple-500/50' },
  { id: 'learning', label: 'Learn Your Chart', color: 'hover:bg-green-500/20 border-green-500/50' },
];

// Generate contextual suggestions based on response content and user intent
const generateContextualSuggestions = (content: string, focusMode?: string): string[] => {
  const suggestions: string[] = [];

  // Check content for key topics
  const hasCareertalk = /career|job|work|profession|promotion|employment/i.test(content);
  const hasRelationship = /relationship|marriage|love|partner|family|spouse/i.test(content);
  const hasWealth = /wealth|money|finance|income|business|profit/i.test(content);
  const hasHealth = /health|wellness|fitness|vitality|disease/i.test(content);
  const hasQuestion = /\?/.test(content);
  const hasDasha = /dasha|period|timing|upcoming|current/i.test(content);

  // Generate relevant follow-ups
  if (hasCareertalk) {
    suggestions.push('Tell me more about my career path');
    suggestions.push('What about financial potential?');
  }
  if (hasRelationship) {
    suggestions.push('When will I meet someone special?');
    suggestions.push('What about my family dynamics?');
  }
  if (hasWealth) {
    suggestions.push('What are the best timing periods?');
    suggestions.push('Any remedies I should know about?');
  }
  if (hasHealth) {
    suggestions.push('How can I improve my wellness?');
    suggestions.push('What about my energy levels?');
  }
  if (hasDasha && !hasCareertalk && !hasRelationship) {
    suggestions.push('What does this period mean for my career?');
    suggestions.push('How will this affect my relationships?');
  }

  // Default suggestions if nothing matched
  if (suggestions.length === 0) {
    suggestions.push('Tell me more about my chart');
    suggestions.push('What about my future timing?');
    suggestions.push('Suggest some remedies');
  }

  // Return top 3 suggestions
  return suggestions.slice(0, 3);
};

const processMessageContent = (
  content: string,
  focusMode?: string,
): { cleanContent: string; suggestions?: string[] } => {
  let cleanContent = content;
  let suggestions: string[] | undefined;

  // Remove <analysis> tags if present (including content)
  cleanContent = cleanContent.replace(/<analysis>[\s\S]*?<\/analysis>/gi, '').trim();

  // Remove <response> tags if present
  cleanContent = cleanContent.replace(/<\/?response>/gi, '').trim();

  // Look for JSON block with suggestions - Updated to be more flexible with whitespace
  const jsonMatch = cleanContent.match(/```json\s*(\{\s*"suggestions":\s*\[.*?\]\s*\})\s*```/s);

  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions;
        // Remove the JSON block from content
        cleanContent = cleanContent.replace(/```json[\s\S]*?```/g, '').trim();
      }
    } catch (e) {
      // Fall back to removing the JSON block anyway
      cleanContent = cleanContent.replace(/```json[\s\S]*?```/g, '').trim();
    }
  }

  // If no suggestions found, generate contextual ones
  if (!suggestions || suggestions.length === 0) {
    suggestions = generateContextualSuggestions(cleanContent, focusMode);
  }

  // Deduplicate suggestions (remove exact duplicates while preserving order)
  if (suggestions && suggestions.length > 0) {
    const seen = new Set<string>();
    suggestions = suggestions.filter((s) => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
  }

  return { cleanContent, suggestions };
};

const AIChat = ({ chartId, onViewChart, onSwitchChart, mode = 'analysis', onBack }: AIChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [focusMode, setFocusMode] = useState('general');
  const [transits, setTransits] = useState<any[]>([]);
  const [moonSign, setMoonSign] = useState<string>('');
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get quota hook for updating usage after chat
  const { refresh: fetchQuota } = useQuota();

  const activeFocusTags = FOCUS_MODES.filter((m) => m.id === focusMode);

  // Initialize session based on chart and mode
  useEffect(() => {
    let isMounted = true;

    // Clear state immediately when chart/mode changes
    setMessages([]);
    setTransits([]);
    setMoonSign('');
    setSessionId(undefined);
    setIsLoading(true);

    const initSession = async () => {
      if (chartId) {
        try {
          if (mode === 'daily') {
            // Daily Mode Initialization
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

            // Pass skipIntro=true to avoid auto-generating the forecast on load
            const res = await transitsAPI.chat(chartId, undefined, dateStr, tz, true);

            if (!isMounted) return;

            setMoonSign(res.data.moon_sign || '');

            // Track transits/daily chat viewed
            trackTransitsViewed();
            trackChatStarted('daily');

            if (res.data.session_id) {
              setSessionId(res.data.session_id);
            }

            if (
              res.data.history &&
              Array.isArray(res.data.history) &&
              res.data.history.length > 0
            ) {
              // Filter out system messages and map
              const validMessages = res.data.history
                .filter((m: any) => m.role !== 'system')
                .map((m: any) => {
                  // If backend provides structured data, use it
                  if (m.analysis !== undefined || m.suggestions !== undefined) {
                    const { cleanContent } = processMessageContent(m.content, focusMode);
                    return {
                      id: m.id,
                      role: m.role,
                      content: cleanContent,
                      suggestions: m.suggestions,
                      analysis: m.analysis,
                    };
                  }

                  const { cleanContent, suggestions } = processMessageContent(m.content, focusMode);
                  // Extract analysis if present
                  const analysisMatch = m.content.match(/<analysis>([\s\S]*?)<\/analysis>/i);
                  const analysis = analysisMatch ? analysisMatch[1].trim() : undefined;

                  return {
                    id: m.id,
                    role: m.role,
                    content: cleanContent,
                    suggestions,
                    analysis,
                  };
                });
              setMessages(validMessages);
            } else {
              if (res.data.response) {
                // Check if structured data is available
                if (res.data.analysis !== undefined || res.data.suggestions !== undefined) {
                  const { cleanContent } = processMessageContent(res.data.response, focusMode);
                  setMessages([
                    {
                      role: 'assistant',
                      content: cleanContent,
                      suggestions: res.data.suggestions,
                      analysis: res.data.analysis,
                    },
                  ]);
                } else {
                  const { cleanContent, suggestions } = processMessageContent(
                    res.data.response,
                    focusMode,
                  );
                  // Extract analysis if present
                  const analysisMatch = res.data.response.match(
                    /<analysis>([\s\S]*?)<\/analysis>/i,
                  );
                  const analysis = analysisMatch ? analysisMatch[1].trim() : undefined;

                  setMessages([
                    { role: 'assistant', content: cleanContent, suggestions, analysis },
                  ]);
                }
              }
            }
          } else {
            // Analysis Mode Initialization - Create a session first
            try {
              const sessionRes = await aiAPI.createSession(chartId);

              if (!isMounted) return;

              const newSessionId = sessionRes.data.session_id;
              if (newSessionId) {
                setSessionId(newSessionId);

                // Track chat session started
                trackChatStarted('analysis');

                // Load session history in background (don't wait for it)
                // This allows suggested questions to show immediately
                aiAPI.getSessionHistory(newSessionId, 0, 20)
                  .then((historyRes) => {
                    if (!isMounted) return;
                    if (historyRes.data.history && Array.isArray(historyRes.data.history)) {
                      const validMessages = historyRes.data.history
                        .filter((m: any) => m.role !== 'system')
                        .map((m: any) => {
                          // If backend provides structured data, use it
                          if (m.analysis !== undefined || m.suggestions !== undefined) {
                            const { cleanContent } = processMessageContent(m.content, focusMode);
                            return {
                              id: m.id,
                              role: m.role,
                              content: cleanContent,
                              suggestions: m.suggestions,
                              analysis: m.analysis,
                            };
                          }

                          const { cleanContent, suggestions } = processMessageContent(
                            m.content,
                            focusMode,
                          );
                          // Extract analysis if present
                          const analysisMatch = m.content.match(/<analysis>([\s\S]*?)<\/analysis>/i);
                          const analysis = analysisMatch ? analysisMatch[1].trim() : undefined;

                          return {
                            id: m.id,
                            role: m.role,
                            content: cleanContent,
                            suggestions,
                            analysis,
                          };
                        });
                      setMessages(validMessages);
                      setHasMore(validMessages.length >= 20);
                    }
                  })
                  .catch((historyError) => {
                    // New session, no history yet - this is fine
                    console.debug('No history found for new session');
                  });
              }
            } catch (error) {
              console.error('Failed to create analysis session:', error);
              toast.error('Failed to initialize analysis session');
            }
          }
        } catch (error) {
          console.error(error);
          toast.error('The stars are silent right now.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(false);
    };

    initSession();

    return () => {
      isMounted = false;
    };
  }, [chartId, mode]);

  const loadMoreMessages = async () => {
    if (!chartId || !sessionId || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const offset = messages.length;
      const res = await aiAPI.getChatHistory(sessionId, offset, 20);

      if (res.data.history && Array.isArray(res.data.history)) {
        const newMessages = res.data.history
          .filter((m: any) => m.role !== 'system')
          .map((m: any) => {
            if (m.analysis !== undefined || m.suggestions !== undefined) {
              const { cleanContent } = processMessageContent(m.content, focusMode);
              return {
                id: m.id,
                role: m.role,
                content: cleanContent,
                suggestions: m.suggestions,
                analysis: m.analysis,
              };
            }

            const { cleanContent, suggestions } = processMessageContent(m.content, focusMode);
            const analysisMatch = m.content.match(/<analysis>([\s\S]*?)<\/analysis>/i);
            const analysis = analysisMatch ? analysisMatch[1].trim() : undefined;

            return {
              id: m.id,
              role: m.role,
              content: cleanContent,
              suggestions,
              analysis,
            };
          });

        setMessages((prev) => [...newMessages, ...prev]);
        setHasMore(newMessages.length >= 20);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
      toast.error('Failed to load message history');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Listen for usage updates from chat responses
  useEffect(() => {
    const handleUsageUpdate = (event: any) => {
      const usageData = event.detail;

      // Refetch quota immediately to show updated counts
      fetchQuota(false); // Don't show loading state, just update silently

      // Store in localStorage for quick access
      localStorage.setItem('chatUsage', JSON.stringify(usageData));
    };

    window.addEventListener('chatUsageUpdated', handleUsageUpdate);

    return () => {
      window.removeEventListener('chatUsageUpdated', handleUsageUpdate);
    };
  }, [fetchQuota]);

  const sendMessage = async (messageText?: string) => {
    if (!chartId || (!messageText && !input.trim())) return;

    const userMessage = messageText || input;
    if (!userMessage.trim()) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let response;

      if (mode === 'daily') {
        // Daily chat message - may be new or existing session
        response = await transitsAPI.chat(
          chartId,
          userMessage,
          undefined,
          undefined,
          false,
          sessionId,
        );
      } else {
        // Analysis mode chat - pass correct parameters: message, sessionId, model, systemPrompt, promptId, includeExamples, focus
        response = await aiAPI.chat(
          userMessage,
          sessionId,
          undefined,
          undefined,
          undefined,
          false,
          focusMode,
        );
      }

      if (!response.data.response) {
        console.error('[sendMessage] No response field in API response:', response.data);
        toast.error('No response from server');
        setIsLoading(false);
        return;
      }

      // Update session ID if provided (for new sessions)
      if (response.data.session_id && !sessionId) {
        setSessionId(response.data.session_id);
      }

      // Handle usage data update
      if (response.data.usage) {
        // Store usage in localStorage for quick access
        localStorage.setItem('chatUsage', JSON.stringify(response.data.usage));

        // Dispatch custom event so other components can listen for usage updates
        window.dispatchEvent(new CustomEvent('chatUsageUpdated', { detail: response.data.usage }));

        // Refresh quota to update message count in QuotaWidget
        fetchQuota();

        // Track message sent with focus mode
        trackMessageSent(mode === 'daily' ? 'daily' : focusMode);
      }

      // Process response - add only the assistant message since we already added user message locally
      if (response.data.analysis !== undefined || response.data.suggestions !== undefined) {
        const { cleanContent } = processMessageContent(response.data.response, focusMode);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: cleanContent,
            suggestions: response.data.suggestions,
            analysis: response.data.analysis,
            id: response.data.message_id,
          },
        ]);
      } else {
        const { cleanContent, suggestions } = processMessageContent(
          response.data.response,
          focusMode,
        );
        const analysisMatch = response.data.response.match(/<analysis>([\s\S]*?)<\/analysis>/i);
        const analysis = analysisMatch ? analysisMatch[1].trim() : undefined;

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: cleanContent,
            suggestions,
            analysis,
            id: response.data.message_id,
          },
        ]);
      }
    } catch (error: any) {
      console.error('[sendMessage] Error:', error);
      if (error.response?.status === 429) {
        toast.error("You're chatting too fast! Please wait a moment.");
      } else {
        toast.error(error.message || 'Failed to get AI response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (sessionId) {
      try {
        await aiAPI.updateSession(sessionId, { is_deleted: true });
        setMessages([]);
        toast.success('Chat history cleared');
      } catch (e) {
        toast.error('Failed to clear history');
      }
    }
  };

  const headerContent =
    mode === 'daily' ? (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Moon in <span className="font-semibold text-primary">{moonSign}</span>
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
          {new Date().toLocaleDateString()}
        </span>
      </div>
    ) : null;

  const focusControls =
    mode === 'analysis' ? (
      <div className="flex flex-wrap gap-2 pt-2">
        {FOCUS_MODES.map((m) => (
          <Button
            key={m.id}
            variant="outline"
            size="sm"
            className={`text-xs h-7 border transition-all duration-200 ${m.color} ${focusMode === m.id
                ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            onClick={() => {
              setFocusMode(m.id);
              // Track focus mode change
              trackFocusModeUsed(m.id);
            }}
          >
            {m.label}
          </Button>
        ))}
      </div>
    ) : null;

  return (
    <Card className="flex flex-col h-full bg-card/30 backdrop-blur-sm border-border/40">
      <CardHeader className="py-4 border-b border-border/40 space-y-3 shrink-0">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8 hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5 py-0.5" />
            </Button>
          )}
          <CardTitle className="text-lg flex items-center gap-2">
            {mode === 'daily' ? (
              <>
                <Moon className="h-5 w-5 text-primary" /> Daily Cosmic Chat
              </>
            ) : (
              <>
                <Star className="h-5 w-5 text-primary" /> Chart Analysis
              </>
            )}
          </CardTitle>
        </div>

        {headerContent && (
          <div className="space-y-2">
            {headerContent}
            {transits.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {transits.map((t, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 bg-muted/50 border border-border/50 rounded px-3 py-2 text-xs min-w-[120px]"
                  >
                    <div className="font-semibold text-foreground">{t.planet}</div>
                    <div className="text-muted-foreground">{t.transit_sign}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-1">
                      {t.house_from_moon}th House
                    </div>
                  </div>
                ))}
              </div>
            )}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] text-muted-foreground hover:text-destructive"
                onClick={handleClearHistory}
              >
                Clear History
              </Button>
            )}
          </div>
        )}

        {focusControls && (
          <div className="border-t border-border/40 pt-3 mt-2">
            {focusControls}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
        <CentralizedChat
          messages={messages}
          setMessages={setMessages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
          isLoadingMore={isLoadingMore}
          emptyStateTitle={
            chartId
              ? mode === 'daily'
                ? 'Ask about your daily cosmic weather!'
                : 'Ask me anything about this chart!'
              : 'Select a chart from My Charts to start chatting.'
          }
          suggestedQuestions={mode === 'daily' ? DAILY_SUGGESTED_QUESTIONS : SUGGESTED_QUESTIONS}
          scrollHeight="h-[500px]"
        />
      </CardContent>
    </Card>
  );
};

export default AIChat;
