import { useState, useEffect } from 'react';

export default function OnboardingModal() {
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('onboarding_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const closeModal = () => {
    localStorage.setItem('onboarding_seen', 'true');
    setIsOpen(false);
  };

  const steps = [
    {
      title: 'Welcome to StressScape',
      text: 'Explore the urban landscape through the lens of stress. We combine AQI, Temperature, Crowd Density, and Noise into a single intelligence score.',
      icon: '🏙️',
    },
    {
      title: 'Multilayer Mapping',
      text: 'Toggle layers to see individual stressors or the composite Stress Map. Switch between Light, Dark, and Satellite views for better context.',
      icon: '🗺️',
    },
    {
      title: 'AI Smart Advice',
      text: 'Our AI advisor provides personalized urban health tips based on your plans and real-time environmental data.',
      icon: '🤖',
    },
    {
      title: 'SDG-Aligned Insights',
      text: 'We help you stay safe and healthy while contributing to sustainable city goals (SDG 3, 11, and 13).',
      icon: '🌍',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-ink-900 p-8 shadow-2xl animate-zoom-in">
        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-accent' : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="flex h-20 items-center justify-center text-5xl">
            <span className="animate-bounce-slow">{steps[step].icon}</span>
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold text-white">
            {steps[step].title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-mist/70">
            {steps[step].text}
          </p>
        </div>

        <div className="mt-10 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => (step < steps.length - 1 ? setStep(step + 1) : closeModal())}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-all hover:bg-accent-dim hover:shadow-lg hover:shadow-accent/20 active:scale-95"
          >
            {step < steps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>

        {step < steps.length - 1 && (
            <button 
                type="button"
                onClick={closeModal}
                className="mt-4 w-full text-center text-xs text-mist/40 hover:text-mist/60 transition-colors"
            >
                Skip intro
            </button>
        )}
      </div>
    </div>
  );
}
