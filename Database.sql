-- 1. Table: Roles
create database PhanMem;

use PhanMem;

CREATE TABLE Roles (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(50) NOT NULL
);

-- 2. Table: Users
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) UNIQUE NOT NULL,
    phone NVARCHAR(20),
    password_hash NVARCHAR(MAX) NOT NULL,
    full_name NVARCHAR(255),
    role_id INT,
    provider NVARCHAR(50),
    status NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    deleted_at DATETIME,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (role_id) REFERENCES Roles(id)
);

-- 3. Table: User_Notifications
CREATE TABLE User_Notifications (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    title NVARCHAR(255),
    content NVARCHAR(MAX),
    type NVARCHAR(50),
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- 4. Table: Activity_Logs
CREATE TABLE Activity_Logs (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    action NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ActivityLogs_Users FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- 5. Table: User_Settings
CREATE TABLE User_Settings (
    user_id INT PRIMARY KEY,
    theme NVARCHAR(50),
    notification_enabled BIT DEFAULT 1,
    CONSTRAINT FK_UserSettings_Users FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- 6. Table: Tags
CREATE TABLE Tags (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    name NVARCHAR(100),
    color_code NVARCHAR(10),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_Tags_Users FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- 7. Table: Categories
CREATE TABLE Categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    name NVARCHAR(100),
    display_order INT,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Categories_Users FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- 8. Table: Tasks
CREATE TABLE Tasks (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    category_id INT,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    start_date DATETIME,
    due_date DATETIME,
    priority INT,
    status NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    deleted_at DATETIME,
    completed_at DATETIME,
    CONSTRAINT FK_Tasks_Users FOREIGN KEY (user_id) REFERENCES Users(id),
    CONSTRAINT FK_Tasks_Categories FOREIGN KEY (category_id) REFERENCES Categories(id)
);

-- 9. Table: Reminders
CREATE TABLE Reminders (
    id INT PRIMARY KEY IDENTITY(1,1),
    task_id INT,
    user_id INT,
    remind_time DATETIME,
    status NVARCHAR(50),
    CONSTRAINT FK_Reminders_Tasks FOREIGN KEY (task_id) REFERENCES Tasks(id),
    CONSTRAINT FK_Reminders_Users FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- 10. Table: Task_Tags (Many-to-Many relationship)
CREATE TABLE Task_Tags (
    task_id INT,
    tag_id INT,
    PRIMARY KEY (task_id, tag_id),
    CONSTRAINT FK_TaskTags_Tasks FOREIGN KEY (task_id) REFERENCES Tasks(id),
    CONSTRAINT FK_TaskTags_Tags FOREIGN KEY (tag_id) REFERENCES Tags(id)
);

-- 11. Table: SubTasks
CREATE TABLE SubTasks (
    id INT PRIMARY KEY IDENTITY(1,1),
    task_id INT,
    title NVARCHAR(255),
    status NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    completed_at DATETIME,
    CONSTRAINT FK_SubTasks_Tasks FOREIGN KEY (task_id) REFERENCES Tasks(id)
);
ALTER TABLE Users
ALTER COLUMN password_hash NVARCHAR(MAX) NULL;
DECLARE @uid INT = (SELECT id FROM Users WHERE email = 'dattran220620052005@gmail.com');

DELETE FROM Task_Tags   WHERE tag_id  IN (SELECT id FROM Tags  WHERE user_id = @uid);
DELETE FROM Task_Tags   WHERE task_id IN (SELECT id FROM Tasks WHERE user_id = @uid);
DELETE FROM Reminders   WHERE user_id = @uid;
DELETE FROM Task_Attachments WHERE task_id IN (SELECT id FROM Tasks WHERE user_id = @uid);
DELETE FROM SubTasks    WHERE task_id IN (SELECT id FROM Tasks WHERE user_id = @uid);
DELETE FROM Tasks       WHERE user_id = @uid;
DELETE FROM Tags        WHERE user_id = @uid;
DELETE FROM Categories  WHERE user_id = @uid;
DELETE FROM refresh_tokens WHERE user_id = @uid;
DELETE FROM Activity_Logs   WHERE user_id = @uid;
DELETE FROM User_Notifications WHERE user_id = @uid;
DELETE FROM User_Settings   WHERE user_id = @uid;
DELETE FROM Users       WHERE id = @uid;


SELECT * FROM Tags WHERE user_id = 6;
SELECT * FROM Tags WHERE user_id IS NULL AND is_deleted = 0;
SELECT notification_enabled FROM user_settings WHERE user_id = 3;