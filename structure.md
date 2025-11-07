# File Tree: NhaTroBaoBao

Generated on: 9/11/2025, 11:26:08 AM
Root path: `d:\NhaTroBaoBao`

```
├── .git/ 🚫 (auto-hidden)
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── bug-report.md
│       ├── code-review.md
│       ├── critical-issue.md
│       ├── dev-wip.md
│       ├── improvement.md
│       ├── major-issue.md
│       ├── minor-issue.md
│       ├── task.md
│       ├── test-ready.md
│       ├── test-wip.md
│       └── user-story.md
├── .venv/ 🚫 (auto-hidden)
├── .vscode/ 🚫 (auto-hidden)
├── backend/
│   ├── ContractFile/
│   │   └── Mau_Hop_Dong_Cho_Thue_Tro.docx
│   ├── InvoiceFile/
│   │   └── invoice_template.docx
│   ├── app/
│   │   ├── __pycache__/ 🚫 (auto-hidden)
│   │   ├── face_recognition/
│   │   │   ├── __pycache__/ 🚫 (auto-hidden)
│   │   │   ├── __init__.py
│   │   │   ├── detector.py
│   │   │   ├── embedding.py
│   │   │   ├── recognition.py
│   │   │   └── utils.py
│   │   ├── routers/
│   │   │   ├── __pycache__/ 🚫 (auto-hidden)
│   │   │   ├── __init__.py
│   │   │   ├── account.py
│   │   │   ├── auth.py
│   │   │   ├── backup.py
│   │   │   ├── contract.py
│   │   │   ├── device.py
│   │   │   ├── electricity.py
│   │   │   ├── face_recognition.py
│   │   │   ├── invoice.py
│   │   │   ├── invoice_detail.py
│   │   │   ├── notification.py
│   │   │   ├── payment.py
│   │   │   ├── protected.py
│   │   │   ├── recognition_record.py
│   │   │   ├── report.py
│   │   │   ├── reservation.py
│   │   │   ├── room.py
│   │   │   ├── roomImage.py
│   │   │   ├── roomtype.py
│   │   │   ├── tenant.py
│   │   │   └── water.py
│   │   ├── schemas/
│   │   │   ├── __pycache__/ 🚫 (auto-hidden)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── contract.py
│   │   │   ├── device.py
│   │   │   ├── electricity.py
│   │   │   ├── invoice.py
│   │   │   ├── invoice_detail.py
│   │   │   ├── notification.py
│   │   │   ├── payment.py
│   │   │   ├── recognition_record.py
│   │   │   ├── reservation.py
│   │   │   ├── room.py
│   │   │   ├── roomImage.py
│   │   │   ├── tenant.py
│   │   │   ├── user.py
│   │   │   └── water.py
│   │   ├── auth_dependency.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── utils.py
│   ├── backups/
│   │   ├── backup_20250823_231103.sql
│   │   ├── backup_20250823_231237.sql
│   │   ├── backup_20250825_192510.sql
│   │   ├── backup_20250831_233217.sql
│   │   ├── backup_20250831_233225.sql
│   │   ├── binlog_20250823_231237.txt
│   │   └── binlog_20250831_233225.txt
│   ├── exported_contracts/
│   │   └── contract_1.docx
│   ├── insightface_model/
│   │   ├── buffalo_sc/
│   │   │   ├── det_500m.onnx
│   │   │   └── w600k_mbf.onnx
│   │   └── buffalo_sc.zip
│   ├── script_db/
│   │   ├── backup_20250827_211101.sql
│   │   └── data.sql
│   ├── .env 🚫 (auto-hidden)
│   ├── .env.docker 🚫 (auto-hidden)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requrements.txt
│   ├── runtime.txt
│   └── start.sh
├── nha-tro-fe/
│   ├── dist/ 🚫 (auto-hidden)
│   ├── node_modules/ 🚫 (auto-hidden)
│   ├── public/
│   │   ├── avatar/
│   │   │   ├── 079203029607_avatar.png
│   │   │   ├── 079203029608_avatar.jpg
│   │   │   ├── 079203029609_avatar.jpg
│   │   │   ├── 079203029610_avatar.jpg
│   │   │   ├── 079203029611_avatar.jpg
│   │   │   ├── 079203029612_avatar.jpg
│   │   │   ├── 079203029613_avatar.jpg
│   │   │   ├── 079203029614_avatar.jpg
│   │   │   ├── 079203029615_avatar.jpg
│   │   │   └── 079203029616_avatar.jpg
│   │   ├── cccd/
│   │   │   ├── 079203029606_front_download.jpg
│   │   │   ├── 079203029607_back_back_079203029607.jpg
│   │   │   ├── 079203029607_back_download (2).jpg
│   │   │   ├── 079203029607_back_download.jpg
│   │   │   ├── 079203029607_back_image.jpg
│   │   │   ├── 079203029607_front_download (1).jpg
│   │   │   ├── 079203029607_front_download.jpg
│   │   │   ├── 079203029607_front_front_079203029607.jpg
│   │   │   ├── 079203029607_front_images.png
│   │   │   ├── 079203029608_back_download (2).jpg
│   │   │   ├── 079203029608_front_download.jpg
│   │   │   ├── 079203029609_back_download (2).jpg
│   │   │   ├── 079203029609_front_download.jpg
│   │   │   ├── 079203029610_back_download (2).jpg
│   │   │   ├── 079203029610_front_download (1).jpg
│   │   │   ├── 079203029611_back_download (2).jpg
│   │   │   ├── 079203029611_front_download.jpg
│   │   │   ├── 079203029612_back_download (2).jpg
│   │   │   ├── 079203029612_front_download (1).jpg
│   │   │   ├── 079203029613_back_download (2).jpg
│   │   │   ├── 079203029613_front_download.jpg
│   │   │   ├── 079203029614_back_download (2).jpg
│   │   │   ├── 079203029614_front_download.jpg
│   │   │   ├── 079203029615_back_download (2).jpg
│   │   │   ├── 079203029615_front_download.jpg
│   │   │   ├── 079203029616_back_download (2).jpg
│   │   │   ├── 079203029616_front_download.jpg
│   │   │   ├── back_079203029607.jpg
│   │   │   └── front_079203029607.jpg
│   │   ├── contracts_file/
│   │   │   ├── 123
│   │   │   ├── Le_Van_Cuong_contract.docx
│   │   │   ├── Nguyen_Van_An_contract.docx
│   │   │   ├── Nguyen_Van_An_contract.pdf
│   │   │   ├── Pham_Van_Minh_contract.docx
│   │   │   ├── Pham_Van_Minh_contract.pdf
│   │   │   └── Tran_Thi_Bich_contract.docx
│   │   ├── images/
│   │   │   ├── icons/
│   │   │   │   ├── building.svg
│   │   │   │   ├── contract.svg
│   │   │   │   ├── dashboard.svg
│   │   │   │   ├── device.svg
│   │   │   │   ├── electricity.svg
│   │   │   │   ├── payment.svg
│   │   │   │   ├── receipt.svg
│   │   │   │   ├── settings.svg
│   │   │   │   ├── tenant.svg
│   │   │   │   └── user.svg
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (10).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (11).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (12).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (13).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (14).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (15).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (3).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (4).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (5).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (6).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (7).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (8).png
│   │   │   ├── DrawKit Vector Illustration Landscape & Scenery (9).png
│   │   │   ├── Facebook.png
│   │   │   ├── Instagram.png
│   │   │   ├── Manager.svg
│   │   │   ├── Paypal.png
│   │   │   ├── Store.svg
│   │   │   ├── Telegram.png
│   │   │   ├── Tiktok.png
│   │   │   ├── X.png
│   │   │   ├── Youtube.png
│   │   │   ├── bg-rooms.png
│   │   │   ├── bg1.jpg
│   │   │   ├── bg1.png
│   │   │   ├── bg2.jpg
│   │   │   ├── bg3.jpg
│   │   │   ├── bg4.jpg
│   │   │   ├── logo.png
│   │   │   ├── no-data.png
│   │   │   └── no-result.png
│   │   ├── invoices_file/
│   │   │   ├── Ph_ng_2A_invoice.docx
│   │   │   ├── Phong_2A_invoice.docx
│   │   │   └── Phong_2A_invoice.pdf
│   │   └── roomImage/
│   │       ├── 1c801685-26f7-4949-b6b1-ce324e673d44_1755743014.jpg
│   │       ├── 2daf357b-a8ec-4cab-9e04-f2b268631c6e_1756181830 (1).jpg
│   │       ├── 2daf357b-a8ec-4cab-9e04-f2b268631c6e_1756181830.jpg
│   │       ├── 360istockphoto-2150568859-1024x1024.jpg
│   │       ├── download (1).jpg
│   │       ├── download (2).jpg
│   │       ├── download.jpg
│   │       ├── gen-h-1_1756182280.jpg
│   │       ├── gen-h-1_1756183493 (1).jpg
│   │       ├── gen-h-1_1756183493.jpg
│   │       ├── image.daidoanket.vn-images-upload-vietdl-01272021-_image005-1611657096178727614385.jpg
│   │       ├── images (10).jpg
│   │       ├── images (11).jpg
│   │       ├── images (12).jpg
│   │       ├── images (13).jpg
│   │       ├── images (7).jpg
│   │       ├── images (8).jpg
│   │       ├── images (9).jpg
│   │       ├── images.jpg
│   │       ├── images1.jpg
│   │       ├── images2.jpg
│   │       ├── images3.jpg
│   │       ├── images4.jpg
│   │       ├── images5.jpg
│   │       ├── images6.jpg
│   │       ├── img-0386_1756084109.jpg
│   │       ├── img-1785_1756182327.jpg
│   │       ├── img-2512_1755965792.jpg
│   │       ├── img-3621_1756184053 (1).jpg
│   │       ├── img-3621_1756184053.jpg
│   │       ├── img-6931_1756092450.jpg
│   │       ├── img-9698_1756086720.jpg
│   │       ├── nha-tro-homestay 1.png
│   │       ├── uecuhb.jpg
│   │       ├── z6940362676401-b621b666f1c25bac5c925f94a98c0450_1756109065.jpg
│   │       ├── z6940362703310-b4d2f327f6f35440a1ac2e37d1afefd9_1756109065.jpg
│   │       ├── z6940362852261-9af312f9fb0079f8339e154405e44792_1756109068.jpg
│   │       ├── z6940362904805-fae09ada8be8cf9f776fd131612ae95f_1756109068.jpg
│   │       ├── z6940362919126-54daea8d36edeb993ccc321906baa777_1756109071.jpg
│   │       ├── z6940363114799-140893ff0d098a87f063ed43ca5eb211_1756109071.jpg
│   │       ├── z6940363127401-f14718e5add3c00568de793b03d5be23_1756109074.jpg
│   │       ├── z6940363150697-88238b30c5ff287b511af17ca194ce9a_1756109076.jpg
│   │       ├── z6940363153703-a9b11e643ff91dbbea5186f21cd3537a_1756109076.jpg
│   │       ├── z6940846855650-3879b97cda3c547ce55245110e30ccaf_1756180661 (1).jpg
│   │       ├── z6940846855650-3879b97cda3c547ce55245110e30ccaf_1756180661.jpg
│   │       └── z6944582835993-b319b63e80ed522746856bbd8aa0d75a_1756182116.jpg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── fonts/
│   │   │   │   └── MuseoSansCyrl-500.otf
│   │   │   └── style/
│   │   │       ├── AttendanceScreen.css
│   │   │       ├── Home.css
│   │   │       ├── Modal.css
│   │   │       └── ModalComfirm.css
│   │   ├── components/
│   │   │   ├── AdminHeader.jsx
│   │   │   ├── AdvancedFilters.jsx
│   │   │   ├── FilterableTable.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── GuestRoute.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ModalConfirm.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SidebarItem.jsx
│   │   │   └── Table.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── UserContext.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Accounts.jsx
│   │   │   │   ├── Backup.jsx
│   │   │   │   ├── Contracts.jsx
│   │   │   │   ├── Contracts_report.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Devices.jsx
│   │   │   │   ├── Electricity.jsx
│   │   │   │   ├── Invoices.jsx
│   │   │   │   ├── Payments.jsx
│   │   │   │   ├── Reservations.jsx
│   │   │   │   ├── Restore.jsx
│   │   │   │   ├── Revenues_report.jsx
│   │   │   │   ├── Rooms.jsx
│   │   │   │   ├── Rooms_report.jsx
│   │   │   │   ├── Setting.jsx
│   │   │   │   ├── System_report.jsx
│   │   │   │   ├── Tenants.jsx
│   │   │   │   ├── Tenants_report.jsx
│   │   │   │   ├── TypeRooms.jsx
│   │   │   │   ├── Utility_report.jsx
│   │   │   │   └── Waters.jsx
│   │   │   ├── user/
│   │   │   │   ├── AttendanceScreen.jsx
│   │   │   │   ├── Contract.jsx
│   │   │   │   ├── DetailRoom.jsx
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Invoice.jsx
│   │   │   │   ├── PaymentHistory.jsx
│   │   │   │   ├── Resvertion.jsx
│   │   │   │   └── Rooms.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Payment_return.jsx
│   │   │   ├── Payment_vnpay.jsx
│   │   │   ├── Refund.jsx
│   │   │   └── Register.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
├── .dockerignore
├── .gitignore
├── digram.mwb
├── digram.mwb.bak
├── docker-compose.yml
├── requirements.txt
├── start.md
└── structure.md
```

---
*Generated by FileTree Pro Extension*