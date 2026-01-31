import { useState, useEffect } from 'react';
import { aiAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Trash2, Edit2, History, Play } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { createLogger } from '@/utils/logger';

const log = createLogger('ChatHistoryList');

interface Session {
  id: string;
  title: string;
  chart_id?: string;
  created_at: string;
  model: string;
  message_count: number;
}

interface ChatHistoryListProps {
  onSelectSession: (session: Session) => void;
  currentSessionId?: string;
}

export function ChatHistoryList({ onSelectSession, currentSessionId }: ChatHistoryListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await aiAPI.listSessions();
      setSessions(response.data);
    } catch (error) {
      log.error('Failed to fetch sessions', { error: String(error) });
      toast.error('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRename = async () => {
    if (!editingSession || !newTitle.trim()) return;

    try {
      await aiAPI.updateSession(editingSession.id, { title: newTitle });
      setSessions(sessions.map(s =>
        s.id === editingSession.id ? { ...s, title: newTitle } : s
      ));
      setIsRenameDialogOpen(false);
      toast.success('Session renamed');
    } catch (error) {
      log.error('Failed to rename session', { error: String(error) });
      toast.error('Failed to rename session');
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat? It will be moved to trash.')) return;

    try {
      await aiAPI.updateSession(sessionId, { is_deleted: true });
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Chat moved to trash');
    } catch (error) {
      log.error('Failed to delete session', { error: String(error) });
      toast.error('Failed to delete session');
    }
  };

  const openRenameDialog = (session: Session) => {
    setEditingSession(session);
    setNewTitle(session.title);
    setIsRenameDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          Chat History
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchSessions} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No chat history found</div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between p-3 rounded-lg border transition-colors ${session.id === currentSessionId
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-card/50 border-border/50 hover:bg-accent/50'
                  }`}
              >
                <button
                  className="flex-1 text-left truncate mr-2"
                  onClick={() => onSelectSession(session)}
                >
                  <div className="font-medium truncate">{session.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>
                      {(() => {
                        try {
                          return formatDistanceToNow(new Date(session.created_at), { addSuffix: true });
                        } catch (e) {
                          return 'Unknown date';
                        }
                      })()}
                    </span>
                    <span>•</span>
                    <span>{session.message_count} messages</span>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRenameDialog(session);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(session.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new title for this chat session.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title" className="mb-2 block">Title</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter chat title..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRename}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
