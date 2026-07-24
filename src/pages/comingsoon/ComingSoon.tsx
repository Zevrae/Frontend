import aiVideo from "../../assets/ai-wardrobe.mp4";

export default function ComingSoon() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
      }}
    >
      <video
        src={aiVideo}
        autoPlay
        loop
        muted
        controls
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}