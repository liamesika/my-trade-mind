export default function VideoBackground() {
  return (
    <div className="video-wrapper absolute inset-0 z-[-10]">
      <div className="gradient-overlay"></div>
      <video autoPlay muted loop className="video-bg w-full h-full object-cover">
        <source src="homepage-media/video-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}