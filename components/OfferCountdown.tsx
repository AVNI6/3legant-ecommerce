import React from "react";
import Countdown, { CountdownRenderProps } from "react-countdown";

type Props = {
  validationTill: string | number | Date;
};

const numberBoxStyle: React.CSSProperties = {
  backgroundColor: "#F3F5F7",
  padding: "10px 15px",
  minWidth: 50,
  textAlign: "center",
  fontWeight: "medium",
  fontSize: "1.5rem",
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 10
};

const labelStyle: React.CSSProperties = {
  textAlign: "center",
  marginTop: 6,
  fontSize: "0.875rem",
  color: "#6C7275",
};

const singleUnitStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const renderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: CountdownRenderProps) => {
  if (completed) {
    return <span>Offer expired</span>;
  }

  return (
    <div style={containerStyle}>
      <div style={singleUnitStyle}>
        <div style={numberBoxStyle}>{String(days).padStart(2, "0")}</div>
        <div style={labelStyle}>Days</div>
      </div>

      <div style={singleUnitStyle}>
        <div style={numberBoxStyle}>{String(hours).padStart(2, "0")}</div>
        <div style={labelStyle}>Hours</div>
      </div>

      <div style={singleUnitStyle}>
        <div style={numberBoxStyle}>{String(minutes).padStart(2, "0")}</div>
        <div style={labelStyle}>Minutes</div>
      </div>

      <div style={singleUnitStyle}>
        <div style={numberBoxStyle}>{String(seconds).padStart(2, "0")}</div>
        <div style={labelStyle}>Seconds</div>
      </div>
    </div>
  );
};

const OfferCountdown: React.FC<Props> = ({ validationTill }) => {
  const endDate = new Date(validationTill).getTime();

  return (
    <div>
      <p>Offer expires in:</p>
      <Countdown date={endDate} renderer={renderer} />
    </div>
  );
};

export default OfferCountdown;