DEFINE ACCESS user_access ON DATABASE TYPE RECORD
	SIGNUP (
		CREATE user CONTENT {
			name: $name,
			email: $email,
			password: crypto::argon2::generate($password),
			created: time::now(),
			is_active: true
		}
	)
	SIGNIN (
		SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(password, $password)
	)
	WITH REFRESH
	DURATION FOR GRANT 15d, FOR TOKEN 15m, FOR SESSION 12h
;

DEFINE TABLE user SCHEMAFULL
	PERMISSIONS
		FOR select, update, delete WHERE id = $auth.id;

DEFINE FIELD name ON TABLE user TYPE string;
DEFINE FIELD email ON TABLE user TYPE string
    ASSERT string::is_email($value);
DEFINE FIELD password ON TABLE user TYPE string;
DEFINE FIELD created ON TABLE user TYPE datetime DEFAULT time::now();
DEFINE FIELD last_login_at ON TABLE user TYPE option<datetime>;
DEFINE FIELD is_active ON TABLE user TYPE bool DEFAULT true;
DEFINE FIELD key_id ON TABLE user TYPE option<record<user_key>>;

DEFINE INDEX user_email_idx ON TABLE user COLUMNS email UNIQUE;

DEFINE TABLE user_key SCHEMAFULL
	PERMISSIONS
		FOR select, create, update, delete WHERE user_id = $auth.id;

DEFINE FIELD user_id ON TABLE user_key TYPE record<user>;
DEFINE FIELD key_type ON TABLE user_key TYPE string;
DEFINE FIELD public_key_pem ON TABLE user_key TYPE string;
DEFINE FIELD created ON TABLE user_key TYPE datetime DEFAULT time::now();
DEFINE FIELD expires_at ON TABLE user_key TYPE option<datetime>;
DEFINE FIELD is_revoked ON TABLE user_key TYPE bool DEFAULT false;

DEFINE INDEX user_key_user_idx ON TABLE user_key COLUMNS user_id;

DEFINE TABLE document SCHEMAFULL
	PERMISSIONS
		FOR select, update, delete WHERE owner_id = $auth.id
		FOR create WHERE $auth.id != NONE;

DEFINE FIELD owner_id ON TABLE document TYPE record<user>;
DEFINE FIELD title ON TABLE document TYPE string;
DEFINE FIELD file_path ON TABLE document TYPE string;
DEFINE FIELD uploaded_at ON TABLE document TYPE datetime DEFAULT time::now();
DEFINE FIELD signed_file_path ON TABLE document TYPE option<string>;
DEFINE FIELD status ON TABLE document TYPE string DEFAULT 'draft'
    ASSERT $value IN ['draft', 'pending', 'signed', 'expired', 'revoked'];

DEFINE INDEX document_owner_idx ON TABLE document COLUMNS owner_id;

DEFINE TABLE signature_request SCHEMAFULL
	PERMISSIONS
		FOR select WHERE requester_id = $auth.id OR recipient_user_id = $auth.id
		FOR create WHERE $auth.id != NONE
		FOR update, delete WHERE requester_id = $auth.id;

DEFINE FIELD document_id ON TABLE signature_request TYPE record<document>;
DEFINE FIELD requester_id ON TABLE signature_request TYPE record<user>;
DEFINE FIELD recipient_email ON TABLE signature_request TYPE string
    ASSERT string::is_email($value);
DEFINE FIELD recipient_user_id ON TABLE signature_request TYPE option<record<user>>;
DEFINE FIELD link_expires_at ON TABLE signature_request TYPE option<datetime>;
DEFINE FIELD status ON TABLE signature_request TYPE string DEFAULT 'pending'
    ASSERT $value IN ['pending', 'signed', 'declined', 'expired'];
DEFINE FIELD created_at ON TABLE signature_request TYPE datetime DEFAULT time::now();

DEFINE INDEX sig_req_document_idx ON TABLE signature_request COLUMNS document_id;
DEFINE INDEX sig_req_requester_idx ON TABLE signature_request COLUMNS requester_id;
DEFINE INDEX sig_req_recipient_idx ON TABLE signature_request COLUMNS recipient_user_id;

DEFINE TABLE audit_log SCHEMAFULL
	PERMISSIONS
		FOR select WHERE user_id = $auth.id
		FOR create WHERE $auth.id != NONE;

DEFINE FIELD document_id ON TABLE audit_log TYPE record<document>;
DEFINE FIELD user_id ON TABLE audit_log TYPE record<user>;
DEFINE FIELD action_type ON TABLE audit_log TYPE string
    ASSERT $value IN ['upload', 'sign', 'view', 'share', 'revoke', 'delete', 'download'];
DEFINE FIELD action_timestamp ON TABLE audit_log TYPE datetime DEFAULT time::now();
DEFINE FIELD ip_address ON TABLE audit_log TYPE option<string>;
DEFINE FIELD details ON TABLE audit_log TYPE option<string>;

DEFINE INDEX audit_document_idx ON TABLE audit_log COLUMNS document_id;
DEFINE INDEX audit_user_idx ON TABLE audit_log COLUMNS user_id;
DEFINE INDEX audit_timestamp_idx ON TABLE audit_log COLUMNS action_timestamp;
