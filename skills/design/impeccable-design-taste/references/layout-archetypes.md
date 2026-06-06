# Layout Archetypes & Visual Structures — Impeccable Design Taste

To prevent AI page designs from looking standard and homogeneous, you MUST select one of the following structural layout families. The selected family dictates the composition of your page. Do NOT mix them on the same page unless explicitly requested.

---

## Archetype 1: Editorial Column (Asymmetric & Typography-First)

*   **Vibe**: Premium publication, luxury studio, architecture agency.
*   **Aesthetic**: High empty space (py-32+), left-heavy, large offset typography, ultra-thin borders.
*   **Layout Rules**:
    *   Avoid centered text entirely.
    *   Use a 2-column or 3-column asymmetric layout where one column is significantly wider or serves as empty space.
    *   Use uppercase tracked eyebrows sparingly (max 1 for the whole page).

### Visual Structure Example

```html
<section class="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
  <!-- Left Column: Fixed display typography -->
  <div class="lg:col-span-5 flex flex-col justify-between border-t border-zinc-200 dark:border-zinc-800 pt-8">
    <div>
      <h2 class="text-5xl font-display font-light text-zinc-900 dark:text-zinc-100 tracking-tight leading-none text-balance">
        We build spaces that <span class="italic font-serif">breathe</span>.
      </h2>
    </div>
    <span class="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mt-12 block">
      © 2026 Studio / Editorial
    </span>
  </div>
  
  <!-- Right Column: Narrative with subtle specs -->
  <div class="lg:col-span-7 border-t border-zinc-200 dark:border-zinc-800 pt-8">
    <p class="text-xl text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-16 text-pretty">
      Our approach rejects the hyper-saturated default. We curate physical and digital materials with absolute restraint, leaving room for light, shadow, and silence.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100 dark:border-zinc-900">
      <div>
        <h4 class="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Asymmetric Spacing</h4>
        <p class="text-sm text-zinc-500">Whitespace is a material, not a gap. We use unbalanced columns to guide the eye.</p>
      </div>
      <div>
        <h4 class="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Restrained Color</h4>
        <p class="text-sm text-zinc-500">Single accent tones over zinc or bone. High-contrast monochromatic typography.</p>
      </div>
    </div>
  </div>
</section>
```

---

## Archetype 2: The Command Console (Mono-Industrial & Technical)

*   **Vibe**: Technical tool, developer platform, security database, compiler.
*   **Aesthetic**: Rigid grid-lines, 1px solid borders, monospace fonts for labels/metrics, dark background, key-value grids.
*   **Layout Rules**:
    *   Use a box-grid structure where sections are bounded by clear border lines (`divide-y divide-x`).
    *   Use font-mono for labels, codes, and numerical data.
    *   No rounded corners on containers or buttons (set `rounded-none` or max `rounded-sm`).

### Visual Structure Example

```html
<section class="border border-zinc-800 bg-zinc-950 font-mono text-zinc-400 text-xs">
  <!-- Header row -->
  <div class="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
    <span class="text-zinc-100 flex items-center gap-2">
      <span class="w-2 height-2 rounded-full bg-emerald-500 animate-pulse"></span>
      SYSTEM_STATUS: OPERATIONAL
    </span>
    <span class="text-zinc-600">ID: SEC-409-X</span>
  </div>
  
  <!-- Content grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
    <div class="p-6">
      <span class="text-zinc-600 uppercase block mb-2">// 01. TELEMETRY</span>
      <h3 class="text-lg font-bold text-zinc-200 mb-4">Input Validation</h3>
      <p class="mb-4 leading-relaxed">Systematic auditing of incoming prompt payloads. Strict regex filters prevent pipeline pollution.</p>
      <span class="text-emerald-500 font-bold">PASS: 100%</span>
    </div>
    <div class="p-6">
      <span class="text-zinc-600 uppercase block mb-2">// 02. CACHING_LAYER</span>
      <h3 class="text-lg font-bold text-zinc-200 mb-4">Token Optimization</h3>
      <p class="mb-4 leading-relaxed">Redis local KV storage caches static metadata queries, preventing redundant API calls.</p>
      <span class="text-zinc-500">HIT_RATE: 94.2%</span>
    </div>
    <div class="p-6">
      <span class="text-zinc-600 uppercase block mb-2">// 03. THRESHOLD_CONTROL</span>
      <h3 class="text-lg font-bold text-zinc-200 mb-4">Rate Limiting</h3>
      <p class="mb-4 leading-relaxed">Token-bucket mechanism throttles abusive IPs dynamically in memory.</p>
      <span class="text-amber-500 font-bold">WARNING: 12 LIMITS</span>
    </div>
  </div>
</section>
```

---

## Archetype 3: Kinetic Canvas (Creative & Fluid Portfolio)

*   **Vibe**: Digital design studio, creative agency, interactive portfolio.
*   **Aesthetic**: Overlapping elements, micro-interactions, floating cards, subtle parallax, noise backgrounds, fluid layout variance.
*   **Layout Rules**:
    *   Vary container alignment: cards offsets in vertical scroll (masonry grid).
    *   Implement smooth transforms on hover (`hover:-translate-y-1 hover:shadow-xl`).
    *   Apply a noise-grain backdrop to cards to create depth.

### Visual Structure Example

```html
<section class="max-w-6xl mx-auto px-6 py-24">
  <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
    
    <!-- Hero Header / Left -->
    <div class="md:col-span-4 sticky top-8">
      <span class="text-sm font-semibold tracking-wider text-emerald-500 uppercase">Selected Projects</span>
      <h2 class="text-4xl font-display font-bold text-zinc-900 dark:text-zinc-100 mt-2 mb-6 leading-tight">
        Visual works that move minds.
      </h2>
      <p class="text-zinc-500 mb-8">Clicking projects reveals the reasoning and process behind the visual direction.</p>
    </div>

    <!-- Project Masonry Cards / Right -->
    <div class="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-12 md:pt-0">
      
      <!-- Card 1 (Taller, Offset) -->
      <div class="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between min-h-[320px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-zinc-700">
        <div class="absolute inset-0 bg-noise opacity-5 pointer-events-none rounded-2xl"></div>
        <div class="flex justify-between items-start">
          <span class="text-xs font-mono text-zinc-500">2026</span>
          <span class="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">Cinema</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Cinematic Atmosphere</h3>
          <p class="text-sm text-zinc-400">Anamorphic lighting presets and prompt-engine development.</p>
        </div>
      </div>

      <!-- Card 2 (Shorter, Push down) -->
      <div class="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between min-h-[260px] sm:mt-12 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-zinc-700">
        <div class="absolute inset-0 bg-noise opacity-5 pointer-events-none rounded-2xl"></div>
        <div class="flex justify-between items-start">
          <span class="text-xs font-mono text-zinc-500">2026</span>
          <span class="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">SVG</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Vector Marks</h3>
          <p class="text-sm text-zinc-400">Geometric construction formula for high simplicity logos.</p>
        </div>
      </div>

    </div>
  </div>
</section>
```

---

## Archetype 4: Split Hero / Full-Width Media (Apple-y Premium)

*   **Vibe**: High-end consumer hardware, SaaS landing page, premium application hero.
*   **Aesthetic**: Large left-aligned text stack, call to action visible above the fold, full-width high-quality mockup/image on the right or embedded in a deep container.
*   **Layout Rules**:
    *   Hero section must completely fit in the viewport.
    *   Limit copy to one headline, one brief subtext, and 1-2 button actions.
    *   The visual must be a real image or simulated mockup, not a generic gradient mesh blob.

### Visual Structure Example

```html
<header class="relative min-h-[90dvh] flex items-center overflow-hidden bg-zinc-50 dark:bg-zinc-950">
  <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
    <!-- Left text stack -->
    <div class="lg:col-span-6 flex flex-col justify-center">
      <h1 class="text-5xl lg:text-7xl font-display font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight text-balance">
        Speed is the ultimate feature.
      </h1>
      <p class="text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 mt-6 max-w-lg leading-relaxed text-pretty">
        Every interaction completes within 100ms. CodeGraph indexing syncs instantly.
      </p>
      <div class="flex items-center gap-4 mt-10">
        <a href="#get-started" class="px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-full font-medium shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-97 transition-all">
          Deploy Instantly
        </a>
        <a href="#docs" class="px-6 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
          Read the Docs
        </a>
      </div>
    </div>
    
    <!-- Right media stack (Real graphic mockup) -->
    <div class="lg:col-span-6 flex items-center justify-center relative">
      <div class="relative w-full max-w-lg aspect-square border border-zinc-200 dark:border-zinc-800 rounded-3xl p-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
        <div class="w-full h-full bg-zinc-100 dark:bg-zinc-950 rounded-2xl overflow-hidden relative border border-zinc-200 dark:border-zinc-800">
          <!-- TODO: Place simulated workspace/CodeGraph visual here -->
          <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
        </div>
      </div>
    </div>
  </div>
</header>
```
