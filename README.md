# SANYA Protocol — Smart Agreement & Milestone Escrow Hub

**ระบบร่างสัญญาจ้างงานอัจฉริยะ ค้ำประกันเงิน Escrow และกำกับดูแลคู่สัญญาอย่างเป็นธรรม**

แพลตฟอร์มค้ำประกันข้อตกลงและควบคุมการส่งมอบงานระหว่าง **ผู้ว่าจ้าง (Client)** และ **ผู้รับจ้าง (Freelancer)** ด้วย Smart Contract บนบล็อกเชน ป้องกันการเบี้ยวเงิน ป้องกันการทิ้งงาน พร้อมระบบตรวจรับอัตโนมัติ (Anti-Ghosting Review Window) และสถาบันคนกลางระงับข้อพิพาท (Arbitration DAO) ตามข้อกำหนดใน [Idea.md](./Idea.md)

> **สถานะปัจจุบัน:** Sandbox เดิมยังเก็บข้อมูลในเบราว์เซอร์ ส่วนโค้ด Testnet เพิ่มสัญญา Escrow สำหรับ tUSD, ERC-2771 relayer และค่าบริการคงที่ 1 SYA ต่อธุรกรรมที่ relayer ส่งสำเร็จแล้ว ต้อง deploy และตั้งค่า Testnet addresses ก่อนใช้งาน ไม่มีการ deploy อัตโนมัติ และยังไม่เหมาะกับเงินจริงหรือ Mainnet

---

## 🌟 ฟีเจอร์จำลองของระบบ (Sandbox Features)

### 1. ระบบสัญญาจ้างงานและแบ่งจ่ายตามงวด (Freelance & Milestone Escrow)
- **Escrow Vault Lock:** ผู้ว่าจ้างโอนเงินค่าจ้างทั้งหมดมาล็อกไว้ใน Smart Contract ก่อนเริ่มงาน มั่นใจได้ทั้งสองฝ่ายว่ามีเงินจ่ายจริงและเงินไม่สูญหาย
- **Milestone Submission:** ผู้รับจ้างส่งมอบงานตามงวด พร้อมแนบหลักฐาน (URL ชิ้นงาน, Commit หรือ IPFS Hash)
- **Anti-Ghosting Review Window (5 วัน):**
  - ผู้ว่าจ้างตรวจรับผ่าน (`Approve`) -> ปลดล็อกเงินค่างวดเข้ากระเป๋าผู้รับจ้างทันที
  - ผู้ว่าจ้างขอแก้ไข (`Request Revision`) -> หยุดเวลานับถอยหลัง หักโควตาแก้ เพื่อให้ผู้รับจ้างปรับปรุง
  - หากผู้ว่าจ้างเงียบหายเกินกำหนดเวลา -> สัญญาถือว่าผ่านและ **Auto-Approve โอนเงินให้ผู้รับจ้างอัตโนมัติ**
- **On-chain Tip:** ผู้ว่าจ้างสามารถส่งมอบทิปโบนัส On-chain ให้ผู้รับจ้างได้ทันทีหากผลงานดีเกินคาด
- **Arbitration Resolution:** หากมีความขัดแย้ง สามารถเปิดข้อพิพาทเพื่อให้คนกลาง (Arbitrator) เข้ามาตรวจสอบหลักฐานและชี้ขาดการคืนเงินหรือปลดล็อกเงิน

---

### 2. สถาปัตยกรรม Web 2.5 (Friendly Web2 + Trustless Web3)
- **Web2 Standard Login:** ล็อกอินเข้าใช้งานด้วย Username & Password ปกติ
- **MetaMask + BNB Testnet:** ขอสิทธิ์อ่านบัญชี MetaMask แล้วขอเพิ่ม/สลับเครือข่ายไป BNB Testnet พร้อมตรวจ Chain ID และอ่านยอด tBNB ผ่าน Wallet Provider บันทึก Address ให้บัญชีผู้ใช้เมื่อเชื่อมสำเร็จ การบันทึกนี้ยังไม่มีการลงนามพิสูจน์ตัวตนกับ backend
- **Public Contract Registry with Financial Privacy:** ผู้เยี่ยมชมทั่วไปสามารถตรวจสอบรายการสัญญาในระบบได้เพื่อความโปร่งใส (เห็นชื่อสัญญา, คู่สัญญา, สถานะ) แต่ระบบจะ **ซ่อนตัวเลขมูลค่าเงินทั้งหมด** เพื่อรักษาความเป็นส่วนตัวของคู่สัญญา

---

### 3. เครื่องมือสนับสนุนการทดสอบและผู้พัฒนา (Developer & Sandbox Tools)
- **Step-by-Step Agreement Wizard:** เครื่องมือร่างสัญญา 5 ขั้นตอน พร้อมคำนวณงวดงานและสร้างโค้ด Solidity อัตโนมัติ
- **Persona & Role Switcher:** สลับบัญชีทดสอบได้ในคลิกเดียว (สมชาย - ผู้ว่าจ้าง, กิตติ - ผู้รับจ้าง, ชาร์ลี - คนกลางไกล่เกลี่ย)
- **Time Travel Simulator:** ปุ่มเร่งเวลาจำลอง (+1 วัน, +5 วัน) สำหรับทดสอบระบบ Anti-Ghosting Auto-Approval ได้ทันที
- **Solidity Source Code Inspector:** ตรวจสอบโค้ด Smart Contract Solidity ได้โดยตรง
- **Sandbox Transaction Explorer:** ตรวจสอบประวัติการทำรายการจำลองในแอป Hash, Block และ Gas ในรายการนี้ไม่ใช่ข้อมูลธุรกรรมจากเชน

---

## 🚀 วิธีเปิดใช้งาน (Getting Started)

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. รันโหมด Development:
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

3. Build ตรวจสอบความถูกต้อง:
   ```bash
   npm run build
   ```

## 🧾 ทดลองส่ง tBNB และประเมิน Gas บน Testnet

ในหน้ารายการสัญญา/ทะเบียนสัญญา กด **ทดลองส่ง tBNB จริงบน Testnet + ประเมิน Gas** กรอก address ผู้รับและจำนวน tBNB แล้วกดประเมิน Gas หรือส่งผ่าน MetaMask ตรวจสอบ address, จำนวน และค่า Gas ใน MetaMask ก่อนอนุมัติทุกครั้ง ธุรกรรมที่ส่งจะดูได้บน [BscScan Testnet](https://testnet.bscscan.com)

**ข้อจำกัดสำคัญ:** ฟีเจอร์นี้เป็นการโอน tBNB ธรรมดาเพื่อทดสอบการทำธุรกรรมและการคิด Gas เท่านั้น ไม่ใช่ Escrow และไม่ทำให้การสร้าง/ตรวจรับสัญญาใน SANYA กลายเป็น on-chain ห้ามใช้ private key หรือ seed phrase ในแอป

## 🛡️ SANYA Escrow จริงบน BNB Testnet

หน้า **🧪 Sandbox → SANYA Escrow จริง · Testnet** เป็นระบบแยกจาก Sandbox เดิม สัญญาใช้ tUSD ทดสอบ 6 decimals และเก็บเงินใน escrow ตาม milestone; relayer จ่าย tBNB แทนสำหรับธุรกรรมที่เปลี่ยนสถานะ โดยหัก **1 SYA ต่อธุรกรรมที่สำเร็จ** ผู้ใช้ยังเป็นผู้เซ็น EIP-712 request ด้วย MetaMask

### ตั้งค่าและ Deploy

1. ใช้กระเป๋า Testnet แยกสำหรับ relayer และเติม tBNB จาก faucet อย่าใช้กระเป๋าหลักหรือ private key ของผู้ใช้
2. คัดลอก `.env.example` เป็น `.env` และตั้ง `RPC_URL`, `RELAYER_PRIVATE_KEY`, `SYA_TOKEN_ADDRESS` (address ของ SYA ที่ deploy แล้ว) และ `FEE_TREASURY_ADDRESS` (address รับค่าธรรมเนียม) อย่าใส่ private key ในตัวแปร `VITE_*` หรือ source code
3. Deploy สัญญา Testnet ด้วย `npm run deploy:testnet` สคริปต์ตรวจ Chain ID 97 ก่อน deploy `SanyaForwarder`, `SanyaTestUSD` และ `SanyaEscrow` โดยใช้ SYA address ที่ตั้งไว้
4. นำ address ที่สคริปต์แสดงไปใส่ `FORWARDER_ADDRESS`, `TEST_USD_ADDRESS`, `ESCROW_ADDRESS` และตัวแปรหน้าเว็บ `VITE_SYA_TOKEN_ADDRESS`, `VITE_TEST_USD_ADDRESS`, `VITE_FORWARDER_ADDRESS`, `VITE_ESCROW_ADDRESS`, `VITE_ARBITRATOR_ADDRESS` ใน `.env` คนกลางต้องเป็น address ที่ไม่ซ้ำกับผู้ว่าจ้างและผู้รับจ้าง
5. หลังเปลี่ยน `.env` ให้ restart Vite แล้วเปิดสอง terminal: ใช้ `npm.cmd run relay` หนึ่งหน้าต่าง และ `npm.cmd run dev` อีกหน้าต่างใน PowerShell จากนั้น refresh เว็บและเปิดหน้า Escrow Testnet
6. ผู้ใช้แต่ละ address ต้องมี SYA ในกระเป๋าและอนุมัติ 10 SYA ให้สัญญา Escrow; ผู้ว่าจ้างต้องรับ tUSD ทดสอบและอนุมัติ tUSD สำหรับยอดที่จะฝาก การอนุมัติเหล่านี้เป็นธุรกรรมตรงจาก MetaMask จึงยังเสีย tBNB หนึ่งครั้งต่อการอนุมัติ

การอ่านข้อมูลไม่คิด SYA; การสร้างสัญญา, ส่งงาน, ขอแก้, ชี้แจง, ตรวจรับ, เปิดข้อพิพาท และตัดสินข้อพิพาทคิด 1 SYA ต่อรายการที่สำเร็จ การ mint tUSD และ approvals ไม่คิด SYA แต่ยังใช้ tBNB ส่วน relayer ต้องมี tBNB พอสำหรับ gas และเก็บ private key ไว้ฝั่ง server เท่านั้น

สัญญา `SanyaTestUSD` เปิด mint ได้สาธารณะเพื่อทดสอบเท่านั้น; ห้ามใช้เป็นเงินจริง ระบบนี้ยังไม่ได้ audit และ relayer ที่ให้บริการสาธารณะต้องเพิ่ม authentication, monitoring, abuse controls และตรวจสอบความปลอดภัยก่อนใช้งานจริง

## 🦊 เชื่อม MetaMask กับ BNB Chain Testnet

1. เปิดเว็บผ่าน `npm run dev` ใน Chrome, Edge หรือ Firefox ที่ติดตั้ง [MetaMask](https://metamask.io/download/) และปลดล็อกกระเป๋าแล้ว
2. เข้าสู่ระบบและกดปุ่ม **เชื่อม MetaMask** บนแถบเมนู
3. อนุมัติบัญชีที่ต้องการใน MetaMask และอนุมัติการเพิ่ม/สลับไป **BNB Smart Chain Testnet** หากยังไม่ได้เลือกเครือข่ายนี้
4. หน้ากระเป๋าจะแสดง Address, เครือข่าย และยอด **tBNB** ที่อ่านจริง สามารถกดรีเฟรชยอดหรือตรวจ Address บน Testnet BscScan ได้
5. หากเปิดการเชื่อมต่อจากการสร้างสัญญาหรือตรวจรับ ให้กดรายการเดิมอีกครั้งหลังเชื่อมสำเร็จ รายการ Escrow/USDT เหล่านี้ยังเป็น Sandbox

ในหน้าร่างสัญญา ขั้นตอนที่ 5 จะแสดง **สรุปสัญญาใน 1 นาที**: คู่สัญญา ขอบเขตงาน เกณฑ์ตรวจรับ วันส่ง จำนวนครั้งแก้ และค่าจ้าง จากนั้นกด **ตรวจสอบยอดก่อนยืนยัน** เพื่อดูผู้รับเงิน ยอดค้ำประกัน เครือข่าย และค่า Gas ก่อนเชื่อม MetaMask เมื่อเชื่อมสำเร็จ ให้ยืนยันรายการจำลองอีกครั้ง

หน้าตรวจยอดระบุชัดว่าเดโมไม่มีการส่งธุรกรรมและไม่มีค่า Gas ของรายการนี้ การปิดหน้าตรวจยอดหรือปฏิเสธคำขอ MetaMask จะไม่ล้างข้อมูลร่างที่กำลังกรอก

ค่าตั้งเครือข่ายตาม [เอกสาร BNB Chain](https://docs.bnbchain.org/bnb-smart-chain/developers/json_rpc/json-rpc-endpoint/):

| ค่า | BNB Smart Chain Testnet |
| --- | --- |
| Chain ID | `97` / `0x61` |
| RPC | `https://bsc-testnet-dataseed.bnbchain.org` |
| เหรียญทดสอบ | `tBNB` |
| Explorer | `https://testnet.bscscan.com` |

ระบบรองรับการค้นหา MetaMask ผ่าน EIP-6963 และ injected provider เมื่อมีหลายกระเป๋าในเบราว์เซอร์ โหลดบัญชีที่เคยอนุญาตผ่าน `eth_accounts` โดยไม่เปิดหน้าขอสิทธิ์ใหม่ และอัปเดตเมื่อเปลี่ยนบัญชี/เครือข่ายหรือตัดการเชื่อมต่อ สถานะที่บันทึกไว้ใน `localStorage` เพียงอย่างเดียวจะไม่แสดงว่าเชื่อมต่อแล้ว

การกด **ยกเลิกการเชื่อมต่อ** ในแอปจะยกเลิกการผูกและเซสชันของแอป หากต้องการถอนสิทธิ์เว็บไซต์จาก MetaMask ให้จัดการในเมนู Connected sites ของ MetaMask ด้วย สถานะผูกกระเป๋าจำลองจากเวอร์ชันเดิมจะถูกยกเลิกและต้องเชื่อม MetaMask ใหม่

### ตรวจสอบ Wallet Integration

```bash
npm test
npm run build
```

ชุดทดสอบใช้ Provider จำลองตรวจขั้นตอนเชื่อมบัญชี สลับ/เพิ่มเครือข่าย การยกเลิก และข้อมูลตอบกลับผิดปกติ ไม่ส่งธุรกรรมหรือขอใช้กระเป๋าของผู้ใช้
"# sanya" 
