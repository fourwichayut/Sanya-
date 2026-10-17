import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { X, Activity, Search, CheckCircle2 } from 'lucide-react';

interface TransactionExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionExplorerModal: React.FC<TransactionExplorerModalProps> = ({ isOpen, onClose }) => {
  const { transactions } = useContracts();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTxs = transactions.filter(tx => 
    tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.fromName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="transaction-explorer-title" aria-describedby="transaction-explorer-description" className="bg-white border border-zinc-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-900">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-200 text-zinc-800">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 id="transaction-explorer-title" className="text-sm font-bold text-zinc-900 flex items-center space-x-2">
                <span>ประวัติธุรกรรมจำลอง</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700">
                  Sandbox / Demo
                </span>
              </h2>
              <p id="transaction-explorer-description" className="text-xs text-zinc-500">
                รายการในแอปยังไม่ได้ส่งขึ้น BNB Testnet ({transactions.length} รายการ)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="ปิดประวัติธุรกรรมจำลอง"
            className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-zinc-200 bg-white">
          <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
            Tx Hash, Block, Gas และ Contract Address เป็นข้อมูลจำลอง ใช้ตรวจสอบบน BscScan ไม่ได้ การเชื่อม MetaMask และยอด tBNB เป็นสถานะกระเป๋าจริง
          </p>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              aria-label="ค้นหาประวัติธุรกรรมจำลอง"
              placeholder="ค้นหาด้วย Tx Hash, Action, หรือ Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 font-mono"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 font-mono text-xs">
          {filteredTxs.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              ไม่พบธุรกรรมที่ค้นหา
            </div>
          ) : (
            filteredTxs.map((tx, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors space-y-1.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-zinc-900 font-bold">Demo Block #{tx.blockNumber}</span>
                    <span className="font-sans text-zinc-800 font-semibold select-all">
                      {tx.action}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    {tx.amount && (
                      <span className="text-zinc-900 font-bold bg-zinc-200 px-2 py-0.5 rounded">
                        {tx.amount}
                      </span>
                    )}
                    <span className="text-zinc-500">{tx.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-zinc-500 pt-1 border-t border-zinc-200">
                  <div className="truncate">
                    <span>From: </span>
                    <span className="text-zinc-800 font-sans font-medium">{tx.fromName}</span>{' '}
                    <span>({tx.from})</span>
                  </div>
                  <div className="truncate text-right">
                    <span>Contract: </span>
                    <span className="text-zinc-800">{tx.to}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                  <span className="truncate">Tx: {tx.txHash}</span>
                  <span className="shrink-0 text-zinc-700 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Gas: {tx.gasUsed}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
