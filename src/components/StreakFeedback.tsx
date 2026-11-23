import React from 'react';

interface StreakFeedbackProps {
  streak: number;
  milestoneMessage: string;
  milestoneTriggerTime: number;
}

export const StreakFeedback: React.FC<StreakFeedbackProps> = ({
  streak,
  milestoneMessage,
  milestoneTriggerTime,
}) => {
  const isMilestoneActive =
    Boolean(milestoneMessage && Date.now() - milestoneTriggerTime < 2500);

  return (
    <div
      aria-live="polite"
      className="w-full max-w-5xl lg:max-w-6xl mx-auto px-6 h-6 flex items-center justify-between text-xs font-mono text-dark-muted select-none"
    >
      <div>
        {streak >= 5 ? (
          <span className="text-white/80">
            <span className="text-amber-400 font-semibold">{streak}</span> consecutive keystrokes
          </span>
        ) : null}
      </div>

      <div>
        {isMilestoneActive && (
          <span className="text-amber-400 font-medium tracking-wide animate-fade-in">
            {milestoneMessage}
          </span>
        )}
      </div>
    </div>
  );
};
