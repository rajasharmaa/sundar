# Account Dashboard Components

## Folder Structure
```
src/
├── components/
│   ├── account/
│   │   ├── NavigationSidebar.tsx    # Reusable sidebar navigation component
│   │   ├── ProfileCard.tsx          # Reusable profile card component
│   │   └── StatsCard.tsx            # Reusable statistics card component
│   └── ...
├── pages/
│   └── Account.tsx                  # Main account dashboard page
└── ...
```

## Components Overview

### 1. NavigationSidebar.tsx
A reusable sidebar component that includes:
- User profile section with avatar, name, email, and role badge
- Navigation tabs with icons, labels, descriptions, and badges
- Edit profile button
- Smooth animations and hover effects

**Props:**
```typescript
interface NavigationSidebarProps {
  activeTab: string;
  navigationTabs: NavItem[];
  onTabChange: (tabId: string) => void;
  userProfile: {
    name: string;
    email: string;
    role: string;
  };
  onEditProfile?: () => void;
  onUploadPhoto?: () => void;
}
```

### 2. ProfileCard.tsx
A reusable profile card component that displays:
- User avatar with upload option
- Name, email, and role information
- Role badge with appropriate coloring
- Edit profile button

**Props:**
```typescript
interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
  onEditProfile?: () => void;
  onUploadPhoto?: () => void;
}
```

### 3. StatsCard.tsx
A reusable statistics card component that displays:
- Icon with colored background
- Statistic value and title
- Optional progress bar
- Hover animations

**Props:**
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  progress?: number;
  index?: number;
}
```

## Features Implemented

### 🎨 Modern SaaS-Style UI
- Clean, professional design with rounded corners and subtle shadows
- Consistent color palette using blues and indigos
- Smooth transitions and micro-interactions
- Responsive grid layouts

### 📱 Mobile-First Responsive Design
- Adapts to all screen sizes (mobile, tablet, desktop)
- Touch-friendly interface elements
- Collapsible navigation on mobile
- Proper spacing and typography scaling

### 🚀 Performance Optimizations
- Code splitting with lazy-loaded components
- Framer Motion animations for smooth transitions
- Efficient rendering with React.memo where appropriate
- Optimized bundle sizes

### 🔧 Developer Experience
- TypeScript type safety
- Reusable, composable components
- Clear component interfaces
- Well-documented props

### 🎯 User Experience Enhancements
- Profile completion progress indicator
- Wishlist and inquiry counters
- Intuitive navigation with active state indicators
- Loading skeletons for better perceived performance
- Empty states with helpful CTAs

## Color Scheme
- Primary: Blue/Indigo gradient (#3B82F6 → #6366F1)
- Success: Emerald/Green (#10B981 → #16A34A)
- Warning: Amber/Yellow (#F59E0B → #D97706)
- Danger: Rose/Pink (#F43F5E → #E11D48)
- Info: Cyan/Teal (#06B6D4 → #0891B2)

## Typography
- Headings: Inter Bold (24px-36px)
- Body: Inter Regular/Medium (14px-16px)
- Labels: Inter Semibold (12px-14px)

## Spacing System
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Shadow System
- sm: subtle elevation
- md: medium elevation
- lg: prominent elevation
- xl: maximum elevation