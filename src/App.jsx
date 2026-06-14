import { useState, useRef } from "react";
const LANGUAGES=[{code:"ru",label:"Русский"},{code:"uz",label:"O'zbek"},{code:"en",label:"English"}];
const TABS=[{id:"resume",icon:"📄",label:"Резюме"},{id:"translate",icon:"🌐",label:"Перевод"},{id:"poem",icon:"✍️",label:"Стихи"},{id:"names",icon:"👶",label:"Имена"}];
async function callClaude(prompt,systemPrompt=""){
const response=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:systemPrompt||"You are a helpful assistant.",messages:[{role:"user",content:prompt}]})});
const data=await response.json();
return data.content?.map((b)=>b.text||"").join("")||"";
}
function ResumeTool(){
const[form,setForm]=useState({firstName:"",lastName:"",phone:"",email:"",city:"",jobTitle:"",company:"",experience:"",education:"",skills:"",lang:"ru"});
const[photoPreview,setPhotoPreview]=useState(null);
const[result,setResult]=useState(null);
const[loading,setLoading]=useState(false);
const fileRef=useRef();
const handlePhoto=(e)=>{const file=e.target.files[0];if(!file)return;setPhotoPreview(URL.createObjectURL(file));};
const langLabels={ru:"русском",uz:"o'zbek tilida",en:"English"};
const generate=async()=>{
setLoading(true);setResult(null);
try{
const prompt=`Создай резюме на ${langLabels[form.lang]} языке. Верни ТОЛЬКО JSON: {"name":"","jobTitle":"","contact":"","summary":"","experience":[{"role":"","company":"","desc":""}],"education":"","skills":[]} Имя: ${form.firstName} ${form.lastName}, Телефон: ${form.phone}, Email: ${form.email}, Город: ${form.city}, Должность: ${form.jobTitle}, Компания: ${form.company}, Опыт: ${form.experience}, Образование: ${form.education}, Навыки: ${form.skills}`;
const raw=await callClaude(prompt,"Return only valid JSON, no markdown.");
const clean=raw.replace(/```json|```/g,"").trim();
setResult(JSON.parse(clean));
}catch(e){setResult({error:"Ошибка. Попробуй снова."});}
setLoading(false);
};
const printResume=()=>{
const win=window.open("","_blank");
const ph=photoPreview?`<img src="${photoPreview}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;"/>`:`<div style="width:100px;height:100px;border-radius:50%;background:#e0ddff;display:flex;align-items:center;justify-content:center;font-size:36px;">👤</div>`;
win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif}.page{display:flex;min-height:100vh}.sidebar{width:200px;background:#6C63FF;color:#fff;padding:24px 16px}.main{flex:1;padding:32px}.sh{font-weight:700;color:#6C63FF;border-bottom:2px solid #6C63FF;padding-bottom:2px;margin:16px 0 8px;font-size:12px;text-transform:uppercase}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="page"><div class="sidebar"><div style="text-align:center;margin-bottom:16px">${ph}<h2 style="margin-top:8px;font-size:16px">${result.name}</h2><p style="font-size:11px;opacity:0.8">${result.jobTitle}</p></div><p style="font-size:10px;opacity:0.7;text-transform:uppercase;margin-bottom:4px">Контакты</p><p style="font-size:11px">${(result.contact||"").split("|").join("<br/>")}</p><p style="font-size:10px;opacity:0.7;text-transform:uppercase;margin:12px 0 4px">Навыки</p>${(result.skills||[]).map(s=>`<span style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:10px;padding:2px 8px;font-size:10px;margin:2px">${s}</span>`).join("")}</div><div class="main"><div class="sh">О себе</div><p style="font-size:12px;line-height:1.6">${result.summary}</p><div class="sh">Опыт</div>${(result.experience||[]).map(e=>`<div style="margin-bottom:10px"><b style="font-size:13px">${e.role}</b><p style="color:#6C63FF;font-size:11px">${e.company}</p><p style="font-size:11px;color:#555">${e.desc}</p></div>`).join("")}<div class="sh">Образование</div><p style="font-size:12px">${result.education}</p></div></div></body></html>`);
win.document.close();
setTimeout(()=>win.print(),600);
};
const set=(k,v)=>setForm((p)=>({...p,[k]:v}));
const inp="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-violet-400 transition";
return(<div className="space-y-4">
<div className="flex gap-2">{LANGUAGES.map((l)=>(<button key={l.code} onClick={()=>set("lang",l.code)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${form.lang===l.code?"bg-violet-500 text-white":"bg-white/10 text-white/60"}`}>{l.label}</button>))}</div>
<div className="flex items-center gap-4">
<div onClick={()=>fileRef.current.click()} className="w-20 h-20 rounded-full border-2 border-dashed border-violet-400 flex items-center justify-center cursor-pointer overflow-hidden bg-white/10 flex-shrink-0">
{photoPreview?<img src={photoPreview} className="w-full h-full object-cover"/>:<span className="text-3xl">👤</span>}
</div>
<div><p className="text-white/80 text-sm font-medium">Фото профиля</p><p className="text-white/40 text-xs">Нажми чтобы добавить</p></div>
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
</div>
<div className="grid grid-cols-2 gap-3">
<input className={inp} placeholder="Имя" value={form.firstName} onChange={e=>set("firstName",e.target.value)}/>
<input className={inp} placeholder="Фамилия" value={form.lastName} onChange={e=>set("lastName",e.target.value)}/>
<input className={inp} placeholder="Телефон" value={form.phone} onChange={e=>set("phone",e.target.value)}/>
<input className={inp} placeholder="Email" value={form.email} onChange={e=>set("email",e.target.value)}/>
<input className={inp} placeholder="Город" value={form.city} onChange={e=>set("city",e.target.value)}/>
<input className={inp} placeholder="Должность" value={form.jobTitle} onChange={e=>set("jobTitle",e.target.value)}/>
</div>
<input className={inp} placeholder="Компания" value={form.company} onChange={e=>set("company",e.target.value)}/>
<textarea className={inp+" resize-none"} rows={3} placeholder="Опыт работы" value={form.experience} onChange={e=>set("experience",e.target.value)}/>
<input className={inp} placeholder="Образование" value={form.education} onChange={e=>set("education",e.target.value)}/>
<input className={inp} placeholder="Навыки (через запятую)" value={form.skills} onChange={e=>set("skills",e.target.value)}/>
<button onClick={generate} disabled={loading||!form.firstName} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40">{loading?"⏳ Генерирую...":"✨ Создать резюме"}</button>
{result&&!result.error&&(<div className="bg-white/10 rounded-2xl p-5 border border-white/20 space-y-3">
<div className="flex items-center gap-3">{photoPreview&&<img src={photoPreview} className="w-14 h-14 rounded-full object-cover border-2 border-violet-400"/>}<div><p className="text-white font-bold text-lg">{result.name}</p><p className="text-violet-300 text-sm">{result.jobTitle}</p></div></div>
<p className="text-white/80 text-sm">{result.summary}</p>
<button onClick={printResume} className="w-full py-3 rounded-xl bg-white text-violet-700 font-bold text-sm">📥 Скачать PDF</button>
</div>)}
{result?.error&&<p className="text-red-400 text-sm text-center">{result.error}</p>}
</div>);}
function TranslateTool(){
const[text,setText]=useState("");
const[from,setFrom]=useState("ru");
const[to,setTo]=useState("en");
const[result,setResult]=useState("");
const[loading,setLoading]=useState(false);
const translate=async()=>{
if(!text.trim())return;
setLoading(true);
const langNames={ru:"русский",uz:"узбекский (латиница)",en:"английский"};
const res=await callClaude(`Переведи с ${langNames[from]} на ${langNames[to]}. Только перевод:\n\n${text}`,"You are a translator. Return only translated text.");
setResult(res.trim());
setLoading(false);
};
const inp="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-violet-400 transition resize-none";
return(<div className="space-y-4">
<div className="flex items-center gap-2">
<select value={from} onChange={e=>setFrom(e.target.value)} className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white text-sm focus:outline-none">{LANGUAGES.map(l=><option key={l.code} value={l.code} className="bg-gray-900">{l.label}</option>)}</select>
<button onClick={()=>{setFrom(to);setTo(from);setResult("");}} className="w-10 h-10 rounded-full bg-violet-500/30 text-white text-lg">⇄</button>
<select value={to} onChange={e=>setTo(e.target.value)} className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white text-sm focus:outline-none">{LANGUAGES.map(l=><option key={l.code} value={l.code} className="bg-gray-900">{l.label}</option>)}</select>
</div>
<textarea className={inp} rows={5} placeholder="Введи текст..." value={text} onChange={e=>setText(e.target.value)}/>
<button onClick={translate} disabled={loading||!text.trim()} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40">{loading?"⏳ Перевожу...":"🌐 Перевести"}</button>
{result&&(<div className="bg-white/10 rounded-2xl p-5 border border-white/20">
<p className="text-white/50 text-xs mb-2 uppercase">Перевод</p>
<p className="text-white text-sm leading-relaxed">{result}</p>
<button onClick={()=>navigator.clipboard.writeText(result)} className="mt-3 text-violet-300 text-xs">📋 Копировать</button>
</div>)}
</div>);}
function PoemTool(){
const[topic,setTopic]=useState("");
const[lang,setLang]=useState("ru");
const[result,setResult]=useState("");
const[loading,setLoading]=useState(false);
const generate=async()=>{
if(!topic.trim())return;
setLoading(true);
const langNames={ru:"русском",uz:"узбекском (латиница)",en:"английском"};
const res=await callClaude(`Напиши красивое стихотворение на ${langNames[lang]} языке на тему: "${topic}". 3-4 строфы с рифмами. Только стихотворение.`,"You are a talented poet.");
setResult(res.trim());
setLoading(false);
};
const inp="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-violet-400 transition";
return(<div className="space-y-4">
<div className="flex gap-2">{LANGUAGES.map(l=><button key={l.code} onClick={()=>setLang(l.code)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${lang===l.code?"bg-violet-500 text-white":"bg-white/10 text-white/60"}`}>{l.label}</button>)}</div>
<input className={inp} placeholder="Тема (любовь, природа, дружба...)" value={topic} onChange={e=>setTopic(e.target.value)}/>
<button onClick={generate} disabled={loading||!topic.trim()} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40">{loading?"⏳ Пишу...":"✨ Написать стихотворение"}</button>
{result&&(<div className="bg-white/10 rounded-2xl p-5 border border-white/20">
<pre className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result}</pre>
<button onClick={()=>navigator.clipboard.writeText(result)} className="mt-3 text-violet-300 text-xs">📋 Копировать</button>
</div>)}
</div>);}
function NamesTool(){
const[dadName,setDadName]=useState("");
const[momName,setMomName]=useState("");
const[gender,setGender]=useState("boy");
const[lang,setLang]=useState("ru");
const[result,setResult]=useState(null);
const[loading,setLoading]=useState(false);
const generate=async()=>{
setLoading(true);setResult(null);
const genderLabel=gender==="boy"?"мальчика":"девочки";
const langNames={ru:"русском",uz:"узбекском",en:"английском"};
const res=await callClaude(`Предложи 5 красивых имён для ${genderLabel}, папа — ${dadName}, мама — ${momName}. Верни ТОЛЬКО JSON: [{"name":"","meaning":"","origin":""}] на ${langNames[lang]} языке.`,"Return only valid JSON array, no markdown.");
try{setResult(JSON.parse(res.replace(/```json|```/g,"").trim()));}
catch{setResult([{name:"Ошибка",meaning:"Попробуй снова",origin:""}]);}
setLoading(false);
};
const inp="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-violet-400 transition";
return(<div className="space-y-4">
<div className="flex gap-2">{LANGUAGES.map(l=><button key={l.code} onClick={()=>setLang(l.code)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${lang===l.code?"bg-violet-500 text-white":"bg-white/10 text-white/60"}`}>{l.label}</button>)}</div>
<div className="flex gap-3">
<button onClick={()=>setGender("boy")} className={`flex-1 py-3 rounded-2xl text-sm font-bold transition ${gender==="boy"?"bg-blue-500 text-white":"bg-white/10 text-white/60"}`}>👦 Мальчик</button>
<button onClick={()=>setGender("girl")} className={`flex-1 py-3 rounded-2xl text-sm font-bold transition ${gender==="girl"?"bg-pink-500 text-white":"bg-white/10 text-white/60"}`}>👧 Девочка</button>
</div>
<input className={inp} placeholder="Имя папы" value={dadName} onChange={e=>setDadName(e.target.value)}/>
<input className={inp} placeholder="Имя мамы" value={momName} onChange={e=>setMomName(e.target.value)}/>
<button onClick={generate} disabled={loading||!dadName||!momName} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40">{loading?"⏳ Подбираю...":"✨ Найти имена"}</button>
{result&&(<div className="space-y-3">{result.map((item,i)=>(<div key={i} className="bg-white/10 rounded-2xl p-4 border border-white/20 flex items-start gap-3"><span className="text-2xl">{gender==="boy"?"👦":"👧"}</span><div><p className="text-white font-bold">{item.name}</p><p className="text-violet-300 text-xs">{item.origin}</p><p className="text-white/70 text-sm mt-1">{item.meaning}</p></div></div>))}</div>)}
</div>);}
export default function App(){
const[tab,setTab]=useState("resume");
return(<div style={{minHeight:"100vh",background:"linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"}} className="flex flex-col">
<div className="px-5 pt-8 pb-4"><h1 className="text-white text-2xl font-black tracking-tight">✦ Smart Tools</h1><p className="text-white/40 text-sm mt-1">AI инструменты в одном месте</p></div>
<div className="flex gap-2 px-5 pb-4 overflow-x-auto">{TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition flex-shrink-0 ${tab===t.id?"bg-violet-500 text-white":"bg-white/10 text-white/60"}`}><span>{t.icon}</span><span>{t.label}</span></button>))}</div>
<div className="flex-1 px-5 pb-8">
{tab==="resume"&&<ResumeTool/>}
{tab==="translate"&&<TranslateTool/>}
{tab==="poem"&&<PoemTool/>}
{tab==="names"&&<NamesTool/>}
</div>
</div>);}
