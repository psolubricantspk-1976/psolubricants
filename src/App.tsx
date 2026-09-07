import { useState } from "react";
import AuthModal from "./components/AuthModal";
import Contact from "./components/Contact";
import CursorFX from "./components/CursorFX";
import DashboardModal from "./components/DashboardModal";
import Hero from "./components/Hero";
import ScrollProgress from "./components/ScrollProgress";
import RateWave from "./components/RateWave";
import OilFinder from "./components/OilFinder";
import OrderModal, { type CartItem } from "./components/OrderModal";
import Products from "./components/Products";
import SupportWidget from "./components/SupportWidget";
import TrackModal from "./components/TrackModal";
import WhyChooseUs from "./components/WhyChooseUs";
import Nav from "./components/Nav";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  const addToCart = (id: string) => {
    setCart((prev) => {
      const found = prev.find((it) => it.productId === id);
      if (found) return prev.map((it) => (it.productId === id ? { ...it, qty: it.qty + 1 } : it));
      return [...prev, { productId: id, qty: 1 }];
    });
    setOrderOpen(true);
  };

  const updateQty = (id: string, qty: number) =>
    setCart((prev) => prev.map((it) => (it.productId === id ? { ...it, qty: Math.max(1, qty) } : it)));

  const removeItem = (id: string) => setCart((prev) => prev.filter((it) => it.productId !== id));
  const clearCart = () => setCart([]);

  return (
    <div className="min-h-screen bg-coal text-paper">
      <ScrollProgress />
      <RateWave />
      <CursorFX />
      <Nav
        cartCount={cartCount}
        onOpenCart={() => setOrderOpen(true)}
        onTrack={() => setTrackOpen(true)}
        onDashboard={() => setDashOpen(true)}
        onAccount={() => setAuthOpen(true)}
      />
      <main>
        <Hero />
        <Products onBuy={addToCart} />
        <OilFinder onBuy={addToCart} />
        <WhyChooseUs />
        <Contact />
      </main>

      <OrderModal
        open={orderOpen}
        items={cart}
        onClose={() => setOrderOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onClear={clearCart}
        onOrderPlaced={clearCart}
      />
      <TrackModal open={trackOpen} onClose={() => setTrackOpen(false)} />
      <DashboardModal open={dashOpen} onClose={() => setDashOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Support chat widget replaces WhatsApp floating button */}
      <SupportWidget />
    </div>
  );
}
