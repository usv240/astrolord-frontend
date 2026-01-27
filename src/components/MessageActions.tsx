import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, BookmarkPlus, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MessageActionsProps {
  content: string;
  messageId?: string;
  isSaved?: boolean;
  onSave?: () => void;
}

export const MessageActions = ({
  content,
  messageId,
  isSaved = false,
  onSave,
}: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    // For mobile: use native share
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AstroLord Insight',
          text: content.slice(0, 100) + '...',
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard and show message
      navigator.clipboard.writeText(content);
      toast.success('Response copied! Share the link with friends.');
    }
  };

  return (
    <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* Copy Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        title="Copy response"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        onClick={handleShare}
        title="Share response"
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>

      {/* Bookmark Button */}
      {onSave && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={onSave}
          title={isSaved ? 'Remove from saved' : 'Save response'}
        >
          {isSaved ? (
            <Bookmark className="h-3.5 w-3.5 text-primary fill-primary" />
          ) : (
            <BookmarkPlus className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  );
};
