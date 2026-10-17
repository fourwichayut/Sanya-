# Apple Minimalist Architecture: Borderless Design System
> **คู่มือและแนวทางการออกแบบ UI สำหรับนำไปปรับใช้กับโปรเจกต์อื่น (Design System Guidelines)**  
> ถอดแบบจากระบบดีไซน์ของ **SANYA Protocol** ที่เน้นความพรีเมียม สะอาดตา เรียบหรู ไร้เส้นกรอบ (Borderless) และมีมิติด้วยแสงเงาอย่างเป็นธรรมชาติในสไตล์ Apple

---

## 1. ปรัชญาการออกแบบหลัก (Core Design Philosophy)

1. **Optical Contrast Over Rigid Lines (แยกมิติด้วยสี ไม่ใช่เส้นตีกรอบ):**
   - **ห้ามใช้เส้นกรอบกับการ์ด (`border-0`):** ตัดปัญหาการ์ดดูแข็ง ทึบ หรือรกสายตา
   - ตัวการ์ดใช้สีขาวบริสุทธิ์ (`#ffffff`) ลอยตัวอยู่บนพื้นหลังสีเทาหม่นซิกเนเจอร์ของ Apple (`#f5f5f7`) เพื่อสร้างการแยกชั้น (Visual Layering) อย่างเป็นธรรมชาติ
2. **Ambient Elevation (มิติเงานุ่มลึก):**
   - ไม่ใช้เงาแข็งหรือเงาดำเข้ม แต่ใช้ **Ambient Shadow** กระจายตัวกว้างและโปร่งแสง เพื่อจำลองแสงไฟในสตูดิโอ
   - มี Hover Effect ยกลอยตัวขึ้นอย่างนุ่มนวลและเงาฟุ้งขึ้นเพื่อตอบสนองต่อผู้ใช้งาน (Tactile Feedback)
3. **Deep Squircle Curvature (ขอบมนลึกระดับเรตินา):**
   - ใช้ความโค้งมนแบบ Squircle ขนาดใหญ่ (`rounded-[24px]` ถึง `rounded-[28px]`) ตามมาตรฐานฮาร์ดแวร์และ iOS ของ Apple
4. **Monochrome Dominance with Soft Semantic Accents:**
   - องค์ประกอบ 90% ใช้เฉดสี ขาว-เทา-ดำ (Monochrome) เพื่อขับเน้นคอนเทนต์ให้โดดเด่น
   - สัญลักษณ์สถานะใช้สีที่นุ่มนวล (Muted Tint) ไม่ฉูดฉาดจนกวนสายตา

---

## 2. โค้ดสีและโทนสี (Color Palette & Tokens)

| Token Name | Hex Code / Tailwind | คำอธิบายการใช้งาน |
| :--- | :--- | :--- |
| **Canvas Background** | `#f5f5f7` (`bg-[#f5f5f7]`) | พื้นหลังหลักของทั้งหน้าจอ (Apple Neutral Light Gray) |
| **Surface Card (Light)** | `#ffffff` (`bg-white`) | พื้นผิวของการ์ดปกติ ป๊อปอัป และโมดอล |
| **Surface Card (Dark)** | `#18181b` (`bg-zinc-900`) | การ์ดไฮไลต์พิเศษ (เช่น Workflow Banner, Hero Steps) |
| **Sub-box Background** | `#f5f5f7` (`bg-[#f5f5f7]`) | กล่องข้อมูลย่อยที่อยู่ภายในการ์ดสีขาว เพื่อสร้างระดับสายตาชั้นที่ 2 |
| **Sub-box Hover** | `hover:bg-zinc-200/70` | สถานะเมื่อนำเมาส์ไปชี้กล่องย่อยที่มีการคลิก |
| **Text Primary** | `#18181b` (`text-zinc-900`) | หัวข้อหลัก, ชื่อหัวเรื่อง (ความหนา `font-extrabold` หรือ `font-black`) |
| **Text Secondary** | `#27272a` (`text-zinc-800`) | เนื้อความสำคัญ, ตัวเลขสรุป |
| **Text Muted** | `#71717a` (`text-zinc-500`) | คำอธิบายย่อย, คำบรรยายประกอบ |
| **Text Subtle/Meta** | `#a1a1aa` (`text-zinc-400`) | วันเวลา, Transaction Hash, รหัสอ้างอิง |
| **Accent Dark (CTAs)** | `#18181b` (`bg-zinc-900`) | ปุ่มดำเนินการหลัก (Primary Action Button) |

### สีสถานะ (Semantic Status Colors - สไตล์ซอฟต์พาสเทล)
- **สำเร็จ / อนุมัติ (Success):** ใช้กล่อง `#f5f5f7` พร้อมไอคอนสี `text-zinc-900` หรือถ้าต้องการสีเขียวให้ใช้ `bg-emerald-50 text-emerald-700`
- **รอดำเนินการ / จับเวลา (Active/Pending):** `bg-zinc-900 text-white` (เพื่อเน้นความเด่น) หรือ `bg-zinc-100 text-zinc-800`
- **เตือน / ขอแก้ไข (Revision/Warning):** `bg-amber-50 text-amber-800`
- **ข้อพิพาท / ผิดพลาด (Danger/Dispute):** `bg-red-50 text-red-700`

---

## 3. กฎความโค้งมนและรูปทรง (Squircle Hierarchy)

โครงสร้างความโค้งมนของขอบมุมต้องสอดรับกันเป็นลำดับชั้น (Nesting Corner Radius):

```
+-------------------------------------------------------------+
| Container / Modal Card: rounded-[28px]                       |
|   +-------------------------------------------------------+ |
|   | Standard Component Card: rounded-[24px]               | |
|   |   +-------------------------------------------------+ | |
|   |   | Sub-box / Information Block: rounded-2xl (16px) | | |
|   |   |   +-------------------------------------------+ | | |
|   |   |   | Badges / Action Buttons: rounded-xl (12px)| | | |
|   |   |   +-------------------------------------------+ | | |
|   |   +-------------------------------------------------+ | |
|   +-------------------------------------------------------+ |
+-------------------------------------------------------------+
```

- **Modals / Hero Containers:** `rounded-[28px]`
- **Main Cards / Section Bento:** `rounded-[24px]` หรือ `rounded-[22px]`
- **Sub-boxes / Nested Groups:** `rounded-2xl`
- **Buttons / Inputs / Badges:** `rounded-xl` หรือ `rounded-full`

---

## 4. แสงเงาและการเคลื่อนไหว (Elevation & Motion)

### กฎสำคัญ: ห้ามใส่เส้นกรอบกับการ์ด (`border-0`)
การสร้างมิติความลึก (Depth) ให้ใช้เงา Ambient Shadow ร่วมกับแอนิเมชั่นดังต่อไปนี้:

### Tailwind Utility คลาสสำหรับการ์ด:
```css
/* Base Card */
border-0 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)]

/* Hover Lift Effect */
transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)]
```

### การ์ดสีเข้ม (Dark Feature Card):
```css
border-0 bg-zinc-900 text-white shadow-2xl
```

### Animation Keyframes (CSS):
```css
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-card-in {
  animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 5. ตัวอย่างโค้ดคอมโพเนนต์พร้อมใช้ (Component Blueprints)

### 1) การ์ดมาตรฐานสีขาวไร้ขอบ (Standard Borderless White Card)
```tsx
<div className="bg-white border-0 rounded-[24px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 flex flex-col justify-between space-y-4 cursor-pointer group">
  <div>
    {/* Card Top: Identifier & Status Pill */}
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-zinc-900">
        ID-2026-001
      </span>
      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-zinc-700">
        กำลังดำเนินการ
      </span>
    </div>

    {/* Title & Description */}
    <h3 className="font-black text-base sm:text-lg text-zinc-900 group-hover:text-zinc-700 transition-colors leading-snug">
      ชื่อโครงการหรือบริการ
    </h3>
    <p className="text-xs text-zinc-500 leading-relaxed mt-1">
      คำอธิบายรายละเอียดกระชับ อ่านง่าย สบายตา
    </p>
  </div>

  {/* Sub-box: ข้อมูลย่อยด้านใน */}
  <div className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-center justify-between text-xs">
    <span className="text-zinc-500">มูลค่างาน</span>
    <span className="font-mono font-bold text-zinc-900">$2,500 USDT</span>
  </div>
</div>
```

---

### 2) การ์ดสีดำพรีเมียม (Dark Contrast Accent Card)
```tsx
<section className="p-8 sm:p-12 rounded-[24px] bg-zinc-900 text-white border-0 shadow-2xl space-y-8">
  <div className="text-center space-y-2">
    <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
      Highlights
    </span>
    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
      ฟีเจอร์เด่นที่ไม่เหมือนใคร
    </h3>
  </div>

  {/* Inner Dark Step Boxes */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="p-5 rounded-2xl bg-zinc-800/80 border-0 flex flex-col justify-between space-y-3">
      <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 font-bold text-xs flex items-center justify-center">
        1
      </div>
      <h4 className="font-bold text-sm text-white">รวดเร็ว & อัตโนมัติ</h4>
      <p className="text-xs text-zinc-400 leading-relaxed">
        ทำงานทันทีไร้ตัวกลางคอยกวนใจ
      </p>
    </div>
  </div>
</section>
```

---

### 3) กล่องย่อยและกล่องคู่สัญญา (Information Sub-box)
```tsx
<div className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-center space-x-2.5">
  <img
    src="/avatar.jpg"
    alt="User"
    className="w-9 h-9 rounded-full object-cover shrink-0"
  />
  <div className="min-w-0">
    <div className="text-[10px] text-zinc-500 font-medium">Party A (ผู้ว่าจ้าง)</div>
    <div className="text-xs font-bold text-zinc-900 truncate">สมชาย พงษ์ไพศาล</div>
    <div className="text-[10px] font-mono text-zinc-400 truncate">0x71C...3a9F</div>
  </div>
</div>
```

---

### 4) ปุ่มกด (Action Buttons)

```tsx
{/* 1. ปุ่มหลักสีดำพรีเมียม (Primary Anchor CTA) */}
<button className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer">
  <span>ยืนยันการทำรายการ</span>
</button>

{/* 2. ปุ่มรองสีขาวลอยตัว (Secondary Elevated Button) */}
<button className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs shadow-sm transition-all flex items-center space-x-2 cursor-pointer">
  <span>ดูรายละเอียดเพิ่มเติม</span>
</button>

{/* 3. ปุ่มกลมกลืน (Ghost/Subtle Button) */}
<button className="px-3.5 py-2 rounded-xl bg-[#f5f5f7] hover:bg-zinc-200/80 text-zinc-800 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer">
  <span>ตั้งค่า</span>
</button>
```

---

### 5) แถบนำทางโปร่งแสง (Frosted Glass Navbar)
```tsx
<header className="sticky top-0 z-40 bg-[#f5f5f7]/85 backdrop-blur-md border-b border-black/[0.05] shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center space-x-2">
      <span className="font-black text-base tracking-tight text-zinc-900">APP NAME</span>
    </div>

    {/* Segmented Control Pills */}
    <nav className="flex items-center space-x-1 p-1 bg-black/[0.03] rounded-xl">
      <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-900 bg-white shadow-2xs">
        หน้าหลัก
      </button>
      <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900">
        รายการ
      </button>
    </nav>
  </div>
</header>
```

---

## 6. ข้อควรทำ และ ข้อห้ามทำ (Do's & Don'ts Checklist)

### ❌ ข้อห้ามทำ (Don'ts)
- **อย่าใส่เส้นกรอบสีเทาเข้มหรือทึบให้กับการ์ด (`border`, `border-zinc-200`, `ring-1`):** การมีเส้นกรอบขัดขวางสายตาและทำลายความรู้สึก "ลอยตัว" แบบธรรมชาติ
- **อย่าใช้พื้นหลังสีขาว (`bg-white`) รองรับการ์ดสีขาว (`bg-white`):** เพราะจะทำให้การ์ดกลืนไปกับพื้นหลัง มองไม่ออกว่าตรงไหนคือขอบเขตของการ์ด
- **อย่าใช้เงาสีดำทึบเข้ม (`shadow-zinc-900`):** เงาต้องฟุ้งและบางเบาด้วยค่า Alpha ต่ำ (`rgba(0,0,0,0.06)`)
- **อย่าใส่สีสดฉูดฉาดแบบเรโทร:** เลี่ยงสีฟ้าสด แดงสด เขียวสด แนะนำให้ใช้สีเข้มคมชัดคู่กับสีเทาหม่น

### ✅ ข้อควรทำ (Do's)
- **ใช้พื้นหลังหน้าจอเป็น `#f5f5f7` เสมอ:** เพื่อสร้างคอนทราสต์ที่นุ่มนวลกับการ์ดสีขาวบริสุทธิ์
- **จัดช่องว่าง (Spacing) ให้อิ่มตัวและกว้างขวาง:** ปล่อยระยะ Padding ของการ์ดอย่างน้อย `p-6` ถึง `p-8` และ Gap อย่างน้อย `gap-5` ถึง `gap-6` เพื่อให้สายตาได้พัก
- **ใช้ Squircle ขนาดใหญ่:** ขอบมุมมนระดับ `rounded-[22px]` ขึ้นไป เพื่อให้เข้ากับสไตล์มินิมอลโมเดิร์น
- **ใช้ฟอนต์ Mono สำหรับข้อมูลที่เป็นรหัส:** เช่น รหัสธุรกรรม, จำนวนเงิน, เวลา (`font-mono`)
