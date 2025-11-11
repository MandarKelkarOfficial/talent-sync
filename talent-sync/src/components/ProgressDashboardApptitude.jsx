/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProgressDashboard = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const studentId = user?._id;

  useEffect(() => {
    if (studentId) {
      fetchProgressData();
    }
  }, [studentId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/aptitude/student/${studentId}/progress`);
      setProgressData(response.data);
    } catch (err) {
      setError('No progress data available yet. Take your first test to start tracking!');
    } finally {
      setLoading(false);
    }
  };

  // Small scoped styles for SVG animations (keeps logic untouched)
  const SvgAnimations = () => (
    <style>{`
      @keyframes dash {
        to { stroke-dashoffset: 0; }
      }
      .dash-line {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: dash 1.1s ease forwards;
      }
      @keyframes pop {
        from { transform: scale(0); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .point-pop { transform-origin: center; animation: pop 0.45s cubic-bezier(.2,.9,.2,1) forwards; }
    `}</style>
  );

  const ScoreProgressChart = ({ timeline }) => (
    <div className="bg-white rounded-xl shadow-xl p-6 transition-transform transform hover:-translate-y-1">
      <SvgAnimations />
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Progress Over Time</h3>
      <div className="relative h-44">
        <svg width="100%" height="100%" viewBox="0 0 400 160" className="overflow-visible">
          {/* grid lines */}
          <g stroke="#E6E6F0" strokeWidth="1">
            <line x1="20" x2="380" y1="10" y2="10" />
            <line x1="20" x2="380" y1="40" y2="40" />
            <line x1="20" x2="380" y1="70" y2="70" />
            <line x1="20" x2="380" y1="100" y2="100" />
            <line x1="20" x2="380" y1="130" y2="130" />
          </g>

          {/* path & points */}
          {timeline.map((point, index) => {
            const x = (index / (timeline.length - 1)) * 360 + 20;
            const y = 140 - (point.score / 100) * 120;
            const nextX = ((index + 1) / (timeline.length - 1)) * 360 + 20;
            const nextY = 140 - ((timeline[index + 1]?.score || point.score) / 100) * 120;

            return (
              <g key={index}>
                {index < timeline.length - 1 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={nextX}
                    y2={nextY}
                    stroke="url(#gradLine)"
                    strokeWidth="3"
                    className="dash-line"
                    strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="gradLine" x1="0" x2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="1" />
                  </linearGradient>
                </defs>

                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#fff"
                  stroke="#6366F1"
                  strokeWidth="3"
                  className="point-pop"
                />
                <circle cx={x} cy={y} r="3.2" fill="#6366F1" className="point-pop" />
                <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fill="#374151" className="opacity-90">
                  {point.score}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>First Test</span>
        <span>Latest Test</span>
      </div>
    </div>
  );

  const TopicProgressCard = ({ topic }) => {
    const improvementColor = topic.improvement > 0 ? 'text-green-600' :
      topic.improvement < 0 ? 'text-red-600' : 'text-gray-600';
    const trendIcon = topic.trend === 'up' ? '📈' : topic.trend === 'down' ? '📉' : '➡️';

    return (
      <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-medium text-gray-800 text-sm">{topic.topic}</h4>
          <span className="text-lg">{trendIcon}</span>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">{topic.current}%</span>
            <p className="text-xs text-gray-500">Current</p>
          </div>
          <div className={`text-right ${improvementColor}`}>
            <span className="text-sm font-medium">
              {topic.improvement > 0 ? '+' : ''}{topic.improvement}%
            </span>
            <p className="text-xs text-gray-500">vs previous</p>
          </div>
        </div>

        {/* Animated gradient progress bar */}
        <div className="w-full bg-indigo-50 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${topic.current}%`,
              background: 'linear-gradient(90deg,#6366F1,#8B5CF6)'
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    // Fancy skeleton + spinner (UI only)
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 h-36 rounded-xl bg-gradient-to-r from-indigo-200 to-purple-200 animate-pulse shadow-inner" />
          <div className="w-36 h-36 rounded-full flex items-center justify-center bg-white shadow-xl">
            {/* gradient spinner */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid rgba(99,102,241,0.15)', borderTop: '3px solid #6366F1' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* placeholder cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-blue-50 rounded-xl p-8 shadow-lg text-center">
        <div className="text-blue-700 text-lg font-semibold mb-2">No Progress Data Yet</div>
        <p className="text-blue-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.href = '/aptitude-calculator'}
          className="px-5 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition"
        >
          Take Your First Test
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto space-y-6 px-4 py-6">
      {/* Header Stats */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transform-gpu  scale-105 opacity-95"></div>
        <div className="relative z-10 p-8 rounded-2xl text-white">
          <h1 className="text-3xl font-extrabold mb-4">Your Aptitude Progress</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 p-4 rounded-lg shadow-inner">
              <div className="text-3xl font-bold">{progressData.totalTests}</div>
              <div className="text-indigo-100 text-sm">Tests Completed</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg shadow-inner">
              <div className="text-3xl font-bold">{progressData.latestScore}%</div>
              <div className="text-indigo-100 text-sm">Latest Score</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg shadow-inner">
              <div className="text-3xl font-bold">{progressData.bestScore}%</div>
              <div className="text-indigo-100 text-sm">Best Score</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg shadow-inner">
              <div className="text-3xl font-bold">{progressData.overallImprovement > 0 ? '+' : ''}{progressData.overallImprovement}%</div>
              <div className="text-indigo-100 text-sm">Total Growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      {progressData.timeline && progressData.timeline.length > 1 && (
        <ScoreProgressChart timeline={progressData.timeline} />
      )}

      {/* Current Status & Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Latest Score:</span>
              <span className="font-bold text-indigo-600">{progressData.latestScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Score:</span>
              <span className="font-medium">{progressData.averageScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recent Trend:</span>
              <span className={`font-medium ${
                progressData.recentTrend === 'Improving' ? 'text-green-600' :
                progressData.recentTrend === 'Declining' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {progressData.recentTrend}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Achievement Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Best Performance:</span>
              <span className="font-bold text-green-600">{progressData.bestScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Since Start:</span>
              <span className={`font-medium ${progressData.overallImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {progressData.overallImprovement > 0 ? '+' : ''}{progressData.overallImprovement}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tests Completed:</span>
              <span className="font-medium">{progressData.totalTests}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Next Steps</h3>
          <div className="space-y-2 text-sm">
            {progressData.recentTrend === 'Improving' ? (
              <>
                <p className="text-green-600">Great progress! Keep it up.</p>
                <p className="text-gray-600">Focus on maintaining consistency</p>
                <p className="text-gray-600">Challenge yourself with harder topics</p>
              </>
            ) : progressData.recentTrend === 'Declining' ? (
              <>
                <p className="text-amber-600">Review your weak areas</p>
                <p className="text-gray-600">Take more practice tests</p>
                <p className="text-gray-600">Consider getting additional help</p>
              </>
            ) : (
              <>
                <p className="text-blue-600">Steady performance!</p>
                <p className="text-gray-600">Try new study techniques</p>
                <p className="text-gray-600">Set higher score targets</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Topic-wise Progress */}
      {progressData.topicProgress && progressData.topicProgress.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Topic-wise Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {progressData.topicProgress.map(topic => (
              <TopicProgressCard key={topic.topic} topic={topic} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
