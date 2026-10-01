import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Menu, Plus, Home, History, Image, Compass, Building2, GraduationCap, BriefcaseBusiness, CalendarDays, Phone, Sun, Info, Bot, Send, Paperclip, ChevronLeft, ChevronRight, Trash2, X, ExternalLink, MessageCircle, UserRound} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const official = 'https://witsolapur.org/';
const seedSuggestions = [
  'Tell me about WIT Solapur',
  'What departments are available?',
  'Tell me about placements',
  'How do I get admission?'
];
const navItems = [
  ['Home', Home], ['History', History], ['Images', Image], ['Explore', Compass],
  ['Campus Info', Building2], ['Departments', GraduationCap], ['Admissions', GraduationCap],
  ['Placements', BriefcaseBusiness], ['Events', CalendarDays], ['Contact', Phone]
];

function App(){
  const [active,setActive]=useState('Home');
  const [messages,setMessages]=useState([]);
  const [question,setQuestion]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [sidebar,setSidebar]=useState(true);
  const [history,setHistory]=useState(()=>JSON.parse(localStorage.getItem('wit_ai_history')||'[]'));
  const [dark,setDark]=useState(true);
  const [suggestionPage,setSuggestionPage]=useState(0);

  useEffect(()=>localStorage.setItem('wit_ai_history',JSON.stringify(history)),[history]);
  const suggestions=useMemo(()=>suggestionPage%2===0?seedSuggestions:['What courses are offered?','How can I contact WIT?','Tell me about campus facilities','What admission information is available?'],[suggestionPage]);

  const newChat=()=>{setMessages([]);setQuestion('');setError('');setActive('Home');};
  const ask=async(q=question)=>{
    const text=q.trim(); if(!text||loading)return;
    const user={role:'user',content:text}; setMessages(m=>[...m,user]); setQuestion('');setLoading(true);setError('');
    try{
      const res=await fetch(`${API}/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:text})});
      const data=await res.json(); if(!res.ok) throw new Error(data.detail||'Unable to get a response');
      const bot={role:'assistant',content:data.answer||'No answer received.'}; setMessages(m=>[...m,bot]);
      setHistory(h=>[{id:Date.now(),question:text,answer:bot.content,createdAt:new Date().toLocaleString()},...h].slice(0,50));
    }catch(e){setError(e.message);setMessages(m=>[...m,{role:'assistant',content:'Sorry, I could not reach the WIT AI backend. Please make sure the backend is running on port 8000.'}]);}
    finally{setLoading(false)}
  };
  const selectNav=(name)=>{setActive(name); if(name==='History')return; if(name==='Images'){window.open(official,'_blank');return;} if(name==='Explore'||['Campus Info','Departments','Admissions','Placements','Events','Contact'].includes(name)){setQuestion(`Tell me about ${name.toLowerCase()} at WIT.`);setActive('Home');}};
  const restore=(item)=>{setMessages([{role:'user',content:item.question},{role:'assistant',content:item.answer}]);setActive('Home');};

  return <div className={`app ${dark?'dark':'light'} ${sidebar?'':'collapsed'}`}>
    <div className="campus-bg"/><div className="overlay"/>
    <aside className="sidebar">
      <div className="brand"><div className="logo"><Bot size={25}/></div><div><h2>WIT AI BOT</h2><span>Walchand Institute of Technology</span></div><button className="icon-btn top-menu" onClick={()=>setSidebar(false)}><Menu/></button></div>
      <button className="new-chat" onClick={newChat}><Plus/> New Chat</button>
      <nav>{navItems.map(([name,Icon])=><button key={name} onClick={()=>selectNav(name)} className={`nav-item ${active===name?'active':''}`}><Icon size={20}/><span>{name}</span></button>)}</nav>
      <div className="side-bottom"><button className="nav-item" onClick={()=>setDark(v=>!v)}><Sun size={20}/><span>{dark?'Light Mode':'Dark Mode'}</span></button><button className="nav-item" onClick={()=>window.open(official,'_blank')}><Info size={20}/><span>About WIT</span></button>
      <div className="bot-card"><div className="bot-circle"><Bot/></div><div><b>WIT AI Bot</b><p>Your smart assistant for all information about Walchand Institute of Technology, Solapur</p></div><small>Made with ❤️ for WITians</small></div></div>
    </aside>
    {!sidebar&&<button className="open-side icon-btn" onClick={()=>setSidebar(true)}><Menu/></button>}
    <main className="main">
      {active==='History'?<HistoryView history={history} restore={restore} clear={()=>setHistory([])} />:<>
        {messages.length===0?<Welcome suggestions={suggestions} ask={ask} next={()=>setSuggestionPage(p=>p+1)} prev={()=>setSuggestionPage(p=>p-1)} />:<ChatView messages={messages} loading={loading}/>} 
        {error&&<div className="error"><X size={16}/>{error}</div>}
        <ChatInput question={question} setQuestion={setQuestion} ask={ask} loading={loading}/>
        <div className="disclaimer">WIT AI Bot may make mistakes. Please verify important information on the <a href={official} target="_blank">official website <ExternalLink size={12}/></a>.</div>
      </>}
    </main>
  </div>
}

function Welcome({suggestions,ask,next,prev}){return <section className="welcome"><div className="hero"><div className="wave">👋</div><div className="welcome-text">Welcome to</div><h1><span>WIT</span> AI Bot</h1><p>Your intelligent assistant for Walchand Institute of Technology, Solapur</p></div><div className="feature-grid"><Feature icon={<MessageCircle/>} title="Ask Anything" text="Get answers to your questions instantly"/><Feature icon={<Building2/>} title="Campus Info" text="Explore departments, facilities and more"/><Feature icon={<CalendarDays/>} title="Events & Updates" text="Stay updated with latest events and notices"/><Feature icon={<UserRound/>} title="Student Help" text="Get guidance for admissions, placements and more"/></div><div className="suggest-wrap"><p>Try asking something like:</p><div className="suggestions"><button className="round" onClick={prev}><ChevronLeft/></button>{suggestions.map(s=><button key={s} onClick={()=>ask(s)}>{s}</button>)}<button className="round" onClick={next}><ChevronRight/></button></div></div></section>}
function Feature({icon,title,text}){return <div className="feature"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>}
function ChatView({messages,loading}){return <section className="chat-view">{messages.map((m,i)=><div className={`message ${m.role}`} key={i}><div className="avatar">{m.role==='user'?<UserRound/>:<Bot/>}</div><div className="bubble">{m.content}</div></div>)}{loading&&<div className="message assistant"><div className="avatar"><Bot/></div><div className="bubble typing"><i/><i/><i/></div></div>}</section>}
function HistoryView({history,restore,clear}){return <section className="history-view"><div className="history-head"><div><h1>Chat History</h1><p>Your previous WIT AI conversations are saved locally in this browser.</p></div>{history.length>0&&<button className="clear" onClick={clear}><Trash2/> Clear history</button>}</div>{history.length===0?<div className="empty"><History size={48}/><h2>No chat history yet</h2><p>Start a conversation and it will appear here.</p></div>:<div className="history-list">{history.map(item=><button key={item.id} className="history-card" onClick={()=>restore(item)}><b>{item.question}</b><span>{item.answer.slice(0,170)}{item.answer.length>170?'…':''}</span><small>{item.createdAt}</small></button>)}</div>}</section>}
function ChatInput({question,setQuestion,ask,loading}){return <div className="input-area"><div className="input-box"><Paperclip className="attach"/><textarea value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}}} placeholder="Ask me anything about WIT..." rows="1"/><button className="send" disabled={loading||!question.trim()} onClick={()=>ask()}><Send size={21}/></button></div></div>}
createRoot(document.getElementById('root')).render(<App/>);
