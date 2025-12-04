Below is a **super-detailed, front-end-focused specification** for the **Tasks Panel** and **Task Detail Panel** of a TickTick-style app.
This is written specifically for front-end engineers, UI designers, and component architects.

---

# ✅ **1. TASKS PANEL — SUPER DETAILED UI SPEC**

This panel is the center of the app, where users see and manage their tasks.
TickTick has a very refined structure, so the replica should include the same interaction patterns, spacing, and micro-behaviors.

---

# **1.1 Layout Structure**

```
+--------------------------------------------------------------+
| [Page Title]                    [Sort/Filter]                |
+--------------------------------------------------------------+
|  [Task Item]                                                |
|  [Task Item]                                                |
|  [Task Item]                                                |
|  ...                                                        |
+--------------------------------------------------------------+
|  [+ Add Task Input]                                         |
+--------------------------------------------------------------+
```

### **Width**

* Fixed layout max-width around **760px** inside the main content area.
* Centered with padding **px-6** or **px-8**.

### **Sections**

* Title row
* Tasks list
* Add-task composer

---

# **1.2 Page Title Row**

### **Elements**

* **Page Title**

  * Typography: `text-xl font-semibold`
  * Dynamic (e.g., Today, Inbox, Next 7 Days)
  * Left-aligned at top.

* **Sort/Filter Button Group**

  * Icons: Sort (↑↓), Filter (funnel)
  * Style:

    * `rounded-lg hover:bg-gray-100 p-2 transition`
  * Right-aligned.

### **Behaviors**

* Sticky when scrolling down tasks.
* On hover: show tooltip (“Sort”, “Filter”).
* Filter shows active-state highlight (e.g., `bg-blue-50 text-blue-600`).

---

# **1.3 Task List (Core List Component)**

### **1.3.1 Container**

* Each task is a row in a **virtualized list** (optional).
* List spacing: `space-y-1.5`
* Padding: `py-2`

---

# **1.3.2 Task Item UI Structure**

```
+------------------------------------------------------------+
|  [Checkbox]  [Task Title + Metadata]           [Actions]    |
+------------------------------------------------------------+
```

### **Main Task Item**

* Height: **~44px**
* Padding: `py-2 px-3`
* Border radius: `rounded-xl`
* Hover: `hover:bg-gray-50`
* Selected state (when opening detail panel): `bg-gray-100`

### **Elements**

### ✔ **Checkbox**

* Custom circle checkbox (TickTick-style)
* 20×20px
* Tailwind:

  * `w-5 h-5 rounded-full border-[2px] border-gray-300`
  * *Checked state:*

    * `bg-blue-500 border-blue-500`
  * *Animated checkmark (SVG)* with fade.

### 📝 **Task Title**

* Typography:

  * `text-[15px] font-medium text-gray-800`
* Truncation:

  * `line-clamp-1`

### 🏷️ **Metadata Row (Tag + Due Date + Priority)**

* Displayed under title when available.
* Layout:

  * `flex items-center gap-2 mt-0.5`

#### Metadata styles:

* **Due date bubble**

  * `text-xs px-1.5 py-0.5 rounded-md`
  * Overdue: `bg-red-50 text-red-600`
  * Today: `bg-blue-50 text-blue-600`
  * Other: `text-gray-500`

* **Tag**

  * `bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-md`

* **Priority dot**

  * Small colored dot:

    * High: Red
    * Medium: Orange
    * Low: Blue
  * `w-2 h-2 rounded-full`

### ⋯ **Actions (Right side)**

Hidden until hover.

Buttons:

* ⭐ star
* ⏰ reminder
* 🗓 recurring
* ✏️ quick edit
* ⋮ kebab

Style:

```
opacity-0 group-hover:opacity-100 transition
p-1 rounded-md hover:bg-gray-200
```

---

# **1.4 Add Task Input (Inline Composer)**

```
+------------------------------------------------------------+
| [+]  "Add Task" (placeholder)                               |
+------------------------------------------------------------+
```

### **Default State**

* Height: ~44px
* Border: `border border-gray-200`
* Rounded: `rounded-xl`
* Padding: `px-3`
* Text color: `text-gray-500`
* Placeholder: "Add Task"

### **On Focus**

Expands into multi-line composer:

```
+-------------------------------------------------------------+
| [Text Input (multi-line)]                                   |
|                                                             |
| [Due Date] [Priority] [Tag] [Cancel] [Add]                  |
+-------------------------------------------------------------+
```

#### Expanded form:

* Background: `bg-white shadow-sm`
* Multi-line textarea: `min-h-[70px]`
* Button strip:

  * Icons styled as ghost buttons.

### **Micro-interactions**

* Press **Enter** → submit task
* Press **Shift+Enter** → newline
* Press **Esc** → cancel

---

# 🎯 **2. TASK DETAIL PANEL — SUPER DETAILED UI SPEC**

This is a slide-over panel on the right side.

---

# **2.1 Layout Structure**

```
+-----------------------------------------------+
| [Close Button]                                |
+-----------------------------------------------+
| [Task Title (Editable)]                       |
| [Description (Textarea)]                      |
|                                               |
|  ----- Divider -----                          |
|                                               |
| [Due Date]                                    |
| [Repeat]                                      |
| [Reminder]                                    |
| [Tags]                                        |
| [Priority]                                    |
| [Checklist]                                   |
|                                               |
| ----- Divider -----                           |
| [Delete Button]                               |
+-----------------------------------------------+
```

### **Dimensions**

* Width: **400–480px**
* Full-height slide-over (right side)
* Padding: `p-6`
* Background: `bg-white`
* Border-left: `border-l border-gray-200`

---

# **2.2 Task Title (Large Editable Field)**

### Default

* `text-xl font-semibold leading-tight`
* Click to edit
* Auto-focus

### Editing State

* Convert to `<textarea>` with auto-resize
* Style: `border-b border-gray-300 focus:border-blue-500 pb-1`

---

# **2.3 Description Field**

* Multi-line rich-text-like but simple
* Placeholder: “Add description…”
* Supports:

  * Bullets
  * Line breaks
* Tailwind:

  * `text-sm text-gray-700`
  * `mt-3 mb-2`
  * `min-h-[120px]`

Autosave on blur.

---

# **2.4 Property Rows (Reusable Component)**

Each property (date, priority, etc.) follows the same row pattern:

```
[Icon] [Label]                           [Selected Value or Button]
```

### Style

* `flex items-center justify-between py-3 cursor-pointer`
* Hover:

  * `hover:bg-gray-50 rounded-lg px-2`

### List of Properties

1. **Due Date**
2. **Repeat**
3. **Reminder**
4. **Tags**
5. **Priority**
6. **Checklist (subtasks)**

### Value presentation

* Gray if empty
* Blue if active
* Overdue → red highlight

---

# **2.5 Popovers & Selectors**

Each property opens a TickTick-style popover:

### Examples:

### **Due Date Popover**

* Calendar with:

  * Today
  * Tomorrow
  * Next Week
* Tailwind:

  * Shadow: `shadow-xl`
  * Rounded: `rounded-xl`
  * Padding: `p-4`

### **Repeat Selector**

* Daily / Weekly / Monthly / Advanced

### **Reminder**

* “Scheduled time”, “X minutes before”, “Custom”

---

# **2.6 Checklist (Subtasks)**

```
[ ] subtask 1
[ ] subtask 2
+ Add Subtask
```

### Subtask styles:

* `pl-6 mt-1`
* Checkbox shared with task item checkbox style
* Draggable (optional)

---

# **2.7 Delete Button**

* Placed at bottom
* `text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm`
* Icon: trash

---

# **2.8 Micro-interactions & animations**

### Detail Panel Slide-in

```
translate-x-full → translate-x-0
transition-transform duration-200
```

### Hover effects

* Soft background highlight
* Slight scale + fade for icons

### Checkbox animation

* Tick stroke draws itself (like TickTick)

---

# 🎨 **3. CENTRALIZED CSS / TAILWIND TOKENS**

### Colors

```
--color-primary: #3b82f6;      # blue-500
--color-primary-light: #dbeafe; # blue-100
--color-text-main: #1f2937;     # gray-800
--color-text-dim: #6b7280;      # gray-500
--color-bg-hover: #f9fafb;      # gray-50
--color-border: #e5e7eb;        # gray-200
```

### Spacing

```
--space-xxs: 2px
--space-xs: 4px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 24px
```

### Radii

```
--radius-sm: 6px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
```

### Shadows

```
--shadow-soft: 0 1px 3px rgba(0,0,0,0.06)
--shadow-medium: 0 4px 8px rgba(0,0,0,0.1)
```

### Typography

```
--font-sm: 13px
--font-md: 15px
--font-lg: 18px
--font-xl: 22px
```

---


    