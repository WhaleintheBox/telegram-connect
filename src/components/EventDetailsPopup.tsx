import React from 'react';
import { LineChart, XAxis, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { SoccerDetails, F1Details, MMADetails, NFLDetails, BasketballDetails } from './SportDetails';
import { Status, useEventStatus } from '../App';  

interface BettingHistory {
timestamp: string;
hunterTotal: number;
fisherTotal: number;
}

export interface SportDataType {
    tournament?: string;
    status?: {  // Modifier le type de status
        long: string;
        short: string;
    };
    formattedStatus?: string;
    scheduled?: string;
    venue?: string;
    match_id?: string;
    // Teams (Soccer, NBA, NFL)
    home_team?: string;
    away_team?: string;
    home_score?: number;
    away_score?: number;
    scores?: {
        home?: { current: number; total: number };
        away?: { current: number; total: number };
    };
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
    const sportId = String(box.sportId || '').toLowerCase();
    const sportData = box.sportData || {};
    const bettingHistory = mockBettingHistory(24);

    // Utiliser useEventStatus au lieu de useMemo
    const status = useEventStatus(sportData);

    // StatusBadge component optimisé pour l'EventDetailsPopup
    const StatusBadge = ({ status }: { status: Status }) => {
        const getStatusStyle = () => {
            switch (status.short) {
                case 'IN':
                case 'PF':
                case 'WO':
                case 'EOR':
                case 'LIVE':
                    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                case 'FIN':
                case 'FT':
                case 'AET':
                case 'PEN':
                    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                case 'CANC':
                case 'PST':
                    return 'bg-red-500/20 text-red-400 border-red-500/30';
                case 'SCH':
                case 'NS':
                    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                default:
                    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            }
        };

        return (
            <span className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 border ${getStatusStyle()}`}>
                {status.short === 'LIVE' ? '🔴' : '⚪'} {status.long}
            </span>
        );
    };


    const TeamScore = ({ score }: { score?: number | { current: number; total: number } | null }) => {
        // Composant de rendu du score
        const ScoreDisplay = ({ displayValue }: { displayValue: string }) => (
            <div className="relative">
                <p className="text-4xl font-bold bg-gradient-to-b from-blue-300 to-blue-500 bg-clip-text text-transparent">
                    {displayValue}
                </p>
                <div className="absolute inset-0 backdrop-blur-sm -z-10" />
            </div>
        );
    
        // Si le score est null ou undefined, retourner un placeholder
        if (!score) {
            return <ScoreDisplay displayValue="0" />;
        }
        
        // Si le score est un nombre
        if (typeof score === 'number') {
            return <ScoreDisplay displayValue={score.toString()} />;
        }
        
        // Si le score est un objet, vérifier sa structure
        if (typeof score === 'object' && 'current' in score) {
            try {
                const displayScore = 'total' in score && score.total 
                    ? `${score.current}/${score.total}`
                    : score.current.toString();
                return <ScoreDisplay displayValue={displayScore} />;
            } catch (error) {
                console.error('Error formatting score:', error);
                return <ScoreDisplay displayValue="0" />;
            }
        }
        
        // Fallback par défaut pour tout autre cas
        return <ScoreDisplay displayValue="0" />;
    };
    

    const StatsCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
        <div className="bg-blue-900/20 backdrop-blur-sm p-4 rounded-xl border border-blue-500/20 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="text-blue-400" size={18} />
                <span className="text-blue-200 text-sm">{label}</span>
            </div>
            <div className="text-blue-100 font-bold text-xl">{value}</div>
        </div>
    );

    const BettingChart = () => (
        <div className="bg-blue-900/20 backdrop-blur-sm p-4 rounded-xl border border-blue-500/20">
            <h3 className="text-blue-100 font-semibold mb-4">Betting Trends</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bettingHistory}>
                        <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(timestamp) => new Date(timestamp).getHours() + 'h'}
                            stroke="rgba(147, 197, 253, 0.4)"
                        />
                        <YAxis stroke="rgba(147, 197, 253, 0.4)" />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(30, 58, 138, 0.9)',
                                border: '1px solid rgba(147, 197, 253, 0.2)',
                                borderRadius: '8px',
                                color: '#fff'
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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/95 to-blue-950/98 backdrop-blur-md p-6 rounded-lg overflow-y-auto">
            <div className="h-full flex flex-col max-w-4xl mx-auto">
                <div className="border-b border-blue-500/20 pb-4 mb-6">
                    <div className="flex justify-between items-start mb-3">
                        <h2 className="text-blue-100 font-bold text-2xl">
                            {sportData.tournament || 'Event Details'}
                        </h2>
                        <StatusBadge status={status} />
                    </div>
                    <p className="text-blue-200/80 text-base">
                        {formatDate(sportData.scheduled)}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pb-6 custom-scrollbar">
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
                    {sportId === 'basketball' && (
                        <BasketballDetails 
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

                <div className="mt-4 pt-4 border-t border-blue-500/20">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-blue-200/60 text-sm">Last Updated</p>
                            <p className="text-blue-100 font-medium">
                                {new Date().toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-blue-200/60 text-sm">Contract Address</p>
                            <p className="text-blue-100 font-medium truncate">
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

