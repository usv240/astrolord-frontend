import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Send,
  Sparkles,
  ChartBar,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Brain,
  MessageCircle,
  Info,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageFormatter } from './MessageFormatter';
import { MessageActions } from './MessageActions';
import { TypingIndicator } from './ChatLoadingStates';
import { createLogger } from '@/utils/logger';

const log = createLogger('CentralizedChat');

// Move constants outside to prevent recreation
const ANALYZING_MESSAGES = Object.freeze([
  'Analyzing your chart with cosmic precision...',
  'Decoding your planetary influences...',
  'Exploring your astrological patterns...',
  'Reading the planetary alignments...',
  "Uncovering your chart's deeper insights...",
  'Interpreting the stars for you...',
  'Calculating your astrological transits...',
]);

// Topic categories with example questions
const TOPIC_QUESTIONS = {
  career: {
    label: '💼 Career',
    color: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20',
    questions: [
      'Should I change my job this year?',
      'Will my business succeed?',
      'When will I get promoted?',
      'Am I suited for government jobs?',
      'Should I start my own company?',
    ],
  },
  love: {
    label: '💕 Love',
    color: 'bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20',
    questions: [
      'When will I find my life partner?',
      'Is my current relationship going to last?',
      'Why do my relationships keep failing?',
      'Will I have an arranged or love marriage?',
      'Is there any delay in my marriage?',
    ],
  },
  health: {
    label: '💪 Health',
    color: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
    questions: [
      'Any chronic health issues I should know?',
      'Why am I always feeling low energy?',
      'When will my health problems improve?',
      'What body parts are weak in my chart?',
      'Am I prone to accidents or surgeries?',
    ],
  },
  wealth: {
    label: '💰 Wealth',
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20',
    questions: [
      'Will I ever be financially stable?',
      'When is a good time to invest in property?',
      'Why does money slip through my fingers?',
      'Will I get ancestral property?',
      'Am I destined for wealth or struggle?',
    ],
  },
  timing: {
    label: '⏱️ Timing',
    color: 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20',
    questions: [
      'What is my current Dasha period?',
      'When will my bad phase end?',
      'Is this a good year for big decisions?',
      'What are the next 2 years like for me?',
      'When will Saturn\'s influence reduce?',
    ],
  },
  remedies: {
    label: '🌿 Remedies',
    color: 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20',
    questions: [
      'What gemstone should I wear?',
      'Which day is lucky for me?',
      'What mantras help my weak planets?',
      'Should I do any fasting or pooja?',
      'How can I reduce Rahu-Ketu effects?',
    ],
  },
  family: {
    label: '👨‍👩‍👧 Family',
    color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20',
    questions: [
      'Will I have children? When?',
      'Why is there conflict with my parents?',
      'How is my relationship with in-laws?',
      'Will my child be successful?',
      'Any family disputes in my chart?',
    ],
  },
  travel: {
    label: '✈️ Travel',
    color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20',
    questions: [
      'Will I get to settle abroad?',
      'Any visa or immigration success?',
      'Is relocation good for my career?',
      'When can I plan foreign travel?',
      'Which direction is lucky for me?',
    ],
  },
  education: {
    label: '📚 Studies',
    color: 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20',
    questions: [
      'Will I pass my exams this time?',
      'Should I pursue higher studies abroad?',
      'What subjects suit me best?',
      'Will I get into a good college?',
      'Is competitive exam success possible?',
    ],
  },
} as const;

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  analysis?: string;
  suggestions?: string[];
  feedback?: 'like' | 'dislike';
  isSaved?: boolean;
  timestamp?: string | Date;
}

// Helper function to format relative time
const formatRelativeTime = (timestamp: string | Date | undefined): string => {
  if (!timestamp) return '';

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export interface CentralizedChatProps {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onSubmitFeedback?: (messageIndex: number, score: number, comment: string) => Promise<void>;
  onClearHistory?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  emptyStateTitle?: string;
  emptyStateIcon?: React.ReactNode;
  suggestedQuestions?: string[];
  showFocusModes?: boolean;
  focusMode?: string;
  onFocusModeChange?: (mode: string) => void;
  focusModes?: Array<{ id: string; label: string; color: string }>;
  activeFocusTags?: string[];
  showFormatting?: boolean;
  cardClassName?: string;
  scrollHeight?: string;
  maxWidth?: string;
  compactHeader?: boolean;
  /** Rate limiting state */
  isRateLimited?: boolean;
  /** Countdown display for rate limit (e.g., "0:45") */
  rateLimitCountdown?: string;
}

const CentralizedChat = ({
  messages,
  setMessages,
  input,
  setInput,
  isLoading,
  onSendMessage,
  onSubmitFeedback,
  onClearHistory,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  emptyStateTitle = 'Start a conversation!',
  emptyStateIcon = <Sparkles className="h-12 w-12 mb-4 text-primary/50" />,
  suggestedQuestions = [],
  showFocusModes = false,
  focusMode,
  onFocusModeChange,
  focusModes = [],
  activeFocusTags = [],
  showFormatting = true,
  cardClassName = 'w-full',
  scrollHeight = 'h-[500px]',
  maxWidth = 'max-w-[95%] md:max-w-[80%]',  // Wider on mobile, narrower on desktop
  compactHeader = false,
  isRateLimited = false,
  rateLimitCountdown = '',
}: CentralizedChatProps) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [analyzingMessageIndex, setAnalyzingMessageIndex] = useState(0);
  const [hasSeenSuggestions, setHasSeenSuggestions] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<keyof typeof TOPIC_QUESTIONS | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    messageIndex: number | null;
    score: number | null;
    comment: string;
  }>({
    isOpen: false,
    messageIndex: null,
    score: null,
    comment: '',
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rotate analyzing message every 2 seconds while loading
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setAnalyzingMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  // Reset suggestions flag when messages are cleared or update based on user interaction
  useEffect(() => {
    if (messages.length === 0) {
      setHasSeenSuggestions(false);
    } else {
      // Hide suggestions only after the user has sent a message
      const hasUserMessage = messages.some(m => m.role === 'user');
      if (hasUserMessage && !hasSeenSuggestions) {
        setHasSeenSuggestions(true);
      }
    }
  }, [messages, hasSeenSuggestions]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Send to parent handler - it will add the user message to state
    try {
      await onSendMessage(userMessage);
    } catch (error) {
      log.error('Failed to send message', { error: String(error) });
      toast.error('Failed to send message');
    }
  }, [input, isLoading, setInput, onSendMessage]);

  const openFeedbackModal = useCallback((messageIndex: number, score: number) => {
    setFeedbackModal({
      isOpen: true,
      messageIndex,
      score,
      comment: '',
    });
  }, []);

  const closeFeedbackModal = useCallback(() => {
    setFeedbackModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const updateFeedbackScore = useCallback((score: number) => {
    setFeedbackModal(prev => ({ ...prev, score }));
  }, []);

  const updateFeedbackComment = useCallback((comment: string) => {
    setFeedbackModal(prev => ({ ...prev, comment }));
  }, []);

  const submitFeedback = useCallback(async () => {
    const { messageIndex, score, comment } = feedbackModal;
    if (messageIndex === null || score === null) return;

    try {
      if (onSubmitFeedback) {
        await onSubmitFeedback(messageIndex, score, comment);
      }

      // Update message with feedback
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === messageIndex ? { ...msg, feedback: score === 1 ? 'like' : 'dislike' } : msg,
        ),
      );

      toast.success('Feedback submitted');
      setFeedbackModal({ isOpen: false, messageIndex: null, score: null, comment: '' });
    } catch (error) {
      log.error('Failed to submit feedback', { error: String(error) });
      toast.error('Failed to submit feedback');
    }
  }, [feedbackModal, onSubmitFeedback, setMessages]);

  return (
    <Card className={`border-primary/20 bg-card/40 backdrop-blur-sm overflow-hidden ${cardClassName}`}>
      <CardHeader className="py-1 px-2 md:py-2 md:px-4 shrink-0">
        <div className={compactHeader ? "flex flex-row items-center justify-between w-full" : "flex flex-col w-full"}>
          {!compactHeader ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  Your AI Astrologer
                </CardTitle>
                <button
                  onClick={() => setShowTopics(!showTopics)}
                  className={`flex items-center gap-1.5 text-[10px] md:text-xs px-2.5 py-1 rounded-full transition-all duration-200 ${showTopics
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-primary/10 text-primary/80 border border-primary/20 hover:bg-primary/20 hover:text-primary'
                    }`}
                >
                  <span>💡</span>
                  <span>Topics</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showTopics ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {/* Expandable Topics Section */}
              {showTopics && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200 mt-2 p-2 md:p-3 rounded-lg bg-primary/5 border border-primary/10">
                  {!selectedTopic ? (
                    <>
                      <p className="text-[10px] md:text-xs text-muted-foreground mb-2">Click a topic to see questions:</p>
                      <div className="flex flex-wrap gap-1.5 text-[10px] md:text-xs">
                        {(Object.keys(TOPIC_QUESTIONS) as Array<keyof typeof TOPIC_QUESTIONS>).map((topicKey) => (
                          <button
                            key={topicKey}
                            onClick={() => setSelectedTopic(topicKey)}
                            className={`px-2 py-0.5 rounded-full border cursor-pointer transition-all duration-150 hover:scale-105 ${TOPIC_QUESTIONS[topicKey].color}`}
                          >
                            {TOPIC_QUESTIONS[topicKey].label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="animate-in fade-in duration-150">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTopic(null)}
                            className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            ← Back
                          </button>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] md:text-xs ${TOPIC_QUESTIONS[selectedTopic].color}`}>
                            {TOPIC_QUESTIONS[selectedTopic].label}
                          </span>
                        </div>
                        <span className="text-[9px] md:text-[10px] text-muted-foreground/70">👆 Click to ask</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {TOPIC_QUESTIONS[selectedTopic].questions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onSendMessage(question);
                              setShowTopics(false);
                              setSelectedTopic(null);
                            }}
                            className="text-left text-[10px] md:text-[11px] px-2 py-1.5 rounded bg-background/50 hover:bg-primary/10 border border-border/30 hover:border-primary/40 transition-all duration-100 truncate"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
              <Sparkles className="h-3 w-3 text-primary" />
              Compatibility Assistant
            </div>
          )}

          {/* Focus Modes */}
          {showFocusModes && focusModes.length > 0 && (
            <div className="space-y-1.5 md:space-y-2 pt-1 md:pt-2">
              {/* Mobile: Dropdown for focus modes */}
              <div className="md:hidden space-y-1.5">
                <p className="text-[11px] text-muted-foreground/80">
                  💡 Tap a focus mode — e.g., <strong>Career</strong> for job guidance,
                  <strong>Love</strong> for relationships.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground/80 font-medium">Focus:</span>
                  <Select value={focusMode} onValueChange={(value) => onFocusModeChange?.(value)}>
                    <SelectTrigger className="h-7 text-xs flex-1 bg-card/60 border-primary/20">
                      <SelectValue placeholder="Select focus mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {focusModes.map((mode) => (
                        <SelectItem key={mode.id} value={mode.id} className="text-xs">
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Desktop: Button grid */}
              <div className="hidden md:block">
                <p className="text-xs text-muted-foreground/80 mb-2">
                  💡 Tap a focus mode — e.g., <strong>Career</strong> for job guidance,
                  <strong>Love</strong> for relationships.
                </p>
                <div className="flex flex-wrap gap-2">
                  {focusModes.map((mode) => (
                    <Button
                      key={mode.id}
                      variant="outline"
                      size="sm"
                      className={`text-xs h-7 px-3 border transition-all duration-200 ${mode.color} ${focusMode === mode.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                        : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      onClick={() => onFocusModeChange?.(mode.id)}
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Focus Tags */}
          {activeFocusTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFocusTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* History Controls - When compact, align right */}
          {messages.length > 0 && onClearHistory && (
            <div className={compactHeader ? "" : "mt-2"}>
              <Button
                variant={compactHeader ? "ghost" : "outline"}
                size="sm"
                className={`text-xs ${compactHeader ? "h-7 px-2 text-muted-foreground hover:text-foreground" : ""}`}
                onClick={onClearHistory}
              >
                Clear History
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
        <ScrollArea
          className={`flex-1 min-h-0 w-full rounded-lg border border-primary/10 bg-background/40 p-1 md:p-4 mx-1 md:mx-2`}
        >
          {hasMore && (
            <div className="flex justify-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="text-xs text-muted-foreground hover:bg-background/50"
              >
                {isLoadingMore ? 'Loading...' : 'Load Previous Messages'}
              </Button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 relative z-50">
              <span className="text-3xl">💬</span>
              <p className="text-sm">{emptyStateTitle}</p>
              {suggestedQuestions.length > 0 && (
                <div className="mt-6 grid gap-2 w-full max-w-[280px] relative z-50">
                  {suggestedQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-auto py-2 whitespace-normal text-left relative z-50"
                      onClick={() => {
                        onSendMessage(q);
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 flex flex-col h-full">
              {/* Messages at top */}
              <div className="flex-1 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className="space-y-2">
                    {/* Message bubble - full width for assistant, right-aligned for user */}
                    <div className={`${message.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div
                        className={`rounded-lg p-2 md:p-3 text-sm ${message.role === 'user'
                          ? `${maxWidth} bg-primary text-primary-foreground`
                          : 'w-full bg-card/60 border border-primary/10 text-foreground'
                          }`}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        ) : showFormatting ? (
                          <MessageFormatter content={message.content} />
                        ) : (
                          <div className="prose dark:prose-invert text-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                        {message.timestamp && (
                          <span className={`text-[10px] mt-1.5 block ${message.role === 'user'
                            ? 'text-primary-foreground/60'
                            : 'text-muted-foreground/60'
                            }`}>
                            {formatRelativeTime(message.timestamp)}
                          </span>
                        )}

                        {/* Action buttons inside assistant message bubble */}
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-primary/10">
                            {message.analysis && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-50 hover:opacity-100"
                                onClick={() => setSelectedAnalysis(message.analysis || null)}
                                title="View Analysis Logic"
                              >
                                <ChartBar className="h-4 w-4" />
                              </Button>
                            )}
                            {message.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-6 w-6 ${message.feedback === 'like'
                                    ? 'text-green-500 opacity-100'
                                    : 'opacity-50 hover:opacity-100'
                                    }`}
                                  onClick={() => openFeedbackModal(index, 1)}
                                  disabled={!!message.feedback}
                                  title="Helpful"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-6 w-6 ${message.feedback === 'dislike'
                                    ? 'text-red-500 opacity-100'
                                    : 'opacity-50 hover:opacity-100'
                                    }`}
                                  onClick={() => openFeedbackModal(index, -1)}
                                  disabled={!!message.feedback}
                                  title="Not Helpful"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {message.id && (
                              <MessageActions
                                content={message.content}
                                messageId={message.id}
                                onSave={() => {
                                  setMessages((prev) =>
                                    prev.map((msg, idx) =>
                                      idx === index ? { ...msg, isSaved: !msg.isSaved } : msg,
                                    ),
                                  );
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.role === 'assistant' &&
                      message.suggestions &&
                      message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 ml-8">
                          {message.suggestions.map((suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              className="text-xs h-auto py-1.5 px-3 whitespace-normal text-left bg-background/50 hover:bg-background"
                              onClick={() => {
                                onSendMessage(suggestion);
                              }}
                              disabled={isLoading}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
                {isLoading && (
                  <div className="space-y-2">
                    <TypingIndicator />
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {/* Show suggested questions at the bottom - only once when chart is first loaded */}
              {suggestedQuestions.length > 0 && !hasSeenSuggestions && (
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-3">Quick questions:</p>
                  <div className="grid gap-2 max-w-full">
                    {suggestedQuestions.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs justify-start h-auto py-2 whitespace-normal text-left"
                        onClick={() => {
                          onSendMessage(q);
                        }}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Quick Action Buttons - COMMENTED OUT to reduce clutter
        {messages.length > 0 && !isLoading && (
          <div className="flex gap-1.5 px-3 pt-2 pb-1 overflow-x-auto scrollbar-hide">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs shrink-0 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20"
              onClick={() => onSendMessage("What are today's transits affecting me?")}
              disabled={isLoading}
            >
              🌙 Transits
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs shrink-0 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20"
              onClick={() => onSendMessage("What career insights can you share?")}
              disabled={isLoading}
            >
              💼 Career
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs shrink-0 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20"
              onClick={() => onSendMessage("What about my love life and relationships?")}
              disabled={isLoading}
            >
              💕 Love
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs shrink-0 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
              onClick={() => onSendMessage("What remedies do you suggest for me?")}
              disabled={isLoading}
            >
              🌿 Remedies
            </Button>
          </div>
        )}
        */}

        <form onSubmit={handleSendMessage} className="flex flex-col gap-2 p-3 border-t border-primary/10 shrink-0 bg-card/80">
          {/* Rate limit warning */}
          {isRateLimited && rateLimitCountdown && (
            <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 px-3 py-1.5 rounded-md border border-warning/20">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Rate limited - you can send another message in <strong>{rateLimitCountdown}</strong></span>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRateLimited ? `Wait ${rateLimitCountdown}...` : "Ask about your chart..."}
              disabled={isLoading || isRateLimited}
              className="bg-background/50 border-primary/20 text-sm flex-1"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || isRateLimited || !input.trim()}
              className="px-3 cosmic-glow btn-press"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Analysis Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Astrological Reasoning
            </DialogTitle>
            <DialogDescription>
              The astrological analysis behind this response.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-primary/10">
            {selectedAnalysis && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MessageFormatter
                  content={selectedAnalysis
                    .replace(/\\n/g, '\n')
                    .replace(/^\s*\n/gm, '\n')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim()
                  }
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog - Contextual */}
      <Dialog
        open={feedbackModal.isOpen}
        onOpenChange={(open) => !open && closeFeedbackModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto mb-3">
              {feedbackModal.score === 1 ? (
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-3xl">🎉</span>
                </div>
              ) : feedbackModal.score === -1 ? (
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <span className="text-3xl">🤔</span>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <DialogTitle className="text-xl">
              {feedbackModal.score === 1
                ? "Glad that helped!"
                : feedbackModal.score === -1
                  ? "Sorry about that"
                  : "How was this response?"}
            </DialogTitle>
            <DialogDescription>
              {feedbackModal.score === 1
                ? "Your feedback helps us make the AI astrologer even better."
                : feedbackModal.score === -1
                  ? "Help us understand what went wrong so we can improve."
                  : "Let us know if this insight was useful."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-3">
              <Button
                variant={feedbackModal.score === 1 ? 'default' : 'outline'}
                onClick={() => updateFeedbackScore(1)}
                className={`gap-2 flex-1 max-w-[140px] transition-all ${feedbackModal.score === 1
                  ? 'bg-green-500 hover:bg-green-600 border-green-500'
                  : 'hover:border-green-500 hover:text-green-500'
                  }`}
              >
                <ThumbsUp className="h-4 w-4" /> Helpful
              </Button>
              <Button
                variant={feedbackModal.score === -1 ? 'destructive' : 'outline'}
                onClick={() => updateFeedbackScore(-1)}
                className={`gap-2 flex-1 max-w-[140px] transition-all ${feedbackModal.score === -1
                  ? ''
                  : 'hover:border-destructive hover:text-destructive'
                  }`}
              >
                <ThumbsDown className="h-4 w-4" /> Not Helpful
              </Button>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {feedbackModal.score === 1
                  ? "What did you find most useful? (optional)"
                  : feedbackModal.score === -1
                    ? "What could have been better? (optional)"
                    : "Additional comments (optional)"}
              </Label>
              <Textarea
                value={feedbackModal.comment}
                onChange={(e) => updateFeedbackComment(e.target.value)}
                placeholder={
                  feedbackModal.score === 1
                    ? "The prediction was accurate, the advice was helpful..."
                    : feedbackModal.score === -1
                      ? "The information seemed incorrect, I needed more details..."
                      : "Share your thoughts..."
                }
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={closeFeedbackModal}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <Button
              onClick={submitFeedback}
              disabled={feedbackModal.score === null}
              className="cosmic-glow"
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default memo(CentralizedChat);
