import { useState, useEffect } from 'react';
import { relationshipAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Heart, Loader2, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CitySearch } from './CitySearch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CentralizedChat, { ChatMessage } from './CentralizedChat';
import { useQuota } from '@/hooks/useQuota';
import { trackMatchmakingUsed, trackMessageSent } from '@/lib/analytics';

interface PersonForm {
  name: string;
  dob: string;
  time: string;
  city: string;
  gender: 'male' | 'female';
  lat?: number;
  lon?: number;
  tz?: string;
}

const initialPerson: PersonForm = {
  name: '',
  dob: '',
  time: '',
  city: '',
  gender: 'female', // Default, will be overridden
};

interface RelationshipMatchProps {
  matchId?: string | null;
  onNewMatch?: () => void;
}

// Clean report content by removing XML tags, JSON data, and other artifacts
const cleanReport = (report: string): string => {
  if (!report) return '';

  let cleaned = report;

  // Strategy 1: Extract content between <response> tags if available
  const responseMatch = cleaned.match(/<response>([\s\S]*?)<\/response>/i);
  if (responseMatch && responseMatch[1].trim().length > 10) {
    cleaned = responseMatch[1];
  }

  // Strategy 2: Remove entire analysis blocks
  cleaned = cleaned.replace(/\\n<analysis>[\s\S]*?<\/analysis>\\n/gi, '');
  cleaned = cleaned.replace(/<analysis>[\s\S]*?<\/analysis>/gi, '');

  // Strategy 3: Remove any leading/trailing artifacts
  // Remove opening paren with quote and stuff before response content
  cleaned = cleaned.replace(/^[\s]*\(\s*['\"][^'\"]*['\"\s]*/gm, '');

  // Strategy 4: Remove closing artifacts (tuple/dict with token info)
  // Pattern: , {'prompt_tokens': ...})
  cleaned = cleaned.replace(/,\s*\{\s*['\"]?prompt_tokens['\"]?[\s\S]*?\}\s*\)\s*$/gi, '');
  cleaned = cleaned.replace(/,\s*\{\s*['\"]?prompt_tokens['\"]?[\s\S]*?\}\s*$/gi, '');

  // Strategy 5: Remove response/suggestion XML tags
  cleaned = cleaned.replace(/<response>/gi, '');
  cleaned = cleaned.replace(/<\/response>/gi, '');
  cleaned = cleaned.replace(/<suggestions>[\s\S]*?<\/suggestions>/gi, '');

  // Strategy 6: Remove JSON code blocks
  cleaned = cleaned.replace(/```json[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/``json[\s\S]*?``/g, '');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // Strategy 7: Remove any remaining token dictionaries/tuples
  cleaned = cleaned.replace(/\{\s*['\"]?(?:prompt_tokens|completion_tokens|total_tokens)['\"]?[\s\S]*?\}/g, '');
  cleaned = cleaned.replace(/\(\s*['\"][^'\"]*?['\"],\s*\{[^}]*\}\s*\)/g, '');

  // Strategy 8: Clean up escaped content
  cleaned = cleaned.replace(/\\'/g, "'");
  cleaned = cleaned.replace(/\\"/g, '"');
  cleaned = cleaned.replace(/\\n/g, '\n');

  // Strategy 9: Remove stray markup
  cleaned = cleaned.replace(/^\s*[\(\[\`]+\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*[\)\]\`]+\s*$/gm, '');

  // Strategy 10: Clean whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  // Fallback: if content is too short, it might be entirely artifacts
  if (cleaned.length < 30) {
    // Try to extract any readable text from original
    const readable = report
      .replace(/<[^>]*>/g, ' ')
      .replace(/\{[^}]*\}/g, ' ')
      .replace(/\([^)]*\{[^}]*\}[^)]*\)/g, ' ')
      .replace(/[\(\)]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return readable.slice(0, 500) || 'Analysis processing...';
  }

  return cleaned;
};

// Formatted verdict content component for better display
const FormattedVerdictContent = ({
  content,
  suggestions,
  onSuggestionClick,
  chatLoading
}: {
  content: string;
  suggestions?: string[];
  onSuggestionClick: (msg: string) => void;
  chatLoading: boolean;
}) => {
  // Parse content into sections based on numbered headers
  const sections: { title: string; content: string; icon: string; color: string }[] = [];

  const sectionConfig: Record<string, { icon: string; color: string }> = {
    'overview': { icon: '📊', color: 'from-blue-500/20 to-cyan-500/20' },
    'compatibility': { icon: '💑', color: 'from-pink-500/20 to-rose-500/20' },
    'chart': { icon: '�', color: 'from-purple-500/20 to-violet-500/20' },
    'analysis': { icon: '�', color: 'from-indigo-500/20 to-blue-500/20' },
    'female': { icon: '👩', color: 'from-pink-500/20 to-fuchsia-500/20' },
    'male': { icon: '👨', color: 'from-blue-500/20 to-indigo-500/20' },
    'perspective': { icon: '👁️', color: 'from-violet-500/20 to-purple-500/20' },
    'dynamics': { icon: '🔄', color: 'from-teal-500/20 to-cyan-500/20' },
    'inner': { icon: '🌙', color: 'from-indigo-500/20 to-violet-500/20' },
    'navamsa': { icon: '🌙', color: 'from-indigo-500/20 to-violet-500/20' },
    'strength': { icon: '💪', color: 'from-green-500/20 to-emerald-500/20' },
    'weakness': { icon: '⚠️', color: 'from-amber-500/20 to-orange-500/20' },
    'challenge': { icon: '⚡', color: 'from-orange-500/20 to-red-500/20' },
    'timing': { icon: '⏰', color: 'from-cyan-500/20 to-teal-500/20' },
    'verdict': { icon: '⚖️', color: 'from-purple-500/20 to-pink-500/20' },
    'key': { icon: '🔑', color: 'from-amber-500/20 to-yellow-500/20' },
  };

  // Split by numbered sections (1., 2., 3., etc.)
  const sectionRegex = /(?:^|\n)(\d+)\.\s*([^\n]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = sectionRegex.exec(content)) !== null) {
    // Get content before this match if it's the first section
    if (sections.length === 0 && match.index > 0) {
      const preContent = content.substring(0, match.index).trim();
      if (preContent && preContent.length > 20) {
        sections.push({
          title: 'Summary',
          content: preContent,
          icon: '✨',
          color: 'from-primary/20 to-secondary/20'
        });
      }
    }

    // Get content from last match to this match
    if (sections.length > 0) {
      const prevContent = content.substring(lastIndex, match.index).trim();
      if (prevContent) {
        sections[sections.length - 1].content = prevContent;
      }
    }

    // Extract title and find config
    const title = match[2].replace(/\*\*/g, '').replace(/:$/, '').trim();
    let config = { icon: '📌', color: 'from-gray-500/20 to-slate-500/20' };

    for (const [key, cfg] of Object.entries(sectionConfig)) {
      if (title.toLowerCase().includes(key)) {
        config = cfg;
        break;
      }
    }

    sections.push({ title, content: '', ...config });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining content to last section
  if (sections.length > 0 && lastIndex < content.length) {
    sections[sections.length - 1].content = content.substring(lastIndex).trim();
  }

  // Fallback: if no numbered sections found, show everything in one section
  if (sections.length === 0) {
    sections.push({
      title: 'Relationship Analysis',
      content: content,
      icon: '�',
      color: 'from-primary/20 to-secondary/20'
    });
  }

  // Clean section content
  const cleanSectionContent = (text: string): string => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markers
      .replace(/\*([^*]+)\*/g, '$1')      // Remove italic markers  
      .replace(/\\'/g, "'")               // Fix escaped quotes
      .replace(/\\n/g, '\n')              // Handle escaped newlines
      .trim();
  };

  return (
    <div className="space-y-4 p-4">
      {sections.map((section, idx) => (
        <div
          key={idx}
          className={`rounded-xl p-4 bg-gradient-to-br ${section.color} border border-border/30 hover:border-border/50 transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center text-xl shrink-0">
              {section.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-base mb-2">{section.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cleanSectionContent(section.content)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="rounded-xl p-4 bg-gradient-to-br from-accent/10 to-primary/10 border border-primary/20">
          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <span>💬</span> Continue the conversation
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion: string, sIdx: number) => (
              <button
                key={sIdx}
                onClick={() => onSuggestionClick(suggestion)}
                disabled={chatLoading}
                className="text-sm px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-all disabled:opacity-50 hover:scale-[1.02]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RELATIONSHIP_PRESETS = [
  { id: 'general', label: 'Can you give me a general overview of our compatibility?', color: 'hover:bg-slate-500/20 border-slate-500/50', prompt: 'Give me a general overview of our compatibility.' },
  { id: 'love', label: 'How is our love and romantic chemistry?', color: 'hover:bg-pink-500/20 border-pink-500/50', prompt: 'Analyze the love, romance, and physical attraction between us.' },
  { id: 'communication', label: 'Will we be able to communicate well?', color: 'hover:bg-blue-500/20 border-blue-500/50', prompt: 'How is our communication and mental rapport? Will we understand each other?' },
  { id: 'longevity', label: 'What is our potential for marriage/long-term?', color: 'hover:bg-purple-500/20 border-purple-500/50', prompt: 'Evaluate the long-term stability and marriage potential of this match.' },
  { id: 'conflict', label: 'What challenges or conflicts might we face?', color: 'hover:bg-red-500/20 border-red-500/50', prompt: 'What are the main areas of conflict or challenges we might face?' },
  { id: 'family', label: 'What does the chart say about family and kids?', color: 'hover:bg-green-500/20 border-green-500/50', prompt: 'What does the chart say about family life, domestic happiness, and children?' },
  { id: 'financial', label: 'Are we financially compatible?', color: 'hover:bg-amber-500/20 border-amber-500/50', prompt: 'Analyze our financial compatibility and shared wealth luck.' },
];

const RelationshipMatch = ({ matchId, onNewMatch }: RelationshipMatchProps) => {
  const [p1, setP1] = useState<PersonForm>({ ...initialPerson, gender: 'female' });
  const [p2, setP2] = useState<PersonForm>({ ...initialPerson, gender: 'male' });
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [verdictExpanded, setVerdictExpanded] = useState(false);

  // Quota refresh hook for updating compatibility usage
  const { refresh: refreshQuota } = useQuota();

  useEffect(() => {
    if (matchId) {
      loadMatch(matchId);
    } else {
      // Reset if matchId is cleared
      setResult(null);
      setChatHistory([]);
      setChatInput('');
      setP1({ ...initialPerson, gender: 'female' });
      setP2({ ...initialPerson, gender: 'male' });
    }
  }, [matchId]);

  const loadMatch = async (id: string) => {
    setLoading(true);
    try {
      const res = await relationshipAPI.getMatch(id);
      setResult(res.data);

      if (res.data.chat_history && Array.isArray(res.data.chat_history)) {
        const history = res.data.chat_history.map((m: any, i: number) => ({
          role: m.role,
          content: m.role === 'assistant' ? cleanReport(m.content) : m.content,
          analysis: m.analysis,
          suggestions: m.suggestions,
          id: m.id || `msg-${i}`
        }));

        // Inject presets into the last message if it's from assistant
        if (history.length > 0) {
          const lastMsg = history[history.length - 1];
          if (lastMsg.role === 'assistant') {
            const currentSuggestions = lastMsg.suggestions || [];
            const presetLabels = RELATIONSHIP_PRESETS.map(p => p.label);
            // Combine and deduplicate
            lastMsg.suggestions = Array.from(new Set([...currentSuggestions, ...presetLabels]));
          }
        }

        setChatHistory(history);
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      console.error("Failed to load match", error);
      toast.error("Failed to load match details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1.name || !p1.dob || !p1.city || !p2.name || !p2.dob || !p2.city) {
      toast.error("Please fill in all required fields for both people.");
      return;
    }

    setLoading(true);
    setResult(null);
    setChatHistory([]);

    const payload = {
      p1: { ...p1, time: p1.time || '12:00' },
      p2: { ...p2, time: p2.time || '12:00' },
      context: context
    };

    // Fire both requests in parallel for optimal performance
    const scorePromise = relationshipAPI.matchWithScore(payload);
    const fullPromise = relationshipAPI.match(payload);

    // Handle Score Response (Fast Update)
    scorePromise
      .then(scoreResponse => {
        // Uses functional update to avoid overwriting if full report finished first (race condition safety)
        setResult(prev => {
          if (prev?.match_id) return prev; // Full report already loaded, ignore partial
          return {
            score: scoreResponse.data.score,
            max_score: scoreResponse.data.max_score,
            p1_name: scoreResponse.data.p1_name,
            p2_name: scoreResponse.data.p2_name,
            report: "Generating detailed analysis...",
            analysis: null,
            suggestions: [],
            match_id: null,
            chat_history: [],
            loading_report: true
          };
        });
        toast.success("Score calculated! ❤️");
        trackMatchmakingUsed();
      })
      .catch(error => {
        console.error("Score calculation failed:", error);
        // We let the full report error handler manage the main UI feedback if both fail
      });

    // Handle Full Report (Slower Update)
    fullPromise
      .then(fullResponse => {
        setResult(fullResponse.data);

        // Process chat history
        if (fullResponse.data.chat_history && Array.isArray(fullResponse.data.chat_history)) {
          const history = fullResponse.data.chat_history.map((m: any, i: number) => ({
            role: m.role,
            content: m.role === 'assistant' ? cleanReport(m.content) : m.content,
            analysis: m.analysis,
            suggestions: m.suggestions,
            id: m.id || `msg-${i}`
          }));

          // Inject presets into the last message if it's from assistant
          if (history.length > 0) {
            const lastMsg = history[history.length - 1];
            if (lastMsg.role === 'assistant') {
              const currentSuggestions = lastMsg.suggestions || [];
              const presetLabels = RELATIONSHIP_PRESETS.map(p => p.label);
              lastMsg.suggestions = Array.from(new Set([...currentSuggestions, ...presetLabels]));
            }
          }
          setChatHistory(history);
        }

        toast.success("Match Analysis Complete! ❤️");
        if (onNewMatch) onNewMatch();
      })
      .catch(error => {
        console.error("Full report failed:", error);
        toast.error(error.response?.data?.detail || "Match analysis failed");

        // If score succeeded but report failed, update state to show error in report section
        setResult(prev => prev ? {
          ...prev,
          report: "Could not generate full report. Please try asking specific questions in the chat.",
          loading_report: false
        } : null);
      })
      .finally(() => {
        setLoading(false);
      });
  };



  const handleSendChatMessage = async (message: string) => {
    // Add user message to history immediately
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setChatLoading(true);

    try {
      // Use matchId if available (either from prop or from newly created result)
      const currentMatchId = matchId || result?.match_id;

      // Include the user message in history for API call
      const updatedHistory = [...chatHistory, userMessage];

      // Check if message matches a preset label and use the detailed prompt if so
      let finalMessage = message;
      const matchedPreset = RELATIONSHIP_PRESETS.find(p => p.label === message);
      if (matchedPreset) {
        finalMessage = matchedPreset.prompt;
      }

      const response = await relationshipAPI.chat({
        match_id: currentMatchId,
        p1_name: result.p1_name,
        p2_name: result.p2_name,
        p1_details: result.p1_details || `${p1.dob} ${p1.city}`,
        p2_details: result.p2_details || `${p2.dob} ${p2.city}`,
        score: result.score,
        message: message,
        history: updatedHistory.map(m => ({ role: m.role, content: m.content }))
      });


      // Refresh quota to update compatibility message count
      await refreshQuota();

      // Track compatibility message sent
      trackMessageSent('compatibility');

      // Add response to history - clean the content
      // Handle various response field names: response, reply, message, text, content
      let responseContent = response.data.response
        || response.data.reply
        || response.data.message
        || response.data.text
        || response.data.content;

      // If response is object, stringify it to see structure
      if (!responseContent && typeof response.data === 'object') {
        responseContent = JSON.stringify(response.data);
      }

      // If still no response, use the whole data as string
      if (!responseContent) {
        responseContent = String(response.data);
      }

      responseContent = cleanReport(responseContent);

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: responseContent,
        analysis: response.data.analysis,
        suggestions: response.data.suggestions,
        id: response.data.session_id || `msg-${Date.now()}`
      }]);

    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChatHistory = () => {
    setChatHistory([]);
  };

  const handleSubmitFeedback = async (messageIndex: number, score: number, comment: string) => {
    // Feedback submission logic can be added here if needed
    toast.success("Thanks for your feedback!");
  };



  const updateP1 = (field: keyof PersonForm, value: any) => setP1(prev => ({ ...prev, [field]: value }));
  const updateP2 = (field: keyof PersonForm, value: any) => setP2(prev => ({ ...prev, [field]: value }));

  const handleReset = () => {
    if (onNewMatch) {
      onNewMatch();
    } else {
      setResult(null);
      setChatHistory([]);
      setChatInput('');
      setContext('');
    }
  };

  if (loading && !result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-primary animate-pulse">
        <Loader2 className="h-12 w-12 mb-4 animate-spin" />
        <p>Analyzing the stars...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!result ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
            {/* Person 1 */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 relative z-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">1</div>
                  Person 1
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={p1.name} onChange={e => updateP1('name', e.target.value)} placeholder="e.g. Rahul" required />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={p1.gender} onValueChange={(v: any) => updateP1('gender', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={p1.dob} onChange={e => updateP1('dob', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={p1.time} onChange={e => updateP1('time', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>City of Birth</Label>
                  <CitySearch
                    onSelect={(cityData) => {
                      updateP1('city', cityData.city);
                      updateP1('lat', cityData.lat);
                      updateP1('lon', cityData.lon);
                      updateP1('tz', cityData.tz);
                    }}
                    defaultValue={p1.city}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Person 2 */}
            <Card className="bg-card/50 backdrop-blur-sm border-secondary/20 relative z-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">2</div>
                  Person 2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={p2.name} onChange={e => updateP2('name', e.target.value)} placeholder="e.g. Priya" required />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={p2.gender} onValueChange={(v: any) => updateP2('gender', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={p2.dob} onChange={e => updateP2('dob', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={p2.time} onChange={e => updateP2('time', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>City of Birth</Label>
                  <CitySearch
                    onSelect={(cityData) => {
                      updateP2('city', cityData.city);
                      updateP2('lat', cityData.lat);
                      updateP2('lon', cityData.lon);
                      updateP2('tz', cityData.tz);
                    }}
                    defaultValue={p2.city}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>Context (Optional)</Label>
                <Textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="e.g. We are considering arranged marriage. Any concerns?"
                  className="bg-background/50"
                />
              </div>
              <Button type="submit" className="w-full mt-6 cosmic-glow text-lg h-12" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Heart className="mr-2 h-5 w-5 fill-current" />}
                Analyze Relationship
              </Button>
            </CardContent>
          </Card>
        </form>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <Card className="border-primary/20 bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center py-6">
              <CardDescription className="text-sm font-medium mb-3">
                {result.p1_name} & {result.p2_name}
              </CardDescription>
              <div className="flex justify-center items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/20" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${(result.score / result.max_score) * 283} 283`} className="text-primary animate-pulse" strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-primary block">
                      {result.score}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {result.max_score}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-medium">COMPATIBILITY SCORE</p>
            </CardHeader>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50 cursor-pointer hover:bg-primary/5 transition-colors"
              onClick={() => setVerdictExpanded(!verdictExpanded)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔮</span>
                  Astrological Verdict
                  {result.analysis && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnalysis(result.analysis);
                      }}
                      title="View Deep Analysis"
                    >
                      <Brain className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVerdictExpanded(!verdictExpanded);
                  }}
                >
                  {verdictExpanded ? (
                    <>
                      <span className="text-xs mr-1">Hide</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span className="text-xs mr-1">Show</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardTitle>
              {!verdictExpanded && (
                <p className="text-sm text-muted-foreground mt-2 font-medium bg-secondary/10 p-2 rounded-md text-center cursor-pointer hover:bg-secondary/20 transition-colors">
                  ✨ Click here to view the high-level astrological verdict & detailed analysis...
                </p>
              )}
            </CardHeader>
            {verdictExpanded && (
              <CardContent className="p-0">
                {result.loading_report ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-muted-foreground">Generating detailed analysis...</span>
                  </div>
                ) : (
                  <FormattedVerdictContent
                    content={cleanReport(result.report)}
                    suggestions={result.suggestions}
                    onSuggestionClick={handleSendChatMessage}
                    chatLoading={chatLoading}
                  />
                )}
              </CardContent>
            )}
          </Card>

          {/* CENTRALIZED CHAT COMPONENT */}
          <CentralizedChat
            messages={chatHistory}
            setMessages={setChatHistory}
            input={chatInput}
            setInput={setChatInput}
            isLoading={chatLoading}
            onSendMessage={handleSendChatMessage}
            onSubmitFeedback={handleSubmitFeedback}
            onClearHistory={handleClearChatHistory}
            emptyStateTitle="Ask me anything about your relationship compatibility..."
            suggestedQuestions={[
              'How compatible are we based on Nadi Dosha?',
              'What does the Bhakut score indicate?',
              'Are there any doshas I should worry about?',
              'What are the best periods for us?',
              'What remedies can improve our compatibility?'
            ]}
            scrollHeight="h-[500px]"
            maxWidth="max-w-full"
            compactHeader={true}
          />

          <Button variant="outline" onClick={handleReset} className="w-full">
            Analyze Another Match
          </Button>
        </div>
      )}

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
    </div>
  );
};

export default RelationshipMatch;

