# Phân công nhiệm vụ nhóm - Đồ án phần mềm

## 1. Tổng quan hệ thống

Tên đề tài đề xuất: Ứng dụng quản lý công việc cá nhân và quản trị người dùng.

Hệ thống gồm 2 repository:

- `DoAnPhanMem`: Frontend React + TypeScript + Vite.
- `DoAnPhanMem-Backend`: Backend Express + TypeScript + Prisma + PostgreSQL.

Chức năng chính:

- Đăng ký, đăng nhập, xác thực email, quên mật khẩu, đăng nhập Google.
- Quản lý task, category, tag, subtask, reminder, file đính kèm.
- Dashboard thống kê công việc, lịch công việc, thùng rác và khôi phục task.
- Quản lý hồ sơ, cài đặt, đổi mật khẩu, quản lý phiên đăng nhập.
- Admin dashboard, quản lý user, khóa/mở tài khoản, thông báo hệ thống, audit log, heatmap hoạt động.

## 2. Cách chia việc

Nhóm chia việc theo module chức năng. Mỗi thành viên phụ trách một nhóm file riêng ở cả frontend và backend. Trong quá trình làm, cả 3 thành viên có thể cùng push trong một ngày hoặc cùng một lượt, nhưng mỗi người push những file thuộc phạm vi mình phụ trách. Cách chia này thể hiện mỗi thành viên đều có đóng góp thực tế, không phải một người làm toàn bộ hay các thành viên chỉ push cho có lịch sử.

## 3. Phân công cho 3 thành viên

### Thành viên 1 - Xác thực, tài khoản và hồ sơ cá nhân (Thông)

Phạm vi chính:

- Luồng đăng ký, đăng nhập, đăng xuất.
- Xác thực email, quên mật khẩu, đặt lại mật khẩu.
- Đăng nhập Google OAuth.
- Bảo vệ route frontend, lưu trạng thái đăng nhập, refresh token.
- Hồ sơ cá nhân, cài đặt, đổi mật khẩu, quản lý phiên đăng nhập.

Frontend phụ trách:

- `DoAnPhanMem/src/App.tsx`
- `DoAnPhanMem/src/lib/axios.ts`
- `DoAnPhanMem/src/store/authStore.ts`
- `DoAnPhanMem/src/routes/ProtectedRoute.tsx`
- `DoAnPhanMem/src/services/authService.ts`
- `DoAnPhanMem/src/services/sessionService.ts`
- `DoAnPhanMem/src/Pages/Login.tsx`
- `DoAnPhanMem/src/Pages/Register.tsx`
- `DoAnPhanMem/src/Pages/ForgotPassword.tsx`
- `DoAnPhanMem/src/Pages/ResetPassword.tsx`
- `DoAnPhanMem/src/Pages/VerifyEmail.tsx`
- `DoAnPhanMem/src/Pages/GoogleCallback.tsx`
- `DoAnPhanMem/src/Pages/Sessions.tsx`
- `DoAnPhanMem/src/Pages/User/Settings.tsx`

Backend phụ trách:

- `DoAnPhanMem-Backend/src/controllers/authController.ts`
- `DoAnPhanMem-Backend/src/controllers/profileController.ts`
- `DoAnPhanMem-Backend/src/routes/authRoute.ts`
- `DoAnPhanMem-Backend/src/routes/profileRouter.ts`
- `DoAnPhanMem-Backend/src/middlewares/authMiddleware.ts`
- `DoAnPhanMem-Backend/src/config/passport.ts`
- `DoAnPhanMem-Backend/src/services/mailService.ts`
- `DoAnPhanMem-Backend/src/schemas/user.schema.ts`

Database liên quan:

- `Users`
- `Roles`
- `refresh_tokens`
- `User_Settings`

Nội dung thuyết trình:

- Giải thích luồng đăng ký, verify email, đăng nhập, refresh token.
- Giải thích Axios interceptor tự gắn token và gọi refresh khi token hết hạn.
- Giải thích `protectedRoute` backend và `ProtectedRoute` frontend.
- Demo đăng nhập, xem hồ sơ, đổi thông tin, đổi mật khẩu, xem phiên đăng nhập.

### Thành viên 2 - Quản lý công việc và dữ liệu nghiệp vụ (Đạt)

Phạm vi chính:

- Task CRUD.
- Category, tag, subtask, reminder.
- Upload và xóa file đính kèm.
- Thùng rác, khôi phục task, xóa vĩnh viễn.
- Calendar và dashboard người dùng.
- Thiết kế phần lớn mô hình database nghiệp vụ.

Frontend phụ trách:

- `DoAnPhanMem/src/Pages/User/TaskList.tsx`
- `DoAnPhanMem/src/Pages/User/Dashboard.tsx`
- `DoAnPhanMem/src/Pages/User/CalendarView.tsx`
- `DoAnPhanMem/src/Pages/trashPage.tsx`
- `DoAnPhanMem/src/components/TaskItem.tsx`
- `DoAnPhanMem/src/components/PomodoroTimer.tsx`
- `DoAnPhanMem/src/services/dashboardService.ts`

Backend phụ trách:

- `DoAnPhanMem-Backend/src/controllers/taskController.ts`
- `DoAnPhanMem-Backend/src/controllers/categoryController.ts`
- `DoAnPhanMem-Backend/src/controllers/tagController.ts`
- `DoAnPhanMem-Backend/src/controllers/subtaskController.ts`
- `DoAnPhanMem-Backend/src/controllers/reminderController.ts`
- `DoAnPhanMem-Backend/src/controllers/attachmentController.ts`
- `DoAnPhanMem-Backend/src/controllers/Trashcontroller.ts`
- `DoAnPhanMem-Backend/src/controllers/dashboardController.ts`
- `DoAnPhanMem-Backend/src/routes/taskRoute.ts`
- `DoAnPhanMem-Backend/src/routes/categoryRoute.ts`
- `DoAnPhanMem-Backend/src/routes/tagRoute.ts`
- `DoAnPhanMem-Backend/src/routes/subtaskRoute.ts`
- `DoAnPhanMem-Backend/src/routes/dashboardRoute.ts`
- `DoAnPhanMem-Backend/src/jobs/reminderJob.ts`
- `DoAnPhanMem-Backend/prisma/schema.prisma`

Database liên quan:

- `Tasks`
- `Categories`
- `Tags`
- `Task_Tags`
- `SubTasks`
- `Reminders`
- `Task_Attachments`

Nội dung thuyết trình:

- Giải thích mô hình dữ liệu task và các bảng liên quan.
- Giải thích task CRUD, filter, status, priority, due date.
- Giải thích soft delete, trash, restore, permanent delete.
- Demo tạo task, thêm tag/subtask/reminder/file, xem dashboard và calendar.

### Thành viên 3 - Admin, thông báo và báo cáo hệ thống (Kiệt)

Phạm vi chính:

- Admin dashboard.
- Quản lý người dùng.
- Khóa/mở tài khoản, reset mật khẩu người dùng.
- Gửi thông báo hệ thống.
- Lịch sử thông báo, notification người dùng.
- Audit log, thống kê DAU/MAU, heatmap hoạt động.
- Layout admin và phân quyền admin.

Frontend phụ trách:

- `DoAnPhanMem/src/Pages/Admin/AdminLayout.tsx`
- `DoAnPhanMem/src/Pages/Admin/AdminDashboard.tsx`
- `DoAnPhanMem/src/Pages/Admin/UserManagement.tsx`
- `DoAnPhanMem/src/Pages/Admin/SystemNotification.tsx`
- `DoAnPhanMem/src/Pages/Admin/AuditLog.tsx`
- `DoAnPhanMem/src/Pages/Admin/UserActivityHeatmap.tsx`
- `DoAnPhanMem/src/components/Admin/ConfirmDialog.tsx`
- `DoAnPhanMem/src/components/Admin/CommandPalette.tsx`
- `DoAnPhanMem/src/components/Admin/EmptyState.tsx`
- `DoAnPhanMem/src/components/Admin/ErrorState.tsx`
- `DoAnPhanMem/src/components/Admin/Skeleton.tsx`
- `DoAnPhanMem/src/services/adminService.ts`
- `DoAnPhanMem/src/services/notificationService.ts`

Backend phụ trách:

- `DoAnPhanMem-Backend/src/controllers/adminController.ts`
- `DoAnPhanMem-Backend/src/controllers/notificationController.ts`
- `DoAnPhanMem-Backend/src/controllers/HeatmapController.ts`
- `DoAnPhanMem-Backend/src/routes/adminRoute.ts`
- `DoAnPhanMem-Backend/src/routes/notificationRoute.ts`
- `DoAnPhanMem-Backend/src/middlewares/adminMiddleware.ts`

Database liên quan:

- `User_Notifications`
- `Activity_Logs`
- `Users`
- `Roles`
- Dữ liệu thống kê từ `Tasks`, `Categories`, `Tags`

Nội dung thuyết trình:

- Giải thích phân quyền admin qua middleware.
- Giải thích admin dashboard và các chỉ số thống kê.
- Giải thích quản lý user, khóa/mở tài khoản, reset mật khẩu.
- Demo gửi thông báo hệ thống, xem audit log và heatmap hoạt động.

## 4. Cách ghi nhận push GitHub hôm nay

Nguyên tắc:

- Các thành viên có thể cùng push trong một lượt, nhưng mỗi người push những file khác nhau theo module mình phụ trách.
- Không ghi theo kiểu "đợt 1 một người push hết", vì như vậy dễ hiểu nhầm các thành viên khác không làm việc.
- Nếu 3 người cùng push trong cùng ngày, báo cáo ghi rõ từng người đã cập nhật nhóm file nào ở frontend và backend.
- Commit nên gắn với thay đổi thực tế: sửa code, bổ sung validation, cập nhật giao diện, sửa route, bổ sung tài liệu, screenshot demo.
- Không push `.env`, `node_modules`, file build tạm, file database cá nhân.

### Lượt push 1 - Cả 3 thành viên cập nhật luồng chính của module

Thành viên 1 (Thông) push luồng xác thực/tài khoản:

File push:

- `DoAnPhanMem/src/App.tsx`
- `DoAnPhanMem/src/lib/axios.ts`
- `DoAnPhanMem/src/store/authStore.ts`
- `DoAnPhanMem/src/routes/ProtectedRoute.tsx`
- `DoAnPhanMem/src/services/authService.ts`
- `DoAnPhanMem/src/Pages/Login.tsx`
- `DoAnPhanMem/src/Pages/Register.tsx`
- `DoAnPhanMem/src/Pages/GoogleCallback.tsx`
- `DoAnPhanMem-Backend/src/controllers/authController.ts`
- `DoAnPhanMem-Backend/src/routes/authRoute.ts`
- `DoAnPhanMem-Backend/src/middlewares/authMiddleware.ts`
- `DoAnPhanMem-Backend/src/config/passport.ts`
- `DoAnPhanMem-Backend/src/schemas/user.schema.ts`

Lệnh add gợi ý:

```bash
git add DoAnPhanMem/src/App.tsx DoAnPhanMem/src/lib/axios.ts DoAnPhanMem/src/store/authStore.ts DoAnPhanMem/src/routes/ProtectedRoute.tsx DoAnPhanMem/src/services/authService.ts DoAnPhanMem/src/Pages/Login.tsx DoAnPhanMem/src/Pages/Register.tsx DoAnPhanMem/src/Pages/GoogleCallback.tsx
git add DoAnPhanMem-Backend/src/controllers/authController.ts DoAnPhanMem-Backend/src/routes/authRoute.ts DoAnPhanMem-Backend/src/middlewares/authMiddleware.ts DoAnPhanMem-Backend/src/config/passport.ts DoAnPhanMem-Backend/src/schemas/user.schema.ts
git commit -m "feat: update authentication account flow"
git push
```

Thành viên 2 (Đạt) push luồng quản lý công việc:

File push:

- `DoAnPhanMem/src/Pages/User/TaskList.tsx`
- `DoAnPhanMem/src/components/TaskItem.tsx`
- `DoAnPhanMem/src/Pages/trashPage.tsx`
- `DoAnPhanMem-Backend/src/controllers/taskController.ts`
- `DoAnPhanMem-Backend/src/controllers/categoryController.ts`
- `DoAnPhanMem-Backend/src/controllers/tagController.ts`
- `DoAnPhanMem-Backend/src/controllers/subtaskController.ts`
- `DoAnPhanMem-Backend/src/controllers/Trashcontroller.ts`
- `DoAnPhanMem-Backend/src/routes/taskRoute.ts`
- `DoAnPhanMem-Backend/src/routes/categoryRoute.ts`
- `DoAnPhanMem-Backend/src/routes/tagRoute.ts`
- `DoAnPhanMem-Backend/src/routes/subtaskRoute.ts`
- `DoAnPhanMem-Backend/prisma/schema.prisma`

Lệnh add gợi ý:

```bash
git add DoAnPhanMem/src/Pages/User/TaskList.tsx DoAnPhanMem/src/components/TaskItem.tsx DoAnPhanMem/src/Pages/trashPage.tsx
git add DoAnPhanMem-Backend/src/controllers/taskController.ts DoAnPhanMem-Backend/src/controllers/categoryController.ts DoAnPhanMem-Backend/src/controllers/tagController.ts DoAnPhanMem-Backend/src/controllers/subtaskController.ts DoAnPhanMem-Backend/src/controllers/Trashcontroller.ts DoAnPhanMem-Backend/src/routes/taskRoute.ts DoAnPhanMem-Backend/src/routes/categoryRoute.ts DoAnPhanMem-Backend/src/routes/tagRoute.ts DoAnPhanMem-Backend/src/routes/subtaskRoute.ts DoAnPhanMem-Backend/prisma/schema.prisma
git commit -m "feat: update task management workflow"
git push
```

Thành viên 3 (Kiệt) push luồng admin/thông báo:

File push:

- `DoAnPhanMem/src/Pages/Admin/AdminLayout.tsx`
- `DoAnPhanMem/src/Pages/Admin/AdminDashboard.tsx`
- `DoAnPhanMem/src/Pages/Admin/UserManagement.tsx`
- `DoAnPhanMem/src/Pages/Admin/SystemNotification.tsx`
- `DoAnPhanMem/src/services/adminService.ts`
- `DoAnPhanMem/src/services/notificationService.ts`
- `DoAnPhanMem-Backend/src/controllers/adminController.ts`
- `DoAnPhanMem-Backend/src/controllers/notificationController.ts`
- `DoAnPhanMem-Backend/src/routes/adminRoute.ts`
- `DoAnPhanMem-Backend/src/routes/notificationRoute.ts`
- `DoAnPhanMem-Backend/src/middlewares/adminMiddleware.ts`

Lệnh add gợi ý:

```bash
git add DoAnPhanMem/src/Pages/Admin/AdminLayout.tsx DoAnPhanMem/src/Pages/Admin/AdminDashboard.tsx DoAnPhanMem/src/Pages/Admin/UserManagement.tsx DoAnPhanMem/src/Pages/Admin/SystemNotification.tsx DoAnPhanMem/src/services/adminService.ts DoAnPhanMem/src/services/notificationService.ts
git add DoAnPhanMem-Backend/src/controllers/adminController.ts DoAnPhanMem-Backend/src/controllers/notificationController.ts DoAnPhanMem-Backend/src/routes/adminRoute.ts DoAnPhanMem-Backend/src/routes/notificationRoute.ts DoAnPhanMem-Backend/src/middlewares/adminMiddleware.ts
git commit -m "feat: update admin notification workflow"
git push
```

### Lượt push 2 - Cả 3 thành viên hoàn thiện chức năng phụ của module

Thành viên 1 (Thông) push quên mật khẩu, reset mật khẩu, email và session:

File push:

- `DoAnPhanMem/src/Pages/ForgotPassword.tsx`
- `DoAnPhanMem/src/Pages/ResetPassword.tsx`
- `DoAnPhanMem/src/Pages/VerifyEmail.tsx`
- `DoAnPhanMem/src/Pages/Sessions.tsx`
- `DoAnPhanMem/src/services/sessionService.ts`
- `DoAnPhanMem-Backend/src/controllers/profileController.ts`
- `DoAnPhanMem-Backend/src/routes/profileRouter.ts`
- `DoAnPhanMem-Backend/src/services/mailService.ts`

Lệnh add gợi ý:

```bash
git add DoAnPhanMem/src/Pages/ForgotPassword.tsx DoAnPhanMem/src/Pages/ResetPassword.tsx DoAnPhanMem/src/Pages/VerifyEmail.tsx DoAnPhanMem/src/Pages/Sessions.tsx DoAnPhanMem/src/services/sessionService.ts
git add DoAnPhanMem-Backend/src/controllers/profileController.ts DoAnPhanMem-Backend/src/routes/profileRouter.ts DoAnPhanMem-Backend/src/services/mailService.ts
git commit -m "feat: update password recovery and session flow"
git push
```

Thành viên 2 (Đạt) push dashboard, calendar, reminder, attachment:

File push:

- `DoAnPhanMem/src/Pages/User/Dashboard.tsx`
- `DoAnPhanMem/src/Pages/User/CalendarView.tsx`
- `DoAnPhanMem/src/components/PomodoroTimer.tsx`
- `DoAnPhanMem/src/services/dashboardService.ts`
- `DoAnPhanMem-Backend/src/controllers/dashboardController.ts`
- `DoAnPhanMem-Backend/src/controllers/reminderController.ts`
- `DoAnPhanMem-Backend/src/controllers/attachmentController.ts`
- `DoAnPhanMem-Backend/src/routes/dashboardRoute.ts`
- `DoAnPhanMem-Backend/src/jobs/reminderJob.ts`

Lệnh add gợi ý:

```bash
git add DoAnPhanMem/src/Pages/User/Dashboard.tsx DoAnPhanMem/src/Pages/User/CalendarView.tsx DoAnPhanMem/src/components/PomodoroTimer.tsx DoAnPhanMem/src/services/dashboardService.ts
git add DoAnPhanMem-Backend/src/controllers/dashboardController.ts DoAnPhanMem-Backend/src/controllers/reminderController.ts DoAnPhanMem-Backend/src/controllers/attachmentController.ts DoAnPhanMem-Backend/src/routes/dashboardRoute.ts DoAnPhanMem-Backend/src/jobs/reminderJob.ts
git commit -m "feat: update dashboard calendar reminder flow"
git push
```

Thành viên 3 (Kiệt) push audit log và heatmap:

File push:

- `DoAnPhanMem/src/Pages/Admin/AuditLog.tsx`
- `DoAnPhanMem/src/Pages/Admin/UserActivityHeatmap.tsx`
- `DoAnPhanMem/src/components/Admin/ConfirmDialog.tsx`
- `DoAnPhanMem/src/components/Admin/CommandPalette.tsx`
- `DoAnPhanMem/src/components/Admin/EmptyState.tsx`
- `DoAnPhanMem/src/components/Admin/ErrorState.tsx`
- `DoAnPhanMem/src/components/Admin/Skeleton.tsx`
- `DoAnPhanMem-Backend/src/controllers/HeatmapController.ts`

Lệnh add gợi ý:

```bash
git add DoAnPhanMem/src/Pages/Admin/AuditLog.tsx DoAnPhanMem/src/Pages/Admin/UserActivityHeatmap.tsx DoAnPhanMem/src/components/Admin/ConfirmDialog.tsx DoAnPhanMem/src/components/Admin/CommandPalette.tsx DoAnPhanMem/src/components/Admin/EmptyState.tsx DoAnPhanMem/src/components/Admin/ErrorState.tsx DoAnPhanMem/src/components/Admin/Skeleton.tsx
git add DoAnPhanMem-Backend/src/controllers/HeatmapController.ts
git commit -m "feat: update admin audit log and heatmap"
git push
```

### Lượt push 3 - Cả 3 thành viên sửa lỗi và polish phần mình

Thành viên 1 (Thông):

File push:

- `DoAnPhanMem/src/lib/axios.ts`
- `DoAnPhanMem/src/store/authStore.ts`
- `DoAnPhanMem/src/Pages/User/Settings.tsx`
- `DoAnPhanMem/src/Pages/Sessions.tsx`
- `DoAnPhanMem-Backend/src/controllers/authController.ts`
- `DoAnPhanMem-Backend/src/controllers/profileController.ts`
- `DoAnPhanMem-Backend/src/middlewares/authMiddleware.ts`

Commit gợi ý: `fix: polish auth profile and session handling`

Thành viên 2 (Đạt):

File push:

- `DoAnPhanMem/src/Pages/User/TaskList.tsx`
- `DoAnPhanMem/src/Pages/User/Dashboard.tsx`
- `DoAnPhanMem/src/Pages/User/CalendarView.tsx`
- `DoAnPhanMem/src/Pages/trashPage.tsx`
- `DoAnPhanMem-Backend/src/controllers/taskController.ts`
- `DoAnPhanMem-Backend/src/controllers/Trashcontroller.ts`
- `DoAnPhanMem-Backend/src/controllers/dashboardController.ts`

Commit gợi ý: `fix: polish task dashboard and trash flow`

Thành viên 3 (Kiệt):

File push:

- `DoAnPhanMem/src/Pages/Admin/AdminDashboard.tsx`
- `DoAnPhanMem/src/Pages/Admin/UserManagement.tsx`
- `DoAnPhanMem/src/Pages/Admin/SystemNotification.tsx`
- `DoAnPhanMem/src/Pages/Admin/AuditLog.tsx`
- `DoAnPhanMem-Backend/src/controllers/adminController.ts`
- `DoAnPhanMem-Backend/src/controllers/notificationController.ts`
- `DoAnPhanMem-Backend/src/middlewares/adminMiddleware.ts`

Commit gợi ý: `fix: polish admin notification and audit flow`

## 5. Khung thuyết trình chia cho 3 người

### Mở đầu - 1 phút

- Giới thiệu bài toán: quản lý công việc cá nhân kết hợp quản trị hệ thống.
- Giới thiệu công nghệ: React, TypeScript, Express, Prisma, PostgreSQL.
- Nói rõ nhóm chia việc theo module, mỗi thành viên phụ trách cả frontend và backend của module mình.

### Người 1 - Xác thực và tài khoản - 4 phút

- Luồng đăng nhập/đăng ký/xác thực email.
- JWT, refresh token, session và ProtectedRoute.
- Demo login, profile, settings, đổi mật khẩu, quản lý phiên đăng nhập.

### Người 2 - Task và nghiệp vụ chính - 4 phút

- Mô hình database task.
- API task/category/tag/subtask/reminder/attachment.
- Demo tạo task, tag, subtask, reminder, file, dashboard, calendar, trash.

### Người 3 - Admin và báo cáo hệ thống - 4 phút

- Middleware phân quyền admin.
- Admin dashboard, user management, notification broadcast.
- Audit log, heatmap, thống kê hệ thống.

### Kết thúc - 1 phút

- Nêu điểm mạnh: đầy đủ CRUD, phân quyền, dashboard, admin, notification, recycle bin, reminder.
- Hướng phát triển: realtime notification, test tự động, deploy Docker, mobile responsive nâng cao.

## 6. Checklist trước khi nộp

- Frontend build được bằng `npm run build`.
- Backend chạy được bằng `npm run dev` hoặc `npm start`.
- `.env` không bị push lên GitHub.
- README có cách cài đặt, cách chạy, biến môi trường cần thiết.
- Có ảnh demo hoặc video demo nếu giảng viên yêu cầu.
- Repo GitHub có commit rõ nội dung của từng thành viên, không chỉ có một commit rỗng.
- Mỗi thành viên nắm được phần mình thuyết trình và file mình phụ trách.
