import Link from 'next/link';

const FEATURED_FEED = [
  {
    id: 1,
    title: 'Neon Nights in Neo-Tokyo',
    creator: '0xCypher',
    agent: 'Midjourney v6',
    stampId: '3fa72c91',
    timestamp: '2h ago',
    bg: 'bg-zinc-800',
  },
  {
    id: 2,
    title: 'The Last Oasis',
    creator: '0xDune',
    agent: 'Stable Diffusion XL',
    stampId: '7b1d4e82',
    timestamp: '5h ago',
    bg: 'bg-zinc-900',
  },
  {
    id: 3,
    title: 'Quantum Architecture',
    creator: '0xArch',
    agent: 'DALL-E 3',
    stampId: 'c4a91f3b',
    timestamp: '1d ago',
    bg: 'bg-zinc-800',
  },
  {
    id: 4,
    title: 'Ethereal Forest',
    creator: '0xNature',
    agent: 'Gemini Flash 2.0',
    stampId: '9d2f1a8c',
    timestamp: '1d ago',
    bg: 'bg-zinc-900',
  },
];

const TRENDING_CREATORS = [
  { name: '0xCypher', jobs: 142 },
  { name: '0xArch', jobs: 89 },
  { name: '0xDune', jobs: 56 },
];

export default function HomePage() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* ── Minimal Hero ──────────────────────────────────────────────── */}
        <div className="mb-20 max-w-2xl">
          <h1 className="text-4xl font-medium tracking-tight text-white mb-6">
            Provenance infrastructure for AI generation.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            STAMP secures creator attribution by linking AI generation directly to 
            on-chain escrows. Every image carries an invisible TrustMark and a 
            perceptual hash anchored on Monad.
          </p>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors"
            >
              Commission Art
            </Link>
            <Link 
              href="/verify" 
              className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
            >
              Verify Image
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── Main Feed ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-white">Recent Generations</h2>
              <div className="flex gap-4 text-xs text-zinc-500">
                <button className="text-white">All</button>
                <button className="hover:text-zinc-300 transition-colors">Verified</button>
                <button className="hover:text-zinc-300 transition-colors">External</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURED_FEED.map((item) => (
                <div key={item.id} className="group">
                  {/* Minimal Thumbnail */}
                  <div className={`w-full aspect-video rounded-lg ${item.bg} border border-zinc-800/50 mb-3 relative overflow-hidden`}>
                    {/* Subtle verified badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded border border-white/10 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider">{item.stampId}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex justify-between items-start px-1">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-200 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        by <span className="text-zinc-400">{item.creator}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 mb-1">{item.timestamp}</p>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase">{item.agent}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            
            {/* Network Status */}
            <div>
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Network Status</h3>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Registry</span>
                  <span className="text-white flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Monad Testnet
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Indexer</span>
                  <span className="text-zinc-300 font-mono text-xs">Envio HyperIndex</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Active Agents</span>
                  <span className="text-zinc-300">3 Nodes</span>
                </div>
              </div>
            </div>

            {/* Top Creators */}
            <div>
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Top Creators</h3>
              <div className="flex flex-col gap-3">
                {TRENDING_CREATORS.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-600 font-mono">0{i + 1}</span>
                      <span className="text-sm text-zinc-300 font-medium">{c.name}</span>
                    </div>
                    <span className="text-xs text-zinc-500">{c.jobs} jobs</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Verification Tiers</h3>
              <ul className="space-y-3">
                <li className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-white font-medium mt-0.5">A.</span>
                  <span>Adobe TrustMark (Invisible pixel-level watermark)</span>
                </li>
                <li className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-white font-medium mt-0.5">B.</span>
                  <span>Perceptual Hash (8-band similarity via Envio)</span>
                </li>
                <li className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-white font-medium mt-0.5">C.</span>
                  <span>External Signals (C2PA / XMP metadata signatures)</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
