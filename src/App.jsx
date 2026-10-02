import React, { useMemo, useState } from 'react';
import { Users, MonitorPlay, CheckCircle2, Trophy, UserPlus, Trash2 } from 'lucide-react';

const MAX_CANDIDATES = 50;

const CATEGORIES = [
  {
    name: 'Poise & Bearing',
    description: 'Evaluate posture, elegance, and natural confidence on stage.'
  },
  {
    name: 'Stage Presence',
    description: 'Assess charisma, audience connection, and overall energy.'
  },
  {
    name: 'Q&A',
    description: 'Judge clarity of thought, relevance to the topic, and articulation.'
  }
];
const THEMES = ['Casual Wear', 'Formal Wear', 'Talent Portion'];

const getOrdinalSuffix = (value) => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = value % 100;
  const suffix = suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
  return `${value}${suffix}`;
};

export default function App() {
  const [role, setRole] = useState('admin');
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [scores, setScores] = useState({});
  const [currentScores, setCurrentScores] = useState({ 0: 5, 1: 5, 2: 5 });
  const [currentComment, setCurrentComment] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateImage, setNewCandidateImage] = useState('');

  const activeCandidate = candidates.find(c => c.id === activeCandidateId);

  const latestComment = useMemo(() => {
    if (!activeCandidateId) return '';
    const submissionKey = `${activeCandidateId}-${currentTheme}`;
    const submission = scores[submissionKey];

    if (!submission) return '';

    if (typeof submission === 'object' && submission !== null) {
      return submission.comment || '';
    }

    return '';
  }, [activeCandidateId, currentTheme, scores]);

  const rankedCandidates = useMemo(() => {
    const totals = {};

    Object.entries(scores).forEach(([key, candidateScores]) => {
      const [candidateId] = key.split('-');
      const parsedId = Number(candidateId);

      if (!Number.isFinite(parsedId)) return;

      const submission = candidateScores && typeof candidateScores === 'object' && 'scores' in candidateScores
        ? candidateScores.scores
        : candidateScores;

      const total = Object.values(submission || {}).reduce((sum, score) => sum + (Number(score) || 0), 0);
      totals[parsedId] = (totals[parsedId] || 0) + total;
    });

    return candidates.map((candidate) => ({
      ...candidate,
      total: totals[candidate.id] || 0
    }))
      .sort((a, b) => b.total - a.total || a.id - b.id)
      .map((candidate, index) => ({
        ...candidate,
        rank: index + 1
      }));
  }, [candidates, scores]);

  const handleAddCandidate = () => {
    const trimmedName = newCandidateName.trim();
    const trimmedImage = newCandidateImage.trim();

    if (!trimmedName || candidates.length >= MAX_CANDIDATES) return;

    const newCandidate = {
      id: candidates.length ? Math.max(...candidates.map(candidate => candidate.id)) + 1 : 1,
      name: trimmedName,
      image: trimmedImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=random&size=150`
    };

    setCandidates(prev => [...prev, newCandidate]);
    setNewCandidateName('');
    setNewCandidateImage('');
  };

  const handleDeleteCandidate = (candidate) => {
    if (!window.confirm(`Delete ${candidate.name} and all of their submitted scores?`)) return;

    setCandidates(prev => prev.filter(item => item.id !== candidate.id));
    setScores(prev => Object.fromEntries(
      Object.entries(prev).filter(([key]) => Number(key.split('-')[0]) !== candidate.id)
    ));

    if (activeCandidateId === candidate.id) {
      setActiveCandidateId(null);
      setCurrentComment('');
    }
  };

  const handleScoreSubmit = () => {
    if (!activeCandidateId) return;
    const submissionKey = `${activeCandidateId}-${currentTheme}`;

    setScores(prev => ({
      ...prev,
      [submissionKey]: {
        scores: currentScores,
        comment: currentComment.trim()
      }
    }));

    setCurrentComment('');
    alert('Scores submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation / Role Switcher */}
      <nav className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MonitorPlay className="text-blue-600" />
          <h1 className="font-bold text-xl">Mr. & Ms. SDCA Tabulation</h1>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => setRole('admin')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${role === 'admin' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Admin / Management
          </button>
          <button 
            onClick={() => setRole('judge')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${role === 'judge' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Judge View
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        {role === 'admin' ? (
          /* ADMIN VIEW */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" /> Candidate Management
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Candidate Name</label>
                  <input
                    type="text"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="Enter candidate name"
                    className="w-full p-2.5 mt-1 bg-slate-50 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Image URL</label>
                  <input
                    type="url"
                    value={newCandidateImage}
                    onChange={(e) => setNewCandidateImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2.5 mt-1 bg-slate-50 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleAddCandidate}
                  disabled={candidates.length >= MAX_CANDIDATES}
                  className="bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Add Candidate
                </button>
                <span className="text-sm text-slate-500" aria-live="polite">
                  {candidates.length} / {MAX_CANDIDATES} candidates
                </span>
              </div>

              {candidates.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Candidates</h3>
                  <ul className="divide-y divide-slate-100">
                    {candidates.map(candidate => (
                      <li key={candidate.id} className="flex items-center justify-between gap-3 py-2">
                        <span className="min-w-0 truncate text-sm text-slate-700">
                          #{candidate.id} {candidate.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCandidate(candidate)}
                          aria-label={`Delete ${candidate.name}`}
                          title={`Delete ${candidate.name}`}
                          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> Stage Control
                </h2>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Segment / Theme</label>
                  <select 
                    value={currentTheme}
                    onChange={(e) => setCurrentTheme(e.target.value)}
                    className="w-full md:w-1/3 border-slate-300 rounded-lg p-2.5 bg-slate-50 border focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {THEMES.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>

                <h3 className="text-sm font-medium text-slate-700 mb-3">Push Candidate to Stage</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {candidates.map(candidate => (
                    <button
                      key={candidate.id}
                      onClick={() => setActiveCandidateId(candidate.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${activeCandidateId === candidate.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
                    >
                      <div className="font-bold text-lg text-slate-800">#{candidate.id}</div>
                      <div className="text-sm text-slate-500 truncate">{candidate.name}</div>
                    </button>
                  ))}
                  {candidates.length === 0 && (
                    <p className="col-span-full text-sm text-slate-500">Add a candidate to begin stage control.</p>
                  )}
                </div>
              </div>

            <aside className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">Live Leaderboard</h2>
              </div>

              <div className="space-y-2">
                {rankedCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`flex items-center gap-3 border-b border-slate-50 py-3 last:border-0 ${index < 3 ? 'bg-blue-50/60 rounded-lg px-2' : 'px-2'}`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-blue-600 text-white' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-slate-300 text-slate-800' : 'bg-slate-100 text-slate-600'}`}>
                      {index + 1}
                    </div>
                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">Candidate #{candidate.id}</p>
                      <p className="text-[11px] text-slate-500">{candidate.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{candidate.total} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
            </div>
          </div>
        ) : (
          /* JUDGE VIEW */
          <div>
            <div className="grid xl:grid-cols-[minmax(0,2fr)_340px] gap-8">
              <div className="min-w-0">
                {!activeCandidate ? (
                  <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                    <MonitorPlay className="w-12 h-12 text-slate-300 mb-3" />
                    <h2 className="text-xl font-semibold text-slate-500">Waiting for candidate...</h2>
                    <p className="text-slate-400 text-sm mt-1">Management will push the next candidate to your screen.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Candidate Profile Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="bg-blue-600 text-white p-6 text-center">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wider mb-2 uppercase">
                          {currentTheme}
                        </span>
                        <h2 className="text-3xl font-bold mb-1">Candidate #{activeCandidate.id}</h2>
                        <p className="text-blue-100 text-lg">{activeCandidate.name}</p>
                      </div>
                      <div className="p-8 flex justify-center bg-slate-50">
                        <img 
                          src={activeCandidate.image} 
                          alt={activeCandidate.name} 
                          className="w-48 h-48 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                      </div>
                    </div>

                    {/* Scoring Panel */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-6 border-b pb-4">Score Sheet</h3>
                        <div className="space-y-6">
                          {CATEGORIES.map((category, index) => (
                            <div key={category.name}>
                              <div className="flex justify-between items-center mb-1">
                                <div>
                                  <label className="font-medium text-slate-700 block">{category.name}</label>
                                  <span className="text-xs text-slate-500 block mt-0.5 mb-2 leading-relaxed">{category.description}</span>
                                </div>
                                <span className="font-bold text-blue-600 text-lg">{currentScores[index] || 5} pts</span>
                              </div>
                              <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={currentScores[index] || 5}
                                onChange={(e) => setCurrentScores(prev => ({...prev, [index]: parseInt(e.target.value)}))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                              <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>1 (Poor)</span>
                                <span>10 (Excellent)</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <label className="block text-sm font-medium text-slate-700 mt-6">Judge's Remarks / Comments (Optional)</label>
                        <textarea
                          value={currentComment}
                          onChange={(e) => setCurrentComment(e.target.value)}
                          placeholder="Add feedback for this contestant..."
                          rows={4}
                          className="w-full p-3 mt-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        />

                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Latest Remarks</p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {latestComment || 'No remarks recorded for this candidate in the current segment.'}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleScoreSubmit}
                        className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Submit Scores
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 h-fit">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live</p>
                    <h3 className="text-xl font-bold text-slate-800">Ranking</h3>
                  </div>
                  <div className="rounded-full bg-blue-50 text-blue-600 px-2.5 py-1 text-xs font-semibold">
                    {rankedCandidates.length} entries
                  </div>
                </div>

                <div className="space-y-3">
                  {rankedCandidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${index === 0 ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {index + 1}
                      </div>
                      <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="h-10 w-10 rounded-full border border-white object-cover shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {getOrdinalSuffix(candidate.rank)}
                          </p>
                          <span className="text-sm font-bold text-blue-600">{candidate.total} pts</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">Candidate #{candidate.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}