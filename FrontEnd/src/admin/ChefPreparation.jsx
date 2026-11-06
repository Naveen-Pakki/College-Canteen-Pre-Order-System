import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useOrders } from '../context/OrderContext';
import { useTime } from '../context/TimeContext';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Flame,
  PackageCheck,
  RefreshCw,
  UtensilsCrossed,
  Package,
  Layers,
  QrCode,
  ShieldCheck,
  X,
  Check,
  User
} from 'lucide-react';

export const ChefPreparation = () => {
  const { orders, menuItems, updateOrderStatus } = useOrders();
  const { formattedTime } = useTime();
  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Group orders into the three specified sections:
  // 1. Orders to Prepare: Show confirmed orders that have not started preparation
  // 2. Currently Preparing: Show orders currently being prepared
  // 3. Ready for Pickup: Show completed food preparation orders waiting for collection
  const toPrepareOrders = orders.filter(o => o.status === 'CONFIRMED');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY FOR PICKUP');

  // Aggregated demand summary (portions required for kitchen cooking)
  const kitchenDemandSummary = useMemo(() => {
    const demandMap = {};
    
    // Count items needing cooking across queued and preparing orders
    [...toPrepareOrders, ...preparingOrders].forEach(ord => {
      ord.items?.forEach(it => {
        if (!demandMap[it.id]) {
          const menuItem = menuItems.find(m => m.id === it.id);
          demandMap[it.id] = {
            id: it.id,
            name: it.name,
            category: menuItem?.category || 'Canteen Special',
            orderedCount: 0,
            remainingStock: menuItem?.stockQuantity ?? 50
          };
        }
        demandMap[it.id].orderedCount += it.quantity;
      });
    });

    return Object.values(demandMap);
  }, [toPrepareOrders, preparingOrders, menuItems]);

  const handleCompleteOrder = (orderId) => {
    updateOrderStatus(orderId, 'COMPLETED');
    setVerificationSuccess(true);
    setTimeout(() => {
      setVerificationSuccess(false);
      setVerifyingOrder(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 pb-24">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin/dashboard" className="hover:text-blue-600">Admin</Link>
          <span>/</span>
          <span className="text-slate-800">Chef &amp; Kitchen Preparation Desk</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ChefHat className="w-7 h-7 text-blue-600" />
              <span>Admin Chef / Food Preparation Page</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live kitchen cooking workflow: Orders to Prepare → Currently Preparing → Ready for Pickup → Completed handover.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              Orders to Prepare: <strong>{toPrepareOrders.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              Currently Preparing: <strong>{preparingOrders.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              Ready for Pickup: <strong>{readyOrders.length}</strong>
            </span>
          </div>
        </div>

        {/* Kitchen Demand & Inventory Tracker */}
        {kitchenDemandSummary.length > 0 && (
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-soft-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-amber-400">
                  Kitchen Demand Tracker (Portions Required for Confirmed Orders)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Synchronized live with counter reservations</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {kitchenDemandSummary.map((item) => (
                <div key={item.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-1">
                  <span className="font-bold text-xs text-white block truncate">{item.name}</span>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">To Cook:</span>
                    <span className="text-base font-black text-amber-300 font-mono">
                      {item.orderedCount} portions
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[10px] text-slate-400 border-t border-slate-700 pt-1">
                    <span>Remaining Stock:</span>
                    <span className="font-mono font-bold text-slate-300">{item.remainingStock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 Preparation Columns: Orders to Prepare | Currently Preparing | Ready for Pickup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Section 1: Orders to Prepare (Confirmed orders that have not started preparation) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <div>
                  <h3 className="font-extrabold text-amber-950 text-sm uppercase tracking-wide">
                    Orders to Prepare
                  </h3>
                  <p className="text-[10px] text-amber-700 font-medium">Confirmed orders not yet started</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                {toPrepareOrders.length}
              </span>
            </div>

            <div className="p-4 space-y-3.5 max-h-[620px] overflow-y-auto">
              {toPrepareOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No confirmed orders currently waiting to start cooking.
                </div>
              ) : (
                toPrepareOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs hover:border-amber-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-slate-900 block">{ord.id}</span>
                        <span className="text-[11px] font-bold text-slate-700">{ord.userName}</span>
                        <span className="text-[10px] font-mono text-blue-700 block">{ord.userRegistrationId} ({ord.userRole})</span>
                      </div>
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                        {ord.tokenNumber}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Dishes to Cook:
                      </span>
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-bold text-slate-800">
                          <span>{item.name}</span>
                          <span className="text-blue-600">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Order: <strong className="text-slate-800">{ord.id}</strong></span>
                      <span className="font-semibold text-emerald-700">Paid ₹{ord.totalAmount?.toFixed(2)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateOrderStatus(ord.id, 'PREPARING')}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Start Cooking →</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Currently Preparing (Orders currently being prepared in kitchen) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 bg-blue-50/70 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-blue-600 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-blue-950 text-sm uppercase tracking-wide">
                    Currently Preparing
                  </h3>
                  <p className="text-[10px] text-blue-700 font-medium">In kitchen woks and ovens</p>
                </div>
              </div>
              <span className="text-xs font-black text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                {preparingOrders.length}
              </span>
            </div>

            <div className="p-4 space-y-3.5 max-h-[620px] overflow-y-auto">
              {preparingOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No orders currently cooking on the stoves.
                </div>
              ) : (
                preparingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs hover:border-blue-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-slate-900 block">{ord.id}</span>
                        <span className="text-[11px] font-bold text-slate-700">{ord.userName}</span>
                        <span className="text-[10px] font-mono text-blue-700 block">{ord.userRegistrationId} ({ord.userRole})</span>
                      </div>
                      <span className="text-xs font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">
                        {ord.tokenNumber}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Dishes on Stove:
                      </span>
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-bold text-slate-800">
                          <span>{item.name}</span>
                          <span className="text-blue-600">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Order: <strong className="text-slate-800">{ord.id}</strong></span>
                      <span className="font-semibold text-emerald-700">Paid ₹{ord.totalAmount?.toFixed(2)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateOrderStatus(ord.id, 'READY FOR PICKUP')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Mark Ready for Pickup →</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Ready for Pickup (Completed food preparation orders waiting for collection) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 bg-emerald-50/70 border-b border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-emerald-950 text-sm uppercase tracking-wide">
                    Ready for Pickup
                  </h3>
                  <p className="text-[10px] text-emerald-700 font-medium">Boxed &amp; waiting at counter</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                {readyOrders.length}
              </span>
            </div>

            <div className="p-4 space-y-3.5 max-h-[620px] overflow-y-auto">
              {readyOrders.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No orders currently waiting at the pickup counter.
                </div>
              ) : (
                readyOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-slate-900 block">{ord.id}</span>
                        <span className="text-[11px] font-bold text-slate-800">{ord.userName}</span>
                        <span className="text-[10px] font-mono text-blue-700 block">{ord.userRegistrationId} ({ord.userRole})</span>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                        {ord.tokenNumber}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs pt-1 border-t border-emerald-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Boxed Dishes to Hand Over:
                      </span>
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-bold text-slate-800">
                          <span>{item.name}</span>
                          <span className="text-emerald-700">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <span>Ready for Handover</span>
                      <span className="font-bold text-emerald-700">Paid ₹{ord.totalAmount?.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setVerifyingOrder(ord)}
                        className="py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Inspect Ticket</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'COMPLETED')}
                        className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Handed Over ✓</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Digital Ticket Verification Modal */}
        {verifyingOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight">Counter Ticket Verification</h3>
                    <p className="text-[11px] text-slate-400">Pragati University Canteen Chef Desk</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyingOrder(null)}
                  className="p-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Presented Token Number</span>
                  <div className="text-4xl font-black text-blue-900 tracking-tight my-1">
                    {verifyingOrder.tokenNumber}
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-white/80 px-3 py-0.5 rounded-full border border-blue-100 inline-block">
                    Collect anytime once Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">College Member</span>
                    <span className="font-bold text-slate-900 text-xs block">{verifyingOrder.userName}</span>
                    <span className="font-mono text-blue-700 font-bold text-[11px] block">{verifyingOrder.userRegistrationId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Order ID</span>
                    <span className="font-mono font-bold text-slate-900 text-xs block">{verifyingOrder.id}</span>
                    <span className="text-slate-500 text-[10px] block">Date: {verifyingOrder.date || 'Today'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Food Items to Hand Over:
                  </span>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200/80">
                    {verifyingOrder.items?.map((item, idx) => (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-900">{item.name}</span>
                        </div>
                        <span className="font-black text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {verificationSuccess ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center text-emerald-900 font-extrabold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Order Verified &amp; Marked as COMPLETED!</span>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleCompleteOrder(verifyingOrder.id)}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify QR Ticket &amp; Mark as COMPLETED</span>
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default ChefPreparation;
