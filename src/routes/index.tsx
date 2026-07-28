import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Search,
  MapPin,
  Users,
  Store,
  User as UserIcon,
  Sparkles,
  Leaf,
  Loader2,
  ImageOff,
  Repeat,
  LogIn,
  ChevronRight,
} from "lucide-react";
import { formatMoney } from "../lib/currency";
import {
  usePublicMarkets,
  usePublicMarket,
  usePublicMarketVendors,
  usePublicVendor,
  usePublicVendorProducts,
  usePublicOrganizations,
} from "../hooks/use-marketplace-data";
import type { Product } from "../lib/types";

export const Route = createFileRoute("/")({
  component: App,
});

type Screen = "markets" | "market-detail" | "farmer";
type Tab = "markets" | "cart" | "profile";

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
};

function App() {
  const [screen, setScreen] = useState<Screen>("markets");
  const [tab, setTab] = useState<Tab>("markets");
  const [cart, setCart] = useState(0);
  const [marketId, setMarketId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[440px] pb-28 md:max-w-6xl md:pb-16 md:pt-6 md:px-6">
        {tab === "markets" && screen === "markets" && (
          <MarketsScreen
            onOpen={(id) => {
              setMarketId(id);
              setScreen("market-detail");
            }}
          />
        )}
        {tab === "markets" && screen === "market-detail" && marketId && (
          <MarketDetail
            marketId={marketId}
            onBack={() => setScreen("markets")}
            onOpenFarmer={(id) => {
              setVendorId(id);
              setScreen("farmer");
            }}
            cart={cart}
          />
        )}
        {tab === "markets" && screen === "farmer" && vendorId && (
          <FarmerScreen
            vendorId={vendorId}
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

/* ------------------ Screen 1: Markets ------------------ */
function MarketsScreen({ onOpen }: { onOpen: (marketId: string) => void }) {
  const { data: markets, isLoading } = usePublicMarkets();
  const [search, setSearch] = useState("");

  const filtered = (markets ?? []).filter((m) =>
    `${m.name} ${m.city ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="relative h-[280px] overflow-hidden rounded-b-[36px] bg-gradient-to-br from-primary to-earth md:h-[380px] md:rounded-[32px]">
        <div className="relative flex h-full flex-col justify-between p-6 text-white md:p-12">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="tracking-wide">MarketConnect</span>
          </div>
          <div className="md:max-w-xl">
            <h1 className="font-display text-[28px] leading-[1.05] font-semibold md:text-5xl lg:text-6xl">
              Support Farmers in Your Local Community.
            </h1>
            <p className="mt-3 text-sm/relaxed text-white/85 md:mt-5 md:text-base">
              Discover real farmers markets and shop directly from local growers.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 md:px-0 md:pt-10">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder="Search markets by name or city"
          />
        </div>

        <div className="mt-8 mb-3 flex items-end justify-between md:mt-14 md:mb-6">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Farmers Markets</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading markets…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <Store className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No markets found yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check back soon as more markets join MarketConnect.
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
            {filtered.map((m) => (
              <MarketCard
                key={m.id}
                title={m.name}
                image={m.hero_image_url}
                city={m.city}
                marketType={m.market_type}
                onClick={() => onOpen(m.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MarketCard({
  title,
  image,
  city,
  marketType,
  onClick,
}: {
  title: string;
  image: string | null;
  city: string | null;
  marketType: string | null;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group block w-full overflow-hidden rounded-3xl border border-border bg-card text-left shadow-sm transition hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-primary/80 to-earth">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Leaf className="h-8 w-8 text-white/70" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {city}
            </span>
          )}
          {marketType && <span className="capitalize">{marketType.replace("_", " ")}</span>}
        </div>
      </div>
    </button>
  );
}

/* ------------------ Screen 2: Market Detail ------------------ */
function MarketDetail({
  marketId,
  onBack,
  onOpenFarmer,
  cart,
}: {
  marketId: string;
  onBack: () => void;
  onOpenFarmer: (vendorId: string) => void;
  cart: number;
}) {
  const { data: market, isLoading: marketLoading } = usePublicMarket(marketId);
  const { data: vendors, isLoading: vendorsLoading } = usePublicMarketVendors(marketId);

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="relative h-[260px] overflow-hidden rounded-b-[36px] bg-gradient-to-br from-primary/80 to-earth md:h-[380px] md:rounded-[32px]">
        {market?.hero_image_url && (
          <img
            src={market.hero_image_url}
            alt={market.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative flex items-center justify-between p-5 md:p-8">
          <button
            onClick={onBack}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur text-foreground shadow"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <CartBtn count={cart} />
        </div>
        <div className="absolute right-5 bottom-5 left-5 text-white md:right-10 md:bottom-10 md:left-10">
          <h1 className="font-display text-[26px] leading-tight font-semibold md:text-5xl">
            {market?.name ?? "Loading…"}
          </h1>
        </div>
      </div>

      <div className="px-5 pt-5 md:px-0 md:pt-8">
        {marketLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold md:text-base">
                  {market?.address ?? market?.city ?? "Location coming soon"}
                </p>
                {market?.description && (
                  <p className="text-xs text-muted-foreground md:text-sm">{market.description}</p>
                )}
              </div>
              <div className="ml-auto flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Users className="h-3.5 w-3.5" />
                {(vendors ?? []).length} farmer{(vendors ?? []).length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        )}

        <h2 className="mt-6 font-display text-xl font-semibold md:mt-10 md:text-3xl">
          Meet the Farmers at This Market
        </h2>

        {vendorsLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading farmers…
          </div>
        ) : (vendors ?? []).length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No active vendors here yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {vendors!.map((v) => (
              <FarmerCard
                key={v.id}
                name={v.business_name}
                image={v.photos?.[0] ?? null}
                cats={(v.product_categories ?? []).join(" · ") || "Local goods"}
                onClick={() => onOpenFarmer(v.id)}
              />
            ))}
          </div>
        )}
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
  image: string | null;
  cats: string;
  onClick?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex h-32 w-full items-center justify-center overflow-hidden bg-secondary">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-display text-sm font-semibold leading-tight">{name}</h3>
        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{cats}</p>
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

/* ------------------ Screen 3: Farmer Storefront ------------------ */
function FarmerScreen({
  vendorId,
  onBack,
  cart,
  addCart,
}: {
  vendorId: string;
  onBack: () => void;
  cart: number;
  addCart: () => void;
}) {
  const { data: vendor, isLoading: vendorLoading } = usePublicVendor(vendorId);
  const { data: products, isLoading: productsLoading } = usePublicVendorProducts(vendorId);

  const subscriptionProducts = (products ?? []).filter((p) => p.is_subscription_eligible);
  const oneTimeProducts = (products ?? []).filter((p) => !p.is_subscription_eligible);
  const heroImage = vendor?.photos?.[0] ?? null;

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="relative h-[280px] overflow-hidden rounded-b-[36px] bg-gradient-to-br from-primary/80 to-earth md:h-[420px] md:rounded-[32px]">
        {heroImage && (
          <img
            src={heroImage}
            alt={vendor?.business_name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        <div className="relative flex items-center justify-between p-5 md:p-8">
          <button
            onClick={onBack}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur text-foreground shadow"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <CartBtn count={cart} />
        </div>
        <div className="absolute right-5 bottom-5 left-5 text-white md:right-10 md:bottom-10 md:left-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/90 px-3 py-1 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3" /> Verified Grower
          </span>
        </div>
      </div>

      {vendorLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="px-5 pt-5 md:grid md:grid-cols-[1fr_1.4fr] md:gap-10 md:px-0 md:pt-8">
          <div>
            <h1 className="font-display text-2xl font-semibold md:text-4xl">
              {vendor?.business_name}
            </h1>
            {vendor?.farm_story && (
              <p className="mt-2 text-sm/relaxed text-muted-foreground md:mt-4 md:text-base">
                {vendor.farm_story}
              </p>
            )}
            {vendor?.farm_location && (
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-earth">
                <MapPin className="h-3.5 w-3.5" /> {vendor.farm_location}
              </span>
            )}

            {vendor?.farming_practices && vendor.farming_practices.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {vendor.farming_practices.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {(vendor?.photos?.length ?? 0) > 1 && (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {vendor!.photos!.slice(1).map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl bg-secondary">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {productsLoading ? (
              <div className="mt-7 flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground md:mt-0">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading products…
              </div>
            ) : (
              <>
                {subscriptionProducts.length > 0 && (
                  <>
                    <h2 className="mt-7 font-display text-lg font-semibold md:mt-0 md:text-2xl">
                      Subscribe &amp; Save{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        (From This Farmer)
                      </span>
                    </h2>
                    <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:mt-5 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0">
                      {subscriptionProducts.map((p) => (
                        <ProductCard key={p.id} product={p} onSubscribe={addCart} />
                      ))}
                    </div>
                  </>
                )}

                {oneTimeProducts.length > 0 && (
                  <>
                    <h2 className="mt-7 font-display text-lg font-semibold md:text-2xl">
                      All Products
                    </h2>
                    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                      {oneTimeProducts.map((p) => (
                        <div
                          key={p.id}
                          className="overflow-hidden rounded-2xl border border-border bg-card"
                        >
                          <div className="flex h-24 items-center justify-center overflow-hidden bg-secondary">
                            {p.photo_url ? (
                              <img
                                src={p.photo_url}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageOff className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-semibold leading-tight">{p.name}</p>
                            <p className="mt-1 text-xs font-bold text-primary">
                              {formatMoney(p.price, p.currency)}
                              {p.unit ? ` / ${p.unit}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {(products ?? []).length === 0 && (
                  <p className="mt-7 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground md:mt-0">
                    No products listed yet.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onSubscribe }: { product: Product; onSubscribe: () => void }) {
  const frequencies = product.subscription_frequencies ?? [];
  return (
    <div className="w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-secondary">
        {product.photo_url ? (
          <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
          <Repeat className="h-2.5 w-2.5" />
          Subscription
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight">{product.name}</h3>
          <span className="whitespace-nowrap text-sm font-bold text-primary">
            {formatMoney(product.price, product.currency)}
          </span>
        </div>
        {product.description && (
          <p className="mt-2 text-xs text-muted-foreground">{product.description}</p>
        )}
        {frequencies.length > 0 && (
          <div
            className="mt-3 grid gap-1 rounded-xl bg-secondary p-1 text-xs font-semibold"
            style={{ gridTemplateColumns: `repeat(${frequencies.length}, 1fr)` }}
          >
            {frequencies.map((f) => (
              <span key={f} className="rounded-lg py-2 text-center text-muted-foreground">
                {FREQUENCY_LABEL[f] ?? f}
              </span>
            ))}
          </div>
        )}
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
      <p className="mx-auto mt-4 max-w-xs text-xs text-muted-foreground">
        Checkout and payment aren't connected yet — this counter shows what you've tapped
        "Subscribe" on so far.
      </p>
    </div>
  );
}

function ProfileScreen() {
  const { data: organizations } = usePublicOrganizations();

  return (
    <div className="px-5 pt-16">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <UserIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Your Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage subscriptions, delivery addresses, and farmer favorites.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-sm space-y-3">
        <a
          href="/login"
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm transition hover:bg-secondary"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">
              <LogIn className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Market Organizer or Vendor?</span>
              <span className="block text-[11px] text-muted-foreground">
                Sign in to your console
              </span>
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </a>

        {organizations && organizations.length > 0 && (
          <div>
            <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Are you a farmer?
            </p>
            {organizations.map((org) => (
              <a
                key={org.id}
                href={`/apply/${org.slug}`}
                className="mb-2 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm transition hover:bg-secondary"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Leaf className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      Apply to sell with {org.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      Submit a vendor application
                    </span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, cart }: { tab: Tab; setTab: (t: Tab) => void; cart: number }) {
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
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
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
