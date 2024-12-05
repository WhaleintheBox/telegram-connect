import React from 'react';

interface SportDataType {
  tournament?: string;
  scheduled?: string;
  venue?: string;
  home_team?: string;
  away_team?: string;
  fighter1?: string;
  fighter2?: string;
  season?: string;
  weather?: {
    temperature?: number;
    description?: string;
  };
  status?: string;
  formattedStatus?: string;
  location?: string;
  round?: string;
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
  sprint?: boolean;
  weight_class?: string;
  rounds?: number;
  is_main?: boolean;
  method?: string;
  home_score?: number;
  away_score?: number;
  week?: number | string;
}

interface BoxType {
  sportId?: string;
  sportData?: SportDataType;
}

interface EventDetailsPopupProps {
  box: BoxType;
}

const EventDetailsPopup: React.FC<EventDetailsPopupProps> = ({ box }) => {
    const sportId = (box.sportId || '').toLowerCase();
    const sportData = box.sportData || {};

    const getStatusColor = (status?: string): string => {
        if (!status) return 'bg-blue-500/20 text-blue-400';
        const s = status.toLowerCase();
        if (s.includes('live')) return 'bg-green-500/20 text-green-400';
        if (s.includes('ended') || s.includes('finished')) return 'bg-red-500/20 text-red-400';
        if (s.includes('cancelled')) return 'bg-red-500/20 text-red-400 animate-pulse';
        return 'bg-blue-500/20 text-blue-400';
    };

    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
    };

    const TeamScore: React.FC<{ score?: number }> = ({ score }) => {
        if (score === undefined) return null;
        return <p className="text-2xl font-bold text-white">{score}</p>;
    };

    const SoccerDetails: React.FC = () => (
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Match Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <p className="text-gray-400 text-sm">Competition</p>
                        <p className="text-white font-medium">{sportData.tournament}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Stadium</p>
                        <p className="text-white font-medium">{sportData.venue || 'TBA'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                        <p className="text-gray-400 text-sm mb-1">Home</p>
                        <p className="text-white font-bold mb-2">{sportData.home_team}</p>
                        <TeamScore score={sportData.home_score} />
                    </div>
                    <div className="px-4">
                        <span className="text-white/50 font-bold">VS</span>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-gray-400 text-sm mb-1">Away</p>
                        <p className="text-white font-bold mb-2">{sportData.away_team}</p>
                        <TeamScore score={sportData.away_score} />
                    </div>
                </div>
            </div>
        </div>
    );

    const BasketballDetails: React.FC = () => (
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Game Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <p className="text-gray-400 text-sm">League</p>
                        <p className="text-white font-medium">{sportData.tournament}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Arena</p>
                        <p className="text-white font-medium">{sportData.venue || 'TBA'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                        <p className="text-gray-400 text-sm mb-1">Home</p>
                        <p className="text-white font-bold mb-2">{sportData.home_team}</p>
                        <TeamScore score={sportData.home_score} />
                    </div>
                    <div className="px-4">
                        <span className="text-white/50 font-bold">VS</span>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-gray-400 text-sm mb-1">Away</p>
                        <p className="text-white font-bold mb-2">{sportData.away_team}</p>
                        <TeamScore score={sportData.away_score} />
                    </div>
                </div>
            </div>
        </div>
    );

    const NFLDetails: React.FC = () => (
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Game Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <p className="text-gray-400 text-sm">Week</p>
                        <p className="text-white font-medium">Week {sportData.week}, {sportData.season} Season</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Stadium</p>
                        <p className="text-white font-medium">{sportData.venue || 'TBA'}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Location</p>
                        <p className="text-white font-medium">{sportData.location}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                        <p className="text-gray-400 text-sm mb-1">Home</p>
                        <p className="text-white font-bold mb-2">{sportData.home_team}</p>
                        <TeamScore score={sportData.home_score} />
                    </div>
                    <div className="px-4">
                        <span className="text-white/50 font-bold">VS</span>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-gray-400 text-sm mb-1">Away</p>
                        <p className="text-white font-bold mb-2">{sportData.away_team}</p>
                        <TeamScore score={sportData.away_score} />
                    </div>
                </div>
            </div>
        </div>
    );

    const F1Details: React.FC = () => (
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Circuit Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-400 text-sm">Circuit</p>
                        <p className="text-white font-medium">{sportData.circuit?.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Location</p>
                        <p className="text-white font-medium">
                            {sportData.location_details?.city}, {sportData.location_details?.country}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Track Length</p>
                        <p className="text-white font-medium">{sportData.circuit?.length} km</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Race Distance</p>
                        <p className="text-white font-medium">{sportData.circuit?.laps} laps</p>
                    </div>
                    {sportData.circuit?.lap_record && (
                        <div className="col-span-2">
                            <p className="text-gray-400 text-sm">Lap Record</p>
                            <p className="text-white font-medium">{sportData.circuit?.lap_record}</p>
                        </div>
                    )}
                    {sportData.weather && (
                        <div className="col-span-2 bg-white/5 p-3 rounded-lg">
                            <p className="text-gray-400 text-sm">Weather Conditions</p>
                            <p className="text-white font-medium">
                                {sportData.weather.temperature}°C • {sportData.weather.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Event Info</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-400 text-sm">Season</p>
                        <p className="text-white font-medium">{sportData.season} Championship</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Round</p>
                        <p className="text-white font-medium">Round {sportData.round}</p>
                    </div>
                    {sportData.sprint && (
                        <div className="col-span-2">
                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                                Sprint Race Weekend
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const MMADetails: React.FC = () => (
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Fight Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <p className="text-gray-400 text-sm">Fighter 1</p>
                        <p className="text-white font-medium text-lg">{sportData.fighter1}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-400 text-sm">Fighter 2</p>
                        <p className="text-white font-medium text-lg">{sportData.fighter2}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Fight Info</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-400 text-sm">Weight Class</p>
                        <p className="text-white font-medium">{sportData.weight_class}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Rounds</p>
                        <p className="text-white font-medium">{sportData.rounds} Rounds</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-400 text-sm">Venue</p>
                        <p className="text-white font-medium">{sportData.venue}</p>
                    </div>
                    {sportData.method && (
                        <div className="col-span-2">
                            <p className="text-gray-400 text-sm">Method of Victory</p>
                            <p className="text-white font-medium">{sportData.method}</p>
                        </div>
                    )}
                    {sportData.is_main && (
                        <div className="col-span-2">
                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                                Main Event
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-md p-4 rounded-lg overflow-y-auto">
            <div className="h-full flex flex-col">
                <div className="border-b border-white/10 pb-3 mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-white font-bold text-lg">
                            {sportData.tournament}
                        </h2>
                        {sportData.status && (
                            <span className={`${getStatusColor(sportData.status)} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center`}>
                                {sportData.status?.toLowerCase() === 'live' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                                )}
                                {sportData.formattedStatus || sportData.status}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm">
                        {formatDate(sportData.scheduled)}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {sportId === 'f1' && <F1Details />}
                    {sportId === 'mma' && <MMADetails />}
                    {sportId === 'soccer' && <SoccerDetails />}
                    {sportId === 'basketball' && <BasketballDetails />}
                    {sportId === 'nfl' && <NFLDetails />}
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPopup;