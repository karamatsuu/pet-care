# Pet Health & Memory Journal — Design System & Component Library

## Design Philosophy

**Warm Minimalism with Emotional Depth**

The app celebrates the bond between pets and their owners. Every interface element is designed to:
- Make memories feel precious, not cluttered
- Build trust through clean, calm design
- Enable natural storytelling through AI narratives
- Encourage sharing without friction

The aesthetic is inspired by:
- Soft, natural materials (cream linen, warm wood)
- Emotional photography (not digital)
- Handwritten notes (the AI narratives feel poetic, not robotic)
- Pet fur colors (warm taupes, soft corals)

---

## Color Palette

### Primary Colors
```
--cream: #FFFBF7          (Background, safe space)
--warmgray: #F5F2ED       (Secondary surfaces, hover states)
--sand: #EDE6DD           (Borders, subtle separation)
```

### Accent Colors
```
--accent-teal: #5A9B8F    (Primary action, trust, calm)
--accent-coral: #D97760   (Warmth, emotion, secondary action)
--soft-accent: #E8B4A8    (Tertiary, gentle emphasis)
```

### Text Colors
```
--warm-text: #2D2620      (Primary text, high contrast)
--mauve: #A89A91          (Secondary text, hints)
--taupe: #D4CFC9          (Tertiary text, very subtle)
```

### Semantic Colors
```
Success: #5A9B8F (same as accent-teal, healing/growth)
Warning: #D97760 (same as accent-coral, attention)
Info: #5A9B8F (teal, informational)
Error: #C65443 (slightly darker coral, urgent)
```

---

## Typography

### Font Stack
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
--font-serif: "Georgia", "Garamond", serif;
--font-mono: "Monaco", "Courier New", monospace;
```

### Typographic Scale

| Purpose | Size | Weight | Line-height | Usage |
|---------|------|--------|-------------|-------|
| Page Heading | 32px | 500 | 1.2 | Dashboard titles |
| Section Heading | 20px | 500 | 1.3 | Main sections |
| Card Title | 16px | 500 | 1.4 | Memory titles, pet names |
| Body Text | 14px | 400 | 1.6 | Memory descriptions, narratives |
| Small Text | 12px | 400 | 1.5 | Dates, labels, hints |
| Tiny Text | 11px | 500 | 1.5 | Upper case labels, badges |
| AI Narrative | 13px | 400 | 1.6 | **Italic serif**, AI-generated |

**Important:** AI narratives are always:
- Italic + serif font (to feel poetic, not robotic)
- Colored with light teal background
- Left-bordered with accent-teal
- Slightly smaller than body text

---

## Spacing System

```css
Base Unit: 8px

--spacing-xs:  4px   (internal button padding)
--spacing-sm:  8px   (between adjacent elements)
--spacing-md:  12px  (normal gaps)
--spacing-lg:  16px  (section gaps)
--spacing-xl:  24px  (large section breaks)
--spacing-2xl: 32px  (page margins, major sections)
--spacing-3xl: 40px  (dashboard padding)
```

### Card Padding
- Mobile: 20px
- Desktop: 24px

### Border Radius
```css
--radius-sm:  6px   (small elements, buttons)
--radius-md:  8px   (cards, inputs)
--radius-lg:  12px  (large cards, modals)
--radius-xl:  16px  (very large components, pet avatars)
--radius-full: 50%  (circular avatars)
```

---

## Component Library

### 1. Buttons

```html
<!-- Primary Button (Call-to-action) -->
<button style="
  padding: 12px 24px;
  background: #5A9B8F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
">Share ↗</button>

<!-- Secondary Button (Less emphasis) -->
<button style="
  padding: 12px 24px;
  background: white;
  color: #2D2620;
  border: 1px solid #EDE6DD;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
">Save</button>

<!-- Tertiary Button (Minimal) -->
<button style="
  padding: 12px 24px;
  background: transparent;
  color: #5A9B8F;
  border: 1px dashed #EDE6DD;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
">+ Add Pet</button>
```

**Hover states:**
- Primary: Darker teal (#4a8a7e), slight lift (transform: translateY(-2px))
- Secondary: Background becomes #F5F2ED
- Tertiary: Border becomes solid

---

### 2. Cards

```html
<!-- Memory Card -->
<div style="
  background: white;
  border: 1px solid #EDE6DD;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(45, 38, 32, 0.06);
">
  <img src="memory.jpg" style="
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 16px;
    object-fit: cover;
  " />
  
  <div style="
    font-size: 12px;
    color: #A89A91;
    margin-bottom: 8px;
  ">December 14, 2024</div>
  
  <p style="
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
    color: #2D2620;
  ">Max played fetch at the park this morning. He was so happy!</p>
  
  <!-- AI Narrative Box -->
  <div style="
    background: #F5F2ED;
    border-left: 3px solid #5A9B8F;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  ">
    <div style="
      font-size: 13px;
      font-style: italic;
      line-height: 1.6;
      color: #2D2620;
      font-family: 'Georgia', serif;
    ">✨ On a crisp morning, Max bounded through the park with unbridled joy...</div>
  </div>
</div>
```

**Card Variants:**
- **Health Card**: Grid layout, no image, icons + metrics
- **Share Card**: Centered, larger typography, watermark logo
- **Timeline Card**: Compact, left-colored border, no image

---

### 3. Forms & Inputs

```html
<!-- Text Input -->
<input type="text" 
  placeholder="Pet name" 
  style="
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    border: 1px solid #EDE6DD;
    border-radius: 8px;
    background: white;
    color: #2D2620;
    transition: all 0.3s;
  "
/>

<!-- Focus state: border becomes #5A9B8F -->

<!-- Textarea (for memories) -->
<textarea 
  placeholder="What happened today?" 
  style="
    width: 100%;
    padding: 16px;
    font-size: 14px;
    border: 1px solid #EDE6DD;
    border-radius: 8px;
    background: white;
    color: #2D2620;
    font-family: inherit;
    line-height: 1.6;
    resize: vertical;
    min-height: 120px;
  "
></textarea>

<!-- File Upload (for photos) -->
<label style="
  display: block;
  width: 100%;
  padding: 32px;
  border: 2px dashed #EDE6DD;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  background: #FFFBF7;
  transition: all 0.3s;
">
  <div style="font-size: 32px; margin-bottom: 8px;">📷</div>
  <div style="font-weight: 500;">Upload a photo</div>
  <div style="font-size: 12px; color: #A89A91;">or drag and drop</div>
  <input type="file" style="display: none;" />
</label>
```

---

### 4. Badges & Labels

```html
<!-- Status Badge -->
<div style="
  display: inline-block;
  padding: 4px 12px;
  background: #E8F4F1;
  color: #5A9B8F;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
">AI Story</div>

<!-- Tag -->
<span style="
  display: inline-block;
  padding: 6px 12px;
  background: #FFF4ED;
  color: #D97760;
  font-size: 12px;
  border-radius: 6px;
  margin-right: 4px;
">🎂 Birthday</span>

<!-- Section Label -->
<div style="
  font-size: 12px;
  color: #A89A91;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  font-weight: 600;
">Today's Memory</div>
```

---

### 5. Pet Avatar

```html
<!-- Pet Avatar (Circular) -->
<div style="
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8B4A8, #D4CFC5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
">🐕</div>

<!-- Pet Avatar with Image -->
<img 
  src="max.jpg" 
  style="
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(45, 38, 32, 0.1);
  "
/>
```

---

### 6. AI Narrative Box

```html
<!-- Always use this for AI-generated content -->
<div style="
  background: #F5F2ED;
  border-left: 3px solid #5A9B8F;
  padding: 16px;
  border-radius: 8px;
">
  <div style="
    font-size: 13px;
    font-style: italic;
    line-height: 1.6;
    color: #2D2620;
    font-family: 'Georgia', serif;
  ">✨ AI-generated poetic narrative goes here...</div>
</div>
```

**Key:** Every AI narrative must have:
- ✨ Emoji prefix
- Italic serif font
- Teal left border
- Light gray background
- Smaller font size (13px instead of 14px)

This signals to users "this is AI-generated and poetic, not a technical analysis"

---

### 7. Navigation Bar (Mobile)

```html
<div style="
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;
  background: white;
  border-top: 1px solid #EDE6DD;
  height: 56px;
">
  <div style="
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 12px;
    color: #5A9B8F;
    font-weight: 500;
  ">
    <div style="font-size: 24px;">🏠</div>
    <div>Home</div>
  </div>
  <!-- Repeat for other tabs -->
</div>
```

---

### 8. Sidebar (Desktop)

```html
<div style="
  width: 240px;
  background: white;
  border-right: 1px solid #EDE6DD;
  padding: 24px 16px;
  height: 100vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
">
  <!-- Logo -->
  <div style="margin-bottom: 32px;">
    <div style="font-size: 20px; font-weight: 600; color: #D97760; margin-bottom: 4px;">🐾 PetJournal</div>
    <div style="font-size: 12px; color: #A89A91; letter-spacing: 1px;">MEMORIES & HEALTH</div>
  </div>
  
  <!-- Navigation -->
  <nav style="display: flex; flex-direction: column; gap: 8px;">
    <div style="
      padding: 12px;
      border-radius: 8px;
      background: #F5F2ED;
      color: #5A9B8F;
      font-weight: 500;
      cursor: pointer;
    ">📊 Dashboard</div>
  </nav>
</div>
```

---

## Layouts

### Mobile (375px viewport)
- **Header**: Full-width, 16-20px padding
- **Content**: Stack vertically, cards take 100% width
- **Navigation**: Bottom tab bar (56px fixed height)
- **Padding**: 20px horizontal

### Tablet (768px viewport)
- **Sidebar**: 200px (collapsible)
- **Content**: Two-column grids
- **Padding**: 24px horizontal

### Desktop (1440px viewport)
- **Sidebar**: 240px (fixed)
- **Content**: Full grid layouts, generous whitespace
- **Padding**: 40px horizontal
- **Max-content-width**: 1200px

---

## Animations & Transitions

### Fade-in (Page Load)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.memory-section {
  animation: fadeIn 0.6s ease forwards;
}

.todays-memory {
  animation: fadeIn 0.6s ease 0.1s forwards;
  opacity: 0;
}
```

### Hover Lift (Cards)
```css
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(45, 38, 32, 0.12);
}
```

### Button Press
```css
button {
  transition: all 0.2s;
  active: transform: scale(0.98);
}
```

### Input Focus
```css
input:focus, textarea:focus {
  outline: none;
  border-color: #5A9B8F;
  box-shadow: 0 0 0 3px rgba(90, 155, 143, 0.1);
}
```

---

## Mobile Navigation Flow

```
┌─────────────────────────────────────┐
│           🏠 Home                   │
│  ├─ Pet Card                        │
│  ├─ Today's Memory                  │
│  └─ Quick Actions                   │
├─────────────────────────────────────┤
│         [🏠] [📖] [🏥] [✨] [👤]   │
└─────────────────────────────────────┘

🏠 Home    → Dashboard + today's memory
📖 Memories → Timeline of all moments
🏥 Health   → Health metrics + analyzer
✨ Share    → Beautiful share cards
👤 Profile  → Subscription + settings
```

---

## Desktop Navigation Structure

```
┌─────────────────────────────────────┐
│ 🐾 PetJournal  │  Welcome back, Sarah│
├─────────────────────────────────────┤
│ 📊 Dashboard   │  [Quick Stats Grid] │
│ 📖 Memories    │  [Max Section]      │
│ 🏥 Health      │  [Recent Activity]  │
│ 💬 Ask AI      │                     │
│ ✨ Share       │                     │
│                │                     │
│ Pets           │                     │
│ • 🐕 Max       │                     │
│ • 🐈 Luna      │                     │
│ + Add Pet      │                     │
└─────────────────────────────────────┘
```

---

## Share Card Design (For TikTok/Instagram)

```
┌────────────────────────────────────┐
│                                    │
│           Max ✨                   │
│                                    │
│  "Max played fetch at the park     │
│   this morning. He was so happy!"  │
│                                    │
│  On a crisp December morning,      │
│  Max bounded through the park...   │
│                                    │
│       🐾 PetJournal                │
│                                    │
└────────────────────────────────────┘

Dimensions:
- Instagram Story: 1080x1350px
- TikTok: 1080x1920px
- Twitter/X: 1024x512px

Colors: Warm cream background (#FFFBF7)
Text: Dark warm gray (#2D2620)
Logo: Coral (#D97760)
```

---

## Accessibility

### Color Contrast
- All text on backgrounds: WCAG AA minimum (4.5:1)
- Accent color text must be on light backgrounds only
- Never rely on color alone (use icons + color for meaning)

### Typography
- Minimum font size: 12px
- Line height: 1.5-1.7 for readability
- Maximum line length: 600px

### Interactive Elements
- Minimum touch target: 44x44px (mobile)
- Clear focus states with borders or backgrounds
- Button labels always present (not icon-only)

### Forms
- All inputs have associated labels
- Error messages visible and semantic
- Help text for complex fields
- Placeholder text is hint only, not label

---

## Implementation Notes for Developers

### Mobile App (React Native + Expo)
1. Use consistent spacing system via constants
2. AI narrative boxes are custom components (reuse everywhere)
3. Share card is native-generated image (use react-native-view-shot)
4. Bottom tab navigation via React Navigation
5. Gradient backgrounds: Use `expo-linear-gradient`

### Web App (React + Next.js)
1. CSS variables for theming (already defined above)
2. Use Tailwind OR plain CSS with variables (pick one)
3. AI narrative component: `<AIStory content={text} />`
4. Share card: Generate as canvas image, then display
5. Sidebar: Sticky position, auto-collapse on mobile

### Database Migrations
Fields for AI narratives:
- `memories.ai_narrative` (TEXT)
- `memories.ai_narrative_generated_at` (TIMESTAMP)
- Track token usage for billing

### Image Optimization
- Memory photos: 800px max width (web), WEBP format
- Pet avatars: 200x200px max, circular crop
- Share cards: 1080px base, export as PNG
- Use CDN with image transforms (Cloudinary/AWS)

---

## Color Reference Quick Copy

```
Teal:   #5A9B8F
Coral:  #D97760
Cream:  #FFFBF7
Gray:   #F5F2ED
Border: #EDE6DD
Text:   #2D2620
Muted:  #A89A91
```

---

## Next Steps

1. **Implement Mobile App**: Use these components as a React Native component library
2. **Implement Web Dashboard**: Build Next.js pages with Tailwind or CSS variables
3. **Create Design Tokens**: Export this as a JSON/TS file for developers
4. **Build Component Library**: Create Storybook for all components
5. **Test Accessibility**: Use axe DevTools on both platforms

