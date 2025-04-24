import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import VideoList from './VideoList';
import ExamComponent from './ExamComponent';
import videoData from '../assets/VideoData.json';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const VideoPlayer = () => {
  const isContentUnlocked = (content, watched) => {
    const allContent = videoData.flatMap(week => week.videos);
    const currentIndex = allContent.findIndex(v => v.id === content.id);
    if (currentIndex === 0) return true;
    for (let i = 0; i < currentIndex; i++) {
      if (!watched[allContent[i].id]) return false;
    }
    return true;
  };

  const [currentContent, setCurrentContent] = useState(() => {
    const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '{}');
    const allContent = videoData.flatMap(week => week.videos);
    const firstUnwatched = allContent.find(item => !watchedVideos[item.id] && isContentUnlocked(item, watchedVideos));
    return firstUnwatched || allContent[0];
  });

  const [watchedVideos, setWatchedVideos] = useState(() => {
    const saved = localStorage.getItem('watchedVideos');
    return saved ? JSON.parse(saved) : {};
  });

  const [examProgress, setExamProgress] = useState(() => {
    const saved = localStorage.getItem('examProgress');
    return saved ? JSON.parse(saved) : {};
  });

  const [showPdf, setShowPdf] = useState(false);
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('comments');
    return saved ? JSON.parse(saved) : [];
  });
  const [newComment, setNewComment] = useState('');
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('questions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showLeaderboardPopup, setShowLeaderboardPopup] = useState(false);
  const playerRef = useRef(null);
  const commentsRef = useRef(null);
  const videoListRef = useRef(null);

  const courseName = "React Tutorial for Beginners";

  useEffect(() => {
    if (showPdf) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [showPdf]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPdf(false);
        setShowQuestionPopup(false);
        setShowLeaderboardPopup(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
    localStorage.setItem('examProgress', JSON.stringify(examProgress));
    localStorage.setItem('comments', JSON.stringify(comments));
    localStorage.setItem('questions', JSON.stringify(questions));
  }, [watchedVideos, examProgress, comments, questions]);

  const handleVideoProgress = (state) => {
    const { played } = state;
    if (played >= 0.8 && !watchedVideos[currentContent.id]) {
      setWatchedVideos((prev) => ({
        ...prev,
        [currentContent.id]: true,
      }));
    }
  };

  const selectContent = (content) => {
    if (isContentUnlocked(content, watchedVideos)) {
      setCurrentContent(content);
      if (content.type === 'pdf') {
        setShowPdf(true);
        setWatchedVideos((prev) => ({
          ...prev,
          [content.id]: true,
        }));
      } else {
        setShowPdf(false);
      }
      if (content.type === 'video' && playerRef.current) {
        playerRef.current.seekTo(0);
      }
    }
  };

  const calculateProgress = () => {
    const allContent = videoData.flatMap(week => week.videos);
    const completed = allContent.filter(item => watchedVideos[item.id]).length;
    return (completed / allContent.length) * 100;
  };

  const handleExamComplete = (examId, answers) => {
    setWatchedVideos((prev) => ({
      ...prev,
      [examId]: true,
    }));
    setExamProgress((prev) => ({
      ...prev,
      [examId]: { answers, completed: true },
    }));
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCurriculum = () => {
    const videoElement = document.getElementById(`video-${currentContent.id}`);
    if (videoElement) {
      videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments((prev) => [
        ...prev,
        { id: Date.now(), text: newComment, timestamp: new Date().toISOString() },
      ]);
      setNewComment('');
    }
  };

  const handleSendQuestion = () => {
    if (questionInput.trim()) {
      setQuestions((prev) => [
        ...prev,
        { id: Date.now(), text: questionInput, timestamp: new Date().toISOString() },
      ]);
      setQuestionInput('');
      setShowQuestionPopup(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4"> <span className='text-lg font-light'> Home &gt; </span> <span className='text-lg font-light'> Courses &gt; </span> Course Details</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <h2 className="text-3xl font-semibold my-2 mb-6">{currentContent.title}</h2>

          {currentContent.type === 'video' && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                ref={playerRef}
                url={currentContent.videoUrl}
                width="100%"
                height="100%"
                controls
                light={<img src={currentContent.thumbnailUrl} alt='Thumbnail' />}
                onProgress={handleVideoProgress}
              />
            </div>
          )}
          {currentContent.type === 'exam' && (
            <ExamComponent
              exam={currentContent}
              savedProgress={examProgress[currentContent.id]}
              onComplete={handleExamComplete}
            />
          )}
          {currentContent.type === 'pdf' && showPdf && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg max-w-4xl w-full h-[90%] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">{currentContent.title}</h2>
                  <button
                    onClick={() => setShowPdf(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Close
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <iframe
                    src={`https://docs.google.com/gview?url=${currentContent.pdfUrl}&embedded=true`}
                    title={currentContent.title}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Icons below the Video */}
          <div className="flex gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <button
                onClick={scrollToComments}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex justify-center"
                title="Comments"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </button>
              <span className="text-xs">comments</span>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={scrollToCurriculum}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex justify-center"
                title="Curriculum"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </button>
              <span className="text-xs">curriculum</span>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setShowQuestionPopup(true)}
                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex justify-center"
                title="Ask a Question"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <span className="text-xs">ask question</span>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setShowLeaderboardPopup(true)}
                className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex justify-center"
                title="Leaderboard"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </button>
              <span className="text-xs">leaderboard</span>
            </div>
          </div>
          <p className="text-gray-600 mt-4">{currentContent.description}</p>

          {/* VideoList (Topics For This Course) - Rendered here for mobile order */}
          <div className="w-full mt-8 md:hidden">
            <VideoList
              videoData={videoData}
              currentContent={currentContent}
              watchedVideos={watchedVideos}
              onSelectContent={selectContent}
              isContentUnlocked={(content) => isContentUnlocked(content, watchedVideos)}
              videoListRef={videoListRef}
            />
          </div>

          {/* Comments Section */}
          <div ref={commentsRef} className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-100 rounded">
                  <p>{comment.text}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="my-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded"
                rows="4"
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-[#41B69D] text-white rounded hover:bg-[#256a5b]"
              >
                Submit Review →
              </button>
            </form>
          </div>
        </div>

        {/* VideoList (Topics For This Course) - Rendered here for desktop */}
        <div className="w-full md:w-1/3 hidden md:block">
          <VideoList
            videoData={videoData}
            currentContent={currentContent}
            watchedVideos={watchedVideos}
            onSelectContent={selectContent}
            isContentUnlocked={(content) => isContentUnlocked(content, watchedVideos)}
            videoListRef={videoListRef}
          />
        </div>
      </div>

      {/* Question Popup */}
      {showQuestionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Ask a Question</h2>
              <button
                onClick={() => setShowQuestionPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <textarea
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Type your question here..."
              className="w-full p-2 border rounded"
              rows="6"
            />
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">Previous Questions</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {questions.length === 0 && (
                  <p className="text-gray-500">No questions yet.</p>
                )}
                {questions.map((question) => (
                  <div key={question.id} className="p-2 bg-gray-100 rounded">
                    <p>{question.text}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(question.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSendQuestion}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Popup */}
      {showLeaderboardPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowLeaderboardPopup(false)}
                className="text-gray-500 hover:text-gray-700 w-full flex justify-end"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <h3 className="text-xl font-bold">{courseName}</h3>
            <h4 className="text-lg font-semibold mt-2">Leaderboard</h4>
            <div className="flex items-center">
              <p className="mt-4 text-gray-600">
                عظيم يا صديقي.. أداءك في الكورس ده أفضل من 60% من باقي الطلبة.. كمّل عايز أشوف اسمك في الليدر بورد هنا
              </p>
              <div className="text-4xl">💪</div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLeaderboardPopup(false)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;