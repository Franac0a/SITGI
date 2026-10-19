-- Base aparte para npm run test:mysql (los tests borran sus tablas).
CREATE DATABASE IF NOT EXISTS citproyecto_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON citproyecto_test.* TO 'sitgi'@'%';
