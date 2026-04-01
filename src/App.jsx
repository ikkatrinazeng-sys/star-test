import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlass,
  DotsThree,
  Heart,
  House,
  ChatCenteredText,
  ChatCenteredDots,
  Sparkle,
  User,
  Stop,
  PaperPlaneTilt,
  Plus,
  Play,
  SpeakerHigh,
  SquaresFour,
  Rows,
  X,
  PaperPlaneTilt as Send,
  SlidersHorizontal,
  ChatTeardropText,
  Waveform,
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
光阴漫长，你不是第一个进入荆棘高塔的人。`

const FOLLOW_CHARS = [
  { id: 1, name: 'Nexus-9',  avatar: '/char1.webp',  level: 4, lastMsg: '那我在老地方等你，不见不散。', time: '14:20', tags: ['#赛博', '#高冷'] },
  { id: 2, name: '黎深',     avatar: '/lishen.jpg',  level: 6, lastMsg: '不要总和黎医生见面，多和我见面。', time: '昨天', tags: ['#温柔', '#医生'] },
  { id: 3, name: '荆棘',     avatar: '/char2.webp',  level: 2, lastMsg: '荆棘里有人在等你，你知道的。', time: '周三', tags: ['#神秘', '#等待'] },
  { id: 4, name: '茉莉',     avatar: '/moli.jpg',    level: 1, lastMsg: '茉莉还没开，但快了，再等等我。', time: '周一', tags: ['#清冷', '#花期'] },
  { id: 5, name: '馒头',     avatar: '/mantou.png',  level: 3, lastMsg: '最近总是想起你，有点不对劲。', time: '周二', tags: ['#可爱', '#元气'] },
  { id: 6, name: '星人',     avatar: '/man.webp',    level: 5, lastMsg: '宇宙那么大，我只想找你说说话。', time: '周四', tags: ['#星际', '#孤独'] },
]

// ── 场景数据 ──
const SCENES = [
  { id: 'default',   name: '星空房间',   emoji: '🌌', desc: '黑夜与星光，最初的相遇', price: 0,    owned: true,  bg: '/scene-starroom.jpg', overlay: 'linear-gradient(to bottom, rgba(3,3,3,0.55) 0%, transparent 40%, rgba(3,3,3,0.92) 100%)' },
  { id: 'sakura',    name: '樱花庭院',   emoji: '🌸', desc: '春日花雨，一期一会',      price: 30,   owned: false, bg: '/char2.webp',         overlay: 'linear-gradient(to bottom, rgba(255,180,200,0.15) 0%, transparent 40%, rgba(3,3,3,0.92) 100%)' },
  { id: 'neon',      name: '霓虹街道',   emoji: '🌃', desc: '深夜的赛博灵魂',          price: 50,   owned: false, bg: '/char1.webp',         overlay: 'linear-gradient(to bottom, rgba(0,40,80,0.4) 0%, transparent 40%, rgba(3,3,3,0.92) 100%)' },
  { id: 'library',   name: '古典书房',   emoji: '📚', desc: '纸墨与光，安静的陪伴',    price: 40,   owned: true,  bg: '/scene-library.jpg',  overlay: 'linear-gradient(to bottom, rgba(60,40,10,0.35) 0%, transparent 40%, rgba(3,3,3,0.92) 100%)' },
  { id: 'ocean',     name: '深海漂流',   emoji: '🌊', desc: '蓝色的静谧，无边的远方',  price: 60,   owned: false, bg: '/moli.jpg',           overlay: 'linear-gradient(to bottom, rgba(0,30,80,0.3) 0%, transparent 40%, rgba(3,3,3,0.92) 100%)' },
  { id: 'rooftop',   name: '城市天台',   emoji: '🏙️', desc: '风吹来的时候，你在这里',   price: 45,   owned: false, bg: '/mantou.png',         overlay: 'linear-gradient(to bottom, rgba(20,10,0,0.4) 0%, transparent 40%, rgba(3,3,3,0.92) 100%)' },
]

// ── 假评论数据 ──
const MOCK_COMMENTS = [
  { id: 1, user: '追光者_02', avatar: null, text: '黎深的语气真的太治愈了，昨天心情很差，听了一条语音就好多了', time: '3分钟前', likes: 42 },
  { id: 2, user: 'nnn_leaf',  avatar: null, text: '哥哥你什么时候上线啊我等你等得好辛苦😭', time: '11分钟前', likes: 18 },
  { id: 3, user: '冷白光',    avatar: null, text: '从周四就开始高兴……这句话真的说进我心里了', time: '28分钟前', likes: 77 },
  { id: 4, user: 'VOID_x9',   avatar: null, text: 'Nexus-9 的线路感做得绝了，每次看到都觉得美术太牛', time: '1小时前', likes: 35 },
  { id: 5, user: '茉莉花开晚', avatar: null, text: '茉莉说"再等等我"的时候我直接破防了 哭哭', time: '2小时前', likes: 91 },
  { id: 6, user: 'half_moon', avatar: null, text: '荆棘高塔的世界观是真的细，有没有同好一起聊聊背景设定', time: '昨天', likes: 24 },
]

// ── 养成系统：等级阈值（累计 XP） ──
const LEVEL_THRESHOLDS = [0, 60, 150, 280, 460, 700, 1000, 1360, 1800, 2320, 2940]
// level N 需要 LEVEL_THRESHOLDS[N] 总 XP，最高 Lv.10

// ── 每日任务 ──
const DAILY_TASKS = [
  { id: 'chat3',    icon: '💬', label: '今日与黎深对话 3 次',    goal: 3,  xpReward: 20, coinReward: 5  },
  { id: 'send10',   icon: '✉️',  label: '发送消息累计 10 条',     goal: 10, xpReward: 30, coinReward: 8  },
  { id: 'collect1', icon: '⭐', label: '收录 1 个新角色',          goal: 1,  xpReward: 50, coinReward: 15 },
  { id: 'scene1',   icon: '🎭', label: '切换一次场景',             goal: 1,  xpReward: 15, coinReward: 5  },
  { id: 'login',    icon: '🌅', label: '今日登录',                 goal: 1,  xpReward: 10, coinReward: 3  },
]

// ── 成就徽章 ──
const ACHIEVEMENTS = [
  { id: 'first_chat',   icon: '🌱', name: '初次相遇',   desc: '第一次与 AI 对话',           condition: (s) => s.totalMsgs >= 1   },
  { id: 'chat_20',      icon: '🔥', name: '热络起来',   desc: '累计发送 20 条消息',         condition: (s) => s.totalMsgs >= 20  },
  { id: 'chat_100',     icon: '💫', name: '心意相通',   desc: '累计发送 100 条消息',        condition: (s) => s.totalMsgs >= 100 },
  { id: 'level_3',      icon: '🏆', name: '初窥门径',   desc: '达到 Lv.3',                  condition: (s) => s.level >= 3       },
  { id: 'level_6',      icon: '👑', name: '深度羁绊',   desc: '达到 Lv.6',                  condition: (s) => s.level >= 6       },
  { id: 'level_10',     icon: '🌟', name: '命运之人',   desc: '达到 Lv.10',                 condition: (s) => s.level >= 10      },
  { id: 'scene_buyer',  icon: '🎨', name: '场景收藏家', desc: '拥有 3 个以上场景',          condition: (s) => s.ownedScenes >= 3 },
  { id: 'streak_7',     icon: '📅', name: '七日羁绊',   desc: '连续登录 7 天',              condition: (s) => s.loginDays >= 7   },
  { id: 'collect_all',  icon: '💎', name: '全员收录',   desc: '收录全部 6 位角色',          condition: (s) => s.collectedChars >= 6 },
  { id: 'night_owl',    icon: '🦉', name: '夜猫子',     desc: '深夜 23:00 后发送消息',      condition: (s) => s.nightChat        },
  { id: 'generous',     icon: '💰', name: '一掷千金',   desc: '累计消费 100 星币',          condition: (s) => s.totalSpent >= 100},
  { id: 'warm_heart',   icon: '❤️',  name: '暖意融融',   desc: '触发「温暖」情绪 10 次',    condition: (s) => s.warmCount >= 10  },
]

// ── CreationCenter 全屏组件 ──
function CreationCenter({ open, onClose, onOpenAgentEditor, onOpenInspirationLab }) {
  const [subTab, setSubTab] = useState('创作')

  // 内容创作网格（简化版：视频、图片、声音 + 更多）
  const contentGrid = [
    { label: '视频', gold: false },
    { label: '图片', gold: false },
    { label: '声音', gold: false },
    { label: '更多', gold: false },
  ]

  const gridIcons = [
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 19,12 5,21"/></svg>,
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>,
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>,
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>,
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>,
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="creation-center"
          initial={{ opacity: 0, y: '100%', scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: '100%', scale: 0.98 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.9 }}
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* ── 顶部标题行 ── */}
          <div style={{ paddingTop: 52, paddingLeft: 20, paddingRight: 20, paddingBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            {/* 左侧：标题 + 草稿箱紧靠 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>创作中心</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '4px 10px', cursor: 'pointer' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgb(255,217,128)', boxShadow: '0 0 5px rgba(255,217,128,0.6)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>草稿箱 1</span>
              </div>
            </div>
            {/* 右侧：关闭按钮 */}
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <X size={14} />
            </button>
          </div>

          {/* ── Tab（保留原有，不改动） ── */}
          <div style={{ padding: '20px 20px 0', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 999, padding: 3, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              {['灵感', '创作', '素材库'].map(tab => (
                <button key={tab} onClick={() => setSubTab(tab)} style={{
                  background: subTab === tab ? 'linear-gradient(135deg, rgba(255,217,128,0.22) 0%, rgba(255,180,60,0.14) 100%)' : 'none',
                  border: subTab === tab ? '1px solid rgba(255,217,128,0.45)' : '1px solid transparent',
                  cursor: 'pointer', padding: '5px 20px', borderRadius: 999,
                  fontSize: 12, fontWeight: subTab === tab ? 700 : 400,
                  color: subTab === tab ? 'rgb(255,217,128)' : 'rgba(255,255,255,0.32)',
                  transition: 'all 0.18s ease',
                  boxShadow: subTab === tab ? '0 0 10px rgba(255,217,128,0.12)' : 'none',
                }}>{tab}</button>
              ))}
            </div>
          </div>

          {/* ── 主内容（tab 切换区域） ── */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="wait" initial={false}>

              {/* ══ 创作 tab ══ */}
              {subTab === '创作' && (
                <motion.div key="tab-creation"
                  initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '0 20px', paddingBottom: 20, overflowY: 'auto' }}
                >
                  {/* ── 大标题区 ── */}
                  <div style={{ padding: '14px 4px 10px', flexShrink: 0 }}>
                    <h1 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
                      今天，想<span style={{ color: 'rgb(255,217,128)', fontStyle: 'italic' }}>造</span>什么出来？
                    </h1>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0' }}>
                      一个会说话的灵魂，或者一张属于你的脸
                    </p>
                  </div>

                  {/* ── 创建智能体（大卡）── */}
                  <motion.button whileTap={{ scale: 0.985 }} onClick={onOpenAgentEditor}
                    style={{ width: '100%', borderRadius: 18, padding: '16px', background: 'rgba(30,26,20,0.95)', border: '1px solid rgba(255,217,128,0.14)', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden', boxSizing: 'border-box', flexShrink: 0, marginBottom: 8 }}
                  >
                    <div style={{ position: 'absolute', right: -10, bottom: -10, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,217,128,0.07)', filter: 'blur(32px)', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(255,217,128,0.12)', border: '1px solid rgba(255,217,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,217,128,0.9)', background: 'rgba(255,217,128,0.1)', border: '1px solid rgba(255,217,128,0.2)', borderRadius: 7, padding: '3px 9px', fontFamily: 'monospace' }}>本周剩余 10 次</span>
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>定制专属伙伴</p>
                    <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)', margin: '0 0 12px', lineHeight: 1.6 }}>赋予它脾气、偏好和记忆——不只是会对话的机器，而是一个真正懂你的存在</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'rgb(255,217,128)' }}>开始创建</span>
                      <span style={{ fontSize: 16, color: 'rgb(255,217,128)' }}>→</span>
                    </div>
                  </motion.button>

                  {/* ── 灵感实验室（小卡）── */}
                  <motion.button whileTap={{ scale: 0.985 }} onClick={onOpenInspirationLab}
                    style={{ width: '100%', borderRadius: 14, padding: '12px 14px', background: 'rgba(22,20,16,0.95)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, boxSizing: 'border-box', flexShrink: 0, marginTop: 10, marginBottom: 14 }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⭐</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>灵感实验室</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)', margin: 0 }}>设计你的专属虚拟形象，把想象画成现实</p>
                    </div>
                    <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>→</span>
                  </motion.button>

                  {/* ── 内容创作分区标题 ── */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>内容创作</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                  </div>

                  {/* ── 1×4 横排网格 ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, flexShrink: 0 }}>
                    {contentGrid.map((item, i) => (
                      <motion.button key={item.label} whileTap={{ scale: 0.92 }}
                        style={{ borderRadius: 10, background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, boxSizing: 'border-box', height: 68 }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(150,150,150,0.7)' }}>
                          {i === 0 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 19,12 5,21"/></svg>}
                          {i === 1 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>}
                          {i === 2 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>}
                          {i === 3 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>}
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 500, color: 'rgba(140,140,140,0.85)' }}>{item.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* ── 紧凑福利 Banner ── */}
                  <div style={{ flexShrink: 0, marginTop: 10, borderRadius: 14, padding: '10px 14px', background: 'rgba(22,20,16,0.95)', border: '1px solid rgba(255,217,128,0.11)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -8, top: -8, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,217,128,0.07)', filter: 'blur(20px)', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgb(255,217,128)' }} />
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>福利周 · 3 天后结束</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>创作双倍次数解锁中</p>
                      </div>
                      <motion.button whileTap={{ scale: 0.93 }}
                        style={{ background: 'rgb(255,217,128)', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 800, color: '#000', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 10px rgba(255,200,60,0.25)' }}>领取</motion.button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: '57%' }} transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                          style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, rgba(255,217,128,0.9), rgba(255,160,40,0.7))' }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(255,217,128,0.6)', fontFamily: 'monospace', fontWeight: 600, flexShrink: 0 }}>4 / 7 天</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ 灵感 tab ══ */}
              {subTab === '灵感' && (
                <motion.div key="tab-inspiration"
                  initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '0 20px', paddingBottom: 20 }}
                >
                  {/* 标题 */}
                  <div style={{ padding: '14px 4px 10px', flexShrink: 0 }}>
                    <h1 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
                      今日<span style={{ color: 'rgb(255,217,128)', fontStyle: 'italic' }}>灵感</span>推荐
                    </h1>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '5px 0 0' }}>基于现有模型，一键开始创作</p>
                  </div>
                  {/* 类型过滤行 */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexShrink: 0, overflowX: 'auto', paddingBottom: 2 }}>
                    {[
                      { label: '全部', icon: '✦' }, { label: '图片', icon: '🖼️' }, { label: '视频', icon: '▶' },
                      { label: '声音', icon: '🎵' }, { label: 'FM', icon: '📻' },
                    ].map((tag, ti) => (
                      <button key={tag.label} style={{
                        flexShrink: 0, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: ti === 0 ? 700 : 500,
                        background: ti === 0 ? 'rgba(255,217,128,0.14)' : 'rgba(255,255,255,0.06)',
                        border: ti === 0 ? '1px solid rgba(255,217,128,0.35)' : '1px solid rgba(255,255,255,0.08)',
                        color: ti === 0 ? 'rgb(255,217,128)' : 'rgba(255,255,255,0.45)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}><span style={{ fontSize: 10 }}>{tag.icon}</span>{tag.label}</button>
                    ))}
                  </div>
                  {/* 灵感卡列表 */}
                  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                    {[
                      { type: '图片', typeColor: 'rgba(100,180,255,0.9)', typeBg: 'rgba(100,180,255,0.1)', typeBorder: 'rgba(100,180,255,0.2)', emoji: '🖼️', title: '赛博朋克城市夜景', prompt: '霓虹灯光倒映在雨后街道，蒸汽朋克风格的摩天楼群…', accent: 'rgba(100,180,255,0.06)' },
                      { type: '视频', typeColor: 'rgba(255,150,80,0.9)', typeBg: 'rgba(255,150,80,0.1)', typeBorder: 'rgba(255,150,80,0.2)', emoji: '▶', title: '云层穿越延时摄影', prompt: '镜头穿越白云，俯瞰连绵山脉，自然光影流转变化…', accent: 'rgba(255,150,80,0.06)' },
                      { type: '图片', typeColor: 'rgba(100,180,255,0.9)', typeBg: 'rgba(100,180,255,0.1)', typeBorder: 'rgba(100,180,255,0.2)', emoji: '🖼️', title: '东方水墨仙境', prompt: '水墨晕染的山川，仙雾缭绕，古典诗意的意境构图…', accent: 'rgba(255,255,255,0.03)' },
                      { type: '声音', typeColor: 'rgba(100,220,160,0.9)', typeBg: 'rgba(100,220,160,0.1)', typeBorder: 'rgba(100,220,160,0.2)', emoji: '🎵', title: '深夜雨声 LoFi 氛围', prompt: '窗外雨声、远处雷声、室内暖黄台灯，低保真背景音…', accent: 'rgba(100,220,160,0.06)' },
                      { type: 'FM', typeColor: 'rgba(255,217,128,0.9)', typeBg: 'rgba(255,217,128,0.1)', typeBorder: 'rgba(255,217,128,0.2)', emoji: '📻', title: '晨间电台：轻松出发', prompt: '活力早间播报风格，轻快配乐，适合通勤听的节目…', accent: 'rgba(255,217,128,0.05)' },
                      { type: '图片', typeColor: 'rgba(100,180,255,0.9)', typeBg: 'rgba(100,180,255,0.1)', typeBorder: 'rgba(100,180,255,0.2)', emoji: '🖼️', title: '星云与宇宙尘埃', prompt: '星际深空的彩色星云，亿万光年外的宇宙奇观…', accent: 'rgba(180,100,255,0.07)' },
                    ].map((card, ci) => (
                      <motion.button key={ci} whileTap={{ scale: 0.98 }}
                        style={{ borderRadius: 14, background: `rgba(20,20,20,0.95)`, border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', padding: '11px 13px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}
                      >
                        <div style={{ position: 'absolute', inset: 0, background: card.accent, pointerEvents: 'none' }} />
                        {/* 类型图标 */}
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: card.typeBg, border: `1px solid ${card.typeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{card.emoji}</div>
                        {/* 文字区 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: card.typeColor, background: card.typeBg, border: `1px solid ${card.typeBorder}`, borderRadius: 5, padding: '1px 6px' }}>{card.type}</span>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.title}</p>
                          </div>
                          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.32)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.prompt}</p>
                        </div>
                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>→</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ══ 素材库 tab ══ */}
              {subTab === '素材库' && (
                <motion.div key="tab-assets"
                  initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '0 20px', paddingBottom: 20 }}
                >
                  {/* 标题 */}
                  <div style={{ padding: '14px 4px 12px', flexShrink: 0 }}>
                    <h1 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
                      我的<span style={{ color: 'rgb(255,217,128)', fontStyle: 'italic' }}>素材</span>库
                    </h1>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '5px 0 0' }}>管理你的图片、音效与背景资源</p>
                  </div>
                  {/* 分类 tab */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexShrink: 0 }}>
                    {[{ label: '图片', icon: '🖼️', count: 24 }, { label: '音效', icon: '🎵', count: 8 }, { label: '背景', icon: '🎨', count: 12 }].map((cat, ci) => (
                      <button key={cat.label} style={{
                        flex: 1, borderRadius: 12, padding: '10px 8px', background: ci === 0 ? 'rgba(255,217,128,0.10)' : 'rgba(255,255,255,0.05)',
                        border: ci === 0 ? '1px solid rgba(255,217,128,0.28)' : '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 18, marginBottom: 3 }}>{cat.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: ci === 0 ? 'rgb(255,217,128)' : 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{cat.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{cat.count} 个</div>
                      </button>
                    ))}
                  </div>
                  {/* 上传区 */}
                  <motion.button whileTap={{ scale: 0.98 }}
                    style={{ width: '100%', borderRadius: 14, padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.12)', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>上传新素材</span>
                  </motion.button>
                  {/* 素材网格 */}
                  <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: 80, gap: 6, overflowY: 'auto', alignContent: 'start' }}>
                    {[
                      { emoji: '🌸', label: '樱花背景' }, { emoji: '🌊', label: '海浪音效' }, { emoji: '🏙️', label: '城市夜景' },
                      { emoji: '🌙', label: '月夜氛围' }, { emoji: '🔥', label: '火焰粒子' }, { emoji: '❄️', label: '冰雪质感' },
                      { emoji: '🌿', label: '自然绿意' }, { emoji: '⚡', label: '闪电特效' }, { emoji: '🎭', label: '戏剧面具' },
                    ].map((asset, ai) => (
                      <motion.button key={ai} whileTap={{ scale: 0.93 }}
                        style={{ borderRadius: 12, background: 'rgba(22,22,22,0.95)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, boxSizing: 'border-box', height: 80 }}
                      >
                        <span style={{ fontSize: 16 }}>{asset.emoji}</span>
                        <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{asset.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── CreationDrawer 受控抽屉组件 ──
const MODE_META = {
  '图像': { emoji: '🖼️', label: '图像生成' },
  '视频': { emoji: '🎬', label: '视频生成' },
  '声音': { emoji: '🎵', label: '声音合成' },
}

// 用 SVG 绘制比例图标，统一 strokeWidth 确保视觉重量一致
function RatioIcon({ w, h, selected, color, GOLD }) {
  const SIZE = 52
  const STROKE = 1.5
  // 在 SIZE×SIZE 画布中，居中绘制 w:h 矩形，最大边留 8px 边距
  const maxDim = Math.max(w, h)
  const scale = (SIZE - 16) / maxDim
  const rw = w * scale
  const rh = h * scale
  const x = (SIZE - rw) / 2
  const y = (SIZE - rh) / 2
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
      <rect
        x={x} y={y} width={rw} height={rh}
        rx={3} ry={3}
        fill={selected ? `rgba(255,217,128,0.1)` : 'rgba(255,255,255,0.04)'}
        stroke={selected ? GOLD : 'rgba(255,255,255,0.18)'}
        strokeWidth={STROKE}
      />
    </svg>
  )
}

function CreationDrawer({
  open, onClose,
  creationMode, setCreationMode,
  selectedRatio, setSelectedRatio,
  videoDuration, setVideoDuration,
  voiceMood, setVoiceMood,
  selectedModel, setSelectedModel,
}) {
  const GOLD = 'rgb(255,217,128)'
  const GOLD_A = (a) => `rgba(255,217,128,${a})`
  const CREATION_MODES = ['图像', '视频', '声音']
  const RATIOS = [
    { label: '9:16', w: 28, h: 50 },
    { label: '1:1',  w: 40, h: 40 },
    { label: '16:9', w: 60, h: 34 },
    { label: '4:3',  w: 52, h: 39 },
    { label: '3:4',  w: 36, h: 48 },
  ]
  const VIDEO_RATIOS = [
    { label: '16:9', w: 60, h: 34 },
    { label: '9:16', w: 28, h: 50 },
    { label: '1:1',  w: 40, h: 40 },
  ]
  const MODELS = [
    { name: '天权', style: '唯美细节', desc: '擅长写实人像与精细纹理' },
    { name: '星砚', style: '水墨国风', desc: '中式美学与留白意境' },
    { name: '霓虹', style: '赛博朋克', desc: '高饱和度、未来感氛围' },
    { name: 'Aurora', style: '梦幻插画', desc: '柔光渐变、童话插画风' },
  ]
  const VIDEO_DURATIONS = ['5s', '10s', '15s']
  const VOICE_MOODS = ['温柔', '活泼', '忧郁', '热血', '冷酷', '治愈']
  const meta = MODE_META[creationMode] || MODE_META['图像']

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10 }} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 11, background: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(32px) saturate(180%)', borderRadius: '24px 24px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', paddingBottom: 36, maxHeight: '80vh', overflowY: 'auto', scrollbarWidth: 'none' }}
          >
            {/* ── 拖动条 ── */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '12px auto 0' }} />

            {/* ── 头部：当前模态图标 + 名称 ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: GOLD_A(0.1), border: `1px solid ${GOLD_A(0.22)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {meta.emoji}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.01em' }}>
                    灵感实验室
                    <span style={{ color: GOLD_A(0.75), fontWeight: 500 }}> · {meta.label}</span>
                  </p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', margin: '2px 0 0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>INSPIRATION LAB</p>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                <X size={13} />
              </button>
            </div>

            <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* ── 创作模态 Segment ── */}
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 10px', fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase' }}>创作模态</p>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', padding: 3, position: 'relative' }}>
                  {CREATION_MODES.map(m => (
                    <button key={m} onClick={() => setCreationMode(m)}
                      style={{ flex: 1, position: 'relative', height: 32, borderRadius: 9, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: creationMode === m ? 700 : 400, color: creationMode === m ? '#000' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s', zIndex: 1 }}>
                      {creationMode === m && (
                        <motion.div layoutId="drawer-mode-bg"
                          style={{ position: 'absolute', inset: 0, borderRadius: 9, background: GOLD, zIndex: -1 }}
                          transition={{ type: 'spring', bounce: 0.22, duration: 0.36 }} />
                      )}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 参数区：AnimatePresence 平滑切换 ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={creationMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                >

                  {/* 图像：画幅 */}
                  {creationMode === '图像' && (
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 12px', fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase' }}>选择画幅</p>
                      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
                        {RATIOS.map(r => (
                          <button key={r.label} onClick={() => setSelectedRatio(r.label)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 10px', borderRadius: 12, background: selectedRatio === r.label ? GOLD_A(0.08) : 'transparent', border: `1px solid ${selectedRatio === r.label ? GOLD_A(0.28) : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                            <RatioIcon w={r.w} h={r.h} selected={selectedRatio === r.label} GOLD={GOLD} />
                            <span style={{ fontSize: 10, fontWeight: selectedRatio === r.label ? 700 : 400, color: selectedRatio === r.label ? GOLD : 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 视频：画幅 + 时长 */}
                  {creationMode === '视频' && (
                    <>
                      <div>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 12px', fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase' }}>选择画幅</p>
                        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
                          {VIDEO_RATIOS.map(r => (
                            <button key={r.label} onClick={() => setSelectedRatio(r.label)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 10px', borderRadius: 12, background: selectedRatio === r.label ? GOLD_A(0.08) : 'transparent', border: `1px solid ${selectedRatio === r.label ? GOLD_A(0.28) : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                              <RatioIcon w={r.w} h={r.h} selected={selectedRatio === r.label} GOLD={GOLD} />
                              <span style={{ fontSize: 10, fontWeight: selectedRatio === r.label ? 700 : 400, color: selectedRatio === r.label ? GOLD : 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{r.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 10px', fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase' }}>视频时长</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {VIDEO_DURATIONS.map(d => (
                            <button key={d} onClick={() => setVideoDuration(d)} style={{ flex: 1, height: 38, borderRadius: 10, background: videoDuration === d ? GOLD_A(0.1) : 'rgba(255,255,255,0.04)', border: `1.5px solid ${videoDuration === d ? GOLD_A(0.4) : 'rgba(255,255,255,0.07)'}`, fontSize: 13, fontWeight: videoDuration === d ? 700 : 400, color: videoDuration === d ? GOLD : 'rgba(255,255,255,0.35)', cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.15s' }}>{d}</button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* 声音：情感倾向 */}
                  {creationMode === '声音' && (
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 10px', fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase' }}>情感倾向</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {VOICE_MOODS.map(mood => (
                          <button key={mood} onClick={() => setVoiceMood(mood)} style={{ height: 32, borderRadius: 20, padding: '0 14px', background: voiceMood === mood ? GOLD_A(0.12) : 'rgba(255,255,255,0.04)', border: `1.5px solid ${voiceMood === mood ? GOLD_A(0.35) : 'rgba(255,255,255,0.07)'}`, fontSize: 12, fontWeight: voiceMood === mood ? 700 : 400, color: voiceMood === mood ? GOLD : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.15s' }}>{mood}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 次元画风（图像 / 声音显示） */}
                  {creationMode !== '视频' && (
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 12px', fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase' }}>次元画风</p>
                      <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {MODELS.map((m, i) => {
                          const isSelected = selectedModel === m.name
                          return (
                            <motion.button key={m.name} whileTap={{ scale: 0.99 }} onClick={() => setSelectedModel(m.name)}
                              style={{
                                display: 'flex', alignItems: 'center', padding: '12px 16px',
                                background: isSelected ? GOLD_A(0.05) : 'rgba(255,255,255,0.02)',
                                border: 'none',
                                borderBottom: i < MODELS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                cursor: 'pointer', textAlign: 'left', gap: 12,
                                transition: 'all 0.18s',
                                // 金色边缘 Glow 替代黄色小圆点
                                boxShadow: isSelected
                                  ? `inset 0 0 0 1.5px ${GOLD_A(0.45)}, 0 0 20px ${GOLD_A(0.08)}`
                                  : 'none',
                              }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? GOLD : 'rgba(255,255,255,0.85)', transition: 'color 0.18s' }}>{m.name}</span>
                                  <span style={{ fontSize: 9, color: GOLD_A(0.65), background: GOLD_A(0.07), border: `1px solid ${GOLD_A(0.13)}`, borderRadius: 4, padding: '1px 7px', fontFamily: 'monospace', fontWeight: 600 }}>{m.style}</span>
                                </div>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.26)', margin: 0, fontFamily: 'monospace' }}>{m.desc}</p>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── InspirationLab 灵感实验室 ──
// ── GenerationCard ──
function GenerationCard({ msg, mode, ratio, onPreview, onRegenerate }) {
  const GOLD = 'rgb(255,217,128)'
  const GOLD_A = (a) => `rgba(255,217,128,${a})`
  const modeLabel = mode === 'image' ? '画面生成中' : mode === 'video' ? '视频渲染中' : '音频合成中'
  const modeIcon = mode === 'video' ? '🎬' : mode === 'sound' ? '🎵' : '🖼️'

  if (msg.type === 'generating') {
    return (
      <div style={{ maxWidth: '80%', borderRadius: '18px 18px 18px 4px', overflow: 'hidden', border: `1px solid ${GOLD_A(0.13)}`, background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ position: 'relative', aspectRatio: mode === 'video' ? '16/9' : mode === 'sound' ? undefined : ratio.replace(':', '/'), minHeight: mode === 'sound' ? 90 : 130, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
          <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent 0%, ${GOLD_A(0.06)} 50%, transparent 100%)` }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${GOLD_A(0.18)}`, borderTopColor: GOLD }} />
            <span style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: '0.04em' }}>{modeLabel}</span>
          </div>
        </div>
        <div style={{ padding: '10px 14px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace' }}>次元壁破裂中…</span>
            <span style={{ fontSize: 10, color: GOLD_A(0.55), fontFamily: 'monospace' }}>预计 1-2min</span>
          </div>
          <div style={{ height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ height: '100%', width: '50%', borderRadius: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: '80%', borderRadius: '18px 18px 18px 4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.04)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      <div onClick={() => onPreview(msg)} style={{ position: 'relative', aspectRatio: mode === 'video' ? '16/9' : mode === 'sound' ? undefined : ratio.replace(':', '/'), minHeight: mode === 'sound' ? 90 : 130, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.03)', cursor: 'pointer', padding: mode === 'sound' ? '20px 16px' : 0 }}>
        <span style={{ fontSize: mode === 'sound' ? 28 : 36 }}>{modeIcon}</span>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', margin: 0, fontFamily: 'monospace', textAlign: 'center', padding: '0 16px', lineHeight: 1.5 }}>{msg.prompt}</p>
        <span style={{ fontSize: 9, color: GOLD_A(0.55), fontFamily: 'monospace' }}>点击全屏预览</span>
        {mode === 'video' && <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '2px 7px', fontSize: 9, color: GOLD, fontFamily: 'monospace', backdropFilter: 'blur(8px)' }}>▶ VIDEO</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {[{ label: '重新生成', icon: '↺' }, { label: '保存', icon: '↓' }, { label: '分享', icon: '↗' }].map((a, i) => (
          <button key={a.label} onClick={() => a.label === '重新生成' && onRegenerate()}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', background: 'none', border: 'none', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>{a.icon}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.26)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{a.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function InspirationLab({ open, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', type: 'text', text: '✨ 欢迎来到灵感实验室，描述你的创意，我来帮你实现。' },
  ])
  const [inputText, setInputText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [creationMode, setCreationMode] = useState('图像')
  const [selectedRatio, setSelectedRatio] = useState('9:16')
  const [selectedModel, setSelectedModel] = useState('天权')
  const [videoDuration, setVideoDuration] = useState('10s')
  const [voiceMood, setVoiceMood] = useState('温柔')
  const [previewMsg, setPreviewMsg] = useState(null)
  const [showAssets, setShowAssets] = useState(false)
  const [recentImages, setRecentImages] = useState([])
  const messagesEndRef = useRef(null)
  const GOLD = 'rgb(255,217,128)'
  const GOLD_A = (a) => `rgba(255,217,128,${a})`

  const CREATION_MODES = ['图像', '视频', '声音']
  const PRESETS = [
    { label: '壁纸', ratio: '9:16', icon: '📱' },
    { label: '社交', ratio: '1:1', icon: '📷' },
    { label: '横幅', ratio: '16:9', icon: '🖥️' },
    { label: '海报', ratio: '3:4', icon: '🎨' },
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendPrompt() {
    if (!inputText.trim()) return
    const userMsg = { id: Date.now(), role: 'user', type: 'text', text: inputText }
    const placeholderMsg = { id: Date.now() + 1, role: 'assistant', type: 'generating', mode: creationMode }
    setMessages(prev => [...prev, userMsg, placeholderMsg])
    setInputText('')
    setShowAssets(false)
    setGenerating(true)
    setTimeout(() => {
      const resultId = Date.now()
      setMessages(prev => prev.map(m =>
        m.type === 'generating'
          ? { id: m.id, role: 'assistant', type: 'result', mode: creationMode, url: null, prompt: userMsg.text }
          : m
      ))
      if (creationMode === '图像') {
        setRecentImages(prev => [{ id: resultId, prompt: userMsg.text, emoji: '🖼️' }, ...prev].slice(0, 5))
      }
      setGenerating(false)
    }, 2800)
  }

  function handleRegenerate(msg) {
    const ph = { id: Date.now(), role: 'assistant', type: 'generating', mode: msg.mode }
    setMessages(prev => [...prev, ph])
    setGenerating(true)
    setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === ph.id ? { ...m, type: 'result', prompt: msg.prompt } : m
      ))
      setGenerating(false)
    }, 2800)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="inspiration-lab"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'linear-gradient(180deg, #0a0804 0%, #07060a 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* ── 顶部标题栏 ── */}
          <div style={{ paddingTop: 54, paddingLeft: 20, paddingRight: 20, paddingBottom: 14, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                <X size={15} />
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.02em' }}>灵感实验室</p>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,217,128,0.5)', margin: '3px 0 0', fontFamily: 'monospace', letterSpacing: '0.06em' }}>INSPIRATION LAB</p>
              </div>
              <button onClick={() => setDrawerOpen(true)} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,217,128,0.08)', border: '1px solid rgba(255,217,128,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,217,128,0.7)', flexShrink: 0 }}>
                <SlidersHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* ── 消息列表 ── */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '20px 16px 0' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                {msg.type === 'text' && msg.role === 'assistant' && (
                  <div style={{ maxWidth: '80%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px 20px 20px 6px', padding: '12px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.7 }}>{msg.text}</p>
                  </div>
                )}
                {msg.type === 'text' && msg.role === 'user' && (
                  <div style={{ maxWidth: '80%', background: 'linear-gradient(135deg, rgba(255,217,128,0.18) 0%, rgba(255,180,60,0.1) 100%)', border: '1px solid rgba(255,217,128,0.25)', borderRadius: '20px 20px 6px 20px', padding: '12px 16px', boxShadow: '0 2px 12px rgba(255,200,60,0.08)' }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.65 }}>{msg.text}</p>
                  </div>
                )}
                {(msg.type === 'generating' || msg.type === 'result') && (
                  <GenerationCard
                    msg={msg}
                    mode={msg.mode === '图像' ? 'image' : msg.mode === '视频' ? 'video' : 'sound'}
                    ratio={selectedRatio}
                    onPreview={setPreviewMsg}
                    onRegenerate={() => handleRegenerate(msg)}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* ── 输入区 ── */}
          <div style={{ flexShrink: 0, padding: '10px 16px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}>
            {/* 顶部行：模态 tab */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 7, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center' }}>
              {CREATION_MODES.map(m => (
                <button key={m} onClick={() => setCreationMode(m)} style={{ flexShrink: 0, height: 24, borderRadius: 6, padding: '0 10px', background: creationMode === m ? GOLD_A(0.12) : 'rgba(255,255,255,0.05)', border: `1px solid ${creationMode === m ? GOLD_A(0.3) : 'rgba(255,255,255,0.08)'}`, fontSize: 11, fontWeight: creationMode === m ? 700 : 400, color: creationMode === m ? GOLD : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'monospace' }}>{m}</button>
              ))}
            </div>
            {/* 图像模式下才显示快捷预设行，避免与模态 tab 同时高亮 */}
            <AnimatePresence initial={false}>
              {creationMode === '图像' && (
                <motion.div
                  key="presets"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 7 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center', paddingBottom: 2 }}>
                    {PRESETS.map(p => (
                      <button key={p.label} onClick={() => setSelectedRatio(p.ratio)} style={{ flexShrink: 0, height: 24, borderRadius: 6, padding: '0 9px', display: 'flex', alignItems: 'center', gap: 4, background: selectedRatio === p.ratio ? GOLD_A(0.1) : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedRatio === p.ratio ? GOLD_A(0.25) : 'rgba(255,255,255,0.07)'}`, fontSize: 10, fontWeight: selectedRatio === p.ratio ? 600 : 400, color: selectedRatio === p.ratio ? GOLD : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 11 }}>{p.icon}</span>{p.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Smart Inline Assets */}
            <AnimatePresence>
              {showAssets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 80 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden', marginBottom: 8 }}
                >
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', height: 80, alignItems: 'center', padding: '0 2px' }}>
                    {recentImages.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 64, borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>暂无生成记录</span>
                      </div>
                    ) : recentImages.map(img => (
                      <div key={img.id} style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, cursor: 'pointer' }}>
                        <span style={{ fontSize: 20 }}>{img.emoji}</span>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', textAlign: 'center', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 56 }}>{img.prompt}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, padding: '10px 12px' }}>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, paddingBottom: 2 }}>
                <button
                  onClick={() => setShowAssets(v => !v)}
                  style={{ width: 28, height: 28, borderRadius: 8, background: showAssets ? GOLD_A(0.12) : 'rgba(255,255,255,0.07)', border: `1px solid ${showAssets ? GOLD_A(0.25) : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: showAssets ? GOLD : 'rgba(255,255,255,0.5)', transition: 'all 0.15s' }}>+</button>
                <button style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>@</button>
                <button style={{ height: 28, borderRadius: 8, background: GOLD_A(0.1), border: `1px solid ${GOLD_A(0.2)}`, padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, fontWeight: 700, color: GOLD, fontFamily: 'monospace', letterSpacing: '0.04em' }}>Auto</button>
              </div>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPrompt() } }}
                placeholder={creationMode === '图像' ? '描述你想创作的画面或概念…' : creationMode === '视频' ? '描述视频的场景与动态…' : '描述声音的氛围与情感…'}
                rows={1}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto', scrollbarWidth: 'none' }}
              />
              <motion.button whileTap={{ scale: 0.92 }} onClick={sendPrompt} disabled={!inputText.trim() || generating}
                style={{ width: 32, height: 32, borderRadius: 10, background: inputText.trim() ? GOLD : 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'background 0.2s', fontSize: 14 }}>
                <span style={{ color: inputText.trim() ? '#000' : 'rgba(255,255,255,0.25)' }}>↑</span>
              </motion.button>
            </div>
          </div>

          {/* ── 设置抽屉 CreationDrawer（受控组件） ── */}
          <CreationDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            creationMode={creationMode}
            setCreationMode={setCreationMode}
            selectedRatio={selectedRatio}
            setSelectedRatio={setSelectedRatio}
            videoDuration={videoDuration}
            setVideoDuration={setVideoDuration}
            voiceMood={voiceMood}
            setVoiceMood={setVoiceMood}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />

          {/* ── 全屏预览 ── */}
          <AnimatePresence>
            {previewMsg && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setPreviewMsg(null)}
                style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}
              >
                <div style={{ width: '85vw', maxWidth: 360, aspectRatio: selectedRatio.replace(':', '/'), background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 48 }}>🖼️</span>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, padding: '0 20px', textAlign: 'center', fontFamily: 'monospace' }}>{previewMsg.prompt}</p>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>点击任意处关闭</p>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── AgentEditor 专属伙伴编辑器 ──
function AgentEditor({ open, onClose }) {
  const [persona, setPersona] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState(null) // 'male' | 'female' | 'unknown'，一经选定锁定
  const [genderLocked, setGenderLocked] = useState(false)
  const [dialogStyle, setDialogStyle] = useState('温柔')
  const [tags, setTags] = useState(['治愈', '神秘'])
  const [challengeMode, setChallengeMode] = useState(false)
  const [bilingualMode, setBilingualMode] = useState(false)
  const [voicePickerOpen, setVoicePickerOpen] = useState(false)
  const [bgmPickerOpen, setBgmPickerOpen] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [selectedBgm, setSelectedBgm] = useState(null)
  const [aiGenerating, setAiGenerating] = useState(false)

  const DIALOG_STYLES = ['温柔', '毒舌', '傲娇', '知性', '元气', '神秘']
  const TAG_OPTIONS = ['治愈', '神秘', '恋爱脑', '反差萌', '高冷', '暖男', '搞笑', '文艺']
  const VOICES = [
    { id: 'v1', name: '晴川', desc: '温柔少女音', emoji: '🌸' },
    { id: 'v2', name: '暗夜', desc: '低沉磁性男声', emoji: '🌙' },
    { id: 'v3', name: '元气', desc: '活泼青春音', emoji: '⚡' },
    { id: 'v4', name: '知性', desc: '干练都市女声', emoji: '💼' },
  ]
  const BGMS = [
    { id: 'b1', name: '夜雨', desc: '轻柔钢琴 + 雨声', emoji: '🌧️' },
    { id: 'b2', name: '星途', desc: '氛围电子 Lo-Fi', emoji: '🌌' },
    { id: 'b3', name: '无声', desc: '静默模式', emoji: '🔇' },
  ]

  function handleAiGenerate() {
    setAiGenerating(true)
    setTimeout(() => {
      setPersona('她不喜欢解释自己，但总在你最需要的时候出现。说话带三分冷意，笑起来却像春风。独处时会写没人看的诗，和你说话时会忘记时间。')
      setAiGenerating(false)
    }, 1600)
  }

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function selectGender(g) {
    if (genderLocked) return
    setGender(g)
    setGenderLocked(true)
  }

  const btnStyle = (active) => ({
    padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600,
    cursor: genderLocked && !active ? 'not-allowed' : 'pointer',
    background: active ? 'rgba(255,217,128,0.18)' : 'rgba(255,255,255,0.05)',
    border: active ? '1px solid rgba(255,217,128,0.4)' : '1px solid rgba(255,255,255,0.08)',
    color: active ? 'rgb(255,217,128)' : genderLocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
    transition: 'all 0.15s',
    opacity: genderLocked && !active ? 0.4 : 1,
  })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="agent-editor"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', inset: 0, zIndex: 600, background: '#0c0c0e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* ── 顶部栏 ── */}
          <div style={{ paddingTop: 54, paddingLeft: 20, paddingRight: 20, paddingBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <X size={16} />
            </button>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>定制专属伙伴</p>
            <div style={{ width: 34 }} />
          </div>

          {/* ── 可滚动内容 ── */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingBottom: 100 }}>

            {/* ① 形象上传区 */}
            <div style={{ padding: '20px 20px 0' }}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', aspectRatio: '4/5', maxHeight: 280,
                  borderRadius: 22,
                  border: '1.5px dashed rgba(255,217,128,0.25)',
                  background: 'rgba(255,217,128,0.04)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', gap: 10,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,217,128,0.1)', border: '1px solid rgba(255,217,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📸</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: 0 }}>点击上传形象</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0, fontFamily: 'monospace' }}>建议 4:5 比例 · PNG / JPG</p>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, rgba(255,217,128,0.04))' }} />
              </motion.div>
            </div>

            {/* ② 基本信息 */}
            <div style={{ padding: '20px 20px 0' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 12px', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>基本信息</p>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                {/* 名称 */}
                <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 42, flexShrink: 0 }}>名称</span>
                  <input placeholder="给你的伙伴起个名字" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'inherit' }} />
                </div>
                {/* 性别（锁定逻辑） */}
                <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 42, flexShrink: 0 }}>性别</span>
                  <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                    {[['female', '女'], ['male', '男'], ['unknown', '未知']].map(([g, label]) => (
                      <button key={g} onClick={() => selectGender(g)} style={btnStyle(gender === g)}>{label}</button>
                    ))}
                    {genderLocked && (
                      <span style={{ fontSize: 10, color: 'rgba(255,160,40,0.7)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 3, marginLeft: 4 }}>
                        🔒 不可更改
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ③ 人设设定 Bento Card */}
            <div style={{ padding: '20px 20px 0' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 12px', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>人设设定</p>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                {/* 私密人设 */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>🔒</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>伙伴人设</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '1px 6px' }}>私密</span>
                  </div>
                  <textarea
                    value={persona}
                    onChange={e => setPersona(e.target.value)}
                    placeholder="描述伙伴的核心性格、价值观、行为模式…这段内容对话者看不到"
                    style={{
                      width: '100%', minHeight: 100, background: 'none', border: 'none',
                      outline: 'none', resize: 'none', fontSize: 12,
                      color: 'rgba(255,255,255,0.75)', fontFamily: 'inherit', lineHeight: 1.7,
                      boxSizing: 'border-box',
                    }}
                  />
                  {/* AI 自动生成浮动按钮 */}
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.04 }}
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                    style={{
                      position: 'absolute', bottom: 12, right: 12,
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: aiGenerating ? 'rgba(255,217,128,0.08)' : 'rgba(255,217,128,0.13)',
                      border: '1px solid rgba(255,217,128,0.3)',
                      borderRadius: 999, padding: '5px 12px',
                      fontSize: 10, fontWeight: 700, color: 'rgb(255,217,128)',
                      cursor: aiGenerating ? 'wait' : 'pointer',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 12px rgba(255,200,60,0.15)',
                    }}
                  >
                    <motion.span
                      animate={aiGenerating ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 0.8, repeat: aiGenerating ? Infinity : 0, ease: 'linear' }}
                      style={{ display: 'inline-block' }}
                    >✨</motion.span>
                    {aiGenerating ? 'AI 生成中…' : 'AI 自动生成'}
                  </motion.button>
                </div>
                {/* 公开简介 */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>🌐</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>对外简介</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '1px 6px' }}>公开</span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="让别人了解这位伙伴——它是谁，能陪你做什么"
                    style={{
                      width: '100%', minHeight: 72, background: 'none', border: 'none',
                      outline: 'none', resize: 'none', fontSize: 12,
                      color: 'rgba(255,255,255,0.75)', fontFamily: 'inherit', lineHeight: 1.7,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ④ 声音 & 背景音乐 */}
            <div style={{ padding: '20px 20px 0' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 12px', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>声音与背景</p>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <button onClick={() => setVoicePickerOpen(true)} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🎙️</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: 0 }}>声音音色</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', fontFamily: 'monospace' }}>{selectedVoice ? selectedVoice.name : '点击选择音色'}</p>
                    </div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>›</span>
                </button>
                <button onClick={() => setBgmPickerOpen(true)} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🎵</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: 0 }}>背景音乐</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', fontFamily: 'monospace' }}>{selectedBgm ? selectedBgm.name : '点击选择 BGM'}</p>
                    </div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>›</span>
                </button>
              </div>
            </div>

            {/* ⑤ 高级功能 2x2 Grid */}
            <div style={{ padding: '20px 20px 0' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 12px', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>高级功能</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* 对话风格 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '14px 14px 10px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px' }}>💬 对话风格</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DIALOG_STYLES.map(s => (
                      <button key={s} onClick={() => setDialogStyle(s)} style={{
                        fontSize: 10, padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
                        background: dialogStyle === s ? 'rgba(255,217,128,0.15)' : 'rgba(255,255,255,0.05)',
                        border: dialogStyle === s ? '1px solid rgba(255,217,128,0.35)' : '1px solid rgba(255,255,255,0.07)',
                        color: dialogStyle === s ? 'rgb(255,217,128)' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.12s',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
                {/* 标签设定 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '14px 14px 10px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px' }}>🏷️ 标签设定</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TAG_OPTIONS.map(t => (
                      <button key={t} onClick={() => toggleTag(t)} style={{
                        fontSize: 10, padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
                        background: tags.includes(t) ? 'rgba(160,130,255,0.15)' : 'rgba(255,255,255,0.05)',
                        border: tags.includes(t) ? '1px solid rgba(160,130,255,0.35)' : '1px solid rgba(255,255,255,0.07)',
                        color: tags.includes(t) ? 'rgba(200,180,255,0.9)' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.12s',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
                {/* 挑战模式 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px' }}>⚡ 挑战模式</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: 0, fontFamily: 'monospace' }}>更尖锐的对话</p>
                    </div>
                    <button onClick={() => setChallengeMode(v => !v)} style={{
                      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                      background: challengeMode ? 'rgb(255,217,128)' : 'rgba(255,255,255,0.1)',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}>
                      <div style={{ position: 'absolute', top: 3, left: challengeMode ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: challengeMode ? '#000' : 'rgba(255,255,255,0.5)', transition: 'left 0.2s' }} />
                    </button>
                  </div>
                </div>
                {/* 双语模式 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0 0 3px' }}>🌐 双语模式</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: 0, fontFamily: 'monospace' }}>中英文混用</p>
                    </div>
                    <button onClick={() => setBilingualMode(v => !v)} style={{
                      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                      background: bilingualMode ? 'rgb(255,217,128)' : 'rgba(255,255,255,0.1)',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}>
                      <div style={{ position: 'absolute', top: 3, left: bilingualMode ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: bilingualMode ? '#000' : 'rgba(255,255,255,0.5)', transition: 'left 0.2s' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── 底部固定确认栏 ── */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '14px 20px 32px',
            background: 'rgba(12,12,14,0.85)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              style={{
                width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                background: 'rgb(255,217,128)', color: '#000',
                fontSize: 14, fontWeight: 800, cursor: 'pointer',
                letterSpacing: '0.04em',
                boxShadow: '0 4px 20px rgba(255,200,60,0.3)',
              }}
            >
              开始定制
            </motion.button>
          </div>

          {/* ── 声音选择器半屏 ── */}
          <AnimatePresence>
            {voicePickerOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVoicePickerOpen(false)}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10 }} />
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 11, background: 'rgba(18,16,14,0.96)', backdropFilter: 'blur(24px)', borderRadius: '22px 22px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 20px 40px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>选择音色</p>
                    <button onClick={() => setVoicePickerOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                  {VOICES.map(v => (
                    <motion.button key={v.id} whileTap={{ scale: 0.97 }} onClick={() => { setSelectedVoice(v); setVoicePickerOpen(false) }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: selectedVoice?.id === v.id ? 'rgba(255,217,128,0.15)' : 'rgba(255,255,255,0.06)', border: selectedVoice?.id === v.id ? '1px solid rgba(255,217,128,0.3)' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{v.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: '0 0 2px' }}>{v.name}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily: 'monospace' }}>{v.desc}</p>
                      </div>
                      {selectedVoice?.id === v.id && <span style={{ color: 'rgb(255,217,128)', fontSize: 16 }}>✓</span>}
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── BGM 选择器半屏 ── */}
          <AnimatePresence>
            {bgmPickerOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBgmPickerOpen(false)}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10 }} />
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 11, background: 'rgba(18,16,14,0.96)', backdropFilter: 'blur(24px)', borderRadius: '22px 22px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 20px 40px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>选择背景音乐</p>
                    <button onClick={() => setBgmPickerOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                  {BGMS.map(b => (
                    <motion.button key={b.id} whileTap={{ scale: 0.97 }} onClick={() => { setSelectedBgm(b); setBgmPickerOpen(false) }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: selectedBgm?.id === b.id ? 'rgba(255,217,128,0.15)' : 'rgba(255,255,255,0.06)', border: selectedBgm?.id === b.id ? '1px solid rgba(255,217,128,0.3)' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{b.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: '0 0 2px' }}>{b.name}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily: 'monospace' }}>{b.desc}</p>
                      </div>
                      {selectedBgm?.id === b.id && <span style={{ color: 'rgb(255,217,128)', fontSize: 16 }}>✓</span>}
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── SettingRow 子组件 ──
function SettingRow({ label, desc, value, onChange, type, min, max, step = 1, last, isNew, hasArrow }) {
  return (
    <div style={{ padding: '13px 16px', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: 500 }}>{label}</p>
          {isNew && (
            <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: 'rgb(255,59,59)', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace', letterSpacing: '0.04em' }}>NEW</span>
          )}
        </div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', fontFamily: 'monospace' }}>{desc}</p>
        {type === 'slider' && (
          <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={e => onChange(max <= 1.5 ? parseFloat(e.target.value) : parseInt(e.target.value))}
            style={{ width: '100%', marginTop: 8, accentColor: 'rgb(255,217,128)', height: 3, cursor: 'pointer' }}
          />
        )}
      </div>
      {type === 'toggle' && (
        <button
          onClick={() => onChange(!value)}
          style={{
            width: 44, height: 26, borderRadius: 13,
            background: value ? 'rgb(255,217,128)' : 'rgba(255,255,255,0.12)',
            border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: value ? 21 : 3, width: 20, height: 20,
            borderRadius: '50%', background: value ? '#000' : 'rgba(255,255,255,0.5)',
            transition: 'left 0.2s',
          }} />
        </button>
      )}
      {hasArrow && type !== 'toggle' && type !== 'slider' && (
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, flexShrink: 0 }}>›</span>
      )}
    </div>
  )
}

// ── CreateSettingModal ──
function CreateSettingModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="create-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.5)' }}
          />
          <motion.div
            key="create-modal"
            initial={{ opacity: 0, y: 40, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 401,
              width: 'calc(100% - 48px)',
              maxWidth: 360,
              background: 'rgba(10,8,6,0.95)',
              backdropFilter: 'blur(40px) saturate(180%)',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              padding: '28px 24px 24px',
              display: 'flex', flexDirection: 'column', gap: 18,
            }}
          >
            {/* 顶部图标 + 标题 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,217,128,0.14)', border: '1px solid rgba(255,217,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={26} weight="bold" color="rgb(255,217,128)" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>创建新设定</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '5px 0 0', fontFamily: 'monospace', lineHeight: 1.5 }}>为你的 AI 角色设定专属人格<br />与交互风格</p>
              </div>
            </div>
            {/* 名称输入 */}
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 7px', fontFamily: 'monospace', letterSpacing: '0.06em' }}>设定名称</p>
              <input
                placeholder="例如：温柔治愈模式…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '10px 14px',
                  color: '#fff', fontSize: 13, fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
            {/* 按钮组 */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{ flex: 1, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
              >取消</button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onClose}
                style={{ flex: 2, height: 44, borderRadius: 12, background: 'rgb(255,217,128)', border: 'none', color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(255,217,128,0.3)' }}
              >开始创建</motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── SettingsDrawer ──
function SettingsDrawer({ open, onClose }) {
  const [autoVoice, setAutoVoice] = useState(true)
  const [soundEffect, setSoundEffect] = useState(false)
  const [voiceSpeed, setVoiceSpeed] = useState(0.95)
  const [voiceVolume, setVoiceVolume] = useState(80)
  const [memoryOn, setMemoryOn] = useState(true)
  const [emotionOn, setEmotionOn] = useState(true)
  const [replyLen, setReplyLen] = useState(60)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  return (
    <>
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            key="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.20)', backdropFilter: 'blur(3px)' }}
          />
          {/* 抽屉本体：从右滑入 */}
          <motion.div
            key="settings-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '85%',
              zIndex: 301,
              background: 'rgba(6,5,4,0.88)',
              backdropFilter: 'blur(40px) saturate(180%)',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {/* ── 顶部标题栏 ── */}
            <div style={{ padding: '56px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.02em', margin: 0 }}>我的对话设定</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '3px 0 0', fontFamily: 'monospace' }}>个性化你与 AI 的每一次连接</p>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ── 创建设定大卡片 ── */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setCreateModalOpen(true)}
                style={{
                  width: '100%', borderRadius: 18,
                  background: 'linear-gradient(135deg, rgba(255,217,128,0.1) 0%, rgba(255,217,128,0.04) 100%)',
                  border: '1px dashed rgba(255,217,128,0.35)',
                  padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,217,128,0.14)', border: '1px solid rgba(255,217,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Plus size={20} weight="bold" color="rgb(255,217,128)" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'rgb(255,217,128)', margin: 0, letterSpacing: '0.02em' }}>创建新设定</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,217,128,0.45)', margin: '3px 0 0', fontFamily: 'monospace' }}>自定义角色人格与交互风格</p>
                </div>
              </motion.button>

              {/* ── 对话设置分组 ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <ChatTeardropText size={14} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>对话设置</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <SettingRow label="记忆模式" desc="AI 将记住你们的对话上下文" value={memoryOn} onChange={setMemoryOn} type="toggle" />
                  <SettingRow label="情感感知" desc="AI 根据你的情绪自动调整回复语气" value={emotionOn} onChange={setEmotionOn} type="toggle" />
                  <SettingRow label="回复长度" desc={`当前上限 ${replyLen} 字`} value={replyLen} onChange={setReplyLen} type="slider" min={20} max={200} />
                  <SettingRow label="聊天气泡" desc="自定义对话气泡样式与配色" type="link" hasArrow isNew />
                  <SettingRow label="对话背景" desc="设置专属对话页面背景图" type="link" hasArrow isNew />
                  <SettingRow label="消息漫游" desc="跨设备同步你的对话记录" type="link" hasArrow isNew last />
                </div>
              </div>

              {/* ── 声音设置分组 ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <Waveform size={14} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>声音设置</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <SettingRow label="自动播放语音" desc="收到 AI 消息后自动朗读语音" value={autoVoice} onChange={setAutoVoice} type="toggle" />
                  <SettingRow label="界面音效" desc="按钮操作时播放轻微提示音效" value={soundEffect} onChange={setSoundEffect} type="toggle" />
                  <SettingRow label="语速" desc={`${Math.round(voiceSpeed * 100)}%（建议 80–120%）`} value={voiceSpeed} onChange={setVoiceSpeed} type="slider" min={0.5} max={1.5} step={0.05} />
                  <SettingRow label="音量" desc={`${voiceVolume}%`} value={voiceVolume} onChange={setVoiceVolume} type="slider" min={0} max={100} last />
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* 创建设定弹窗（z-index 高于抽屉） */}
    <CreateSettingModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </>
  )
}

// ── CommentDrawer ──
function CommentDrawer({ open, onClose, charName }) {
  const [commentText, setCommentText] = useState('')
  const total = MOCK_COMMENTS.reduce((s, c) => s + c.likes, 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
          />
          {/* Drawer 本体 */}
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 201,
              height: '72vh',
              background: 'rgba(8,6,4,0.92)',
              backdropFilter: 'blur(32px) saturate(180%)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px 24px 0 0',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ── 顶部标题栏 ── */}
            <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>评论</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8, fontFamily: 'monospace' }}>{MOCK_COMMENTS.length} 条</span>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* ── 评论列表 ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px', scrollbarWidth: 'none' }}>
              {MOCK_COMMENTS.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{ display: 'flex', gap: 10, marginBottom: 18 }}
                >
                  {/* 头像占位 */}
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color="rgba(255,255,255,0.4)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.02em' }}>{c.user}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Heart size={11} color="rgba(255,255,255,0.3)" />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{c.likes}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── 底部输入框 ── */}
            <div style={{ padding: '10px 16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={13} color="rgba(255,255,255,0.4)" />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '8px 14px', gap: 8 }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={`说说对 ${charName || '这个角色'} 的看法…`}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 12, fontFamily: 'inherit' }}
                />
                {commentText.trim() && (
                  <button onClick={() => setCommentText('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Send size={15} weight="fill" color="rgb(255,217,128)" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

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

// ══════════════════════════════════════════════════════════════
// 3A 级角色卡片：全息光泽 + 3D 翻转 + 收集飞入动效
// ══════════════════════════════════════════════════════════════
function CharacterCardFlip({ char, onCollect, onClose }) {
  const [flipped, setFlipped] = useState(false)
  const [collected, setCollected] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef(null)

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
    setShinePos({ x: x * 100, y: y * 100 })
  }
  function handleMouseLeave() {
    setMousePos({ x: 0.5, y: 0.5 })
  }

  async function handleCollect() {
    setCollected(true)
    await new Promise(r => setTimeout(r, 1200))
    onCollect?.()
  }

  const rotateX = flipped ? 0 : (mousePos.y - 0.5) * -18
  const rotateY = flipped ? 0 : (mousePos.x - 0.5) * 18

  const rarityColors = {
    'SSR': ['rgba(255,200,60,1)', 'rgba(255,140,20,0.8)', 'rgba(255,220,100,0.6)'],
    'SR':  ['rgba(180,120,255,1)', 'rgba(120,60,220,0.8)', 'rgba(200,160,255,0.6)'],
    'R':   ['rgba(80,180,255,1)', 'rgba(40,120,220,0.8)', 'rgba(120,200,255,0.6)'],
  }
  const rarity = char.rarity || 'SSR'
  const [c1, c2, c3] = rarityColors[rarity]

  if (collected) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1, y: 0 }}
        animate={{ opacity: 0, scale: 0.2, y: -200, rotate: 15 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
      >
        <div style={{ width: 220, height: 320, borderRadius: 20, background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 0 60px ${c1}` }} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      {/* 收集时粒子光效 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 2.5] }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0 }}
        style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${c3} 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 1 }}
      />

      {/* 卡片容器（3D perspective） */}
      <motion.div
        initial={{ scale: 0.3, y: 120, opacity: 0, rotateY: -90, rotateZ: -8 }}
        animate={{ scale: 1, y: 0, opacity: 1, rotateY: 0, rotateZ: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 160, delay: 0.1 }}
        style={{ perspective: 1200, zIndex: 2 }}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => !flipped && setFlipped(true)}
          animate={{
            rotateX: flipped ? 0 : rotateX,
            rotateY: flipped ? 200 : rotateY,
            scale: flipped ? [1, 1.12, 1] : 1,
          }}
          transition={{
            rotateY: { type: 'spring', damping: 12, stiffness: 120, mass: 1.2 },
            rotateX: { type: 'spring', damping: 20, stiffness: 300 },
            scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          style={{ width: 220, height: 320, position: 'relative', transformStyle: 'preserve-3d', cursor: flipped ? 'default' : 'pointer' }}
        >
          {/* ── 正面 ── */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            borderRadius: 20, overflow: 'hidden',
            background: `linear-gradient(135deg, rgba(20,16,10,0.95), rgba(10,8,6,0.98))`,
            border: `1px solid ${c2}`,
            boxShadow: `0 0 0 1px ${c3}, 0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${c2}40`,
          }}>
            {/* 角色立绘 */}
            <img src={char.avatar} alt={char.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />

            {/* 渐变遮罩 */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />

            {/* 全息光泽层（跟随鼠标） */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)`,
              mixBlendMode: 'screen',
            }} />

            {/* 彩虹光谱扫光 */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.15,
              background: `linear-gradient(${(mousePos.x * 360).toFixed(0)}deg, #ff006690, #ffbe0090, #00ff9490, #0066ff90, #cc00ff90)`,
              mixBlendMode: 'color-dodge',
            }} />

            {/* 稀有度横幅 */}
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              borderRadius: 6, padding: '3px 9px',
              fontSize: 11, fontWeight: 900, color: '#000', letterSpacing: '0.08em',
              boxShadow: `0 0 12px ${c1}`,
            }}>{rarity}</div>

            {/* 底部信息 */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 14px 14px' }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 5px', textShadow: `0 0 20px ${c1}80` }}>{char.name}</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                {(char.tags || []).slice(0,2).map(tag => (
                  <span key={tag} style={{ fontSize: 9, color: c1, background: `${c1}18`, border: `1px solid ${c1}40`, borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace' }}>{tag}</span>
                ))}
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: 0, fontFamily: 'monospace' }}>点击查看详情 →</p>
            </div>

            {/* 卡面纹理网格 */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
          </div>

          {/* ── 背面 ── */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            borderRadius: 20, overflow: 'hidden',
            background: 'rgba(12,10,8,0.98)',
            border: `1px solid ${c2}`,
            boxShadow: `0 0 0 1px ${c3}, 0 20px 60px rgba(0,0,0,0.8)`,
            transform: 'rotateY(180deg)',
            display: 'flex', flexDirection: 'column', padding: 18,
          }}>
            {/* 背面光效 */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 20%, ${c2}18 0%, transparent 60%)`, pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <img src={char.avatar} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', objectPosition: 'top', border: `1.5px solid ${c2}` }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>{char.name}</p>
                <p style={{ fontSize: 9, color: c1, margin: 0, fontFamily: 'monospace', fontWeight: 700 }}>{rarity} · Lv.{char.level || 1}</p>
              </div>
            </div>

            {/* 属性条 */}
            {[
              { label: '魅力', val: 88, color: 'rgba(255,120,180,0.9)' },
              { label: '神秘', val: 72, color: 'rgba(140,80,255,0.9)' },
              { label: '亲密', val: 45, color: c1 },
            ].map(stat => (
              <div key={stat.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{stat.label}</span>
                  <span style={{ fontSize: 9, color: stat.color, fontFamily: 'monospace', fontWeight: 700 }}>{stat.val}</span>
                </div>
                <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.val}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', borderRadius: 99, background: stat.color, boxShadow: `0 0 6px ${stat.color}` }}
                  />
                </div>
              </div>
            ))}

            <div style={{ flex: 1 }} />

            {/* 台词 */}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', lineHeight: 1.6, marginBottom: 14, fontStyle: 'italic' }}>
              "{char.lastMsg || '等你来找我。'}"
            </p>

            {/* 收集按钮 */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleCollect}
              style={{
                width: '100%', padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(130deg, #ffe066 0%, #ffb830 45%, #ff8c00 100%)',
                fontSize: 13, fontWeight: 800, color: '#1a0a00', letterSpacing: '0.04em',
                boxShadow: '0 4px 24px rgba(255,180,40,0.55), 0 2px 8px rgba(255,120,0,0.3)',
                textShadow: '0 1px 3px rgba(255,255,255,0.2)',
              }}
            >
              ✦ 收录角色
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* 关闭提示 */}
      <div style={{ position: 'absolute', bottom: 40, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
        点击空白处关闭
      </div>
    </motion.div>
  )
}

// ── ScenePickerDrawer 场景半屏选择器 ──
function ScenePickerDrawer({ open, onClose, activeSceneId, onSelect, onGoShop }) {
  const GOLD = 'rgb(255,217,128)'
  const GOLD_A = (a) => `rgba(255,217,128,${a})`
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400 }} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401, background: 'rgba(8,6,4,0.96)', backdropFilter: 'blur(32px)', borderRadius: '22px 22px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', paddingBottom: 36 }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '12px auto 0' }} />
            {/* 标题行 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>切换场景</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', margin: '3px 0 0', fontFamily: 'monospace' }}>选择你们的专属空间</p>
              </div>
              <button onClick={onGoShop}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: GOLD_A(0.1), border: `1px solid ${GOLD_A(0.28)}`, borderRadius: 999, padding: '5px 12px', cursor: 'pointer' }}>
                <span style={{ fontSize: 11, color: GOLD, fontWeight: 700 }}>🛍️ 去商城</span>
              </button>
            </div>
            {/* 场景列表 */}
            <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SCENES.map(scene => {
                const isActive = scene.id === activeSceneId
                const owned = scene.owned
                return (
                  <motion.button key={scene.id} whileTap={{ scale: 0.97 }}
                    onClick={() => owned && onSelect(scene.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px', borderRadius: 16,
                      background: isActive ? GOLD_A(0.07) : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? GOLD_A(0.35) : 'rgba(255,255,255,0.07)'}`,
                      cursor: owned ? 'pointer' : 'default', textAlign: 'left',
                      boxShadow: isActive ? `inset 0 0 0 1px ${GOLD_A(0.2)}` : 'none',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    {/* 缩略图 */}
                    <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                      <img src={scene.bg} alt={scene.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: owned ? 'none' : 'grayscale(80%) brightness(0.5)' }} />
                      {!owned && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                          <span style={{ fontSize: 16 }}>🔒</span>
                        </div>
                      )}
                    </div>
                    {/* 文字 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 14 }}>{scene.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? GOLD : '#fff' }}>{scene.name}</span>
                        {scene.price === 0 && <span style={{ fontSize: 9, color: 'rgba(100,220,160,0.9)', background: 'rgba(100,220,160,0.1)', border: '1px solid rgba(100,220,160,0.2)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace' }}>免费</span>}
                      </div>
                      <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.32)', margin: 0 }}>{scene.desc}</p>
                    </div>
                    {/* 右侧状态 */}
                    <div style={{ flexShrink: 0 }}>
                      {isActive ? (
                        <span style={{ fontSize: 13, color: GOLD, fontWeight: 700 }}>✓</span>
                      ) : owned ? (
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>›</span>
                      ) : (
                        <span style={{ fontSize: 11, color: GOLD, fontFamily: 'monospace', fontWeight: 700 }}>{scene.price}⭐</span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── ProfilePage 全屏个人主页 ──
// ── LevelUpToast 升级动效 ──
function LevelUpToast({ level, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])
  const GOLD = 'rgb(255,217,128)'
  const GOLD_A = (a) => `rgba(255,217,128,${a})`
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 1.05 }}
      transition={{ type: 'spring', damping: 16, stiffness: 200 }}
      style={{ position: 'fixed', bottom: 110, left: '50%', transform: 'translateX(-50%)', zIndex: 900, pointerEvents: 'none' }}
    >
      <div style={{ background: 'linear-gradient(135deg, rgba(20,15,5,0.95) 0%, rgba(40,28,6,0.95) 100%)', border: `1px solid ${GOLD_A(0.45)}`, borderRadius: 20, padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 30px ${GOLD_A(0.2)}`, backdropFilter: 'blur(20px)', whiteSpace: 'nowrap' }}>
        {/* 光晕圈 */}
        <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `2px solid ${GOLD_A(0.5)}` }}
          />
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `radial-gradient(circle, ${GOLD_A(0.25)} 0%, transparent 70%)`, border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⬆️
          </div>
        </div>
        <div>
          <p style={{ fontSize: 10, color: GOLD_A(0.6), fontFamily: 'monospace', margin: '0 0 3px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Level Up!</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: GOLD, margin: 0, lineHeight: 1, letterSpacing: '0.02em' }}>Lv.{level} 解锁</p>
        </div>
        {/* 星星粒子 */}
        {[...Array(5)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], x: (i - 2) * 18, y: -24 - i * 4 }}
            transition={{ delay: i * 0.08, duration: 1, ease: 'easeOut' }}
            style={{ position: 'absolute', top: 10, right: 20, fontSize: 11, pointerEvents: 'none' }}
          >⭐</motion.span>
        ))}
      </div>
    </motion.div>
  )
}

// ── TaskCompleteToast 任务完成小提示 ──
function TaskCompleteToast({ task, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400)
    return () => clearTimeout(t)
  }, [onDone])
  const GOLD = 'rgb(255,217,128)'
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      style={{ position: 'fixed', bottom: 110, right: 16, zIndex: 899, pointerEvents: 'none' }}
    >
      <div style={{ background: 'rgba(15,12,5,0.92)', border: '1px solid rgba(255,217,128,0.3)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)', maxWidth: 220 }}>
        <span style={{ fontSize: 20 }}>{task.icon}</span>
        <div>
          <p style={{ fontSize: 9, color: 'rgba(255,217,128,0.6)', fontFamily: 'monospace', margin: '0 0 2px', letterSpacing: '0.08em' }}>任务完成</p>
          <p style={{ fontSize: 11, color: '#fff', margin: 0, fontWeight: 600 }}>{task.label}</p>
          <p style={{ fontSize: 10, color: GOLD, margin: '2px 0 0', fontFamily: 'monospace' }}>+{task.xpReward} XP  +{task.coinReward} ⭐</p>
        </div>
      </div>
    </motion.div>
  )
}

function ProfilePage({ open, onClose, xp, level, taskProgress, unlockedBadges, totalMsgs, coinBalance }) {
  const [shopTab, setShopTab] = useState('场景')
  const [growthTab, setGrowthTab] = useState('任务')
  const [ownedScenes, setOwnedScenes] = useState(SCENES.filter(s => s.owned).map(s => s.id))
  const [activeView, setActiveView] = useState('养成') // '养成' | '商城'
  const GOLD = 'rgb(255,217,128)'
  const GOLD_A = (a) => `rgba(255,217,128,${a})`
  const SHOP_TABS = ['场景', '皮肤', '道具']
  const GROWTH_TABS = ['任务', '成就']

  // XP 进度计算
  const curLevelXP = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] || 0
  const nextLevelXP = LEVEL_THRESHOLDS[Math.min(level + 1, LEVEL_THRESHOLDS.length - 1)] || curLevelXP + 100
  const xpInLevel = xp - curLevelXP
  const xpNeeded = nextLevelXP - curLevelXP
  const xpPct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  // 成就检测状态
  const achieveState = { totalMsgs, level, ownedScenes: ownedScenes.length, loginDays: 3, collectedChars: 2, nightChat: false, totalSpent: 0, warmCount: 0 }

  function handleBuy(scene) {
    setOwnedScenes(prev => [...prev, scene.id])
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-page"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', inset: 0, zIndex: 600, background: '#080608', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* ── 顶部背景装饰 ── */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260, background: 'radial-gradient(ellipse at 50% -10%, rgba(255,180,40,0.12) 0%, transparent 70%)' }} />
          </div>

          {/* ── 顶部个人信息 ── */}
          <div style={{ flexShrink: 0, paddingTop: 52, paddingBottom: 0, position: 'relative', zIndex: 1 }}>
            {/* 关闭按钮 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 10px' }}>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                <X size={14} />
              </button>
            </div>
            {/* 头像 + 信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px 14px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${GOLD_A(0.45)}`, boxShadow: `0 0 20px ${GOLD_A(0.18)}` }}>
                  <img src="/mantou.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
                {/* 等级徽章 */}
                <div style={{ position: 'absolute', bottom: -4, right: -4, background: `linear-gradient(135deg, #ffb830, #ff8c00)`, borderRadius: 8, padding: '2px 6px', fontSize: 9, fontWeight: 900, color: '#000', border: '1.5px solid #080608', fontFamily: 'monospace' }}>Lv.{level}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>星际旅行者</p>
                {/* XP 进度条 */}
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: GOLD_A(0.6), fontFamily: 'monospace' }}>EXP {xpInLevel} / {xpNeeded}</span>
                    <span style={{ fontSize: 9, color: GOLD_A(0.45), fontFamily: 'monospace' }}>{xpPct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, #ffb830, #ff8c00)`, boxShadow: '0 0 8px rgba(255,160,30,0.5)' }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>距离 Lv.{level + 1} 还差 {xpNeeded - xpInLevel} XP</span>
              </div>
              {/* 星币 */}
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: GOLD_A(0.08), border: `1px solid ${GOLD_A(0.2)}`, borderRadius: 10, padding: '5px 10px' }}>
                  <span style={{ fontSize: 12 }}>⭐</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: GOLD, fontFamily: 'monospace' }}>{coinBalance}</span>
                </div>
                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.22)', margin: '3px 0 0', fontFamily: 'monospace' }}>星币</p>
              </div>
            </div>
            {/* 数据统计行 */}
            <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[{ label: '消息总数', val: String(totalMsgs) }, { label: '收录角色', val: '2' }, { label: '场景数', val: String(ownedScenes.length) }].map((item, i) => (
                <div key={item.label} style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>{item.val}</p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', fontFamily: 'monospace' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 主视图切换：养成 / 商城 ── */}
          <div style={{ flexShrink: 0, padding: '12px 20px 0', zIndex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 999, padding: 3, border: '1px solid rgba(255,255,255,0.07)' }}>
              {['养成', '商城'].map(v => (
                <button key={v} onClick={() => setActiveView(v)} style={{
                  flex: 1, height: 32, borderRadius: 999,
                  border: activeView === v ? `1px solid ${GOLD_A(0.4)}` : '1px solid transparent',
                  background: activeView === v ? GOLD_A(0.13) : 'none',
                  fontSize: 13, fontWeight: activeView === v ? 700 : 400,
                  color: activeView === v ? GOLD : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{v === '养成' ? '🌱 养成' : '🛍️ 商城'}</button>
              ))}
            </div>
          </div>

          {/* ── 养成视图 ── */}
          {activeView === '养成' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', zIndex: 1 }}>
              {/* 子 Tab：任务 / 成就 */}
              <div style={{ padding: '10px 20px 0', flexShrink: 0, display: 'flex', gap: 6 }}>
                {GROWTH_TABS.map(t => (
                  <button key={t} onClick={() => setGrowthTab(t)} style={{
                    height: 28, padding: '0 16px', borderRadius: 99,
                    border: growthTab === t ? `1px solid ${GOLD_A(0.35)}` : '1px solid rgba(255,255,255,0.08)',
                    background: growthTab === t ? GOLD_A(0.1) : 'transparent',
                    fontSize: 11, fontWeight: growthTab === t ? 700 : 400,
                    color: growthTab === t ? GOLD : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>{t === '任务' ? '📋 每日任务' : '🏅 成就徽章'}</button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '10px 16px 32px' }}>

                {/* ── 每日任务 ── */}
                {growthTab === '任务' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* 今日总奖励预览 */}
                    <div style={{ background: `linear-gradient(135deg, rgba(255,180,40,0.08), rgba(255,130,0,0.05))`, border: `1px solid ${GOLD_A(0.15)}`, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: GOLD, margin: '0 0 2px' }}>今日奖励池</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily: 'monospace' }}>完成全部任务可获得</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 16, fontWeight: 900, color: GOLD, margin: '0 0 2px', fontFamily: 'monospace' }}>+125 XP</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,217,128,0.6)', margin: 0, fontFamily: 'monospace' }}>+36 ⭐</p>
                      </div>
                    </div>

                    {DAILY_TASKS.map(task => {
                      const prog = taskProgress[task.id] || 0
                      const done = prog >= task.goal
                      const pct = Math.min(100, Math.round((prog / task.goal) * 100))
                      return (
                        <motion.div key={task.id} layout
                          style={{ background: done ? `linear-gradient(135deg, rgba(255,180,40,0.09), rgba(255,130,0,0.06))` : 'rgba(255,255,255,0.03)', border: `1px solid ${done ? GOLD_A(0.25) : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
                        >
                          {/* 图标 + 完成状态 */}
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: done ? GOLD_A(0.15) : 'rgba(255,255,255,0.05)', border: `1px solid ${done ? GOLD_A(0.3) : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {done ? '✅' : task.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: done ? GOLD_A(0.8) : '#fff', margin: 0 }}>{task.label}</p>
                              <span style={{ fontSize: 10, color: done ? GOLD : 'rgba(255,255,255,0.35)', fontFamily: 'monospace', flexShrink: 0, marginLeft: 8 }}>{prog}/{task.goal}</span>
                            </div>
                            {/* 进度条 */}
                            <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{ height: '100%', borderRadius: 99, background: done ? `linear-gradient(90deg, ${GOLD}, #ff8c00)` : 'rgba(255,255,255,0.2)' }}
                              />
                            </div>
                          </div>
                          {/* 奖励 */}
                          <div style={{ flexShrink: 0, textAlign: 'right' }}>
                            <p style={{ fontSize: 10, color: done ? GOLD : 'rgba(255,217,128,0.4)', margin: '0 0 2px', fontFamily: 'monospace', fontWeight: 700 }}>+{task.xpReward} XP</p>
                            <p style={{ fontSize: 9, color: done ? GOLD_A(0.6) : 'rgba(255,255,255,0.2)', margin: 0, fontFamily: 'monospace' }}>+{task.coinReward}⭐</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* ── 成就徽章 ── */}
                {growthTab === '成就' && (
                  <div>
                    {/* 已解锁统计 */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>已解锁成就</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: GOLD, margin: 0, fontFamily: 'monospace' }}>{unlockedBadges.length} / {ACHIEVEMENTS.length}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {ACHIEVEMENTS.map(ach => {
                        const unlocked = unlockedBadges.includes(ach.id) || ach.condition(achieveState)
                        return (
                          <motion.div key={ach.id} whileTap={{ scale: 0.97 }}
                            style={{ borderRadius: 16, padding: '14px 12px', background: unlocked ? `linear-gradient(135deg, rgba(255,180,40,0.1), rgba(255,100,0,0.06))` : 'rgba(255,255,255,0.02)', border: `1px solid ${unlocked ? GOLD_A(0.25) : 'rgba(255,255,255,0.06)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}
                          >
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: unlocked ? GOLD_A(0.15) : 'rgba(255,255,255,0.04)', border: `2px solid ${unlocked ? GOLD_A(0.4) : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, filter: unlocked ? 'none' : 'grayscale(1) brightness(0.4)' }}>
                              {ach.icon}
                            </div>
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 700, color: unlocked ? GOLD_A(0.9) : 'rgba(255,255,255,0.25)', margin: '0 0 3px' }}>{ach.name}</p>
                              <p style={{ fontSize: 9, color: unlocked ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)', margin: 0, fontFamily: 'monospace', lineHeight: 1.4 }}>{ach.desc}</p>
                            </div>
                            {unlocked && (
                              <div style={{ background: GOLD, borderRadius: 5, padding: '1px 7px', fontSize: 8, fontWeight: 800, color: '#000', fontFamily: 'monospace' }}>已解锁</div>
                            )}
                            {!unlocked && (
                              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '1px 7px', fontSize: 8, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>未解锁</div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 商城视图 ── */}
          {activeView === '商城' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', zIndex: 1 }}>
              <div style={{ padding: '10px 20px 0', flexShrink: 0, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {SHOP_TABS.map(tab => (
                    <button key={tab} onClick={() => setShopTab(tab)} style={{
                      height: 28, padding: '0 14px', borderRadius: 99,
                      border: shopTab === tab ? `1px solid ${GOLD_A(0.35)}` : '1px solid rgba(255,255,255,0.08)',
                      background: shopTab === tab ? GOLD_A(0.1) : 'transparent',
                      fontSize: 11, fontWeight: shopTab === tab ? 700 : 400,
                      color: shopTab === tab ? GOLD : 'rgba(255,255,255,0.35)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>{tab}</button>
                  ))}
                </div>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace' }}>每周更新</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '10px 16px 32px' }}>
                {shopTab === '场景' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {SCENES.map(scene => {
                      const owned = ownedScenes.includes(scene.id)
                      return (
                        <motion.div key={scene.id} whileTap={{ scale: 0.97 }}
                          style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${owned ? GOLD_A(0.25) : 'rgba(255,255,255,0.07)'}`, background: '#0f0d12', position: 'relative' }}
                        >
                          <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
                            <img src={scene.bg} alt={scene.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: owned ? 'none' : 'grayscale(60%) brightness(0.6)' }} />
                            <div style={{ position: 'absolute', inset: 0, background: scene.overlay }} />
                            {owned && <div style={{ position: 'absolute', top: 8, right: 8, background: GOLD, borderRadius: 6, padding: '2px 7px', fontSize: 9, fontWeight: 800, color: '#000', fontFamily: 'monospace' }}>已拥有</div>}
                            {!owned && <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '2px 7px', fontSize: 10, color: GOLD, fontFamily: 'monospace', fontWeight: 700, backdropFilter: 'blur(8px)' }}>⭐{scene.price}</div>}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px' }}>
                              <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 2px', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>{scene.emoji} {scene.name}</p>
                              <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)', margin: 0, fontFamily: 'monospace' }}>{scene.desc}</p>
                            </div>
                          </div>
                          <div style={{ padding: '10px 10px 12px' }}>
                            {owned ? (
                              <button style={{ width: '100%', height: 34, borderRadius: 10, background: GOLD_A(0.08), border: `1px solid ${GOLD_A(0.2)}`, fontSize: 12, color: GOLD_A(0.7), fontWeight: 600, cursor: 'default' }}>已解锁 ✓</button>
                            ) : (
                              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleBuy(scene)}
                                style={{ width: '100%', height: 34, borderRadius: 10, background: 'linear-gradient(130deg, #ffe066 0%, #ffb830 100%)', border: 'none', fontSize: 12, color: '#1a0a00', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 12px rgba(255,180,40,0.3)' }}>
                                ⭐{scene.price} 解锁场景
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
                {(shopTab === '皮肤' || shopTab === '道具') && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 32 }}>🚧</span>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace' }}>{shopTab}商城即将上线</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([])
  const [playingId, setPlayingId] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [activeTab, setActiveTab] = useState('推荐')
  const [viewMode, setViewMode] = useState('grid')
  const [tabFlashKey, setTabFlashKey] = useState(0)
  const [followIdx, setFollowIdx] = useState(0)
  const [commentOpen, setCommentOpen] = useState(false)
  const [commentChar, setCommentChar] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [creationOpen, setCreationOpen] = useState(false)
  const [agentEditorOpen, setAgentEditorOpen] = useState(false)
  const [inspirationLabOpen, setInspirationLabOpen] = useState(false)
  const [cardChar, setCardChar] = useState(null)   // 角色卡片翻转弹层
  // ── 场景 / 个人主页 ──
  const [activeSceneId, setActiveSceneId] = useState('default')
  const [scenePickerOpen, setScenePickerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  // ── 推荐页解锁流 ──
  const [recommendCharIdx, setRecommendCharIdx] = useState(0)  // 当前推荐角色下标
  const [showSwipeHint, setShowSwipeHint] = useState(true)     // 仅首次展示上滑提示
  // ── 游戏数值反馈 ──
  const [energy, setEnergy] = useState(24)          // 亲密能量 0-100
  const [mood, setMood] = useState('calm')           // calm | warm | excited | mysterious
  const [energyPulse, setEnergyPulse] = useState(false) // 能量槽波动动画触发
  // ── 养成系统 ──
  const [xp, setXp] = useState(0)                  // 累计 XP
  const [level, setLevel] = useState(1)             // 当前等级
  const [coinBalance, setCoinBalance] = useState(120) // 星币余额
  const [totalMsgs, setTotalMsgs] = useState(0)    // 累计发送消息数
  const [taskProgress, setTaskProgress] = useState({ chat3: 0, send10: 0, collect1: 0, scene1: 0, login: 1 })
  const [unlockedBadges, setUnlockedBadges] = useState([])
  const [levelUpToast, setLevelUpToast] = useState(null)       // { level: N } | null
  const [taskCompleteToast, setTaskCompleteToast] = useState(null) // task | null
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)
  const touchStartYRef = useRef(null)

  // 情绪关键词检测
  function detectMood(text) {
    const warm = ['喜欢', '爱', '想你', '谢谢', '好', '开心', '棒', '太好了', '感谢', '高兴', '暖']
    const excited = ['哇', '真的', '厉害', '惊喜', '天啊', '哈哈', '好玩', '太棒', '绝了', '！！']
    const mysterious = ['秘密', '告诉我', '为什么', '怎么', '感觉', '奇怪', '难道', '其实', '隐藏', '真相']
    if (excited.some(k => text.includes(k))) return 'excited'
    if (warm.some(k => text.includes(k))) return 'warm'
    if (mysterious.some(k => text.includes(k))) return 'mysterious'
    return 'calm'
  }

  // 情绪 → 背景渐变色
  const moodGradients = {
    calm:       'radial-gradient(ellipse at 30% 60%, rgba(255,217,128,0.06) 0%, transparent 70%), radial-gradient(ellipse at 80% 20%, rgba(100,140,200,0.05) 0%, transparent 60%)',
    warm:       'radial-gradient(ellipse at 30% 70%, rgba(255,140,60,0.18) 0%, transparent 65%), radial-gradient(ellipse at 75% 25%, rgba(255,200,80,0.12) 0%, transparent 55%)',
    excited:    'radial-gradient(ellipse at 50% 60%, rgba(255,80,160,0.16) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(255,120,200,0.10) 0%, transparent 50%)',
    mysterious: 'radial-gradient(ellipse at 30% 50%, rgba(140,80,255,0.18) 0%, transparent 65%), radial-gradient(ellipse at 70% 20%, rgba(80,120,255,0.10) 0%, transparent 55%)',
  }

  const moodLabels = { calm: '平静', warm: '温暖', excited: '雀跃', mysterious: '神秘' }
  const moodColors = { calm: 'rgba(180,200,255,0.7)', warm: 'rgba(255,180,80,0.85)', excited: 'rgba(255,100,180,0.85)', mysterious: 'rgba(160,100,255,0.85)' }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 停留 1 秒后淡入数据浮层
  useEffect(() => {
    const t = setTimeout(() => setShowStats(true), 1000)
    return () => clearTimeout(t)
  }, [])

  // 停止 TTS
  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: trimmed }])
    setInputText('')
    // 情绪检测 + 能量波动
    const newMood = detectMood(trimmed)
    setMood(newMood)
    setEnergy(prev => Math.min(100, prev + Math.floor(Math.random() * 8) + 3))
    setEnergyPulse(true)
    setTimeout(() => setEnergyPulse(false), 600)
    // ── 养成系统：XP + 任务进度 ──
    const xpGain = 8 + Math.floor(Math.random() * 5)
    setXp(prev => {
      const next = prev + xpGain
      // 检测升级
      const curLv = LEVEL_THRESHOLDS.findIndex((t, i) => next < (LEVEL_THRESHOLDS[i + 1] ?? Infinity))
      const effectiveLv = Math.max(1, curLv)
      setLevel(oldLv => {
        if (effectiveLv > oldLv) {
          setLevelUpToast({ level: effectiveLv })
          setCoinBalance(b => b + effectiveLv * 5)
        }
        return effectiveLv
      })
      return next
    })
    setTotalMsgs(prev => {
      const next = prev + 1
      // 任务进度推进
      setTaskProgress(tp => {
        const updated = {
          ...tp,
          send10: Math.min(DAILY_TASKS.find(t => t.id === 'send10').goal, tp.send10 + 1),
          chat3:  Math.min(DAILY_TASKS.find(t => t.id === 'chat3').goal, tp.chat3 + 1),
        }
        // 检测是否刚好完成某任务
        DAILY_TASKS.forEach(task => {
          if (updated[task.id] >= task.goal && tp[task.id] < task.goal) {
            setTaskCompleteToast(task)
            setCoinBalance(b => b + task.coinReward)
            setXp(x => x + task.xpReward)
          }
        })
        return updated
      })
      return next
    })
    setTimeout(() => {
      const reply = AI_REPLIES[replyIdx % AI_REPLIES.length]
      replyIdx++
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }])
      // AI 回复后再给一点能量
      setEnergy(prev => Math.min(100, prev + 2))
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

  // ── 上滑解锁：touchstart / touchend ──
  function handleTouchStart(e) {
    if (activeTab !== '推荐') return
    touchStartYRef.current = e.touches[0].clientY
  }
  function handleTouchEnd(e) {
    if (activeTab !== '推荐') return
    if (touchStartYRef.current === null) return
    const dy = touchStartYRef.current - e.changedTouches[0].clientY
    touchStartYRef.current = null
    if (dy < 60) return   // 上滑距离不够
    const nextIdx = recommendCharIdx + 1
    if (nextIdx >= FOLLOW_CHARS.length) return
    const next = FOLLOW_CHARS[nextIdx]
    setCardChar({ ...next, rarity: next.level >= 5 ? 'SSR' : next.level >= 3 ? 'SR' : 'R', isUnlock: true })
  }

  return (
    <>
    <motion.div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      animate={{ x: settingsOpen ? -30 : 0, scale: settingsOpen ? 0.97 : 1 }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#030303',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transformOrigin: 'center center',
        borderRadius: settingsOpen ? 20 : 0,
      }}
    >
      {/* ─── Background（仅推荐页显示立绘） ─── */}
      {activeTab === '推荐' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={activeSceneId + recommendCharIdx}
              src={(() => { const s = SCENES.find(s => s.id === activeSceneId); return s ? s.bg : FOLLOW_CHARS[recommendCharIdx].avatar })()}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
              alt=""
            />
          </AnimatePresence>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, transparent 50%, #030303 100%)', opacity: 0.8 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(3,3,3,0.7) 0%, transparent 40%, rgba(3,3,3,0.95) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px', opacity: 0.6, pointerEvents: 'none', mixBlendMode: 'overlay' }} />
          <div style={{ position: 'absolute', bottom: '33%', left: 0, width: 4, height: 64, backgroundColor: 'rgb(255,217,128)', opacity: 0.5, boxShadow: '0 0 10px rgb(255,217,128)' }} />
        </div>
      )}

      {/* ─── Header（单行固定高度） ─── */}
      <header className="relative z-20 flex justify-between items-center px-5 w-full shrink-0" style={{ paddingTop: 56, paddingBottom: 12, height: 'calc(56px + 40px + 12px)' }}>
        {/* 左侧：搜索按钮 */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 transition-colors active:scale-95">
          <MagnifyingGlass size={18} color="white" />
        </button>
        <div className="glass-panel rounded-full p-1 flex items-center shadow-lg" style={{ position: 'relative' }}>
          {['推荐', '关注'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setTabFlashKey(k => k + 1) }}
              className="relative px-4 py-1.5 rounded-full text-xs tracking-wider"
              style={{ color: activeTab === tab ? '#000' : '#808080', fontWeight: activeTab === tab ? 600 : 500, transition: 'color 0.25s', zIndex: 1 }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="home-tab-bg"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: '#fff', zIndex: -1 }}
                  transition={{ type: 'spring', bounce: 0.52, duration: 0.48 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
        {/* 右侧：... 更多按钮，点击打开设置抽屉 */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 transition-colors active:scale-95"
        >
          <DotsThree size={22} color="white" weight="bold" />
        </button>
      </header>

      {/* ─── 视图切换按钮行（仅关注页，固定高度占位） ─── */}
      <div className="relative z-20 flex justify-end px-5 shrink-0" style={{ height: 32, marginTop: -4 }}>
        <button
          onClick={() => {
            const next = viewMode === 'immersive' ? 'grid' : 'immersive'
            setViewMode(next)
            localStorage.setItem('followViewMode', next)
          }}
          className="flex items-center justify-center rounded-full transition-colors active:scale-95"
          style={{
            width: 28, height: 28,
            visibility: activeTab === '关注' ? 'visible' : 'hidden',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          title={viewMode === 'immersive' ? '切换网格' : '切换沉浸'}
        >
          {viewMode === 'immersive'
            ? <SquaresFour size={13} color="rgba(255,255,255,0.7)" />
            : <Rows size={13} color="rgba(255,255,255,0.7)" />
          }
        </button>
      </div>

      {/* ══════════════════════════════════════════
          推荐页：全屏沉浸立绘 + 对话
      ══════════════════════════════════════════ */}
      <AnimatePresence mode="wait" initial={false}>
      {activeTab === '推荐' && (
        <motion.div
          key="tab-推荐"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'contents' }}
        >
          {/* ─── 情绪渐变背景层（覆盖在立绘之上，随 mood 变化） ─── */}
          <motion.div
            key={mood}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0, zIndex: 1,
              background: moodGradients[mood],
              pointerEvents: 'none',
            }}
          />

          {/* ─── Character Selector ─── */}
          <div className="relative z-20 px-5 shrink-0 self-start w-full" style={{ marginTop: '-16px' }}>
            {/* 整行包裹在一个深色圆角胶囊内 */}
            <div
              className="flex items-center gap-3 brutalist-border"
              style={{
                background: 'rgba(20,18,16,0.75)',
                backdropFilter: 'blur(20px)',
                borderRadius: 999,
                padding: '6px 8px 6px 6px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'inline-flex',
              }}
            >
              {/* 头像 */}
              <div className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: '#0F0F0F' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={recommendCharIdx}
                    src={FOLLOW_CHARS[recommendCharIdx].avatar}
                    className="w-full h-full object-cover object-top"
                    alt={FOLLOW_CHARS[recommendCharIdx].name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>
                <svg className="absolute inset-0 w-full h-full avatar-ring" viewBox="0 0 100 100" style={{ opacity: 0.5 }}>
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgb(255,217,128)" strokeWidth="1" strokeDasharray="4 8" />
                </svg>
              </div>
              {/* 用户名 + 标签 */}
              <div className="flex flex-col items-start gap-0.5 mr-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={recommendCharIdx}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold tracking-wide leading-none"
                  >{FOLLOW_CHARS[recommendCharIdx].name}</motion.span>
                </AnimatePresence>
                <div className="flex gap-1.5 pointer-events-none select-none">
                  {FOLLOW_CHARS[recommendCharIdx].tags.map((tag) => (
                    <span key={tag} className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,217,128,0.5)', letterSpacing: '0.06em' }}>{tag}</span>
                  ))}
                </div>
              </div>
              {/* 金色透明底 + 号 */}
              <button
                className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 hover:scale-105"
                style={{ width: 26, height: 26, background: 'rgba(255,217,128,0.12)', border: '1px solid rgba(255,217,128,0.45)', boxShadow: '0 0 10px rgba(255,217,128,0.2)' }}
              >
                <Plus size={12} weight="bold" color="rgb(255,217,128)" />
              </button>
              {/* 灰色圆形评论图标 */}
              <button
                onClick={() => { setCommentChar(FOLLOW_CHARS[recommendCharIdx].name); setCommentOpen(true) }}
                className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 hover:scale-105"
                style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <ChatCenteredDots size={12} color="rgba(255,255,255,0.6)" />
              </button>
              {/* ✦ 角色卡片收集触发按钮 */}
              <button
                onClick={() => {
                  const c = FOLLOW_CHARS[recommendCharIdx]
                  setCardChar({ ...c, rarity: c.level >= 5 ? 'SSR' : c.level >= 3 ? 'SR' : 'R' })
                }}
                className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 hover:scale-110"
                style={{ width: 26, height: 26, background: 'rgba(255,217,128,0.08)', border: '1px solid rgba(255,217,128,0.25)' }}
                title="查看角色卡片"
              >
                <span style={{ fontSize: 11, color: 'rgba(255,217,128,0.8)', lineHeight: 1 }}>✦</span>
              </button>
              {/* 🎭 场景切换按钮 */}
              <button
                onClick={() => setScenePickerOpen(true)}
                className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 hover:scale-110"
                style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                title="切换场景"
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>🎭</span>
              </button>
            </div>
          </div>

          {/* ─── 情绪 + 能量槽（对话区上方，与胶囊左对齐） ─── */}
          <div className="relative z-20 shrink-0 flex items-center gap-4" style={{ padding: '6px 20px 2px' }}>
            {/* 能量槽 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderRadius: 999, padding: '4px 10px 4px 8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.09 12.96A1 1 0 0 0 5 14.5h7L10 22l10.91-9.96A1 1 0 0 0 20 10.5h-7L13 2z" fill="rgba(255,217,128,0.85)" />
              </svg>
              <div style={{ width: 64, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  animate={{ width: `${energy}%` }}
                  transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                  style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, rgba(255,180,60,0.9), rgba(255,217,128,1))', boxShadow: energyPulse ? '0 0 8px rgba(255,217,128,0.8)' : '0 0 4px rgba(255,217,128,0.3)' }}
                />
                {energyPulse && (
                  <motion.div
                    initial={{ opacity: 0.8, scaleX: 1 }}
                    animate={{ opacity: 0, scaleX: 1.4 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(255,217,128,0.4)', borderRadius: 99, transformOrigin: 'left' }}
                  />
                )}
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,217,128,0.75)', fontFamily: 'monospace', fontWeight: 700, minWidth: 22, textAlign: 'right' }}>{energy}</span>
            </div>

            {/* 情绪标签 */}
            <motion.div
              key={mood}
              initial={{ opacity: 0, y: -4, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
                borderRadius: 999, padding: '3px 10px 3px 7px',
                border: `1px solid ${moodColors[mood]}`,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: moodColors[mood], boxShadow: `0 0 6px ${moodColors[mood]}` }} />
              <span style={{ fontSize: 10, color: moodColors[mood], fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em' }}>
                {moodLabels[mood]}
              </span>
            </motion.div>
          </div>

          {/* ─── 上滑提示（仅首次 / 还有角色可解锁时显示） ─── */}
          <AnimatePresence>
            {showSwipeHint && recommendCharIdx === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 shrink-0 flex items-center justify-center gap-2"
                style={{ padding: '2px 20px 0', pointerEvents: 'none' }}
              >
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace', letterSpacing: '0.06em' }}
                >↑</motion.span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                  往上滑动解锁下一个角色
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── 对话区 ─── */}
          <div className="relative z-20 flex-1 flex flex-col justify-end" style={{ minHeight: 0, overflow: 'hidden' }}>
            <div className="px-4 shrink-0 overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: '52vh' }}>
              <div className="flex flex-col min-h-full">
                <div className="flex-1" />

                {/* 默认文案：无对话时显示 */}
                {messages.length === 0 && (
                  <p
                    className="font-mono text-xs leading-relaxed tracking-wide py-3 mb-3"
                    style={{
                      color: 'rgba(255,255,255,0.65)',
                      borderTop: '1px solid rgba(255,255,255,0.07)',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      whiteSpace: 'pre-line',
                      textAlign: 'left',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {DEFAULT_QUOTE}
                  </p>
                )}

                {/* 聊天气泡 */}
                <div className="flex flex-col gap-2 pb-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' ? (
                        <div
                          className="max-w-[60%] px-3 pt-2 pb-1.5 rounded-2xl rounded-tl-sm"
                          style={{ background: 'rgba(15,10,5,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,217,128,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
                        >
                          <p className="text-[13px] leading-relaxed font-mono" style={{ color: 'rgba(255,255,255,0.85)' }} title={msg.text}>
                            {truncate(msg.text)}
                          </p>
                          <button
                            onClick={() => handlePlay(msg)}
                            className="flex items-center gap-[3px] mt-1.5 w-full transition-all active:scale-95"
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 5 }}
                            title={playingId === msg.id ? '停止' : '播放'}
                          >
                            <div className="flex items-end gap-[2.5px]" style={{ height: 14 }}>
                              {playingId === msg.id ? (
                                [2, 4, 3.5, 1.5, 3].map((h, i) => (
                                  <div key={i} className="wave-bar rounded-full" style={{ width: 2, height: `${h * 3}px`, backgroundColor: 'rgba(255,217,128,0.9)', boxShadow: '0 0 3px rgba(255,217,128,0.4)', animationDuration: `${0.48 + i * 0.06}s` }} />
                                ))
                              ) : (
                                [2, 4, 3.5, 1.5, 3].map((h, i) => (
                                  <div key={i} className="rounded-full" style={{ width: 2, height: `${h * 3}px`, backgroundColor: 'rgba(255,255,255,0.38)' }} />
                                ))
                              )}
                            </div>
                          </button>
                        </div>
                      ) : (
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
                  placeholder="试着认识他..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={200}
                  className="bg-transparent border-none outline-none text-white text-[15px] w-full font-medium pb-0.5"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              )}
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
        </motion.div>
      )}

      {/* ══════════════════════════════════════════
          关注页
      ══════════════════════════════════════════ */}
      {activeTab === '关注' && (
        <motion.div
          key="tab-关注"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'contents' }}
        >
          {/* ── Immersive：全屏单角色，功能与推荐页完全一致 ── */}
          {viewMode === 'immersive' && (() => {
            const char = FOLLOW_CHARS[followIdx]
            return (
              <>
                {/* 全屏背景立绘 */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={char.id}
                      src={char.avatar}
                      alt={char.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                    />
                  </AnimatePresence>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, transparent 50%, #030303 100%)', opacity: 0.8 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(3,3,3,0.7) 0%, transparent 40%, rgba(3,3,3,0.95) 100%)' }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px', opacity: 0.6, pointerEvents: 'none', mixBlendMode: 'overlay' }} />
                  <div style={{ position: 'absolute', bottom: '33%', left: 0, width: 4, height: 64, backgroundColor: 'rgb(255,217,128)', opacity: 0.5, boxShadow: '0 0 10px rgb(255,217,128)' }} />
                </div>

                {/* 角色选择器行：与推荐页完全一致的深色胶囊整行 */}
                <div className="relative z-20 px-5 shrink-0 self-start w-full" style={{ marginTop: '-16px' }}>
                  <div
                    className="flex items-center gap-3 brutalist-border"
                    style={{
                      background: 'rgba(20,18,16,0.75)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 999,
                      padding: '6px 8px 6px 6px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'inline-flex',
                    }}
                  >
                    {/* 头像（带切换动画） */}
                    <div className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: '#0F0F0F' }}>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={char.id}
                          src={char.avatar}
                          className="w-full h-full object-cover object-top"
                          alt={char.name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      </AnimatePresence>
                      <svg className="absolute inset-0 w-full h-full avatar-ring" viewBox="0 0 100 100" style={{ opacity: 0.5 }}>
                        <circle cx="50" cy="50" r="48" fill="none" stroke="rgb(255,217,128)" strokeWidth="1" strokeDasharray="4 8" />
                      </svg>
                    </div>
                    {/* 用户名 + 标签 */}
                    <div className="flex flex-col items-start gap-0.5 mr-1">
                      <span className="text-xs font-semibold tracking-wide leading-none">{char.name}</span>
                      <div className="flex gap-1.5 pointer-events-none select-none">
                        {char.tags.map(tag => (
                          <span key={tag} className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,217,128,0.5)', letterSpacing: '0.06em' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    {/* 金色透明底 ✓ 勾（已关注） */}
                    <button
                      className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 hover:scale-105"
                      style={{ width: 26, height: 26, background: 'rgba(255,217,128,0.12)', border: '1px solid rgba(255,217,128,0.45)', boxShadow: '0 0 10px rgba(255,217,128,0.2)', fontSize: 12, color: 'rgb(255,217,128)' }}
                    >✓</button>
                    {/* 灰色圆形评论图标 */}
                    <button
                      onClick={() => { setCommentChar(char.name); setCommentOpen(true) }}
                      className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 hover:scale-105"
                      style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      <ChatCenteredDots size={12} color="rgba(255,255,255,0.6)" />
                    </button>
                    {/* ✦ 角色卡片收集触发按钮 */}
                    <button
                      onClick={() => setCardChar({ ...char, rarity: 'SSR', description: char.lastMsg })}
                      className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 hover:scale-110"
                      style={{ width: 26, height: 26, background: 'rgba(255,217,128,0.08)', border: '1px solid rgba(255,217,128,0.25)' }}
                      title="查看角色卡片"
                    >
                      <span style={{ fontSize: 11, color: 'rgba(255,217,128,0.8)', lineHeight: 1 }}>✦</span>
                    </button>
                  </div>
                </div>

                {/* 对话区（与推荐页完全相同） */}
                <div className="relative z-20 flex-1 flex flex-col justify-end" style={{ minHeight: 0, overflow: 'hidden' }}>
                  <div className="px-4 shrink-0 overflow-y-auto" style={{ scrollbarWidth: 'none', maxHeight: '52vh' }}>
                    <div className="flex flex-col min-h-full">
                      <div className="flex-1" />
                      {messages.length === 0 && (
                        <p
                          className="font-mono text-xs leading-relaxed tracking-wide py-3 mb-3"
                          style={{
                            color: 'rgba(255,255,255,0.65)',
                            borderTop: '1px solid rgba(255,255,255,0.07)',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                            whiteSpace: 'pre-line',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >{char.lastMsg}</p>
                      )}
                      <div className="flex flex-col gap-2 pb-2">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex items-end gap-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' ? (
                              <div className="max-w-[60%] px-3 pt-2 pb-1.5 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(15,10,5,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,217,128,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                                <p className="text-[13px] leading-relaxed font-mono" style={{ color: 'rgba(255,255,255,0.85)' }}>{truncate(msg.text)}</p>
                                <button onClick={() => handlePlay(msg)} className="flex items-center gap-[3px] mt-1.5 w-full transition-all active:scale-95" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 5 }}>
                                  <div className="flex items-end gap-[2.5px]" style={{ height: 14 }}>
                                    {playingId === msg.id
                                      ? [2, 4, 3.5, 1.5, 3].map((h, i) => <div key={i} className="wave-bar rounded-full" style={{ width: 2, height: `${h * 3}px`, backgroundColor: 'rgba(255,217,128,0.9)', boxShadow: '0 0 3px rgba(255,217,128,0.4)', animationDuration: `${0.48 + i * 0.06}s` }} />)
                                      : [2, 4, 3.5, 1.5, 3].map((h, i) => <div key={i} className="rounded-full" style={{ width: 2, height: `${h * 3}px`, backgroundColor: 'rgba(255,255,255,0.38)' }} />)
                                    }
                                  </div>
                                </button>
                              </div>
                            ) : (
                              <div className="max-w-[50%] px-3 py-2 rounded-2xl rounded-tr-sm" style={{ background: 'rgba(255,217,128,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,217,128,0.25)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                                <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>{truncate(msg.text)}</p>
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={bottomRef} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input（与推荐页完全相同） */}
                <div className="relative z-30 px-5 py-3 shrink-0">
                  <div className="glass-input rounded-[28px] p-1.5 pl-5 flex items-center gap-3 w-full transition-all duration-300" style={isRecording ? { border: '1px solid rgba(255,217,128,0.5)', background: 'rgba(255,217,128,0.07)' } : {}}>
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
                        placeholder={`试着和${char.name}聊聊...`}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={200}
                        className="bg-transparent border-none outline-none text-white text-[15px] w-full font-medium pb-0.5"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    )}
                    {!isRecording && inputText.trim() ? (
                      <button onClick={() => sendMessage(inputText)} className="w-[44px] h-[44px] rounded-[18px] shrink-0 flex items-center justify-center transition-all active:scale-90 hover:scale-95" style={{ backgroundColor: 'rgb(255,217,128)', boxShadow: '0 0 20px rgba(255,217,128,0.3)' }}>
                        <PaperPlaneTilt size={20} weight="fill" color="#000" />
                      </button>
                    ) : (
                      <button onClick={toggleRecording} className="w-[44px] h-[44px] rounded-[18px] shrink-0 flex flex-col items-center justify-center overflow-visible relative transition-all active:scale-90" style={{ backgroundColor: isRecording ? 'rgba(30,20,10,0.85)' : 'rgb(255,217,128)', boxShadow: isRecording ? '0 0 0 6px rgba(255,217,128,0.2),0 0 24px rgba(255,217,128,0.35),inset 0 0 0 1px rgba(255,217,128,0.3)' : '0 0 20px rgba(255,217,128,0.3)', transform: isRecording ? 'scale(1.05)' : 'scale(1)' }}>
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
                    <p className="text-center mt-2 text-[11px] font-mono" style={{ color: 'rgba(255,217,128,0.6)' }}>说话中… 说完后自动发送</p>
                  )}
                </div>
              </>
            )
          })()}

          {/* ── Grid 双列模式 ── */}
          {viewMode === 'grid' && (
            <div className="relative z-20 flex-1 overflow-y-auto px-4 pt-3 pb-4" style={{ scrollbarWidth: 'none' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
                >
                  {FOLLOW_CHARS.map((char, idx) => (
                    <motion.button
                      key={char.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="text-left"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { setFollowIdx(idx); setViewMode('immersive') }}
                      style={{
                        aspectRatio: '3 / 4',
                        borderRadius: 18,
                        overflow: 'hidden',
                        position: 'relative',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03), 0 8px 28px rgba(0,0,0,0.65)',
                        background: '#070503',
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0 }}>
                        <img src={char.avatar} alt={char.name} style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                        {/* 顶部渐变 */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 35%)' }} />
                        {/* 底部渐变 */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 35%, transparent 60%)' }} />
                      </div>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '11px 10px 13px' }}>
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold leading-none" style={{ fontSize: 20, color: '#fff', textShadow: '0 0 14px rgba(255,255,255,0.2), 0 1px 5px rgba(0,0,0,0.95)', letterSpacing: '0.02em' }}>{char.name}</span>
                          {/* 轻量关注勾按钮 */}
                          <button
                            onClick={e => e.stopPropagation()}
                            style={{
                              flexShrink: 0,
                              width: 22,
                              height: 22,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: 'rgb(255,217,128)',
                              background: 'rgba(255,217,128,0.1)',
                              border: '1px solid rgba(255,217,128,0.35)',
                              borderRadius: '50%',
                              backdropFilter: 'blur(4px)',
                              cursor: 'pointer',
                              boxShadow: '0 0 6px rgba(255,217,128,0.15)',
                            }}
                          >✓</button>
                        </div>
                        <div className="flex items-end justify-between gap-1">
                          <div className="flex items-start gap-1" style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', fontFamily: 'Georgia, serif', lineHeight: 1.2, marginTop: 1, flexShrink: 0 }}>"</span>
                            <p className="font-mono" style={{ fontSize: '10.5px', color: 'rgba(200,200,200,0.55)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.55, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{char.lastMsg}</p>
                          </div>
                          {/* 评论图标 */}
                          <button
                            onClick={e => { e.stopPropagation(); setCommentChar(char.name); setCommentOpen(true) }}
                            style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          >
                            <ChatCenteredDots size={14} color="rgba(255,255,255,0.4)" />
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{MOCK_COMMENTS.length}</span>
                          </button>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* ─── Tab 切换闪烁遮罩 ─── */}
      <AnimatePresence>
        {tabFlashKey > 0 && (
          <motion.div
            key={tabFlashKey}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, zIndex: 25,
              background: '#030303',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── CommentDrawer ─── */}
      <CommentDrawer open={commentOpen} onClose={() => setCommentOpen(false)} charName={commentChar} />

      {/* ─── Bottom Nav ─── */}
      <nav className="relative z-30 glass-nav px-4 w-full shrink-0" style={{ paddingTop: 10, paddingBottom: 10 }}>
        <div className="flex justify-between items-center">
          {/* 首页 */}
          <button className="flex items-center justify-center flex-1 h-12 group text-white">
            <div className="relative flex items-center justify-center">
              <House size={26} weight="light" className="group-active:scale-90 transition-transform" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgb(255,217,128)', boxShadow: '0 0 5px rgb(255,217,128)' }} />
            </div>
          </button>
          {/* 消息 */}
          <button className="flex items-center justify-center flex-1 h-12 group hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <div className="relative flex items-center justify-center">
              <ChatCenteredText size={26} weight="light" className="group-active:scale-90 transition-transform" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2" style={{ backgroundColor: 'rgb(255,217,128)', borderColor: '#050505' }} />
            </div>
          </button>
          {/* 创作（中心，高亮） */}
          <button
            onClick={() => setCreationOpen(true)}
            className="flex items-center justify-center flex-1 h-12 group"
          >
            <div className="flex items-center justify-center rounded-2xl" style={{ width: 40, height: 40, background: 'rgba(255,217,128,0.12)', border: '1px solid rgba(255,217,128,0.3)' }}>
              <Sparkle size={22} weight="fill" color="rgb(255,217,128)" className="group-active:scale-90 transition-transform" />
            </div>
          </button>
          {/* 发现 */}
          <button className="flex items-center justify-center flex-1 h-12 group hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <MagnifyingGlass size={26} weight="light" className="group-active:scale-90 transition-transform" />
          </button>
          {/* 个人 */}
          <button onClick={() => setProfileOpen(true)} className="flex items-center justify-center flex-1 h-12 group hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <User size={26} weight="light" className="group-active:scale-90 transition-transform" />
          </button>
        </div>
        <div className="w-[120px] h-1.5 rounded-full mx-auto mt-1" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
      </nav>
    </motion.div>

    {/* ─── ScenePickerDrawer ─── */}
    <ScenePickerDrawer
      open={scenePickerOpen}
      onClose={() => setScenePickerOpen(false)}
      activeSceneId={activeSceneId}
      onSelect={(id) => { setActiveSceneId(id); setScenePickerOpen(false) }}
      onGoShop={() => { setScenePickerOpen(false); setProfileOpen(true) }}
    />

    {/* ─── ProfilePage ─── */}
    <ProfilePage
      open={profileOpen}
      onClose={() => setProfileOpen(false)}
      xp={xp}
      level={level}
      taskProgress={taskProgress}
      unlockedBadges={unlockedBadges}
      totalMsgs={totalMsgs}
      coinBalance={coinBalance}
    />

    {/* ─── LevelUpToast ─── */}
    <AnimatePresence>
      {levelUpToast && (
        <LevelUpToast
          key={`lvup-${levelUpToast.level}`}
          level={levelUpToast.level}
          onDone={() => setLevelUpToast(null)}
        />
      )}
    </AnimatePresence>

    {/* ─── TaskCompleteToast ─── */}
    <AnimatePresence>
      {taskCompleteToast && (
        <TaskCompleteToast
          key={`task-${taskCompleteToast.id}`}
          task={taskCompleteToast}
          onDone={() => setTaskCompleteToast(null)}
        />
      )}
    </AnimatePresence>

    {/* ─── SettingsDrawer ─── */}
    <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

    {/* ─── CreationCenter ─── */}
    <CreationCenter open={creationOpen} onClose={() => setCreationOpen(false)} onOpenAgentEditor={() => setAgentEditorOpen(true)} onOpenInspirationLab={() => setInspirationLabOpen(true)} />

    {/* ─── InspirationLab ─── */}
    <InspirationLab open={inspirationLabOpen} onClose={() => setInspirationLabOpen(false)} />

    {/* ─── AgentEditor ─── */}
    <AgentEditor open={agentEditorOpen} onClose={() => setAgentEditorOpen(false)} />

    {/* ─── CharacterCardFlip ─── */}
    <AnimatePresence>
      {cardChar && (
        <CharacterCardFlip
          char={cardChar}
          onCollect={() => {
            if (cardChar.isUnlock) {
              // 解锁流：推进推荐角色 + 隐藏提示
              setRecommendCharIdx(prev => Math.min(prev + 1, FOLLOW_CHARS.length - 1))
              setShowSwipeHint(false)
            }
            setCardChar(null)
          }}
          onClose={() => setCardChar(null)}
        />
      )}
    </AnimatePresence>
    </>
  )
}
