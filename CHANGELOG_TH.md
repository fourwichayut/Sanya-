# สิ่งที่แก้ไขในชุดนี้

- เพิ่มหน้าต่าง `OnChainTransferModal` สำหรับโอน native tBNB ผ่าน MetaMask บน BNB Smart Chain Testnet (Chain ID 97)
- เพิ่มการประเมิน Gas ด้วย `eth_estimateGas` และ `eth_gasPrice` ก่อนส่งธุรกรรม
- แสดงลิงก์ BscScan Testnet หลัง MetaMask ส่ง Transaction Hash กลับมา
- เพิ่มคำเตือนว่า Escrow, USDT และ workflow สัญญาเดิมยังเป็น Sandbox ไม่ใช่ smart contract ที่ deploy แล้ว
- อัปเดต README ภาษาไทยพร้อมวิธีทดสอบ

## ข้อจำกัด

- การโอน tBNB นี้เป็นธุรกรรมทดสอบจริงบน Testnet จึงใช้ tBNB และ Gas ของ Testnet ไม่ใช่ BNB mainnet
- ยังไม่ได้เปลี่ยน workflow สร้าง/ตรวจรับ/ปลดล็อก Escrow ให้เป็น on-chain และยังไม่มีสัญญา Escrow ที่ deploy แล้ว
- การ build/test ยังยืนยันไม่ได้ในสภาพแวดล้อมจัดทำไฟล์นี้ เพราะการติดตั้ง npm dependencies ถูกตัดการเชื่อมต่อ/หมดเวลา ให้รัน `npm ci`, `npm test`, `npm run build` ในเครื่องก่อนนำไปใช้งาน
