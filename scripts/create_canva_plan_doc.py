# -*- coding: utf-8 -*-
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import shutil
import tempfile


ROOT = Path.cwd()
OUTPUT = ROOT / "Mau_Canva_Chia_Phan_Cong_3_Nguoi.docx"


def p(text: str, style: str | None = None) -> str:
    style_xml = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
    return (
        f"<w:p>{style_xml}"
        f'<w:r><w:t xml:space="preserve">{escape(text)}</w:t></w:r>'
        "</w:p>"
    )


def bullet(text: str) -> str:
    return (
        "<w:p>"
        '<w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>'
        f'<w:r><w:t xml:space="preserve">{escape(text)}</w:t></w:r>'
        "</w:p>"
    )


def code(text: str) -> str:
    return p(text, "Code")


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
                '<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>'
                f'<w:p><w:r><w:t xml:space="preserve">{escape(cell)}</w:t></w:r></w:p>'
                "</w:tc>"
            )
        xml += "</w:tr>"
    return xml + "</w:tbl>"


body = ""
body += p("Gợi Ý Mẫu Canva Và Cách Chia Slide Theo 3 Người", "Title")
body += p("Dựa trên hai thư mục dự án: D:\\DoAnPhanMem và D:\\DoAnPhanMem-Backend.", "Subtitle")

body += p("1. Mẫu Canva Nên Chọn", "Heading1")
body += p(
    "Nên chọn mẫu theo phong cách Modern SaaS Dashboard / Software Project Presentation: "
    "nền trắng hoặc xám rất nhạt, màu chủ đạo xanh dương giống giao diện app, nhiều screenshot thật, ít chữ và có sơ đồ hệ thống."
)
for item in [
    "Từ khóa tìm trên Canva: SaaS Dashboard Presentation.",
    "Từ khóa tìm trên Canva: Software Project Presentation.",
    "Từ khóa tìm trên Canva: Blue Technology Pitch Deck.",
    "Từ khóa tìm trên Canva: Minimal Tech Report.",
    "Từ khóa tìm trên Canva: Dashboard UI Presentation.",
]:
    body += bullet(item)

body += p("2. Nguyên Tắc Chia Nội Dung", "Heading1")
body += p(
    "Không nên chia theo frontend/backend vì khi vấn đáp thầy cô thường hỏi theo tính năng. "
    "Nên chia theo module full-stack: mỗi người phụ trách một nhóm chức năng từ giao diện, API backend đến bảng database liên quan."
)
for item in [
    "Thành viên 1: xác thực, tài khoản, profile, phiên đăng nhập.",
    "Thành viên 2: task, dashboard, calendar, reminder, tag, subtask.",
    "Thành viên 3: admin, notification, audit log, thống kê hệ thống.",
]:
    body += bullet(item)

body += p("3. Cấu Trúc Slide Đề Xuất", "Heading1")
body += table(
    [
        ["Slide", "Tên slide", "Nội dung chính"],
        ["1", "Trang bìa", "SoftWhere - Ứng dụng quản lý công việc cá nhân; nhóm thực hiện; công nghệ chính."],
        ["2", "Lý do chọn đề tài", "Nhu cầu quản lý task, deadline, nhắc nhở và quản trị người dùng."],
        ["3", "Mục tiêu hệ thống", "Người dùng quản lý công việc; admin quản lý hệ thống; hỗ trợ email và phân quyền."],
        ["4", "Kiến trúc tổng quan", "React Frontend, Express Backend, Prisma ORM, PostgreSQL, Email Service, Google OAuth."],
        ["5", "Database / ERD rút gọn", "Users, Roles, refresh_tokens, Tasks, Tags, SubTasks, Reminders, Activity_Logs."],
        ["6", "Module 1 - Auth/Profile/Session", "Đăng ký, đăng nhập, xác minh email, JWT, refresh token, profile, setting."],
        ["7", "Luồng đăng nhập", "User nhập tài khoản, backend kiểm tra, bcrypt, tạo access token và refresh token."],
        ["8", "Module 2 - Task Management", "Tạo/sửa/xóa task, category, tag, subtask, deadline, priority, thùng rác."],
        ["9", "Demo màn hình Task", "Screenshot TaskList, panel chi tiết, tag, subtask, reminder, file đính kèm."],
        ["10", "Dashboard, Calendar, Reminder", "Thống kê task, lịch, reminder job, gửi mail nếu bật thông báo."],
        ["11", "Module 3 - Admin/Notification/Log", "Admin dashboard, quản lý user, gửi thông báo, audit log, heatmap."],
        ["12", "Phân quyền", "User thường và Admin; authMiddleware và adminMiddleware."],
        ["13", "Kiểm thử", "Test đăng nhập, remember me, tạo task, tag trùng, admin lọc log, reminder email."],
        ["14", "Bảng phân công", "Tổng hợp module, frontend, backend và database của từng thành viên."],
        ["15", "Kết luận và hướng phát triển", "Kết quả đạt được, hạn chế, realtime notification, mobile, thống kê nâng cao."],
    ]
)

body += p("4. Chi Tiết Theo Từng Thành Viên", "Heading1")
body += p("Thành viên 1 - Authentication, Profile, Session", "Heading2")
for item in [
    "Frontend: App.tsx, lib/axios.ts, store/authStore.ts, routes/ProtectedRoute.tsx, Login.tsx, Register.tsx, ForgotPassword.tsx, ResetPassword.tsx, VerifyEmail.tsx, GoogleCallback.tsx, Sessions.tsx, Settings.tsx.",
    "Backend: authController.ts, profileController.ts, authRoute.ts, profileRouter.ts, authMiddleware.ts, passport.ts, mailService.ts, user.schema.ts.",
    "Database: Users, Roles, refresh_tokens, User_Settings.",
    "Nên trình bày: JWT, refresh token, cookie, remember me, xác minh email, protected route.",
]:
    body += bullet(item)

body += p("Thành viên 2 - Task, Dashboard, Reminder", "Heading2")
for item in [
    "Frontend: TaskList.tsx, Dashboard.tsx, CalendarView.tsx, trashPage.tsx, TaskItem.tsx, PomodoroTimer.tsx, dashboardService.ts.",
    "Backend: taskController.ts, categoryController.ts, tagController.ts, subtaskController.ts, reminderController.ts, attachmentController.ts, Trashcontroller.ts, dashboardController.ts, reminderJob.ts.",
    "Database: Tasks, Categories, Tags, Task_Tags, SubTasks, Reminders, Task_Attachments.",
    "Nên trình bày: CRUD task, tag cá nhân, subtask, reminder qua email, dashboard và lịch.",
]:
    body += bullet(item)

body += p("Thành viên 3 - Admin, Notification, Audit Log", "Heading2")
for item in [
    "Frontend: AdminLayout.tsx, AdminDashboard.tsx, UserManagement.tsx, SystemNotification.tsx, AuditLog.tsx, UserActivityHeatmap.tsx, adminService.ts, notificationService.ts.",
    "Backend: adminController.ts, notificationController.ts, HeatmapController.ts, adminRoute.ts, notificationRoute.ts, adminMiddleware.ts.",
    "Database: User_Notifications, Activity_Logs, Users, Roles.",
    "Nên trình bày: phân quyền admin, quản lý người dùng, gửi thông báo, xem log, heatmap hoạt động.",
]:
    body += bullet(item)

body += p("5. Sơ Đồ Kiến Trúc Nên Vẽ", "Heading1")
for line in [
    "React Frontend",
    "     |",
    "Axios REST API",
    "     |",
    "Express Backend",
    "     |",
    "Prisma ORM",
    "     |",
    "PostgreSQL Database",
]:
    body += code(line)
body += p("Có thể vẽ thêm nhánh Google OAuth, Email Service, JWT / Refresh Token ở phía backend.")

body += p("6. Screenshot Nên Chuẩn Bị", "Heading1")
for item in [
    "Login, Register, Verify Email, Profile, Settings, Sessions.",
    "TaskList, form tạo task, panel chi tiết task, tag, subtask, reminder, file đính kèm.",
    "Dashboard, Calendar, Trash.",
    "AdminDashboard, UserManagement, SystemNotification, AuditLog, Heatmap.",
]:
    body += bullet(item)

body += p("7. Bảng Phân Công Đưa Vào Slide", "Heading1")
body += table(
    [
        ["Thành viên", "Module", "Frontend", "Backend", "Database"],
        ["Thông", "Auth/Profile/Session", "Login, Register, Settings, Sessions", "AuthController, Middleware, Passport", "Users, Roles, refresh_tokens"],
        ["Đạt", "Task/Dashboard/Reminder", "TaskList, Dashboard, Calendar", "TaskController, ReminderJob", "Tasks, Tags, SubTasks, Reminders"],
        ["Kiệt", "Admin/Notification/Logs", "Admin pages, Notification UI", "AdminController, NotificationController", "Activity_Logs, User_Notifications"],
    ]
)

body += p("8. Lưu Ý Khi Thiết Kế Canva", "Heading1")
for item in [
    "Mỗi module nên có một slide giải thích và một slide screenshot/demo.",
    "Không đưa code quá dài vào slide; chỉ trích đoạn quan trọng hoặc flow xử lý.",
    "Mỗi slide chỉ nên có 3 đến 5 ý chính.",
    "Dùng icon đơn giản: user, lock, database, bell, calendar, chart, shield.",
    "Giữ màu thống nhất: xanh dương, trắng, xám; có thể thêm xanh lá cho task và tím nhẹ cho admin.",
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
  <w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:pPr><w:spacing w:after="20"/></w:pPr><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="20"/><w:color w:val="111827"/></w:rPr></w:style>
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


temp_dir = Path(tempfile.mkdtemp(prefix="canva_docx_"))
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
