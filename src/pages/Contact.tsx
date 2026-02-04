import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FeedbackDialog from '@/components/FeedbackDialog';

const Contact = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <Card className="w-full max-w-2xl relative border-border/50 backdrop-blur-sm bg-card/80">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 hover:bg-transparent hover:text-primary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <CardHeader className="space-y-1 text-center p-4 sm:p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 cosmic-glow">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Contact Us
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            We'd love to hear from you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-lg bg-muted/30 border border-border/30 flex flex-col items-center text-center">
              <Mail className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For general inquiries, bug reports, and support.
              </p>
              <a href="mailto:support@astro-lord.com" className="text-primary hover:underline font-medium">
                support@astro-lord.com
              </a>
            </div>

            <div className="p-4 sm:p-6 rounded-lg bg-muted/30 border border-border/30 flex flex-col items-center text-center">
              <MessageSquare className="h-10 w-10 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Feedback</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Have suggestions? Let us know how we can improve.
              </p>
              <Button
                variant="outline"
                className="border-primary/50 hover:bg-primary/10"
                onClick={() => setFeedbackOpen(true)}
              >
                Send Feedback
              </Button>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button asChild variant="ghost">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

        </CardContent>
      </Card>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};

export default Contact;
