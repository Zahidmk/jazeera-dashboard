# ImageCard Component Guide

## Overview
The `ImageCard` component allows you to create visually engaging cards with images, icons, badges, and status indicators - just like the Swift Track "Total Trips" card design.

## Component Features

### ✨ Key Features
- **Title & Subtitle**: Clear hierarchy for card information
- **Large Value Display**: Prominent metric display
- **Description Text**: Additional context
- **Status Badges**: Color-coded badges (success, warning, info, default)
- **Icons**: Support for Lucide icons
- **Images**: Support for actual images (right-aligned or background)
- **Three-dot Menu**: Action menu in top-right
- **Hover Effects**: Smooth shadow transitions

## Usage Examples

### Basic Card with Badge
```typescript
<ImageCard
  title="Total Trips"
  subtitle="Vehicles Operating on The Road"
  value={24}
  description="Hired Transportation: 5 Trips"
  badge={{
    text: "On Route",
    variant: "info"
  }}
  icon={<Navigation className="h-4 w-4" />}
/>
```

### Card with Image (Right-aligned)
```typescript
<ImageCard
  title="Total Trips"
  subtitle="Vehicles Operating on The Road"
  value={24}
  description="Hired Transportation: 5 Trips"
  image="/images/truck.png"  // Add your image path here
  imagePosition="right"
  badge={{
    text: "On Route",
    variant: "info"
  }}
  icon={<Navigation className="h-4 w-4" />}
/>
```

### Card with Background Image
```typescript
<ImageCard
  title="Fleet Status"
  subtitle="Van Operations"
  value="4/6"
  description="Active Vehicles on Road"
  image="/images/van-background.png"
  imagePosition="background"  // Image appears as subtle background
  badge={{
    text: "Operational",
    variant: "success"
  }}
/>
```

## Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Main title of the card |
| `subtitle` | string (optional) | Subtitle text below title |
| `value` | string \| number | Large prominent value |
| `description` | string (optional) | Description text below value |
| `image` | string (optional) | Path to image file |
| `imagePosition` | 'right' \| 'background' | Image placement |
| `icon` | ReactNode (optional) | Icon component (e.g., Lucide icon) |
| `badge` | object (optional) | Badge configuration |
| `badge.text` | string | Badge text |
| `badge.variant` | 'success' \| 'warning' \| 'info' \| 'default' | Badge color |
| `className` | string (optional) | Additional CSS classes |

## Badge Variants

### Success (Green)
```typescript
badge={{ text: "Operational", variant: "success" }}
```
- Background: Light green (#D1FAE5)
- Text: Dark green (#065F46)
- Use for: Active status, completed tasks, success states

### Warning (Orange)
```typescript
badge={{ text: "In Progress", variant: "warning" }}
```
- Background: Light orange (#FEF3C7)
- Text: Dark orange (#92400E)
- Use for: Pending items, warnings, attention needed

### Info (Blue)
```typescript
badge={{ text: "On Route", variant: "info" }}
```
- Background: Light blue (#DBEAFE)
- Text: Dark blue (#1E40AF)
- Use for: Information, in-transit, active processes

### Default (Gray)
```typescript
badge={{ text: "Inactive", variant: "default" }}
```
- Background: Light gray (#F3F4F6)
- Text: Dark gray (#374151)
- Use for: Neutral states, inactive items

## Adding Images to Your Cards

### Step 1: Add Images to Public Folder
```
public/
  images/
    truck.png
    van.png
    delivery.png
    sales-chart.png
```

### Step 2: Use Images in Cards
```typescript
<ImageCard
  title="Total Trips"
  value={24}
  image="/images/truck.png"
  imagePosition="right"
  badge={{ text: "On Route", variant: "info" }}
/>
```

### Step 3: Image Recommendations
- **Format**: PNG with transparent background works best
- **Size**: 512x512px or similar (will be auto-scaled)
- **Style**: Simple, clean illustrations or icons
- **Color**: Match your brand colors (green, blue, etc.)

## Example Implementations

### 1. Trips Card (Like Swift Track)
```typescript
<ImageCard
  title="Total Trips"
  subtitle="Vehicles Operating on The Road"
  value={24}
  description="Hired Transportation: 5 Trips"
  image="/images/truck-illustration.png"
  imagePosition="right"
  badge={{
    text: "On Route",
    variant: "info"
  }}
  icon={<Navigation className="h-4 w-4" />}
/>
```

### 2. Sales Card
```typescript
<ImageCard
  title="Today's Sales"
  subtitle="Revenue Generated"
  value="SAR 45,230"
  description="Target: SAR 50,000"
  image="/images/sales-chart.png"
  imagePosition="background"
  badge={{
    text: "+12% Growth",
    variant: "success"
  }}
  icon={<DollarSign className="h-4 w-4" />}
/>
```

### 3. Delivery Status Card
```typescript
<ImageCard
  title="Active Deliveries"
  subtitle="Orders in Transit"
  value={18}
  description="Completed Today: 42 Orders"
  image="/images/delivery-van.png"
  imagePosition="right"
  badge={{
    text: "In Progress",
    variant: "warning"
  }}
  icon={<Package className="h-4 w-4" />}
/>
```

## Layout Patterns

### 3-Column Grid (Recommended)
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  <ImageCard {...} />
  <ImageCard {...} />
  <ImageCard {...} />
</div>
```

### 2-Column Grid
```typescript
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
  <ImageCard {...} />
  <ImageCard {...} />
</div>
```

### 4-Column Grid
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <ImageCard {...} />
  <ImageCard {...} />
  <ImageCard {...} />
  <ImageCard {...} />
</div>
```

## Finding/Creating Images

### Option 1: Free Illustration Sites
- **unDraw**: https://undraw.co/illustrations (customizable colors)
- **Storyset**: https://storyset.com/ (animated illustrations)
- **Freepik**: https://www.freepik.com/ (free with attribution)
- **Flaticon**: https://www.flaticon.com/ (simple icons)

### Option 2: AI Image Generation
- Use tools like DALL-E, Midjourney, or Stable Diffusion
- Prompt example: "Simple flat illustration of a delivery truck, minimalist style, white background, professional"

### Option 3: Icon Libraries
- **Lucide Icons**: Already installed in your project
- **Heroicons**: https://heroicons.com/
- **Phosphor Icons**: https://phosphoricons.com/

## Customization

### Custom Colors
Edit the badge colors in `ImageCard.tsx`:
```typescript
const badgeColors = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-orange-100 text-orange-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
  // Add custom variants:
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
}
```

### Custom Styling
```typescript
<ImageCard
  {...props}
  className="bg-gradient-to-br from-blue-50 to-purple-50"
/>
```

## Tips for Best Results

1. **Keep it Simple**: Don't overcrowd cards with too much information
2. **Consistent Style**: Use similar image styles across all cards
3. **Readable Text**: Ensure good contrast between text and background
4. **Meaningful Badges**: Use badges to show status, not decoration
5. **Responsive Design**: Test on mobile, tablet, and desktop
6. **Loading States**: Consider adding skeleton loaders for images

## Current Dashboard Implementation

Your dashboard currently has 3 ImageCards:
1. **Total Trips** - Blue "On Route" badge
2. **Active Deliveries** - Orange "In Progress" badge
3. **Fleet Status** - Green "Operational" badge

To add images to these cards, simply:
1. Add your images to `public/images/`
2. Update the cards in `app/dashboard/page.tsx`
3. Add the `image="/images/your-image.png"` prop

---

**Need Help?** Check the component file at `components/ImageCard.tsx` for the full implementation details.
