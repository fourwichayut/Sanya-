import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { 
  FileCheck2, 
  ShieldCheck, 
  Lock, 
  User, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Sparkles,
  UserPlus,
  LogIn,
  CheckCircle2,
  Briefcase,
  Scale
} from 'lucide-react';
import graphicBars from '../../assets/graphics/graphic_bars.png';
import graphicTarget from '../../assets/graphics/graphic_target.png';

interface LoginPageProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome, onLoginSuccess }) => {
  const { login, registerUser, personas } = useContracts();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [identifier, setIdentifier] = useState('somchai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'CLIENT' | 'CONTRACTOR' | 'ARBITRATOR'>('CLIENT');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากรอกรหัสผ่าน');
      return;
    }

    const res = login(identifier, password);
    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(res.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  const handleQuickFill = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage(null);
    const res = login(username, pass);
    if (res.success) {
      onLoginSuccess();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regUsername.trim() || !regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    const res = registerUser({
      username: regUsername,
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole
    });

    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(res.message || 'การลงทะเบียนไม่สำเร็จ');
    }
  };

  return (
    <div className="relative w-full min-h-[92vh] flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden bg-[#f5f5f7] selection:bg-zinc-900 selection:text-white">
      
      {/* Background Graphic 1: Target rings top-right corner of webpage */}
      <img
        src={graphicTarget}
        alt="Decorative Target"
        className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 md:-top-32 md:-right-32 w-64 sm:w-80 md:w-96 lg:w-[440px] pointer-events-none select-none z-0 opacity-100 mix-blend-multiply"
      />

      {/* Background Graphic 2: Rounded bars bottom-left corner of webpage */}
      <img
        src={graphicBars}
        alt="Decorative Bars"
        className="absolute -bottom-10 -left-12 sm:-bottom-14 sm:-left-16 md:-bottom-20 md:-left-20 w-56 sm:w-72 md:w-88 lg:w-[400px] pointer-events-none select-none z-0 opacity-100 mix-blend-multiply"
      />

      {/* Main Login Card Container */}
      <div className="relative z-10 w-full max-w-md bg-white border-0 rounded-[28px] p-7 sm:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-6">
        
        {/* Top Controls: Back & Security Badge */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าหลัก</span>
          </button>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-700">
            <ShieldCheck className="w-3 h-3 text-zinc-900" />
            <span>Web2.5 Hybrid Auth</span>
          </div>
        </div>

        {/* Title & Branding */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200/90 p-2 flex items-center justify-center mx-auto shadow-sm">
            <img src="./logo.png" alt="SANYA Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
            {mode === 'login' ? 'เข้าสู่ระบบ SANYA Protocol' : 'สร้างบัญชีผู้ใช้ใหม่'}
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {mode === 'login' 
              ? 'ลงชื่อเข้าใช้งานด้วยชื่อผู้ใช้หรืออีเมลปกติ เพื่อจัดการสัญญาและระบบกำกับดูแล'
              : 'ลงทะเบียนเพื่อเริ่มต้นใช้งานสัญญาอัจฉริยะ ค้ำประกัน Escrow Vault'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            
            {/* Username / Email Field */}
            <div>
              <label className="font-semibold text-zinc-800 block mb-1.5">
                ชื่อผู้ใช้ หรือ อีเมล (Username / Email)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="เช่น somchai หรือ somchai.p@enterprise.co"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-zinc-800">รหัสผ่าน (Password)</label>
                <button
                  type="button"
                  onClick={() => alert('คำใบ้: บัญชีตัวอย่างทั้งหมดใช้รหัสผ่าน "password123"')}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 shadow-2xs transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 p-0.5 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center space-x-2 text-zinc-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-[11px]">จดจำการเข้าสู่ระบบ 30 วัน</span>
              </label>

              <span className="text-[10px] text-zinc-400 font-mono">
                SSL 256-bit Encrypted
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ (Sign In)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* 1-Click Demo Accounts Quick-Fill Section */}
            <div className="pt-4 border-t border-zinc-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  ทดสอบด่วนด้วยบัญชีตัวอย่าง (1-Click Fill)
                </span>
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('somchai', 'password123')}
                  className="p-2 rounded-xl bg-[#f5f5f7] hover:bg-zinc-200/70 text-left transition-all group"
                >
                  <div className="text-[10px] font-bold text-zinc-900 truncate flex items-center space-x-1">
                    <span>👔 ผู้ว่าจ้าง</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                    @somchai
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('kitti', 'password123')}
                  className="p-2 rounded-xl bg-[#f5f5f7] hover:bg-zinc-200/70 text-left transition-all group"
                >
                  <div className="text-[10px] font-bold text-zinc-900 truncate flex items-center space-x-1">
                    <span>🛠️ ผู้รับจ้าง</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                    @kitti
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('charlie', 'password123')}
                  className="p-2 rounded-xl bg-[#f5f5f7] hover:bg-zinc-200/70 text-left transition-all group"
                >
                  <div className="text-[10px] font-bold text-zinc-900 truncate flex items-center space-x-1">
                    <span>⚖️ คนกลาง</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                    @charlie
                  </div>
                </button>
              </div>
            </div>

            {/* Toggle to Register */}
            <div className="pt-3 text-center text-xs text-zinc-500">
              ยังไม่มีบัญชีผู้ใช้?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null); }}
                className="font-bold text-zinc-900 hover:underline"
              >
                ลงทะเบียนบัญชีใหม่
              </button>
            </div>

          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-zinc-800 block mb-1">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="เช่น anusorn_dev"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-800"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-800 block mb-1">
                ชื่อ-นามสกุล (Full Name)
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="เช่น นายอนุสรณ์ มั่นคง"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-800"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-800 block mb-1">
                อีเมล (Email)
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-800"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-800 block mb-1">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-800 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-800 block mb-1">
                บทบาทเริ่มต้นในระบบ
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRegRole('CLIENT')}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                    regRole === 'CLIENT'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  ผู้ว่าจ้าง
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('CONTRACTOR')}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                    regRole === 'CONTRACTOR'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  ผู้รับจ้าง
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('ARBITRATOR')}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                    regRole === 'ARBITRATOR'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  คนกลาง
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>สร้างบัญชีและเข้าสู่ระบบ</span>
            </button>

            <div className="pt-2 text-center text-xs text-zinc-500">
              มีบัญชีอยู่แล้ว?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className="font-bold text-zinc-900 hover:underline"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </form>
        )}

        {/* Web2.5 Architecture Note Card */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 leading-relaxed flex items-start space-x-2.5">
          <span className="text-base leading-none shrink-0">💡</span>
          <div>
            <strong className="text-zinc-900 font-bold block mb-0.5">
              แนวคิดสถาปัตยกรรม Web2.5
            </strong>
            เข้าใช้งานด้วยชื่อผู้ใช้ทั่วไป โดยระบบจะให้เชื่อมต่อกระเป๋า MetaMask เพื่อผูก Wallet Address กับ ID ของคุณเฉพาะตอนร่างสัญญาหรือโอนเงินจริงเท่านั้น
          </div>
        </div>

      </div>

    </div>
  );
};
