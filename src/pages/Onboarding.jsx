import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { saveUserProfile } from '../firebase/firebase-auth';

const questionsData = [
  { name: 'q1', label: 'איך קוראים לך?', placeholder: 'הכנס את שמך' },
  { name: 'q2', label: 'באיזו תדירות אתה סוחר?', placeholder: 'למשל: כל יום, פעם בשבוע...' },
  { name: 'q3', label: 'מה התחום שאתה הכי חזק בו במסחר?', placeholder: 'למשל: ניתוח טכני, פסיכולוגיה...' },
  { name: 'q4', label: 'מה היעד הכי גדול שלך לשנה הקרובה?', placeholder: 'למשל: להגיע ל־10,000₪ רווח...' },
  { name: 'q5', label: "איך אתה מעדיף לקבל תובנות מהצ'אט?", placeholder: 'למשל: טיפים קצרים, ניתוחים מורחבים...' },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();

  const handleNext = async () => {
    const inputValue = inputRef.current?.value.trim();
    if (!inputValue) return inputRef.current?.focus();

    const key = questionsData[current].name;
    const updatedAnswers = { ...answers, [key]: inputValue };
    setAnswers(updatedAnswers);

    if (current + 1 < questionsData.length) {
      setCurrent(current + 1);
    } else {
      const user = auth.currentUser;
      if (!user) {
        alert('⛔ לא ניתן להמשיך – אין משתמש מחובר');
        navigate('/login');
        return;
      }

      setSubmitting(true);
      try {
        await saveUserProfile(user.uid, updatedAnswers);
        localStorage.setItem('userProfile', JSON.stringify(updatedAnswers));
        alert('✅ הפרופיל נשמר בהצלחה!');
        navigate('/chat');
      } catch (err) {
        console.error('שגיאה בשמירת פרופיל:', err);
        alert('❌ שגיאה בשמירת הנתונים. נסה שוב');
      } finally {
        setSubmitting(false);
      }
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [current]);

  const percentage = Math.min((current / questionsData.length) * 100, 100);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl bg-gray-800 rounded shadow overflow-hidden" style={{ minHeight: 350 }}>
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-4">אנא ענה על כמה שאלות קצרות</h2>

          <form className="space-y-4 h-[220px]">
            <label className="block mb-2">{questionsData[current].label}</label>
            <input
              ref={inputRef}
              type="text"
              required
              className="w-full p-2 rounded bg-gray-700"
              placeholder={questionsData[current].placeholder}
            />
          </form>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold"
          >
            {submitting ? 'שולח...' : 'הבא'}
          </button>
        </div>
      </div>
    </div>
  );
}
