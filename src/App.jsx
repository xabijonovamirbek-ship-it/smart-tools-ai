import { useState, useRef } from "react";

const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "uz", label: "O'zbek" },
  { code: "en", label: "English" },
];

const TABS = [
  { id: "resume", icon: "📄", label: "Резюме" },
  { id: "portfolio", icon: "💼", label: "Портфолио" },
  { id: "translate", icon: "🌐", label: "Перевод" },
  { id: "poem", icon: "✍️", label: "Стихи" },
  { id: "names", icon: "👶", label: "Имена" },
];

const S = {
  input: { width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "none" },
  btnPrimary: { width: "100%", padding: "14px 0", borderRadius: 18, background: "linear-gradient(135deg, #7C3AED, #9333EA)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" },
  btnPrimaryDisabled: { width: "100%", padding: "14px 0", borderRadius: 18, background: "linear-gradient(135deg, #7C3AED, #9333EA)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "not-allowed", opacity: 0.4 },
  btnLang: (active) => ({ flex: 1, padding: "10px 0", borderRadius: 14, background: active ? "#7C3AED" : "rgba(255,255,255,0.08)", color: active ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }),
  card: { background: "rgba(255,255,255,0.07)", borderRadius: 18, padding: 20, border: "1px solid rgba(255,255,255,0.12)" },
};

async function callAI(prompt, systemPrompt = "") {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini",
      max_tokens: 1000,
      system: systemPrompt || "You are a helpful assistant.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

function ResumeTool() {
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", city: "", jobTitle: "", company: "", experience: "", education: "", skills: "", lang: "ru" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handlePhoto = (e) => { const file = e.target.files[0]; if (!file) return; setPhotoPreview(URL.createObjectURL(file)); };
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const langLabels = { ru: "русском", uz: "o'zbek tilida", en: "English" };

  const generate = async () => {
    setLoading(true); setResult(null);
    try {
      const prompt = `Создай профессиональное резюме на ${langLabels[form.lang]} языке. Верни ТОЛЬКО JSON без markdown: {"name":"","jobTitle":"","contact":"Телефон | Email | Город","summary":"","experience":[{"role":"","company":"","desc":""}],"education":"","skills":[]} Данные: Имя: ${form.firstName} ${form.lastName}, Телефон: ${form.phone}, Email: ${form.email}, Город: ${form.city}, Должность: ${form.jobTitle}, Компания: ${form.company}, Опыт: ${form.experience}, Образование: ${form.education}, Навыки: ${form.skills}`;
      const raw = await callAI(prompt, "You are a professional resume writer. Return only valid JSON, no markdown.");
      const clean = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) { setResult({ error: "Ошибка генерации. Попробуй снова." }); }
    setLoading(false);
  };

  const printResume = () => {
    const win = window.open("", "_blank");
    const photoHTML = photoPreview ? `<img src="${photoPreview}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid #7C3AED;display:block;margin-bottom:12px;" />` : `<div style="width:110px;height:110px;border-radius:50%;background:#e0ddff;display:flex;align-items:center;justify-content:center;font-size:38px;margin-bottom:12px;">👤</div>`;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Resume</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:sans-serif;background:#fff;color:#1a1a2e;}.page{display:flex;min-height:100vh;}.sidebar{width:220px;background:#7C3AED;color:#fff;padding:32px 20px;flex-shrink:0;}.sidebar h1{font-size:20px;font-weight:700;margin-bottom:4px;}.t{font-size:12px;opacity:.8;margin-bottom:20px;}.sec{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;opacity:.7;margin:18px 0 8px;}.sidebar p{font-size:12px;line-height:1.6;opacity:.9;}.sk{display:inline-block;background:rgba(255,255,255,.2);border-radius:12px;padding:3px 10px;font-size:11px;margin:3px 2px;}.main{flex:1;padding:40px 36px;}.sh{font-size:13px;font-weight:700;color:#7C3AED;text-transform:uppercase;border-bottom:2px solid #7C3AED;padding-bottom:4px;margin:24px 0 12px;}.sum{font-size:13px;line-height:1.7;color:#444;}.ei{margin-bottom:14px;}.er{font-size:14px;font-weight:600;}.ec{font-size:12px;color:#7C3AED;margin-bottom:4px;}.ed{font-size:12px;color:#555;line-height:1.6;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body><div class="page"><div class="sidebar"><div style="display:flex;flex-direction:column;align-items:center;text-align:center">${photoHTML}<h1>${result.name}</h1><div class="t">${result.jobTitle}</div></div><div class="sec">Контакты</div><p>${result.contact?.split("|").join("<br/>")}</p><div class="sec">Навыки</div><div>${(result.skills||[]).map(s=>`<span class="sk">${s}</span>`).join("")}</div></div><div class="main"><div class="sh">О себе</div><p class="sum">${result.summary}</p><div class="sh">Опыт</div>${(result.experience||[]).map(e=>`<div class="ei"><div class="er">${e.role}</div><div class="ec">${e.company}</div><div class="ed">${e.desc}</div></div>`).join("")}<div class="sh">Образование</div><p class="sum">${result.education}</p></div></div></body></html>`);
    win.document.close(); setTimeout(() => win.print(), 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>{LANGUAGES.map((l) => (<button key={l.code} onClick={() => set("lang", l.code)} style={S.btnLang(form.lang === l.code)}>{l.label}</button>))}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div onClick={() => fileRef.current.click()} style={{ width: 80, height: 80, borderRadius: "50%", border: "2px dashed #7C3AED", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "rgba(255,255,255,0.08)", flexShrink: 0 }}>
          {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 30 }}>👤</span>}
        </div>
        <div><p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>Фото профиля</p><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Нажми чтобы добавить</p></div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input style={S.input} placeholder="Имя" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
        <input style={S.input} placeholder="Фамилия" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
        <input style={S.input} placeholder="Телефон" value={form.phone} onChange={e => set("phone", e.target.value)} />
        <input style={S.input} placeholder="Email" value={form.email} onChange={e => set("email", e.target.value)} />
        <input style={S.input} placeholder="Город" value={form.city} onChange={e => set("city", e.target.value)} />
        <input style={S.input} placeholder="Должность" value={form.jobTitle} onChange={e => set("jobTitle", e.target.value)} />
      </div>
      <input style={S.input} placeholder="Компания (последнее место работы)" value={form.company} onChange={e => set("company", e.target.value)} />
      <textarea style={S.textarea} rows={3} placeholder="Опыт работы" value={form.experience} onChange={e => set("experience", e.target.value)} />
      <input style={S.input} placeholder="Образование" value={form.education} onChange={e => set("education", e.target.value)} />
      <input style={S.input} placeholder="Навыки (через запятую)" value={form.skills} onChange={e => set("skills", e.target.value)} />
      <button onClick={generate} disabled={loading || !form.firstName} style={loading || !form.firstName ? S.btnPrimaryDisabled : S.btnPrimary}>{loading ? "⏳ Генерирую..." : "✨ Создать резюме"}</button>
      {result && !result.error && (
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {photoPreview && <img src={photoPreview} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid #7C3AED" }} />}
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{result.name}</p>
              <p style={{ color: "#a78bfa", fontSize: 13 }}>{result.jobTitle}</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{result.contact}</p>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{result.summary}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {(result.skills || []).map((s, i) => (<span key={i} style={{ background: "rgba(124,58,237,0.3)", color: "#c4b5fd", fontSize: 12, padding: "4px 12px", borderRadius: 999 }}>{s}</span>))}
          </div>
          <button onClick={printResume} style={{ width: "100%", padding: "12px 0", borderRadius: 14, background: "#fff", color: "#7C3AED", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>📥 Скачать PDF</button>
        </div>
      )}
      {result?.error && <p style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{result.error}</p>}
    </div>
  );
}

function PortfolioTool() {
  const [form, setForm] = useState({ name: "", profession: "", age: "", city: "", about: "", skills: "", telegram: "", instagram: "", lang: "ru" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handlePhoto = (e) => { const file = e.target.files[0]; if (!file) return; setPhotoPreview(URL.createObjectURL(file)); };
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const generate = async () => {
    setLoading(true); setResult(null);
    try {
      const langName = form.lang === "uz" ? "o'zbek tilida lotin yozuvida" : form.lang === "en" ? "English" : "русском";
      const prompt = `Создай портфолио фрилансера на ${langName} языке. Верни ТОЛЬКО JSON без markdown: {"name":"","profession":"","tagline":"","bio":"","skills":[],"whyMe":[],"offer":""} Данные: Имя: ${form.name}, Профессия: ${form.profession}, Возраст: ${form.age}, Город: ${form.city}, О себе: ${form.about}, Навыки: ${form.skills}`;
      const raw = await callAI(prompt, `You are a copywriter. Language: ${form.lang}. If uz - ONLY Latin. If ru - ONLY Cyrillic. Return only valid JSON.`);
      const clean = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) { setResult({ error: "Ошибка генерации. Попробуй снова." }); }
    setLoading(false);
  };

  const printPortfolio = () => {
    const win = window.open("", "_blank");
    const photoHTML = photoPreview ? `<img src="${photoPreview}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid #7C3AED;margin-bottom:16px;" />` : `<div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#9333EA);display:flex;align-items:center;justify-content:center;font-size:48px;margin-bottom:16px;">👤</div>`;
    const contacts = [form.telegram ? `✈️ ${form.telegram}` : "", form.instagram ? `📸 ${form.instagram}` : ""].filter(Boolean).join(" | ");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Portfolio</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:sans-serif;background:#0f0c29;color:#fff;}.hero{background:linear-gradient(135deg,#1a1040,#2d1b69);padding:48px 32px;text-align:center;}h1{font-size:32px;font-weight:900;margin-bottom:8px;}.prof{font-size:18px;color:#a78bfa;margin-bottom:8px;}.tag{font-size:15px;color:rgba(255,255,255,0.7);margin-bottom:16px;}.body{padding:32px;}.sec{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7C3AED;margin:24px 0 10px;}.bio{font-size:14px;line-height:1.8;color:rgba(255,255,255,0.8);}.skills{display:flex;flex-wrap:wrap;gap:8px;}.skill{background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);color:#c4b5fd;padding:6px 14px;border-radius:999px;font-size:13px;}.why{display:flex;flex-direction:column;gap:10px;}.why-item{background:rgba(255,255,255,0.05);border-left:3px solid #7C3AED;padding:12px 16px;border-radius:0 12px 12px 0;font-size:13px;color:rgba(255,255,255,0.8);}.offer{background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(147,51,234,0.2));border:1px solid rgba(124,58,237,0.3);border-radius:16px;padding:20px;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.85);}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body><div class="hero">${photoHTML}<h1>${result.name}</h1><div class="prof">${result.profession}</div><div class="tag">${result.tagline}</div>${contacts ? `<div style="font-size:13px;color:rgba(255,255,255,0.5)">${contacts}</div>` : ""}</div><div class="body"><div class="sec">О себе</div><p class="bio">${result.bio}</p><div class="sec">Навыки</div><div class="skills">${(result.skills||[]).map(s=>`<span class="skill">${s}</span>`).join("")}</div><div class="sec">Почему я?</div><div class="why">${(result.whyMe||[]).map(r=>`<div class="why-item">✓ ${r}</div>`).join("")}</div><div class="sec">Что предлагаю</div><div class="offer">${result.offer}</div></div></body></html>`);
    win.document.close(); setTimeout(() => win.print(), 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>{LANGUAGES.map((l) => (<button key={l.code} onClick={() => set("lang", l.code)} style={S.btnLang(form.lang === l.code)}>{l.label}</button>))}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div onClick={() => fileRef.current.click()} style={{ width: 80, height: 80, borderRadius: "50%", border: "2px dashed #7C3AED", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "rgba(255,255,255,0.08)", flexShrink: 0 }}>
          {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 30 }}>👤</span>}
        </div>
        <div><p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>Фото профиля</p><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Нажми чтобы добавить</p></div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input style={S.input} placeholder="Твоё имя" value={form.name} onChange={e => set("name", e.target.value)} />
        <input style={S.input} placeholder="Профессия" value={form.profession} onChange={e => set("profession", e.target.value)} />
        <input style={S.input} placeholder="Возраст" value={form.age} onChange={e => set("age", e.target.value)} />
        <input style={S.input} placeholder="Город" value={form.city} onChange={e => set("city", e.target.value)} />
        <input style={S.input} placeholder="Telegram (@username)" value={form.telegram} onChange={e => set("telegram", e.target.value)} />
        <input style={S.input} placeholder="Instagram (@username)" value={form.instagram} onChange={e => set("instagram", e.target.value)} />
      </div>
      <textarea style={S.textarea} rows={3} placeholder="О себе (опыт, достижения)" value={form.about} onChange={e => set("about", e.target.value)} />
      <input style={S.input} placeholder="Навыки (через запятую)" value={form.skills} onChange={e => set("skills", e.target.value)} />
      <button onClick={generate} disabled={loading || !form.name || !form.profession} style={loading || !form.name || !form.profession ? S.btnPrimaryDisabled : S.btnPrimary}>{loading ? "⏳ Создаю..." : "✨ Создать портфолио"}</button>
      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...S.card, textAlign: "center" }}>
            {photoPreview && <img src={photoPreview} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #7C3AED", marginBottom: 12 }} />}
            <p style={{ color: "#fff", fontWeight: 900, fontSize: 22, marginBottom: 4 }}>{result.name}</p>
            <p style={{ color: "#a78bfa", fontSize: 15, marginBottom: 8 }}>{result.profession}</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontStyle: "italic" }}>{result.tagline}</p>
          </div>
          <div style={S.card}>
            <p style={{ color: "#7C3AED", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>О себе</p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.8 }}>{result.bio}</p>
          </div>
          <div style={S.card}>
            <p style={{ color: "#7C3AED", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Навыки</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(result.skills||[]).map((s,i) => (<span key={i} style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", color: "#c4b5fd", padding: "6px 14px", borderRadius: 999, fontSize: 13 }}>{s}</span>))}
            </div>
          </div>
          <div style={S.card}>
            <p style={{ color: "#7C3AED", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Почему я?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(result.whyMe||[]).map((r,i) => (<div key={i} style={{ background: "rgba(255,255,255,0.04)", borderLeft: "3px solid #7C3AED", padding: "10px 14px", borderRadius: "0 12px 12px 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>✓ {r}</div>))}
            </div>
          </div>
          <div style={{ ...S.card, background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(147,51,234,0.2))" }}>
            <p style={{ color: "#7C3AED", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Что предлагаю</p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.7 }}>{result.offer}</p>
          </div>
          <button onClick={printPortfolio} style={{ width: "100%", padding: "14px 0", borderRadius: 18, background: "#fff", color: "#7C3AED", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>📥 Скачать PDF</button>
        </div>
      )}
      {result?.error && <p style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{result.error}</p>}
    </div>
    </div>
  );
}

function TranslateTool() {
  const [text, setText] = useState("");
  const [from, setFrom] = useState("ru");
  const [to, setTo] = useState("en");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true); setResult("");
    const langNames = { ru: "русский", uz: "узбекский (латиница)", en: "английский" };
    const res = await callAI(`Переведи с ${langNames[from]} на ${langNames[to]}. Верни только перевод:\n\n${text}`, "You are a translator. Return only translated text.");
    setResult(res.trim()); setLoading(false);
  };

  const swap = () => { setFrom(to); setTo(from); setResult(""); };
  const selectStyle = { flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px", color: "#fff", fontSize: 13, outline: "none" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>{LANGUAGES.map(l => <option key={l.code} value={l.code} style={{ background: "#1a1a2e" }}>{l.label}</option>)}</select>
        <button onClick={swap} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(124,58,237,0.3)", color: "#fff", border: "none", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>⇄</button>
        <select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>{LANGUAGES.map(l => <option key={l.code} value={l.code} style={{ background: "#1a1a2e" }}>{l.label}</option>)}</select>
      </div>
      <textarea style={S.textarea} rows={5} placeholder="Введи текст..." value={text} onChange={e => setText(e.target.value)} />
      <button onClick={translate} disabled={loading || !text.trim()} style={loading || !text.trim() ? S.btnPrimaryDisabled : S.btnPrimary}>{loading ? "⏳ Перевожу..." : "🌐 Перевести"}</button>
      {result && (<div style={S.card}><p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Перевод</p><p style={{ color: "#fff", fontSize: 14, lineHeight: 1.7 }}>{result}</p><button onClick={() => navigator.clipboard.writeText(result)} style={{ marginTop: 10, color: "#a78bfa", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>📋 Копировать</button></div>)}
    </div>
  );
}

function PoemTool() {
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState("ru");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setResult("");
    const langNames = { ru: "русском", uz: "узбекском (латиница)", en: "английском" };
    const res = await callAI(`Напиши красивое стихотворение на ${langNames[lang]} языке на тему: "${topic}". 3-4 строфы. Верни только стихотворение.`, "You are a poet. Write beautiful poetry.");
    setResult(res.trim()); setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>{LANGUAGES.map((l) => (<button key={l.code} onClick={() => setLang(l.code)} style={S.btnLang(lang === l.code)}>{l.label}</button>))}</div>
      <input style={S.input} placeholder="Тема стихотворения..." value={topic} onChange={e => setTopic(e.target.value)} />
      <button onClick={generate} disabled={loading || !topic.trim()} style={loading || !topic.trim() ? S.btnPrimaryDisabled : S.btnPrimary}>{loading ? "⏳ Пишу..." : "✨ Написать стихотворение"}</button>
      {result && (<div style={S.card}><pre style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{result}</pre><button onClick={() => navigator.clipboard.writeText(result)} style={{ marginTop: 10, color: "#a78bfa", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>📋 Копировать</button></div>)}
    </div>
  );
}

function NamesTool() {
  const [dadName, setDadName] = useState("");
  const [momName, setMomName] = useState("");
  const [gender, setGender] = useState("boy");
  const [lang, setLang] = useState("ru");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setResult(null);
    const genderLabel = gender === "boy" ? "мальчика" : "девочки";
    const res = await callAI(`Предложи 5 красивых имён для ${genderLabel}, папа — ${dadName}, мама — ${momName}. Верни ТОЛЬКО JSON без markdown: [{"name":"","meaning":"","origin":""}] ВАЖНО: язык ${lang}. Если uz — ТОЛЬКО латиница. Если ru — ТОЛЬКО кириллица.`, `You are a names expert. Return only valid JSON array. Language: ${lang}. If uz - ONLY Latin. If ru - ONLY Cyrillic.`);
    try { const clean = res.replace(/```json|```/g, "").trim(); setResult(JSON.parse(clean)); }
    catch { setResult([{ name: "Ошибка", meaning: "Попробуй снова", origin: "" }]); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>{LANGUAGES.map((l) => (<button key={l.code} onClick={() => setLang(l.code)} style={S.btnLang(lang === l.code)}>{l.label}</button>))}</div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setGender("boy")} style={{ flex: 1, padding: "12px 0", borderRadius: 18, background: gender === "boy" ? "#3B82F6" : "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>👦 Мальчик</button>
        <button onClick={() => setGender("girl")} style={{ flex: 1, padding: "12px 0", borderRadius: 18, background: gender === "girl" ? "#EC4899" : "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>👧 Девочка</button>
      </div>
      <input style={S.input} placeholder="Имя папы" value={dadName} onChange={e => setDadName(e.target.value)} />
      <input style={S.input} placeholder="Имя мамы" value={momName} onChange={e => setMomName(e.target.value)} />
      <button onClick={generate} disabled={loading || !dadName || !momName} style={loading || !dadName || !momName ? S.btnPrimaryDisabled : S.btnPrimary}>{loading ? "⏳ Подбираю..." : "✨ Найти имена"}</button>
      {result && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{result.map((item, i) => (<div key={i} style={{ ...S.card, display: "flex", alignItems: "flex-start", gap: 12 }}><span style={{ fontSize: 28 }}>{gender === "boy" ? "👦" : "👧"}</span><div><p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{item.name}</p><p style={{ color: "#a78bfa", fontSize: 12, marginTop: 2 }}>{item.origin}</p><p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 4 }}>{item.meaning}</p></div></div>))}</div>)}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("resume");
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#fff" }}>
      <div style={{ padding: "32px 20px 16px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>✦ Smart Tools</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>AI инструменты в одном месте</p>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 20px 16px", overflowX: "auto" }}>
        {TABS.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 18, background: tab === t.id ? "#7C3AED" : "rgba(255,255,255,0.08)", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.55)", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, boxShadow: tab === t.id ? "0 4px 20px rgba(124,58,237,0.4)" : "none" }}><span>{t.icon}</span><span>{t.label}</span></button>))}
      </div>
      <div style={{ padding: "0 20px 40px" }}>
        {tab === "resume" && <ResumeTool />}
        {tab === "portfolio" && <PortfolioTool />}
        {tab === "translate" && <TranslateTool />}
        {tab === "poem" && <PoemTool />}
        {tab === "names" && <NamesTool />}
      </div>
    </div>
  );
      }
