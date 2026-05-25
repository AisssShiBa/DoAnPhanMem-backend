# Khung repo để bắt đầu push đồ án

Thư mục này là bản khung tối giản cho frontend và backend. Mục tiêu là tạo một repo ban đầu sạch, chạy được ở mức cơ bản, sau đó từng thành viên copy module thật từ project hiện có sang và commit theo phần mình phụ trách.

Lưu ý:

- Đây là khung kỹ thuật để tổ chức lại repo cho dễ push.
- Không nên nói đây là lịch sử code thật từ đầu nếu code đã được làm trước đó.
- Khi từng thành viên copy module thật sang, nên commit đúng nội dung mình thêm.

## Cách dùng đề xuất

1. Tạo repo GitHub mới.
2. Copy nội dung `frontend-khung` vào repo frontend hoặc thư mục `frontend`.
3. Copy nội dung `backend-khung` vào repo backend hoặc thư mục `backend`.
4. Commit khung ban đầu:

```bash
git add .
git commit -m "chore: initialize frontend and backend scaffold"
git push
```

5. Từng thành viên copy module thật từ project hiện có sang và commit:

- Thành viên 1: auth, profile, session.
- Thành viên 2: task, category, tag, subtask, reminder, attachment, dashboard.
- Thành viên 3: admin, notification, audit log, heatmap.

## Lệnh chạy sau khi copy khung

Frontend:

```bash
cd frontend-khung
npm install
npm run dev
```

Backend:

```bash
cd backend-khung
npm install
npm run dev
```

Nếu muốn đổi tên thư mục:

- `frontend-khung` thành `DoAnPhanMem`
- `backend-khung` thành `DoAnPhanMem-Backend`
