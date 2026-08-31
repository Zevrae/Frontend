import { useCustomize } from '../CustomizeContext';

export default function Home() {
  const { dispatch } = useCustomize();

  return (
    <div className="home">
      <div className="home-inner">
        <p className="home-eyebrow">Zevrae / Custom Designs</p>
        <h2 className="home-title">
          Design your own piece,
          <br />
          your way.
        </h2>
        <p className="home-sub">
          Upload artwork straight onto a garment, or open the full editor to choose a cloth type, a color, and
          place your design by hand.
        </p>

        <div className="home-choices">
          <button className="choice-card" onClick={() => dispatch({ type: 'START_FLOW', flow: 'upload' })}>
            <span className="choice-kicker">Quick path</span>
            <span className="choice-title">Upload a design</span>
            <span className="choice-desc">Pick a cloth type, upload your artwork, and generate the design in one pass.</span>
          </button>

          <button className="choice-card choice-card--accent" onClick={() => dispatch({ type: 'START_FLOW', flow: 'scratch' })}>
            <span className="choice-kicker">Full control</span>
            <span className="choice-title">Start from scratch</span>
            <span className="choice-desc">Open the editor — choose cloth type and color, then place your design on front and back.</span>
          </button>
        </div>
      </div>
    </div>
  );
}
