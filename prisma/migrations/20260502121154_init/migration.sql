BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Roles] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(50) NOT NULL,
    CONSTRAINT [Roles_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(255) NOT NULL,
    [phone] NVARCHAR(20),
    [password_hash] NVARCHAR(1000) NOT NULL,
    [full_name] NVARCHAR(255),
    [role_id] INT,
    [provider] NVARCHAR(50),
    [status] NVARCHAR(50),
    [created_at] DATETIME2 CONSTRAINT [Users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 CONSTRAINT [Users_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [verify_token] NVARCHAR(1000),
    [verify_expires] DATETIME2,
    [reset_token] NVARCHAR(1000),
    [reset_expires] DATETIME2,
    [is_deleted] BIT CONSTRAINT [Users_is_deleted_df] DEFAULT 0,
    [deleted_at] DATETIME2,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[User_Notifications] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT,
    [title] NVARCHAR(255),
    [content] NVARCHAR(1000),
    [type] NVARCHAR(50),
    [is_read] BIT CONSTRAINT [User_Notifications_is_read_df] DEFAULT 0,
    [created_at] DATETIME2 CONSTRAINT [User_Notifications_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_Notifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Activity_Logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT,
    [action] NVARCHAR(1000),
    [created_at] DATETIME2 CONSTRAINT [Activity_Logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Activity_Logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User_Settings] (
    [user_id] INT NOT NULL,
    [theme] NVARCHAR(50),
    [notification_enabled] BIT CONSTRAINT [User_Settings_notification_enabled_df] DEFAULT 1,
    CONSTRAINT [User_Settings_pkey] PRIMARY KEY CLUSTERED ([user_id])
);

-- CreateTable
CREATE TABLE [dbo].[Tags] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT,
    [name] NVARCHAR(100),
    [color_code] NVARCHAR(10),
    [is_deleted] BIT CONSTRAINT [Tags_is_deleted_df] DEFAULT 0,
    CONSTRAINT [Tags_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Categories] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT,
    [name] NVARCHAR(100),
    [display_order] INT,
    [is_deleted] BIT CONSTRAINT [Categories_is_deleted_df] DEFAULT 0,
    [created_at] DATETIME2 CONSTRAINT [Categories_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 CONSTRAINT [Categories_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Categories_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Tasks] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT,
    [category_id] INT,
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(1000),
    [start_date] DATETIME2,
    [due_date] DATETIME2,
    [priority] INT,
    [status] NVARCHAR(50),
    [created_at] DATETIME2 CONSTRAINT [Tasks_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 CONSTRAINT [Tasks_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [is_deleted] BIT CONSTRAINT [Tasks_is_deleted_df] DEFAULT 0,
    [deleted_at] DATETIME2,
    [completed_at] DATETIME2,
    CONSTRAINT [Tasks_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Reminders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [task_id] INT,
    [user_id] INT,
    [remind_time] DATETIME2,
    [status] NVARCHAR(50),
    CONSTRAINT [Reminders_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Task_Tags] (
    [task_id] INT NOT NULL,
    [tag_id] INT NOT NULL,
    CONSTRAINT [Task_Tags_pkey] PRIMARY KEY CLUSTERED ([task_id],[tag_id])
);

-- CreateTable
CREATE TABLE [dbo].[SubTasks] (
    [id] INT NOT NULL IDENTITY(1,1),
    [task_id] INT,
    [title] NVARCHAR(255),
    [status] NVARCHAR(50),
    [created_at] DATETIME2 CONSTRAINT [SubTasks_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 CONSTRAINT [SubTasks_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [completed_at] DATETIME2,
    CONSTRAINT [SubTasks_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Users] ADD CONSTRAINT [Users_role_id_fkey] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Roles]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[User_Notifications] ADD CONSTRAINT [User_Notifications_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Activity_Logs] ADD CONSTRAINT [Activity_Logs_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[User_Settings] ADD CONSTRAINT [User_Settings_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Tags] ADD CONSTRAINT [Tags_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Categories] ADD CONSTRAINT [Categories_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Tasks] ADD CONSTRAINT [Tasks_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Tasks] ADD CONSTRAINT [Tasks_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[Categories]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reminders] ADD CONSTRAINT [Reminders_task_id_fkey] FOREIGN KEY ([task_id]) REFERENCES [dbo].[Tasks]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reminders] ADD CONSTRAINT [Reminders_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Task_Tags] ADD CONSTRAINT [Task_Tags_task_id_fkey] FOREIGN KEY ([task_id]) REFERENCES [dbo].[Tasks]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Task_Tags] ADD CONSTRAINT [Task_Tags_tag_id_fkey] FOREIGN KEY ([tag_id]) REFERENCES [dbo].[Tags]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SubTasks] ADD CONSTRAINT [SubTasks_task_id_fkey] FOREIGN KEY ([task_id]) REFERENCES [dbo].[Tasks]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
