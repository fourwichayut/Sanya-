import React, { useState } from 'react';
import { SOLIDITY_CONTRACTS } from '../../data/solidityContracts';
import { X, Code2, Copy, Check, ShieldCheck } from 'lucide-react';

interface SolidityViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export const SolidityViewerModal: React.FC<SolidityViewerModalProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentContract = SOLIDITY_CONTRACTS.freelance;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContract.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-900">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-200 text-zinc-800">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center space-x-2">
                <span>Solidity Smart Contract Source Code</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700">
                  Solidity ^0.8.20
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                โค้ด Smart Contract สัญญาจ้างงานแบบแบ่งงวด (Freelance Milestone Escrow)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200 flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-zinc-900" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
            <div className="font-bold text-zinc-900 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-zinc-700" />
              <span>{currentContract.name} ({currentContract.title})</span>
            </div>
            <p className="text-zinc-600 mt-1">{currentContract.description}</p>
          </div>

          <div className="rounded-xl bg-zinc-900 text-zinc-100 p-4 font-mono text-xs leading-relaxed overflow-x-auto select-text shadow-inner">
            <pre className="text-[12px]">{currentContract.code}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>สอดคล้องกับมาตรฐาน EVM และ OpenZeppelin Escrow</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
