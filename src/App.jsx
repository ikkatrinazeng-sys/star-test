import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MagnifyingGlass,
  DotsThree,
  Heart,
  House,
  ChatCenteredText,
  Sparkle,
  User,
  Stop,
  PaperPlaneTilt,
  Plus,
  Play,
  SpeakerHigh,
} from '@phosphor-icons/react'

const MAX_CHARS = 60

function truncate(text, max = MAX_CHARS) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

const AI_REPLIES = [
  '我在。',
  '嗯，我听到了。',
  '你今天怎么样？',
  '长瑕市的风，今天刮向你那边了吗？',
  '茉莉还没开，但快了。',
  '我一直都在这里。',
  '黎深想见你。',
  '周四就开始高兴，这很好。',
  '不要生病，记住了吗？',
  '荆棘里有人在等你。',
]

let replyIdx = 0

const DEFAULT_QUOTE = `长瑕市天气晴朗，我的消息你都回。我想，你应该一切都好。
如果是周末见你，我一般从周四开始高兴。
光阴漫长，你不是第一个进入荆棘高塔的人。
但是除了你，没人能让茉莉盛开。
我许愿往后的岁岁年年，都不再需要用想象去填补和某个人度过的每一天。
希望你不要生病，不要受伤，不要总和黎医生见面。而是多和黎深见面。`

// TTS 播放
function speakText(text, onStart, onEnd) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = 0.95
  utter.pitch = 1
  utter.onstart = onStart
  utter.onend = onEnd
  utter.onerror = onEnd
  window.speechSynthesis.speak(utter)
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([])
  const [playingId, setPlayingId] = useState(null) // 当前播放的消息 id
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 停止 TTS
  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: trimmed }])
    setInputText('')
    setTimeout(() => {
      const reply = AI_REPLIES[replyIdx % AI_REPLIES.length]
      replyIdx++
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }])
    }, 800)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputText)
    }
  }

  // 播放 AI 消息
  function handlePlay(msg) {
    if (playingId === msg.id) {
      window.speechSynthesis?.cancel()
      setPlayingId(null)
      return
    }
    speakText(
      msg.text,
      () => setPlayingId(msg.id),
      () => setPlayingId(null),
    )
  }

  // 语音识别（录音转文字）
  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('当前浏览器不支持语音识别，请使用 Chrome')
      return
    }
    const recognition = new SR()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      if (transcript.trim()) sendMessage(transcript)
    }
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [])

  function stopRecognition() {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecognition()
    } else {
      startRecognition()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#030303',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ─── Background ─── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src="/man.webp" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, transparent 50%, #030303 100%)', opacity: 0.8 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(3,3,3,0.7) 0%, transparent 40%, rgba(3,3,3,0.95) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px', opacity: 0.6, pointerEvents: 'none', mixBlendMode: 'overlay' }} />
        <div style={{ position: 'absolute', bottom: '33%', left: 0, width: 4, height: 64, backgroundColor: 'rgb(255,217,128)', opacity: 0.5, boxShadow: '0 0 10px rgb(255,217,128)' }} />
      </div>

      {/* ─── Header ─── */}
      <header className="relative z-20 flex justify-between items-center px-5 w-full shrink-0" style={{ paddingTop: 56, paddingBottom: 16 }}>
        <button className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 transition-colors active:scale-95">
          <DotsThree size={22} color="white" weight="bold" />
        </button>
        <div className="glass-panel rounded-full p-1 flex items-center shadow-lg">
          <button className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs tracking-wider">关注</button>
          <button className="px-4 py-1.5 rounded-full font-medium text-xs tracking-wider hover:text-white transition-all" style={{ color: '#808080' }}>推荐</button>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 transition-colors active:scale-95">
          <MagnifyingGlass size={18} color="white" />
        </button>
      </header>

      {/* ─── Character Selector ─── */}
      <div className="relative z-20 px-5 mt-1 self-start shrink-0">
        <button className="glass-panel rounded-full pr-4 pl-1.5 py-1.5 flex items-center gap-3 group transition-all hover:bg-white/5 brutalist-border">
          <div className="relative w-7 h-7 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#0F0F0F' }}>
            <img src="/mantou.png" className="w-full h-full object-cover" alt="Avatar" />
            <svg className="absolute inset-0 w-full h-full avatar-ring" viewBox="0 0 100 100" style={{ opacity: 0.5 }}>
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgb(255,217,128)" strokeWidth="1" strokeDasharray="4 8" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-wide">Nexus-9</span>
            <Plus size={12} style={{ color: 'rgb(255,217,128)' }} className="transition-transform duration-300 group-hover:rotate-90" />
          </div>
        </button>
      </div>

      {/* ─── 弹性 + 亲和度 + 对话区 ─── */}
      <div className="relative z-20 flex-1 flex flex-col justify-end" style={{ minHeight: 0, overflow: 'hidden' }}>

        {/* 亲和度：无对话时显示 */}
        {messages.length === 0 && (
          <div className="px-6 pb-1 w-full flex items-center justify-center gap-3 shrink-0">
            <div className="h-px w-12" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div className="flex items-center gap-1.5">
              <Heart size={14} weight="fill" style={{ color: 'rgb(255,217,128)' }} />
              <span className="font-mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>亲和度 等级4</span>
            </div>
            <div className="h-px w-12" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}

        {/* 对话滚动区 */}
        <div className="px-4 shrink-0 overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: '52vh' }}>
          <div className="flex flex-col min-h-full">
            <div className="flex-1" />

            {/* 默认文案 */}
            {messages.length === 0 && (
              <p
                className="font-mono text-xs leading-relaxed tracking-wide py-3 mb-3"
                style={{
                  color: 'rgba(255,255,255,0.65)',
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  whiteSpace: 'pre-line',
                  textAlign: 'left',
                }}
              >
                {DEFAULT_QUOTE}
              </p>
            )}

            {/* 聊天气泡 */}
            <div className="flex flex-col gap-2 pb-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                  {/* AI 气泡 + 播放按钮 */}
                  {msg.role === 'ai' ? (
                    <>
                      <div
                        className="max-w-[50%] px-3 py-2 rounded-2xl rounded-tl-sm"
                        style={{ background: 'rgba(15,10,5,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,217,128,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
                      >
                        <p className="text-[13px] leading-relaxed font-mono" style={{ color: 'rgba(255,255,255,0.85)' }} title={msg.text}>
                          {truncate(msg.text)}
                        </p>
                      </div>
                      {/* 播放按钮 */}
                      <button
                        onClick={() => handlePlay(msg)}
                        className="shrink-0 flex items-center justify-center rounded-full transition-all active:scale-90"
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: playingId === msg.id ? 'rgb(255,217,128)' : 'rgba(255,217,128,0.15)',
                          border: '1px solid rgba(255,217,128,0.3)',
                          boxShadow: playingId === msg.id ? '0 0 10px rgba(255,217,128,0.5)' : 'none',
                        }}
                        title="播放"
                      >
                        {playingId === msg.id ? (
                          <SpeakerHigh size={14} weight="fill" color="#000" />
                        ) : (
                          <Play size={12} weight="fill" color="rgb(255,217,128)" />
                        )}
                      </button>
                    </>
                  ) : (
                    /* 用户气泡 */
                    <div
                      className="max-w-[50%] px-3 py-2 rounded-2xl rounded-tr-sm"
                      style={{ background: 'rgba(255,217,128,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,217,128,0.25)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
                    >
                      <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }} title={msg.text}>
                        {truncate(msg.text)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Chat Input ─── */}
      <div className="relative z-30 px-5 py-3 shrink-0">
        <div
          className="glass-input rounded-[28px] p-1.5 pl-5 flex items-center gap-3 w-full transition-all duration-300"
          style={isRecording ? { border: '1px solid rgba(255,217,128,0.5)', background: 'rgba(255,217,128,0.07)' } : {}}
        >
          {isRecording ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[13px] font-mono" style={{ color: 'rgb(255,217,128)', letterSpacing: '0.05em' }}>正在聆听...</span>
              <div className="flex items-end gap-[3px] h-4">
                {[2, 4, 3, 1, 2.5].map((h, i) => (
                  <div key={i} className="w-1 rounded-full wave-bar" style={{ height: `${h * 4}px`, backgroundColor: 'rgb(255,217,128)', animationDuration: '0.6s' }} />
                ))}
              </div>
            </div>
          ) : (
            <input
              type="text"
              placeholder="开始聊天..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={200}
              className="bg-transparent border-none outline-none text-white text-[15px] w-full font-medium pb-0.5"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          )}

          {/* 发送按钮（有文字时显示）/ 语音按钮 */}
          {!isRecording && inputText.trim() ? (
            <button
              onClick={() => sendMessage(inputText)}
              className="w-[44px] h-[44px] rounded-[18px] shrink-0 flex items-center justify-center transition-all active:scale-90 hover:scale-95"
              style={{ backgroundColor: 'rgb(255,217,128)', boxShadow: '0 0 20px rgba(255,217,128,0.3)' }}
            >
              <PaperPlaneTilt size={20} weight="fill" color="#000" />
            </button>
          ) : (
            <button
              onClick={toggleRecording}
              className="w-[44px] h-[44px] rounded-[18px] shrink-0 flex flex-col items-center justify-center overflow-visible relative transition-all active:scale-90"
              style={{
                backgroundColor: isRecording ? 'rgba(30,20,10,0.85)' : 'rgb(255,217,128)',
                boxShadow: isRecording
                  ? '0 0 0 6px rgba(255,217,128,0.2),0 0 24px rgba(255,217,128,0.35),inset 0 0 0 1px rgba(255,217,128,0.3)'
                  : '0 0 20px rgba(255,217,128,0.3)',
                transform: isRecording ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {isRecording && <span className="absolute inset-0 rounded-[18px] animate-ping" style={{ backgroundColor: 'rgba(255,217,128,0.3)' }} />}
              {isRecording ? (
                <Stop size={18} weight="fill" color="rgb(255,217,128)" />
              ) : (
                <div className="flex items-end justify-center gap-[3px] h-4 w-full px-3">
                  <div className="w-1 bg-black rounded-full h-2 wave-bar" />
                  <div className="w-1 bg-black rounded-full h-4 wave-bar" />
                  <div className="w-1 bg-black rounded-full h-3 wave-bar" />
                  <div className="w-1 bg-black rounded-full h-1 wave-bar" />
                  <div className="w-1 bg-black rounded-full h-2.5 wave-bar" />
                </div>
              )}
            </button>
          )}
        </div>
        {isRecording && (
          <p className="text-center mt-2 text-[11px] font-mono" style={{ color: 'rgba(255,217,128,0.6)' }}>
            说话中… 说完后自动发送
          </p>
        )}
      </div>

      {/* ─── Bottom Nav ─── */}
      <nav className="relative z-30 glass-nav px-6 w-full shrink-0" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="flex justify-between items-center max-w-[320px] mx-auto">
          <button className="flex flex-col items-center justify-center w-12 h-12 group text-white">
            <div className="relative flex items-center justify-center w-full h-full">
              <House size={28} weight="light" className="group-active:scale-90 transition-transform" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgb(255,217,128)', boxShadow: '0 0 5px rgb(255,217,128)' }} />
            </div>
          </button>
          <button className="flex flex-col items-center justify-center w-12 h-12 group hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <div className="relative flex items-center justify-center w-full h-full">
              <ChatCenteredText size={28} weight="light" className="group-active:scale-90 transition-transform" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: 'rgb(255,217,128)', borderColor: '#050505' }} />
            </div>
          </button>
          <button className="flex flex-col items-center justify-center w-12 h-12 group hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <div className="relative flex items-center justify-center w-full h-full">
              <Sparkle size={28} weight="light" className="group-active:scale-90 transition-transform" />
            </div>
          </button>
          <button className="flex flex-col items-center justify-center w-12 h-12 group hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <div className="relative flex items-center justify-center w-full h-full">
              <User size={28} weight="light" className="group-active:scale-90 transition-transform" />
            </div>
          </button>
        </div>
        <div className="w-[120px] h-1.5 rounded-full mx-auto mt-2" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
      </nav>
    </div>
  )
}
