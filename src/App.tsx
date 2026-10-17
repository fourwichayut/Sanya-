import React, { lazy, Suspense, useState } from 'react';
import { ContractProvider } from './context/ContractContext';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './components/home/HomePage';
import { ActivityPage } from './components/home/ActivityPage';
import { CreateAgreementWizard } from './components/wizard/CreateAgreementWizard';
import { FreelanceModule } from './components/modules/FreelanceModule';
import { LoginPage } from './components/auth/LoginPage';
import { SolidityViewerModal } from './components/modals/SolidityViewerModal';
import { TransactionExplorerModal } from './components/modals/TransactionExplorerModal';
import { MetaMaskConnectModal } from './components/modals/MetaMaskConnectModal';
import { TokenDeployModal } from './components/modals/TokenDeployModal';
import { Toast } from './components/common/Toast';

const TestnetEscrowPage = lazy(() => import('./components/home/TestnetEscrowPage').then(module => ({ default: module.TestnetEscrowPage })));

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'my_contracts' | 'public_registry' | 'wizard' | 'activity' | 'login' | 'testnet_escrow'>('home');
  const [selectedAgreementIdForDetail, setSelectedAgreementIdForDetail] = useState<string | null>(null);
  const [isSolidityModalOpen, setIsSolidityModalOpen] = useState(false);
  const [isExplorerModalOpen, setIsExplorerModalOpen] = useState(false);
  const [isTokenDeployModalOpen, setIsTokenDeployModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-zinc-900 flex flex-col font-['IBM_Plex_Sans_Thai',sans-serif] selection:bg-zinc-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onChangeView={(view) => {
          if (view === 'my_contracts') {
            setSelectedAgreementIdForDetail(null);
          }
          setCurrentView(view);
        }}
        onOpenCreate={() => setCurrentView('wizard')}
        onOpenSolidity={() => setIsSolidityModalOpen(true)}
        onOpenExplorer={() => setIsExplorerModalOpen(true)}
        onOpenTokenDeploy={() => setIsTokenDeployModalOpen(true)}
      />

      {/* Main Content Area: Full Width for Home and Login, Centered for Wizard / Supervision */}
      <main className="flex-1 w-full">

        {currentView === 'testnet_escrow' && (
          <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-500">กำลังโหลดหน้า Testnet Escrow…</div>}>
            <TestnetEscrowPage onBack={() => setCurrentView('home')} />
          </Suspense>
        )}

        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <HomePage
            onStartCreate={() => setCurrentView('wizard')}
            onViewAgreements={() => setCurrentView('public_registry')}
            onSelectAgreement={(agreementId) => {
              setSelectedAgreementIdForDetail(agreementId);
              setCurrentView('my_contracts');
            }}
          />
        )}

        {/* VIEW 2: STEP-BY-STEP AGREEMENT WIZARD */}
        {currentView === 'wizard' && (
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <CreateAgreementWizard
              onCancel={() => setCurrentView('home')}
              onCompleted={(newAgreementId) => {
                setSelectedAgreementIdForDetail(newAgreementId || null);
                setCurrentView('activity');
              }}
            />
          </div>
        )}

        {currentView === 'activity' && (
          <ActivityPage onStartCreate={() => setCurrentView('wizard')} />
        )}

        {/* VIEW 3: CONTRACT WORKSPACE (MY CONTRACTS & PUBLIC REGISTRY) */}
        {(currentView === 'my_contracts' || currentView === 'public_registry') && (
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <FreelanceModule
              initialSubView={currentView}
              initialDetailAgreementId={selectedAgreementIdForDetail}
              onSelectDetailAgreementId={(id) => setSelectedAgreementIdForDetail(id)}
              onChangeSubView={(newSubView) => {
                if (newSubView === 'my_contracts') {
                  setSelectedAgreementIdForDetail(null);
                }
                setCurrentView(newSubView);
              }}
              onOpenCreate={() => setCurrentView('wizard')}
              onOpenSolidity={() => setIsSolidityModalOpen(true)}
              onOpenLogin={() => setCurrentView('login')}
            />
          </div>
        )}

        {/* VIEW 4: LOGIN PAGE */}
        {currentView === 'login' && (
          <LoginPage
            onBackToHome={() => setCurrentView('home')}
            onLoginSuccess={() => {
              setSelectedAgreementIdForDetail(null);
              setCurrentView('my_contracts');
            }}
          />
        )}

      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400 bg-white">
        Smart Agreement Protocol • ระบบร่างสัญญาอัจฉริยะ ค้ำประกัน Escrow และกำกับดูแลข้อตกลงคู่สัญญา
      </footer>

      {/* Global Modals */}
      <SolidityViewerModal
        isOpen={isSolidityModalOpen}
        onClose={() => setIsSolidityModalOpen(false)}
      />

      <TransactionExplorerModal
        isOpen={isExplorerModalOpen}
        onClose={() => setIsExplorerModalOpen(false)}
      />

      {isTokenDeployModalOpen && (
        <TokenDeployModal onClose={() => setIsTokenDeployModalOpen(false)} />
      )}

      {/* Web2.5 MetaMask On-Demand Binding Modal */}
      <MetaMaskConnectModal />

      {/* Toast Notification */}
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ContractProvider>
      <AppContent />
    </ContractProvider>
  );
};

export default App;
