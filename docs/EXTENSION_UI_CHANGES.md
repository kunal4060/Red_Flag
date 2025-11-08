# Extension UI Changes - Profile & Token System

## Visual Changes Overview

### Before
```
┌─────────────────────────────────┐
│ 🛡️ RedFlag        📤           │  ← Share icon (removed)
│ AI-Powered Security Analysis    │
└─────────────────────────────────┘
```

### After
```
┌─────────────────────────────────┐
│ 🛡️ RedFlag         👤          │  ← Profile circle (NEW)
│ AI-Powered Security Analysis    │
└─────────────────────────────────┘
```

## Profile Circle States

### 1. Not Logged In
```
┌─────────────────────────────────┐
│ Header                          │
│ 🛡️ RedFlag         ⭕          │  ← Gray circle with user icon
└─────────────────────────────────┘
```

### 2. Logged In
```
┌─────────────────────────────────┐
│ Header                          │
│ 🛡️ RedFlag         JD          │  ← Red gradient circle with initials
└─────────────────────────────────┘
```

## Profile Dropdown - Not Logged In

When user clicks profile circle (not logged in):

```
┌─────────────────────────────────┐
│ 🛡️ RedFlag         👤          │
│ AI-Powered Security Analysis    │
└─────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │   👤 (large icon)     │
        │                       │
        │   Not Logged In       │
        │ Log in to start using │
        │   the extension       │
        │                       │
        │  ┌─────────────────┐  │
        │  │  🔓  Login      │  │
        │  └─────────────────┘  │
        └──────────────────────┘
```

## Profile Dropdown - Logged In

When user clicks profile circle (logged in):

```
┌─────────────────────────────────┐
│ 🛡️ RedFlag         JD          │
│ AI-Powered Security Analysis    │
└─────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  JD  John Doe            │
        │      john@example.com    │
        │ ─────────────────────── │
        │  Current Plan            │
        │  Free          [Limited] │
        │ ─────────────────────── │
        │  Scans Used              │
        │  3 / 10                  │
        │  ████░░░░░░░░  30%      │ ← Progress bar
        │ ─────────────────────── │
        │  ┌────────────────────┐  │
        │  │  🚪  Logout        │  │
        │  └────────────────────┘  │
        └──────────────────────────┘
```

## Login Modal

When user clicks "Login" button:

```
┌─────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓ Dark Overlay ▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓                                 ▓    │
│  ▓  ┌───────────────────────────┐  ▓   │
│  ▓  │       🛡️                  │  ▓   │
│  ▓  │   Login to RedFlag        │  ▓   │
│  ▓  │ Access your account to... │  ▓   │
│  ▓  │                           │  ▓   │
│  ▓  │  Email                    │  ▓   │
│  ▓  │  ┌─────────────────────┐  │  ▓   │
│  ▓  │  │ your@email.com      │  │  ▓   │
│  ▓  │  └─────────────────────┘  │  ▓   │
│  ▓  │                           │  ▓   │
│  ▓  │  Password                 │  ▓   │
│  ▓  │  ┌─────────────────────┐  │  ▓   │
│  ▓  │  │ ••••••••            │  │  ▓   │
│  ▓  │  └─────────────────────┘  │  ▓   │
│  ▓  │                           │  ▓   │
│  ▓  │  ┌────────┐ ┌─────────┐  │  ▓   │
│  ▓  │  │ Cancel │ │  Login  │  │  ▓   │
│  ▓  │  └────────┘ └─────────┘  │  ▓   │
│  ▓  └───────────────────────────┘  ▓   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────────────┘
```

## Token Usage Progress Bar

### Visual Indicators

**Low Usage (0-30%):**
```
┌──────────────────────────┐
│  Scans Used      2 / 10  │
│  ███░░░░░░░░░░░░  20%   │ ← Green-ish tint
└──────────────────────────┘
```

**Medium Usage (30-70%):**
```
┌──────────────────────────┐
│  Scans Used      5 / 10  │
│  ███████░░░░░░░░  50%   │ ← Orange-ish tint
└──────────────────────────┘
```

**High Usage (70-100%):**
```
┌──────────────────────────┐
│  Scans Used      9 / 10  │
│  █████████████░░  90%   │ ← Red tint
└──────────────────────────┘
```

**Limit Reached:**
```
┌──────────────────────────┐
│  Scans Used     10 / 10  │
│  ██████████████  100%   │ ← Bright red
└──────────────────────────┘
```

**Unlimited (Enterprise):**
```
┌──────────────────────────┐
│  Scans Used      25 / ∞  │
│  (No progress bar)       │ ← No limit
└──────────────────────────┘
```

## Error States

### 1. Not Authenticated Error

When user tries to scan without logging in:

```
┌─────────────────────────────────┐
│  Status:                        │
│  ❌ Please log in to use this   │
│     feature                     │
│                                 │
│  [Login modal appears]          │
└─────────────────────────────────┘
```

### 2. Token Limit Exceeded

When user has no tokens left:

```
┌─────────────────────────────────┐
│  Status:                        │
│  ❌ Token limit exceeded.       │
│     Please upgrade your plan.   │
│                                 │
│  Profile shows: 10/10 ████████  │
└─────────────────────────────────┘
```

## Plan Badges

Different visual indicators for plans:

**Free Plan:**
```
┌──────────────────┐
│  Free   [Limited]│ ← Red badge
└──────────────────┘
```

**Basic Plan:**
```
┌──────────────────┐
│  Basic  [Premium]│ ← Blue badge
└──────────────────┘
```

**Premium Plan:**
```
┌──────────────────┐
│  Premium [Premium]│ ← Purple badge
└──────────────────┘
```

**Enterprise Plan:**
```
┌──────────────────────┐
│  Enterprise [Unlimited]│ ← Gold badge
└──────────────────────┘
```

## Color Scheme

### Profile Circle
- **Logged Out:** Gray background (#6B7280)
- **Logged In:** Red gradient (from-red-500 to-red-700)

### Dropdown
- **Background:** Dark neutral (#171717)
- **Border:** Red with opacity (#EF4444 30%)
- **Text:** White for primary, Gray for secondary

### Progress Bar
- **Track:** Dark gray (#262626)
- **Fill:** Red gradient (from-red-500 to-red-700)

### Buttons
- **Login:** Red gradient with white text
- **Logout:** Red semi-transparent with red text
- **Cancel:** Gray with white text

## Interactive States

### Hover Effects
```
Profile Circle:
  Normal:  scale(1.0)
  Hover:   scale(1.1)  ← Grows 10%

Login Button:
  Normal:  from-red-500 to-red-700
  Hover:   from-red-600 to-red-800  ← Darker

Logout Button:
  Normal:  bg-red-500/20
  Hover:   bg-red-500/30  ← More opacity
```

### Active States
```
Dropdown:
  Closed: hidden
  Open:   animate-fadeIn  ← Smooth fade-in

Login Modal:
  Hidden: display: none
  Active: fixed overlay with backdrop blur
```

## Responsive Design

The extension popup is fixed at:
- **Width:** 380px
- **Min Height:** 500px
- **Max Height:** Adjusts to content

Elements are responsive within this container:
- Profile circle: Fixed 36x36px
- Dropdown: 288px wide (fits in popup)
- Progress bar: Full width of container
- Buttons: Full width

## Accessibility

- **Icons:** All icons have descriptive labels
- **Colors:** High contrast ratios for readability
- **Focus:** Keyboard navigation supported
- **Errors:** Clear error messages in plain language
- **Loading:** Spinner indicates processing

## Animation Details

### Smooth Transitions
```css
Profile Circle:
  transition: transform 0.2s

Buttons:
  transition: all 0.2s

Progress Bar:
  transition: width 0.3s
```

### Animations
```css
Dropdown:
  animation: fadeIn 0.2s

Spinner:
  animation: spin infinite
```

## User Flow Diagram

```
Extension Opened
      ↓
Check if logged in?
   ↙      ↘
 NO       YES
  ↓        ↓
Show      Show
Login     Profile
Button    with
  ↓       tokens
Login      ↓
  ↓      Perform
Success   Scan
  ↓        ↓
Show    Consume
Profile  Token
  ↓        ↓
Tokens   Update
0/10     Display
         3/10
           ↓
       Limit?
      ↙     ↘
    NO      YES
     ↓       ↓
  Continue  Show
   Scan     Error
```

## Summary of Changes

1. **Removed:** Share icon (FaShareFromSquare)
2. **Added:** Profile circle with user icon (FaUser)
3. **Added:** Profile dropdown with user info
4. **Added:** Login modal
5. **Added:** Token usage display with progress bar
6. **Added:** Plan information display
7. **Added:** Logout functionality
8. **Added:** Authentication state management
9. **Added:** Error handling for auth and tokens
10. **Added:** Visual feedback for all states

All changes maintain the existing RedFlag color scheme (red, black, neutral grays) and design language while adding comprehensive user management functionality.
