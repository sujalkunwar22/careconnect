---
name: Care Connect Nepal
colors:
  surface: '#fff8f7'
  surface-dim: '#f1d3d2'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ef'
  surface-container: '#ffe9e8'
  surface-container-high: '#ffe1e0'
  surface-container-highest: '#f9dcda'
  on-surface: '#271717'
  on-surface-variant: '#5b403f'
  inverse-surface: '#3e2c2b'
  inverse-on-surface: '#ffedeb'
  outline: '#8f6f6e'
  outline-variant: '#e4bebc'
  surface-tint: '#bb152c'
  primary: '#b7102a'
  on-primary: '#ffffff'
  primary-container: '#db313f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b1'
  secondary: '#485f84'
  on-secondary: '#ffffff'
  secondary-container: '#bbd3fd'
  on-secondary-container: '#445a7f'
  tertiary: '#006860'
  on-tertiary: '#ffffff'
  tertiary-container: '#008379'
  on-tertiary-container: '#f3fffc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#b0c7f1'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#30476a'
  tertiary-fixed: '#8cf4e8'
  tertiary-fixed-dim: '#6fd8cc'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#fff8f7'
  on-background: '#271717'
  surface-variant: '#f9dcda'
typography:
  h1:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  quote-accent:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is anchored in the concept of "National Reliability." It targets a dual audience of skilled professionals and local employers, aiming to evoke a sense of security, institutional trust, and cultural pride. The visual style is **Corporate Modern**, characterized by structured layouts, ample whitespace, and high-quality typography. 

To differentiate from global competitors, this design system integrates subtle Nepal-inspired motifs. A recurring geometric "Mountain Peak" line-art motif should be used in headers and card backgrounds to symbolize professional growth and stability. The overall aesthetic is clean and disciplined, ensuring that the critical task of job seeking feels efficient and empowering.

## Colors

The palette is driven by the national identity of Nepal, utilizing **Nepal Red** for primary actions to draw immediate attention. **Deep Navy** serves as the grounding secondary color, providing an institutional weight necessary for a job portal. 

- **Primary (#E63946):** High-priority CTAs and brand markers.
- **Secondary (#1D3557):** Navigation, headers, and footer backgrounds.
- **Accent (#457B9D):** Active states, links, and informational illustrations.
- **Surface:** The background remains a very light grey (#F8F9FA) to reduce eye strain during long browsing sessions, while pure white is reserved for cards and input containers to create depth.

## Typography

The design system employs a three-tier typographic hierarchy. **Poppins** provides a friendly yet geometric structure for all functional headings. **Inter** is utilized for body copy and administrative data due to its exceptional legibility at small sizes. 

For editorial touches, such as success stories or highlighted company values, **Noto Serif** (substituting for Playfair Display as the available refined serif) is used to add a layer of sophistication. All labels and status badges use Inter at a semi-bold weight to ensure clarity in dense information environments.

## Layout & Spacing

The design system follows a **12-column fixed grid** for desktop, centering the content at a maximum width of 1280px. Spacing follows an 8px rhythmic scale to maintain mathematical consistency across all components.

Vertical rhythm is prioritized; job listings and form fields use the `md` (24px) unit for spacing to prevent the interface from feeling cluttered. Content blocks are separated by `lg` (48px) units to provide the "clean" feel requested, ensuring that employers and job seekers can scan information without cognitive overload.

## Elevation & Depth

To maintain a professional and clean aesthetic, the design system avoids heavy, realistic shadows. Depth is instead communicated through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Surface):** The #F8F9FA background.
- **Level 1 (Cards):** Pure white background with a 1px border of #DEE2E6. 
- **Level 2 (Hover/Active):** A very soft, diffused shadow (0px 4px 12px rgba(29, 53, 87, 0.08)) is applied when a user interacts with a job card or button.
- **Level 3 (Modals):** High-contrast overlay with a 15% opacity Deep Navy tint to dim the background.

## Shapes

The design system utilizes **Rounded (level 2)** corners (8px base) to strike a balance between the sharpness of corporate finance and the approachability of a service-oriented portal. 

Buttons, input fields, and status badges all adhere to this 8px radius. Decorative elements, such as the geometric patterns used for avatars, should utilize 16px (rounded-lg) or 24px (rounded-xl) radii to create a distinct visual contrast from functional UI elements.

## Components

### Buttons
- **Primary:** Solid #E63946 with white text. 8px radius.
- **Secondary:** Outlined #1D3557 with 1.5px border.
- **Ghost:** No background, #457B9D text, for low-priority actions like "Cancel."

### KYC Status Badges
Status badges are high-visibility labels with 10% background tints of the status color:
- **Verified:** Forest Green (#2D6A4F) text/border with light green tint. Includes a checkmark icon.
- **Pending:** Saffron Orange (#F4A261) text/border with light orange tint.
- **Unverified:** Deep Navy (#1D3557) at 50% opacity.

### Profile Avatars
In place of letter-blocks, use **Geometric SVG Patterns**. These consist of repeating triangles (mountain motifs) or intersecting circles in varying shades of Sky Blue and Deep Navy. This ensures a consistent, professional appearance even when users haven't uploaded a photo.

### Input Fields
Inputs use a white background with a 1px #DEE2E6 border. On focus, the border transitions to #457B9D (Sky Blue) with a subtle 2px outer glow.

### Job Cards
White containers with a 1px border. The header of the card should feature the "Mountain Peak" geometric pattern as a faint background watermark (3% opacity) to reinforce the brand identity.