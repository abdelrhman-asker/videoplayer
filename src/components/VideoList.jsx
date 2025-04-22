const VideoList = ({ videos, currentVideo, watchedVideos, onSelectVideo }) => {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Video List</h3>
        <ul className="space-y-2">
          {videos.map((video) => (
            <li
              key={video.id}
              className={`p-3 rounded-lg cursor-pointer flex items-center gap-2 ${
                currentVideo.id === video.id
                  ? 'bg-blue-100'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => onSelectVideo(video)}
            >
              <span className="flex-1">{video.title}</span>
              {watchedVideos[video.id] && (
                <span className="text-green-500">✓ Watched</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default VideoList;