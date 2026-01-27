import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Clock, Calendar, TrendingUp, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { blogArticles } from '@/data/blogContent';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Beginner Guides", "Vedic Concepts", "Practical Astrology", "Advanced Topics", "Relationships", "Educational"];

  // Filter articles based on selected category
  const filteredArticles = selectedCategory === "All"
    ? blogArticles
    : blogArticles.filter(article => article.category === selectedCategory);

  // Get featured article (first from filtered, or first overall if filtered is empty)
  const featuredArticle = filteredArticles[0] || blogArticles[0];
  const remainingArticles = filteredArticles.slice(1);

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
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <BookOpen className="h-16 w-16 text-accent mx-auto mb-4" />
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text">
                AstroLord Blog
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore Vedic astrology insights, guides, and tips to deepen your cosmic understanding
              </p>
            </div>

            {/* Category Filters */}
            <div className="mb-12">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={selectedCategory === category ? "cosmic-glow" : "border-border/50 hover:border-primary/50"}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Show results count when filtered */}
            {selectedCategory !== "All" && (
              <div className="text-center mb-8">
                <p className="text-muted-foreground">
                  Showing <span className="text-primary font-semibold">{filteredArticles.length}</span> article{filteredArticles.length !== 1 ? 's' : ''} in "{selectedCategory}"
                </p>
              </div>
            )}

            {/* Featured Article */}
            {featuredArticle && (
              <Link to={`/blog/${featuredArticle.slug}`} className="block mb-12">
                <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30 hover:border-primary/60 transition-all">
                  <div className="flex items-start gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {selectedCategory === "All" ? "Featured Article" : `Top in ${selectedCategory}`}
                    </span>
                  </div>
                  <div className="text-5xl mb-4">{featuredArticle.image}</div>
                  <h2 className="text-3xl font-bold mb-4">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {featuredArticle.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {featuredArticle.readTime}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {featuredArticle.author}
                    </span>
                  </div>
                  <Button className="cosmic-glow">
                    Read Full Article
                  </Button>
                </div>
              </Link>
            )}

            {/* Articles Grid */}
            {remainingArticles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {remainingArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all group cursor-pointer"
                  >
                    <div className="text-5xl mb-4">{article.image}</div>
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-primary px-2 py-1 rounded-full bg-primary/10">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                      <span>{article.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : selectedCategory !== "All" && filteredArticles.length === 1 ? (
              <div className="text-center mb-12 p-8 rounded-lg bg-card/30 border border-border/50">
                <p className="text-muted-foreground">
                  This is the only article in the "{selectedCategory}" category.
                </p>
                <Button
                  variant="link"
                  className="text-primary mt-2"
                  onClick={() => setSelectedCategory("All")}
                >
                  View all articles
                </Button>
              </div>
            ) : null}

            {/* No results message */}
            {filteredArticles.length === 0 && (
              <div className="text-center mb-12 p-8 rounded-lg bg-card/30 border border-border/50">
                <p className="text-muted-foreground mb-4">
                  No articles found in "{selectedCategory}".
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory("All")}
                >
                  View All Articles
                </Button>
              </div>
            )}

            {/* Newsletter Signup */}
            <div className="p-10 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 backdrop-blur-sm border border-accent/30 text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Subscribe to receive weekly astrology insights, cosmic updates, and exclusive content delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="cosmic-glow">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                No spam, unsubscribe anytime. Read our{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Blog;
