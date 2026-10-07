/*
# Insert 50 companies and their investment packages

1. Data
- 50 academic reference companies inserted into `companies`
- Each company has 7 investment packages (10k, 20k, 30k, 50k, 100k, 200k, 300k COP)
- Daily profit rates vary between 8% and 18% per company (simulated)
2. Important Notes
- These are academic references only, not real investment offers
- Rates are simulated and vary per company
- All companies set to is_active = true
*/

DO $$
DECLARE
  v_company_id uuid;
  v_rate numeric;
  v_amounts bigint[] := ARRAY[10000, 20000, 30000, 50000, 100000, 200000, 300000];
  v_amt bigint;
  v_profit bigint;
  v_companies text[][] := ARRAY[
    ['Anghami', 'Líbano', 'LB', 'Tecnología', 'Streaming de música y audio en el mundo árabe.'],
    ['Kitopi', 'EAU', 'AE', 'FoodTech', 'Cocinas en la nube y gestión de restaurantes.'],
    ['Calo', 'EAU', 'AE', 'FoodTech', 'Plataforma de comida saludable personalizada.'],
    ['Huspy', 'EAU', 'AE', 'PropTech', 'Solución digital para compra y financiamiento de inmuebles.'],
    ['Moove', 'EAU', 'AE', 'Movilidad', 'Financiamiento de vehículos para plataformas de transporte.'],
    ['Qlub', 'EAU', 'AE', 'Fintech', 'Pagos con código QR para restaurantes.'],
    ['Alaan', 'EAU', 'AE', 'Fintech', 'Gestión de gastos corporativos con tarjetas inteligentes.'],
    ['Baly', 'EAU', 'AE', 'Movilidad', 'Aplicación de transporte ride-hailing.'],
    ['Baraka', 'EAU', 'AE', 'Fintech', 'Plataforma de inversión en mercados locales e internacionales.'],
    ['Aqeed', 'EAU', 'AE', 'InsurTech', 'Plataforma de seguros digitales personalizados.'],
    ['Baims', 'Kuwait', 'KW', 'Educación', 'Plataforma de cursos universitarios en línea.'],
    ['Autoleap', 'EAU', 'AE', 'Automotriz', 'Solución digital para gestión de talleres automotrices.'],
    ['Flow48', 'Sudáfrica', 'ZA', 'Fintech', 'Financiamiento de capital de trabajo para empresas.'],
    ['Postpay', 'EAU', 'AE', 'Fintech', 'Solución de compra ahora y paga después (BNPL).'],
    ['Souqalmal', 'EAU', 'AE', 'Fintech', 'Comparador de productos financieros en el Medio Oriente.'],
    ['Seez', 'EAU', 'AE', 'Automotriz', 'Marketplace digital para compra y venta de vehículos.'],
    ['YAP', 'EAU', 'AE', 'Fintech', 'Aplicación bancaria digital sin sucursales.'],
    ['Pemo', 'EAU', 'AE', 'Fintech', 'Tarjetas corporativas y gestión de gastos empresariales.'],
    ['Fuze', 'EAU', 'AE', 'Fintech', 'Infraestructura de pagos digitales y cripto.'],
    ['Baytukum', 'EAU', 'AE', 'PropTech', 'Plataforma de inversión inmobiliaria fraccionada.'],
    ['Amani AI', 'EAU', 'AE', 'Inteligencia Artificial', 'Verificación de identidad con IA.'],
    ['Cashew Payments', 'EAU', 'AE', 'Fintech', 'Plataforma de pagos diferidos (BNPL).'],
    ['Jingle Pay', 'EAU', 'AE', 'Fintech', 'Billetera digital y aplicación financiera.'],
    ['RetailHub', 'EAU', 'AE', 'RetailTech', 'Plataforma de gestión para retailers.'],
    ['Zest Equity', 'EAU', 'AE', 'Fintech', 'Plataforma de inversión privada y gestión de capital.'],
    ['Aajil', 'EAU', 'AE', 'Logística', 'Plataforma de staffing y gestión de trabajadores temporales.'],
    ['Aanab', 'EAU', 'AE', 'Educación', 'Plataforma de desarrollo profesional para docentes.'],
    ['1pass', 'EAU', 'AE', 'Fintech', 'Solución de pagos digitales integrados.'],
    ['525K', 'EAU', 'AE', 'RetailTech', 'Marketplace de moda y productos de diseño.'],
    ['Gotrah', 'EAU', 'AE', 'InsurTech', 'Plataforma digital de seguros para familias.'],
    ['Rimthan', 'EAU', 'AE', 'Tecnología', 'Plataforma de conexión entre freelancers y empresas.'],
    ['Revival Labs', 'EAU', 'AE', 'Salud', 'Soluciones de diagnóstico y biotecnología.'],
    ['Embark', 'EAU', 'AE', 'Logística', 'Plataforma de gestión de envíos y mensajería.'],
    ['Fin Tactics', 'EAU', 'AE', 'Fintech', 'Plataforma de educación y herramientas financieras.'],
    ['Darrbak', 'EAU', 'AE', 'Media', 'Plataforma de contenido y entretenimiento digital.'],
    ['Mubashir', 'EAU', 'AE', 'Tecnología', 'Plataforma de predicción deportiva con IA.'],
    ['Mys EV', 'EAU', 'AE', 'Movilidad', 'Vehículos eléctricos y soluciones de movilidad sostenible.'],
    ['UAAPS', 'EAU', 'AE', 'Tecnología', 'Soluciones de automatización y procesos para empresas.'],
    ['MetisJean', 'EAU', 'AE', 'Inteligencia Artificial', 'Soluciones de IA para procesos empresariales.'],
    ['Coraly.ai', 'EAU', 'AE', 'Inteligencia Artificial', 'Plataforma de IA para atención al cliente.'],
    ['Ovasave', 'EAU', 'AE', 'Salud', 'Soluciones de fertilidad y salud reproductiva.'],
    ['Aton Space Technology', 'EAU', 'AE', 'Aeroespacial', 'Tecnología espacial y soluciones satelitales.'],
    ['Appro', 'EAU', 'AE', 'Fintech', 'Plataforma de aprobación y gestión de crédito.'],
    ['Biosapien', 'EAU', 'AE', 'Biotecnología', 'Modelos biométricos y simulación médica con IA.'],
    ['Bookbird', 'EAU', 'AE', 'Educación', 'Plataforma de reserva y gestión de actividades educativas.'],
    ['NAYLA Finance', 'EAU', 'AE', 'Fintech', 'Soluciones financieras para pymes.'],
    ['AvisNova', 'EAU', 'AE', 'Fintech', 'Plataforma de gestión de riesgos financieros.'],
    ['Helm', 'EAU', 'AE', 'Logística', 'Software de gestión para flotas y transporte.'],
    ['Frequenter', 'EAU', 'AE', 'RetailTech', 'Plataforma de fidelización y gestión de clientes.'],
    ['شركة الأستاذ للحلول الرقمية', 'EAU', 'AE', 'Tecnología', 'Soluciones digitales empresariales.']
  ];
  v_risk text;
  v_min bigint;
  v_max bigint;
BEGIN
  FOR i IN 1..array_length(v_companies, 1) LOOP
    -- Vary rate between 8% and 18%
    v_rate := 8 + (i % 11);
    -- Assign risk level
    v_risk := CASE
      WHEN v_rate < 11 THEN 'Bajo'
      WHEN v_rate < 15 THEN 'Medio'
      ELSE 'Alto'
    END;
    -- Vary min/max investment
    v_min := CASE WHEN i % 3 = 0 THEN 20000 ELSE 10000 END;
    v_max := 300000;

    INSERT INTO companies (
      name, country, country_code, sector, description,
      risk_level, simulated_daily_rate, minimum_investment, maximum_investment, is_active
    )
    VALUES (
      v_companies[i][1], v_companies[i][2], v_companies[i][3],
      v_companies[i][4], v_companies[i][5],
      v_risk, v_rate, v_min, v_max, true
    )
    RETURNING id INTO v_company_id;

    -- Create packages for each amount
    FOREACH v_amt IN ARRAY v_amounts LOOP
      IF v_amt >= v_min AND v_amt <= v_max THEN
        v_profit := ROUND(v_amt * v_rate / 100);
        INSERT INTO investment_packages (company_id, investment_amount, simulated_daily_profit, duration_days)
        VALUES (v_company_id, v_amt, v_profit, 30);
      END IF;
    END LOOP;
  END LOOP;
END $$;