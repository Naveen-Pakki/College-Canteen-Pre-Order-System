import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { OrderTicket } from '../components/order/OrderTicket';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, ShoppingBag } from 'lucide-react';

export const Ticket = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const { orders } = useOrders();
  const { currentUser } = useAuth();

  // Find target order or latest order
  const order = orders.find(o => o.id === orderId) || orders[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>

          <Link
            to="/menu"
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            + Order More Food
          </Link>
        </div>

        {order ? (
          <OrderTicket order={order} />
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base">No Order Found</h3>
            <p className="text-xs text-slate-500">
              The requested digital order ticket was not found or has expired.
            </p>
            <Link
              to="/menu"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Go to Menu
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Ticket;
