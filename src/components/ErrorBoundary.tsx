/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Mediador Cabinda ErrorBoundary Caught]', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 font-display">
                {this.props.fallbackTitle || 'Recuperação Automática de Ecrã'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ocorreu uma pequena instabilidade de carregamento nesta aba. Os seus dados e pedidos permanecem 100% seguros e preservados.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-100 p-3 rounded-xl text-left overflow-x-auto max-h-24 text-[10px] font-mono text-slate-600 border border-slate-200">
                {this.state.error.message || 'Erro inesperado de renderização'}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Aba</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600 font-bold pt-2 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ponte Logística Luanda ⇄ Cabinda Ativa</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
