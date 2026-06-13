import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getMenu } from "@/lib/menu.functions";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — CoffeeConfess" },
      { name: "description", content: "Espresso, brown-sugar lattes, slow-pour drips, and pastries baked fresh at 5am." },
      { property: "og:title", content: "Menu — CoffeeConfess" },
      { property: "og:description", content: "Espresso, brown-sugar lattes, slow-pour drips, and pastries baked fresh at 5am." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData({ queryKey: ["menu"], queryFn: () => getMenu() }),
  component: MenuPage,
  errorComponent: ({ reset }) => (
    <div className="p-12 text-center">
      <p>Could not load the menu.</p>
      <button onClick={reset} className="mt-4 underline">Try again</button>
    </div>
  ),
  notFoundComponent: () => <div className="p-12">Not found.</div>,
});

function MenuPage() {
  const { data: menu = [] } = useQuery({ queryKey: ["menu"], queryFn: () => getMenu() });
  const categories = Array.from(new Set(menu.map((m) => m.category)));

  return (
    <main className="min-h-screen bg-background pt-24 pb-32 px-6 grain-bg">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← back home</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center my-12">
          <p className="font-script text-2xl text-accent mb-2">the full menu</p>
          <h1 className="font-display text-6xl md:text-7xl text-espresso">Everything we pour.</h1>
        </motion.div>

        {categories.map((cat) => (
          <section key={cat} className="mb-16">
            <h2 className="font-display text-3xl text-mocha mb-6 border-b border-border pb-2">{cat}</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {menu.filter((m) => m.category === cat).map((item) => (
                <div key={item.id} className="flex items-start gap-4 group">
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-display text-xl text-espresso">{item.name}</h3>
                      <span className="font-display text-lg text-mocha">${(item.price_cents / 100).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="text-center mt-16">
          <Link to="/" hash="order" className="inline-block px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
            Order now →
          </Link>
        </div>
      </div>
    </main>
  );
}
