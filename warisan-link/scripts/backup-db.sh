#!/bin/bash
BACKUP_DIR="/var/backups/warisan-link"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U warisan_user -h localhost warisan_link \
  | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 14 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +14 -delete

echo "Backup selesai: backup_$DATE.sql.gz"
