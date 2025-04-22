import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import VideoList from './VideoList';

const videoData = [
  { id: 1, title: 'Introduction to React', url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', duration: 600 },
  { id: 2, title: 'React Hooks Tutorial', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', duration: 60 },
  { id: 3, title: 'Advanced Components', url: 'https://www.youtube.com/watch?v=4UZrsTqkcW4', duration: 900 },
];

const VideoPlayer = () => {
  const [currentVideo, setCurrentVideo] = useState(videoData[0]);
  const [watchedVideos, setWatchedVideos] = useState(() => {
    const saved = localStorage.getItem('watchedVideos');
    return saved ? JSON.parse(saved) : {};
  });
  const playerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
  }, [watchedVideos]);

  const handleProgress = (state) => {
    const { played } = state;
    if (played >= 0.8 && !watchedVideos[currentVideo.id]) {
      setWatchedVideos((prev) => ({
        ...prev,
        [currentVideo.id]: true,
      }));
    }
  };

  const selectVideo = (video) => {
    setCurrentVideo(video);
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Video Player</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <ReactPlayer
              ref={playerRef}
              url={currentVideo.url}
              width="100%"
              height="100%"
              controls
              onProgress={handleProgress}
              config={{
                youtube: {
                  playerVars: { showinfo: 0 },
                },
              }}
            />
          </div>
          <h2 className="text-xl font-semibold mt-2">{currentVideo.title}</h2>
        </div>
        <div className="w-full md:w-1/3">
          <VideoList
            videos={videoData}
            currentVideo={currentVideo}
            watchedVideos={watchedVideos}
            onSelectVideo={selectVideo}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;