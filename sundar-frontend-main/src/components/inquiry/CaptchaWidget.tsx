import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface CaptchaWidgetProps {
  onVerify: (isValid: boolean) => void;
  label?: string;
}

/**
 * Simple math-based CAPTCHA widget.
 * Generates a random arithmetic question, validates the user's answer,
 * and reports validity to the parent via the onVerify callback.
 */
const CaptchaWidget = ({ onVerify, label = 'Security Verification' }: CaptchaWidgetProps) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '×'>('+');
  const [answer, setAnswer] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);

  const generateChallenge = useCallback(() => {
    const op = '+';
    const a = Math.floor(Math.random() * 9) + 1;  // 1-9
    const b = Math.floor(Math.random() * 9) + 1;  // 1-9
    setNum1(a);
    setNum2(b);
    setOperator(op);
    setAnswer('');
    setVerified(null);
    onVerify(false);
  }, [onVerify]);

  // Generate first challenge on mount
  useEffect(() => {
    generateChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expectedAnswer = operator === '+' ? num1 + num2 : num1 * num2;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAnswer(val);
    setVerified(null);

    if (val.trim() !== '') {
      const isCorrect = parseInt(val, 10) === expectedAnswer;
      setVerified(isCorrect);
      onVerify(isCorrect);
    } else {
      onVerify(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-green-500" />
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="flex items-center gap-3">
        {/* Math question */}
        <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white font-mono font-bold text-lg rounded-xl select-none tracking-wider shadow-inner min-w-[130px] text-center">
          {num1} {operator} {num2} = ?
        </div>

        {/* Input */}
        <input
          type="number"
          value={answer}
          onChange={handleInputChange}
          placeholder="Answer"
          required
          className={`flex-1 px-4 py-3 border-2 rounded-xl font-bold text-sm outline-none transition-all ${
            verified === null
              ? 'bg-slate-50 border-slate-200 focus:border-green-500'
              : verified
                ? 'bg-green-50 border-green-400 text-green-700'
                : 'bg-red-50 border-red-400 text-red-700'
          }`}
        />

        {/* Refresh button */}
        <button
          type="button"
          onClick={generateChallenge}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors flex-shrink-0"
          title="New question"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Feedback */}
      {verified === true && (
        <p className="text-xs font-bold text-green-600 ml-1 flex items-center gap-1">
          <ShieldCheck size={11} /> Verified
        </p>
      )}
      {verified === false && answer.trim() !== '' && (
        <p className="text-xs font-bold text-red-500 ml-1">Incorrect answer, please try again.</p>
      )}
    </div>
  );
};

export default CaptchaWidget;

