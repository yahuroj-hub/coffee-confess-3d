import { createFileRoute, Link } from "@tanstack/react-router";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — CoffeeConfess" },
      { name: "description", content: "Baked daily, served with love — our full menu of croissants, cakes, cookies, and drinks." },
      { property: "og:title", content: "Menu — CoffeeConfess" },
      { property: "og:description", content: "Baked daily, served with love — our full menu of croissants, cakes, cookies, and drinks." },
      { property: "og:image", content: "/menu.jpg" },
    ],
  }),
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
  return (
    <main className="min-h-screen bg-background grain-bg pb-24">
      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← back home</Link>
      </div>

      <ContainerScroll
        titleComponent={
          <>
            <p className="font-script text-2xl md:text-3xl text-accent mb-3">today's offerings</p>
            <h1 className="font-display text-4xl md:text-7xl font-semibold text-espresso leading-none">
              Scroll to unveil <br />
              <span className="italic text-mocha text-5xl md:text-[8rem] leading-none">our menu</span>
            </h1>
          </>
        }
      >
        <img
          src="/menu.jpg"
          alt="CafeConfess full menu — croissants, cakes, cookies, muffins, and drinks"
          className="mx-auto h-full w-full object-contain"
          draggable={false}
        />
      </ContainerScroll>

      <div className="text-center mt-8">
        <Link to="/" hash="order" className="inline-block px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
          Order now →
        </Link>
      </div>
    </main>
  );
}
