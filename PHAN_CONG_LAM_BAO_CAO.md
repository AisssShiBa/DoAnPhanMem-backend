# Phân công làm báo cáo đồ án

Tài liệu này dùng để chia phần viết báo cáo theo mẫu cuốn báo cáo đồ án CNPM. Nhóm chia theo module full-stack: mỗi thành viên phụ trách phần giao diện, API, xử lý và dữ liệu của module mình.

## 1. Thông tin chung

Tên đề tài đề xuất: Ứng dụng quản lý công việc cá nhân và quản trị người dùng.

Repository:

- Frontend: `SoftWhere-FrontEnd`
- Backend: `SoftWhere-BackEnd`

Công nghệ:

- Frontend: React, TypeScript, Vite, Tailwind CSS, Axios, Zustand.
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL.
- Xác thực: JWT, refresh token, Google OAuth.

## 2. Chia phần theo cấu trúc báo cáo

### Phần bìa, mục lục, danh sách hình/bảng, từ viết tắt

Người phụ trách: Nhóm trưởng.

Nội dung cần làm:

- Điền tên môn học, tên đề tài, giảng viên hướng dẫn.
- Điền họ tên, MSSV, lớp của 3 thành viên.
- Cập nhật mục lục tự động.
- Cập nhật danh sách hình, bảng.
- Cập nhật danh mục từ viết tắt.

Từ viết tắt gợi ý:

| Từ viết tắt | Ý nghĩa                           |
| ----------- | --------------------------------- |
| UI          | User Interface                    |
| API         | Application Programming Interface |
| JWT         | JSON Web Token                    |
| CRUD        | Create, Read, Update, Delete      |
| DB          | Database                          |
| OAuth       | Open Authorization                |

## 3. Chương I - Tổng quan

Người phụ trách chính: Nhóm trưởng(Đạt).  
Các thành viên còn lại góp ý.

### I. Giới thiệu đề tài

Nội dung cần viết:

- Bối cảnh: sinh viên/người dùng cá nhân cần quản lý công việc, thời hạn, nhắc nhở và tiến độ.
- Vấn đề: dùng ghi chú rời rạc dễ quên deadline, khó thống kê, khó quản lý nhiều loại công việc.
- Giải pháp: xây dựng ứng dụng quản lý công việc có tài khoản, task, lịch, dashboard và quản trị hệ thống.

### II. Mục tiêu đề tài

Nội dung cần viết:

- Cho phép người dùng quản lý công việc cá nhân.
- Hỗ trợ phân loại công việc theo category, tag, trạng thái, deadline.
- Hỗ trợ subtask, reminder và file đính kèm.
- Cung cấp dashboard, calendar và thùng rác.
- Cung cấp trang admin để quản lý người dùng, thông báo và thống kê.

### III. Phạm vi áp dụng

Nội dung cần viết:

- Người dùng cá nhân, sinh viên, nhóm nhỏ cần quản lý công việc.
- Admin quản trị tài khoản và theo dõi hoạt động hệ thống.

### IV. Nền tảng kỹ thuật

Nội dung cần viết:

- Frontend React + TypeScript + Vite.
- Backend Express + TypeScript.
- Prisma ORM và PostgreSQL.
- JWT/refresh token cho xác thực.
- Tailwind CSS cho giao diện.

## 4. Chương II - Phân tích nội dung, yêu cầu

Chương này chia đều cho 3 thành viên theo module.

### I. Nhóm chức năng xác thực và tài khoản

Người phụ trách: Thành viên 1(Thông).

Nội dung cần viết:

- Đăng ký tài khoản.
- Xác thực email.
- Đăng nhập bằng email/mật khẩu.
- Đăng nhập Google.
- Quên mật khẩu, đặt lại mật khẩu.
- Đăng xuất.
- Quản lý hồ sơ cá nhân.
- Đổi mật khẩu.
- Quản lý phiên đăng nhập.

Việc cần làm cụ thể trong mục này:

- Viết 1 đoạn giới thiệu module xác thực: module này dùng để định danh người dùng, bảo vệ dữ liệu cá nhân và phân quyền truy cập hệ thống.
- Liệt kê các actor liên quan: Khách chưa đăng nhập, Người dùng đã đăng nhập, Admin.
- Mô tả từng chức năng theo format: mục đích, điều kiện đầu vào, xử lý chính, kết quả đầu ra.
- Viết rõ điều kiện hợp lệ khi đăng ký: email đúng định dạng, email chưa tồn tại, mật khẩu hợp lệ.
- Viết rõ điều kiện đăng nhập: tài khoản tồn tại, mật khẩu đúng, tài khoản không bị khóa.
- Viết rõ refresh token dùng để duy trì phiên đăng nhập mà không bắt user đăng nhập lại liên tục.
- Viết rõ người dùng chỉ được xem/sửa hồ sơ của chính mình.
- Chuẩn bị ít nhất 1 bảng API cho nhóm `/api/auth` và `/api/profile`.
- Chuẩn bị ít nhất 1 bảng test cho đăng ký, đăng nhập, quên mật khẩu, đổi mật khẩu.

Ảnh/sơ đồ nên đưa vào mục này:

- Ảnh màn hình đăng nhập.
- Ảnh màn hình đăng ký.
- Ảnh màn hình quên mật khẩu hoặc đặt lại mật khẩu.
- Ảnh màn hình hồ sơ/cài đặt.
- Activity diagram đăng nhập.
- Activity diagram quên mật khẩu.

Bảng yêu cầu chức năng gợi ý:

| STT | Chức năng      | Loại công việc | Quy định/Ghi chú                                    |
| --- | -------------- | -------------- | --------------------------------------------------- |
| 1   | Đăng ký        | Lưu trữ        | Email duy nhất, mật khẩu hợp lệ                     |
| 2   | Xác thực email | Xử lý          | Token xác thực có thời hạn                          |
| 3   | Đăng nhập      | Tra cứu/Xử lý  | Kiểm tra email, mật khẩu, trạng thái tài khoản      |
| 4   | Làm mới token  | Xử lý          | Dùng refresh token để cấp access token mới          |
| 5   | Quên mật khẩu  | Xử lý          | Gửi link đặt lại mật khẩu qua email                 |
| 6   | Cập nhật hồ sơ | Cập nhật       | Chỉ user đang đăng nhập được sửa thông tin của mình |

### II. Nhóm chức năng quản lý công việc

Người phụ trách: Thành viên 2(Đạt).

Nội dung cần viết:

- Tạo, xem, sửa, xóa task.
- Phân loại task theo category.
- Gắn tag cho task.
- Tạo subtask.
- Tạo reminder.
- Upload file đính kèm.
- Xem dashboard thống kê.
- Xem lịch công việc.
- Đưa task vào thùng rác, khôi phục, xóa vĩnh viễn.

Việc cần làm cụ thể trong mục này:

- Viết 1 đoạn giới thiệu module quản lý công việc: đây là nghiệp vụ chính của hệ thống, cho phép người dùng tổ chức và theo dõi tiến độ công việc.
- Mô tả vòng đời của một task: tạo mới, cập nhật, hoàn thành, đưa vào thùng rác, khôi phục hoặc xóa vĩnh viễn.
- Viết rõ các thuộc tính chính của task: tiêu đề, mô tả, ngày bắt đầu, deadline, mức ưu tiên, trạng thái, category.
- Viết rõ category dùng để phân nhóm task.
- Viết rõ tag dùng để gắn nhiều nhãn linh hoạt cho task.
- Viết rõ subtask dùng để chia nhỏ công việc.
- Viết rõ reminder dùng để nhắc hạn.
- Viết rõ attachment dùng để lưu file liên quan đến task.
- Viết rõ dashboard dùng để thống kê số lượng task, task hoàn thành, task sắp đến hạn.
- Viết rõ calendar dùng để xem task theo ngày.
- Viết rõ trash dùng soft delete, không xóa ngay khỏi database.
- Chuẩn bị bảng API cho `/api/tasks`, `/api/categories`, `/api/tags`, `/api/dashboard`.
- Chuẩn bị bảng test cho tạo task, sửa task, xóa task, khôi phục task, thêm tag, thêm subtask, thêm reminder.

Ảnh/sơ đồ nên đưa vào mục này:

- Ảnh màn hình danh sách task.
- Ảnh form tạo/sửa task.
- Ảnh dashboard người dùng.
- Ảnh calendar.
- Ảnh trash.
- Use case quản lý công việc.
- Activity diagram tạo task.
- Activity diagram xóa mềm và khôi phục task.

Bảng yêu cầu chức năng gợi ý:

| STT | Chức năng         | Loại công việc | Quy định/Ghi chú                           |
| --- | ----------------- | -------------- | ------------------------------------------ |
| 1   | Tạo task          | Lưu trữ        | Bắt buộc có tiêu đề                        |
| 2   | Cập nhật task     | Cập nhật       | Chỉ chủ sở hữu task được sửa               |
| 3   | Xóa task          | Cập nhật       | Xóa mềm vào thùng rác                      |
| 4   | Khôi phục task    | Cập nhật       | Task trong thùng rác được đưa về danh sách |
| 5   | Xóa vĩnh viễn     | Xóa            | Không khôi phục được                       |
| 6   | Gắn tag/category  | Cập nhật       | Tag/category thuộc user hiện tại           |
| 7   | Tạo reminder      | Lưu trữ        | Reminder gắn với task                      |
| 8   | Upload attachment | Lưu trữ        | File gắn với task                          |
| 9   | Dashboard         | Trích xuất     | Thống kê theo trạng thái, deadline, tuần   |
| 10  | Calendar          | Trích xuất     | Hiển thị task theo ngày                    |

### III. Nhóm chức năng admin và thông báo

Người phụ trách: Thành viên 3(kiệt).

Nội dung cần viết:

- Admin dashboard.
- Xem danh sách người dùng.
- Tìm kiếm/lọc user.
- Khóa/mở tài khoản.
- Reset mật khẩu người dùng.
- Gửi thông báo hệ thống.
- Xem lịch sử thông báo.
- Xem audit log.
- Xem heatmap hoạt động.

Việc cần làm cụ thể trong mục này:

- Viết 1 đoạn giới thiệu module admin: module này dùng cho quản trị viên theo dõi hệ thống, quản lý người dùng và gửi thông báo.
- Liệt kê actor liên quan: Admin và Người dùng.
- Viết rõ admin dashboard hiển thị các chỉ số tổng quan như số user, số task, mức độ hoạt động.
- Viết rõ chức năng quản lý user: xem danh sách, tìm kiếm, lọc, xem chi tiết.
- Viết rõ chức năng khóa/mở tài khoản: tài khoản bị khóa không được đăng nhập hoặc sử dụng hệ thống.
- Viết rõ chức năng reset mật khẩu user.
- Viết rõ chức năng gửi thông báo hệ thống đến nhiều người dùng.
- Viết rõ audit log dùng để theo dõi hoạt động quan trọng trong hệ thống.
- Viết rõ heatmap dùng để trực quan hóa mức độ hoạt động theo thời gian.
- Chuẩn bị bảng API cho `/api/admin` và `/api/notifications`.
- Chuẩn bị bảng phân quyền giữa User thường và Admin.
- Chuẩn bị bảng test cho khóa user, mở user, gửi thông báo, xem log.

Ảnh/sơ đồ nên đưa vào mục này:

- Ảnh admin dashboard.
- Ảnh quản lý người dùng.
- Ảnh gửi thông báo hệ thống.
- Ảnh audit log.
- Ảnh heatmap.
- Use case admin.
- Activity diagram khóa/mở tài khoản.
- Activity diagram gửi thông báo.

Bảng yêu cầu chức năng gợi ý:

| STT | Chức năng           | Loại công việc   | Quy định/Ghi chú                          |
| --- | ------------------- | ---------------- | ----------------------------------------- |
| 1   | Xem dashboard admin | Trích xuất       | Chỉ admin truy cập                        |
| 2   | Quản lý user        | Tra cứu/Cập nhật | Chỉ admin có quyền                        |
| 3   | Khóa/mở tài khoản   | Cập nhật         | Không cho user bị khóa đăng nhập          |
| 4   | Reset mật khẩu user | Xử lý            | Admin tạo mật khẩu mới hoặc gửi thông báo |
| 5   | Gửi thông báo       | Lưu trữ          | Gửi đến nhiều người dùng                  |
| 6   | Xem audit log       | Trích xuất       | Theo dõi hoạt động hệ thống               |
| 7   | Xem heatmap         | Trích xuất       | Thống kê mức độ hoạt động theo thời gian  |

### IV. Yêu cầu chất lượng

Người phụ trách: Nhóm trưởng tổng hợp.

Nội dung cần viết:

- Bảo mật: mật khẩu mã hóa, JWT, phân quyền user/admin.
- Dễ sử dụng: giao diện rõ ràng, thao tác nhanh.
- Khả năng mở rộng: tách frontend/backend, API REST, Prisma ORM.
- Hiệu năng: truy vấn theo user, phân trang/lọc nếu cần.
- Khả năng bảo trì: chia controller, route, service, schema rõ ràng.

Việc cần làm cụ thể trong mục này:

- Viết thành các nhóm yêu cầu phi chức năng: bảo mật, hiệu năng, dễ sử dụng, bảo trì, mở rộng.
- Với mỗi yêu cầu, ghi rõ hệ thống đã đáp ứng bằng cách nào.
- Bảo mật: nêu mã hóa mật khẩu, JWT, refresh token, phân quyền admin.
- Hiệu năng: nêu truy vấn theo user, có thể lọc task theo trạng thái/category/date.
- Dễ sử dụng: nêu giao diện chia rõ user/admin, form nhập liệu dễ thao tác.
- Bảo trì: nêu backend tách route/controller/schema, frontend tách page/service/component.
- Mở rộng: nêu có thể thêm realtime notification, mobile app, Docker deployment.

## 5. Chương III - Phân tích thiết kế

### I. Sơ đồ use case

Người phụ trách: (Thông).

Chia sơ đồ:

- Thành viên 1: Use case Người dùng - xác thực và hồ sơ.
- Thành viên 2: Use case Người dùng - quản lý công việc.
- Thành viên 3: Use case Admin - quản trị hệ thống.

Actor gợi ý:

- Khách chưa đăng nhập.
- Người dùng.
- Admin.

Việc cần làm cụ thể trong mục này:

- Vẽ 1 sơ đồ use case tổng quát cho toàn hệ thống.
- Trong sơ đồ phải có 3 actor: Khách, Người dùng, Admin.
- Khách có use case: đăng ký, đăng nhập, quên mật khẩu, xác thực email.
- Người dùng có use case: quản lý task, category, tag, subtask, reminder, attachment, dashboard, calendar, trash, profile.
- Admin có use case: quản lý user, xem thống kê, gửi thông báo, xem audit log, xem heatmap.
- Sau sơ đồ, viết 1 đoạn giải thích ngắn từng actor có quyền gì.
- Hình cần đặt tên gợi ý: "Hình 3.1. Sơ đồ use case tổng quát".

### II. Sơ đồ hoạt động

Người phụ trách:

- Thành viên 1: Activity đăng nhập, refresh token, quên mật khẩu.
- Thành viên 2: Activity tạo task, xóa mềm/khôi phục task.
- Thành viên 3: Activity admin khóa user, gửi thông báo.

Việc cần làm cụ thể trong mục này:

- Thành viên 1 vẽ activity đăng nhập: nhập email/mật khẩu, validate, kiểm tra DB, tạo token, chuyển vào trang user.
- Thành viên 1 vẽ activity quên mật khẩu: nhập email, tạo reset token, gửi email, đặt lại mật khẩu.
- Thành viên 2 vẽ activity tạo task: nhập thông tin, validate, lưu task, gắn category/tag/reminder nếu có.
- Thành viên 2 vẽ activity xóa task: chọn task, xác nhận, cập nhật `is_deleted`, chuyển sang trash.
- Thành viên 3 vẽ activity khóa user: admin chọn user, xác nhận, cập nhật trạng thái, ghi log.
- Thành viên 3 vẽ activity gửi thông báo: nhập tiêu đề/nội dung, chọn đối tượng, lưu notification.
- Mỗi sơ đồ cần có chú thích ngắn bên dưới hình.

### III. Thiết kế cơ sở dữ liệu

Người phụ trách chính: Thành viên 2(Đạt).

Các bảng cần trình bày:

- `Users`
- `Roles`
- `refresh_tokens`
- `User_Settings`
- `Tasks`
- `Categories`
- `Tags`
- `Task_Tags`
- `SubTasks`
- `Reminders`
- `Task_Attachments`
- `User_Notifications`
- `Activity_Logs`

Việc cần làm cụ thể trong mục này:

- Vẽ ERD hoặc sơ đồ quan hệ giữa các bảng chính.
- Viết bảng mô tả từng bảng trong database.
- Với mỗi bảng, ghi các cột quan trọng, kiểu dữ liệu, khóa chính, khóa ngoại nếu có.
- Thành viên 1 viết phần bảng liên quan tài khoản: `Users`, `Roles`, `refresh_tokens`, `User_Settings`.
- Thành viên 2 viết phần bảng nghiệp vụ task: `Tasks`, `Categories`, `Tags`, `Task_Tags`, `SubTasks`, `Reminders`, `Task_Attachments`.
- Thành viên 3 viết phần bảng admin/thông báo: `User_Notifications`, `Activity_Logs`.
- Giải thích quan hệ 1-nhiều giữa User và Task, User và Category, User và Notification.
- Giải thích quan hệ nhiều-nhiều giữa Task và Tag qua bảng `Task_Tags`.
- Giải thích soft delete bằng các trường `is_deleted`, `deleted_at`.

### IV. Thiết kế giao diện

Người phụ trách:

- Thành viên 1(thông): Login, Register, Forgot Password, Reset Password, Settings, Sessions.
- Thành viên 2(đạt): Task List, Dashboard, Calendar, Trash.
- Thành viên 3(kiệt): Admin Dashboard, User Management, Notification, Audit Log, Heatmap.

Mỗi màn hình nên có:

- Ảnh chụp giao diện.
- Mô tả chức năng chính.
- Dữ liệu/API liên quan.

Việc cần làm cụ thể trong mục này:

- Mỗi thành viên chọn tối thiểu 3 màn hình thuộc module của mình để đưa vào báo cáo.
- Mỗi màn hình cần có ảnh, tên màn hình, mục đích sử dụng, thao tác chính.
- Thành viên 1: mô tả Login, Register, Settings/Profile.
- Thành viên 2: mô tả Task List, Dashboard, Calendar hoặc Trash.
- Thành viên 3: mô tả Admin Dashboard, User Management, Notification hoặc Audit Log.
- Dưới mỗi hình, ghi API liên quan nếu có.
- Ví dụ: màn hình Task List dùng `/api/tasks`, `/api/categories`, `/api/tags`.

### V. Thiết kế xử lý

Người phụ trách:

- Thành viên 1(THông): xử lý token, refresh token, protected route.
- Thành viên 2(Đạt): xử lý CRUD task, tag/category, reminder, upload file, trash.
- Thành viên 3(kiệt): xử lý phân quyền admin, gửi thông báo, audit log.

Việc cần làm cụ thể trong mục này:

- Thành viên 1 viết luồng xử lý access token và refresh token giữa frontend/backend.
- Thành viên 1 giải thích frontend dùng Axios interceptor để gắn token và xử lý lỗi hết hạn token.
- Thành viên 2 viết luồng xử lý tạo task từ frontend đến backend và database.
- Thành viên 2 viết luồng xử lý attachment/reminder nếu có đủ thời gian.
- Thành viên 2 viết luồng xử lý trash: xóa mềm, restore, xóa vĩnh viễn.
- Thành viên 3 viết luồng xử lý admin middleware kiểm tra quyền.
- Thành viên 3 viết luồng xử lý gửi notification và ghi audit log.
- Mỗi luồng xử lý nên có mô tả 5-7 bước, không chỉ ghi tên chức năng.

## 6. Chương IV - Phát triển/Thực thi

Chương này nên chia theo đúng 3 module để mỗi người trình bày phần mình làm.

### I. Module xác thực và hồ sơ người dùng

Người phụ trách: Thành viên 1(Thông).

Nội dung cần có:

- Màn hình đăng nhập/đăng ký.
- Màn hình xác thực email/quên mật khẩu/đặt lại mật khẩu.
- Màn hình hồ sơ/cài đặt/phiên đăng nhập.
- API liên quan: `/api/auth`, `/api/profile`.
- Cách frontend lưu và gửi token.

Việc cần làm cụ thể trong mục này:

- Chụp hình và mô tả màn hình login/register.
- Chụp hình và mô tả màn hình forgot/reset password nếu có.
- Chụp hình và mô tả màn hình settings/profile.
- Trình bày các API chính: đăng ký, đăng nhập, refresh token, logout, profile.
- Viết đoạn giải thích cách backend kiểm tra mật khẩu và tạo token.
- Viết đoạn giải thích cách frontend lưu trạng thái đăng nhập và bảo vệ route.
- Nêu lỗi thường gặp và cách xử lý: sai mật khẩu, email chưa xác thực, token hết hạn.
- Kết thúc mục bằng kết quả đạt được của module auth.

### II. Module quản lý công việc

Người phụ trách: Thành viên 2(đạt).

Nội dung cần có:

- Màn hình danh sách công việc.
- Tạo/sửa/xóa task.
- Category, tag, subtask, reminder.
- File đính kèm.
- Dashboard và calendar.
- Thùng rác, restore, permanent delete.
- API liên quan: `/api/tasks`, `/api/categories`, `/api/tags`, `/api/dashboard`.

Việc cần làm cụ thể trong mục này:

- Chụp hình danh sách task và giải thích các vùng chính trên giao diện.
- Chụp hình form tạo/sửa task và giải thích các trường dữ liệu.
- Chụp hình dashboard và giải thích các chỉ số.
- Chụp hình calendar và giải thích cách hiển thị task theo ngày.
- Chụp hình trash và giải thích soft delete/restore.
- Trình bày các API chính: task CRUD, category, tag, subtask, reminder, attachment, dashboard.
- Viết đoạn giải thích cách backend đảm bảo user chỉ thao tác trên task của mình.
- Viết đoạn giải thích dữ liệu task liên kết với category/tag/subtask/reminder.
- Kết thúc mục bằng kết quả đạt được của module task.

### III. Module quản trị hệ thống

Người phụ trách: Thành viên 3(kiệt).

Nội dung cần có:

- Admin dashboard.
- Quản lý người dùng.
- Gửi thông báo hệ thống.
- Audit log.
- Heatmap hoạt động.
- API liên quan: `/api/admin`, `/api/notifications`.

Việc cần làm cụ thể trong mục này:

- Chụp hình admin dashboard và giải thích các chỉ số tổng quan.
- Chụp hình user management và giải thích thao tác tìm kiếm/lọc/khóa user.
- Chụp hình notification và giải thích gửi thông báo hệ thống.
- Chụp hình audit log và giải thích ý nghĩa log.
- Chụp hình heatmap và giải thích ý nghĩa thống kê hoạt động.
- Trình bày các API chính: admin stats, users, user status, broadcast notification, audit logs, heatmap.
- Viết đoạn giải thích middleware phân quyền admin.
- Viết đoạn giải thích vì sao user thường không truy cập được route admin.
- Kết thúc mục bằng kết quả đạt được của module admin.

## 7. Chương V - Triển khai

Người phụ trách: Nhóm trưởng(đạt).

### I. Cài đặt

Nội dung cần viết:

- Yêu cầu môi trường: Node.js, npm, PostgreSQL.
- Cách chạy backend.
- Cách chạy frontend.
- Cấu hình `.env`.
- Cách chạy Prisma generate/migrate/seed nếu có.

Ví dụ lệnh:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Việc cần làm cụ thể trong mục này:

- Ghi rõ phiên bản môi trường khuyến nghị: Node.js, npm, PostgreSQL.
- Ghi rõ cách clone repo frontend và backend.
- Ghi rõ cách cài dependency cho frontend.
- Ghi rõ cách cài dependency cho backend.
- Ghi rõ cách tạo file `.env` từ `.env.example`.
- Ghi rõ các biến môi trường quan trọng: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `VITE_API_URL`.
- Ghi rõ cách chạy Prisma generate/migrate/seed nếu nhóm có dùng.
- Ghi rõ port chạy frontend và backend.
- Nếu có tài khoản demo thì ghi ở đây hoặc phụ lục.

### II. Thử nghiệm

Chia test:

- Thành viên 1(Thông) test auth/profile/session.
- Thành viên 2(đạt) test task/dashboard/calendar/trash.
- Thành viên 3(kiệt) test admin/notification/audit.

Bảng test gợi ý:

| STT | Chức năng test           | Kết quả mong đợi               | Kết quả thực tế |
| --- | ------------------------ | ------------------------------ | --------------- |
| 1   | Đăng nhập đúng tài khoản | Vào được trang user            | Đạt             |
| 2   | Tạo task mới             | Task xuất hiện trong danh sách | Đạt             |
| 3   | Xóa task                 | Task vào thùng rác             | Đạt             |
| 4   | Admin khóa user          | User không đăng nhập được      | Đạt             |
| 5   | Gửi thông báo            | User nhận được thông báo       | Đạt             |

Việc cần làm cụ thể trong mục này:

- Mỗi thành viên chuẩn bị tối thiểu 5 test case cho module của mình.
- Thành viên 1 test: đăng ký, đăng nhập, đăng xuất, quên mật khẩu, đổi mật khẩu.
- Thành viên 2 test: tạo task, sửa task, xóa task, restore task, thêm reminder/tag/subtask.
- Thành viên 3 test: xem dashboard admin, khóa user, mở user, gửi thông báo, xem audit log.
- Mỗi test case cần có: bước thực hiện, dữ liệu nhập, kết quả mong đợi, kết quả thực tế.
- Nếu có lỗi đã sửa trong quá trình demo, ghi ngắn gọn lỗi và cách xử lý.

## 8. Chương VI - Kết luận

Người phụ trách: (kiệt).

### I. Kết quả đã thực hiện

Nội dung cần viết:

- Hoàn thành đăng ký/đăng nhập/xác thực.
- Hoàn thành quản lý công việc.
- Hoàn thành dashboard, calendar, trash.
- Hoàn thành admin dashboard, user management, notification, audit log.

Việc cần làm cụ thể trong mục này:

- Liệt kê kết quả theo 3 nhóm module: Auth, Task, Admin.
- Với mỗi module, ghi 3-5 chức năng đã hoàn thành.
- Nêu rõ hệ thống đã có frontend, backend và database kết nối được với nhau.
- Không ghi chức năng chưa làm hoặc chưa demo được.

### II. Ưu điểm và hạn chế

Ưu điểm:

- Chức năng tương đối đầy đủ.
- Có phân quyền user/admin.
- Có dashboard và thống kê.
- Có soft delete, reminder, file attachment.

Hạn chế:

- Chưa có test tự động đầy đủ.
- Chưa tối ưu realtime notification.
- Chưa triển khai Docker hoặc CI/CD hoàn chỉnh.

Việc cần làm cụ thể trong mục này:

- Ưu điểm nên viết theo điểm mạnh thật của hệ thống: full-stack, phân quyền, dashboard, soft delete, notification.
- Hạn chế nên viết vừa phải, không làm hệ thống bị đánh giá quá yếu.
- Không nên ghi hạn chế kiểu "chưa hoàn thành chức năng chính".
- Nên ghi hạn chế theo hướng có thể phát triển tiếp: test, realtime, deployment, UI responsive.

### III. Hướng mở rộng

Gợi ý:

- Realtime notification bằng WebSocket.
- Mobile responsive nâng cao.
- Thêm test unit/integration.
- Thêm Docker deployment.
- Thêm phân quyền chi tiết hơn cho admin.
  |

Việc cần làm cụ thể trong mục này:

- Viết 4-6 hướng phát triển tương lai.
- Ưu tiên các hướng phù hợp với code hiện tại: realtime notification, Docker, CI/CD, mobile responsive, test tự động.
- Có thể thêm hướng tích hợp lịch Google Calendar hoặc gửi email reminder nâng cao.
- Mỗi hướng mở rộng chỉ cần 1-2 câu giải thích.

## 10. Gợi ý số trang

Nếu báo cáo khoảng 30-40 trang:

- Chương I: 3-4 trang.
- Chương II: 6-8 trang.
- Chương III: 8-10 trang.
- Chương IV: 10-14 trang.
- Chương V: 3-4 trang.
- Chương VI: 2 trang.

Phần quản lý công việc của Thành viên 2 sẽ dài nhất vì đây là nghiệp vụ chính của hệ thống.

## 11. Việc cần làm chi tiết cho từng thành viên

Phần này dùng để giao việc cụ thể khi viết báo cáo. Mỗi thành viên nên viết nội dung của mình vào file Word theo đúng chương/mục được phân công, đồng thời chuẩn bị hình ảnh minh họa và bảng mô tả chức năng.

### 11.1. Thành viên 1(Thông) - Xác thực, tài khoản, hồ sơ cá nhân

Phần cần viết trong báo cáo:

- Viết mô tả module xác thực người dùng.
- Viết luồng đăng ký tài khoản.
- Viết luồng xác thực email.
- Viết luồng đăng nhập bằng email/mật khẩu.
- Viết luồng đăng nhập Google OAuth.
- Viết luồng quên mật khẩu và đặt lại mật khẩu.
- Viết luồng đăng xuất.
- Viết luồng refresh token/session.
- Viết phần quản lý hồ sơ cá nhân.
- Viết phần cài đặt tài khoản và đổi mật khẩu.
- Viết phần quản lý phiên đăng nhập.

Hình ảnh cần chuẩn bị:

- Màn hình đăng nhập.
- Màn hình đăng ký.
- Màn hình xác thực email.
- Màn hình quên mật khẩu.
- Màn hình đặt lại mật khẩu.
- Màn hình hồ sơ/cài đặt.
- Màn hình quản lý phiên đăng nhập nếu có.

Bảng cần chuẩn bị:

| STT | Nội dung                        | Ghi chú                                    |
| --- | ------------------------------- | ------------------------------------------ |
| 1   | Bảng yêu cầu chức năng xác thực | Đăng ký, đăng nhập, logout, refresh token  |
| 2   | Bảng kiểm thử auth              | Test login đúng/sai, token hết hạn, logout |
| 3   | Bảng API auth/profile           | Endpoint, method, request, response        |

Sơ đồ nên vẽ:

- Activity diagram đăng nhập.
- Activity diagram quên mật khẩu.
- Sequence diagram refresh token nếu kịp.

File code nên tham chiếu khi viết:

- Frontend: `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `VerifyEmail.tsx`, `Settings.tsx`, `Sessions.tsx`.
- Frontend service: `authService.ts`, `sessionService.ts`, `axios.ts`, `authStore.ts`, `ProtectedRoute.tsx`.
- Backend: `authController.ts`, `profileController.ts`, `authRoute.ts`, `profileRouter.ts`, `authMiddleware.ts`, `passport.ts`, `mailService.ts`.

Kết quả cần nộp cho nhóm trưởng:

- Nội dung Word phần auth/profile/session.
- Ảnh màn hình đã đặt tên rõ ràng.
- Bảng API auth/profile.
- Bảng test chức năng auth.

### 11.2. Thành viên 2(Đạt) - Quản lý công việc và dữ liệu nghiệp vụ

Phần cần viết trong báo cáo:

- Viết mô tả module quản lý công việc.
- Viết phần tạo, xem, sửa, xóa task.
- Viết phần cập nhật trạng thái task.
- Viết phần priority, deadline, start date, due date.
- Viết phần category.
- Viết phần tag.
- Viết phần subtask.
- Viết phần reminder.
- Viết phần file đính kèm.
- Viết phần dashboard người dùng.
- Viết phần calendar.
- Viết phần thùng rác, khôi phục task, xóa vĩnh viễn.
- Viết phần thiết kế database nghiệp vụ.

Hình ảnh cần chuẩn bị:

- Màn hình danh sách task.
- Form tạo task.
- Form sửa task.
- Màn hình chi tiết task nếu có.
- Màn hình category/tag.
- Màn hình subtask/reminder.
- Màn hình upload file.
- Màn hình dashboard.
- Màn hình calendar.
- Màn hình trash.

Bảng cần chuẩn bị:

| STT | Nội dung                    | Ghi chú                                      |
| --- | --------------------------- | -------------------------------------------- |
| 1   | Bảng yêu cầu chức năng task | CRUD, filter, status, deadline               |
| 2   | Bảng database nghiệp vụ     | Tasks, Categories, Tags, SubTasks, Reminders |
| 3   | Bảng API task               | Endpoint, method, request, response          |
| 4   | Bảng kiểm thử task          | Tạo/sửa/xóa/restore/upload/reminder          |

Sơ đồ nên vẽ:

- Use case quản lý công việc.
- Activity diagram tạo task.
- Activity diagram xóa task vào thùng rác và khôi phục.
- ERD hoặc sơ đồ quan hệ database.

File code nên tham chiếu khi viết:

- Frontend: `TaskList.tsx`, `Dashboard.tsx`, `CalendarView.tsx`, `trashPage.tsx`, `TaskItem.tsx`, `PomodoroTimer.tsx`.
- Frontend service: `dashboardService.ts`.
- Backend: `taskController.ts`, `categoryController.ts`, `tagController.ts`, `subtaskController.ts`, `reminderController.ts`, `attachmentController.ts`, `Trashcontroller.ts`, `dashboardController.ts`.
- Backend route: `taskRoute.ts`, `categoryRoute.ts`, `tagRoute.ts`, `subtaskRoute.ts`, `dashboardRoute.ts`.
- Database: `schema.prisma`.

Kết quả cần nộp cho nhóm trưởng:

- Nội dung Word phần task/database/dashboard/calendar.
- Ảnh màn hình module task.
- Bảng API task/category/tag/subtask/reminder.
- Bảng database nghiệp vụ.
- Bảng test chức năng task.

### 11.3. Thành viên 3(Kiệt) - Admin, thông báo, audit log

Phần cần viết trong báo cáo:

- Viết mô tả module quản trị hệ thống.
- Viết phần phân quyền admin.
- Viết phần admin dashboard.
- Viết phần quản lý danh sách người dùng.
- Viết phần tìm kiếm/lọc người dùng.
- Viết phần khóa/mở tài khoản.
- Viết phần reset mật khẩu người dùng.
- Viết phần gửi thông báo hệ thống.
- Viết phần lịch sử thông báo.
- Viết phần notification người dùng.
- Viết phần audit log.
- Viết phần heatmap hoạt động.
- Viết phần thống kê DAU/MAU nếu có dùng trong giao diện.

Hình ảnh cần chuẩn bị:

- Màn hình admin dashboard.
- Màn hình user management.
- Dialog khóa/mở tài khoản.
- Màn hình gửi thông báo hệ thống.
- Màn hình lịch sử thông báo.
- Màn hình audit log.
- Màn hình heatmap hoạt động.

Bảng cần chuẩn bị:

| STT | Nội dung                     | Ghi chú                              |
| --- | ---------------------------- | ------------------------------------ |
| 1   | Bảng yêu cầu chức năng admin | Dashboard, user, notification, audit |
| 2   | Bảng API admin               | Endpoint, method, quyền truy cập     |
| 3   | Bảng kiểm thử admin          | Khóa user, gửi thông báo, xem log    |
| 4   | Bảng phân quyền              | User thường và Admin                 |

Sơ đồ nên vẽ:

- Use case admin.
- Activity diagram admin khóa/mở tài khoản user.
- Activity diagram gửi thông báo hệ thống.
- Activity diagram xem audit log/heatmap nếu cần.

File code nên tham chiếu khi viết:

- Frontend: `AdminLayout.tsx`, `AdminDashboard.tsx`, `UserManagement.tsx`, `SystemNotification.tsx`, `AuditLog.tsx`, `UserActivityHeatmap.tsx`.
- Frontend components: `ConfirmDialog.tsx`, `CommandPalette.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `Skeleton.tsx`.
- Frontend service: `adminService.ts`, `notificationService.ts`.
- Backend: `adminController.ts`, `notificationController.ts`, `HeatmapController.ts`.
- Backend route/middleware: `adminRoute.ts`, `notificationRoute.ts`, `adminMiddleware.ts`.

Kết quả cần nộp cho nhóm trưởng:

- Nội dung Word phần admin/notification/audit.
- Ảnh màn hình admin.
- Bảng API admin/notification.
- Bảng phân quyền.
- Bảng test chức năng admin.

### 11.4. Nhóm trưởng - Tổng hợp và hoàn thiện báo cáo

Phần cần làm:

- Nhận nội dung Word từ 3 thành viên.
- Ghép vào đúng chương/mục.
- Chỉnh font, căn lề, heading.
- Đánh số hình, bảng.
- Tạo mục lục tự động.
- Tạo danh sách hình/bảng.
- Chuẩn hóa tên hình và tên bảng.
- Viết phần mở đầu, kết luận, ưu/nhược điểm, hướng phát triển.
- Kiểm tra chính tả và thuật ngữ.
- Kiểm tra nội dung báo cáo khớp với code và demo.

Phần cần tự viết:

- Bìa báo cáo.
- Chương I - Tổng quan.
- Chương V - Triển khai.
- Chương VI - Kết luận.
- Danh mục từ viết tắt.
- Tài liệu tham khảo.

Checklist tổng hợp:

| STT | Việc cần kiểm tra                         | Trạng thái |
| --- | ----------------------------------------- | ---------- |
| 1   | Đủ thông tin bìa                          | Chưa/Đã    |
| 2   | Mục lục tự động đúng trang                | Chưa/Đã    |
| 3   | Danh sách hình/bảng đầy đủ                | Chưa/Đã    |
| 4   | Chương II đủ yêu cầu chức năng            | Chưa/Đã    |
| 5   | Chương III đủ sơ đồ và database           | Chưa/Đã    |
| 6   | Chương IV đủ hình minh họa màn hình       | Chưa/Đã    |
| 7   | Chương V có hướng dẫn cài đặt/test        | Chưa/Đã    |
| 8   | Chương VI có kết luận và hướng phát triển | Chưa/Đã    |
| 9   | Không nhắc chức năng không có trong code  | Chưa/Đã    |
| 10  | File Word xuất PDF không lỗi font         | Chưa/Đã    |

## 12. Quy định đặt tên file khi gửi cho nhóm trưởng

Mỗi thành viên nên gửi file theo mẫu:

```txt
TV1_Auth_Profile.docx
TV2_Task_Database.docx
TV3_Admin_Notification.docx
```

Ảnh minh họa nên đặt trong thư mục riêng:

```txt
Hinh_TV1/
Hinh_TV2/
Hinh_TV3/
```

Cách đặt tên ảnh:

```txt
TV1_Login.png
TV1_Register.png
TV2_TaskList.png
TV2_Dashboard.png
TV3_AdminDashboard.png
TV3_AuditLog.png
```

## 13. Thứ tự làm báo cáo đề xuất

1. Mỗi thành viên chụp màn hình module của mình.
2. Mỗi thành viên viết Chương II phần yêu cầu chức năng của mình.
3. Mỗi thành viên viết Chương III phần thiết kế của mình.
4. Mỗi thành viên viết Chương IV phần thực thi của mình.
5. Nhóm trưởng viết Chương I, V, VI.
6. Nhóm trưởng ghép file, chỉnh format.
7. Cả nhóm đọc lại và sửa lỗi.
8. Xuất PDF và nộp.
