import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  MessageSquare, Clock, Heart,
  Users, ArrowLeft
} from 'lucide-react';

interface DashboardSummary {
  total_sessions: number;
  total_queries: number;
  avg_session_duration: number;
  avg_messages_per_session: number;
  top_intent: string;
  top_focus_mode: string;
  dominant_emotional_tone: string;
  avg_response_quality: number;
}

interface IntentDistribution {
  intent: string;
  count: number;
  percentage: number;
}

interface EmotionalToneDistribution {
  tone: string;
  count: number;
  avg_confidence: number;
  percentage: number;
}

interface ResponseQualityMetrics {
  total_responses: number;
  avg_response_length: number;
  avg_word_count: number;
  avg_paragraph_count: number;
  avg_charts_mentioned: number;
  avg_remedies_suggested: number;
  avg_yogas_mentioned: number;
  avg_placements_mentioned: number;
}

interface RemedyMetrics {
  by_type: {
    remedy_type: string;
    views: number;
    adoptions: number;
    adoption_rate: number;
    avg_effectiveness?: number;
  }[];
  total_views: number;
  total_adoptions: number;
  overall_adoption_rate: number;
}

interface ChartMetrics {
  by_chart: {
    chart_name: string;
    mentions: number;
    unique_sessions: number;
    primary_intents: string[];
  }[];
  total_mentions: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<string>('30');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [intents, setIntents] = useState<IntentDistribution[]>([]);
  const [emotionalTone, setEmotionalTone] = useState<EmotionalToneDistribution[]>([]);
  const [responseQuality, setResponseQuality] = useState<ResponseQualityMetrics | null>(null);
  const [remedies, setRemedies] = useState<RemedyMetrics | null>(null);
  const [charts, setCharts] = useState<ChartMetrics | null>(null);

  useEffect(() => {
    loadAllData();
  }, [timeRange]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);

      const dashboardRes = await adminAPI.getAnalyticsDashboard(days);
      const intentsRes = await adminAPI.getAnalyticsIntents(days);
      const emotionalToneRes = await adminAPI.getAnalyticsEmotionalTone(days);
      const responseQualityRes = await adminAPI.getAnalyticsResponseQuality(days);
      const remediesRes = await adminAPI.getAnalyticsRemedies(days);
      const chartsRes = await adminAPI.getAnalyticsCharts(days);

      setDashboard(dashboardRes.data);
      setIntents(intentsRes.data.distribution || []);
      setEmotionalTone(emotionalToneRes.data.distribution || []);
      setResponseQuality(responseQualityRes.data);
      setRemedies(remediesRes.data);
      setCharts(chartsRes.data);
    } catch (error) {
      toast({
        title: 'Error loading analytics',
        description: error.response?.data?.detail || 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Comprehensive insights into user behavior and system performance</p>
          </div>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.total_sessions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Avg {(dashboard.avg_messages_per_session || 0).toFixed(1)} msgs/session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.total_queries || 0}</div>
              <p className="text-xs text-muted-foreground">
                Top: {dashboard.top_intent || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(dashboard.avg_session_duration || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Mode: {dashboard.top_focus_mode || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Sentiment</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {dashboard.dominant_emotional_tone || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Quality: {(dashboard.avg_response_quality || 0).toFixed(1)}/10
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics Tabs - Simplified to 5 working tabs */}
      <Tabs defaultValue="intents" className="space-y-4">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex min-w-max">
            <TabsTrigger value="intents" className="text-sm">User Intents</TabsTrigger>
            <TabsTrigger value="sentiment" className="text-sm">Sentiment</TabsTrigger>
            <TabsTrigger value="quality" className="text-sm">Response Quality</TabsTrigger>
            <TabsTrigger value="remedies" className="text-sm">Remedies</TabsTrigger>
            <TabsTrigger value="charts" className="text-sm">Charts</TabsTrigger>
          </TabsList>
        </div>

        {/* Intents Tab */}
        <TabsContent value="intents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Intent Distribution</CardTitle>
              <CardDescription>What users are asking about</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={intents}
                      dataKey="count"
                      nameKey="intent"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.intent} (${(entry.percentage || 0).toFixed(1)}%)`}
                    >
                      {intents.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
                  {intents.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium capitalize">{item.intent}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.count || 0}</div>
                        <div className="text-xs text-muted-foreground">{(item.percentage || 0).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Tone Analysis</CardTitle>
              <CardDescription>User sentiment distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={emotionalTone}
                      dataKey="count"
                      nameKey="tone"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.tone} (${(entry.percentage || 0).toFixed(1)}%)`}
                    >
                      {emotionalTone.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
                  {emotionalTone.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium capitalize">{item.tone}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.count || 0}</div>
                        <div className="text-xs text-muted-foreground">
                          {(item.percentage || 0).toFixed(1)}% • {((item.avg_confidence || 0) * 100).toFixed(0)}% conf
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          {responseQuality && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{responseQuality.total_responses || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg Word Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(responseQuality.avg_word_count || 0).toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {(responseQuality.avg_paragraph_count || 0).toFixed(1)} paragraphs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Charts Mentioned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(responseQuality.avg_charts_mentioned || 0).toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">per response</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Content Depth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div>Remedies: {(responseQuality.avg_remedies_suggested || 0).toFixed(1)}</div>
                    <div>Yogas: {(responseQuality.avg_yogas_mentioned || 0).toFixed(1)}</div>
                    <div>Placements: {(responseQuality.avg_placements_mentioned || 0).toFixed(1)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Remedies Tab */}
        <TabsContent value="remedies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{remedies?.total_views || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Adoptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{remedies?.total_adoptions || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Adoption Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {remedies?.overall_adoption_rate
                    ? `${(remedies.overall_adoption_rate * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Remedy Views by Type</CardTitle>
              <CardDescription>Distribution of remedy recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={remedies?.by_type || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="remedy_type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#8884d8" name="Views" />
                  <Bar dataKey="adoptions" fill="#82ca9d" name="Adoptions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Chart Mentions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{charts?.total_mentions || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart Mentions Distribution</CardTitle>
              <CardDescription>Frequency of divisional chart usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={charts?.by_chart || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="chart_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mentions" fill="#8884d8" name="Mentions" />
                  <Bar dataKey="unique_sessions" fill="#82ca9d" name="Unique Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart Usage Details</CardTitle>
              <CardDescription>Detailed breakdown of chart mentions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {charts?.by_chart?.map((chart) => (
                  <div key={chart.chart_name} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-semibold">{chart.chart_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Primary intents: {chart.primary_intents?.join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{chart.mentions} mentions</p>
                      <p className="text-sm text-muted-foreground">{chart.unique_sessions} sessions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
