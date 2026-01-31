import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Star, Moon, Sun, Sparkles, Info, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSEO } from '@/components/SEO';

const Learn = () => {
  return (
    <>
      <PageSEO page="learn" />
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
                  className="h-12 w-auto hover:opacity-80 transition-opacity"
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
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <BookOpen className="h-16 w-16 text-accent mx-auto mb-4" />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-purple-400 to-pink-500 text-transparent bg-clip-text">
                Learn Vedic Astrology
              </h1>
              <p className="text-xl text-muted-foreground">
                Your complete guide to understanding cosmic wisdom
              </p>
            </div>

            <Tabs defaultValue="basics" className="space-y-8">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="chart">Your Chart</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
                <TabsTrigger value="glossary">Glossary</TabsTrigger>
              </TabsList>

              {/* Basics Tab */}
              <TabsContent value="basics" className="space-y-6">
                <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Star className="h-8 w-8 text-accent" />
                    What is Vedic Astrology?
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Vedic astrology, also known as <strong className="text-foreground">Jyotish</strong> (the "Science of Light"),
                      is an ancient Indian system of astrology over 5,000 years old. Unlike Western astrology, it uses the
                      <strong className="text-foreground"> sidereal zodiac</strong>, which is based on the actual positions of
                      constellations in the sky.
                    </p>
                    <p>
                      This system provides profound insights into your:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-foreground">Personality & Character</strong> - Core traits and behavioral patterns</li>
                      <li><strong className="text-foreground">Life Purpose</strong> - Your dharma and karmic path</li>
                      <li><strong className="text-foreground">Career & Finances</strong> - Professional aptitude and wealth potential</li>
                      <li><strong className="text-foreground">Relationships</strong> - Compatibility and relationship dynamics</li>
                      <li><strong className="text-foreground">Health & Wellbeing</strong> - Physical and mental health tendencies</li>
                      <li><strong className="text-foreground">Timing of Events</strong> - When major life events are likely to occur</li>
                    </ul>
                  </div>
                </div>

                <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <h3 className="text-2xl font-bold mb-4">Vedic vs Western Astrology</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-accent">Vedic Astrology</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>✓ Uses sidereal zodiac (actual star positions)</li>
                        <li>✓ Moon sign focused (Rashi)</li>
                        <li>✓ Includes 27 Nakshatras (lunar mansions)</li>
                        <li>✓ Dasha system for timing predictions</li>
                        <li>✓ Divisional charts (D9, D10, etc.)</li>
                        <li>✓ Remedial measures (gemstones, mantras)</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-secondary">Western Astrology</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>✓ Uses tropical zodiac (seasonal)</li>
                        <li>✓ Sun sign focused</li>
                        <li>✓ 12 zodiac signs only</li>
                        <li>✓ Transit-based predictions</li>
                        <li>✓ Single birth chart</li>
                        <li>✓ Psychological focus</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 backdrop-blur-sm border border-accent/30">
                  <h3 className="text-2xl font-bold mb-4">Why Birth Time Matters</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Your exact birth time is crucial for accurate Vedic astrology because it determines your:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">Ascendant (Lagna)</h4>
                      <p className="text-sm text-muted-foreground">
                        Your rising sign, which defines your personality and physical appearance. Changes every 2 hours.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">House Positions</h4>
                      <p className="text-sm text-muted-foreground">
                        Where planets fall in different life areas (career, relationships, health, etc.)
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">Dasha Periods</h4>
                      <p className="text-sm text-muted-foreground">
                        120-year planetary period timeline that predicts when events will occur in your life
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">Divisional Charts</h4>
                      <p className="text-sm text-muted-foreground">
                        Specialized charts for career (D10), marriage (D9), children (D7), and more
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 italic">
                    💡 Tip: Check your birth certificate or hospital records for the most accurate time.
                  </p>
                </div>
              </TabsContent>

              {/* Chart Tab */}
              <TabsContent value="chart" className="space-y-6">
                <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Moon className="h-8 w-8 text-primary" />
                    Understanding Your Birth Chart
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Your birth chart (Kundali) is a snapshot of the sky at the exact moment and location of your birth.
                    It reveals your cosmic blueprint and life patterns.
                  </p>

                  <div className="space-y-6">
                    <div className="border-l-4 border-accent pl-6">
                      <h3 className="text-xl font-semibold mb-3">12 Houses (Bhavas)</h3>
                      <p className="text-muted-foreground mb-3">
                        Your chart is divided into 12 houses, each representing different life areas like self (1st),
                        wealth (2nd), career (10th), relationships (7th), and spirituality (12th).
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        The AI will explain which houses are important in your chart when you chat with it.
                      </p>
                    </div>

                    <div className="border-l-4 border-secondary pl-6">
                      <h3 className="text-xl font-semibold mb-3">9 Planets (Grahas)</h3>
                      <p className="text-muted-foreground mb-3">
                        Vedic astrology uses 9 planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn,
                        plus two shadow planets Rahu and Ketu. Each influences different aspects of your life.
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        Your chart shows where each planet was positioned at your birth time.
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-6">
                      <h3 className="text-xl font-semibold mb-3">12 Signs (Rashis)</h3>
                      <p className="text-muted-foreground mb-3">
                        The 12 zodiac signs (Aries through Pisces) show how planetary energies express themselves.
                        Your Moon sign is especially important in Vedic astrology.
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        Each sign has unique qualities that color the planets placed in them.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-6">
                      <h3 className="text-xl font-semibold mb-3">27 Nakshatras (Lunar Mansions)</h3>
                      <p className="text-muted-foreground mb-3">
                        Nakshatras are 27 fine divisions of the zodiac that provide deeper personality insights.
                        Your Moon Nakshatra reveals your core emotional nature and life path.
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        AstroLord automatically calculates your Nakshatra and includes it in AI analysis.
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-xl font-semibold mb-3">Yogas & Doshas</h3>
                      <p className="text-muted-foreground mb-3">
                        <strong className="text-foreground">Yogas</strong> are auspicious planetary combinations (like Raj Yoga, Dhana Yoga)
                        that bring fortune and success. <strong className="text-foreground">Doshas</strong> are challenging patterns
                        (like Mangal Dosha, Kaal Sarpa) that need remedies.
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        AstroLord detects 40+ yogas and doshas in your chart and explains their impact in your AI consultations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30">
                  <h3 className="text-2xl font-bold mb-4">Divisional Charts (Vargas)</h3>
                  <p className="text-muted-foreground mb-4">
                    Divisional charts are specialized views that zoom into specific life areas:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">D9 - Navamsa</h4>
                      <p className="text-sm text-muted-foreground">Marriage, spouse qualities, spiritual growth (9th division)</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">D10 - Dasamsa</h4>
                      <p className="text-sm text-muted-foreground">Career, profession, reputation (10th division)</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">D7 - Saptamsa</h4>
                      <p className="text-sm text-muted-foreground">Children, progeny (7th division)</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">D12 - Dwadasamsa</h4>
                      <p className="text-sm text-muted-foreground">Parents, lineage (12th division)</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    AstroLord automatically calculates 20+ divisional charts for comprehensive analysis.
                  </p>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-accent" />
                    What AstroLord Can Do
                  </h2>

                  <div className="space-y-8">
                    {/* Chart Generation */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Star className="h-6 w-6 text-accent" />
                        Precise Birth Chart Generation
                      </h3>
                      <ul className="space-y-2 text-muted-foreground ml-8">
                        <li>✓ Create accurate Vedic birth charts with your birth details</li>
                        <li>✓ Automatic calculation of Ascendant, Moon sign, and all planetary positions</li>
                        <li>✓ 20+ divisional charts (D1, D9, D10, D7, D12, etc.)</li>
                        <li>✓ 120-year Vimshottari Dasha timeline</li>
                        <li>✓ Store multiple charts for family and friends (up to 50)</li>
                        <li>✓ City search with 100,000+ locations worldwide</li>
                        <li>✓ Charts generated in under 2 seconds</li>
                      </ul>
                    </div>

                    {/* AI Chat */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-secondary" />
                        AI Astrologer Chat
                      </h3>
                      <ul className="space-y-2 text-muted-foreground ml-8">
                        <li>✓ Natural conversations about your chart</li>
                        <li>✓ Ask about career, relationships, health, finances, and more</li>
                        <li>✓ Get explanations in simple, easy-to-understand language</li>
                        <li>✓ Context-aware responses based on your entire chart</li>
                        <li>✓ Remember conversation history for deeper discussions</li>
                        <li>✓ 10 specialized focus modes (Career, Love, Health, Wealth, etc.)</li>
                        <li>✓ Streaming responses for real-time interaction</li>
                      </ul>
                    </div>

                    {/* Analysis Features */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Info className="h-6 w-6 text-primary" />
                        Deep Analysis & Predictions
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6 ml-8">
                        <div>
                          <h4 className="font-semibold mb-2 text-foreground">Dasha Analysis</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Current planetary period (Mahadasha)</li>
                            <li>• Sub-periods (Antardasha, Pratyantardasha)</li>
                            <li>• Timeline of all periods in your lifetime</li>
                            <li>• Predictions for each period</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-foreground">Transits (Gochar)</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Current planetary positions</li>
                            <li>• How transits affect your chart</li>
                            <li>• Daily, weekly, monthly forecasts</li>
                            <li>• Sade Sati detection (Saturn transit)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-foreground">Yoga Detection</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• 40+ auspicious yogas detected</li>
                            <li>• Raj Yoga, Dhana Yoga, Gaja Kesari</li>
                            <li>• Doshas: Mangal Dosha, Kaal Sarpa</li>
                            <li>• Strength and timing analysis</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-foreground">Compatibility</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Ashtakoot matching (36-point system)</li>
                            <li>• Guna Milan for marriage compatibility</li>
                            <li>• Detailed analysis of strengths/challenges</li>
                            <li>• Remedies for improving relationships</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Specialized Analysis */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Sun className="h-6 w-6 text-amber-500" />
                        Specialized Focus Areas
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4 ml-8">
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">💼 Career</h4>
                          <p className="text-sm text-muted-foreground">
                            Best profession, timing for job changes, business success, promotions
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">💰 Wealth</h4>
                          <p className="text-sm text-muted-foreground">
                            Financial prospects, investment timing, wealth accumulation periods
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">❤️ Relationships</h4>
                          <p className="text-sm text-muted-foreground">
                            Marriage timing, compatibility, relationship challenges and solutions
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">🏥 Health</h4>
                          <p className="text-sm text-muted-foreground">
                            Health vulnerabilities, preventive measures, favorable periods
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">👶 Children</h4>
                          <p className="text-sm text-muted-foreground">
                            Progeny analysis, timing for childbirth, children's prospects
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">✈️ Travel</h4>
                          <p className="text-sm text-muted-foreground">
                            Foreign travel, relocation, settlement abroad possibilities
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remedies */}
                    <div className="p-6 rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 border border-accent/30">
                      <h3 className="text-xl font-semibold mb-3">🕉️ Remedial Measures</h3>
                      <p className="text-muted-foreground mb-3">
                        Get personalized remedies to strengthen positive influences and mitigate challenges:
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <li>• Gemstone recommendations</li>
                        <li>• Mantras for each planet</li>
                        <li>• Charitable activities</li>
                        <li>• Fasting days</li>
                        <li>• Color therapy</li>
                        <li>• Yantra suggestions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <h3 className="text-2xl font-bold mb-4">📊 Technical Accuracy</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20">
                      <div className="text-4xl font-bold text-accent mb-2">200+</div>
                      <div className="text-sm text-muted-foreground">Tests ensuring accuracy</div>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                      <div className="text-4xl font-bold text-primary mb-2">&lt;2s</div>
                      <div className="text-sm text-muted-foreground">Chart generation time</div>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20">
                      <div className="text-4xl font-bold text-secondary mb-2">100%</div>
                      <div className="text-sm text-muted-foreground">Mathematical precision</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tutorial Tab */}
              <TabsContent value="tutorial" className="space-y-6">
                <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <HelpCircle className="h-8 w-8 text-accent" />
                    How to Use AstroLord
                  </h2>

                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="border-l-4 border-accent pl-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                          1
                        </div>
                        <h3 className="text-2xl font-semibold">Create Your Account</h3>
                      </div>
                      <ul className="space-y-2 text-muted-foreground ml-13">
                        <li>• Click "Get Started" or "Register"</li>
                        <li>• Enter your email and create a password</li>
                        <li>• Verify your email with the OTP sent to your inbox</li>
                        <li>• Or use "Sign in with Google" for instant access</li>
                      </ul>
                      <div className="mt-4 p-4 rounded-lg bg-accent/10">
                        <p className="text-sm text-muted-foreground">
                          💡 <strong className="text-foreground">Tip:</strong> Your account is free forever with included charts and daily messages!
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="border-l-4 border-primary pl-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          2
                        </div>
                        <h3 className="text-2xl font-semibold">Create Your Birth Chart</h3>
                      </div>
                      <ul className="space-y-2 text-muted-foreground ml-13">
                        <li>• Go to Dashboard → "Charts" tab</li>
                        <li>• Click "Create New Chart"</li>
                        <li>• Enter birth details:
                          <ul className="ml-6 mt-1 space-y-1">
                            <li>→ Name (optional, for your reference)</li>
                            <li>→ Date of birth</li>
                            <li>→ Exact time of birth (check birth certificate)</li>
                            <li>→ Place of birth (use city search)</li>
                          </ul>
                        </li>
                        <li>• Click "Generate Chart"</li>
                        <li>• Your chart is ready in under 2 seconds!</li>
                      </ul>
                      <div className="mt-4 p-4 rounded-lg bg-primary/10">
                        <p className="text-sm text-muted-foreground">
                          ⚠️ <strong className="text-foreground">Important:</strong> Birth time accuracy is crucial.
                          Even a few minutes difference can change your Ascendant and house positions.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="border-l-4 border-secondary pl-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                          3
                        </div>
                        <h3 className="text-2xl font-semibold">Chat with AI Astrologer</h3>
                      </div>
                      <ul className="space-y-2 text-muted-foreground ml-13">
                        <li>• Click on your chart to open chat interface</li>
                        <li>• Or go to Dashboard → "Chat" tab</li>
                        <li>• Select a chart from the dropdown</li>
                        <li>• Choose a focus mode (General, Career, Love, Health, etc.)</li>
                        <li>• Start asking questions!</li>
                      </ul>
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-semibold text-foreground">Example Questions:</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-secondary/10 text-sm">
                            "What career is best suited for me?"
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/10 text-sm">
                            "When should I get married?"
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/10 text-sm">
                            "Tell me about my current Dasha period"
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/10 text-sm">
                            "What are my strengths and weaknesses?"
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/10 text-sm">
                            "How is my financial situation?"
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/10 text-sm">
                            "What remedies can improve my life?"
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="border-l-4 border-purple-500 pl-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                          4
                        </div>
                        <h3 className="text-2xl font-semibold">Explore Advanced Features</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 ml-13">
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">Daily Forecast</h4>
                          <p className="text-sm text-muted-foreground">
                            Get personalized daily predictions based on current planetary transits
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">Compatibility Check</h4>
                          <p className="text-sm text-muted-foreground">
                            Create charts for two people and ask about relationship compatibility
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">Dasha Timeline</h4>
                          <p className="text-sm text-muted-foreground">
                            View your complete 120-year planetary period timeline
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-background/50">
                          <h4 className="font-semibold mb-2">Divisional Charts</h4>
                          <p className="text-sm text-muted-foreground">
                            Deep dive into career (D10), marriage (D9), and other specialized charts
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="border-l-4 border-green-500 pl-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                          5
                        </div>
                        <h3 className="text-2xl font-semibold">Upgrade When You're Ready</h3>
                      </div>
                      <p className="text-muted-foreground ml-13 mb-3">
                        If you need more charts or deeper analysis:
                      </p>
                      <ul className="space-y-2 text-muted-foreground ml-13">
                        <li>• Go to Dashboard → View your subscription widget</li>
                        <li>• Or visit Pricing page</li>
                        <li>• Choose Weekly or Monthly plans for more charts and messages</li>
                        <li>• Prices automatically adjusted for your country</li>
                        <li>• Secure payment via Razorpay</li>
                        <li>• Cancel anytime, no questions asked</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 backdrop-blur-sm border border-accent/30">
                  <h3 className="text-2xl font-bold mb-4">💡 Pro Tips</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">Ask Specific Questions</h4>
                      <p className="text-sm text-muted-foreground">
                        Instead of "Tell me everything", ask "When is the best time for a job change?" for focused insights
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">Use Focus Modes</h4>
                      <p className="text-sm text-muted-foreground">
                        Select the right focus mode (Career, Love, Health) for domain-specific analysis
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">Save Important Chats</h4>
                      <p className="text-sm text-muted-foreground">
                        Your chat history is automatically saved. Review past conversations anytime
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">Compare Charts</h4>
                      <p className="text-sm text-muted-foreground">
                        Create charts for family members and ask about relationships and compatibility
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Glossary Tab */}
              <TabsContent value="glossary" className="space-y-6">
                <div className="p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-accent" />
                    Astrological Terms Glossary
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* A-D */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Ascendant (Lagna)</h4>
                        <p className="text-sm text-muted-foreground">
                          The zodiac sign rising on the eastern horizon at your birth time. Defines your personality and physical appearance.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Ashtakoot (Guna Milan)</h4>
                        <p className="text-sm text-muted-foreground">
                          8-factor compatibility system for marriage matching. Maximum 36 points. 18+ is considered acceptable.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Ayanamsha</h4>
                        <p className="text-sm text-muted-foreground">
                          Difference between tropical and sidereal zodiac (~24°). Used to calculate accurate planetary positions.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Bhava (House)</h4>
                        <p className="text-sm text-muted-foreground">
                          12 divisions of the chart representing different life areas (self, wealth, siblings, home, etc.)
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Dasha</h4>
                        <p className="text-sm text-muted-foreground">
                          Planetary period system. Vimshottari Dasha spans 120 years with each planet ruling specific periods.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Dosha</h4>
                        <p className="text-sm text-muted-foreground">
                          Astrological affliction. Examples: Mangal Dosha (Mars affliction), Kaal Sarpa (Rahu-Ketu axis).
                        </p>
                      </div>
                    </div>

                    {/* G-N */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Graha (Planet)</h4>
                        <p className="text-sm text-muted-foreground">
                          9 celestial bodies in Vedic astrology: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Gochar (Transit)</h4>
                        <p className="text-sm text-muted-foreground">
                          Current movement of planets in the sky and their effects on your birth chart.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Kundali (Birth Chart)</h4>
                        <p className="text-sm text-muted-foreground">
                          Complete birth chart showing planetary positions at your birth time and location.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Mahadasha</h4>
                        <p className="text-sm text-muted-foreground">
                          Major planetary period. Each planet rules for a specific number of years (Sun: 6, Moon: 10, etc.)
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Nakshatra</h4>
                        <p className="text-sm text-muted-foreground">
                          27 lunar mansions, each 13°20'. Moon's nakshatra is crucial for personality and destiny analysis.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Navamsa (D9)</h4>
                        <p className="text-sm text-muted-foreground">
                          9th divisional chart. Most important after birth chart. Shows marriage, spouse, and spiritual strength.
                        </p>
                      </div>
                    </div>

                    {/* R-Y */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Rashi (Zodiac Sign)</h4>
                        <p className="text-sm text-muted-foreground">
                          12 zodiac signs (Mesha/Aries to Meena/Pisces). Your Moon sign is considered most important.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Raj Yoga</h4>
                        <p className="text-sm text-muted-foreground">
                          Royal combination indicating power, status, and success formed by specific planetary alignments.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Sade Sati</h4>
                        <p className="text-sm text-muted-foreground">
                          7.5 year period when Saturn transits the 12th, 1st, and 2nd houses from Moon. Challenging but transformative.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Varga (Divisional Chart)</h4>
                        <p className="text-sm text-muted-foreground">
                          Specialized charts for specific life areas (D9 marriage, D10 career, D7 children, etc.)
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Yoga</h4>
                        <p className="text-sm text-muted-foreground">
                          Planetary combination creating specific effects. Can be auspicious (Raj, Dhana) or challenging (doshas).
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent mb-1">Yogakaraka</h4>
                        <p className="text-sm text-muted-foreground">
                          Planet that becomes highly beneficial by ruling both auspicious houses for your Ascendant.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30">
                  <h3 className="text-2xl font-bold mb-4">Planet Significations</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">☀️ Sun (Surya)</h4>
                      <p className="text-muted-foreground">Soul, ego, father, authority, government, leadership, confidence</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">🌙 Moon (Chandra)</h4>
                      <p className="text-muted-foreground">Mind, emotions, mother, nurturing, mental peace, public relations</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">♂️ Mars (Mangal)</h4>
                      <p className="text-muted-foreground">Energy, courage, siblings, property, sports, surgery, aggression</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">☿ Mercury (Budha)</h4>
                      <p className="text-muted-foreground">Intelligence, communication, business, education, wit, analysis</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">♃ Jupiter (Guru)</h4>
                      <p className="text-muted-foreground">Wisdom, children, fortune, teaching, spirituality, expansion</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">♀ Venus (Shukra)</h4>
                      <p className="text-muted-foreground">Love, beauty, luxury, arts, relationships, comfort, spouse</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">♄ Saturn (Shani)</h4>
                      <p className="text-muted-foreground">Karma, discipline, delays, hard work, longevity, lessons</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">☊ Rahu</h4>
                      <p className="text-muted-foreground">Obsession, foreign, unconventional, material desires, illusion</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-2">☋ Ketu</h4>
                      <p className="text-muted-foreground">Spirituality, detachment, past life, mysticism, liberation</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA Section */}
            <div className="mt-12 p-8 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 backdrop-blur-sm border border-accent/30 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Explore Your Cosmic Blueprint?</h3>
              <p className="text-muted-foreground mb-6">
                Start your journey with AstroLord today. Free forever, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="cosmic-glow">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/faq">
                  <Button size="lg" variant="outline" className="border-border/50">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    View FAQ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Learn;
