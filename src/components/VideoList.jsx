import { useState, useEffect } from 'react';

const VideoList = ({ videoData, currentContent, watchedVideos, onSelectContent, isContentUnlocked, videoListRef, expandAllWeeks }) => {
  const [expandedWeeks, setExpandedWeeks] = useState(() => {
    const currentWeek = videoData.find(week =>
      week.videos.some(video => video.id === currentContent.id)
    );
    return currentWeek ? { [currentWeek.week]: true } : {};
  });

  useEffect(() => {
    const currentWeek = videoData.find(week =>
      week.videos.some(video => video.id === currentContent.id)
    );
    if (currentWeek) {
      setExpandedWeeks((prev) => ({
        ...prev,
        [currentWeek.week]: prev[currentWeek.week] !== false ? true : prev[currentWeek.week],
      }));
    }
  }, [currentContent, videoData]);

  useEffect(() => {
    if (expandAllWeeks) {
      const allWeeksExpanded = videoData.reduce((acc, week) => ({
        ...acc,
        [week.week]: true,
      }), {});
      setExpandedWeeks(allWeeksExpanded);
    }
  }, [expandAllWeeks, videoData]);

  const toggleWeek = (weekNumber) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNumber]: !prev[weekNumber],
    }));
  };

  const expandAll = () => {
    const allWeeksExpanded = videoData.reduce((acc, week) => ({
      ...acc,
      [week.week]: true,
    }), {});
    setExpandedWeeks(allWeeksExpanded);
  };

  const collapseAll = () => {
    setExpandedWeeks({});
  };

  const areAllWeeksExpanded = () => {
    return videoData.every(week => expandedWeeks[week.week]);
  };

  const calculateProgress = () => {
    const allContent = videoData.flatMap(week => week.videos);
    const completed = allContent.filter(item => watchedVideos[item.id]).length;
    return (completed / allContent.length) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4" ref={videoListRef}>
      <h2 className="text-md font-semibold mb-12 flex justify-between">
        Topics For This Course
        <span
          onClick={areAllWeeksExpanded() ? collapseAll : expandAll}
          className="cursor-pointer text-blue-600 hover:text-blue-800"
        >
          {areAllWeeksExpanded() ? 'Collapse All 🔺' : 'Expand All 🔻'}
        </span>
      </h2>
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-600 h-2.5 rounded-full progressBar"
            style={{ width: `${calculateProgress()}%` }}
          >
            <div className="AfterProgress">
              <h5>You</h5>
              <span>🔻</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Progress: {Math.round(calculateProgress())}%
        </p>
      </div>
      {videoData.map((week) => (
        <div key={week.week} className="mb-2">
          <button
            onClick={() => toggleWeek(week.week)}
            className="w-full flex justify-between items-center text-left font-medium text-blue-600 hover:text-blue-800"
          >
            Week {week.week}
            <svg
              className={`w-5 h-5 transform transition-transform ${expandedWeeks[week.week] ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedWeeks[week.week] && (
            <ul className="mt-2 space-y-2">
              {week.videos.map((video) => {
                const isUnlocked = isContentUnlocked(video);
                return (
                  <li
                    key={video.id}
                    id={`video-${video.id}`}
                    onClick={() => isUnlocked && onSelectContent(video)}
                    className={`cursor-pointer p-2 rounded flex justify-between items-center ${
                      currentContent.id === video.id
                        ? 'bg-blue-100'
                        : isUnlocked
                        ? 'hover:bg-gray-100'
                        : 'bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <span className="font-medium">{video.title}</span>
                      {video.type === 'exam' && <span className="ml-2 text-sm text-gray-500">(Exam)</span>}
                      {video.type === 'pdf' && <span className="ml-2 text-sm text-gray-500">(PDF)</span>}
                    </div>
                    {!isUnlocked && <>🔒</>}
                    {watchedVideos[video.id] && (
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default VideoList;