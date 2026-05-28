# -*- coding: utf-8 -*-
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import shutil
import tempfile


ROOT = Path.cwd()
OUTPUT = ROOT / "Mau_Canva_Theo_Template_Blue_White_Ro_Rang.docx"


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
                '<w:tc><w:tcPr><w:tcW w:w="2500" w:type="dxa"/></w:tcPr>'
                f'<w:p><w:r><w:t xml:space="preserve">{escape(cell)}</w:t></w:r></w:p>'
                "</w:tc>"
            )
        xml += "</w:tr>"
    return xml + "</w:tbl>"


body = ""
body += p("Mẫu Canva Thuyết Trình Đồ Án - Bản Rõ Ràng", "Title")
body += p("Chia slide theo 3 người, bám đúng 2 repo DoAnPhanMem và DoAnPhanMem-Backend.", "Subtitle")

body += p("1. Đánh Giá Mẫu Canva Đang Chọn", "Heading1")
body += p(
    "Mẫu Blue and White Modern Minimalist Software Development Proposal Presentation trong ảnh dùng được cho đồ án này. "
    "Màu xanh-trắng hợp với giao diện SoftWhere, bố cục có sẵn các trang System Architecture, Development Methodology, Timeline/Milestone và Risk Management nên dễ chuyển thành bài thuyết trình đồ án phần mềm."
)
body += p("Tuy nhiên cần sửa lại tinh thần của mẫu: không trình bày như proposal/báo giá, mà trình bày như project report + product demo.", "Heading2")
for item in [
    "Tỷ lệ: 16:9.",
    "Giữ phong cách tối giản, trắng/xám nhạt, xanh dương làm màu chính.",
    "Font gợi ý trong Canva: Inter, Open Sans, Roboto hoặc Montserrat.",
    "Giữ màu xanh của mẫu cho toàn bộ slide; chỉ dùng thêm xanh lá rất ít cho module task và tím/xanh đậm rất ít cho module admin.",
    "Mỗi slide chỉ nên có 3-5 ý, còn lại dùng screenshot và sơ đồ.",
    "Thay toàn bộ tiêu đề kiểu Budget Estimation, Proposal, Risk Management bằng tiêu đề đồ án: Tổng quan, Kiến trúc, Module, Demo, Kiểm thử, Kết luận.",
    "Các hình minh họa tiền/budget trong mẫu nên xóa hoặc thay bằng screenshot thật của app.",
]:
    body += bullet(item)

body += p("Từ khóa tìm mẫu trên Canva:", "Heading2")
for item in [
    "SaaS Dashboard Presentation",
    "Software Project Presentation",
    "Blue Technology Pitch Deck",
    "Minimal Tech Report Presentation",
    "Dashboard UI Presentation",
]:
    body += bullet(item)

body += p("2. Quy Tắc Bố Cục Slide", "Heading1")
for item in [
    "Slide tổng quan: dùng sơ đồ hoặc bảng, ít screenshot.",
    "Slide module: bên trái để screenshot, bên phải để 3 ý giải thích.",
    "Slide luồng xử lý: dùng flow mũi tên, không chèn code dài.",
    "Slide phân công: dùng bảng 3 người, mỗi người một module.",
    "Không chia theo frontend/backend riêng lẻ; chia theo tính năng full-stack để dễ bảo vệ.",
    "Nếu slide mẫu có nền xanh đậm, dùng cho slide chia section: Auth, Task, Admin.",
    "Nếu slide mẫu có nền trắng, dùng cho slide giải thích chi tiết hoặc bảng phân công.",
]:
    body += bullet(item)

body += p("2.1. Cách Đổi Các Trang Có Sẵn Trong Mẫu", "Heading1")
body += table(
    [
        ["Trang mẫu đang có", "Nên đổi thành", "Cách sửa"],
        ["System Architecture", "Kiến trúc hệ thống", "Giữ nền xanh, thay nội dung bằng flow React -> Express -> Prisma -> PostgreSQL"],
        ["Development Methodology", "Quy trình phát triển", "Đổi thành chia module: Auth, Task, Admin; mỗi module có frontend, backend, database"],
        ["Timeline and Milestone", "Tiến độ / phân công", "Đổi timeline thành các giai đoạn: phân tích, thiết kế DB, code backend, code frontend, test, demo"],
        ["Budget Estimation", "Database / ERD rút gọn", "Xóa hình tiền, thay bằng sơ đồ cụm bảng Auth, Task, Admin"],
        ["Risk Management", "Kiểm thử và xử lý lỗi", "Đổi risk thành các lỗi đã test/sửa: token hết hạn, tag trùng, reminder, admin filter log"],
        ["Proposal/Intro slide", "Trang bìa đồ án", "Đổi tiêu đề thành SoftWhere - Ứng dụng quản lý công việc cá nhân"],
    ]
)

body += p("3. Cấu Trúc Slide Đề Xuất", "Heading1")
body += table(
    [
        ["Slide", "Người làm", "Tên slide", "Bố cục nên dùng", "Nội dung cần có"],
        ["1", "Nhóm trưởng", "SoftWhere", "Dùng slide mở đầu của mẫu, nền xanh/trắng", "Ứng dụng quản lý công việc cá nhân; tên nhóm; công nghệ chính"],
        ["2", "Nhóm trưởng", "Vấn đề và mục tiêu", "2 cột: vấn đề / giải pháp", "Quản lý task, deadline, nhắc nhở, admin quản trị hệ thống"],
        ["3", "Nhóm trưởng", "Chức năng chính", "Dùng layout 3 hoặc 4 ô", "Auth/Profile, Task Management, Admin/Notification, Dashboard/Reminder"],
        ["4", "Nhóm trưởng + Đạt", "System Architecture", "Dùng đúng trang System Architecture của mẫu", "Frontend gọi REST API, backend xử lý, Prisma kết nối database, email service gửi mail"],
        ["5", "Đạt", "Database Design", "Dùng trang Budget Estimation nhưng xóa hình tiền", "Users/Roles/refresh_tokens, Tasks/Categories/Tags/SubTasks/Reminders, Notifications/Logs"],
        ["6", "Thông", "Auth Module", "Slide nền xanh làm section divider", "Đăng ký, đăng nhập, verify email, Google login, protected route"],
        ["7", "Thông", "JWT và Remember Me", "Flow token trên nền trắng", "Access token 15 phút, refresh token 1 ngày hoặc 30 ngày, cookie httpOnly"],
        ["8", "Thông", "Profile và Session", "Screenshot settings/sessions + 3 bullet", "Profile, đổi mật khẩu, bật/tắt thông báo, logout all"],
        ["9", "Đạt", "Task Module", "Slide nền xanh làm section divider", "Tạo/sửa/xóa task, priority, deadline, status, category"],
        ["10", "Đạt", "Task Detail Features", "4 ô chức năng", "Tag cá nhân, công việc phụ, nhắc nhở email, file đính kèm"],
        ["11", "Đạt", "Dashboard, Calendar, Trash", "3 screenshot nhỏ", "Thống kê tiến độ, xem lịch, xóa mềm/khôi phục task"],
        ["12", "Kiệt", "Admin Module", "Slide nền xanh làm section divider", "Thống kê hệ thống, quản lý user, phân quyền admin"],
        ["13", "Kiệt", "Notification, Audit Log, Heatmap", "Screenshot notification/log/heatmap", "Admin gửi thông báo, user nhận thông báo, log hoạt động, heatmap"],
        ["14", "Nhóm trưởng", "Testing", "Dùng trang Risk Management của mẫu", "Auth, task, tag trùng, reminder, admin filter log, notification"],
        ["15", "Nhóm trưởng", "Team Contribution", "Dùng trang Timeline/Milestone hoặc bảng", "Thông: auth; Đạt: task; Kiệt: admin; mỗi người làm frontend + backend + database liên quan"],
        ["16", "Nhóm trưởng", "Kết luận", "3 kết quả + 3 hướng phát triển", "Đã hoàn thành hệ thống; hướng phát triển realtime notification, test tự động, mobile"],
    ]
)

body += p("4. Nội Dung Cụ Thể Từng Slide", "Heading1")

slides = [
    ("Slide 1 - Trang bìa", [
        "Tiêu đề lớn: SoftWhere - Ứng dụng quản lý công việc cá nhân.",
        "Phụ đề: React + Express + Prisma + PostgreSQL.",
        "Ghi tên 3 thành viên và giảng viên hướng dẫn.",
        "Nên để logo hoặc screenshot mờ của dashboard làm nền nhẹ.",
    ]),
    ("Slide 2 - Vấn đề và mục tiêu", [
        "Cột trái: Người dùng dễ quên deadline, khó theo dõi tiến độ, task nằm rời rạc.",
        "Cột phải: Hệ thống giúp tạo task, phân loại, nhắc nhở, xem dashboard, admin quản lý hệ thống.",
        "Không ghi quá dài, mỗi cột 3 ý là đủ.",
    ]),
    ("Slide 3 - Công nghệ sử dụng", [
        "Frontend: React, TypeScript, Vite, Tailwind CSS, Axios, Zustand.",
        "Backend: Node.js, Express, TypeScript, Prisma.",
        "Database/Auth: PostgreSQL, JWT, Refresh Token, Google OAuth.",
        "Có thể dùng icon công nghệ trong Canva.",
    ]),
    ("Slide 4 - Kiến trúc hệ thống", [
        "Vẽ flow: React Frontend -> Axios REST API -> Express Backend -> Prisma ORM -> PostgreSQL.",
        "Thêm nhánh: Backend -> Mail Service -> Gmail/User.",
        "Thêm nhánh: Google OAuth -> Passport -> Backend.",
        "Slide này để nhóm trưởng nói tổng quan trước khi chia từng người.",
    ]),
    ("Slide 5 - Database chính", [
        "Không đưa ERD quá nhiều bảng khiến slide rối.",
        "Chia thành 3 cụm: Auth, Task, Admin.",
        "Auth: Users, Roles, refresh_tokens, User_Settings.",
        "Task: Tasks, Categories, Tags, Task_Tags, SubTasks, Reminders, Task_Attachments.",
        "Admin: User_Notifications, Activity_Logs.",
    ]),
    ("Slide 6 - Module xác thực", [
        "Người trình bày: Thông.",
        "Chèn screenshot Login/Register.",
        "3 ý chính: đăng ký có verify email; đăng nhập kiểm tra mật khẩu bcrypt; protected route bảo vệ trang user/admin.",
        "Có thể ghi file tiêu biểu: authController.ts, authStore.ts, ProtectedRoute.tsx.",
    ]),
    ("Slide 7 - JWT và Remember Me", [
        "Người trình bày: Thông.",
        "Vẽ flow token: login -> access token -> refresh token cookie -> refresh API -> access token mới.",
        "Nói rõ: access token sống ngắn để an toàn; refresh token sống dài để người dùng không phải đăng nhập lại liên tục.",
        "Remember me chỉ khác ở thời gian refresh token: không tick khoảng 1 ngày, tick khoảng 30 ngày.",
    ]),
    ("Slide 8 - Profile và phiên đăng nhập", [
        "Người trình bày: Thông.",
        "Chèn screenshot Settings và Sessions.",
        "Nội dung: cập nhật hồ sơ, đổi mật khẩu, bật/tắt thông báo, xem thiết bị đăng nhập, logout một phiên hoặc tất cả phiên.",
    ]),
    ("Slide 9 - Module quản lý task", [
        "Người trình bày: Đạt.",
        "Chèn screenshot TaskList đang chọn một task.",
        "3 ý chính: CRUD task; lọc theo trạng thái; quản lý priority/deadline/category.",
        "File tiêu biểu: TaskList.tsx, taskController.ts, taskRoute.ts.",
    ]),
    ("Slide 10 - Tag, subtask, reminder, file", [
        "Người trình bày: Đạt.",
        "Chia slide thành 4 ô nhỏ: Tag, Subtask, Reminder, Attachment.",
        "Tag: nhãn cá nhân không trùng theo user.",
        "Subtask: chia nhỏ công việc.",
        "Reminder: gửi mail nếu đến thời gian và user bật thông báo.",
        "Attachment: upload file vào uploads.",
    ]),
    ("Slide 11 - Dashboard, Calendar, Trash", [
        "Người trình bày: Đạt.",
        "Chèn 3 screenshot nhỏ: Dashboard, Calendar, Trash.",
        "Dashboard cho thống kê; Calendar xem task theo ngày; Trash dùng soft delete để khôi phục.",
    ]),
    ("Slide 12 - Module admin", [
        "Người trình bày: Kiệt.",
        "Chèn screenshot AdminDashboard hoặc UserManagement.",
        "3 ý chính: admin xem thống kê; quản lý user; khóa/mở tài khoản.",
        "Nói rõ user thường không vào được route admin vì có adminMiddleware.",
    ]),
    ("Slide 13 - Notification và Audit Log", [
        "Người trình bày: Kiệt.",
        "Chèn screenshot SystemNotification, AuditLog hoặc Heatmap.",
        "Nội dung: admin gửi thông báo; user nhận thông báo; activity log lưu hoạt động; heatmap xem mức độ hoạt động.",
    ]),
    ("Slide 14 - Kiểm thử", [
        "Người trình bày: nhóm trưởng hoặc chia mỗi người nói 1 dòng.",
        "Dùng bảng 6 dòng: login, remember me, tạo task, tag trùng, reminder mail, admin filter log.",
        "Cột nên có: Chức năng, thao tác test, kết quả.",
    ]),
    ("Slide 15 - Phân công nhóm", [
        "Dùng bảng 3 dòng theo 3 người.",
        "Thông: Auth/Profile/Session.",
        "Đạt: Task/Dashboard/Reminder/Database.",
        "Kiệt: Admin/Notification/Audit Log.",
        "Ghi rõ mỗi người phụ trách cả frontend, backend và database liên quan.",
    ]),
    ("Slide 16 - Kết luận", [
        "Kết quả: hoàn thành auth, task, dashboard, admin, notification, reminder.",
        "Hạn chế: chưa có test tự động đầy đủ, realtime notification chưa tối ưu, deployment còn có thể mở rộng.",
        "Hướng phát triển: WebSocket, mobile responsive, Docker/CI-CD, Google Calendar.",
    ]),
]

for title, items in slides:
    body += p(title, "Heading2")
    for item in items:
        body += bullet(item)

body += p("5. Chia Việc Làm Canva Cho 3 Người", "Heading1")
body += table(
    [
        ["Người", "Slide phụ trách", "Việc phải làm", "Ảnh cần chụp"],
        ["Thông", "6, 7, 8", "Làm phần auth, token, remember me, profile, session", "Login, Register, Verify Email, Settings, Sessions"],
        ["Đạt", "5, 9, 10, 11", "Làm database rút gọn, task, tag, subtask, reminder, dashboard, calendar, trash", "TaskList, Task detail, Reminder, Dashboard, Calendar, Trash"],
        ["Kiệt", "12, 13", "Làm admin dashboard, user management, notification, audit log, heatmap", "AdminDashboard, UserManagement, SystemNotification, AuditLog, Heatmap"],
        ["Nhóm trưởng", "1, 2, 3, 4, 14, 15, 16", "Làm mở đầu, công nghệ, kiến trúc, test, phân công, kết luận, chỉnh format", "Logo, kiến trúc, bảng test, bảng phân công"],
    ]
)

body += p("6. Câu Nói Thuyết Trình Mẫu Cho Từng Người", "Heading1")
body += p("Thông - Auth/Profile/Session", "Heading2")
for item in [
    "Phần của em phụ trách là xác thực và tài khoản người dùng.",
    "Khi đăng nhập thành công, backend tạo access token để gọi API và refresh token lưu trong cookie để duy trì phiên.",
    "Remember me giúp kéo dài thời gian refresh token, nên lần sau mở web có thể tự vào lại nếu frontend gọi API refresh.",
]:
    body += bullet(item)

body += p("Đạt - Task/Dashboard/Reminder", "Heading2")
for item in [
    "Phần của em phụ trách là nghiệp vụ chính: quản lý công việc cá nhân.",
    "Mỗi task có thể gắn category, nhiều tag, nhiều subtask, reminder và file đính kèm.",
    "Dashboard và calendar giúp người dùng theo dõi tiến độ, còn trash dùng cơ chế xóa mềm để có thể khôi phục.",
]:
    body += bullet(item)

body += p("Kiệt - Admin/Notification/Audit", "Heading2")
for item in [
    "Phần của em phụ trách là quản trị hệ thống.",
    "Admin có thể xem thống kê, quản lý người dùng, gửi thông báo hệ thống và xem lịch sử hoạt động.",
    "Các route admin được bảo vệ bằng middleware nên user thường không có quyền truy cập.",
]:
    body += bullet(item)

body += p("7. Những Lỗi Nên Tránh Khi Làm Canva", "Heading1")
for item in [
    "Không chèn quá nhiều code vào slide; chỉ chèn tên file hoặc flow xử lý.",
    "Không dùng quá nhiều màu, dễ làm slide giống rời rạc.",
    "Không để mỗi người làm một kiểu font/màu khác nhau.",
    "Không đưa full ERD quá dày; chỉ đưa ERD rút gọn theo 3 cụm Auth, Task, Admin.",
    "Không nói chung chung 'em làm frontend' hoặc 'em làm backend'; phải nói theo module chức năng.",
]:
    body += bullet(item)

body += p("8. Sơ Đồ Kiến Trúc Có Thể Chép Vào Canva", "Heading1")
for line in [
    "React Frontend",
    "     | Axios REST API",
    "Express Backend",
    "     | Prisma ORM",
    "PostgreSQL Database",
    "",
    "Backend -> Mail Service -> Email người dùng",
    "Google OAuth -> Passport -> Backend",
]:
    body += code(line)


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


temp_dir = Path(tempfile.mkdtemp(prefix="clear_canva_docx_"))
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
