# -*- coding: utf-8 -*-
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import shutil
import tempfile


ROOT = Path.cwd()
OUTPUT = ROOT / "Phan_Chia_Nhiem_Vu_Viet_Bao_Cao_Ro_Rang.docx"


def p(text: str, style: str | None = None) -> str:
    style_xml = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
    return f"<w:p>{style_xml}<w:r><w:t xml:space=\"preserve\">{escape(text)}</w:t></w:r></w:p>"


def bullet(text: str) -> str:
    return (
        "<w:p>"
        '<w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>'
        f'<w:r><w:t xml:space="preserve">{escape(text)}</w:t></w:r>'
        "</w:p>"
    )


def table(rows: list[list[str]]) -> str:
    xml = (
        '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/>'
        '<w:tblW w:w="0" w:type="auto"/>'
        "<w:tblBorders>"
        '<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
        "</w:tblBorders></w:tblPr>"
    )
    for row in rows:
        xml += "<w:tr>"
        for cell in row:
            xml += (
                '<w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/></w:tcPr>'
                f'<w:p><w:r><w:t xml:space="preserve">{escape(cell)}</w:t></w:r></w:p>'
                "</w:tc>"
            )
        xml += "</w:tr>"
    return xml + "</w:tbl>"


body = ""
body += p("Bản Phân Chia Nhiệm Vụ Viết Báo Cáo Đồ Án", "Title")
body += p("Dựa trên BAO_CAO_PHAN_CONG.md và PHAN_CONG_LAM_BAO_CAO.md", "Subtitle")

body += p("1. Nguyên Tắc Chia Báo Cáo", "Heading1")
body += p(
    "Báo cáo nên chia theo module chức năng full-stack, không chia tách riêng frontend và backend. "
    "Lý do là khi bảo vệ, giảng viên thường hỏi theo luồng chức năng: đăng nhập hoạt động ra sao, task lưu như thế nào, admin phân quyền thế nào. "
    "Vì vậy mỗi thành viên cần nắm cả giao diện, API backend và database của module mình."
)
for item in [
    "Thành viên 1 viết phần xác thực, tài khoản, hồ sơ cá nhân và phiên đăng nhập.",
    "Thành viên 2 viết phần quản lý công việc, dashboard, calendar, reminder và database nghiệp vụ.",
    "Thành viên 3 viết phần admin, thông báo, audit log, heatmap và phân quyền admin.",
    "Nhóm trưởng tổng hợp bố cục, chương tổng quan, triển khai, kết luận, format Word và kiểm tra nội dung cuối.",
]:
    body += bullet(item)

body += p("2. Bảng Chia Việc Tổng Quát", "Heading1")
body += table(
    [
        ["Người", "Phần chính", "Chương/mục phụ trách", "Sản phẩm phải nộp"],
        ["Thông", "Auth, Profile, Session", "Chương II, III, IV phần xác thực và tài khoản", "Nội dung Word, ảnh màn hình auth, bảng API, bảng test, sơ đồ đăng nhập/refresh token"],
        ["Đạt", "Task, Dashboard, Calendar, Reminder", "Chương II, III, IV phần nghiệp vụ chính và database", "Nội dung Word, ảnh task/dashboard/calendar, bảng API task, bảng database, bảng test"],
        ["Kiệt", "Admin, Notification, Audit Log", "Chương II, III, IV phần admin và báo cáo hệ thống", "Nội dung Word, ảnh admin, bảng API admin, bảng phân quyền, bảng test"],
        ["Nhóm trưởng", "Tổng hợp báo cáo", "Bìa, mục lục, Chương I, V, VI, tài liệu tham khảo", "File Word hoàn chỉnh, danh mục hình/bảng, kiểm tra font, xuất PDF"],
    ]
)

body += p("3. Cấu Trúc Báo Cáo Nên Viết", "Heading1")
body += table(
    [
        ["Chương", "Tên chương", "Người phụ trách chính", "Nội dung cần có"],
        ["Bìa + mục lục", "Thông tin báo cáo", "Nhóm trưởng", "Tên đề tài, môn học, GVHD, thành viên, mục lục, danh sách hình/bảng, từ viết tắt"],
        ["Chương I", "Tổng quan", "Nhóm trưởng/Đạt", "Lý do chọn đề tài, mục tiêu, phạm vi, công nghệ sử dụng"],
        ["Chương II", "Phân tích yêu cầu", "Cả 3 người", "Mỗi người viết yêu cầu chức năng module mình phụ trách"],
        ["Chương III", "Thiết kế hệ thống", "Cả 3 người", "Use case, activity diagram, ERD/database, kiến trúc frontend-backend"],
        ["Chương IV", "Thực thi hệ thống", "Cả 3 người", "Màn hình demo, API, code chính, giải thích luồng xử lý"],
        ["Chương V", "Triển khai và kiểm thử", "Nhóm trưởng + 3 người góp test", "Cách cài đặt, chạy dự án, bảng kiểm thử từng module"],
        ["Chương VI", "Kết luận", "Nhóm trưởng/Kiệt", "Kết quả đạt được, ưu điểm, hạn chế, hướng phát triển"],
    ]
)

body += p("4. Việc Cụ Thể Của Thành Viên 1 - Thông", "Heading1")
body += p("Module: Xác thực, tài khoản, hồ sơ cá nhân, phiên đăng nhập.", "Heading2")
body += p("Phần cần viết trong báo cáo:")
for item in [
    "Giới thiệu module xác thực: dùng để định danh người dùng, bảo vệ dữ liệu cá nhân và phân quyền truy cập.",
    "Mô tả luồng đăng ký: nhập thông tin, validate dữ liệu, mã hóa mật khẩu, lưu user trạng thái PENDING, gửi email xác minh.",
    "Mô tả luồng xác minh email: người dùng bấm link, backend kiểm tra token, đổi trạng thái tài khoản sang ACTIVE.",
    "Mô tả luồng đăng nhập: kiểm tra email, kiểm tra provider, kiểm tra trạng thái, so sánh mật khẩu bằng bcrypt, tạo token.",
    "Giải thích access token và refresh token: access token sống ngắn để gọi API; refresh token sống dài hơn để cấp access token mới.",
    "Giải thích remember me: nếu tick thì refresh token kéo dài 30 ngày, nếu không tick thì khoảng 1 ngày.",
    "Mô tả logout và logout all: xóa refresh token trong database và xóa cookie trình duyệt.",
    "Mô tả profile/settings/session: người dùng xem/sửa hồ sơ, đổi mật khẩu, bật/tắt thông báo, xem phiên đăng nhập.",
]:
    body += bullet(item)
body += p("File code cần tham chiếu:")
for item in [
    "Frontend: Login.tsx, Register.tsx, ForgotPassword.tsx, ResetPassword.tsx, VerifyEmail.tsx, GoogleCallback.tsx, Settings.tsx, Sessions.tsx.",
    "Frontend logic: authStore.ts, axios.ts, ProtectedRoute.tsx, authService.ts, sessionService.ts.",
    "Backend: authController.ts, profileController.ts, authRoute.ts, profileRouter.ts, authMiddleware.ts, passport.ts, mailService.ts.",
    "Database: Users, Roles, refresh_tokens, User_Settings.",
]:
    body += bullet(item)
body += p("Hình, bảng và sơ đồ cần chuẩn bị:")
for item in [
    "Ảnh login, register, verify email, forgot/reset password, settings/profile, sessions.",
    "Bảng API auth/profile: endpoint, method, request, response, ý nghĩa.",
    "Bảng test auth: login đúng/sai, email chưa xác minh, refresh token, logout, đổi mật khẩu.",
    "Activity diagram đăng nhập và activity diagram quên mật khẩu.",
    "Sequence hoặc flow refresh token nếu còn thời gian.",
]:
    body += bullet(item)

body += p("5. Việc Cụ Thể Của Thành Viên 2 - Đạt", "Heading1")
body += p("Module: Quản lý công việc, dashboard, calendar, reminder, database nghiệp vụ.", "Heading2")
body += p("Phần cần viết trong báo cáo:")
for item in [
    "Giới thiệu module task: đây là nghiệp vụ chính của hệ thống, giúp người dùng tạo và theo dõi tiến độ công việc.",
    "Mô tả CRUD task: tạo, xem danh sách, xem chi tiết, sửa, xóa mềm, khôi phục, xóa vĩnh viễn.",
    "Mô tả các thuộc tính task: title, description, priority, status, start date, due date, category.",
    "Mô tả category và tag: category dùng để phân nhóm chính, tag dùng để gắn nhãn linh hoạt cho task.",
    "Mô tả subtask: chia task lớn thành các công việc nhỏ, có trạng thái hoàn thành riêng.",
    "Mô tả reminder: tạo nhắc nhở gắn với task, reminder job kiểm tra thời gian và gửi email nếu đủ điều kiện.",
    "Mô tả attachment: upload file liên quan đến task, file được phục vụ qua thư mục uploads.",
    "Mô tả dashboard/calendar/trash: dashboard thống kê, calendar xem task theo ngày, trash quản lý task đã xóa mềm.",
    "Mô tả database nghiệp vụ: Tasks liên kết Categories, Tags qua Task_Tags, SubTasks, Reminders, Task_Attachments.",
]:
    body += bullet(item)
body += p("File code cần tham chiếu:")
for item in [
    "Frontend: TaskList.tsx, TaskItem.tsx, Dashboard.tsx, CalendarView.tsx, trashPage.tsx, PomodoroTimer.tsx.",
    "Frontend service: dashboardService.ts và các service gọi API task nếu có.",
    "Backend: taskController.ts, categoryController.ts, tagController.ts, subtaskController.ts, reminderController.ts, attachmentController.ts, Trashcontroller.ts, dashboardController.ts.",
    "Backend route/job: taskRoute.ts, categoryRoute.ts, tagRoute.ts, subtaskRoute.ts, dashboardRoute.ts, reminderJob.ts.",
    "Database: schema.prisma, Tasks, Categories, Tags, Task_Tags, SubTasks, Reminders, Task_Attachments.",
]:
    body += bullet(item)
body += p("Hình, bảng và sơ đồ cần chuẩn bị:")
for item in [
    "Ảnh TaskList, form tạo/sửa task, panel chi tiết task, tag, subtask, reminder, attachment.",
    "Ảnh dashboard, calendar, trash.",
    "Bảng API task/category/tag/subtask/reminder/attachment/dashboard.",
    "Bảng database nghiệp vụ mô tả từng bảng và khóa liên kết.",
    "Bảng test task: tạo, sửa, xóa, restore, tag trùng, thêm subtask, thêm reminder, upload file.",
    "Use case quản lý công việc, activity diagram tạo task, activity diagram xóa mềm và khôi phục task.",
]:
    body += bullet(item)

body += p("6. Việc Cụ Thể Của Thành Viên 3 - Kiệt", "Heading1")
body += p("Module: Admin, notification, audit log, heatmap.", "Heading2")
body += p("Phần cần viết trong báo cáo:")
for item in [
    "Giới thiệu module admin: dùng cho quản trị viên theo dõi hệ thống, quản lý người dùng và gửi thông báo.",
    "Mô tả phân quyền admin: route admin yêu cầu đăng nhập và role ADMIN, user thường không được truy cập.",
    "Mô tả admin dashboard: thống kê user, task, hoạt động và các chỉ số tổng quan.",
    "Mô tả quản lý user: xem danh sách, tìm kiếm, lọc, xem chi tiết, khóa/mở tài khoản.",
    "Mô tả reset mật khẩu user nếu hệ thống có hỗ trợ.",
    "Mô tả system notification: admin gửi thông báo đến người dùng hoặc toàn hệ thống.",
    "Mô tả notification người dùng: user nhận, xem và đánh dấu đã đọc thông báo.",
    "Mô tả audit log: ghi lại các hoạt động quan trọng để admin theo dõi.",
    "Mô tả heatmap: trực quan hóa mức độ hoạt động theo thời gian.",
]:
    body += bullet(item)
body += p("File code cần tham chiếu:")
for item in [
    "Frontend: AdminLayout.tsx, AdminDashboard.tsx, UserManagement.tsx, SystemNotification.tsx, AuditLog.tsx, UserActivityHeatmap.tsx.",
    "Frontend components: ConfirmDialog.tsx, CommandPalette.tsx, EmptyState.tsx, ErrorState.tsx, Skeleton.tsx.",
    "Frontend service: adminService.ts, notificationService.ts.",
    "Backend: adminController.ts, notificationController.ts, HeatmapController.ts.",
    "Backend route/middleware: adminRoute.ts, notificationRoute.ts, adminMiddleware.ts.",
    "Database: User_Notifications, Activity_Logs, Users, Roles.",
]:
    body += bullet(item)
body += p("Hình, bảng và sơ đồ cần chuẩn bị:")
for item in [
    "Ảnh admin dashboard, user management, dialog khóa/mở tài khoản.",
    "Ảnh màn hình gửi thông báo, lịch sử thông báo, audit log, heatmap.",
    "Bảng API admin/notification: endpoint, method, quyền truy cập, kết quả trả về.",
    "Bảng phân quyền User và Admin.",
    "Bảng test admin: xem dashboard, lọc user, khóa/mở user, gửi notification, xem audit log.",
    "Use case admin, activity diagram khóa/mở user, activity diagram gửi thông báo.",
]:
    body += bullet(item)

body += p("7. Việc Của Nhóm Trưởng Khi Tổng Hợp", "Heading1")
for item in [
    "Tạo file Word chính theo đúng template của trường.",
    "Viết Chương I: tổng quan, lý do chọn đề tài, mục tiêu, phạm vi, công nghệ.",
    "Ghép nội dung của 3 thành viên vào Chương II, III, IV đúng thứ tự.",
    "Viết Chương V: cài đặt, chạy frontend/backend, cấu hình .env, kiểm thử.",
    "Viết Chương VI: kết quả đạt được, ưu điểm, hạn chế, hướng phát triển.",
    "Chuẩn hóa font, heading, căn lề, đánh số hình, đánh số bảng.",
    "Tạo mục lục tự động, danh sách hình, danh sách bảng, danh mục từ viết tắt.",
    "Đọc lại để bảo đảm không ghi chức năng chưa có trong code hoặc chưa demo được.",
]:
    body += bullet(item)

body += p("8. Bảng Giao Nộp Cho Từng Người", "Heading1")
body += table(
    [
        ["Người", "File Word cần gửi", "Thư mục ảnh", "Tối thiểu phải có"],
        ["Thông", "TV1_Auth_Profile.docx", "Hinh_TV1", "5 ảnh, 1 bảng API, 1 bảng test, 2 sơ đồ"],
        ["Đạt", "TV2_Task_Database.docx", "Hinh_TV2", "8 ảnh, 1 bảng API, 1 bảng database, 1 bảng test, 3 sơ đồ"],
        ["Kiệt", "TV3_Admin_Notification.docx", "Hinh_TV3", "5 ảnh, 1 bảng API, 1 bảng phân quyền, 1 bảng test, 2 sơ đồ"],
        ["Nhóm trưởng", "BaoCao_DoAn_Final.docx", "Hinh_TongHop", "File Word hoàn chỉnh, PDF, mục lục, danh sách hình/bảng"],
    ]
)

body += p("9. Thứ Tự Làm Để Không Bị Rối", "Heading1")
for item in [
    "Bước 1: mỗi người chụp màn hình module của mình trước.",
    "Bước 2: mỗi người viết Chương II phần yêu cầu chức năng của mình.",
    "Bước 3: mỗi người vẽ sơ đồ cho Chương III.",
    "Bước 4: mỗi người viết Chương IV phần thực thi, chèn ảnh và giải thích code/API.",
    "Bước 5: nhóm trưởng ghép file và viết Chương I, V, VI.",
    "Bước 6: cả nhóm đọc lại, kiểm tra thuật ngữ, kiểm tra nội dung có khớp code không.",
    "Bước 7: xuất PDF và chuẩn bị slide thuyết trình.",
]:
    body += bullet(item)

body += p("10. Lưu Ý Khi Viết Để Dễ Vấn Đáp", "Heading1")
for item in [
    "Mỗi chức năng nên viết theo công thức: mục đích, dữ liệu đầu vào, xử lý chính, dữ liệu đầu ra.",
    "Khi nhắc đến code, chỉ trích file quan trọng, không chép code quá dài.",
    "Nên có bảng API vì giảng viên dễ hỏi frontend gọi backend bằng endpoint nào.",
    "Nên có bảng database vì giảng viên dễ hỏi task, user, reminder lưu ở bảng nào.",
    "Nên có bảng test vì chứng minh chức năng đã kiểm thử.",
    "Không nên ghi các chức năng chưa ổn hoặc chưa demo được là đã hoàn thiện.",
]:
    body += bullet(item)


content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>
"""

rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""

doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>
"""

styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:qFormat/><w:pPr><w:spacing w:after="220"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="2563EB"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:qFormat/><w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr><w:i/><w:sz w:val="22"/><w:color w:val="64748B"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:qFormat/><w:pPr><w:spacing w:before="260" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="1D4ED8"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:qFormat/><w:pPr><w:spacing w:before="180" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="25"/><w:color w:val="334155"/></w:rPr></w:style>
</w:styles>
"""

numbering = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>
"""

document = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"""


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


temp_dir = Path(tempfile.mkdtemp(prefix="report_assignment_docx_"))
try:
    write_text(temp_dir / "[Content_Types].xml", content_types)
    write_text(temp_dir / "_rels" / ".rels", rels)
    write_text(temp_dir / "word" / "document.xml", document)
    write_text(temp_dir / "word" / "styles.xml", styles)
    write_text(temp_dir / "word" / "numbering.xml", numbering)
    write_text(temp_dir / "word" / "_rels" / "document.xml.rels", doc_rels)

    if OUTPUT.exists():
        OUTPUT.unlink()

    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as docx:
        for file in temp_dir.rglob("*"):
            if file.is_file():
                docx.write(file, file.relative_to(temp_dir).as_posix())
finally:
    shutil.rmtree(temp_dir, ignore_errors=True)

print(OUTPUT)
