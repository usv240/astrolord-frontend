import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { cleanChatContent } from '@/utils/textUtils';
import { aiAPI, transitsAPI, chartAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuota } from '@/hooks/useQuota';
import { useRateLimit, handleRateLimitError } from '@/hooks/useRateLimit';
import CentralizedChat, { type ChatMessage } from './CentralizedChat';
import { Star, Moon, ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import {
  trackMessageSent,
  trackFocusModeUsed,
  trackChatStarted,
  trackTransitsViewed,
} from '@/lib/analytics';
import { createLogger } from '@/utils/logger';

const log = createLogger('AIChat');

interface AIChatProps {
  chartId?: string;
  onViewChart?: () => void;
  onSwitchChart?: (chartId: string) => void;
  mode?: 'analysis' | 'daily';
  onBack?: () => void;
}

// Move constants OUTSIDE component to prevent recreation on every render
const SUGGESTED_QUESTIONS = Object.freeze([
  'What does this chart say about career?',
  'Are there any strong yogas for wealth?',
  'What is the current Dasha indicating?',
  'Tell me about relationships in this chart.',
  'What are the strengths and weaknesses?',
] as const);

const DAILY_SUGGESTED_QUESTIONS = Object.freeze([
  'How will today go for me?',
  'Any challenges I should be aware of today?',
  'Is this a good time for new beginnings?',
  "What is the Moon's influence today?",
  'Focus areas for today?',
] as const);

const FOCUS_MODES = Object.freeze([
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
] as const);

// Pre-compiled regex patterns for better performance
const PATTERNS = {
  analysis: /<analysis>[\s\S]*?<\/analysis>/gi,
  response: /<\/?response>/gi,
  jsonSuggestions: /```json\s*(\{\s*"suggestions":\s*\[.*?\]\s*\})\s*```/s,
  jsonBlock: /```json[\s\S]*?```/g,
  analysisCapture: /<analysis>([\s\S]*?)<\/analysis>/i,
  career: /career|job|work|profession|promotion|employment/i,
  relationship: /relationship|marriage|love|partner|family|spouse/i,
  wealth: /wealth|money|finance|income|business|profit/i,
  health: /health|wellness|fitness|vitality|disease/i,
  dasha: /dasha|period|timing|upcoming|current/i,
} as const;

// Generate contextual suggestions - moved outside component
const generateContextualSuggestions = (content: string): string[] => {
  const suggestions: string[] = [];

  const hasCareertalk = PATTERNS.career.test(content);
  const hasRelationship = PATTERNS.relationship.test(content);
  const hasWealth = PATTERNS.wealth.test(content);
  const hasHealth = PATTERNS.health.test(content);
  const hasDasha = PATTERNS.dasha.test(content);

  if (hasCareertalk) {
    suggestions.push('Tell me more about my career path', 'What about financial potential?');
  }
  if (hasRelationship) {
    suggestions.push('When will I meet someone special?', 'What about my family dynamics?');
  }
  if (hasWealth) {
    suggestions.push('What are the best timing periods?', 'Any remedies I should know about?');
  }
  if (hasHealth) {
    suggestions.push('How can I improve my wellness?', 'What about my energy levels?');
  }
  if (hasDasha && !hasCareertalk && !hasRelationship) {
    suggestions.push('What does this period mean for my career?', 'How will this affect my relationships?');
  }

  if (suggestions.length === 0) {
    return ['Tell me more about my chart', 'What about my future timing?', 'Suggest some remedies'];
  }

  return suggestions.slice(0, 3);
};

// Process message content - moved outside component
// Process message content - using shared cleaning logic
const processMessageContent = (content: string): { cleanContent: string; suggestions?: string[] } => {
  // Use shared robust cleaning first
  // Note: cleanChatContent removes JSON blocks, but we need to extract suggestions first.

  let suggestions: string[] | undefined;
  // Try to find suggestions in original content before cleaning
  const jsonMatch = content.match(PATTERNS.jsonSuggestions);

  if (jsonMatch?.[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Now clean the content
  const cleanContent = cleanChatContent(content);

  if (!suggestions?.length) {
    suggestions = generateContextualSuggestions(cleanContent);
  }

  // Deduplicate
  suggestions = [...new Set(suggestions)];

  return { cleanContent, suggestions };
};

// Memoized Transit Card component
const TransitCard = memo(({ transit }: { transit: { planet: string; transit_sign: string; house_from_moon: number } }) => (
  <div className="flex-shrink-0 bg-muted/50 border border-border/50 rounded px-3 py-2 text-xs min-w-[120px]">
    <div className="font-semibold text-foreground">{transit.planet}</div>
    <div className="text-muted-foreground">{transit.transit_sign}</div>
    <div className="text-[10px] text-muted-foreground/70 mt-1">{transit.house_from_moon}th House</div>
  </div>
));
TransitCard.displayName = 'TransitCard';

// Memoized Focus Mode Button
const FocusModeButton = memo(({
  focusModeItem,
  isActive,
  onClick
}: {
  focusModeItem: typeof FOCUS_MODES[number];
  isActive: boolean;
  onClick: () => void;
}) => (
  <Button
    variant="outline"
    size="sm"
    className={`text-xs h-7 border transition-all duration-200 ${focusModeItem.color} ${isActive
      ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    onClick={onClick}
  >
    {focusModeItem.label}
  </Button>
));
FocusModeButton.displayName = 'FocusModeButton';

const AIChat = memo(({ chartId, onViewChart, onSwitchChart, mode = 'analysis', onBack }: AIChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [focusMode, setFocusMode] = useState('general');
  const [transits, setTransits] = useState<any[]>([]);
  const [moonSign, setMoonSign] = useState<string>('');
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chartDetails, setChartDetails] = useState<{
    name: string;
    dob: string;
    time: string;
    city: string;
  } | null>(null);

  // Get quota hook for updating usage after chat
  const { refresh: fetchQuota } = useQuota();

  // Rate limiting with countdown for better UX
  const { isRateLimited, countdownDisplay, trigger: triggerRateLimit } = useRateLimit('chat', 60000);

  // Fetch chart details when chartId changes
  useEffect(() => {
    const fetchChartDetails = async () => {
      if (!chartId) return;
      try {
        const response = await chartAPI.getMyChart(chartId);
        if (response.data) {
          const chartData = response.data.chart || response.data;
          // Handle both flat structure (list) and nested structure (get)
          const name = chartData.name || chartData.request_subject?.name || 'Unknown';
          const dob = chartData.dob || chartData.request_subject?.dob || '';
          const time = chartData.time || chartData.request_subject?.time || '';

          // Location handling
          let city = chartData.location?.city || chartData.city || '';
          if (!city && chartData.request_subject?.location) {
            city = chartData.request_subject.location.city || '';
          }

          setChartDetails({
            name,
            dob,
            time,
            city
          });
        }
      } catch (error) {
        // Silent error for UI enhancement
        console.error('Failed to fetch chart details', error);
      }
    };

    fetchChartDetails();
  }, [chartId]);

  // Memoize suggested questions based on mode
  const suggestedQuestions = useMemo(
    () => mode === 'daily' ? [...DAILY_SUGGESTED_QUESTIONS] : [...SUGGESTED_QUESTIONS],
    [mode]
  );

  // Memoize date string for header
  const dateStr = useMemo(() => new Date().toLocaleDateString(), []);

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
              log.debug('Creating session for chartId', { chartId });
              const sessionRes = await aiAPI.createSession(chartId);
              log.debug('Session creation response', { data: sessionRes.data });

              if (!isMounted) return;

              const newSessionId = sessionRes.data.session_id;
              log.debug('New session ID created', { newSessionId });
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
                    log.debug('No history found for new session');
                  });
              }
            } catch (error) {
              log.error('Failed to create analysis session', { error: String(error) });
              toast.error('Failed to initialize analysis session');
            }
          }
        } catch (error) {
          log.error('Initialization error', { error: String(error) });
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

  // Memoized loadMoreMessages with useCallback
  const loadMoreMessages = useCallback(async () => {
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
              const { cleanContent } = processMessageContent(m.content);
              return {
                id: m.id,
                role: m.role,
                content: cleanContent,
                suggestions: m.suggestions,
                analysis: m.analysis,
              };
            }

            const { cleanContent, suggestions } = processMessageContent(m.content);
            const analysisMatch = m.content.match(PATTERNS.analysisCapture);
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
      log.error('Failed to load more messages', { error: String(error) });
      toast.error('Failed to load message history');
    } finally {
      setIsLoadingMore(false);
    }
  }, [chartId, sessionId, isLoadingMore, messages.length]);

  // Listen for usage updates from chat responses
  useEffect(() => {
    const handleUsageUpdate = () => {
      fetchQuota(false);
    };

    window.addEventListener('chatUsageUpdated', handleUsageUpdate);
    return () => window.removeEventListener('chatUsageUpdated', handleUsageUpdate);
  }, [fetchQuota]);

  // Memoized sendMessage with useCallback
  const sendMessage = useCallback(async (messageText?: string) => {
    log.debug('sendMessage called', { chartId, sessionId, mode, messageText: messageText?.substring(0, 50) });

    if (!chartId || (!messageText && !input.trim())) return;

    // For analysis mode, ensure session exists
    if (mode !== 'daily' && !sessionId) {
      log.error('No session ID available for analysis mode', { mode, sessionId, chartId });
      toast.error('Session not ready. Please wait a moment and try again.');
      return;
    }

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
        log.error('No response field in API response', { data: response.data });
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
      log.error('sendMessage error', { error: error.message, status: error.response?.status });

      // Handle rate limiting with countdown
      if (handleRateLimitError(error, triggerRateLimit)) {
        toast.error("You're chatting too fast! Please wait before sending another message.");
      } else {
        toast.error(error.message || 'Failed to get AI response');
      }
    } finally {
      setIsLoading(false);
    }
  }, [chartId, input, mode, sessionId, focusMode, fetchQuota, triggerRateLimit]);

  const handleClearHistory = useCallback(async () => {
    if (sessionId) {
      try {
        await aiAPI.updateSession(sessionId, { is_deleted: true });
        setMessages([]);
        toast.success('Chat history cleared');
      } catch (e) {
        toast.error('Failed to clear history');
      }
    }
  }, [sessionId]);

  const handleFocusModeChange = useCallback((modeId: string) => {
    setFocusMode(modeId);
    trackFocusModeUsed(modeId);
  }, []);

  const headerContent = useMemo(() =>
    mode === 'daily' ? (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Moon in <span className="font-semibold text-primary">{moonSign}</span>
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
          {new Date().toLocaleDateString()}
        </span>
      </div>
    ) : null, [mode, moonSign]);

  const focusControls = useMemo(() =>
    mode === 'analysis' ? (
      <div className="space-y-0.5">

        {/* Mobile: Dropdown for focus modes */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/80 font-medium">Focus:</span>
            <Select value={focusMode} onValueChange={(value) => handleFocusModeChange(value)}>
              <SelectTrigger className="h-6 text-[10px] flex-1 bg-card/60 border-primary/20">
                <SelectValue placeholder="Select focus mode" />
              </SelectTrigger>
              <SelectContent>
                {FOCUS_MODES.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id} className="text-xs">
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop: Inline button grid */}
        <div className="hidden md:block">
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[10px] text-muted-foreground/80 mr-1">Focus:</span>
            {FOCUS_MODES.map((m) => (
              <Button
                key={m.id}
                variant="outline"
                size="sm"
                className={`text-[10px] h-5 px-2 border transition-all duration-200 ${m.color} ${focusMode === m.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                onClick={() => handleFocusModeChange(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    ) : null, [mode, focusMode, handleFocusModeChange]);

  return (
    <Card className="flex flex-col h-full bg-card/30 backdrop-blur-sm border-border/40 overflow-hidden">
      <CardHeader className="py-1.5 px-3 border-b border-border/40 space-y-1 shrink-0">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-1.5 h-7 w-7 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            {mode === 'daily' ? (
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-semibold">Daily Cosmic Chat</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <Star className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-semibold truncate">{chartDetails ? chartDetails.name : 'Chart Analysis'}</span>
                {chartDetails && (
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5 opacity-70" /> {chartDetails.dob}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5 opacity-70" /> {chartDetails.time}
                    </span>
                    {chartDetails.city && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5 opacity-70" /> {chartDetails.city}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
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
          <div className="border-t border-border/40 pt-1">
            {focusControls}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-2 md:p-3 flex-1 flex flex-col gap-2 overflow-hidden min-h-0">
        <CentralizedChat
          messages={messages}
          cardClassName="w-full h-full flex flex-col"
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
          scrollHeight="h-full"
          isRateLimited={isRateLimited}
          rateLimitCountdown={countdownDisplay}
        />
      </CardContent>
    </Card>
  );
});

export default AIChat;
