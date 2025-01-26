import { ReactNode, useState, useEffect } from 'react';
import { Plus, Swords } from 'lucide-react';

// Import images
import soccerImage from '../images/soccer.png';
import footballImage from '../images/football.png';
import basketballImage from '../images/basketball.png';
import tennisImage from '../images/tennis.png';
import f1Image from '../images/f1.png';
import mmaImage from '../images/mma.png';

// Types and Interfaces
interface ScoreState {
  team1: number;
  team2: number;
  time: number;
}

interface CommentaryState {
  score: ScoreState;
  commentary: string[];
  currentQuestion: QuestionType | null;
}

interface QuestionType {
  text: string;
  options: string[];
  impacts: Record<string, string[]>;
}

interface SportData {
  questions: QuestionType[];
  commentary: string[];
}

interface SportDataMap {
  [key: string]: SportData;
}

// Sport specific constants
type SportTimings = {
  [K in typeof sports[number]['id']]: number;
};

const SPORT_TIMINGS: SportTimings = {
  'football': 90 * 60,
  'american-football': 60 * 60,
  'basketball': 48 * 60,
  'tennis': 180 * 60,
  'f1': 120 * 60,
  'mma': 15 * 60
};

// Score systems
interface ScoreSystem {
  pointsPerSuccess: number;
  format: (score: ScoreState) => string;
}

const SCORE_SYSTEMS: Record<typeof sports[number]['id'], ScoreSystem> = {
  'football': {
    pointsPerSuccess: 1,
    format: (score) => `${score.team1} - ${score.team2}`
  },
  'american-football': {
    pointsPerSuccess: 7,
    format: (score) => `${score.team1} - ${score.team2}`
  },
  'basketball': {
    pointsPerSuccess: 2,
    format: (score) => `${score.team1} - ${score.team2}`
  },
  'tennis': {
    pointsPerSuccess: 1,
    format: (score) => `${score.team1} sets - ${score.team2} sets`
  },
  'f1': {
    pointsPerSuccess: 1,
    format: (score) => `P${score.team1}`
  },
  'mma': {
    pointsPerSuccess: 1,
    format: (score) => score.team1 > 0 ? 'WIN' : `ROUND ${Math.floor(score.time / 300) + 1}`
  }
};

interface OpenAIResponse {
  data: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
}

const API_URL = "https://us-central1-witb-bot.cloudfunctions.net/function-1";

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Origin': window.location.origin
        }
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries reached');
};

const generateCommentary = async (sportId: string, gameState: string): Promise<string> => {
  try {
    const response = await fetchWithRetry(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        prompt: `Generate a brief, exciting commentary line for a ${sportId} match. Current state: ${gameState}`,
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Commentary generation failed:', error);
    return generateFallbackCommentary(sportId);
  }
};

const generateQuestion = async (sportId: string): Promise<QuestionType> => {
  try {
    const response = await fetchWithRetry(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        prompt: `Generate a game decision question for ${sportId} with 3 options and potential outcomes. Format as JSON: {"text": "question", "options": ["option1", "option2", "option3"], "impacts": {"option1": ["positive outcome", "negative outcome", "neutral outcome"], ...}}`
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Question generation failed:', error);
    return generateFallbackQuestion(sportId);
  }
};

const generateFallbackCommentary = (sportId: string): string => {
  const commentaries = {
    'football': [
      "The tension is mounting!",
      "What an incredible display of skill!",
      "The crowd is on their feet!"
    ],
    'basketball': [
      "Amazing ball movement!",
      "The defense is locked in!",
      "What a spectacular play!"
    ],
    // Add more sport-specific commentaries as needed
  };

  const sportCommentaries = commentaries[sportId as keyof typeof commentaries] || commentaries.football;
  return sportCommentaries[Math.floor(Math.random() * sportCommentaries.length)];
};

const generateFallbackQuestion = (sportId: string): QuestionType => {
  return {
    text: "What's your next strategic move?",
    options: ["Play it safe", "Take a risk", "Hold position"],
    impacts: {
      "Play it safe": ["Maintained control", "Missed opportunity", "No significant change"],
      "Take a risk": ["Brilliant success!", "Complete failure", "Mixed results"],
      "Hold position": ["Solid defense", "Lost initiative", "Status quo maintained"]
    }
  };
};

const sports = [
  { id: 'football', emoji: '⚽', name: 'Football', image: soccerImage },
  { id: 'american-football', emoji: '🏈', name: 'American Football', image: footballImage },
  { id: 'basketball', emoji: '🏀', name: 'Basketball', image: basketballImage },
  { id: 'tennis', emoji: '🎾', name: 'Tennis', image: tennisImage },
  { id: 'f1', emoji: '🏎️', name: 'Formula 1', image: f1Image },
  { id: 'mma', emoji: '🥊', name: 'MMA', image: mmaImage }
];

interface NavigationTabsProps {
  children?: ReactNode;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ children }) => {
  const [selectedSport, setSelectedSport] = useState(sports[0].id);
  const [isMatchActive, setIsMatchActive] = useState(false);

  const handleFight = () => {
    setIsMatchActive(prev => !prev);
  };

  const renderArena = () => (
    <div className="center-area">
      <div className="center-content">
        <h2 className="center-title">
          🐳 WHALE IN THE BOX ARENA
        </h2>
        
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <button className="mint-button w-full flex flex-col items-center py-4 px-6 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪙</span>
              <span className="font-bold">MINT</span>
            </div>
            <span className="text-sm opacity-90">0.05 SOL for 3 NFTs</span>
          </button>
        </div>
  
        <div className="players-section">
          <p className="section-label">🏃‍♂️ Select Your Team (5 Players)</p>
          <div className="player-slots">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="player-slot">
                <Plus className="plus-icon" />
              </div>
            ))}
          </div>
        </div>
  
        <div className="stadium-section">
          <p className="section-label">🏟️ Choose Your Stadium</p>
          <div className="stadium-slot">
            <Plus className="plus-icon" />
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="fight-button"
            onClick={handleFight}
          >
            <Swords className="fight-icon" />
            {isMatchActive ? 'MATCH IN PROGRESS' : 'FIGHT!'}
          </button>
        </div>
  
        <div className="sport-selection-container">
          <p className="section-label text-gray-600">Choose your Sport:</p>
          <div className="flex justify-center gap-4 my-4">
            <div className="sport-buttons-wrapper flex gap-4">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`sport-button ${selectedSport === sport.id ? 'sport-button-active' : ''}`}
                  disabled={isMatchActive}
                >
                  <span>{sport.emoji}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="sport-image-container relative" style={{ minHeight: '300px' }}>
            <img
              src={sports.find(s => s.id === selectedSport)?.image}
              alt={`${selectedSport} arena`}
              className="sport-image absolute inset-0 w-full h-full object-cover"
            />
            <CommentaryOverlay 
              selectedSport={selectedSport} 
              isMatchActive={isMatchActive}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="board-wrapper">
      <div className="board-container">
        <div className="board-view">
          {renderArena()}
          {children}
        </div>
      </div>
    </div>
  );
};

const CommentaryOverlay = ({ selectedSport, isMatchActive }: { selectedSport: string; isMatchActive: boolean }) => {
  const [state, setState] = useState<CommentaryState>({
    score: { team1: 0, team2: 0, time: 0 },
    commentary: [],
    currentQuestion: null
  });
  
  const [questionTimer, setQuestionTimer] = useState(5);
  const [lastAnswer, setLastAnswer] = useState<{
    type: 'positive' | 'negative' | 'neutral' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleAnswer = (answer: string) => {
    if (!state.currentQuestion) return;

    const impact = state.currentQuestion.impacts[answer];
    const randomImpact = impact[Math.floor(Math.random() * impact.length)];
    const answerType = getAnswerType(randomImpact.toLowerCase());
    setLastAnswer({ type: answerType, message: randomImpact });

    setState(prev => ({
      ...prev,
      commentary: [randomImpact, ...prev.commentary],
      currentQuestion: null,
      score: {
        ...prev.score,
        team1: answerType === 'positive' 
          ? prev.score.team1 + SCORE_SYSTEMS[selectedSport as keyof typeof SCORE_SYSTEMS].pointsPerSuccess 
          : prev.score.team1
      }
    }));
  };

  useEffect(() => {
    let gameInterval: NodeJS.Timeout | null = null;
    let questionCountdown: NodeJS.Timeout | null = null;
  
    if (isMatchActive) {
      setState({
        score: { team1: 0, team2: 0, time: 0 },
        commentary: ["Match is starting!"],
        currentQuestion: null
      });
      
      gameInterval = setInterval(async () => {
        setState(prev => {
          const matchDuration = SPORT_TIMINGS[selectedSport as keyof typeof SPORT_TIMINGS];
          if (prev.score.time >= matchDuration) {
            if (gameInterval) clearInterval(gameInterval);
            return prev;
          }
  
          const newScore = { ...prev.score, time: prev.score.time + 1 };
          const newState = { ...prev, score: newScore };
  
          if (Math.random() < 0.4) {
            generateCommentary(selectedSport, formatTime(newScore.time))
              .then(commentary => {
                setState(s => ({
                  ...s,
                  commentary: [commentary, ...s.commentary.slice(0, 4)]
                }));
              });
          }
  
          if (!newState.currentQuestion && Math.random() < 0.2) {
            generateQuestion(selectedSport)
              .then(question => {
                setState(s => ({ ...s, currentQuestion: question }));
                setQuestionTimer(5);
                
                if (questionCountdown) clearInterval(questionCountdown);
                questionCountdown = setInterval(() => {
                  setQuestionTimer(prevTimer => {
                    if (prevTimer <= 1) {
                      if (questionCountdown) clearInterval(questionCountdown);
                      setState(s => ({
                        ...s,
                        currentQuestion: null,
                        commentary: ["Time's up! Opportunity missed...", ...s.commentary]
                      }));
                      setLastAnswer({ type: 'negative', message: "Time's up!" });
                      return 5;
                    }
                    return prevTimer - 1;
                  });
                }, 1000);
              });
          }
  
          return newState;
        });
      }, 1000);
    }
  
    return () => {
      if (gameInterval) clearInterval(gameInterval);
      if (questionCountdown) clearInterval(questionCountdown);
    };
  }, [isMatchActive, selectedSport]);

  const formatTime = (seconds: number): string => {
    switch (selectedSport) {
      case 'football':
      case 'american-football':
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      
      case 'tennis':
        const sets = Math.floor(state.score.team1 + state.score.team2);
        return `Set ${sets + 1}`;
      
      case 'f1':
        const laps = Math.floor((seconds / SPORT_TIMINGS.f1) * 50);
        return `Lap ${Math.min(laps, 50)}/50`;
      
      case 'mma':
        const round = Math.floor(seconds / 300) + 1;
        const roundSeconds = seconds % 300;
        const roundMinutes = Math.floor(roundSeconds / 60);
        const remainingSecs = roundSeconds % 60;
        return `R${round} ${roundMinutes}:${remainingSecs.toString().padStart(2, '0')}`;
      
      default:
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
  };

  if (!isMatchActive) return null;

  return (
    <div className="commentary-overlay">
      <div className="flex flex-col h-full w-full">
        <div className="commentary-header">
          {formatTime(state.score.time)} | {SCORE_SYSTEMS[selectedSport as keyof typeof SCORE_SYSTEMS].format(state.score)}
        </div>

        {state.currentQuestion && (
          <div className="question-container">
            <div className="flex justify-between items-center mb-2">
              <p className="question-text">
                {state.currentQuestion.text}
              </p>
              <span className="countdown-timer">
                {questionTimer}s
              </span>
            </div>
            <div className="options-container">
              {state.currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  className="option-button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {lastAnswer.type && !state.currentQuestion && (
          <div className={`answer-feedback ${lastAnswer.type}`}>
            {lastAnswer.message}
          </div>
        )}

        <div className="commentary-list custom-scrollbar">
          {state.commentary.map((comment, i) => (
            <div key={i} className="commentary-item">
              {comment}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// Helper functions
const getAnswerType = (impact: string): 'positive' | 'negative' | 'neutral' => {
  if (impact.includes("goal!") || impact.includes("threeeee") || 
      impact.includes("perfect") || impact.includes("great") ||
      impact.includes("ace") || impact.includes("touchdown")) {
    return 'positive';
  }
  if (impact.includes("miss") || impact.includes("blocked") || 
      impact.includes("loses") || impact.includes("fails") ||
      impact.includes("fault")) {
    return 'negative';
  }
  return 'neutral';
};

const getEndGameMessage = (sport: string, score: { team1: number; team2: number }): string => {
  switch (sport) {
    case 'tennis':
      return `Match complete! Final score: ${score.team1} sets to ${score.team2}`;
    case 'f1':
      return `Race complete! Finished P${score.team1}`;
    case 'mma':
      return score.team1 > 0 ? "Winner by TKO/KO!" : "Fight goes to decision!";
    default:
      return `Full time! Final score: ${score.team1} - ${score.team2}`;
  }
};

export default NavigationTabs;