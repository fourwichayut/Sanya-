import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import {
  FileCheck2,
  ChevronDown,
  Clock,
  Code2,
  ListOrdered,
  Activity,
  Plus,
  Coins,
  Home,
  Briefcase,
  LogIn,
  LogOut,
  RotateCcw,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'my_contracts' | 'public_registry' | 'wizard' | 'activity' | 'login' | 'testnet_escrow';
  onChangeView: (view: 'home' | 'my_contracts' | 'public_registry' | 'wizard' | 'activity' | 'login' | 'testnet_escrow') => void;
  onOpenCreate: () => void;
  onOpenSolidity: () => void;
  onOpenExplorer: () => void;
  onOpenTokenDeploy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  onOpenCreate,
  onOpenSolidity,
  onOpenExplorer,
  onOpenTokenDeploy
}) => {
  const {
    personas,
    activePersona,
    isAuthenticated,
    logout,
    setActivePersonaId,
    faucet,
    resetAllData,
    timeOffsetHours,
    advanceTime,
    agreements,
    setIsMetaMaskModalOpen,
    isWalletConnected,
    isWalletConnecting,
    walletAddress,
    walletChainId,
    walletBalanceBNB
  } = useContracts();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const isWrongNetwork = Boolean(walletAddress && walletChainId && walletChainId !== '0x61');
  const walletStatusLabel = isWalletConnecting
    ? 'กำลังเชื่อมต่อ...'
    : isWalletConnected
      ? 'BNB Testnet'
      : isWrongNetwork
        ? 'สลับเป็น BNB Testnet'
        : 'เชื่อม MetaMask';

  // Count contracts for currently active persona
  const myContractsCount = agreements.filter(a =>
    a.clientId === activePersona.id ||
    a.contractorId === activePersona.id ||
    a.arbitratorId === activePersona.id ||
    (activePersona.address && a.contractorAddress?.toLowerCase() === activePersona.address.toLowerCase())
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-[#f5f5f7]/85 backdrop-blur-md border-b border-black/[0.05] shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Left: Brand & Modern Navigation Tabs */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            onClick={() => onChangeView('home')}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="./logo.png" alt="SANYA Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base tracking-tight text-zinc-900 leading-none">
                SANYA
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-white text-zinc-700 border border-black/[0.06] font-sans shadow-2xs">
                สัญญา
              </span>
            </div>
          </div>

          {/* Modern Slim Navigation Tabs */}
          {currentView !== 'login' && (
            <nav className="flex items-center space-x-1 ml-1 sm:ml-2">
              {/* 1. หน้าหลัก (Home) */}
              <button
                onClick={() => onChangeView('home')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${currentView === 'home'
                  ? 'text-zinc-900 bg-white font-bold shadow-2xs border border-black/[0.04]'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03]'
                  }`}
              >
                <span>หน้าหลัก</span>
              </button>

              {/* 2. สารบรรณสัญญา (Public Registry) */}
              <button
                onClick={() => onChangeView('public_registry')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${currentView === 'public_registry'
                  ? 'text-zinc-900 bg-white font-bold shadow-2xs border border-black/[0.04]'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03]'
                  }`}
              >
                <span>สารบรรณสัญญา</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${currentView === 'public_registry' ? 'bg-zinc-900 text-white' : 'bg-black/[0.06] text-zinc-700'
                  }`}>
                  {agreements.length}
                </span>
              </button>

              {/* 3. สัญญาของฉัน (My Contracts) */}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    onChangeView('my_contracts');
                  } else {
                    onChangeView('login');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${currentView === 'my_contracts'
                  ? 'text-zinc-900 bg-white font-bold shadow-2xs border border-black/[0.04]'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03]'
                  }`}
              >
                <span>สัญญาของฉัน</span>
                {isAuthenticated && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${currentView === 'my_contracts' ? 'bg-zinc-900 text-white' : 'bg-black/[0.06] text-zinc-700'
                    }`}>
                    {myContractsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onChangeView('activity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${currentView === 'activity'
                  ? 'text-zinc-900 bg-white font-bold shadow-2xs border border-black/[0.04]'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.03]'
                  }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Activity</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Section */}
        {currentView === 'login' ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onChangeView('home')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าหลัก</span>
            </button>
          </div>
        ) : !isAuthenticated ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onChangeView('login')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 sm:space-x-2">

            {/* Minimal Sandbox Ghost Button */}
            <div className="relative">
              <button
                onClick={() => setIsSandboxOpen(!isSandboxOpen)}
                className="flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                title="เครื่องมือทดสอบ Sandbox"
              >
                <span>🧪</span>
                <span className="hidden xl:inline text-[11px] text-zinc-500">ทดสอบ:</span>
                <span className="font-mono text-[11px] font-bold text-zinc-800">
                  {timeOffsetHours > 0 ? `+${timeOffsetHours}h` : 'ปกติ'}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {isSandboxOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-2.5 py-1 font-bold text-zinc-400 text-[10px] uppercase font-mono border-b border-zinc-100 mb-1">
                    🧪 เครื่องมือทดสอบ Sandbox
                  </div>

                  <div className="px-2.5 py-1 text-[11px] font-medium text-zinc-500">
                    เร่งเวลาตรวจรับ (Anti-Ghosting):
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    <button
                      onClick={() => { advanceTime(24); setIsSandboxOpen(false); }}
                      className="px-2 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-mono text-[11px] text-center border border-zinc-200 cursor-pointer"
                    >
                      +1 วัน (+24h)
                    </button>
                    <button
                      onClick={() => { advanceTime(120); setIsSandboxOpen(false); }}
                      className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[11px] text-center font-bold cursor-pointer"
                    >
                      +5 วัน (+120h)
                    </button>
                  </div>

                  <div className="border-t border-zinc-100 my-1 pt-1 space-y-0.5">
                    <button
                      onClick={() => { onChangeView('testnet_escrow'); setIsSandboxOpen(false); }}
                      className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl hover:bg-emerald-50 text-emerald-800 font-semibold cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>SANYA Escrow จริง · Testnet</span>
                    </button>

                    <button
                      onClick={() => { onOpenTokenDeploy(); setIsSandboxOpen(false); }}
                      className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl hover:bg-zinc-50 text-zinc-700 font-medium cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-zinc-500" />
                      <span>สร้าง SANYA Token บน Testnet</span>
                    </button>

                    <button
                      onClick={() => { onOpenSolidity(); setIsSandboxOpen(false); }}
                      className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl hover:bg-zinc-50 text-zinc-700 font-medium cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>ดู Solidity Smart Contract</span>
                    </button>

                    <button
                      onClick={() => { onOpenExplorer(); setIsSandboxOpen(false); }}
                      className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl hover:bg-zinc-50 text-zinc-700 font-medium cursor-pointer"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-zinc-500" />
                      <span>ดูประวัติธุรกรรมจำลอง</span>
                    </button>

                    <button
                      onClick={() => { resetAllData(); setIsSandboxOpen(false); }}
                      className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl hover:bg-red-50 text-red-600 font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                      <span>รีเซ็ตข้อมูลทดสอบทั้งหมด</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Create Agreement Primary CTA */}
            <button
              aria-label="ร่างสัญญาใหม่"
              onClick={onOpenCreate}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ร่างสัญญาใหม่</span>
            </button>

            {/* Live MetaMask and network status */}
            <button
              onClick={() => setIsMetaMaskModalOpen(true)}
              className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${isWalletConnected
                ? 'text-emerald-700 hover:bg-emerald-50'
                : isWrongNetwork
                  ? 'text-amber-700 hover:bg-amber-50'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              title={
                isWalletConnected
                  ? `MetaMask เชื่อม BNB Chain Testnet (Chain ID 97): ${walletAddress}${walletBalanceBNB !== null ? ` • ${walletBalanceBNB} tBNB` : ''}`
                  : isWrongNetwork
                    ? `เครือข่ายปัจจุบัน ${walletChainId} • คลิกเพื่อสลับเป็น BNB Chain Testnet`
                    : 'เชื่อม MetaMask บน BNB Chain Testnet กับบัญชีนี้'
              }
            >
              <span className="text-sm leading-none">🦊</span>
              <span className="hidden sm:inline text-[10px] font-semibold">
                {walletStatusLabel}
              </span>
              {isWalletConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* User Profile Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1.5 p-1 pl-1.5 pr-2 rounded-lg hover:bg-zinc-100 transition-colors text-left cursor-pointer"
              >
                <img
                  src={activePersona.avatar}
                  alt={activePersona.name}
                  className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-zinc-900 leading-none truncate max-w-[85px]">
                    {activePersona.name.split(' ')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {/* Redesigned Clean & High-Usability Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-2">

                  {/* Dropdown Header */}
                  <div className="px-2 py-1 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      สลับบัญชีทดสอบ (Persona Switcher)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Web2.5 Demo</span>
                  </div>

                  {/* List of Personas */}
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
                    {personas.map((persona) => {
                      const isSelected = persona.id === activePersona.id;
                      return (
                        <button
                          key={persona.id}
                          onClick={() => {
                            setActivePersonaId(persona.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${isSelected ? 'bg-zinc-900 text-white shadow-xs' : 'hover:bg-zinc-100 text-zinc-700'
                            }`}
                        >
                          <img
                            src={persona.avatar}
                            alt={persona.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-300 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold truncate text-xs">{persona.name}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${isSelected
                                ? 'bg-zinc-800 text-zinc-200'
                                : persona.isWalletBound
                                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                                  : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                {isSelected && isWalletConnected ? '🦊 เชื่อมต่ออยู่' : persona.isWalletBound ? 'มี Address ที่บันทึก' : 'ยังไม่มี Address'}
                              </span>
                            </div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {persona.roleTitle} (@{persona.username})
                            </div>
                            <div className={`text-[10px] font-mono ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                              ยอดจำลอง: ${persona.balanceUSDT.toLocaleString()} USDT
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Navigation Links */}
                  <div className="pt-2 border-t border-zinc-100 space-y-1">
                    <div className="px-2 py-0.5 text-[10px] font-bold text-zinc-400 uppercase font-mono">
                      เมนูหลัก (Navigation)
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onChangeView('my_contracts');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full p-2 rounded-xl hover:bg-zinc-100 text-zinc-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-zinc-700" />
                        <span>สัญญาของฉัน (My Contracts)</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                        {myContractsCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onChangeView('public_registry');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full p-2 rounded-xl hover:bg-zinc-100 text-zinc-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-zinc-700" />
                        <span>สารบรรณสัญญา (Public Registry)</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800">
                        {agreements.length}
                      </span>
                    </button>
                  </div>

                  {/* Redesigned Action Buttons */}
                  <div className="pt-2 border-t border-zinc-100 space-y-2">

                    {/* BUTTON GROUP 1: Faucet & Reset Database (Grid 2 Buttons) */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { faucet(1000); setIsDropdownOpen(false); }}
                        className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 active:scale-[0.98] text-zinc-800 flex items-center space-x-2 transition-all group cursor-pointer shadow-2xs"
                        title="เพิ่มยอด USDT จำลอง 1,000 ในบัญชีเดโม"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-zinc-400 transition-colors">
                          <Coins className="w-3.5 h-3.5 text-zinc-800" />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="font-bold text-[11px] leading-tight text-zinc-900">+1,000 USDT</div>
                          <div className="text-[9px] text-zinc-500">เติมยอดจำลอง</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { resetAllData(); setIsDropdownOpen(false); }}
                        className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 active:scale-[0.98] text-zinc-800 flex items-center space-x-2 transition-all group cursor-pointer shadow-2xs"
                        title="รีเซ็ตข้อมูลสู่ค่าตั้งต้น"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-zinc-400 transition-colors">
                          <RotateCcw className="w-3.5 h-3.5 text-zinc-600 group-hover:-rotate-90 transition-transform" />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="font-bold text-[11px] leading-tight text-zinc-900">รีเซ็ตข้อมูล</div>
                          <div className="text-[9px] text-zinc-500">คืนค่าตั้งต้น</div>
                        </div>
                      </button>
                    </div>

                    {/* BUTTON 2: MetaMask Binding Action Card Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMetaMaskModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[0.99] text-zinc-900 flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                          🦊
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-bold text-xs leading-tight text-zinc-900">
                            {isWalletConnected ? 'MetaMask • BNB Testnet' : walletStatusLabel}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">
                            {isWalletConnected ? walletAddress : 'เชื่อมกระเป๋าและตรวจเครือข่าย'}
                          </div>
                          {isWalletConnected && walletBalanceBNB !== null && (
                            <div className="text-[10px] font-mono text-zinc-700 mt-0.5">
                              {Number(walletBalanceBNB).toLocaleString(undefined, { maximumFractionDigits: 4 })} tBNB
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ml-1.5 font-bold ${isWalletConnected
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}>
                        {isWalletConnected ? 'Chain 97' : 'เชื่อมต่อ'}
                      </span>
                    </button>

                    {/* BUTTON 3: Switch to Login Page / Change Account */}
                    <button
                      type="button"
                      onClick={() => {
                        onChangeView('login');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[0.99] text-zinc-800 flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0 group-hover:bg-zinc-200 transition-colors">
                          <LogIn className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-xs leading-tight text-zinc-900">
                            ไปที่หน้าเข้าสู่ระบบ (Login Page)
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            ลงชื่อเข้าใช้ด้วยชื่อผู้ใช้ / สมัครใหม่
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* BUTTON 4: Sign Out Button */}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        onChangeView('login');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 active:scale-[0.99] text-red-600 hover:text-red-700 flex items-center justify-center space-x-2 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ (Sign Out)</span>
                    </button>

                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </header>
  );
};
