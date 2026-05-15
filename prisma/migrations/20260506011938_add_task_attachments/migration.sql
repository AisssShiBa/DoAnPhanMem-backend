BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Task_Attachments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [task_id] INT,
    [file_name] NVARCHAR(255) NOT NULL,
    [file_url] NVARCHAR(500) NOT NULL,
    [file_size] INT,
    [mime_type] NVARCHAR(100),
    [created_at] DATETIME2 CONSTRAINT [Task_Attachments_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Task_Attachments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Task_Attachments] ADD CONSTRAINT [Task_Attachments_task_id_fkey] FOREIGN KEY ([task_id]) REFERENCES [dbo].[Tasks]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
