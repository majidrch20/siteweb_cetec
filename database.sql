-- ============================================================
-- Base de données pour le site web CETEC
-- Script de création de la base de données et de la table
-- ============================================================

-- 1. Création de la base de données (si elle n'existe pas)
CREATE DATABASE IF NOT EXISTS cetec_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cetec_db;

-- 2. Création de la table pour les messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Nom complet de l''expéditeur',
    email VARCHAR(255) NOT NULL COMMENT 'Adresse email',
    subject VARCHAR(255) NOT NULL COMMENT 'Sujet du message',
    message TEXT NOT NULL COMMENT 'Contenu du message',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date et heure d''envoi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
