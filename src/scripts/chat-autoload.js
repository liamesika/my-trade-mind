import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "../firebase/firebase-init.js";



export function useChatAutoload(appendMessage, redirect = '/login') {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [chatRef, setChatRef] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert('⛔ אין משתמש מחובר – הפנייה להתחברות');
        window.location.href = redirect;
        return;
      }

      setUser(user);
      const userId = user.uid;

      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn('⚠️ משתמש לא קיים במסד');
          return;
        }

        const data = userSnap.data();
        const mentorName = data.mentorName || 'המנטור שלך';
        const mentorImg = data.mentorImg || '/image/robot.png';
        const profile = data.profile || {};
        const fullName = data.fullName || 'משתמש';

        localStorage.setItem('mentorName', mentorName);
        localStorage.setItem('mentorImg', mentorImg);
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userProfile', JSON.stringify(profile));

        const chatRef = doc(db, 'users', userId, 'chatHistory', 'current');
        setChatRef(chatRef);

        let chatHistory = [];
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          chatHistory = chatSnap.data().messages || [];
          chatHistory.forEach((msg) => {
            const label = msg.role === 'user' ? '🟢 אתה' : `🤖 ${mentorName}`;
            appendMessage(label, msg.content, msg.role);
          });
        } else {
          const context = `המשתמש שלך הוא ${profile.q1 || 'משתמש אנונימי'}.
הוא סוחר בתדירות של: ${profile.q2 || 'לא ידוע'}.
התחום שבו הוא הכי חזק הוא: ${profile.q3 || 'לא צוין'}.
היעד הגדול שלו לשנה הקרובה הוא: ${profile.q4 || 'לא ידוע'}.
הוא מעדיף לקבל תובנות בצורה של: ${profile.q5 || 'לא נבחר'}.`;

          chatHistory.push({ role: 'user', content: context });

          const idToken = await user.getIdToken();
          const res = await fetch('/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`
            },
            body: JSON.stringify({ messages: chatHistory })
          });

          if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);

          const resData = await res.json();
          const reply = resData.reply || '⚠️ לא התקבלה תשובה מהשרת';
          chatHistory.push({ role: 'assistant', content: reply });
          appendMessage(`🤖 ${mentorName}`, reply, 'bot');
          await setDoc(chatRef, { messages: chatHistory });
        }

        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        window.chatHistory = chatHistory;
        window.chatRef = chatRef;
        setLoading(false);
      } catch (err) {
        console.error('❌ שגיאה בטעינת צ\'אט:', err);
        alert('שגיאה בטעינת נתוני המשתמש');
      }
    });

    return () => unsubscribe();
  }, [appendMessage, redirect]);

  return { loading, user, chatRef };
}