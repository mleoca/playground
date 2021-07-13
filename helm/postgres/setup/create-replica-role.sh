#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	DO \$\$
	BEGIN
		CREATE ROLE replication WITH REPLICATION PASSWORD '$REPLICATION_PASSWORD' LOGIN;
		EXCEPTION WHEN DUPLICATE_OBJECT THEN
			RAISE NOTICE 'skipping to create role replication as it already exists';
	END
	\$\$;
EOSQL
