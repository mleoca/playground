#!/bin/bash

set -x

printf "Running init replica...\n"

[[ ! "$(which nc > /dev/null 2>&1)" ]] && apt-get update && apt-get install netcat -y

while ! nc -zv -w10 postgres-master 5432; do 
    printf "Waiting for postgres master to get online\n"
    sleep 10
done

PG_DATA="/var/lib/postgresql/data/pgdata"

[[ ! -z "$(ls -A $PG_DATA)" ]] && exit 0 || printf "Getting base backup from master...\n"

pg_basebackup -R -h postgres-master -D $PG_DATA -P -U replication
chown -R postgres:postgres $PGDATA