import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, useScroll, useTransform } from "framer-motion";
import { CoffeeScene } from "@/components/CoffeeScene";
import { getMenu, placeOrder, type MenuItem } from "@/lib/menu.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CoffeeConfess — Coffee for honest mornings" },
      { name: "description", content: "Slow-poured coffee, brown-sugar lattes, and a quiet place to leave a confession with your order." },
      { property: "og:title", content: "CoffeeConfess — Coffee for honest mornings" },
      { property: "og:description", content: "Slow-poured coffee, brown-sugar lattes, and a quiet place to leave a confession with your order." },
    ],
  }),
  component: Home,
});

const confessions = [
  "I told my barista his name. He still writes 'Ben'.",
  "I drink decaf in public. The truth is darker.",
  "I called in sick to finish a novel. No regrets.",
  "I've never finished a journal. This is page two.",
  "I order an extra croissant. It's not for sharing.",
];

function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollProg = useRef(0);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => { scrollProg.current = v; });
    return unsub;
  }, [scrollYProgress]);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero heroRef={heroRef} heroY={heroY} heroOpacity={heroOpacity} scrollProg={scrollProg} />
      <Story />
      <MenuSection />
      <ConfessionOrder />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">☕</span>
          <span className="font-display text-xl tracking-tight">CoffeeConfess</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#story" className="hover:text-foreground transition-colors">Story</a>
          <Link to="/menu" className="hover:text-foreground transition-colors">Menu</Link>
          <a href="#order" className="hover:text-foreground transition-colors">Order</a>
        </nav>
        <a href="#order" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          Order
        </a>
      </div>
    </header>
  );
}

function Hero({ heroRef, heroY, heroOpacity, scrollProg }: any) {
  return (
    <section ref={heroRef} className="relative min-h-[110vh] flex items-center grain-bg">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <CoffeeScene scrollProgress={scrollProg} />
      </div>

      {/* Steam particles */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-32 z-10 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute block w-2 h-2 rounded-full bg-foreground/20 steam"
            style={{ left: `${i * 14 - 14}px`, animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </div>

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-20 max-w-5xl mx-auto px-6 text-center pt-24">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-script text-3xl md:text-4xl text-accent mb-4"
        >
          welcome, friend
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-espresso"
        >
          coffee for<br />
          <em className="italic text-mocha">honest</em> mornings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          A small café where the espresso is slow, the seats are deep,
          and every order comes with space for a quiet confession.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#order" className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium shadow-warm hover:scale-105 transition-transform">
            Place an order
          </a>
          <a href="#story" className="px-8 py-4 rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors">
            Read our story
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-muted-foreground text-sm"
      >
        ↓ scroll to confess
      </motion.div>
    </section>
  );
}

function Story() {
  return (
    <section id="story" className="relative py-32 px-6 bg-gradient-to-b from-background to-[oklch(0.92_0.04_70)]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="font-script text-2xl text-accent mb-3">our story</p>
          <h2 className="font-display text-5xl md:text-7xl text-espresso max-w-3xl mx-auto leading-tight">
            We brew the coffee.<br />
            <em className="italic">You bring the truth.</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {[
            { n: "01", t: "Single origin", b: "Beans roasted weekly in small batches. We name every farm." },
            { n: "02", t: "Slow pours", b: "Hand-ground, hand-poured. The wait is the point." },
            { n: "03", t: "Quiet corners", b: "Soft chairs, low light. A notebook on every table." },
          ].map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="p-8 rounded-2xl bg-card border border-border shadow-soft hover:shadow-warm transition-shadow"
            >
              <p className="font-script text-accent text-xl mb-2">{c.n}</p>
              <h3 className="font-display text-2xl mb-3 text-espresso">{c.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{c.b}</p>
            </motion.div>
          ))}
        </div>

        {/* Confession scroll */}
        <div className="mt-32 overflow-hidden border-y border-border py-8 relative">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-16 whitespace-nowrap"
          >
            {[...confessions, ...confessions].map((c, i) => (
              <span key={i} className="font-script text-3xl md:text-4xl text-mocha/70">
                "{c}" <span className="text-accent mx-4">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MenuSection() {
  const { data: menu } = useQuery({
    queryKey: ["menu"],
    queryFn: () => getMenu(),
  });
  const featured = useMemo(() => (menu ?? []).slice(0, 6), [menu]);

  return (
    <section id="menu-preview" className="py-32 px-6 bg-[oklch(0.92_0.04_70)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
          <div>
            <p className="font-script text-2xl text-accent mb-2">today's pours</p>
            <h2 className="font-display text-5xl md:text-6xl text-espresso">A small menu, on purpose.</h2>
          </div>
          <Link to="/menu" className="text-mocha underline underline-offset-4 hover:text-espresso">
            see the full menu →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:shadow-warm transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{item.emoji}</span>
                <span className="font-display text-lg text-mocha">${(item.price_cents / 100).toFixed(2)}</span>
              </div>
              <h3 className="font-display text-2xl mb-2 text-espresso">{item.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

type CartItem = MenuItem & { quantity: number };

function ConfessionOrder() {
  const { data: menu } = useQuery({ queryKey: ["menu"], queryFn: () => getMenu() });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confession, setConfession] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(placeOrder);

  const total = cart.reduce((s, i) => s + i.price_cents * i.quantity, 0);

  function add(item: MenuItem) {
    setCart((c) => {
      const found = c.find((x) => x.id === item.id);
      if (found) return c.map((x) => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...c, { ...item, quantity: 1 }];
    });
  }
  function remove(id: string) {
    setCart((c) => c.flatMap((x) => x.id === id ? (x.quantity > 1 ? [{ ...x, quantity: x.quantity - 1 }] : []) : [x]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) { toast.error("Add something to your cup first"); return; }
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          customer_name: name,
          customer_email: email,
          confession: confession || null,
          items: cart.map((c) => ({ id: c.id, name: c.name, price_cents: c.price_cents, quantity: c.quantity })),
        },
      });
      toast.success(`Order placed — total $${(res.total_cents / 100).toFixed(2)}. We'll have it ready.`);
      setCart([]); setName(""); setEmail(""); setConfession("");
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="order" className="py-32 px-6 bg-gradient-to-b from-[oklch(0.92_0.04_70)] to-[oklch(0.30_0.05_40)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-script text-2xl text-accent mb-3">your order</p>
          <h2 className="font-display text-5xl md:text-6xl text-espresso">Confess as you check out.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Pick what you'd like. Add a thought, a secret, a small truth — we read every one.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Menu picker */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {(menu ?? []).map((item) => (
              <button
                key={item.id}
                onClick={() => add(item)}
                className="text-left p-4 rounded-xl bg-card border border-border hover:border-accent hover:shadow-soft transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-sm text-mocha font-medium">${(item.price_cents / 100).toFixed(2)}</span>
                </div>
                <p className="font-display text-lg text-espresso">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              </button>
            ))}
          </div>

          {/* Cart + form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border shadow-warm space-y-4 self-start sticky top-24">
            <h3 className="font-display text-2xl text-espresso">Your cup</h3>
            <div className="space-y-2 min-h-[60px]">
              {cart.length === 0 && <p className="text-sm text-muted-foreground italic">Nothing yet. Tap something on the left.</p>}
              {cart.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="flex-1 truncate">{c.emoji} {c.name}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => remove(c.id)} className="w-6 h-6 rounded-full bg-muted hover:bg-accent transition-colors">−</button>
                    <span className="w-6 text-center">{c.quantity}</span>
                    <button type="button" onClick={() => add(c)} className="w-6 h-6 rounded-full bg-muted hover:bg-accent transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-display text-lg">
              <span>Total</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>

            <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            <input required type="email" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            <textarea maxLength={500} value={confession} onChange={(e) => setConfession(e.target.value)} placeholder="a small confession (optional)..." rows={3} className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm font-script text-lg" />

            <button disabled={submitting} type="submit" className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "placing order..." : `place order · $${(total / 100).toFixed(2)}`}
            </button>
            <p className="text-xs text-center text-muted-foreground">Payment at pickup. Card processing coming soon.</p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[oklch(0.22_0.04_40)] text-cream py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">☕</span>
            <span className="font-display text-2xl">CoffeeConfess</span>
          </div>
          <p className="text-cream/60 text-sm leading-relaxed">A small café for honest mornings and unhurried afternoons.</p>
        </div>
        <div>
          <h4 className="font-display text-lg mb-3">Visit</h4>
          <p className="text-cream/60 text-sm leading-relaxed">14 Whisper Lane<br />Open daily, 7am – 7pm</p>
        </div>
        <div>
          <h4 className="font-display text-lg mb-3">Stay close</h4>
          <p className="text-cream/60 text-sm">Slow letters, occasional confessions.</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-cream/10 text-xs text-cream/40 text-center">
        © {new Date().getFullYear()} CoffeeConfess. Brewed with care.
      </div>
    </footer>
  );
}
