import React from 'react';
import { Trophy, Timer, MapPin, Calendar, ThermometerSun, Users, TrendingUp, Activity } from 'lucide-react';
import { SportDataType } from './EventDetailsPopup';

interface SportDetailsProps {
    sportData: SportDataType;
    TeamScore: React.FC<{ score?: number }>;
    StatsCard: React.FC<{ 
        icon: React.FC<any>;
        label: string;
        value: string | number;
    }>;
    BettingChart: React.FC;
}

interface ActivityItem {
    type: 'hunt' | 'fish';
    amount: number;
    timestamp: string;
}

const RecentActivity: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => (
    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
        <h3 className="text-white/90 font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.map((activity, i) => (
                <div 
                    key={i} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                        activity.type === 'hunt' 
                            ? 'bg-emerald-500/10 border border-emerald-500/20' 
                            : 'bg-rose-500/10 border border-rose-500/20'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">
                            {activity.type === 'hunt' ? '🎯' : '🎣'}
                        </span>
                        <span className={`font-medium ${
                            activity.type === 'hunt' 
                                ? 'text-emerald-400' 
                                : 'text-rose-400'
                        }`}>
                            {activity.amount} ETH
                        </span>
                    </div>
                    <span className="text-white/60 text-sm">
                        {new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            ))}
        </div>
    </div>
);




export const SoccerDetails: React.FC<SportDetailsProps> = ({ 
    sportData, 
    TeamScore, 
    StatsCard, 
    BettingChart 
}) => (
    <div className="space-y-4">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="grid grid-cols-3 items-center">
                <div className="text-center">
                    <p className="text-white font-bold mb-3 text-xl">{sportData.home_team}</p>
                    <TeamScore score={sportData.home_score} />
                </div>
                <div className="text-center">
                    <div className="px-4 py-2 bg-white/10 rounded-full">
                        <span className="text-white/80 font-bold">VS</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-white font-bold mb-3 text-xl">{sportData.away_team}</p>
                    <TeamScore score={sportData.away_score} />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <StatsCard 
                icon={MapPin} 
                label="Venue" 
                value={sportData.venue || 'TBA'} 
            />
            <StatsCard 
                icon={Users} 
                label="Unique Bettors" 
                value={sportData.uniqueBettors || 0} 
            />
            <StatsCard 
                icon={TrendingUp} 
                label="Avg Bet Size" 
                value={`${sportData.averageBetSize || 0} ETH`} 
            />
            <StatsCard 
                icon={Activity} 
                label="Total Bets" 
                value={sportData.totalBets || 0} 
            />
        </div>

        <BettingChart />

        <RecentActivity activities={sportData.recentActivity || []} />
    </div>
);

export const F1Details: React.FC<SportDetailsProps> = ({ 
    sportData, 
    StatsCard, 
    BettingChart 
}) => (
    <div className="space-y-4">
        {sportData.circuit && (
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                <div className="grid gap-6">
                    <div>
                        <h3 className="text-white/60 text-sm mb-2">Circuit</h3>
                        <p className="text-white font-bold text-xl">{sportData.circuit.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-white/60 text-sm">Track Length</p>
                            <p className="text-white font-bold">{sportData.circuit.length} km</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">Race Distance</p>
                            <p className="text-white font-bold">{sportData.circuit.laps} laps</p>
                        </div>
                        {sportData.circuit.lap_record && (
                            <div className="col-span-2">
                                <p className="text-white/60 text-sm">Lap Record</p>
                                <p className="text-white font-bold">{sportData.circuit.lap_record}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <StatsCard 
                icon={MapPin} 
                label="Location" 
                value={`${sportData.location_details?.city}, ${sportData.location_details?.country}`} 
            />
            <StatsCard 
                icon={Calendar} 
                label="Season" 
                value={`${sportData.season} - Round ${sportData.round}`} 
            />
            {sportData.weather && (
                <>
                    <StatsCard 
                        icon={ThermometerSun} 
                        label="Temperature" 
                        value={`${sportData.weather.temperature}°C`} 
                    />
                    <StatsCard 
                        icon={Timer} 
                        label="Weather" 
                        value={sportData.weather.description || 'N/A'} 
                    />
                </>
            )}
        </div>

        {sportData.sprint && (
            <div className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/30">
                <div className="flex items-center gap-3">
                    <Trophy className="text-yellow-400" size={24} />
                    <span className="text-yellow-400 font-bold">Sprint Race Weekend</span>
                </div>
            </div>
        )}

        <BettingChart />
    </div>
);

export const MMADetails: React.FC<SportDetailsProps> = ({ 
    sportData, 
    StatsCard, 
    BettingChart 
}) => (
    <div className="space-y-4">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="grid grid-cols-3 items-center gap-6">
                <div className="text-center">
                    <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">Fighter 1</p>
                        <p className="text-white font-bold text-xl">{sportData.fighter1}</p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="px-4 py-2 bg-white/10 rounded-full">
                        <span className="text-white/80 font-bold">VS</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">Fighter 2</p>
                        <p className="text-white font-bold text-xl">{sportData.fighter2}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <StatsCard 
                icon={Trophy} 
                label="Weight Class" 
                value={sportData.weight_class || 'N/A'} 
            />
            <StatsCard 
                icon={Timer} 
                label="Rounds" 
                value={`${sportData.rounds} Rounds`} 
            />
            <StatsCard 
                icon={MapPin} 
                label="Venue" 
                value={sportData.venue || 'TBA'} 
            />
            {sportData.method && (
                <StatsCard 
                    icon={Activity} 
                    label="Method" 
                    value={sportData.method} 
                />
            )}
        </div>

        {sportData.is_main && (
            <div className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/30">
                <div className="flex items-center gap-3">
                    <Trophy className="text-yellow-400" size={24} />
                    <span className="text-yellow-400 font-bold">Main Event</span>
                </div>
            </div>
        )}

        <BettingChart />
    </div>
);

export const NFLDetails: React.FC<SportDetailsProps> = ({ 
    sportData, 
    TeamScore, 
    StatsCard, 
    BettingChart 
}) => (
    <div className="space-y-4">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <div className="grid grid-cols-3 items-center">
                <div className="text-center">
                    <p className="text-white font-bold mb-3 text-xl">{sportData.home_team}</p>
                    <TeamScore score={sportData.home_score} />
                </div>
                <div className="text-center">
                    <div className="px-4 py-2 bg-white/10 rounded-full">
                        <span className="text-white/80 font-bold">VS</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-white font-bold mb-3 text-xl">{sportData.away_team}</p>
                    <TeamScore score={sportData.away_score} />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {sportData.week && sportData.season && (
                <StatsCard 
                    icon={Calendar} 
                    label="Week" 
                    value={`Week ${sportData.week}, ${sportData.season}`} 
                />
            )}
            {sportData.venue && (
                <StatsCard 
                    icon={MapPin} 
                    label="Venue" 
                    value={sportData.venue} 
                />
            )}
            <StatsCard 
                icon={Users} 
                label="Unique Bettors" 
                value={sportData.uniqueBettors || 0} 
            />
            <StatsCard 
                icon={TrendingUp} 
                label="Largest Bet" 
                value={`${sportData.largestBet || 0} ETH`} 
            />
        </div>

        <BettingChart />

        {/* Recent Betting Activity */}
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <h3 className="text-white/90 font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {/* ... même code que pour Soccer */}
            </div>
        </div>

        {/* Betting Stats Summary */}
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-white/60 text-sm mb-1">Total Betting Volume</p>
                    <p className="text-white font-bold text-xl">
                        {((sportData.uniqueBettors || 0) * (sportData.averageBetSize || 0)).toFixed(2)} ETH
                    </p>
                </div>
                <div>
                    <p className="text-white/60 text-sm mb-1">Average Bet Size</p>
                    <p className="text-white font-bold text-xl">
                        {(sportData.averageBetSize || 0).toFixed(2)} ETH
                    </p>
                </div>
            </div>
        </div>
    </div>
);