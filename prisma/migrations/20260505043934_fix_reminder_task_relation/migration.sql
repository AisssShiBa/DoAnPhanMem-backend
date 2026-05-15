BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Categories] ADD [color_code] NVARCHAR(10);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Categories_user_id_is_deleted_idx] ON [dbo].[Categories]([user_id], [is_deleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Tasks_user_id_due_date_is_deleted_idx] ON [dbo].[Tasks]([user_id], [due_date], [is_deleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Tasks_user_id_status_is_deleted_idx] ON [dbo].[Tasks]([user_id], [status], [is_deleted]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
