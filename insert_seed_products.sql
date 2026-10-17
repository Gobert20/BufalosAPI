-- Script de Sembrado UTF-8 para Búfalos Táctico
USE Bufalos_DB;
GO

-- Asegurar Categoría 5: Airsoft y Réplicas
IF NOT EXISTS (SELECT 1 FROM TB_Categorias WHERE Id_Categoria = 5)
BEGIN
    SET IDENTITY_INSERT TB_Categorias ON;
    INSERT INTO TB_Categorias (Id_Categoria, Nombre) VALUES (5, N'Airsoft y Réplicas');
    SET IDENTITY_INSERT TB_Categorias OFF;
END
GO

-- 1. Calzado y Vestuario Táctico
IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Botas Militares Bates Ultralite 8" Desert')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Botas Militares Bates Ultralite 8" Desert', N'Botas tácticas ligeras con cremallera lateral, tejido transpirable y suela antideslizante para todo terreno.', 89990.00, 24, 1, 0, 0, 0, 'BOT-BAT-801');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Pantalón Táctico Ripstop Ranger Coyote')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Pantalón Táctico Ripstop Ranger Coyote', N'Pantalón con costuras reforzadas de alta densidad, revestimiento de teflón hidrofóbico y 10 bolsillos funcionales.', 42990.00, 35, 1, 0, 0, 0, 'PAN-RNG-002');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Camisa Táctica Combat Shirt Multicam')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Camisa Táctica Combat Shirt Multicam', N'Prenda diseñada para uso bajo chaleco porta-placas, torso de algodón transpirable y mangas antidesgarro.', 38500.00, 40, 1, 0, 0, 0, 'CAM-MCS-003');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Guantes Tácticos Anticorte Kevlar Nivel 5')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Guantes Tácticos Anticorte Kevlar Nivel 5', N'Protección reforzada en nudillos con fibra de carbono y palma con recubrimiento de aramida de máxima resistencia.', 24990.00, 45, 1, 0, 0, 0, 'GUA-KEV-004');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Cinturón Táctico Cobra de Liberación Rápida')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Cinturón Táctico Cobra de Liberación Rápida', N'Cinturón de nylon militar de alta tracción con hebilla de aleación de aluminio de accionamiento instantáneo.', 18990.00, 60, 1, 0, 0, 0, 'CIN-COB-005');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Chaqueta Softshell Impermeable Térmica Negra')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Chaqueta Softshell Impermeable Térmica Negra', N'Chaqueta táctica cortaviento y térmica con capucha oculta y cremalleras selladas YKK impermeables.', 59990.00, 18, 1, 0, 0, 0, 'CHA-SOF-006');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Pasamontañas Balaclava Ignífugo Transpirable')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Pasamontañas Balaclava Ignífugo Transpirable', N'Protección facial ignífuga y contra viento, tejido térmico de secado ultra rápido para operaciones tácticas.', 12990.00, 80, 1, 0, 0, 0, 'PAS-IGN-007');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Rodilleras y Coderas Tácticas de Asalto')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Rodilleras y Coderas Tácticas de Asalto', N'Kit completo de protección articular con carcasa de polímero TPU de alto impacto y espuma EVA amortiguadora.', 19990.00, 30, 1, 0, 0, 0, 'ROD-ASL-008');

-- 2. Accesorios y Óptica
IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Mochila Médica Táctica Trauma Bag Trauma-Kit')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Mochila Médica Táctica Trauma Bag Trauma-Kit', N'Mochila de primeros auxilios y respuesta rápida para paramédicos con paneles organizadores desprendibles y sistema Molle.', 64990.00, 14, 2, 0, 0, 0, 'MOC-MED-009');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Mira Punto Rojo Red Dot Reflex Tactical')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Mira Punto Rojo Red Dot Reflex Tactical', N'Visor holográfico de adquisión rápida con 4 retículas seleccionables, brillo ajustable y montura estándar Picatinny 20mm.', 79990.00, 22, 2, 18, 0, 0, 'RD-8841-X');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Linterna Táctica 2500 Lúmenes con Montura Picatinny')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Linterna Táctica 2500 Lúmenes con Montura Picatinny', N'Linterna LED de largo alcance resistente al agua IPX8, con interruptor remoto por cable para riel táctico.', 36990.00, 28, 2, 0, 0, 0, 'LIN-PIC-011');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Binoculares Militares Mil-Dot 10x50 Impermeables')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Binoculares Militares Mil-Dot 10x50 Impermeables', N'Prismas BaK-4 con brújula telemétrica integrada, purgados con nitrógeno antiniebla para observación a larga distancia.', 89990.00, 15, 2, 0, 0, 0, 'BIN-MLD-012');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Funda Holster Polímero Nivel II Rotativa')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Funda Holster Polímero Nivel II Rotativa', N'Pistolera de retención activa con seguro de índice ergonómico y pala regulable 360 grados.', 26990.00, 32, 2, 0, 0, 0, 'HOL-POL-013');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Torniquete Táctico CAT Gen 7 Original')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Torniquete Táctico CAT Gen 7 Original', N'Torniquete de control de hemorragias exanguinantes con varilla de molinete reforzada y banda de registro de hora.', 22500.00, 85, 2, 0, 0, 0, 'TOR-CAT-014');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Lentes Balísticos Wiley-X con Cristales Intercambiables')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Lentes Balísticos Wiley-X con Cristales Intercambiables', N'Gafas balísticas con certificación militar ANSI Z87.1, protección UV400 y lentes transparente, amarillo y ahumado.', 68000.00, 20, 2, 0, 0, 0, 'LEN-WLX-015');

-- 3. Defensa Personal
IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Pistola Traumática Revolver Ekol Viper 2.5"')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Pistola Traumática Revolver Ekol Viper 2.5"', N'Revólver de fogueo y proyectil traumático de goma no letal calibre 9mm PAK, tambor de 6 alvéolos con acabado pavonado.', 245000.00, 6, 3, 18, 1, 1, 'EV-9902-TR');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Linterna Taser Eléctrica Policial Recargable')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Linterna Taser Eléctrica Policial Recargable', N'Dispositivo de inmovilización electroshock de 5000 kV con linterna estroboscópica y seguro contra autodescarga.', 28990.00, 19, 3, 18, 0, 0, 'TAS-REC-017');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Gas Pimienta Sabre Red Policial Spray 110g')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Gas Pimienta Sabre Red Policial Spray 110g', N'Spray de gas pimienta OC fórmula militar con tinte UV para marcaje de agresores y alcance balístico de hasta 4 metros.', 16990.00, 75, 3, 18, 0, 0, 'GAS-SAB-018');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Bastón Retráctil Táctico de Acero Endurecido 26"')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Bastón Retráctil Táctico de Acero Endurecido 26"', N'Bastón extensible de aleación de acero templado con empuñadura de goma antideslizante y funda para cinto policial.', 29990.00, 25, 3, 18, 0, 0, 'BAS-RET-019');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Alarma Personal Sonora Antiasalto 130dB con Luz LED')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Alarma Personal Sonora Antiasalto 130dB con Luz LED', N'Llavero de disuasión de activación instantánea por pasador, sirena penetrante de 130 decibeles para emergencias.', 9990.00, 110, 3, 0, 0, 0, 'ALA-SON-020');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Manopla de Resina Táctica de Impacto No Metálica')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Manopla de Resina Táctica de Impacto No Metálica', N'Herramienta de autodefensa fabricada en polímero de policarbonato ultrarresistente e indetectable por detectores metálicos.', 11500.00, 35, 3, 18, 0, 0, 'MAN-RES-021');

-- 4. Parches y Personalización
IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Parche PVC Búfalo Táctico Edición Especial Glow')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Parche PVC Búfalo Táctico Edición Especial Glow', N'Emblema oficial de Búfalos Táctico en relieve 3D de goma PVC con propiedades fosforescentes en la oscuridad y velcro trasero.', 7500.00, 150, 4, 0, 0, 0, 'PAR-BUF-022');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Parche Grupo Sanguíneo O+ Positivo Reflectante IR')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Parche Grupo Sanguíneo O+ Positivo Reflectante IR', N'Insignia médica de identificación rápida para chaleco táctico con material infrarrojo militar visible con visión nocturna.', 4990.00, 200, 4, 0, 0, 0, 'PAR-SNG-023');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Parche Bandera Chile Táctica Multicam Velcro')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Parche Bandera Chile Táctica Multicam Velcro', N'Parche bordado de la bandera nacional en tonos de baja visibilidad verde oliva y coyote para camuflaje operativo.', 4500.00, 300, 4, 0, 0, 0, 'PAR-CHI-024');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Cuerda Paracord Militar 550 Tipo III 30 Metros')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Cuerda Paracord Militar 550 Tipo III 30 Metros', N'Cuerda de paracaídas de 7 hebras internas de nylon con resistencia certificada a la tracción de 250 kg.', 8990.00, 95, 4, 0, 0, 0, 'COR-PAR-025');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Placas de Identificación Militar Dog Tags')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Placas de Identificación Militar Dog Tags', N'Juego de dos placas en acero quirúrgico inoxidable con silenciadores de silicona negra y cadena de bolas militar.', 9990.00, 70, 4, 0, 0, 0, 'DOG-TAG-026');

-- 5. Airsoft y Réplicas
IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Fusil Airsoft M4A1 Carabina AEG Full Metal Specna Arms')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Fusil Airsoft M4A1 Carabina AEG Full Metal Specna Arms', N'Réplica eléctrica de alta fidelidad, gearbox reforzado V2 con cambio rápido de resorte Enter & Convert, 380 FPS.', 239990.00, 8, 5, 18, 0, 0, 'SA-M4-027');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Pistola Airsoft Glock 17 Gen 5 GBB Blowback Umarex')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Pistola Airsoft Glock 17 Gen 5 GBB Blowback Umarex', N'Réplica oficial licenciada por Glock con corredera metálica CNC, retroceso realista Gas Blowback y cargador de 22 BBs.', 169990.00, 12, 5, 18, 0, 0, 'UMX-G17-028');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Rifle Sniper Airsoft L96 Resorte de Alta Precisión')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Rifle Sniper Airsoft L96 Resorte de Alta Precisión', N'Fusil de francotirador de cerrojo accionado por muelle, cañón estriado de precisión, culata ergonómica y 450 FPS.', 189990.00, 5, 5, 18, 0, 0, 'MB-L96-029');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Subfusil Airsoft MP5A5 Tactical Blowback Cyma')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Subfusil Airsoft MP5A5 Tactical Blowback Cyma', N'Subfusil compacto con culata retráctil de 3 posiciones, selector de tiro semi y automático, ideal para combate CQB.', 199990.00, 7, 5, 18, 0, 0, 'CYM-MP5-030');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Balines Airsoft 0.25g Biodegradables Bolsa 4000 BBs')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Balines Airsoft 0.25g Biodegradables Bolsa 4000 BBs', N'Munición esférica de precisión pulida 5.95mm +/- 0.01mm, formulación biodegradable respetuosa con el medio ambiente.', 15990.00, 120, 5, 0, 0, 0, 'BAL-BIO-031');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Gas Green Gas Airsoft Puff Dino 1000ml Lubricado')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Gas Green Gas Airsoft Puff Dino 1000ml Lubricado', N'Gas propulsor de alto rendimiento a presión constante con lubricante de silicona añadido para protección de válvulas y sellos.', 13990.00, 85, 5, 0, 0, 0, 'GAS-PUF-032');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Batería LiPo 11.1V 1200mAh 20C para Fusil AEG')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Batería LiPo 11.1V 1200mAh 20C para Fusil AEG', N'Batería de polímero de litio tipo stick ultrafina para tubo de culata o guardamanos con conector Mini Tamiya / Deans.', 21990.00, 40, 5, 0, 0, 0, 'BAT-LIP-033');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Cargador Mid-Cap 120 BBs Metal para M4/M16')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Cargador Mid-Cap 120 BBs Metal para M4/M16', N'Magazine de alimentación por resorte continuo sin rueda giratoria para máxima discreción acústica en partidas tácticas.', 14500.00, 50, 5, 0, 0, 0, 'CAR-MID-034');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Máscara Facial Malla Metálica Protección Oídos Airsoft')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Máscara Facial Malla Metálica Protección Oídos Airsoft', N'Protección facial de acero de carbono transpirable con protectores de pabellón auricular y correas ajustables cuádruples.', 12990.00, 45, 5, 0, 0, 0, 'MAS-AIR-035');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = N'Granada Táctica de Impacto Reutilizable Airsoft')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES (N'Granada Táctica de Impacto Reutilizable Airsoft', N'Granada mecánica por detonación de resorte y expulsión radial de 130 BBs al chocar con cualquier superficie.', 27990.00, 15, 5, 18, 0, 0, 'GRA-AIR-036');

GO
