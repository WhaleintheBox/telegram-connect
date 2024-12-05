import React from 'react';
import { LineChart, XAxis, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { SoccerDetails, F1Details, MMADetails, NFLDetails } from './SportDetails';

interface BettingHistory {
  timestamp: string;
  hunterTotal: number;
  fisherTotal: number;
}

export interface SportDataType {
    tournament?: string;
    status?: string;
    formattedStatus?: string;
    scheduled?: string;
    venue?: string;
    match_id?: string;
    // Teams (Soccer, NBA, NFL)
    home_team?: string;
    away_team?: string;
    home_score?: number;
    away_score?: number;
    // F1 specific
    circuit?: {
        name?: string;
        length?: string;
        laps?: number;
        lap_record?: string;
    };
    location_details?: {
        city?: string;
        country?: string;
    };
    season?: string;
    round?: string;
    sprint?: boolean;
    weather?: {
        temperature?: number;
        description?: string;
    };
    // MMA specific
    fighter1?: string;
    fighter2?: string;
    weight_class?: string;
    rounds?: number;
    is_main?: boolean;
    method?: string;
    // NFL specific
    week?: number | string;
    location?: string;
    bettingHistory?: BettingHistory[];
    totalBets?: number;
    uniqueBettors?: number;
    averageBetSize?: number;
    largestBet?: number;
    recentActivity?: Array<{
        type: 'hunt' | 'fish';
        amount: number;
        timestamp: string;
    }>;
}

interface BoxType {
    sportId?: string;
    sportData?: SportDataType;
}

const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    }).format(new Date(dateStr));
};

const mockBettingHistory = (hours: number) => {
    const data = [];
    const now = new Date();
    for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
        data.push({
            timestamp: time.toISOString(),
            hunterTotal: Math.floor(Math.random() * 50 + 50 + (hours - i) * 2),
            fisherTotal: Math.floor(Math.random() * 40 + 30 + (hours - i) * 1.5)
        });
    }
    return data;
};

const EventDetailsPopup: React.FC<{ box: BoxType }> = ({ box }) => {
    const sportId = (box.sportId || '').toLowerCase();
    const sportData = box.sportData || {};
    const bettingHistory = mockBettingHistory(24);

    // Shared Components
    const TeamScore = ({ score }: { score?: number }) => {
        if (score === undefined) return null;
        return <p className="text-3xl font-bold text-white">{score}</p>;
    };

    const StatsCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="text-white/60" size={18} />
                <span className="text-white/60 text-sm">{label}</span>
            </div>
            <div className="text-white font-bold text-xl">{value}</div>
        </div>
    );

    const BettingChart = () => (
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <h3 className="text-white/90 font-semibold mb-4">Betting Trends</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bettingHistory}>
                        <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(timestamp) => new Date(timestamp).getHours() + 'h'}
                            stroke="#ffffff40"
                        />
                        <YAxis stroke="#ffffff40" />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px'
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="hunterTotal" 
                            stroke="#22c55e" 
                            strokeWidth={2}
                            name="Hunters"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="fisherTotal" 
                            stroke="#ec4899" 
                            strokeWidth={2}
                            name="Fishers"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="absolute inset-0 bg-gradient-to-b from-black/98 to-black/95 backdrop-blur-md p-6 rounded-lg overflow-y-auto">
            <div className="h-full flex flex-col max-w-4xl mx-auto">
                <div className="border-b border-white/10 pb-4 mb-6">
                    <div className="flex justify-between items-start mb-3">
                        <h2 className="text-white font-bold text-2xl">
                            {sportData.tournament || 'Event Details'}
                        </h2>
                        {sportData.status && (
                            <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium border border-emerald-500/30">
                                {sportData.status}
                            </span>
                        )}
                    </div>
                    <p className="text-white/60 text-base">
                        {formatDate(sportData.scheduled)}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pb-6">
                    {sportId === 'soccer' && (
                        <SoccerDetails 
                            sportData={sportData}
                            TeamScore={TeamScore}
                            StatsCard={StatsCard}
                            BettingChart={BettingChart}
                        />
                    )}
                    {sportId === 'f1' && (
                        <F1Details 
                            sportData={sportData}
                            TeamScore={TeamScore}
                            StatsCard={StatsCard}
                            BettingChart={BettingChart}
                        />
                    )}
                    {sportId === 'mma' && (
                        <MMADetails 
                            sportData={sportData}
                            TeamScore={TeamScore}
                            StatsCard={StatsCard}
                            BettingChart={BettingChart}
                        />
                    )}
                    {sportId === 'nfl' && (
                        <NFLDetails 
                            sportData={sportData}
                            TeamScore={TeamScore}
                            StatsCard={StatsCard}
                            BettingChart={BettingChart}
                        />
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-white/60 text-sm">Last Updated</p>
                            <p className="text-white font-medium">
                                {new Date().toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-white/60 text-sm">Contract Address</p>
                            <p className="text-white font-medium truncate">
                                {box.sportId}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPopup;

