create database Daigo collate Chinese_Taiwan_Stroke_90_CI_AI
go

use Daigo

grant connect on database :: Daigo to dbo
go

grant view any column encryption key definition, view any column master key definition on database :: Daigo to [public]
go

create table dbo.ChatMessages
(
    Id           int identity
        primary key,
    ChatRoomId   nvarchar(100) not null,
    SenderUserId nvarchar(50)  not null,
    Message      nvarchar(max) not null,
    CreatedAt    datetime2     not null,
    IsRead       bit default 0 not null
)
go

create table dbo.ChatRooms
(
    ChatRoomId      nvarchar(100) not null
        constraint PK_ChatRooms
            primary key,
    UserAId         nvarchar(50)  not null,
    UserBId         nvarchar(50)  not null,
    CreatedByUserId nvarchar(50)  not null,
    CreatedAt       datetime2     not null
)
go

create table dbo.Commission_Place
(
    place_id          int identity
        primary key,
    google_place_id   nvarchar(255)  not null,
    name              nvarchar(255),
    formatted_address nvarchar(500)  not null,
    latitude          decimal(10, 8) not null,
    longitude         decimal(11, 8) not null,
    created_at        datetime default getdate(),
    map_url           nvarchar(max)
)
go

create table dbo.Commission
(
    commission_id int identity
        primary key,
    service_code  nvarchar(30)                   not null,
    creator_id    nvarchar(50),
    title         nvarchar(255),
    image_url     nvarchar(max),
    description   nvarchar(max),
    price         decimal(15, 2),
    quantity      int,
    category      nvarchar(50),
    location      nvarchar(255),
    deadline      datetime,
    created_at    datetime     default getdate(),
    UpdatedAt     datetime,
    status        nvarchar(15) default N'未審核' not null
        check ([status] = N'cancelled' OR [status] = N'已完成' OR [status] = N'已寄出' OR [status] = N'出貨中' OR
               [status] = N'已接單' OR [status] = N'待接單' OR [status] = N'審核失敗' OR [status] = N'審核中'),
    escrowAmount  decimal(18, 2),
    fee           decimal(18, 2),
    fail_count    int          default 0,
    place_id      int
        constraint FK_Commission_Place
            references dbo.Commission_Place,
    currency      nvarchar(10) default 'TWD'
)
go

create unique index UX_Commission_service_code
    on dbo.Commission (service_code)
go

create table dbo.CommissionHistory
(
    history_id    int identity
        primary key,
    commission_id int                        not null
        constraint FK_CommissionHistory_Commission
            references dbo.Commission,
    action        nvarchar(50)               not null,
    changed_by    nvarchar(50),
    changed_at    datetime default getdate() not null,
    old_data      nvarchar(max),
    new_data      nvarchar(max)
)
go

create table dbo.CommissionOrder
(
    order_id      int identity
        primary key,
    commission_id int                        not null
        constraint FK_Order_Commission
            references dbo.Commission,
    status        nvarchar(20)               not null
        check ([status] = N'CANCELLED' OR [status] = N'COMPLETED' OR [status] = N'PENDING'),
    amount        decimal(18, 2)             not null,
    buyer_id      nvarchar(50),
    seller_id     nvarchar(50)               not null,
    created_at    datetime default getdate() not null,
    finished_at   datetime
)
go

create table dbo.CommissionReceipt
(
    receipt_id        int identity
        primary key,
    commission_id     int                        not null
        constraint FK_Receipt_Commission
            references dbo.Commission,
    uploaded_by       nvarchar(50)               not null,
    receipt_image_url nvarchar(max)              not null,
    receipt_amount    decimal(18, 2),
    receipt_date      datetime,
    uploaded_at       datetime default getdate() not null,
    remark            nvarchar(500)
)
go

create table dbo.CommissionShipping
(
    shipping_id     int identity
        primary key,
    commission_id   int          not null
        constraint FK_CommissionShipping_Commission
            references dbo.Commission,
    status          nvarchar(10) not null
        check ([status] = N'已寄出' OR [status] = N'未寄出'),
    shipped_at      datetime,
    shipped_by      nvarchar(50) not null,
    logistics_name  nvarchar(50),
    tracking_number nvarchar(100),
    remark          nvarchar(255)
)
go

create table dbo.Review
(
    review_id    int identity
        primary key,
    target_type  nvarchar(20)               not null
        check ([target_type] = 'commission' OR [target_type] = 'product'),
    target_id    int                        not null,
    TargetCode   nvarchar(30),
    reviewer_uid nvarchar(50)               not null,
    result       tinyint                    not null,
    reason       nvarchar(255),
    created_at   datetime default getdate() not null
)
go

create index idx_review_target
    on dbo.Review (target_type, target_id)
go

create table dbo.Store
(
    store_id          int identity
        primary key,
    seller_uid        nvarchar(50)  not null,
    store_name        nvarchar(100) not null,
    status            tinyint       not null,
    review_fail_count int           not null,
    created_at        datetime      not null,
    updated_at        datetime,
    SubmittedAt       datetime,
    RecoverAt         datetime
)
go

create table dbo.StoreProduct
(
    product_id     int identity
        primary key,
    store_id       int                        not null
        constraint FK_StoreProduct_Store
            references dbo.Store,
    product_name   nvarchar(100)              not null,
    description    nvarchar(max),
    price          decimal(10, 2)             not null,
    quantity       int                        not null,
    location       nvarchar(100),
    image_path     nvarchar(255),
    end_date       datetime,
    created_at     datetime default getdate() not null,
    updated_at     datetime,
    IsActive       bit      default 1         not null,
    ReportCount    int      default 0         not null,
    LastReportedAt datetime,
    Status         int      default 0         not null,
    RejectReason   nvarchar(500)
)
go

create table dbo.StoreProductReview
(
    product_review_id int identity
        primary key,
    product_id        int                        not null
        constraint FK_ProductReview_Product
            references dbo.StoreProduct,
    reviewer_uid      nvarchar(50)               not null,
    result            tinyint                    not null,
    comment           nvarchar(500),
    created_at        datetime default getdate() not null
)
go

create table dbo.StoreReview
(
    review_id    int identity
        primary key,
    store_id     int                        not null
        constraint FK_StoreReview_Store
            references dbo.Store,
    reviewer_uid nvarchar(50)               not null,
    result       tinyint                    not null,
    comment      nvarchar(255),
    created_at   datetime default getdate() not null
)
go

create table dbo.Users
(
    uid            nvarchar(50)  not null
        primary key,
    name           nvarchar(100) not null,
    email          nvarchar(100) not null
        unique,
    password_hash  nvarchar(255) not null,
    phone          nvarchar(20),
    balance        decimal(15, 2) default 0.00,
    escrow_balance decimal(15, 2) default 0.00,
    created_at     datetime       default getdate(),
    avatar         nvarchar(max),
    address        nvarchar(max),
    disabled_until datetime
)
go

create table dbo.DepositOrder
(
    deposit_order_id int identity
        primary key,
    order_no         nvarchar(50)               not null
        unique,
    user_id          nvarchar(50)               not null
        constraint FK_DepositOrder_Users
            references dbo.Users,
    amount           decimal(15, 2)             not null,
    status           nvarchar(20)               not null,
    created_at       datetime default getdate() not null,
    paid_at          datetime
)
go

create table dbo.Notifications
(
    Id      int identity
        primary key,
    uid     nvarchar(50) not null
        constraint FK_Notifications_Users
            references dbo.Users
            on delete cascade,
    Title   nvarchar(100),
    Content nvarchar(max),
    IsRead  bit default 0,
    SentAt  datetime     not null
)
go

create table dbo.WalletLogs
(
    Id            int identity
        primary key,
    Uid           nvarchar(450)  not null,
    Action        nvarchar(50)   not null,
    Amount        decimal(18, 2) not null,
    Balance       decimal(18, 2) not null,
    EscrowBalance decimal(18, 2) not null,
    CreatedAt     datetime2      not null,
    service_code  nvarchar(30),
    description   nvarchar(255)
)
go

create table dbo.balance_logs
(
    id             int identity
        primary key,
    user_id        nvarchar(50)               not null
        constraint FK_balance_logs_Users
            references dbo.Users,
    type           nvarchar(20)               not null,
    amount         decimal(15, 2)             not null,
    before_balance decimal(15, 2)             not null,
    after_balance  decimal(15, 2)             not null,
    ref_type       nvarchar(30),
    ref_id         int,
    created_at     datetime default getdate() not null
)
go

create table dbo.commission_sequence
(
    ym         char(6)                         not null
        constraint PK_commission_sequence
            primary key,
    seq        int                             not null,
    updated_at datetime2 default sysdatetime() not null
)
go

create table dbo.sysdiagrams
(
    name         sysname not null,
    principal_id int     not null,
    diagram_id   int identity
        primary key,
    version      int,
    definition   varbinary(max),
    constraint UK_principal_name
        unique (principal_id, name)
)
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'TABLE', 'sysdiagrams'
go


	CREATE FUNCTION dbo.fn_diagramobjects() 
	RETURNS int
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		declare @id_upgraddiagrams		int
		declare @id_sysdiagrams			int
		declare @id_helpdiagrams		int
		declare @id_helpdiagramdefinition	int
		declare @id_creatediagram	int
		declare @id_renamediagram	int
		declare @id_alterdiagram 	int 
		declare @id_dropdiagram		int
		declare @InstalledObjects	int

		select @InstalledObjects = 0

		select 	@id_upgraddiagrams = object_id(N'dbo.sp_upgraddiagrams'),
			@id_sysdiagrams = object_id(N'dbo.sysdiagrams'),
			@id_helpdiagrams = object_id(N'dbo.sp_helpdiagrams'),
			@id_helpdiagramdefinition = object_id(N'dbo.sp_helpdiagramdefinition'),
			@id_creatediagram = object_id(N'dbo.sp_creatediagram'),
			@id_renamediagram = object_id(N'dbo.sp_renamediagram'),
			@id_alterdiagram = object_id(N'dbo.sp_alterdiagram'), 
			@id_dropdiagram = object_id(N'dbo.sp_dropdiagram')

		if @id_upgraddiagrams is not null
			select @InstalledObjects = @InstalledObjects + 1
		if @id_sysdiagrams is not null
			select @InstalledObjects = @InstalledObjects + 2
		if @id_helpdiagrams is not null
			select @InstalledObjects = @InstalledObjects + 4
		if @id_helpdiagramdefinition is not null
			select @InstalledObjects = @InstalledObjects + 8
		if @id_creatediagram is not null
			select @InstalledObjects = @InstalledObjects + 16
		if @id_renamediagram is not null
			select @InstalledObjects = @InstalledObjects + 32
		if @id_alterdiagram  is not null
			select @InstalledObjects = @InstalledObjects + 64
		if @id_dropdiagram is not null
			select @InstalledObjects = @InstalledObjects + 128
		
		return @InstalledObjects 
	END
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'FUNCTION', 'fn_diagramobjects'
go

deny execute on dbo.fn_diagramobjects to guest
go

grant execute on dbo.fn_diagramobjects to [public]
go


	CREATE PROCEDURE dbo.sp_alterdiagram
	(
		@diagramname 	sysname,
		@owner_id	int	= null,
		@version 	int,
		@definition 	varbinary(max)
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
	
		declare @theId 			int
		declare @retval 		int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
		declare @ShouldChangeUID	int
	
		if(@diagramname is null)
		begin
			RAISERROR ('Invalid ARG', 16, 1)
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID();	 
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		revert;
	
		select @ShouldChangeUID = 0
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		
		if(@DiagId IS NULL or (@IsDbo = 0 and @theId <> @UIDFound))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1);
			return -3
		end
	
		if(@IsDbo <> 0)
		begin
			if(@UIDFound is null or USER_NAME(@UIDFound) is null) -- invalid principal_id
			begin
				select @ShouldChangeUID = 1 ;
			end
		end

		-- update dds data			
		update dbo.sysdiagrams set definition = @definition where diagram_id = @DiagId ;

		-- change owner
		if(@ShouldChangeUID = 1)
			update dbo.sysdiagrams set principal_id = @theId where diagram_id = @DiagId ;

		-- update dds version
		if(@version is not null)
			update dbo.sysdiagrams set version = @version where diagram_id = @DiagId ;

		return 0
	END
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'PROCEDURE', 'sp_alterdiagram'
go

deny execute on dbo.sp_alterdiagram to guest
go

grant execute on dbo.sp_alterdiagram to [public]
go


	CREATE PROCEDURE dbo.sp_creatediagram
	(
		@diagramname 	sysname,
		@owner_id		int	= null, 	
		@version 		int,
		@definition 	varbinary(max)
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
	
		declare @theId int
		declare @retval int
		declare @IsDbo	int
		declare @userName sysname
		if(@version is null or @diagramname is null)
		begin
			RAISERROR (N'E_INVALIDARG', 16, 1);
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID(); 
		select @IsDbo = IS_MEMBER(N'db_owner');
		revert; 
		
		if @owner_id is null
		begin
			select @owner_id = @theId;
		end
		else
		begin
			if @theId <> @owner_id
			begin
				if @IsDbo = 0
				begin
					RAISERROR (N'E_INVALIDARG', 16, 1);
					return -1
				end
				select @theId = @owner_id
			end
		end
		-- next 2 line only for test, will be removed after define name unique
		if EXISTS(select diagram_id from dbo.sysdiagrams where principal_id = @theId and name = @diagramname)
		begin
			RAISERROR ('The name is already used.', 16, 1);
			return -2
		end
	
		insert into dbo.sysdiagrams(name, principal_id , version, definition)
				VALUES(@diagramname, @theId, @version, @definition) ;
		
		select @retval = @@IDENTITY 
		return @retval
	END
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'PROCEDURE', 'sp_creatediagram'
go

deny execute on dbo.sp_creatediagram to guest
go

grant execute on dbo.sp_creatediagram to [public]
go


	CREATE PROCEDURE dbo.sp_dropdiagram
	(
		@diagramname 	sysname,
		@owner_id	int	= null
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
	
		if(@diagramname is null)
		begin
			RAISERROR ('Invalid value', 16, 1);
			return -1
		end
	
		EXECUTE AS CALLER;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		REVERT; 
		
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1)
			return -3
		end
	
		delete from dbo.sysdiagrams where diagram_id = @DiagId;
	
		return 0;
	END
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'PROCEDURE', 'sp_dropdiagram'
go

deny execute on dbo.sp_dropdiagram to guest
go

grant execute on dbo.sp_dropdiagram to [public]
go


	CREATE PROCEDURE dbo.sp_helpdiagramdefinition
	(
		@diagramname 	sysname,
		@owner_id	int	= null 		
	)
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		set nocount on

		declare @theId 		int
		declare @IsDbo 		int
		declare @DiagId		int
		declare @UIDFound	int
	
		if(@diagramname is null)
		begin
			RAISERROR (N'E_INVALIDARG', 16, 1);
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner');
		if(@owner_id is null)
			select @owner_id = @theId;
		revert; 
	
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname;
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId ))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1);
			return -3
		end

		select version, definition FROM dbo.sysdiagrams where diagram_id = @DiagId ; 
		return 0
	END
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'PROCEDURE',
     'sp_helpdiagramdefinition'
go

deny execute on dbo.sp_helpdiagramdefinition to guest
go

grant execute on dbo.sp_helpdiagramdefinition to [public]
go


	CREATE PROCEDURE dbo.sp_helpdiagrams
	(
		@diagramname sysname = NULL,
		@owner_id int = NULL
	)
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		DECLARE @user sysname
		DECLARE @dboLogin bit
		EXECUTE AS CALLER;
			SET @user = USER_NAME();
			SET @dboLogin = CONVERT(bit,IS_MEMBER('db_owner'));
		REVERT;
		SELECT
			[Database] = DB_NAME(),
			[Name] = name,
			[ID] = diagram_id,
			[Owner] = USER_NAME(principal_id),
			[OwnerID] = principal_id
		FROM
			sysdiagrams
		WHERE
			(@dboLogin = 1 OR USER_NAME(principal_id) = @user) AND
			(@diagramname IS NULL OR name = @diagramname) AND
			(@owner_id IS NULL OR principal_id = @owner_id)
		ORDER BY
			4, 5, 1
	END
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'PROCEDURE', 'sp_helpdiagrams'
go

deny execute on dbo.sp_helpdiagrams to guest
go

grant execute on dbo.sp_helpdiagrams to [public]
go


	CREATE PROCEDURE dbo.sp_renamediagram
	(
		@diagramname 		sysname,
		@owner_id		int	= null,
		@new_diagramname	sysname
	
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
		declare @DiagIdTarg		int
		declare @u_name			sysname
		if((@diagramname is null) or (@new_diagramname is null))
		begin
			RAISERROR ('Invalid value', 16, 1);
			return -1
		end
	
		EXECUTE AS CALLER;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		REVERT;
	
		select @u_name = USER_NAME(@owner_id)
	
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1)
			return -3
		end
	
		-- if((@u_name is not null) and (@new_diagramname = @diagramname))	-- nothing will change
		--	return 0;
	
		if(@u_name is null)
			select @DiagIdTarg = diagram_id from dbo.sysdiagrams where principal_id = @theId and name = @new_diagramname
		else
			select @DiagIdTarg = diagram_id from dbo.sysdiagrams where principal_id = @owner_id and name = @new_diagramname
	
		if((@DiagIdTarg is not null) and  @DiagId <> @DiagIdTarg)
		begin
			RAISERROR ('The name is already used.', 16, 1);
			return -2
		end		
	
		if(@u_name is null)
			update dbo.sysdiagrams set [name] = @new_diagramname, principal_id = @theId where diagram_id = @DiagId
		else
			update dbo.sysdiagrams set [name] = @new_diagramname where diagram_id = @DiagId
		return 0
	END
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'PROCEDURE', 'sp_renamediagram'
go

deny execute on dbo.sp_renamediagram to guest
go

grant execute on dbo.sp_renamediagram to [public]
go


	CREATE PROCEDURE dbo.sp_upgraddiagrams
	AS
	BEGIN
		IF OBJECT_ID(N'dbo.sysdiagrams') IS NOT NULL
			return 0;
	
		CREATE TABLE dbo.sysdiagrams
		(
			name sysname NOT NULL,
			principal_id int NOT NULL,	-- we may change it to varbinary(85)
			diagram_id int PRIMARY KEY IDENTITY,
			version int,
	
			definition varbinary(max)
			CONSTRAINT UK_principal_name UNIQUE
			(
				principal_id,
				name
			)
		);


		/* Add this if we need to have some form of extended properties for diagrams */
		/*
		IF OBJECT_ID(N'dbo.sysdiagram_properties') IS NULL
		BEGIN
			CREATE TABLE dbo.sysdiagram_properties
			(
				diagram_id int,
				name sysname,
				value varbinary(max) NOT NULL
			)
		END
		*/

		IF OBJECT_ID(N'dbo.dtproperties') IS NOT NULL
		begin
			insert into dbo.sysdiagrams
			(
				[name],
				[principal_id],
				[version],
				[definition]
			)
			select	 
				convert(sysname, dgnm.[uvalue]),
				DATABASE_PRINCIPAL_ID(N'dbo'),			-- will change to the sid of sa
				0,							-- zero for old format, dgdef.[version],
				dgdef.[lvalue]
			from dbo.[dtproperties] dgnm
				inner join dbo.[dtproperties] dggd on dggd.[property] = 'DtgSchemaGUID' and dggd.[objectid] = dgnm.[objectid]	
				inner join dbo.[dtproperties] dgdef on dgdef.[property] = 'DtgSchemaDATA' and dgdef.[objectid] = dgnm.[objectid]
				
			where dgnm.[property] = 'DtgSchemaNAME' and dggd.[uvalue] like N'_EA3E6268-D998-11CE-9454-00AA00A3F36E_' 
			return 2;
		end
		return 1;
	END
go

exec sp_addextendedproperty 'microsoft_database_tools_support', 1, 'SCHEMA', 'dbo', 'PROCEDURE', 'sp_upgraddiagrams'
go

