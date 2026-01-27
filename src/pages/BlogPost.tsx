import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, User, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getBlogArticleBySlug, blogArticles } from '@/data/blogContent';

// Custom markdown-like renderer for blog content
const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: JSX.Element[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' = 'ul';
    let key = 0;

    const processInlineFormatting = (text: string) => {
        // Bold
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
        // Italic
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        // Code
        text = text.replace(/`([^`]+)`/g, '<code class="bg-card/50 px-2 py-1 rounded text-primary text-sm">$1</code>');
        return text;
    };

    const flushList = () => {
        if (listItems.length > 0) {
            const ListTag = listType === 'ul' ? 'ul' : 'ol';
            elements.push(
                <ListTag key={key++} className={`space-y-2 mb-6 ${listType === 'ul' ? 'list-disc' : 'list-decimal'} list-inside text-muted-foreground`}>
                    {listItems.map((item, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
                    ))}
                </ListTag>
            );
            listItems = [];
            inList = false;
        }
    };

    const flushTable = () => {
        if (tableRows.length > 0) {
            elements.push(
                <div key={key++} className="overflow-x-auto mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-card/50">
                                {tableHeaders.map((header, idx) => (
                                    <th key={idx} className="p-3 text-left border border-border/50 font-semibold text-foreground">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-card/30">
                                    {row.map((cell, cellIdx) => (
                                        <td
                                            key={cellIdx}
                                            className="p-3 border border-border/50 text-muted-foreground"
                                            dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
            tableHeaders = [];
            inTable = false;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Skip empty lines but flush any pending lists/tables
        if (!trimmedLine) {
            flushList();
            continue;
        }

        // Headers
        if (trimmedLine.startsWith('## ')) {
            flushList();
            flushTable();
            elements.push(
                <h2 key={key++} className="text-2xl md:text-3xl font-bold mt-12 mb-6 pb-3 border-b border-border/50 text-foreground">
                    {trimmedLine.replace('## ', '')}
                </h2>
            );
            continue;
        }

        if (trimmedLine.startsWith('### ')) {
            flushList();
            flushTable();
            elements.push(
                <h3 key={key++} className="text-xl md:text-2xl font-bold mt-8 mb-4 text-foreground">
                    {trimmedLine.replace('### ', '')}
                </h3>
            );
            continue;
        }

        if (trimmedLine.startsWith('#### ')) {
            flushList();
            flushTable();
            elements.push(
                <h4 key={key++} className="text-lg font-semibold mt-6 mb-3 text-foreground">
                    {trimmedLine.replace('#### ', '')}
                </h4>
            );
            continue;
        }

        // Horizontal rule
        if (trimmedLine === '---') {
            flushList();
            flushTable();
            elements.push(<hr key={key++} className="border-border/50 my-8" />);
            continue;
        }

        // Table detection
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
            flushList();
            const cells = trimmedLine.split('|').filter(c => c.trim()).map(c => c.trim());

            // Skip separator rows
            if (cells.every(c => /^[-:]+$/.test(c))) {
                continue;
            }

            if (!inTable) {
                // First row is header
                inTable = true;
                tableHeaders = cells;
            } else {
                tableRows.push(cells);
            }
            continue;
        } else if (inTable) {
            flushTable();
        }

        // Unordered list
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
            if (!inList || listType !== 'ul') {
                flushList();
                inList = true;
                listType = 'ul';
            }
            listItems.push(trimmedLine.replace(/^[-•]\s+/, ''));
            continue;
        }

        // Ordered list
        if (/^\d+\.\s/.test(trimmedLine)) {
            if (!inList || listType !== 'ol') {
                flushList();
                inList = true;
                listType = 'ol';
            }
            listItems.push(trimmedLine.replace(/^\d+\.\s+/, ''));
            continue;
        }

        // Regular paragraph
        if (inList) {
            flushList();
        }
        if (inTable) {
            flushTable();
        }

        elements.push(
            <p
                key={key++}
                className="text-muted-foreground leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedLine) }}
            />
        );
    }

    // Flush any remaining
    flushList();
    flushTable();

    return elements;
};

const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const article = slug ? getBlogArticleBySlug(slug) : undefined;

    if (!article) {
        return <Navigate to="/blog" replace />;
    }

    // Get related articles (same category, excluding current)
    const relatedArticles = blogArticles
        .filter(a => a.category === article.category && a.id !== article.id)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark dark:from-cosmic-darker dark:via-background dark:to-cosmic-dark">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
            </div>

            <div className="relative z-10">
                <header className="container mx-auto px-4 py-6">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/blog">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Blog
                                </Button>
                            </Link>
                            <Link to="/">
                                <img
                                    src="/logo.png"
                                    alt="AstroLord"
                                    className="h-10 w-auto hover:opacity-80 transition-opacity"
                                />
                            </Link>
                        </div>
                        <div className="flex gap-3">
                            <ThemeToggle />
                            <Button variant="outline" asChild className="border-border/50">
                                <Link to="/login">Sign In</Link>
                            </Button>
                            <Button asChild className="cosmic-glow">
                                <Link to="/register">Get Started</Link>
                            </Button>
                        </div>
                    </nav>
                </header>

                <main className="container mx-auto px-6 py-12">
                    <article className="max-w-4xl mx-auto">
                        {/* Article Header */}
                        <div className="text-center mb-12">
                            <div className="text-6xl mb-6">{article.image}</div>
                            <span className="inline-block text-sm font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 mb-4">
                                {article.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text leading-tight">
                                {article.title}
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
                                {article.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {article.date}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {article.readTime}
                                </span>
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {article.author}
                                </span>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="p-6 md:p-10 rounded-lg bg-card/30 backdrop-blur-sm border border-border/50">
                            {renderContent(article.content)}
                        </div>

                        {/* CTA Section */}
                        <div className="mt-16 p-8 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 backdrop-blur-sm border border-accent/30 text-center">
                            <h3 className="text-2xl font-bold mb-4">Ready to Explore Your Chart?</h3>
                            <p className="text-muted-foreground mb-6">
                                Get your accurate Vedic birth chart and chat with our AI astrologer for personalized insights.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register">
                                    <Button size="lg" className="cosmic-glow">
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link to="/learn">
                                    <Button size="lg" variant="outline">
                                        <BookOpen className="h-5 w-5 mr-2" />
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Related Articles */}
                        {relatedArticles.length > 0 && (
                            <div className="mt-16">
                                <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {relatedArticles.map((related) => (
                                        <Link
                                            key={related.id}
                                            to={`/blog/${related.slug}`}
                                            className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all group"
                                        >
                                            <div className="text-4xl mb-4">{related.image}</div>
                                            <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">
                                                {related.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {related.excerpt}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>
                </main>
            </div>
        </div>
    );
};

export default BlogPost;
