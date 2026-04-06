import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import {
  getUserUsage, redeemCode, getTopupInfo, calculateAmount,
  createEpayOrder, createStripeOrder, createCreemOrder,
  createCryptoOrder, getCryptoOrderStatus, getTopupHistory,
  getAffCode, transferAffQuota, getAffEarnings,
  Q, quotaToDollar,
} from '../api';
import { useCurrency } from '../context/SiteContext';
import CountUp from '../components/bits/CountUp';
import toast from 'react-hot-toast';

export default function Topup() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { site } = useSite();
  const { symbol, rate } = useCurrency();

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
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('usdt');

  // Creem
  const [selectedCreemProduct, setSelectedCreemProduct] = useState(null);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Invitation / Aff
  const [affLink, setAffLink] = useState('');
  const [affEarnings, setAffEarnings] = useState([]);
  const [showAffEarnings, setShowAffEarnings] = useState(false);
  const [affEarningsLoading, setAffEarningsLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);

  const enableTopup = site?.enable_topup && topupInfo;
  const topupConfig = site?.topup_config;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usageRes, topupRes, affRes] = await Promise.all([
        getUserUsage(),
        site?.enable_topup ? getTopupInfo().catch(() => null) : Promise.resolve(null),
        getAffCode().catch(() => null),
      ]);
      if (usageRes.data.success) setUsage(usageRes.data.data);
      if (topupRes?.data?.data) setTopupInfo(topupRes.data.data);
      if (affRes?.data?.success && affRes.data.data) {
        setAffLink(`${window.location.origin}/register?aff=${affRes.data.data}`);
      }
    } catch (e) { /* interceptor */ }
    setLoading(false);
  }, [site?.enable_topup]);

  useEffect(() => { loadData(); }, [loadData]);

  const quota = usage?.quota ?? user?.quota ?? 0;
  const usedQuota = usage?.used_quota ?? user?.used_quota ?? 0;
  const requestCount = usage?.request_count ?? user?.request_count ?? 0;
  const balanceDollars = quota / Q * rate;

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

  // Determine if a payment method is Stripe-based
  const isStripePayment = (method) =>
    ['stripe', 'alipay', 'wxpay'].includes(method) && !method.startsWith('epay_');

  // Pay handler for EPay and Stripe methods
  const handlePay = async (method) => {
    const payAmount = parseInt(amount);
    if (!payAmount || payAmount <= 0) {
      toast.error(t('topup.enterAmount'));
      return;
    }
    setPaymentLoading(true);
    setPayingMethod(method);
    try {
      const returnUrl = window.location.origin + '/topup';
      const data = { amount: payAmount, payment_method: method, return_url: returnUrl };

      if (isStripePayment(method)) {
        // Stripe payment
        const res = await createStripeOrder(data);
        if (res.data.message === 'success' && res.data.data?.pay_link) {
          window.open(res.data.data.pay_link, '_blank');
        } else if (res.data.message !== 'success') {
          const errMsg = typeof res.data.data === 'string' ? res.data.data : res.data.message;
          toast.error(errMsg || t('common.requestFailed'));
        }
      } else {
        // EPay payment - submit via hidden form (same as main site)
        const res = await createEpayOrder(data);
        if (res.data.message === 'success') {
          const params = res.data.data; // EPay form params
          const url = res.data.url;     // EPay gateway URL
          if (url && params) {
            const form = document.createElement('form');
            form.action = url;
            form.method = 'POST';
            // Open in new tab (except Safari)
            const isSafari = navigator.userAgent.indexOf('Safari') > -1
              && navigator.userAgent.indexOf('Chrome') < 1;
            if (!isSafari) {
              form.target = '_blank';
            }
            for (const key in params) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = params[key];
              form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
          }
        } else {
          const errMsg = typeof res.data.data === 'string' ? res.data.data : res.data.message;
          toast.error(errMsg || t('common.requestFailed'));
        }
      }
    } catch (e) { /* interceptor */ }
    setPaymentLoading(false);
    setPayingMethod('');
  };

  // Creem pay - product based
  const handleCreemPay = async (product) => {
    setPaymentLoading(true);
    setPayingMethod('creem');
    try {
      const res = await createCreemOrder({
        product_id: product.productId,
        payment_method: 'creem',
      });
      if (res.data.message === 'success' && res.data.data?.checkout_url) {
        window.open(res.data.data.checkout_url, '_blank');
      } else if (res.data.message !== 'success') {
        const errMsg = typeof res.data.data === 'string' ? res.data.data : res.data.message;
        toast.error(errMsg || t('common.requestFailed'));
      }
    } catch (e) { /* interceptor */ }
    setPaymentLoading(false);
    setPayingMethod('');
  };

  // Crypto pay - needs chain + token
  const handleCryptoPay = async () => {
    const payAmountVal = parseInt(amount);
    if (!payAmountVal || payAmountVal <= 0) {
      toast.error(t('topup.enterAmount'));
      return;
    }
    if (!selectedChain) {
      toast.error(t('topup.selectChain'));
      return;
    }
    if (!selectedToken) {
      toast.error(t('topup.selectToken'));
      return;
    }
    setPaymentLoading(true);
    setPayingMethod('crypto');
    try {
      const res = await createCryptoOrder({
        amount: payAmountVal,
        chain: selectedChain,
        token: selectedToken,
      });
      if (res.data.message === 'success' && res.data.data) {
        setCryptoOrder(res.data.data);
        startCryptoPolling(res.data.data.trade_no);
      } else if (res.data.message !== 'success') {
        const errMsg = typeof res.data.data === 'string' ? res.data.data : res.data.message;
        toast.error(errMsg || t('common.requestFailed'));
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

  // Available crypto chains from config
  const cryptoWallets = topupInfo?.crypto_wallets || {};
  const availableChains = useMemo(() => {
    const chains = [];
    if (cryptoWallets.tron) chains.push({ key: 'tron', label: 'TRON (TRC20)' });
    if (cryptoWallets.eth) chains.push({ key: 'eth', label: 'Ethereum (ERC20)' });
    if (cryptoWallets.bsc) chains.push({ key: 'bsc', label: 'BSC (BEP20)' });
    return chains;
  }, [cryptoWallets.tron, cryptoWallets.eth, cryptoWallets.bsc]);

  // Set default chain when available
  useEffect(() => {
    if (availableChains.length > 0 && !selectedChain) {
      setSelectedChain(availableChains[0].key);
    }
  }, [availableChains, selectedChain]);

  // Parse Creem products
  const creemProducts = useMemo(() => {
    if (!topupInfo?.creem_products) return [];
    try {
      const parsed = typeof topupInfo.creem_products === 'string'
        ? JSON.parse(topupInfo.creem_products)
        : topupInfo.creem_products;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [topupInfo?.creem_products]);

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

  // Aff earnings
  const loadAffEarnings = async () => {
    setAffEarningsLoading(true);
    try {
      const res = await getAffEarnings({ page: 1, page_size: 20 });
      if (res.data.success && res.data.data) {
        setAffEarnings(res.data.data);
      }
    } catch (e) { /* interceptor */ }
    setAffEarningsLoading(false);
  };

  const handleCopyAffLink = () => {
    if (!affLink) return;
    navigator.clipboard.writeText(affLink).then(() => {
      toast.success(t('topup.copied') || 'Copied!');
    }).catch(() => {
      toast.error('Copy failed');
    });
  };

  const handleTransfer = async () => {
    const val = parseInt(transferAmount);
    if (!val || val <= 0) {
      toast.error(t('topup.enterAmount'));
      return;
    }
    setTransferring(true);
    try {
      const res = await transferAffQuota({ quota: val });
      if (res.data.success) {
        toast.success(res.data.message || t('topup.transferSuccess') || 'Transfer successful');
        setTransferAmount('');
        await Promise.all([loadData(), refreshUser()]);
      }
    } catch (e) { /* interceptor */ }
    setTransferring(false);
  };

  const presetAmounts = topupInfo?.amount_options || [1, 5, 10, 20, 50, 100];
  const minTopup = topupInfo?.min_topup || 1;
  const payMethods = topupInfo?.pay_methods || [];
  const enableOnline = topupInfo?.enable_online_topup;
  const enableStripe = topupInfo?.enable_stripe_topup;
  const enableCreem = topupInfo?.enable_creem_topup;
  const enableCrypto = topupInfo?.enable_crypto_topup;
  const hasAnyPayment = enableOnline || enableStripe || enableCreem || enableCrypto;

  // Filter pay methods: EPay methods + Stripe-based methods go in the main payment buttons
  // Creem and Crypto get their own sections
  const epayAndStripeMethods = payMethods.filter(
    (m) => m.type !== 'creem' && m.type !== 'crypto'
  );

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
        <h1 className="text-2xl font-heading font-bold text-page mb-1">{t('topup.title')}</h1>
        <p className="text-sm text-page-secondary">{t('topup.subtitle')}</p>
      </div>

      {/* Balance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.balance')}</p>
          <div className="text-3xl font-bold text-page">
            {symbol}<CountUp from={0} to={balanceDollars} duration={1.5} />
          </div>
          <p className="text-xs text-page-muted mt-1">{t('dashboard.quotaUnits', { count: quota.toLocaleString() })}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.used')}</p>
          <div className="text-3xl font-bold text-page">
            {symbol}<CountUp from={0} to={usedQuota / Q * rate} duration={1.5} />
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.totalRequests')}</p>
          <div className="text-3xl font-bold text-page">
            <CountUp from={0} to={requestCount} duration={1.5} />
          </div>
        </div>
      </div>

      {/* Online Topup - EPay & Stripe */}
      {site?.enable_topup && (enableOnline || enableStripe) && epayAndStripeMethods.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-page">{t('topup.onlineTopup')}</h2>
            <button
              onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
              className="text-sm text-page-secondary hover:text-page transition-colors"
            >
              {showHistory ? t('topup.hideHistory') : t('topup.viewHistory')}
            </button>
          </div>

          {/* Preset Amounts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-page-label mb-3">{t('topup.selectAmount')}</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presetAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => handlePreset(val)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    selectedPreset === val
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : 'glass-sm text-page-label hover:text-page hover:bg-page-surface-hover'
                  }`}
                >
                  {symbol}{Math.round(val * rate)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-page-label mb-2">{t('topup.customAmount')}</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={amount ? Math.round(amount * rate) : ''}
                onChange={(e) => {
                  const cnyVal = e.target.value;
                  const usdVal = cnyVal ? Math.max(1, Math.ceil(cnyVal / rate)) : '';
                  setAmount(usdVal);
                  setSelectedPreset(null);
                }}
                onBlur={(e) => {
                  const cnyVal = e.target.value;
                  const usdVal = cnyVal ? Math.max(1, Math.ceil(cnyVal / rate)) : '';
                  calcAmount(usdVal);
                }}
                min={Math.round(minTopup * rate)}
                placeholder={t('topup.amountPlaceholder', { min: Math.round(minTopup * rate) })}
                className="input flex-1"
              />
            </div>
            {amountLoading ? (
              <p className="text-xs text-page-muted mt-2">{t('topup.calculating')}</p>
            ) : payAmount ? (
              <p className="text-xs text-page-secondary mt-2">
                {t('topup.payAmountLabel')}: <span className="text-page-success font-medium">¥{payAmount}</span>
              </p>
            ) : null}
          </div>

          {/* Payment Methods (EPay + Stripe) */}
          <div>
            <label className="block text-sm font-medium text-page-label mb-3">{t('topup.paymentMethod')}</label>
            <div className="flex flex-wrap gap-2">
              {epayAndStripeMethods.map((method) => {
                const isCurrentLoading = paymentLoading && payingMethod === method.type;
                return (
                  <button
                    key={method.type}
                    onClick={() => handlePay(method.type)}
                    disabled={paymentLoading || !amount}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium glass-sm text-page-label hover:text-page hover:bg-page-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {isCurrentLoading ? t('topup.processing') : method.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Creem Products Section */}
      {site?.enable_topup && enableCreem && creemProducts.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-page mb-4">{t('topup.creemPayment') || 'Creem Payment'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creemProducts.map((product) => (
              <div
                key={product.productId}
                className={`glass-sm rounded-xl p-4 cursor-pointer transition-all ${
                  selectedCreemProduct?.productId === product.productId
                    ? 'ring-2 ring-brand-500 bg-brand-500/10'
                    : 'hover:bg-page-surface'
                }`}
                onClick={() => setSelectedCreemProduct(product)}
              >
                <h3 className="text-sm font-semibold text-page mb-1">{product.name}</h3>
                <p className="text-xl font-bold text-page-success mb-1">
                  ${product.price} <span className="text-xs text-page-muted font-normal">{product.currency || 'USD'}</span>
                </p>
                {product.quota && (
                  <p className="text-xs text-page-secondary">{t('topup.quotaIncluded') || `${product.quota} quota`}</p>
                )}
              </div>
            ))}
          </div>
          {selectedCreemProduct && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleCreemPay(selectedCreemProduct)}
                disabled={paymentLoading}
                className="btn-primary px-6"
              >
                {paymentLoading && payingMethod === 'creem'
                  ? t('topup.processing')
                  : `${t('topup.payNow') || 'Pay'} $${selectedCreemProduct.price}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Crypto Payment Section */}
      {site?.enable_topup && enableCrypto && availableChains.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-page mb-4">{t('topup.cryptoPayment')}</h2>

          {/* Amount input for crypto */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-page-label mb-2">{t('topup.amount')}</label>
            <input
              type="number"
              value={amount ? Math.round(amount * rate) : ''}
              onChange={(e) => {
                const cnyVal = e.target.value;
                const usdVal = cnyVal ? Math.max(1, Math.ceil(cnyVal / rate)) : '';
                setAmount(usdVal);
                setSelectedPreset(null);
              }}
              min={Math.round(minTopup * rate)}
              placeholder={t('topup.amountPlaceholder', { min: Math.round(minTopup * rate) })}
              className="input w-full"
            />
          </div>

          {/* Chain Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-page-label mb-2">{t('topup.chain')}</label>
            <div className="flex flex-wrap gap-2">
              {availableChains.map((chain) => (
                <button
                  key={chain.key}
                  onClick={() => setSelectedChain(chain.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedChain === chain.key
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : 'glass-sm text-page-label hover:text-page hover:bg-page-surface-hover'
                  }`}
                >
                  {chain.label}
                </button>
              ))}
            </div>
          </div>

          {/* Token Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-page-label mb-2">{t('topup.token') || 'Token'}</label>
            <div className="flex gap-2">
              {['usdt', 'usdc'].map((token) => (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedToken === token
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : 'glass-sm text-page-label hover:text-page hover:bg-page-surface-hover'
                  }`}
                >
                  {token.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCryptoPay}
            disabled={paymentLoading || !amount}
            className="btn-primary w-full"
          >
            {paymentLoading && payingMethod === 'crypto'
              ? t('topup.processing')
              : `${t('topup.payWith') || 'Pay with'} ${selectedToken.toUpperCase()} (${availableChains.find(c => c.key === selectedChain)?.label || selectedChain})`}
          </button>
        </div>
      )}

      {/* Crypto Payment Modal */}
      {cryptoOrder && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCryptoOrder(null)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-page mb-4">{t('topup.cryptoPayment')}</h3>
            <div className="space-y-4">
              <div className="glass-sm rounded-xl p-4">
                <p className="text-xs text-page-secondary mb-1">{t('topup.walletAddress')}</p>
                <p className="text-sm text-page font-mono break-all">{cryptoOrder.wallet}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-sm rounded-xl p-3">
                  <p className="text-xs text-page-secondary mb-1">{t('topup.amount')}</p>
                  <p className="text-sm text-page font-medium">{cryptoOrder.amount} {cryptoOrder.token}</p>
                </div>
                <div className="glass-sm rounded-xl p-3">
                  <p className="text-xs text-page-secondary mb-1">{t('topup.chain')}</p>
                  <p className="text-sm text-page font-medium">{cryptoOrder.chain}</p>
                </div>
              </div>
              {cryptoPolling && (
                <div className="flex items-center gap-2 text-sm text-page-secondary">
                  <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  {t('topup.waitingPayment')}
                </div>
              )}
              <button
                onClick={() => { setCryptoOrder(null); setCryptoPolling(false); }}
                className="w-full py-2 rounded-xl text-sm glass-sm text-page-secondary hover:text-page transition-colors"
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
          <h2 className="text-lg font-semibold text-page mb-4">{t('topup.history')}</h2>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-page-muted text-center py-8">{t('topup.noHistory')}</p>
          ) : (
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between glass-sm rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm text-page">{symbol}{(Number(item.amount) * rate).toFixed(2)}</p>
                    <p className="text-xs text-page-muted">
                      {new Date(item.create_time * 1000).toLocaleString()} · {item.payment_method || t('topup.redeemCode')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'success'
                      ? 'bg-green-500/10 text-page-success'
                      : item.status === 'pending'
                        ? 'bg-yellow-500/10 text-page-warning'
                        : 'bg-red-500/10 text-page-danger'
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
        <h2 className="text-lg font-semibold text-page mb-4">{t('topup.redeemTitle')}</h2>
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

      {/* Invitation / Affiliate */}
      {affLink && (
        <div className="glass rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-page mb-1">{t('topup.inviteTitle') || '邀请返佣'}</h2>
          <p className="text-sm text-page-secondary mb-5">{t('topup.inviteSubtitle') || '邀请好友注册，持续获得消费佣金'}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-sm rounded-xl p-4 text-center">
              <p className="text-xs text-page-secondary mb-1">{t('topup.affAvailable') || '可用佣金'}</p>
              <p className="text-xl font-bold text-page">
                {symbol}{((user?.aff_quota || 0) / Q * rate).toFixed(2)}
              </p>
            </div>
            <div className="glass-sm rounded-xl p-4 text-center">
              <p className="text-xs text-page-secondary mb-1">{t('topup.affTotal') || '累计佣金'}</p>
              <p className="text-xl font-bold text-page">
                {symbol}{((user?.aff_history_quota || 0) / Q * rate).toFixed(2)}
              </p>
            </div>
            <div className="glass-sm rounded-xl p-4 text-center">
              <p className="text-xs text-page-secondary mb-1">{t('topup.affCount') || '邀请人数'}</p>
              <p className="text-xl font-bold text-page">{user?.aff_count || 0}</p>
            </div>
          </div>

          {/* Invitation Link */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-page-label mb-2">{t('topup.inviteLink') || '邀请链接'}</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={affLink}
                className="input flex-1 text-sm"
              />
              <button
                onClick={handleCopyAffLink}
                className="btn-primary whitespace-nowrap text-sm px-4"
              >
                {t('topup.copy') || '复制'}
              </button>
            </div>
          </div>

          {/* Transfer to balance */}
          {(user?.aff_quota || 0) > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-page-label mb-2">{t('topup.transferToBalance') || '划转到余额'}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder={t('topup.transferPlaceholder') || '输入划转额度 (quota)'}
                  className="input flex-1 text-sm"
                  min={1}
                />
                <button
                  onClick={handleTransfer}
                  disabled={transferring}
                  className="btn-primary whitespace-nowrap text-sm px-4"
                >
                  {transferring ? (t('topup.processing') || '处理中...') : (t('topup.transfer') || '划转')}
                </button>
              </div>
            </div>
          )}

          {/* Earnings Details */}
          <div>
            <button
              onClick={() => { setShowAffEarnings(!showAffEarnings); if (!showAffEarnings) loadAffEarnings(); }}
              className="text-sm text-page-secondary hover:text-page transition-colors"
            >
              {showAffEarnings ? (t('topup.hideEarnings') || '收起明细') : (t('topup.viewEarnings') || '查看收入明细')}
            </button>
            {showAffEarnings && (
              <div className="mt-3">
                {affEarningsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                ) : affEarnings.length === 0 ? (
                  <p className="text-sm text-page-muted text-center py-6">{t('topup.noEarnings') || '暂无收入记录'}</p>
                ) : (
                  <div className="space-y-2">
                    {affEarnings.map((item, i) => (
                      <div key={i} className="flex items-center justify-between glass-sm rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm text-page">{item.model_name}</p>
                          <p className="text-xs text-page-muted">
                            {new Date(item.created_time * 1000).toLocaleString()} · {(item.commission_rate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <span className="text-sm font-medium text-page-success">
                          +{symbol}{(item.commission_quota / Q * rate).toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
