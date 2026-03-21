import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import {
  getUserUsage, redeemCode, getTopupInfo, calculateAmount,
  createEpayOrder, createStripeOrder, createCreemOrder,
  createCryptoOrder, getCryptoOrderStatus, getTopupHistory,
  Q, quotaToDollar,
} from '../api';
import SpotlightCard from '../components/bits/SpotlightCard';
import CountUp from '../components/bits/CountUp';
import toast from 'react-hot-toast';

export default function Topup() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { site } = useSite();

  const [usage, setUsage] = useState(null);
  const [topupInfo, setTopupInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redeem code
  const [redeemInput, setRedeemInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Online topup
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [payAmount, setPayAmount] = useState(null);
  const [amountLoading, setAmountLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [payingMethod, setPayingMethod] = useState('');

  // Crypto modal
  const [cryptoOrder, setCryptoOrder] = useState(null);
  const [cryptoPolling, setCryptoPolling] = useState(false);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const enableTopup = site?.enable_topup && topupInfo;
  const topupConfig = site?.topup_config;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usageRes, topupRes] = await Promise.all([
        getUserUsage(),
        site?.enable_topup ? getTopupInfo().catch(() => null) : Promise.resolve(null),
      ]);
      if (usageRes.data.success) setUsage(usageRes.data.data);
      if (topupRes?.data?.data) setTopupInfo(topupRes.data.data);
    } catch (e) { /* interceptor */ }
    setLoading(false);
  }, [site?.enable_topup]);

  useEffect(() => { loadData(); }, [loadData]);

  const quota = usage?.quota ?? user?.quota ?? 0;
  const usedQuota = usage?.used_quota ?? user?.used_quota ?? 0;
  const requestCount = usage?.request_count ?? user?.request_count ?? 0;
  const balanceDollars = quota / Q;

  // Redeem
  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;
    setRedeeming(true);
    try {
      const res = await redeemCode(redeemInput.trim());
      if (res.data.success) {
        toast.success(t('topup.redeemSuccess'));
        setRedeemInput('');
        await Promise.all([loadData(), refreshUser()]);
      }
    } catch (err) { /* interceptor */ }
    setRedeeming(false);
  };

  // Calculate amount
  const calcAmount = async (val) => {
    if (!val || val <= 0) { setPayAmount(null); return; }
    setAmountLoading(true);
    try {
      const res = await calculateAmount({ amount: parseInt(val) });
      if (res.data.message === 'success') {
        setPayAmount(res.data.data);
      }
    } catch (e) { /* interceptor */ }
    setAmountLoading(false);
  };

  // Select preset
  const handlePreset = (val) => {
    setSelectedPreset(val);
    setAmount(val);
    calcAmount(val);
  };

  // Pay
  const handlePay = async (method) => {
    const payAmount = parseInt(amount);
    if (!payAmount || payAmount <= 0) {
      toast.error(t('topup.enterAmount'));
      return;
    }
    setPaymentLoading(true);
    setPayingMethod(method);
    try {
      let res;
      const data = { amount: payAmount, payment_method: method };

      if (method === 'stripe' || method === 'alipay' || method === 'wxpay') {
        res = await createStripeOrder(data);
      } else if (method === 'creem') {
        res = await createCreemOrder(data);
      } else {
        // EPay methods
        res = await createEpayOrder(data);
      }

      if (res.data.message === 'success') {
        // EPay returns url+data, Stripe returns url
        if (res.data.url) {
          window.location.href = res.data.url;
        } else if (res.data.data?.checkout_url) {
          window.location.href = res.data.data.checkout_url;
        }
      }
    } catch (e) { /* interceptor */ }
    setPaymentLoading(false);
    setPayingMethod('');
  };

  // Crypto pay
  const handleCryptoPay = async () => {
    const payAmount = parseInt(amount);
    if (!payAmount || payAmount <= 0) {
      toast.error(t('topup.enterAmount'));
      return;
    }
    setPaymentLoading(true);
    setPayingMethod('crypto');
    try {
      const res = await createCryptoOrder({ amount: payAmount });
      if (res.data.message === 'success' && res.data.data) {
        setCryptoOrder(res.data.data);
        startCryptoPolling(res.data.data.trade_no);
      }
    } catch (e) { /* interceptor */ }
    setPaymentLoading(false);
    setPayingMethod('');
  };

  const startCryptoPolling = (tradeNo) => {
    setCryptoPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await getCryptoOrderStatus(tradeNo);
        if (res.data.data?.status === 'success') {
          clearInterval(interval);
          setCryptoPolling(false);
          setCryptoOrder(null);
          toast.success(t('topup.paymentSuccess'));
          await Promise.all([loadData(), refreshUser()]);
        } else if (res.data.data?.status === 'expired') {
          clearInterval(interval);
          setCryptoPolling(false);
          toast.error(t('topup.orderExpired'));
        }
      } catch (e) {
        clearInterval(interval);
        setCryptoPolling(false);
      }
    }, 5000);
    // Auto-stop after expiry time
    const expiryMs = (topupInfo?.crypto_expiry_minutes || 30) * 60 * 1000;
    setTimeout(() => { clearInterval(interval); setCryptoPolling(false); }, expiryMs);
  };

  // History
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await getTopupHistory({ page: 1, page_size: 20 });
      if (res.data.data?.items) {
        setHistory(res.data.data.items);
      }
    } catch (e) { /* interceptor */ }
    setHistoryLoading(false);
  };

  const presetAmounts = topupInfo?.amount_options || [1, 5, 10, 20, 50, 100];
  const minTopup = topupInfo?.min_topup || 1;
  const payMethods = topupInfo?.pay_methods || [];
  const enableOnline = topupInfo?.enable_online_topup;
  const enableStripe = topupInfo?.enable_stripe_topup;
  const enableCreem = topupInfo?.enable_creem_topup;
  const enableCrypto = topupInfo?.enable_crypto_topup;
  const hasAnyPayment = enableOnline || enableStripe || enableCreem || enableCrypto;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-white mb-1">{t('topup.title')}</h1>
        <p className="text-sm text-neutral-400">{t('topup.subtitle')}</p>
      </div>

      {/* Balance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60 !p-6" spotlightColor="rgba(34,197,94,0.15)">
          <p className="text-sm text-neutral-400 mb-2">{t('dashboard.balance')}</p>
          <div className="text-3xl font-bold text-white">
            $<CountUp from={0} to={balanceDollars} duration={1.5} />
          </div>
          <p className="text-xs text-neutral-500 mt-1">{t('dashboard.quotaUnits', { count: quota.toLocaleString() })}</p>
        </SpotlightCard>

        <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60 !p-6" spotlightColor="rgba(129,140,248,0.15)">
          <p className="text-sm text-neutral-400 mb-2">{t('dashboard.used')}</p>
          <div className="text-3xl font-bold text-white">
            $<CountUp from={0} to={usedQuota / Q} duration={1.5} />
          </div>
        </SpotlightCard>

        <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60 !p-6" spotlightColor="rgba(244,114,182,0.15)">
          <p className="text-sm text-neutral-400 mb-2">{t('dashboard.totalRequests')}</p>
          <div className="text-3xl font-bold text-white">
            <CountUp from={0} to={requestCount} duration={1.5} />
          </div>
        </SpotlightCard>
      </div>

      {/* Online Topup */}
      {site?.enable_topup && hasAnyPayment && (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{t('topup.onlineTopup')}</h2>
            <button
              onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              {showHistory ? t('topup.hideHistory') : t('topup.viewHistory')}
            </button>
          </div>

          {/* Preset Amounts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-300 mb-3">{t('topup.selectAmount')}</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presetAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => handlePreset(val)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    selectedPreset === val
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : 'glass-sm text-neutral-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-300 mb-2">{t('topup.customAmount')}</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedPreset(null);
                }}
                onBlur={(e) => calcAmount(e.target.value)}
                min={minTopup}
                placeholder={t('topup.amountPlaceholder', { min: minTopup })}
                className="input flex-1"
              />
            </div>
            {amountLoading ? (
              <p className="text-xs text-neutral-500 mt-2">{t('topup.calculating')}</p>
            ) : payAmount ? (
              <p className="text-xs text-neutral-400 mt-2">
                {t('topup.payAmountLabel')}: <span className="text-green-400 font-medium">${payAmount}</span>
              </p>
            ) : null}
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">{t('topup.paymentMethod')}</label>
            <div className="flex flex-wrap gap-2">
              {payMethods.map((method) => {
                const isCurrentLoading = paymentLoading && payingMethod === method.type;
                return (
                  <button
                    key={method.type}
                    onClick={() => handlePay(method.type)}
                    disabled={paymentLoading || !amount}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium glass-sm text-neutral-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {isCurrentLoading ? t('topup.processing') : method.name}
                  </button>
                );
              })}
              {enableCrypto && (
                <button
                  onClick={handleCryptoPay}
                  disabled={paymentLoading || !amount}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium glass-sm text-neutral-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {paymentLoading && payingMethod === 'crypto' ? t('topup.processing') : 'USDT/USDC'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crypto Payment Modal */}
      {cryptoOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCryptoOrder(null)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">{t('topup.cryptoPayment')}</h3>
            <div className="space-y-4">
              <div className="glass-sm rounded-xl p-4">
                <p className="text-xs text-neutral-400 mb-1">{t('topup.walletAddress')}</p>
                <p className="text-sm text-white font-mono break-all">{cryptoOrder.wallet_address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-sm rounded-xl p-3">
                  <p className="text-xs text-neutral-400 mb-1">{t('topup.amount')}</p>
                  <p className="text-sm text-white font-medium">{cryptoOrder.amount} {cryptoOrder.currency}</p>
                </div>
                <div className="glass-sm rounded-xl p-3">
                  <p className="text-xs text-neutral-400 mb-1">{t('topup.chain')}</p>
                  <p className="text-sm text-white font-medium">{cryptoOrder.chain}</p>
                </div>
              </div>
              {cryptoPolling && (
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  {t('topup.waitingPayment')}
                </div>
              )}
              <button
                onClick={() => { setCryptoOrder(null); setCryptoPolling(false); }}
                className="w-full py-2 rounded-xl text-sm glass-sm text-neutral-400 hover:text-white transition-colors"
              >
                {t('topup.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {showHistory && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('topup.history')}</h2>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">{t('topup.noHistory')}</p>
          ) : (
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between glass-sm rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm text-white">${item.amount}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(item.create_time * 1000).toLocaleString()} · {item.payment_method || t('topup.redeemCode')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'success'
                      ? 'bg-green-500/10 text-green-400'
                      : item.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.status === 'success' ? t('topup.statusSuccess') : item.status === 'pending' ? t('topup.statusPending') : t('topup.statusFailed')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Redeem Code */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t('topup.redeemTitle')}</h2>
        <form onSubmit={handleRedeem} className="flex gap-3">
          <input
            type="text"
            value={redeemInput}
            onChange={(e) => setRedeemInput(e.target.value)}
            className="input flex-1"
            placeholder={t('topup.enterRedeemCode')}
          />
          <button type="submit" disabled={redeeming} className="btn-primary whitespace-nowrap">
            {redeeming ? t('topup.redeeming') : t('topup.redeem')}
          </button>
        </form>
      </div>
    </div>
  );
}
