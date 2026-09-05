import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Facebook, Twitter, Instagram, Phone, Truck, Award, Menu, Refrigerator, Tv, Wind, Zap, Cable, Fan } from "lucide-react"

export const metadata = {
  title: "Marshall Ethel, dealers in electric and electronic appliances",
}

export default function LandingPage() {
  const gallery = [
    { src: "/images/generators.jpg", alt: "Generators" },
    { src: "/images/inside-store.jpg", alt: "Inside Store" },
    { src: "/images/stocked-fridges.jpg", alt: "Stocked Fridges" },
    { src: "/images/stocked-product-outside.jpg", alt: "Stocked Outside" },
    { src: "/images/stocked-products-inside.jpg", alt: "Stocked Inside" },
  ]

  const categories = [
    { icon: Refrigerator, title: "Refrigerators & Freezers", description: "Deep freezers, chest freezers and home fridges from trusted brands." },
    { icon: Wind, title: "Air Conditioners", description: "Split and window AC units for homes and offices, with installation support." },
    { icon: Tv, title: "Televisions", description: "Smart TVs and home entertainment sets in every size." },
    { icon: Zap, title: "Generators & Power", description: "Petrol generators and power banks to keep you running." },
    { icon: Fan, title: "Fans & Cooling", description: "Standing, table and rechargeable fans for every room." },
    { icon: Cable, title: "Cables & Accessories", description: "Electrical cables, sockets and fittings for every installation." },
  ]

  const brands = [
    { src: "/lg-logo.jpg", name: "LG" },
    { src: "/hisense-logo.jpg", name: "Hisense" },
    { src: "/samsung-logo.jpg", name: "Samsung" },
    { src: "/panasonic-logo.jpg", name: "Panasonic" },
    { src: "/binatone.png", name: "Binatone" },
    { src: "/nexus.png", name: "Nexus" },
    { src: "/scanfrost.png", name: "Scanfrost" },
    { src: "/skyrun.png", name: "Skyrun" },
  ]

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-[#0ea5e9]/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#0ea5e9]/40">
              <Image src="/logo.jpg" alt="Marshall Ethel Logo" width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <h1 className="text-xl font-bold text-[#0ea5e9]">MARSHALL ETHEL</h1>
          </div>
          <div className="relative flex items-center gap-2">
            <input id="nav-toggle" type="checkbox" className="peer hidden" />
            <div className="hidden md:flex items-center gap-2">
              <a href="#products" className="px-3 py-2 rounded-md font-medium text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition">Products</a>
              <a href="#categories" className="px-3 py-2 rounded-md font-medium text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition">Categories</a>
              <a href="#brands" className="px-3 py-2 rounded-md font-medium text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition">Brands</a>
              <a href="#about" className="px-3 py-2 rounded-md font-medium text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition">About</a>
              <a href="#contacts" className="px-3 py-2 rounded-md font-medium text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition">Contacts</a>
              <a
                href="/auth/login"
                className="ml-2 px-4 py-2 rounded-md font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition shadow-sm"
              >
                Admin Login
              </a>
            </div>
            <label htmlFor="nav-toggle" className="md:hidden p-2 rounded-md text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition">
              <Menu className="w-6 h-6" />
            </label>
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[#0ea5e9]/20 bg-white shadow-lg z-50 hidden peer-checked:block md:hidden">
              <a href="#products" className="block px-4 py-2 text-[#0ea5e9] hover:bg-[#0ea5e9]/10">Products</a>
              <a href="#categories" className="block px-4 py-2 text-[#0ea5e9] hover:bg-[#0ea5e9]/10">Categories</a>
              <a href="#brands" className="block px-4 py-2 text-[#0ea5e9] hover:bg-[#0ea5e9]/10">Brands</a>
              <a href="#about" className="block px-4 py-2 text-[#0ea5e9] hover:bg-[#0ea5e9]/10">About</a>
              <a href="#contacts" className="block px-4 py-2 text-[#0ea5e9] hover:bg-[#0ea5e9]/10">Contacts</a>
              <a href="/auth/login" className="block px-4 py-2 font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7]">Admin Login</a>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative h-[60vh] md:h-[80vh]">
        <Image src="/images/front-shop.jpg" alt="Front Shop" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/25 via-[#0ea5e9]/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-7xl mx-auto w-full px-4">
            <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">Dealer in all kind of Home Electronic Appliances</h2>
              <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow">Your trusted source for refrigerators, air conditioners, televisions, cables, and electrical accessories.</p>
              <div className="mt-6 flex gap-3 flex-wrap justify-center">
                <a href="#products"><Button size="lg" className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-lg">Browse Products</Button></a>
                <a href="#about"><Button size="lg" className="bg-white text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white border border-white">Learn More</Button></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <section id="products" className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl glass-panel dark:glass-panel-dark glow-sky p-6 md:p-10">
          <h3 className="text-3xl md:text-4xl font-bold text-[#0ea5e9] dark:text-sky-300 text-center">Our Products</h3>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((g, i) => (
            <div key={i} className="group rounded-xl overflow-hidden border border-[#0ea5e9]/20 bg-white/80 dark:bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <Image src={g.src} alt={g.alt} width={800} height={600} className="w-full h-56 md:h-64 object-cover" />
              <div className="p-4">
                <p className="text-neutral-800 dark:text-white font-medium">{g.alt}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl glass-panel dark:glass-panel-dark glow-sky p-6 md:p-10">
          <h3 className="text-3xl md:text-4xl font-bold text-[#0ea5e9] dark:text-sky-300 text-center">What We Sell</h3>
          <p className="mt-3 text-center text-neutral-600 dark:text-white/70 max-w-2xl mx-auto">Everything you need to power, cool and entertain your home — all under one roof.</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon as any
              return (
                <div
                  key={idx}
                  className="group rounded-2xl glass-panel dark:glass-panel-dark p-6 transition-transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/15 dark:bg-sky-400/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#0ea5e9] dark:text-sky-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{cat.title}</h4>
                  <p className="text-sm text-neutral-600 dark:text-white/70 leading-relaxed">{cat.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section id="why-us" className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl glass-panel dark:glass-panel-dark glow-sky p-6 md:p-10">
          <h3 className="text-3xl md:text-4xl font-bold text-[#0ea5e9] dark:text-sky-300 text-center">Why Choose MARSHALL ETHEL?</h3>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { icon: Award, title: "Quality Assured", description: "Genuine products backed by warranties" },
            { icon: TrendingUp, title: "Competitive Pricing", description: "Best prices with flexible payment" },
            { icon: Truck, title: "Reliable Service", description: "Fast delivery and excellent support" },
          ].map((feature, idx) => {
            const Icon = feature.icon as any
            return (
              <Card key={idx} className="border-[#0ea5e9]/30 hover:shadow-lg hover:-translate-y-1 transition-all">
                <CardContent className="p-6">
                  <Icon className="w-10 h-10 text-[#0ea5e9] dark:text-sky-300 mb-4" />
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-neutral-600 dark:text-white/70 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        </div>
      </section>

      {/* Brands */}
      <section id="brands" className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl glass-panel dark:glass-panel-dark glow-sky p-6 md:p-10">
          <h3 className="text-3xl md:text-4xl font-bold text-[#0ea5e9] dark:text-sky-300 text-center">Brands We Stock</h3>
          <p className="mt-3 text-center text-neutral-600 dark:text-white/70 max-w-2xl mx-auto">We carry genuine products from the brands you know and trust.</p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {brands.map((b, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center rounded-2xl bg-white/70 dark:bg-white/10 border border-[#0ea5e9]/20 p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <Image src={b.src} alt={`${b.name} logo`} width={140} height={60} className="object-contain max-h-12 w-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-3xl glass-panel dark:glass-panel-dark glow-sky p-6 md:p-12">
          <h3 className="text-3xl font-bold text-[#0ea5e9] dark:text-sky-300 mb-8">About MARSHALL ETHEL NIG. LTD.</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Who We Are</h4>
              <p className="text-neutral-700 dark:text-white/75 mb-4">Established dealers in electrical and electronics with a commitment to quality and customer satisfaction.</p>
              <p className="text-neutral-700 dark:text-white/75">We specialize in premium appliances and electrical products for both residential and commercial use.</p>
            </div>
            <div id="contacts" className="rounded-lg p-6 sm:p-8 border border-[#0ea5e9]/30 bg-white/70 dark:bg-white/5">
              <h5 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Contact Information</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-neutral-700 dark:text-white/80">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Company Registration</p>
                  <p className="font-mono text-[#0ea5e9]">Co626565</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Location</p>
                  <p>Hall No. 10 Oko Road<br />Ekwulobia, Aguata L.G.A<br />Anambra State, Nigeria</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Phone</p>
                  <p className="font-mono">08082838408</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Email</p>
                  <p className="break-words">info@marshallethel.example</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#0ea5e9]/20 glass-panel dark:glass-panel-dark">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#0ea5e9]/40">
                  <Image src="/logo.jpg" alt="Marshall Ethel Logo" width={36} height={36} className="object-cover w-full h-full" />
                </div>
                <span className="font-bold text-[#0ea5e9] dark:text-sky-300">MARSHALL ETHEL</span>
              </div>
              <p className="text-neutral-600 dark:text-white/70 text-sm">Dealer in all kind of Home Electronic Appliances</p>
            </div>
            <div>
              <h5 className="font-semibold text-neutral-900 dark:text-white mb-4">Products</h5>
              <ul className="space-y-2 text-neutral-600 dark:text-white/70 text-sm">
                <li><a href="#categories" className="hover:text-[#0ea5e9] transition">Refrigerators</a></li>
                <li><a href="#categories" className="hover:text-[#0ea5e9] transition">Air Conditioners</a></li>
                <li><a href="#categories" className="hover:text-[#0ea5e9] transition">Televisions</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-neutral-900 dark:text-white mb-4">Company</h5>
              <ul className="space-y-2 text-neutral-600 dark:text-white/70 text-sm">
                <li><a href="#about" className="hover:text-[#0ea5e9] transition">About Us</a></li>
                <li><a href="#contacts" className="hover:text-[#0ea5e9] transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-neutral-900 dark:text-white mb-4">Follow Us</h5>
              <div className="flex gap-4">
                <a href="#" className="text-neutral-600 dark:text-white/70 hover:text-[#0ea5e9] transition"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="text-neutral-600 dark:text-white/70 hover:text-[#0ea5e9] transition"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-neutral-600 dark:text-white/70 hover:text-[#0ea5e9] transition"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="text-neutral-600 dark:text-white/70 hover:text-[#0ea5e9] transition"><Phone className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#0ea5e9]/20 pt-8 text-center text-neutral-600 dark:text-white/70 text-sm">
            <p>&copy; 2025 MARSHALL ETHEL NIG. LTD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
