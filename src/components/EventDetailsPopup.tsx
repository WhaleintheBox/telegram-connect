import React from 'react';

interface SportDataType {
    tournament?: string;
    status?: string;
    formattedStatus?: string;  // Ajouté ici
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
}

interface BoxType {
    sportId?: string;
    sportData?: SportDataType;
}

const EventDetailsPopup: React.FC<{ box: BoxType }> = ({ box }) => {
    const sportId = (box.sportId || '').toLowerCase();
    const sportData = box.sportData || {};

    const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) return '';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateStr));
    };

    const TeamScore = ({ score }: { score?: number }) => {
        if (score === undefined) return null;
        return <p className="text-2xl font-bold text-white">{score}</p>;
    };

    const SoccerDetails = () => (
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                        <p className="text-white font-bold mb-2">{sportData.home_team}</p>
                        <TeamScore score={sportData.home_score} />
                    </div>
                    <div className="px-4">
                        <span className="text-white/50 font-bold">VS</span>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-white font-bold mb-2">{sportData.away_team}</p>
                        <TeamScore score={sportData.away_score} />
                    </div>
                </div>
            </div>

            {sportData.venue && (
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-gray-400 text-sm">Venue</p>
                    <p className="text-white font-medium">{sportData.venue}</p>
                </div>
            )}
        </div>
    );

    const F1Details = () => (
        <div className="space-y-4">
            {sportData.circuit && (
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <p className="text-gray-400 text-sm">Circuit</p>
                            <p className="text-white font-medium">{sportData.circuit.name}</p>
                        </div>
                        {sportData.location_details && (
                            <div className="col-span-2">
                                <p className="text-gray-400 text-sm">Location</p>
                                <p className="text-white font-medium">
                                    {sportData.location_details.city}, {sportData.location_details.country}
                                </p>
                            </div>
                        )}
                        {sportData.circuit.length && (
                            <div>
                                <p className="text-gray-400 text-sm">Track Length</p>
                                <p className="text-white font-medium">{sportData.circuit.length} km</p>
                            </div>
                        )}
                        {sportData.circuit.laps && (
                            <div>
                                <p className="text-gray-400 text-sm">Race Distance</p>
                                <p className="text-white font-medium">{sportData.circuit.laps} laps</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                    {sportData.season && (
                        <div>
                            <p className="text-gray-400 text-sm">Season</p>
                            <p className="text-white font-medium">{sportData.season}</p>
                        </div>
                    )}
                    {sportData.round && (
                        <div>
                            <p className="text-gray-400 text-sm">Round</p>
                            <p className="text-white font-medium">{sportData.round}</p>
                        </div>
                    )}
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

    const MMADetails = () => (
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 text-center">
                        <p className="text-gray-400 text-sm mb-1">Fighter 1</p>
                        <p className="text-white font-bold text-lg">{sportData.fighter1}</p>
                    </div>
                    <div className="col-span-2 text-center my-2">
                        <span className="text-white/50 font-bold">VS</span>
                    </div>
                    <div className="col-span-2 text-center">
                        <p className="text-gray-400 text-sm mb-1">Fighter 2</p>
                        <p className="text-white font-bold text-lg">{sportData.fighter2}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                    {sportData.weight_class && (
                        <div>
                            <p className="text-gray-400 text-sm">Weight Class</p>
                            <p className="text-white font-medium">{sportData.weight_class}</p>
                        </div>
                    )}
                    {sportData.rounds && (
                        <div>
                            <p className="text-gray-400 text-sm">Rounds</p>
                            <p className="text-white font-medium">{sportData.rounds} Rounds</p>
                        </div>
                    )}
                    {sportData.venue && (
                        <div className="col-span-2">
                            <p className="text-gray-400 text-sm">Venue</p>
                            <p className="text-white font-medium">{sportData.venue}</p>
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

    const NFLDetails = () => (
        <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                        <p className="text-white font-bold mb-2">{sportData.home_team}</p>
                        <TeamScore score={sportData.home_score} />
                    </div>
                    <div className="px-4">
                        <span className="text-white/50 font-bold">VS</span>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-white font-bold mb-2">{sportData.away_team}</p>
                        <TeamScore score={sportData.away_score} />
                    </div>
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                    {sportData.week && sportData.season && (
                        <div className="col-span-2">
                            <p className="text-gray-400 text-sm">Week</p>
                            <p className="text-white font-medium">Week {sportData.week}, {sportData.season} Season</p>
                        </div>
                    )}
                    {sportData.venue && (
                        <div className="col-span-2">
                            <p className="text-gray-400 text-sm">Venue</p>
                            <p className="text-white font-medium">{sportData.venue}</p>
                        </div>
                    )}
                    {sportData.location && (
                        <div className="col-span-2">
                            <p className="text-gray-400 text-sm">Location</p>
                            <p className="text-white font-medium">{sportData.location}</p>
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
                            {sportData.tournament || 'Event Details'}
                        </h2>
                        {sportData.status && (
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                {sportData.status}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm">
                        {formatDate(sportData.scheduled)}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {sportId === 'soccer' && <SoccerDetails />}
                    {sportId === 'f1' && <F1Details />}
                    {sportId === 'mma' && <MMADetails />}
                    {sportId === 'nfl' && <NFLDetails />}
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPopup;