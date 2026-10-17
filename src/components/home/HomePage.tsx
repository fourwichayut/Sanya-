import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { 
  FileCheck2, 
  Lock, 
  Clock, 
  ArrowRight, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  XCircle,
  MessageSquareCheck,
  Cpu
} from 'lucide-react';
import graphicBars from '../../assets/graphics/graphic_bars.png';
import graphicTarget from '../../assets/graphics/graphic_target.png';
import { ScrollReveal } from '../common/ScrollReveal';

interface HomePageProps {
  onStartCreate: () => void;
  onViewAgreements: () => void;
  onSelectAgreement: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onStartCreate, 
  onViewAgreements,
  onSelectAgreement
}) => {
  const { agreements } = useContracts();

  const activeCount = agreements.filter(a => a.status !== 'COMPLETED').length;
  const totalEscrowLocked = agreements.reduce((sum, a) => sum + (a.totalEscrow - a.releasedEscrow), 0);

  const scrollToContent = () => {
    const el = document.getElementById('details-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white">
      
      {/* 1. HERO SECTION: DIRECT TECHNICAL EXPLANATION OF FRAUD PREVENTION */}
      <section className="relative w-full overflow-hidden min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        
        {/* Top-Right Graphic: Target Rings */}
        <img
          src={graphicTarget}
          alt="Target Graphic"
          className="absolute -top-12 -right-12 sm:-top-20 sm:-right-20 md:-top-24 md:-right-24 lg:-top-32 lg:-right-32 w-64 sm:w-80 md:w-96 lg:w-[460px] pointer-events-none select-none z-0 opacity-100 mix-blend-multiply"
        />

        {/* Bottom-Left Graphic: Rounded Bars */}
        <img
          src={graphicBars}
          alt="Bars Graphic"
          className="absolute -bottom-6 -left-8 sm:-bottom-10 sm:-left-12 md:-bottom-14 md:-left-16 w-52 sm:w-68 md:w-84 lg:w-[390px] pointer-events-none select-none z-0 opacity-100 mix-blend-multiply"
        />

        {/* Centered Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-7">
          
          {/* Tech Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] sm:text-xs font-mono font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Blockchain & Smart Contract Architecture</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 tracking-tight leading-none">
              SANYA — สัญญา
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-800 tracking-tight">
              เว็บไซต์ร่างสัญญาป้องกันการโกง
            </p>
          </div>

          {/* Direct Technical Explanation */}
          <p className="text-xs sm:text-sm md:text-base text-zinc-600 leading-relaxed max-w-3xl mx-auto px-2 font-normal">
            เปลี่ยนข้อตกลงและหลักฐานส่งมอบงานให้เป็น <strong className="text-zinc-900 font-semibold">Smart Contract บนเครือข่าย Blockchain</strong> ที่บันทึกถาวรและแก้ไขย้อนหลังไม่ได้ (Immutable) สัญญาทำงานอัตโนมัติตามโค้ด ป้องกันการบิดพริ้ว การดองตรวจรับ และสามารถตรวจสอบประวัติย้อนหลัง (Audit Trail) ได้อย่างโปร่งใสทุกขั้นตอน
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              onClick={onStartCreate}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2.5 group cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-white" />
              <span>+ ร่างสัญญาป้องกันการโกง</span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onViewAgreements}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-800 font-semibold text-xs sm:text-sm shadow-xs hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>สำรวจสารบรรณสัญญา ({agreements.length})</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* 4 Cards: Apple Bento Style, Crisp White Cards on #f5f5f7, Generous Spacing */}
          <div className="pt-8 sm:pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto items-stretch">
            
            <div className="h-full p-6 rounded-[22px] bg-white hover:bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between text-left space-y-4 group border-0">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Lock className="w-4 h-4 text-zinc-900" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#f5f5f7] text-zinc-600">
                  IMMUTABLE
                </span>
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight leading-snug">
                  บันทึกถาวร แก้ไขไม่ได้
                </h3>
                <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                  ข้อตกลงและประวัติทั้งหมดบันทึกลงบนเชน ไม่มีใครแอบแก้ได้ 100%
                </p>
              </div>
            </div>

            <div className="h-full p-6 rounded-[22px] bg-white hover:bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between text-left space-y-4 group border-0">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4 text-zinc-900" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#f5f5f7] text-zinc-600">
                  SMART CONTRACT
                </span>
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight leading-snug">
                  ทำงานอัตโนมัติตามโค้ด
                </h3>
                <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                  สัญญาบังคับใช้เงื่อนไขทันที ไร้ตัวกลางแทรกแซงหรือชะลอเงิน
                </p>
              </div>
            </div>

            <div className="h-full p-6 rounded-[22px] bg-white hover:bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between text-left space-y-4 group border-0">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-4 h-4 text-zinc-900" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#f5f5f7] text-zinc-600">
                  AUDIT TRAIL
                </span>
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight leading-snug">
                  ตรวจสอบย้อนหลัง 100%
                </h3>
                <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                  หลักฐานส่งงานเข้ารหัส Hash ยืนยันเวลาและไฟล์ส่งมอบจริง
                </p>
              </div>
            </div>

            <div className="h-full p-6 rounded-[22px] bg-white hover:bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between text-left space-y-4 group border-0">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] text-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4 text-zinc-900" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#f5f5f7] text-zinc-600">
                  ANTI-GHOSTING
                </span>
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight leading-snug">
                  ป้องกันดองงาน 5 วัน
                </h3>
                <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                  หากผู้ว่าจ้างเงียบหาย บล็อกเชนจะสั่งอนุมัติงานให้อัตโนมัติ
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Scroll Down Prompt */}
        <button
          onClick={scrollToContent}
          className="relative z-10 mt-8 text-zinc-400 hover:text-zinc-700 flex flex-col items-center space-y-1 transition-colors cursor-pointer group"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">เลื่อนลงเพื่อดูรายละเอียดกลไกป้องกันการโกง</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-zinc-400 group-hover:text-zinc-700" />
        </button>

      </section>

      {/* 2. MAIN CONTENT SECTIONS */}
      <div id="details-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        
        {/* 1. THE CONTRAST: สัญญากระดาษแบบเดิม vs ระบบป้องกันการโกงของ SANYA */}
        <section className="space-y-8">
          <ScrollReveal direction="up" delay={50} duration={800}>
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Fraud Prevention Mechanism
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                เราเอา Blockchain และ Smart Contract มาป้องกันการโกงอย่างไร?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
                เปรียบเทียบจุดอ่อนของสัญญาแบบเดิม กับกลไกการตรวจสอบย้อนหลังที่พิสูจน์ได้จริง
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* สัญญาแบบเดิม (The Old Vulnerabilities) */}
            <ScrollReveal className="h-full" direction="up" delay={100} duration={800}>
              <div className="h-full p-6 sm:p-8 rounded-[24px] bg-white border-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 space-y-5 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center space-x-2 text-xs font-bold text-zinc-600 uppercase tracking-wider font-mono mb-4 px-3 py-1 rounded-full bg-[#f5f5f7]">
                    <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>จุดอ่อนของสัญญาแบบเดิม (Traditional Weaknesses)</span>
                  </div>
                  
                  <ul className="space-y-4 text-xs sm:text-sm text-zinc-600">
                    <li className="flex items-start space-x-3">
                      <span className="text-zinc-400 font-mono font-bold">•</span>
                      <span><strong className="text-zinc-900">สัญญากระดาษแอบแก้ไขหรือบิดพริ้วได้:</strong> ไม่มีบันทึก Audit Trail สากล ต่างฝ่ายต่างอ้างสิ่งที่ตัวเองพูด</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-zinc-400 font-mono font-bold">•</span>
                      <span><strong className="text-zinc-900">อ้างว่าไม่ได้รับงานหรือส่งงานช้า:</strong> ไม่มีระบบ Cryptographic Timestamp พิสูจน์เวลาและไฟล์ที่ส่งมอบจริง</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-zinc-400 font-mono font-bold">•</span>
                      <span><strong className="text-zinc-900">ดองตรวจรับงานไม่มีกำหนด (Ghosting):</strong> ผู้ว่าจ้างเงียบหาย ดึงเวลาตรวจรับโดยไม่มีกลไกบังคับในตัวเอง</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-zinc-400 font-mono font-bold">•</span>
                      <span><strong className="text-zinc-900">สั่งแก้งานนอกสเปกเรื่อยๆ:</strong> ไม่มีระบบบันทึกประวัติการขอแก้งานเทียบกับขอบเขตเดิมอย่างเป็นรูปธรรม</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* ระบบป้องกันการโกงของ SANYA */}
            <ScrollReveal className="h-full" direction="up" delay={180} duration={800}>
              <div className="h-full p-6 sm:p-8 rounded-[24px] bg-white border-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 space-y-5 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center space-x-2 text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono mb-4 px-3 py-1 rounded-full bg-[#f5f5f7]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                    <span>ระบบป้องกันการโกงของ SANYA (Blockchain-Secured)</span>
                  </div>
                  
                  <ul className="space-y-4 text-xs sm:text-sm text-zinc-600">
                    <li className="flex items-start space-x-3">
                      <span className="text-zinc-900 bg-[#f5f5f7] rounded-full w-4 h-4 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong className="text-zinc-900">Immutable Ledger:</strong> สัญญาถูกบันทึกลงบล็อกเชน มี Transaction Hash ยืนยัน ไม่มีใครลบหรือแก้ข้อความย้อนหลังได้</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-zinc-900 bg-[#f5f5f7] rounded-full w-4 h-4 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong className="text-zinc-900">Proof of Delivery:</strong> ลิงก์และผลงานถูกคำนวณเป็น Hash บนเชน ยืนยันได้ 100% ว่าส่งงานเวลาใดและงานชิ้นใด</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-zinc-900 bg-[#f5f5f7] rounded-full w-4 h-4 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong className="text-zinc-900">On-Chain 5-Day Timer:</strong> นาฬิกาบล็อกเชนนับถอยหลัง 5 วัน หากผู้ว่าจ้างไม่ตอบสนอง ระบบจะอนุมัติการส่งมอบให้อัตโนมัติ</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-zinc-900 bg-[#f5f5f7] rounded-full w-4 h-4 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong className="text-zinc-900">Collaborative Feasibility Record:</strong> ทุกการขอแก้ไขงานต้องระบุหมวดหมู่ และเปิดให้ฟรีแลนซ์บันทึกคำชี้แจงอย่างโปร่งใส</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* 3. 4 หมัดเด็ดทางเทคโนโลยี (4 Core Pillars) - STRICTLY EQUAL HEIGHT */}
        <section className="space-y-8">
          <ScrollReveal direction="up" delay={50} duration={800}>
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Architectural Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                เทคโนโลยีที่ไม่ใช่การเก็งกำไร แต่คือเครื่องมือคุ้มครองคุณ
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            
            <ScrollReveal className="h-full" direction="up" delay={80} duration={800}>
              <div className="h-full p-6 sm:p-8 rounded-[24px] bg-white border-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] text-zinc-900 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-zinc-900" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    1. Smart Contract Architecture
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    ข้อตกลงและเงื่อนไขทั้งหมดถูกควบคุมด้วย Smart Contract บนบล็อกเชน ปราศจากการแทรกแซงจากคนกลาง ไม่สามารถบิดพริ้วหรือแก้ไขได้ตามอำเภอใจ
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 flex items-center text-[11px] font-mono font-medium text-zinc-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-zinc-900" />
                  <span>สัญญาดิจิทัลไร้ตัวกลางแทรกแซง</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="h-full" direction="up" delay={160} duration={800}>
              <div className="h-full p-6 sm:p-8 rounded-[24px] bg-white border-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] text-zinc-900 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-zinc-900" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    2. Anti-Ghosting Timer (5 วัน)
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    เวลาบนบล็อกเชนนับถอยหลังทันทีที่ส่งมอบงาน หากผู้ว่าจ้างไม่มาตรวจรับใน 5 วัน ระบบสั่งอนุมัติการส่งมอบให้อัตโนมัติโดยไม่ต้องรอใคร
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 flex items-center text-[11px] font-mono font-medium text-zinc-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-zinc-900" />
                  <span>ระบบจับเวลาตรวจรับอัตโนมัติ</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="h-full" direction="up" delay={240} duration={800}>
              <div className="h-full p-6 sm:p-8 rounded-[24px] bg-white border-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] text-zinc-900 flex items-center justify-center">
                    <MessageSquareCheck className="w-5 h-5 text-zinc-900" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    3. Collaborative Revision Loop
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    เมื่อมีการขอแก้งาน ฟรีแลนซ์สามารถ "ชี้แจงความเป็นไปได้ (Explain Feasibility)" และผู้ว่าจ้างสามารถ "ปรับปรุงขอบเขตใหม่" เพื่อร่วมมือกันอย่างมืออาชีพ
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 flex items-center text-[11px] font-mono font-medium text-zinc-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-zinc-900" />
                  <span>พื้นที่เจรจาขอบเขตงานอย่างยุติธรรม</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="h-full" direction="up" delay={320} duration={800}>
              <div className="h-full p-6 sm:p-8 rounded-[24px] bg-white border-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] text-zinc-900 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-zinc-900" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    4. Web 2.5 Zero-Friction UX
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    ใช้งานง่ายด้วยอีเมลองค์กร ไม่ต้องมี Seed Phrase หรือความรู้คริปโต และเชื่อมต่อ Wallet เฉพาะเมื่อต้องลงนามธุรกรรมสำคัญ
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 flex items-center text-[11px] font-mono font-medium text-zinc-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-zinc-900" />
                  <span>เข้าถึงได้ทุกคน ไม่ต้องเป็นเซียนคริปโต</span>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* 4. WORKFLOW: 4 ขั้นตอนกระชับ */}
        <ScrollReveal direction="up" delay={50} duration={800}>
          <section className="p-8 sm:p-12 rounded-[24px] bg-zinc-900 text-white border-0 shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                Simple & Direct
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                4 ขั้นตอนการทำงานที่ชัดเจน
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
                เริ่มต้นสร้างสัญญาป้องกันการโกงบน Smart Contract ภายในไม่กี่นาที
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 items-stretch">
              
              <div className="h-full p-5 rounded-2xl bg-zinc-800/80 border-0 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    1
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">ร่างสัญญา & กำหนดงวดงาน</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    ระบุขอบเขตงาน กำหนดวันส่งมอบ (Due Date) และเกณฑ์การตรวจรับ
                  </p>
                </div>
              </div>

              <div className="h-full p-5 rounded-2xl bg-zinc-800/80 border-0 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    2
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">ลงนามเปิดใช้งานสัญญา</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    คู่สัญญาลงนามดิจิทัล เปิดใช้งาน Smart Contract ข้อตกลงมีผลบังคับทันที
                  </p>
                </div>
              </div>

              <div className="h-full p-5 rounded-2xl bg-zinc-800/80 border-0 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    3
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">ส่งมอบงาน & ตรวจรับ</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    แนบหลักฐานผลงาน ระบบประทับเวลา Hash และเริ่มนับเวลาตรวจรับ 5 วัน
                  </p>
                </div>
              </div>

              <div className="h-full p-5 rounded-2xl bg-zinc-800/80 border-0 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    4
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">อนุมัติสำเร็จตามเงื่อนไข</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    เมื่อตรวจรับผ่านหรือครบ 5 วัน สัญญาจะยืนยันความสำเร็จของงวดงานทันที
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2 text-center">
              <button
                onClick={onStartCreate}
                className="px-8 py-4 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-all shadow-md inline-flex items-center space-x-2 cursor-pointer"
              >
                <span>เริ่มต้นร่างสัญญาแรกของคุณ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </ScrollReveal>

        {/* 5. สารบรรณสัญญาในระบบ (Active Agreements Preview) */}
        <section className="space-y-6">
          <ScrollReveal direction="up" delay={50} duration={800}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-black/[0.05] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Live Agreements
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                  สารบรรณสัญญาในระบบ (Active Agreements)
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                  สำรวจข้อตกลงและหลักฐานที่ทำงานอยู่จริงบน Smart Contract
                </p>
              </div>

              <button
                onClick={onViewAgreements}
                className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center space-x-1 cursor-pointer self-start sm:self-auto group transition-colors"
              >
                <span>ดูสารบรรณสัญญาทั้งหมด ({agreements.length})</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
            {agreements.map((agreement, idx) => {
              const completedCount = agreement.milestones.filter(m => m.status === 'APPROVED').length;
              const progress = Math.round((completedCount / agreement.milestones.length) * 100);

              return (
                <ScrollReveal key={agreement.id} className="h-full" direction="up" delay={100 * (idx + 1)} duration={800}>
                  <div
                    onClick={() => onSelectAgreement(agreement.id)}
                    className="h-full p-6 sm:p-7 rounded-[24px] bg-white border-0 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-zinc-900">
                          {agreement.id}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-zinc-700">
                          {agreement.status}
                        </span>
                      </div>

                      <h4 className="font-black text-base sm:text-lg text-zinc-900 group-hover:text-zinc-700 transition-colors line-clamp-1">
                        {agreement.title}
                      </h4>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                        {agreement.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-2 pt-2 border-t border-black/[0.04]">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-500">งบ Escrow: ${agreement.totalEscrow.toLocaleString()} USDT</span>
                          <span className="font-bold text-zinc-900">{completedCount}/{agreement.milestones.length} งวด ({progress}% ปลดล็อก)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#f5f5f7] overflow-hidden">
                          <div
                            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs text-zinc-500">
                        <span className="truncate font-medium">ผู้รับจ้าง: {agreement.contractorName}</span>
                        <span className="font-bold text-zinc-900 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                          <span>เปิดห้องสัญญา</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

      </div>

    </div>
  );
};
