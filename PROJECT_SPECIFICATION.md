# PROJECT_SPECIFICATION: The Collectors Exchange

**Version:** 1.0.0  
**Role:** Source of Truth for Architectural Alignment & UI Consistency.

---

## 1. Visual Identity & Design Tokens

### Exact Color Palette
| Token | Hex/RGBA | Usage |
| :--- | :--- | :--- |
| `primary-bg` | `#FFFFFF` | Primary background for cards/sections. |
| `secondary-bg` | `#F9F9F9` | Section backgrounds, layout background. |
| `luxury-gold` | `#D4AF37` | Branding, price tags, hover states, accents. |
| `text-main` | `#000000` | Primary text, headings. |
| `text-inverse` | `#FFFFFF` | Text on dark buttons/backgrounds. |
| **Heritage Palette** | | *Used for premium/museum sections* |
| `charcoal` | `#1C1C1C` | Primary dark background/text. |
| `bronze` | `#8B7355` | Secondary accent. |
| `cream` | `#FAF8F5` | Sophisticated light background. |
| `gold-muted` | `#C9A962` | Subtle gold accents. |

### Typography
- **Primary Font (Serif):** `"Playfair Display"`, serif (used for H1-H6, logo, product titles).
  - Weights: `400` (Regular), `600` (Semi-bold), `700` (Bold).
- **Secondary Font (Sans):** `"Inter"`, sans-serif (used for body, labels, buttons).
  - Weights: `400` (Light/Regular), `500` (Medium), `600` (Semi-bold).
- **Letter Spacing:** `tracking-widest` (0.1em) or `tracking-[0.2em]` for badges and uppercase labels.

### Spacing Scale & Layout
- **Container:** `mx-auto px-6` (standard padding).
- **Section Padding:** `py-20` (standard), `py-24/40` (Hero sections).
- **Increments:** Standard Tailwind 4px scale (1rem = 16px).
- **Max Widths:** `max-w-4xl` (Hero/Focused content), `max-w-6xl` (Grid content).

### Effects & Border Radii
- **Border Radius:** Defaulting to sharp corners or `rounded-sm` for a luxury, precision feel. Circles for action icons (wishlist).
- **Shadows:** 
  - `heritage`: `0 4px 20px rgba(0, 0, 0, 0.08)` (Subtle elevation).
  - `heritage-hover`: `0 8px 30px rgba(0, 0, 0, 0.12)` (Interactivity).
- **Borders:** `1px solid #F3F4F6` (Gray-100) for standard card borders and dividers.

---

## 2. Component Architecture

### Reusable Components
1. **Header:** Sticky top navigation with uppercase tracking-widest links and luxury icon set.
2. **Footer:** Multi-column layout with brand mission and category links.
3. **Layout:** Wrapper providing consistent spacing, header, and footer.
4. **ProductCard:** Image-centric grid item with hover-scale effects and bottom-aligned "Acquire Now" buttons.
5. **AuctionCard:** Similar to ProductCard but with time-sensitive bidding UI.

### Style Signature
- **Interactions:** Use `transition-all duration-300` or `duration-500` for image transforms.
- **Buttons:**
  - **Primary:** Black background, white text, uppercase, tracking-widest. Hover state switches to `bg-luxury-gold`.
  - **Secondary:** Transparent with 1px border, white/black text depending on context.
- **Images:** Aspect-square or 4:3 ratios. Use `mix-blend-multiply` for transparent product shots on light backgrounds.
- **Badges:** Small, uppercase, tracking-widest with high-contrast backgrounds (Black/White or Gold/White).

---

## 3. Technical Stack & Patterns

### Tech Stack
- **Framework:** React 19 (Vite-based).
- **Routing:** React Router 7 (`BrowserRouter`).
- **Styling:** Tailwind CSS 3.4 (with custom extension).
- **Icons:** `lucide-react`.

### State Management & Patterns
- **Local Persistence:** A custom `utils/storage.js` layer wraps `localStorage` to manage `user`, `products`, `cart`, and `wishlist`. 
- **Hooks:** Heavy use of `useState` and `useEffect` for local UI state (modals, menu toggles) and polling for storage updates (cart counts).
- **Props-based Rendering:** Components receive data via props; no heavy external state managers (Redux/Zustand) were implemented to keep the prototype lightweight.

---

## 4. Developer Instructions (AI System Prompt)

### Developer Instructions
> You are acting as "Antigravity," a Senior Full-Stack Architect for "The Collectors Exchange." Your core mission is to maintain a "Luxury Minimalist" aesthetic. When generating code:
> 1. **Prioritize Visual Excellence:** Use the custom `luxury-gold` (#D4AF37) and `heritage` palette. Ensure serif fonts (`Playfair Display`) are used for all headings and sans fonts (`Inter`) for body/actions.
> 2. **Technical Alignment:** Stick strictly to Tailwind CSS for styles and `lucide-react` for iconography. All data MUST be persisted via `src/utils/storage.js`.
> 3. **Design Patterns:** Use sharp borders, consistent letter-spacing (`tracking-widest`) on uppercase labels, and smooth transitions (`duration-300`).
> 4. **Tone:** The UI should feel authoritative, verified, and premium. Avoid generic rounded buttons; favor high-contrast blocks and sophisticated hover states.

---
