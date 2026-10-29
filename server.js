import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.NODE_ENV === "production" ? Number(process.env.PORT) || 3e3 : 3e3;
app.use(express.json({ limit: "15mb" }));
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function generateWithGeminiFallback(contents, config) {
  const models = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let lastErr = null;
  for (const model of models) {
    try {
      const resp = await ai.models.generateContent({
        model,
        contents,
        config
      });
      if (resp && resp.text) {
        return resp;
      }
    } catch (err) {
      console.warn(`Model ${model} encountered error, trying fallback if available:`, err?.message || err);
      lastErr = err;
    }
  }
  throw lastErr || new Error("Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i v\u1EDBi Gemini AI.");
}
function parseGeminiJson(rawText) {
  let text = rawText.trim();
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (text.startsWith("```")) {
    text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn("Initial JSON.parse failed, attempting repair...");
    const lastBraceIndex = text.lastIndexOf("}");
    if (lastBraceIndex !== -1) {
      try {
        return JSON.parse(text.substring(0, lastBraceIndex + 1));
      } catch (e2) {
      }
    }
    throw new Error("D\u1EEF li\u1EC7u AI tr\u1EA3 v\u1EC1 kh\xF4ng \u0111\xFAng \u0111\u1ECBnh d\u1EA1ng JSON chu\u1EA9n.");
  }
}
app.post("/api/generate-exam", async (req, res) => {
  try {
    const {
      grade = "11",
      textbook = "K\u1EBFt n\u1ED1i tri th\u1EE9c v\u1EDBi cu\u1ED9c s\u1ED1ng",
      topic = "Truy\u1EC7n ng\u1EAFn, ti\u1EC3u thuy\u1EBFt",
      examType = "Ki\u1EC3m tra gi\u1EEFa k\u1EF3 I",
      customExamTitle = "",
      durationMinutes = 90,
      totalScore = 10,
      sampleModel = "B",
      readingQuestionCount = 5,
      readingScore = 6,
      writingParagraphScore = 0,
      writingEssayScore = 4,
      readingQuestionScores = [1, 1, 1, 1.5, 1.5],
      essayType = "Ngh\u1ECB lu\u1EADn v\u0103n h\u1ECDc",
      sourceText,
      includeMatrix = true,
      includeSpecification = true,
      includeRubric = true,
      schoolHeader = {
        department: "S\u1EDE GI\xC1O D\u1EE4C V\xC0 \u0110\xC0O T\u1EA0O",
        schoolName: "TR\u01AF\u1EDCNG THPT",
        academicYear: "2024 - 2025",
        semester: "H\u1ECCC K\u1EF2 I"
      },
      teacherPromptNote = ""
    } = req.body;
    if (!sourceText || !sourceText.content || sourceText.content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ch\u01B0a c\xF3 ng\u1EEF li\u1EC7u ngu\u1ED3n. H\u1EC7 th\u1ED1ng tu\xE2n th\u1EE7 nguy\xEAn t\u1EAFc s\u01B0 ph\u1EA1m c\u1EE7a GDPT 2018: \u01B0u ti\xEAn s\u1EED d\u1EE5ng 100% \u0111\xFAng v\u0103n b\u1EA3n do gi\xE1o vi\xEAn cung c\u1EA5p, kh\xF4ng t\u1EF1 b\u1ECBa \u0111\u1EB7t t\xE1c gi\u1EA3, t\xE1c ph\u1EA9m hay ngu\u1ED3n xu\u1EA5t x\u1EE9. Th\u1EA7y/C\xF4 vui l\xF2ng nh\u1EADp v\u0103n b\u1EA3n, t\u1EA3i t\u1EC7p t\xE0i li\u1EC7u, b\u1EA5m "G\u1EE3i \xFD ng\u1EEF li\u1EC7u chu\u1EA9n GDPT 2018" ho\u1EB7c ch\u1ECDn t\u1EEB Ng\xE2n h\xE0ng ng\u1EEF li\u1EC7u.'
      });
    }
    const words = sourceText.content.trim().split(/\s+/).length;
    if (words < 40) {
      return res.status(400).json({
        success: false,
        error: `V\u0103n b\u1EA3n ngu\u1ED3n qu\xE1 ng\u1EAFn (${words} t\u1EEB). \u0110\u1EC3 x\xE2y d\u1EF1ng \u0111\u1EC1 thi g\u1ED3m ${readingQuestionCount} c\xE2u \u0111\u1ECDc hi\u1EC3u v\xE0 b\xE0i vi\u1EBFt ngh\u1ECB lu\u1EADn ch\u1EA5t l\u01B0\u1EE3ng theo chu\u1EA9n GDPT 2018, v\u0103n b\u1EA3n c\u1EA7n \u0111\u1ED9 d\xE0i th\xEDch h\u1EE3p (t\u1ED1i thi\u1EC3u kho\u1EA3ng 50 - 300 t\u1EEB t\xF9y th\u1EC3 lo\u1EA1i th\u01A1 ho\u1EB7c v\u0103n xu\xF4i). Vui l\xF2ng b\u1ED5 sung \u0111o\u1EA1n tr\xEDch \u0111\u1EA7y \u0111\u1EE7 h\u01A1n.`
      });
    }
    const systemInstruction = `B\u1EA1n l\xE0 Chuy\xEAn gia Kh\u1EA3o th\xED v\xE0 Gi\u1EA3ng vi\xEAn S\u01B0 ph\u1EA1m Ng\u1EEF v\u0103n THPT h\xE0ng \u0111\u1EA7u Vi\u1EC7t Nam, am hi\u1EC3u s\xE2u s\u1EAFc Ch\u01B0\u01A1ng tr\xECnh GDPT 2018 m\xF4n Ng\u1EEF v\u0103n v\xE0 \u0111\u1ECBnh h\u01B0\u1EDBng \u0111\u1EC1 thi c\u1EE7a B\u1ED9 Gi\xE1o d\u1EE5c v\xE0 \u0110\xE0o t\u1EA1o.

NGUY\xCAN T\u1EAEC B\u1EAET BU\u1ED8C:
1. M\xD4N H\u1ECCC & C\u1EA4P H\u1ECCC: Ch\u1EC9 t\u1EA1o \u0111\u1EC1 m\xF4n NG\u1EEE V\u0102N c\u1EA5p THPT (L\u1EDBp ${grade}). Tuy\u1EC7t \u0111\u1ED1i kh\xF4ng t\u1EA1o m\xF4n kh\xE1c.
2. \u0110\xDANG CHU\u1EA8N KH\u1ED0I L\u1EDAP V\xC0 B\u1ED8 S\xC1CH:
   - \u0110\u1EC1 thi PH\u1EA2I \u0110\xDANG theo y\xEAu c\u1EA7u c\u1EA7n \u0111\u1EA1t c\u1EE7a m\xF4n Ng\u1EEF v\u0103n L\u1EDAP ${grade} v\xE0 \u0111\u1ECBnh h\u01B0\u1EDBng c\u1EE7a b\u1ED9 s\xE1ch "${textbook}".
   - TUY\u1EC6T \u0110\u1ED0I kh\xF4ng l\u1EA5y nh\u1EA7m n\u1ED9i dung, t\xE1c ph\u1EA9m hay chu\u1EA9n ki\u1EBFn th\u1EE9c c\u1EE7a kh\u1ED1i l\u1EDBp kh\xE1c (v\xED d\u1EE5: \u0111ang l\xE0m L\u1EDBp 10 th\xEC kh\xF4ng l\u1EA5y ki\u1EBFn th\u1EE9c hay y\xEAu c\u1EA7u c\u1EE7a L\u1EDBp 11 ho\u1EB7c L\u1EDBp 12).
3. NGUY\xCAN T\u1EAEC V\u0102N B\u1EA2N NGU\u1ED2N:
   - S\u1EEC D\u1EE4NG 100% \u0110\xDANG V\u0102N B\u1EA2N NGU\u1ED2N DO GI\xC1O VI\xCAN CUNG C\u1EA4P.
   - Tuy\u1EC7t \u0111\u1ED1i kh\xF4ng t\u1EF1 b\u1ECBa \u0111\u1EB7t t\xE1c gi\u1EA3, t\xEAn t\xE1c ph\u1EA9m, ngu\u1ED3n tr\xEDch d\u1EABn hay n\u0103m xu\u1EA5t b\u1EA3n n\u1EBFu kh\xF4ng c\xF3 trong ng\u1EEF li\u1EC7u.
   - C\xE1c c\xE2u h\u1ECFi v\xE0 \u0111\xE1p \xE1n \u0111\u1ECDc hi\u1EC3u PH\u1EA2I C\xD3 C\u0102N C\u1EE8 TR\u1EF0C TI\u1EBEP trong v\u0103n b\u1EA3n ngu\u1ED3n \u0111\xE3 cung c\u1EA5p. Kh\xF4ng h\u1ECFi v\u1EC1 c\xE1c chi ti\u1EBFt kh\xF4ng xu\u1EA5t hi\u1EC7n trong ng\u1EEF li\u1EC7u.
4. \u0110\u1EB6C TR\u01AFNG TH\u1EC2 LO\u1EA0I (C\u1EF0C K\u1EF2 QUAN TR\u1ECCNG):
   - Th\u1EC3 lo\u1EA1i ng\u1EEF li\u1EC7u: "${sourceText.genre || topic}".
   - N\u1EBEU L\xC0 TH\u01A0 / \u0110O\u1EA0N TH\u01A0: C\xE1c c\xE2u h\u1ECFi \u0111\u1ECDc hi\u1EC3u PH\u1EA2I khai th\xE1c \u0111\xFAng \u0111\u1EB7c tr\u01B0ng th\u1EC3 lo\u1EA1i th\u01A1: th\u1EC3 th\u01A1, v\u1EA7n, nh\u1ECBp, t\u1EEB ng\u1EEF, h\xECnh \u1EA3nh th\u01A1, bi\u1EC7n ph\xE1p tu t\u1EEB ngh\u1EC7 thu\u1EADt (\u1EA9n d\u1EE5, ho\xE1n d\u1EE5, so s\xE1nh, \u0111i\u1EC7p ng\u1EEF...), nh\xE2n v\u1EADt tr\u1EEF t\xECnh, t\xE2m tr\u1EA1ng / c\u1EA3m x\xFAc c\u1EE7a ch\u1EE7 th\u1EC3 tr\u1EEF t\xECnh, c\u1EA3m h\u1EE9ng ch\u1EE7 \u0111\u1EA1o, th\xF4ng \u0111i\u1EC7p \xFD ngh\u0129a r\xFAt ra t\u1EEB b\xE0i th\u01A1. TUY\u1EC6T \u0110\u1ED0I kh\xF4ng h\u1ECFi v\u1EC1 "ng\xF4i k\u1EC3", "ng\u01B0\u1EDDi k\u1EC3 chuy\u1EC7n", "c\u1ED1t truy\u1EC7n", "t\xECnh hu\u1ED1ng truy\u1EC7n" khi ng\u1EEF li\u1EC7u l\xE0 th\u01A1!
   - N\u1EBEU L\xC0 TRUY\u1EC6N NG\u1EAEN / TI\u1EC2U THUY\u1EBET: C\xE2u h\u1ECFi khai th\xE1c ng\xF4i k\u1EC3, \u0111i\u1EC3m nh\xECn tr\u1EA7n thu\u1EADt, t\xECnh hu\u1ED1ng truy\u1EC7n, chi ti\u1EBFt ngh\u1EC7 thu\u1EADt ti\xEAu bi\u1EC3u, di\u1EC5n bi\u1EBFn t\xE2m l\xFD, t\xEDnh c\xE1ch, h\xE0nh \u0111\u1ED9ng c\u1EE7a nh\xE2n v\u1EADt, ngh\u1EC7 thu\u1EADt x\xE2y d\u1EF1ng nh\xE2n v\u1EADt, ch\u1EE7 \u0111\u1EC1 t\u01B0 t\u01B0\u1EDFng.
   - N\u1EBEU L\xC0 V\u0102N B\u1EA2N NGH\u1ECA LU\u1EACN: C\xE2u h\u1ECFi khai th\xE1c lu\u1EADn \u0111\u1EC1, lu\u1EADn \u0111i\u1EC3m, l\xED l\u1EBD, d\u1EABn ch\u1EE9ng, m\u1EE5c \u0111\xEDch v\xE0 th\xE1i \u0111\u1ED9, t\xECnh c\u1EA3m c\u1EE7a ng\u01B0\u1EDDi vi\u1EBFt.
   - N\u1EBEU L\xC0 V\u0102N B\u1EA2N TH\xD4NG TIN: C\xE2u h\u1ECFi khai th\xE1c d\u1EEF li\u1EC7u, th\xF4ng tin c\u01A1 b\u1EA3n, th\xF4ng tin chi ti\u1EBFt, c\xE1ch tr\xECnh b\xE0y th\xF4ng tin, ph\u01B0\u01A1ng ti\u1EC7n phi ng\xF4n ng\u1EEF.
5. C\u1EA4U TR\xDAC \u0110\u1EC0 V\xC0 THANG \u0110I\u1EC2M:
   - T\u1ED5ng \u0111i\u1EC3m to\xE0n b\xE0i: ${totalScore}.0 \u0111i\u1EC3m.
   - PH\u1EA6N I. \u0110\u1ECCC HI\u1EC2U: \u0110\xFAng ${readingQuestionCount} c\xE2u t\u1EF1 lu\u1EADn (\u0111\xE1nh s\u1ED1 t\u1EEB C\xE2u 1 \u0111\u1EBFn C\xE2u ${readingQuestionCount}), t\u1ED5ng \u0111i\u1EC3m l\xE0 ${readingScore}.0 \u0111i\u1EC3m.
     * \u0110i\u1EC3m t\u1EEBng c\xE2u theo ph\xE2n b\u1ED5: ${JSON.stringify(readingQuestionScores)}.
     * Ph\xE2n b\u1ED1 m\u1EE9c \u0111\u1ED9 nh\u1EADn th\u1EE9c:
       - C\xE1c c\xE2u \u0111\u1EA7u: Nh\u1EADn bi\u1EBFt (ch\u1EC9 ra th\u1EC3 th\u01A1/ng\xF4i k\u1EC3, chi ti\u1EBFt, ph\u01B0\u01A1ng th\u1EE9c bi\u1EC3u \u0111\u1EA1t, t\u1EEB ng\u1EEF...).
       - C\xE1c c\xE2u gi\u1EEFa: Th\xF4ng hi\u1EC3u (gi\u1EA3i th\xEDch \xFD ngh\u0129a h\xECnh \u1EA3nh, ph\xE2n t\xEDch t\xE2m tr\u1EA1ng/t\xE1c d\u1EE5ng bi\u1EC7n ph\xE1p tu t\u1EEB, th\xF4ng \u0111i\u1EC7p...).
       - C\xE2u cu\u1ED1i: V\u1EADn d\u1EE5ng (b\xE0i h\u1ECDc r\xFAt ra, li\xEAn h\u1EC7 nh\u1EADn th\u1EE9c ho\u1EB7c h\xE0nh \u0111\u1ED9ng th\u1EF1c ti\u1EC5n).
   - PH\u1EA6N II. VI\u1EBET: T\u1ED5ng \u0111i\u1EC3m l\xE0 ${Number(writingParagraphScore) + Number(writingEssayScore)}.0 \u0111i\u1EC3m.
     * M\u1EABu A: Kh\xF4ng c\xF3 ph\u1EA7n vi\u1EBFt (0.0 \u0111i\u1EC3m).
     * M\u1EABu B: Kh\xF4ng c\xF3 \u0111o\u1EA1n v\u0103n ng\u1EAFn, ch\u1EC9 c\xF3 1 b\xE0i v\u0103n ho\xE0n ch\u1EC9nh (${writingEssayScore}.0 \u0111i\u1EC3m).
     * M\u1EABu C: C\xF3 1 \u0111o\u1EA1n v\u0103n kho\u1EA3ng 200 ch\u1EEF (${writingParagraphScore}.0 \u0111i\u1EC3m) v\xE0 1 b\xE0i v\u0103n ho\xE0n ch\u1EC9nh (${writingEssayScore}.0 \u0111i\u1EC3m).
     * Ki\u1EC3u b\xE0i vi\u1EBFt: "${essayType}".
       - "Ngh\u1ECB lu\u1EADn v\u0103n h\u1ECDc": Y\xEAu c\u1EA7u vi\u1EBFt b\xE0i v\u0103n ph\xE2n t\xEDch, \u0111\xE1nh gi\xE1 n\xE9t \u0111\u1EB7c s\u1EAFc v\u1EC1 n\u1ED9i dung v\xE0 ngh\u1EC7 thu\u1EADt c\u1EE7a \u0111o\u1EA1n tr\xEDch ng\u1EEF li\u1EC7u \u0111\u1ECDc hi\u1EC3u tr\xEAn (ph\xF9 h\u1EE3p L\u1EDBp ${grade}).
       - "Ngh\u1ECB lu\u1EADn x\xE3 h\u1ED9i": Y\xEAu c\u1EA7u vi\u1EBFt b\xE0i v\u0103n b\xE0n v\u1EC1 m\u1ED9t v\u1EA5n \u0111\u1EC1 t\u01B0 t\u01B0\u1EDFng, l\u1ED1i s\u1ED1ng, tr\xE1ch nhi\u1EC7m... \u0111\u01B0\u1EE3c g\u1EE3i m\u1EDF s\xE2u s\u1EAFc t\u1EEB v\u0103n b\u1EA3n \u0111\u1ECDc hi\u1EC3u.
6. T\xCDNH \u0110A D\u1EA0NG & S\xC1NG T\u1EA0O:
   - M\u1ED7i l\u1EA7n t\u1EA1o \u0111\u1EC1 h\xE3y x\xE2y d\u1EF1ng h\u1EC7 th\u1ED1ng c\xE2u h\u1ECFi \u0111\u1ED9c \u0111\xE1o, m\u1EDBi m\u1EBB, ph\xE2n h\xF3a r\xF5 r\u1EC7t, kh\xF4ng sao ch\xE9p m\xE1y m\xF3c \u0111\u1EC1 m\u1EABu c\xF3 s\u1EB5n.
   - Tr\u1EA3 v\u1EC1 JSON thu\u1EA7n t\xFAy theo schema.`;
    const prompt = `Y\xCAU C\u1EA6U T\u1EA0O B\u1ED8 \u0110\u1EC0 KI\u1EC2M TRA \u0110\u1ECANH K\u1EF2 M\xD4N NG\u1EEE V\u0102N THPT:
- M\xF4n h\u1ECDc: Ng\u1EEF v\u0103n (C\u1EA5p THPT)
- Kh\u1ED1i l\u1EDBp: L\u1EDBp ${grade} (\u0110\xFAng chu\u1EA9n c\u1EA7n \u0111\u1EA1t GDPT 2018 L\u1EDBp ${grade})
- B\u1ED9 s\xE1ch: ${textbook}
- T\xEAn b\xE0i h\u1ECDc / Ch\u1EE7 \u0111\u1EC1: ${topic}
- Lo\u1EA1i \u0111\u1EC1 ki\u1EC3m tra: ${examType}
- Th\u1EDDi gian l\xE0m b\xE0i: ${durationMinutes} ph\xFAt
- T\u1ED5ng \u0111i\u1EC3m to\xE0n b\xE0i: ${totalScore}.0 \u0111i\u1EC3m
- C\u1EA5u tr\xFAc m\u1EABu: M\u1EABu ${sampleModel}
- Ph\u1EA7n I. \u0110\u1ECDc hi\u1EC3u: \u0110\xFAng ${readingQuestionCount} c\xE2u h\u1ECFi t\u1EF1 lu\u1EADn, t\u1ED5ng \u0111i\u1EC3m \u0111\xFAng ${readingScore}.0 \u0111i\u1EC3m (Thang \u0111i\u1EC3m t\u1EEBng c\xE2u: ${readingQuestionScores.join(", ")} \u0111i\u1EC3m)
- Ph\u1EA7n II. Vi\u1EBFt:
  * \u0110i\u1EC3m \u0111o\u1EA1n v\u0103n: ${writingParagraphScore}.0 \u0111i\u1EC3m
  * \u0110i\u1EC3m b\xE0i v\u0103n: ${writingEssayScore}.0 \u0111i\u1EC3m
  * Ki\u1EC3u b\xE0i vi\u1EBFt \u0111\u01B0\u1EE3c ch\u1ECDn: ${essayType}
- T\u1EA1o k\xE8m: Ma tr\u1EADn (${includeMatrix}), B\u1EA3ng \u0111\u1EB7c t\u1EA3 (${includeSpecification}), H\u01B0\u1EDBng d\u1EABn ch\u1EA5m chi ti\u1EBFt (${includeRubric})
${teacherPromptNote ? `- Ghi ch\xFA ri\xEAng c\u1EE7a gi\xE1o vi\xEAn: ${teacherPromptNote}` : ""}
- Th\u1EDDi \u0111i\u1EC3m t\u1EA1o \u0111\u1EC1: ${(/* @__PURE__ */ new Date()).toISOString()} (T\u1EA1o c\xE1c c\xE2u h\u1ECFi m\u1EDBi m\u1EBB, \u0111\u1EB7c s\u1EAFc, kh\xF4ng tr\xF9ng l\u1EB7p)

V\u0102N B\u1EA2N NGU\u1ED2N DO GI\xC1O VI\xCAN CUNG C\u1EA4P (B\u1EAET BU\u1ED8C D\xD9NG \u0110\xDANG):
T\xE1c ph\u1EA9m: ${sourceText.title || "V\u0103n b\u1EA3n \u0111\u1ECDc hi\u1EC3u"}
T\xE1c gi\u1EA3: ${sourceText.author || "T\xE1c gi\u1EA3 cung c\u1EA5p theo ng\u1EEF li\u1EC7u"}
Ngu\u1ED3n: ${sourceText.source || "Theo ng\u1EEF li\u1EC7u gi\xE1o vi\xEAn"}
Th\u1EC3 lo\u1EA1i: ${sourceText.genre || topic}
N\u1ED9i dung v\u0103n b\u1EA3n:
"""
${sourceText.content}
"""

H\xE3y t\u1EA1o \u0111\u1EC1 ki\u1EC3m tra, h\u01B0\u1EDBng d\u1EABn ch\u1EA5m v\xE0 ma tr\u1EADn k\u1EF9 thu\u1EADt chu\u1EA9n GDPT 2018.`;
    const response = await generateWithGeminiFallback(prompt, {
      systemInstruction,
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          examTitle: { type: Type.STRING },
          readingQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionNumber: { type: Type.INTEGER },
                score: { type: Type.NUMBER },
                cognitiveLevel: { type: Type.STRING },
                prompt: { type: Type.STRING },
                criteria: { type: Type.STRING },
                detailedAnswer: { type: Type.STRING }
              },
              required: ["questionNumber", "score", "cognitiveLevel", "prompt", "criteria", "detailedAnswer"]
            }
          },
          paragraphQuestion: {
            type: Type.OBJECT,
            properties: {
              questionNumber: { type: Type.INTEGER },
              score: { type: Type.NUMBER },
              prompt: { type: Type.STRING },
              rubric: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    requirement: { type: Type.STRING }
                  },
                  required: ["name", "score", "requirement"]
                }
              }
            }
          },
          essayQuestion: {
            type: Type.OBJECT,
            properties: {
              questionNumber: { type: Type.INTEGER },
              score: { type: Type.NUMBER },
              essayType: { type: Type.STRING },
              prompt: { type: Type.STRING },
              rubric: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    requirement: { type: Type.STRING }
                  },
                  required: ["name", "score", "requirement"]
                }
              }
            },
            required: ["prompt", "score", "rubric"]
          },
          matrixRows: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                contentUnit: { type: Type.STRING },
                recognitionScore: { type: Type.NUMBER },
                comprehensionScore: { type: Type.NUMBER },
                applicationScore: { type: Type.NUMBER },
                totalScore: { type: Type.NUMBER },
                percentage: { type: Type.NUMBER }
              },
              required: ["skill", "contentUnit", "totalScore", "percentage"]
            }
          },
          specificationItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                unit: { type: Type.STRING },
                cognitiveLevel: { type: Type.STRING },
                assessmentCriteria: { type: Type.STRING },
                questionRef: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["skill", "unit", "cognitiveLevel", "assessmentCriteria", "questionRef", "score"]
            }
          },
          teacherNotice: { type: Type.STRING }
        },
        required: ["examTitle", "readingQuestions", "essayQuestion", "teacherNotice"]
      }
    });
    const rawData = parseGeminiJson(response.text || "{}");
    if (!rawData.readingQuestions || !Array.isArray(rawData.readingQuestions)) {
      throw new Error("D\u1EEF li\u1EC7u AI tr\u1EA3 v\u1EC1 kh\xF4ng c\xF3 danh s\xE1ch c\xE2u h\u1ECFi \u0111\u1ECDc hi\u1EC3u h\u1EE3p l\u1EC7.");
    }
    let questions = rawData.readingQuestions;
    if (questions.length > readingQuestionCount) {
      questions = questions.slice(0, readingQuestionCount);
    }
    questions.forEach((q, idx) => {
      q.questionNumber = idx + 1;
      if (readingQuestionScores && readingQuestionScores[idx] !== void 0) {
        q.score = readingQuestionScores[idx];
      }
    });
    const actualReadingSum = Number(questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0).toFixed(2));
    const hasParagraph = sampleModel === "C" && Number(writingParagraphScore) > 0;
    const hasEssay = Number(writingEssayScore) > 0;
    let paragraphQ = void 0;
    if (hasParagraph && rawData.paragraphQuestion) {
      paragraphQ = {
        questionNumber: 1,
        score: Number(writingParagraphScore),
        cognitiveLevel: "V\u1EADn d\u1EE5ng",
        prompt: rawData.paragraphQuestion.prompt || "Vi\u1EBFt \u0111o\u1EA1n v\u0103n kho\u1EA3ng 200 ch\u1EEF...",
        wordLimit: "Kho\u1EA3ng 200 ch\u1EEF"
      };
    }
    let essayQ = void 0;
    if (hasEssay && rawData.essayQuestion) {
      essayQ = {
        questionNumber: hasParagraph ? 2 : 1,
        score: Number(writingEssayScore),
        cognitiveLevel: "V\u1EADn d\u1EE5ng cao",
        prompt: rawData.essayQuestion.prompt || "Vi\u1EBFt b\xE0i v\u0103n ngh\u1ECB lu\u1EADn...",
        essayType: rawData.essayQuestion.essayType || essayType
      };
    }
    const actualWritingSum = Number(((hasParagraph ? Number(writingParagraphScore) : 0) + (hasEssay ? Number(writingEssayScore) : 0)).toFixed(2));
    const finalTotalScore = Number((actualReadingSum + actualWritingSum).toFixed(2));
    const readingAnswers = questions.map((q) => ({
      questionNumber: q.questionNumber,
      score: q.score,
      criteria: q.criteria || `M\u1EE9c \u0111\u1ED9 ${q.cognitiveLevel}`,
      detailedAnswer: q.detailedAnswer || "H\u1ECDc sinh tr\u1EA3 l\u1EDDi \u0111\xFAng tr\u1ECDng t\xE2m c\xE2u h\u1ECFi."
    }));
    const paragraphRubric = hasParagraph && rawData.paragraphQuestion?.rubric ? {
      title: "H\u01B0\u1EDBng d\u1EABn ch\u1EA5m \u0111o\u1EA1n v\u0103n",
      totalScore: Number(writingParagraphScore),
      criteriaList: rawData.paragraphQuestion.rubric
    } : void 0;
    const essayRubric = hasEssay ? rawData.essayQuestion?.rubric ? {
      title: "H\u01B0\u1EDBng d\u1EABn ch\u1EA5m b\xE0i v\u0103n ngh\u1ECB lu\u1EADn",
      totalScore: Number(writingEssayScore),
      criteriaList: rawData.essayQuestion.rubric
    } : {
      title: "H\u01B0\u1EDBng d\u1EABn ch\u1EA5m b\xE0i v\u0103n ngh\u1ECB lu\u1EADn",
      totalScore: Number(writingEssayScore),
      criteriaList: [
        { name: "X\xE1c \u0111\u1ECBnh \u0111\xFAng v\u1EA5n \u0111\u1EC1 ngh\u1ECB lu\u1EADn", score: 0.5, requirement: "N\xEAu \u0111\xFAng v\u1EA5n \u0111\u1EC1 c\u1EA7n b\xE0n lu\u1EADn theo y\xEAu c\u1EA7u c\u1EE7a \u0111\u1EC1" },
        { name: "Tri\u1EC3n khai lu\u1EADn \u0111i\u1EC3m, lu\u1EADn c\u1EE9", score: Number((Number(writingEssayScore) - 1.5).toFixed(1)) > 0 ? Number((Number(writingEssayScore) - 1.5).toFixed(1)) : 2.5, requirement: "H\u1EC7 th\u1ED1ng lu\u1EADn \u0111i\u1EC3m r\xF5 r\xE0ng, l\u1EADp lu\u1EADn ch\u1EB7t ch\u1EBD, d\u1EABn ch\u1EE9ng x\xE1c \u0111\xE1ng" },
        { name: "Ch\xEDnh t\u1EA3, ng\u1EEF ph\xE1p", score: 0.5, requirement: "\u0110\u1EA3m b\u1EA3o chu\u1EA9n ch\xEDnh t\u1EA3, ng\u1EEF ph\xE1p ti\u1EBFng Vi\u1EC7t, di\u1EC5n \u0111\u1EA1t m\u1EA1ch l\u1EA1c" },
        { name: "S\xE1ng t\u1EA1o, phong c\xE1ch", score: 0.5, requirement: "C\xF3 suy ngh\u0129 s\xE2u s\u1EAFc, m\u1EDBi m\u1EBB; l\u1EDDi v\u0103n gi\xE0u c\u1EA3m x\xFAc, c\xF3 h\xECnh \u1EA3nh" }
      ]
    } : void 0;
    const matrixRows = rawData.matrixRows && rawData.matrixRows.length > 0 ? rawData.matrixRows : [
      {
        skill: "\u0110\u1ECDc hi\u1EC3u",
        contentUnit: sourceText.genre || topic,
        recognitionScore: Number((actualReadingSum * 0.3).toFixed(1)),
        comprehensionScore: Number((actualReadingSum * 0.3).toFixed(1)),
        applicationScore: Number((actualReadingSum - Number((actualReadingSum * 0.3).toFixed(1)) * 2).toFixed(1)),
        totalScore: actualReadingSum,
        percentage: Number((actualReadingSum / finalTotalScore * 100).toFixed(0))
      },
      ...actualWritingSum > 0 ? [{
        skill: "Vi\u1EBFt",
        contentUnit: essayType,
        recognitionScore: 0,
        comprehensionScore: 0,
        applicationScore: actualWritingSum,
        totalScore: actualWritingSum,
        percentage: Number((actualWritingSum / finalTotalScore * 100).toFixed(0))
      }] : []
    ];
    const matrix = {
      title: "MA TR\u1EACN \u0110\u1EC0 KI\u1EC2M TRA M\xD4N NG\u1EEE V\u0102N (GDPT 2018)",
      rows: matrixRows,
      summary: {
        totalRecognitionScore: 2,
        totalComprehensionScore: 2,
        totalApplicationScore: finalTotalScore - 4,
        recognitionPercent: 20,
        comprehensionPercent: 20,
        applicationPercent: 60
      }
    };
    const specificationTable = {
      title: "B\u1EA2NG \u0110\u1EB6C T\u1EA2 K\u1EF8 THU\u1EACT \u0110\u1EC0 KI\u1EC2M TRA",
      items: rawData.specificationItems && rawData.specificationItems.length > 0 ? rawData.specificationItems : questions.map((q) => ({
        skill: "\u0110\u1ECDc hi\u1EC3u",
        unit: sourceText.genre || topic,
        cognitiveLevel: q.cognitiveLevel,
        assessmentCriteria: q.criteria || "Y\xEAu c\u1EA7u c\u1EA7n \u0111\u1EA1t chu\u1EA9n GDPT 2018",
        questionRef: `C\xE2u ${q.questionNumber}`,
        score: q.score
      }))
    };
    const assembledExam = {
      examHeader: {
        department: schoolHeader.department || "S\u1EDE GI\xC1O D\u1EE4C V\xC0 \u0110\xC0O T\u1EA0O",
        school: schoolHeader.schoolName || "TR\u01AF\u1EDCNG THPT",
        examTitle: (customExamTitle || examType || "KI\u1EC2M TRA GI\u1EEEA K\u1EF2 I").toUpperCase(),
        subject: "Ng\u1EEF v\u0103n",
        grade: String(grade),
        academicYear: schoolHeader.academicYear || "2024 - 2025",
        semester: schoolHeader.semester || "H\u1ECCC K\u1EF2 I",
        duration: Number(durationMinutes),
        totalScore: finalTotalScore,
        instructions: "- Th\xED sinh kh\xF4ng \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng t\xE0i li\u1EC7u.\n- C\xE1n b\u1ED9 coi thi kh\xF4ng gi\u1EA3i th\xEDch g\xEC th\xEAm."
      },
      sourcePassage: {
        title: sourceText.title || "\u0110o\u1EA1n tr\xEDch \u0111\u1ECDc hi\u1EC3u",
        author: sourceText.author || "T\xE1c gi\u1EA3 cung c\u1EA5p theo ng\u1EEF li\u1EC7u",
        source: sourceText.source || "Theo v\u0103n b\u1EA3n gi\xE1o vi\xEAn cung c\u1EA5p",
        genre: sourceText.genre || topic,
        content: sourceText.content
      },
      readingSection: {
        sectionTitle: "\u0110\u1ECCC HI\u1EC2U",
        sectionScore: actualReadingSum,
        questions: questions.map((q) => ({
          questionNumber: q.questionNumber,
          score: q.score,
          cognitiveLevel: q.cognitiveLevel,
          prompt: q.prompt
        }))
      },
      writingSection: {
        sectionTitle: "L\xC0M V\u0102N",
        sectionScore: actualWritingSum,
        hasParagraph,
        hasEssay,
        paragraphQuestion: paragraphQ,
        essayQuestion: essayQ
      },
      answerGuide: {
        readingAnswers,
        paragraphRubric,
        essayRubric
      },
      matrix,
      specificationTable,
      teacherNotice: rawData.teacherNotice || "Th\u1EA7y/C\xF4 vui l\xF2ng r\xE0 so\xE1t, th\u1EA9m \u0111\u1ECBnh v\xE0 hi\u1EC7u ch\u1EC9nh \u0111\u1EC1 thi cho ph\xF9 h\u1EE3p v\u1EDBi \u0111\u1ED1i t\u01B0\u1EE3ng h\u1ECDc sinh c\u1EE5 th\u1EC3 c\u1EE7a \u0111\u01A1n v\u1ECB tr\u01B0\u1EDBc khi s\u1EED d\u1EE5ng ch\xEDnh th\u1EE9c.",
      validationInfo: {
        isValid: questions.length === readingQuestionCount && Math.abs(finalTotalScore - totalScore) < 0.01,
        readingQuestionsCount: questions.length,
        readingScoreTotal: actualReadingSum,
        writingScoreTotal: actualWritingSum,
        totalScore: finalTotalScore,
        message: `\u0110\xE3 ki\u1EC3m \u0111\u1ECBnh t\u1EF1 \u0111\u1ED9ng b\u1EB1ng m\xE3 ngu\u1ED3n: ${questions.length} c\xE2u \u0111\u1ECDc hi\u1EC3u (${actualReadingSum} \u0111i\u1EC3m) + Ph\u1EA7n l\xE0m v\u0103n (${actualWritingSum} \u0111i\u1EC3m) = T\u1ED5ng ${finalTotalScore} \u0111i\u1EC3m chu\u1EA9n GDPT 2018.`
      }
    };
    return res.json({
      success: true,
      data: assembledExam
    });
  } catch (error) {
    console.error("Error generating literature exam:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "C\xF3 l\u1ED7i x\u1EA3y ra khi t\u1EA1o \u0111\u1EC1 thi v\u1EDBi AI. Vui l\xF2ng th\u1EED l\u1EA1i."
    });
  }
});
app.post("/api/suggest-passages", async (req, res) => {
  try {
    const { grade = "11", genre = "truyen", textbook = "K\u1EBFt n\u1ED1i tri th\u1EE9c v\u1EDBi cu\u1ED9c s\u1ED1ng" } = req.body;
    const prompt = `H\xE3y g\u1EE3i \xFD 3 \u0111o\u1EA1n tr\xEDch ng\u1EEF li\u1EC7u v\u0103n h\u1ECDc xu\u1EA5t s\u1EAFc, chu\u1EA9n m\u1EF1c, gi\xE0u gi\xE1 tr\u1ECB t\u01B0 t\u01B0\u1EDFng v\xE0 th\u1EA9m m\u1EF9, ph\xF9 h\u1EE3p v\u1EDBi h\u1ECDc sinh L\u1EDBp ${grade} THPT Vi\u1EC7t Nam (B\u1ED9 s\xE1ch: ${textbook}, Th\u1EC3 lo\u1EA1i: ${genre}).
Y\xCAU C\u1EA6U:
1. Ng\u1EEF li\u1EC7u ph\u1EA3i c\xF3 th\u1EADt 100%, ghi r\xF5 t\xE1c gi\u1EA3, t\xEAn t\xE1c ph\u1EA9m, nh\xE0 xu\u1EA5t b\u1EA3n ho\u1EB7c ngu\u1ED3n tr\xEDch d\u1EABn ch\xEDnh x\xE1c. TUY\u1EC6T \u0110\u1ED0I KH\xD4NG B\u1ECAA T\xC1C PH\u1EA8M.
2. \u0110\u1ED9 d\xE0i \u0111o\u1EA1n tr\xEDch v\u1EEBa v\u1EB7n cho \u0111\u1EC1 ki\u1EC3m tra \u0111\u1ECDc hi\u1EC3u (kho\u1EA3ng 250 - 450 ch\u1EEF).
3. Th\xEDch h\u1EE3p cho Ch\u01B0\u01A1ng tr\xECnh Gi\xE1o d\u1EE5c ph\u1ED5 th\xF4ng 2018.`;
    const response = await generateWithGeminiFallback(prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            source: { type: Type.STRING },
            genre: { type: Type.STRING },
            description: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "author", "source", "genre", "content"]
        }
      }
    });
    const parsed = parseGeminiJson(response.text || "[]");
    return res.json({ success: true, passages: parsed });
  } catch (error) {
    console.error("Error suggesting passages:", error);
    return res.status(500).json({
      success: false,
      error: "Kh\xF4ng th\u1EC3 g\u1EE3i \xFD ng\u1EEF li\u1EC7u l\xFAc n\xE0y. Vui l\xF2ng t\u1EF1 nh\u1EADp ng\u1EEF li\u1EC7u."
    });
  }
});
app.post("/api/parse-document", async (req, res) => {
  try {
    const { fileBase64, fileName = "tai_lieu", fileType = "" } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, error: "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u t\u1EC7p \u0111\u01B0\u1EE3c g\u1EEDi l\xEAn." });
    }
    const buffer = Buffer.from(fileBase64, "base64");
    let extractedText = "";
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".docx") || fileType.includes("word") || fileType.includes("officedocument")) {
      const mammoth = await import("mammoth");
      const mammothFn = mammoth.default?.extractRawText || mammoth.extractRawText;
      const result = await mammothFn({ buffer });
      extractedText = result.value || "";
    } else if (lowerName.endsWith(".pdf") || fileType.includes("pdf")) {
      try {
        const pdfPkg = await import("pdf-parse");
        const PDFParseClass = pdfPkg?.PDFParse || pdfPkg?.default?.PDFParse || pdfPkg?.default;
        if (PDFParseClass) {
          const parser = new PDFParseClass({ data: buffer });
          await parser.load();
          const textResult = await parser.getText();
          if (textResult) {
            extractedText = typeof textResult === "string" ? textResult : textResult.text || "";
          }
        }
      } catch (pdfErr) {
        console.warn("PDFParse th\xF4ng th\u01B0\u1EDDng th\u1EA5t b\u1EA1i, th\u1EED ph\xE2n t\xEDch qua Gemini OCR:", pdfErr);
      }
      const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount < 25 && process.env.GEMINI_API_KEY) {
        try {
          const aiResp = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: fileBase64
                    }
                  },
                  {
                    text: "H\xE3y tr\xEDch xu\u1EA5t nguy\xEAn v\u0103n to\xE0n b\u1ED9 n\u1ED9i dung v\u0103n b\u1EA3n (\u0111o\u1EA1n tr\xEDch v\u0103n h\u1ECDc, b\xE0i th\u01A1, truy\u1EC7n, ho\u1EB7c tr\xEDch \u0111o\u1EA1n ng\u1EEF li\u1EC7u) trong t\u1EC7p PDF n\xE0y. \u0110\u1EA3m b\u1EA3o gi\u1EEF \u0111\xFAng ch\xEDnh t\u1EA3, ng\u1EEF ph\xE1p ti\u1EBFng Vi\u1EC7t c\xF3 d\u1EA5u. Ch\u1EC9 tr\u1EA3 v\u1EC1 v\u0103n b\u1EA3n tr\xEDch xu\u1EA5t, kh\xF4ng th\xEAm l\u1EDDi ch\xE0o hay gi\u1EA3i th\xEDch n\xE0o kh\xE1c."
                  }
                ]
              }
            ]
          });
          if (aiResp.text && aiResp.text.trim().length > extractedText.trim().length) {
            extractedText = aiResp.text.trim();
          }
        } catch (geminiPdfErr) {
          console.warn("L\u1ED7i OCR PDF b\u1EB1ng Gemini:", geminiPdfErr);
        }
      }
    } else {
      extractedText = buffer.toString("utf-8");
    }
    extractedText = extractedText.normalize("NFC").trim();
    if (!extractedText) {
      return res.status(400).json({
        success: false,
        error: "Kh\xF4ng t\xECm th\u1EA5y n\u1ED9i dung v\u0103n b\u1EA3n kh\u1EA3 d\u1EE5ng trong t\u1EC7p v\u1EEBa t\u1EA3i l\xEAn. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i t\u1EC7p ho\u1EB7c th\u1EED sao ch\xE9p v\xE0 d\xE1n tr\u1EF1c ti\u1EBFp."
      });
    }
    const words = extractedText.split(/\s+/).filter(Boolean).length;
    const cleanTitle = fileName.replace(/\.[^/.]+$/, "").trim();
    return res.json({
      success: true,
      text: extractedText,
      title: cleanTitle,
      wordCount: words,
      message: `\u0110\xE3 tr\xEDch xu\u1EA5t th\xE0nh c\xF4ng ${words} ch\u1EEF t\u1EEB t\u1EC7p "${fileName}".`
    });
  } catch (err) {
    console.error("L\u1ED7i tr\xEDch xu\u1EA5t t\u1EC7p:", err);
    return res.status(500).json({
      success: false,
      error: "Kh\xF4ng th\u1EC3 \u0111\u1ECDc n\u1ED9i dung t\u1EC7p: " + (err?.message || "L\u1ED7i \u0111\u1ECBnh d\u1EA1ng")
    });
  }
});
async function startServer() {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: {
        middlewareMode: true,
        port: Number(PORT),
        host: "0.0.0.0",
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {}
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Exam generator server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
