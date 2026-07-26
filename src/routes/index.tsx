import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Search,
  MapPin,
  Clock,
  Users,
  Store,
  User as UserIcon,
  Mail,
  Sparkles,
  Leaf,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: App,
});

type Screen = "markets" | "market-detail" | "farmer";
type Tab = "markets" | "cart" | "profile";

// Unsplash imagery
const IMG = {
  heroFood:
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=80",
  marketDowntown:
    "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=1200&q=80",
  marketGreenview:
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
  farmerMale:
    "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80",
  farmerFemale:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
  farmerCow:
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80",
  farmerHoney:
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
  veggieBox:
    "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=900&q=80",
  eggs:
    "https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=900&q=80",
};

function App() {
  const [screen, setScreen] = useState<Screen>("markets");
  const [tab, setTab] = useState<Tab>("markets");
  const [cart, setCart] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[440px] pb-24">
        {tab === "markets" && screen === "markets" && (
          <MarketsScreen onOpen={() => setScreen("market-detail")} />
        )}
        {tab === "markets" && screen === "market-detail" && (
          <MarketDetail
            onBack={() => setScreen("markets")}
            onOpenFarmer={() => setScreen("farmer")}
            cart={cart}
          />
        )}
        {tab === "markets" && screen === "farmer" && (
          <FarmerScreen
            onBack={() => setScreen("market-detail")}
            cart={cart}
            addCart={() => setCart((c) => c + 1)}
          />
        )}
        {tab === "cart" && <CartScreen count={cart} />}
        {tab === "profile" && <ProfileScreen />}
      </div>
      <BottomNav
        tab={tab}
        setTab={(t) => {
          setTab(t);
          if (t === "markets") setScreen("markets");
        }}
        cart={cart}
      />
    </div>
  );
}

/* ------------------ Screen 1 ------------------ */
function MarketsScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero banner */}
      <div className="relative h-[340px] overflow-hidden rounded-b-[36px]">
        <img
          src={IMG.heroFood}
          alt="Fresh local produce at a farmers market"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        <div className="relative flex h-full flex-col justify-between p-6 text-white">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="tracking-wide">Harvest</span>
          </div>
          <div>
            <h1 className="font-display text-[30px] leading-[1.05] font-semibold">
              Support Farmers in Your Local Community.
            </h1>
            <p className="mt-3 text-sm/relaxed text-white/85">
              Discover farmers markets and shops near you to buy fresh, local
              produce.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <button
          onClick={onOpen}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--color-primary)] transition active:scale-[0.98]"
        >
          <MapPin className="h-5 w-5" />
          Find Farmers Near Me
        </button>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Enter your city or ZIP code"
          />
          <button className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            Search
          </button>
        </div>

        {/* Section */}
        <div className="mt-8 mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">
            Nearby Farmers Markets
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            See all
          </span>
        </div>

        <div className="space-y-4">
          <MarketCard
            title="Downtown Farmers Market"
            image={IMG.marketDowntown}
            distance="1.2 km away"
            hours="Open Tue–Sat"
            farmers={14}
            onClick={onOpen}
          />
          <MarketCard
            title="Greenview Community Market"
            image={IMG.marketGreenview}
            distance="3.5 km away"
            hours="Open Fri–Sun"
            farmers={9}
          />
        </div>
      </div>
    </div>
  );
}

function MarketCard({
  title,
  image,
  distance,
  hours,
  farmers,
  onClick,
}: {
  title: string;
  image: string;
  distance: string;
  hours: string;
  farmers: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group block w-full overflow-hidden rounded-3xl border border-border bg-card text-left shadow-sm transition hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
          <Users className="h-3.5 w-3.5" />
          {farmers} local farmers
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {distance}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" /> {hours}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ------------------ Screen 2 ------------------ */
function MarketDetail({
  onBack,
  onOpenFarmer,
  cart,
}: {
  onBack: () => void;
  onOpenFarmer: () => void;
  cart: number;
}) {
  const categories = ["All", "Produce", "Meat", "Dairy", "Bakery"];
  const [active, setActive] = useState("All");

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="relative h-[300px] overflow-hidden rounded-b-[36px]">
        <img
          src={IMG.marketDowntown}
          alt="Downtown Farmers Market"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative flex items-center justify-between p-5">
          <button
            onClick={onBack}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur text-foreground shadow"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <CartBtn count={cart} />
        </div>
        <div className="absolute right-5 bottom-5 left-5 text-white">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium backdrop-blur">
            Open now
          </span>
          <h1 className="mt-2 font-display text-[28px] leading-tight font-semibold">
            Downtown Farmers Market
          </h1>
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">123 Main St, Anytown</p>
              <p className="text-xs text-muted-foreground">
                Open Tue–Sat • 8:00AM – 2:00PM
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Users className="h-3.5 w-3.5" />
              14
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="no-scrollbar mt-5 -mx-5 flex gap-2 overflow-x-auto px-5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                active === c
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <h2 className="mt-6 font-display text-xl font-semibold">
          Meet the Farmers at This Market
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <FarmerCard
            name="Green Fields Farm"
            image={IMG.farmerMale}
            cats="Vegetables · Fruits · Eggs"
            onClick={onOpenFarmer}
          />
          <FarmerCard
            name="Valley View Organics"
            image={IMG.farmerFemale}
            cats="Vegetables · Herbs"
          />
          <FarmerCard
            name="Horizon Pastures"
            image={IMG.farmerCow}
            cats="Milk · Cheese · Beef"
          />
          <FarmerCard
            name="Sunny Acres Apiary"
            image={IMG.farmerHoney}
            cats="Honey · Eggs"
          />
        </div>
      </div>
    </div>
  );
}

function FarmerCard({
  name,
  image,
  cats,
  onClick,
}: {
  name: string;
  image: string;
  cats: string;
  onClick?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-32 w-full overflow-hidden">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="font-display text-sm font-semibold leading-tight">
          {name}
        </h3>
        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
          {cats}
        </p>
        <button
          onClick={onClick}
          className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition active:scale-[0.98]"
        >
          Shop This Farmer
        </button>
      </div>
    </div>
  );
}

/* ------------------ Screen 3 ------------------ */
function FarmerScreen({
  onBack,
  cart,
  addCart,
}: {
  onBack: () => void;
  cart: number;
  addCart: () => void;
}) {
  const [freq, setFreq] = useState<"Weekly" | "Bi-weekly">("Weekly");
  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="relative h-[320px] overflow-hidden rounded-b-[36px]">
        <img
          src={IMG.farmerMale}
          alt="Green Fields Farm"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        <div className="relative flex items-center justify-between p-5">
          <button
            onClick={onBack}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur text-foreground shadow"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <CartBtn count={cart} />
        </div>
        <div className="absolute right-5 bottom-5 left-5 text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/90 px-3 py-1 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3" /> Verified Grower
          </span>
        </div>
      </div>

      <div className="px-5 pt-5">
        <h1 className="font-display text-2xl font-semibold">Green Fields Farm</h1>
        <p className="mt-2 text-sm/relaxed text-muted-foreground">
          A family-owned farm growing fresh, organic produce in the heart of the
          valley. We pride ourselves on sustainable farm-practices.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-earth">
            <MapPin className="h-3.5 w-3.5" /> 5.2 km away • Anytown, CA
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Sustainable", "Organic", "Small-Batch"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              {t}
            </span>
          ))}
        </div>

        <a
          href="mailto:hello@greenfieldsfarm.example"
          className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm transition hover:bg-secondary"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-earth">
              <Mail className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Email Support</span>
              <span className="block text-[11px] text-muted-foreground">
                Reach the farmer privately
              </span>
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </a>

        <h2 className="mt-7 font-display text-lg font-semibold">
          Subscribe &amp; Save <span className="text-muted-foreground text-sm font-normal">(From This Farmer)</span>
        </h2>

        <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
          <ProductCard
            image={IMG.veggieBox}
            title="Weekly Veggie Box"
            bullets={["Fresh seasonal produce", "Every Friday"]}
            price="$25 / week"
            badge="Earn bonus tokens"
            onSubscribe={addCart}
          />
          <ProductCard
            image={IMG.eggs}
            title="Eggs Subscription"
            bullets={["12 free-range eggs", "Weekly or bi-weekly"]}
            price="$5 / delivery"
            badge="Earn bonus tokens"
            onSubscribe={addCart}
            extra={
              <div className="mt-3 grid grid-cols-2 rounded-xl bg-secondary p-1 text-xs font-semibold">
                {(["Weekly", "Bi-weekly"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFreq(f)}
                    className={`rounded-lg py-2 transition ${
                      freq === f
                        ? "bg-card text-foreground shadow"
                        : "text-muted-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  image,
  title,
  bullets,
  price,
  badge,
  extra,
  onSubscribe,
}: {
  image: string;
  title: string;
  bullets: string[];
  price: string;
  badge: string;
  extra?: React.ReactNode;
  onSubscribe: () => void;
}) {
  return (
    <div className="w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="relative h-40 overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
          {badge}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight">
            {title}
          </h3>
          <span className="whitespace-nowrap text-sm font-bold text-primary">
            {price}
          </span>
        </div>
        <ul className="mt-2 space-y-1">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {b}
            </li>
          ))}
        </ul>
        {extra}
        <button
          onClick={onSubscribe}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition active:scale-[0.98]"
        >
          Subscribe
        </button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Pause or cancel anytime • Pickup or delivery
        </p>
      </div>
    </div>
  );
}

/* ------------------ Utility screens & nav ------------------ */
function CartBtn({ count }: { count: number }) {
  return (
    <button className="relative grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur text-foreground shadow">
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

function CartScreen({ count }: { count: number }) {
  return (
    <div className="px-5 pt-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold">Your Cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {count > 0
          ? `You have ${count} subscription${count > 1 ? "s" : ""} ready to check out.`
          : "Subscribe to fresh boxes from local farmers to fill your cart."}
      </p>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="px-5 pt-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <UserIcon className="h-7 w-7" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold">Your Profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage subscriptions, delivery addresses, and farmer favorites.
      </p>
    </div>
  );
}

function BottomNav({
  tab,
  setTab,
  cart,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  cart: number;
}) {
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "markets", label: "Markets", icon: <Store className="h-5 w-5" /> },
    { id: "cart", label: "Cart", icon: <ShoppingBag className="h-5 w-5" /> },
    { id: "profile", label: "Profile", icon: <UserIcon className="h-5 w-5" /> },
  ];
  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 px-4 pb-4">
      <div className="grid grid-cols-3 rounded-3xl border border-border bg-card/95 p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] backdrop-blur">
        {items.map((it) => {
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`relative flex flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span className="relative">
                {it.icon}
                {it.id === "cart" && cart > 0 && (
                  <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                    {cart}
                  </span>
                )}
              </span>
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
