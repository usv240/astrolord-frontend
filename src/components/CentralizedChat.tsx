import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Sparkles,
  ChartBar,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Brain,
  MessageCircle,
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

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  analysis?: string;
  suggestions?: string[];
  feedback?: 'like' | 'dislike';
  isSaved?: boolean;
}

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
  cardClassName = '',
  scrollHeight = 'h-[500px]',
  maxWidth = 'max-w-[80%]',
  compactHeader = false,
}: CentralizedChatProps) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [analyzingMessageIndex, setAnalyzingMessageIndex] = useState(0);
  const [hasSeenSuggestions, setHasSeenSuggestions] = useState(false);
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

  // Analyzing messages that rotate while loading
  const analyzingMessages = [
    'Analyzing your chart with cosmic precision...',
    'Decoding your planetary influences...',
    'Exploring your astrological patterns...',
    'Reading the planetary alignments...',
    "Uncovering your chart's deeper insights...",
    'Interpreting the stars for you...',
    'Calculating your astrological transits...',
  ];

  // Rotate analyzing message every 2 seconds while loading
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setAnalyzingMessageIndex((prev) => (prev + 1) % analyzingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, analyzingMessages.length]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Send to parent handler - it will add the user message to state
    try {
      await onSendMessage(userMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const openFeedbackModal = (messageIndex: number, score: number) => {
    setFeedbackModal({
      isOpen: true,
      messageIndex,
      score,
      comment: '',
    });
  };

  const submitFeedback = async () => {
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
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <Card className={`border-primary/20 bg-card/40 backdrop-blur-sm ${cardClassName}`}>
      <CardHeader>
        <div className={compactHeader ? "flex flex-row items-center justify-between w-full" : "flex flex-col w-full"}>
          {!compactHeader ? (
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Ask about this
              </CardTitle>
              <CardDescription className="text-sm">
                Have questions? Ask the AI Astrologer.
              </CardDescription>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
              <Sparkles className="h-3 w-3 text-primary" />
              Compatibility Assistant
            </div>
          )}

          {/* Focus Modes */}
          {showFocusModes && focusModes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {focusModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant="outline"
                  size="sm"
                  className={`text-xs h-7 border transition-all duration-200 ${mode.color} ${focusMode === mode.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                    : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  onClick={() => onFocusModeChange?.(mode.id)}
                >
                  {mode.label}
                </Button>
              ))}
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

      <CardContent className="p-0">
        <ScrollArea
          className={`${scrollHeight} w-full rounded-lg border border-primary/10 bg-background/40 p-4`}
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
                    <div
                      className={`flex items-start gap-2 group ${message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex flex-col gap-1 mt-1 shrink-0">
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
                        </div>
                      )}

                      <div
                        className={`${maxWidth} rounded-lg p-3 text-sm ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card/60 border border-primary/10 text-foreground'
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
                      </div>

                      {message.role === 'assistant' && message.id && (
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
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-1 mt-1 shrink-0"></div>
                      <div className="max-w-[80%] rounded-lg p-4 bg-muted text-foreground">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <p className="text-sm italic text-muted-foreground">
                            {analyzingMessages[analyzingMessageIndex]}
                          </p>
                        </div>
                      </div>
                    </div>
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

        <form onSubmit={handleSendMessage} className="flex gap-2 p-3 border-t border-primary/10">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="bg-background/50 border-primary/20 text-sm"
          />
          <Button type="submit" size="sm" disabled={isLoading} className="px-3">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
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
              The internal logic used to generate this response.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted rounded-md font-mono text-xs whitespace-pre-wrap">
            {selectedAnalysis}
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackModal.isOpen}
        onOpenChange={(open) => setFeedbackModal((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>Help us improve the AI astrologer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-4">
              <Button
                variant={feedbackModal.score === 1 ? 'default' : 'outline'}
                onClick={() => setFeedbackModal((prev) => ({ ...prev, score: 1 }))}
                className="gap-2"
              >
                <ThumbsUp className="h-4 w-4" /> Helpful
              </Button>
              <Button
                variant={feedbackModal.score === -1 ? 'destructive' : 'outline'}
                onClick={() => setFeedbackModal((prev) => ({ ...prev, score: -1 }))}
                className="gap-2"
              >
                <ThumbsDown className="h-4 w-4" /> Not Helpful
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Additional Comments (Optional)</Label>
              <Textarea
                value={feedbackModal.comment}
                onChange={(e) =>
                  setFeedbackModal((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                placeholder="What did you like or dislike?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button onClick={submitFeedback}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CentralizedChat;
