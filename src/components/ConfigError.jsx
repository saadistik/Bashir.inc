import { AlertCircle } from 'lucide-react'

export const ConfigError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nature-emerald via-nature-forest to-nature-teal p-4">
      <div className="glass-panel max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Configuration Error
        </h1>
        
        <p className="text-white/70 mb-6">
          The application is missing required environment variables. Please configure the following in your hosting platform:
        </p>
        
        <div className="bg-black/20 rounded-lg p-4 mb-6 text-left">
          <code className="text-nature-mint text-sm">
            VITE_SUPABASE_URL=your_supabase_url<br />
            VITE_SUPABASE_ANON_KEY=your_anon_key
          </code>
        </div>
        
        <div className="text-sm text-white/60">
          <p className="mb-2">For Vercel deployment:</p>
          <ol className="text-left space-y-1 ml-4">
            <li>1. Go to Project Settings → Environment Variables</li>
            <li>2. Add both variables</li>
            <li>3. Redeploy your application</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
