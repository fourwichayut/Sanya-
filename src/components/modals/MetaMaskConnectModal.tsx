import React, { useEffect, useRef, useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { getWalletErrorMessage } from '../../lib/metamask';
import { X, Wallet, ArrowRight, AlertCircle, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';

export const MetaMaskConnectModal: React.FC = () => {
  const {
    isMetaMaskModalOpen,
    setIsMetaMaskModalOpen,
    currentUser,
    connectMetaMask,
    unbindWallet,
    walletAddress,
    walletChainId,
    walletBalanceBNB,
    walletError,
    walletBalanceError,
    isMetaMaskAvailable,
    isWalletConnecting,
    isWalletRefreshing,
    isWalletConnected,
    refreshWallet,
  } = useContracts();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const connectionAttempt = useRef(0);

  useEffect(() => {
    connectionAttempt.current += 1;
    setConnectionError(null);
    if (!isMetaMaskModalOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => previousFocus?.focus();
  }, [isMetaMaskModalOpen]);

  if (!isMetaMaskModalOpen) return null;

  const onTestnet = walletChainId?.toLowerCase() === '0x61';
  const accountMatches = Boolean(
    walletAddress && currentUser.isWalletBound && walletAddress.toLowerCase() === currentUser.address.toLowerCase()
  );
  const displayedError = connectionError || walletError;
  const statusMessage = isWalletConnected
    ? 'เชื่อมต่อบัญชีนี้บน BNB Smart Chain Testnet แล้ว'
    : !isMetaMaskAvailable
      ? 'ยังไม่พบ MetaMask ในเบราว์เซอร์นี้'
      : !walletAddress
        ? 'ยังไม่ได้เชื่อมต่อบัญชี MetaMask'
        : !onTestnet
          ? 'กระเป๋าอยู่คนละเครือข่าย กดเชื่อมต่อเพื่อสลับไป BNB Testnet'
          : !accountMatches && currentUser.isWalletBound
            ? 'บัญชี MetaMask ที่เลือกไม่ตรงกับกระเป๋าที่ผูกไว้ กดเชื่อมต่อเพื่อผูกบัญชีที่เลือก'
            : 'พบบัญชี MetaMask กดเชื่อมต่อเพื่อผูกกับผู้ใช้คนนี้';

  const closeModal = () => {
    connectionAttempt.current += 1;
    setConnectionError(null);
    setIsMetaMaskModalOpen(false);
  };

  const handleConnect = async () => {
    setConnectionError(null);
    const attempt = ++connectionAttempt.current;
    try {
      const result = await connectMetaMask();
      if (!result.success && result.error && attempt === connectionAttempt.current) {
        setConnectionError(
          result.error === 'LOGIN_REQUIRED'
            ? 'กรุณาเข้าสู่ระบบก่อนเชื่อมกระเป๋า'
            : result.error === 'CONNECTION_CANCELLED'
              ? 'ยกเลิกการเชื่อมต่อแล้ว กรุณาลองอีกครั้ง'
              : getWalletErrorMessage(result.error)
        );
      }
    } catch {
      if (attempt === connectionAttempt.current) {
        setConnectionError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบ MetaMask แล้วลองอีกครั้ง');
      }
    }
  };

  const handleRefresh = async () => {
    setConnectionError(null);
    try {
      await refreshWallet();
    } catch {
      setConnectionError('อ่านสถานะกระเป๋าไม่สำเร็จ กรุณาตรวจสอบ MetaMask แล้วลองอีกครั้ง');
    }
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]');
    if (!elements?.length) return;
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeModal}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="metamask-modal-title"
        aria-describedby="metamask-modal-description"
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-7 space-y-5 text-zinc-900 relative"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/90 flex items-center justify-center p-0.5 shadow-2xs">
              <img src="./logo.png" alt="SANYA" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 id="metamask-modal-title" className="text-base font-extrabold text-zinc-900 tracking-tight">
                เชื่อมต่อกระเป๋า MetaMask
              </h2>
              <p className="text-[11px] text-zinc-500">BNB Smart Chain Testnet · Chain ID 97</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            aria-label="ปิดหน้าต่างเชื่อมต่อกระเป๋า"
            className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p id="metamask-modal-description" className="text-xs text-zinc-600 leading-relaxed">
          อนุญาตบัญชีใน MetaMask และยืนยันการเพิ่มหรือสลับเครือข่ายเป็น BNB Testnet ระบบจะผูกที่อยู่กระเป๋าที่คุณเลือกกับผู้ใช้คนนี้
        </p>

        <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-zinc-200" />
            <div className="min-w-0">
              <div className="font-bold text-xs text-zinc-900 truncate">{currentUser.name}</div>
              <div className="text-[11px] text-zinc-500 font-mono truncate">@{currentUser.username}</div>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
            {currentUser.isWalletBound ? 'ผูกที่อยู่แล้ว' : 'ยังไม่ได้ผูกกระเป๋า'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
          <div className="flex items-start gap-2 text-xs font-semibold" role="status" aria-live="polite">
            {isWalletConnected
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              : <Wallet className="w-4 h-4 text-zinc-500 shrink-0" />}
            <span>{statusMessage}</span>
          </div>
          <dl className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">เครือข่ายกระเป๋าปัจจุบัน</dt>
              <dd className="font-semibold text-right">
                {onTestnet ? 'BNB Testnet (97)' : walletChainId ? `Chain ID ${walletChainId}` : 'ยังไม่ทราบ'}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-zinc-500">บัญชีที่ MetaMask อนุญาต</dt>
              <dd className="font-mono break-all">
                {walletAddress ? (
                  <a
                    href={`https://testnet.bscscan.com/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-800 hover:underline inline-flex items-center gap-1"
                  >
                    <span className="break-all">{walletAddress}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : 'ยังไม่ได้เชื่อมต่อ'}
              </dd>
            </div>
            {currentUser.isWalletBound && !accountMatches && (
              <div className="space-y-1">
                <dt className="text-zinc-500">ที่อยู่ที่ผูกกับผู้ใช้ไว้</dt>
                <dd className="font-mono break-all">{currentUser.address}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-200">
              <dt className="text-zinc-500">ยอดคงเหลือบน BNB Testnet</dt>
              <dd className="font-mono font-bold">
                {isWalletRefreshing ? 'กำลังอ่านยอด...' : onTestnet && walletBalanceBNB !== null ? `${walletBalanceBNB} tBNB` : '—'}
              </dd>
            </div>
          </dl>
          {walletBalanceError && <p role="status" className="text-[11px] text-amber-800">{walletBalanceError}</p>}
          {isWalletConnected && <p className="text-[11px] text-zinc-500">ปิดหน้าต่างนี้ แล้วกดรายการที่ต้องการทำในแอปอีกครั้ง</p>}
        </div>

        {displayedError && (
          <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{displayedError}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleConnect}
            disabled={isWalletConnecting || isWalletRefreshing}
            className="w-full py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
          >
            {isWalletConnecting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /><span>กำลังรอการยืนยันจาก MetaMask...</span></>
            ) : (
              <><span className="text-base" aria-hidden="true">🦊</span><span>{isWalletConnected ? 'ยืนยันบัญชี MetaMask อีกครั้ง' : 'เชื่อมต่อ MetaMask และ BNB Testnet'}</span><ArrowRight className="w-4 h-4" /></>
            )}
          </button>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleRefresh}
              disabled={isWalletConnecting || isWalletRefreshing}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isWalletRefreshing ? 'animate-spin' : ''}`} />
              <span>รีเฟรชสถานะกระเป๋า</span>
            </button>
            {currentUser.isWalletBound && (
              <button
                onClick={unbindWallet}
                disabled={isWalletConnecting || isWalletRefreshing}
                className="text-xs text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
              >
                ยกเลิกการผูกกับผู้ใช้
              </button>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            การยกเลิกการผูกลบการเชื่อมโยงในแอป หากต้องการถอนสิทธิ์เว็บไซต์ ให้ตัดการเชื่อมต่อใน MetaMask ด้วย
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
          เครือข่าย บัญชี และยอด tBNB อ่านจากกระเป๋าจริง ส่วน Escrow ยอด USDT และประวัติธุรกรรมในแอปยังเป็นข้อมูลจำลอง ไม่มีการส่งธุรกรรมขึ้นเชน
        </div>
        <div className="pt-2 border-t border-zinc-100 flex justify-end">
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-600 hover:underline flex items-center gap-1"
          >
            ติดตั้ง MetaMask <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
