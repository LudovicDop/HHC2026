/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: hhc
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id_patient` varchar(20) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `sexe` char(1) DEFAULT NULL,
  `fumeur` tinyint(1) DEFAULT NULL,
  `imc` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id_patient`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES
('PAT-0001','Marcel','Fontaine',68,'M',NULL,NULL),
('PAT-0002','Roger','Blanchard',68,'M',NULL,NULL),
('PAT-0003','Henri','Delacroix',68,'M',NULL,NULL),
('PAT-0004','Isabelle','Renard',38,'F',NULL,NULL),
('PAT-0005','Nathalie','Chevalier',46,'F',NULL,NULL),
('PAT-0006','Gérard','Lemoine',62,'M',NULL,NULL),
('PAT-0007','Sylvie','Marchand',58,'F',NULL,NULL),
('PAT-0008','Yvette','Bonneau',72,'F',NULL,NULL),
('PAT-0009','André','Peyroux',78,'M',NULL,NULL),
('PAT-0010','Claudette','Vasseur',66,'F',NULL,NULL),
('PAT-0011','Pierre','Gaillard',71,'M',NULL,NULL),
('PAT-0012','Monique','Bertrand',74,'F',NULL,NULL),
('PAT-0013','Jean-Paul','Girard',58,'M',NULL,NULL),
('PAT-0014','Christine','Vidal',62,'F',NULL,NULL),
('PAT-0015','Michel','Aubert',65,'M',NULL,NULL),
('PAT-0016','Véronique','Aumont',52,'F',NULL,NULL),
('PAT-0017','Brigitte','Collin',48,'F',NULL,NULL),
('PAT-0018','Françoise','Peltier',61,'F',NULL,NULL),
('PAT-0019','Laurence','Morin',55,'F',NULL,NULL);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `vaccinations`
--

DROP TABLE IF EXISTS `vaccinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaccinations` (
  `id_vaccination` int(11) NOT NULL AUTO_INCREMENT,
  `id_patient` varchar(20) NOT NULL,
  `type_vaccin` varchar(100) NOT NULL,
  `date_vaccin` date DEFAULT NULL,
  PRIMARY KEY (`id_vaccination`),
  KEY `id_patient` (`id_patient`),
  CONSTRAINT `vaccinations_ibfk_1` FOREIGN KEY (`id_patient`) REFERENCES `patients` (`id_patient`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccinations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `vaccinations` WRITE;
/*!40000 ALTER TABLE `vaccinations` DISABLE KEYS */;
INSERT INTO `vaccinations` VALUES
(1,'PAT-0001','grippe','2022-10-28'),
(2,'PAT-0003','grippe','2023-10-05'),
(3,'PAT-0005','grippe','2023-11-08'),
(4,'PAT-0006','grippe','2023-10-20'),
(5,'PAT-0007','grippe','2024-10-15'),
(6,'PAT-0009','grippe','2023-10-30'),
(7,'PAT-0010','grippe','2023-11-15'),
(8,'PAT-0011','grippe','2024-10-08'),
(9,'PAT-0012','grippe','2024-10-22'),
(10,'PAT-0013','grippe','2024-10-05'),
(11,'PAT-0014','grippe','2024-10-18'),
(12,'PAT-0015','grippe','2024-10-30'),
(13,'PAT-0016','grippe','2024-10-10'),
(14,'PAT-0017','grippe','2024-10-25'),
(15,'PAT-0018','grippe','2024-10-30'),
(16,'PAT-0019','grippe','2024-10-22');
/*!40000 ALTER TABLE `vaccinations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-03-21  0:49:54
