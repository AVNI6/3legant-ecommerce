import React from "react";
import Countdown, { CountdownRenderProps } from "react-countdown";

type Props = {
  validationTill: string | number | Date;
};

const renderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: CountdownRenderProps) => {
  if (completed) {
    return <span className="text-red-500 font-medium">Offer expired</span>;
  }

  // A helper to avoid repeating the long tailwind class string
  const BoxCard = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-[#F3F5F7] rounded-md px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 min-w-[44px] sm:min-w-[52px] md:min-w-[64px] text-center font-semibold text-base sm:text-xl md:text-2xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-center mt-1 sm:mt-1.5 text-[0.65rem] sm:text-xs md:text-sm text-[#6C7275]">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3" suppressHydrationWarning>
      <BoxCard value={days} label="Days" />
      <BoxCard value={hours} label="Hours" />
      <BoxCard value={minutes} label="Minutes" />
      <BoxCard value={seconds} label="Seconds" />
    </div>
  );
};

const OfferCountdown: React.FC<Props> = ({ validationTill }) => {
  const endDate = new Date(validationTill).getTime();

  return (
    <div suppressHydrationWarning className="w-full">
      <p className="text-sm sm:text-base text-gray-700 font-medium mb-1">Offer expires in:</p>
      <Countdown date={endDate} renderer={renderer} />
    </div>
  );
};

export default OfferCountdown;