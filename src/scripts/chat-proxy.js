// Chat Proxy - Universal Firebase-based OpenAI Integration

import { getAuth } from "firebase/auth";

export async function sendChatMessage(messages) {
  try {
    console.log("📤 Sending message to OpenAI...");

    const BASE_URL = "/chat";
    const auth = getAuth();
    const user = auth.currentUser;
    const idToken = user ? await user.getIdToken() : null;

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: idToken ? `Bearer ${idToken}` : "",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      reply: data.reply,
    };
  } catch (error) {
    console.error("❌ Chat API Error:", error);

    const fallbackReplies = [
      `מצטער על הבעיה הטכנית! 💭

בואו נדבר על **ניהול סיכונים** - הנושא הכי חשוב במסחר.

כמה אחוזים מההון שלך אתה מסכן בעסקה אחת? 

הכלל הזהב: **לא יותר מ-2% לעסקה!** ⚡`,

      `בעיה טכנית זמנית... 🔄

בינתיים, בואו נתמקד ב**פסיכולוגיה של המסחר**:

1. **שליטה ברגשות** - המפתח להצלחה
2. **סבלנות** - לא כל יום יש עסקאות טובות  
3. **דיסציפלינה** - לעקוב אחרי התוכנית

איך אתה מתמודד עם FOMO (Fear of Missing Out)? 💪`,

      `תקלה קלה בשרת... 📊

זה מזכיר לי עיקרון חשוב: **תמיד צריך תוכנית גיבוי!**

במסחר זה אומר:
- Stop Loss מוגדר מראש
- יעד רווח ברור
- אסטרטגיה ליציאה

מה האסטרטגיה שלך ליציאה מעסקאות? 🎯`
    ];

    const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

    return {
      success: false,
      reply: randomReply,
    };
  }
}
