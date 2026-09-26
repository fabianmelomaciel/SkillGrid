const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Detección de OS y Entorno
function detectEnvironment() {
  const osType = process.platform; // win32, linux, darwin
  let stack = 'Unknown';
  let hasLaragon = false;
  let hasDocker = false;

  if (osType === 'win32') {
    // Laragon por defecto se instala en c:\laragon
    if (fs.existsSync('c:\\laragon') || fs.existsSync('d:\\laragon')) {
      hasLaragon = true;
      stack = 'Laragon (Windows)';
    } else if (fs.existsSync('c:\\xampp')) {
      stack = 'XAMPP (Windows)';
    } else {
      stack = 'Windows Native / Other';
    }
  } else {
    // Linux / macOS
    if (fs.existsSync('/var/www/html')) {
      stack = 'LAMP/LEMP (Linux)';
    } else {
      stack = 'macOS/Linux Custom';
    }
  }

  // Detectar Docker
  if (fs.existsSync('docker-compose.yml') || fs.existsSync('Dockerfile')) {
    hasDocker = true;
  }

  return { osType, stack, hasLaragon, hasDocker };
}

// 2. Parsea credenciales de base de datos desde el entorno (.env, configs)
function getDbConfig(projectDir) {
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
  let dbConfig = {
    engine: 'mysql',
    host: '127.0.0.1',
    port: '3306',
    database: '',
    username: 'root',
    password: '',
    sqlite_path: ''
  };

  let envContent = '';
  for (const file of envFiles) {
    const filePath = path.join(projectDir, file);
    if (fs.existsSync(filePath)) {
      envContent = fs.readFileSync(filePath, 'utf8');
      break;
    }
  }

  if (envContent) {
    const lines = envContent.replace(/\r/g, '').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*(DB_[A-Z0-9_]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1];
        let val = match[2].trim();
        // Quitar comillas si existen
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }

        if (key === 'DB_CONNECTION') dbConfig.engine = val;
        else if (key === 'DB_HOST') dbConfig.host = val;
        else if (key === 'DB_PORT') dbConfig.port = val;
        else if (key === 'DB_DATABASE') dbConfig.database = val;
        else if (key === 'DB_USERNAME') dbConfig.username = val;
        else if (key === 'DB_PASSWORD') dbConfig.password = val;
      }
    });

    if (dbConfig.engine === 'sqlite') {
      dbConfig.sqlite_path = dbConfig.database || 'database/database.sqlite';
    }
  } else {
    // Buscar configuración de Node.js o PHP
    if (fs.existsSync(path.join(projectDir, 'config/database.php'))) {
      const phpConfig = fs.readFileSync(path.join(projectDir, 'config/database.php'), 'utf8');
      // Deducir básico
      if (phpConfig.includes("'driver' => 'sqlite'")) dbConfig.engine = 'sqlite';
      else if (phpConfig.includes("'driver' => 'pgsql'")) dbConfig.engine = 'pgsql';
    }
  }

  // Normalizar nombres comunes de motores
  if (dbConfig.engine.includes('postgres') || dbConfig.engine === 'pgsql') {
    dbConfig.engine = 'pgsql';
    if (dbConfig.port === '3306') dbConfig.port = '5432';
  } else if (dbConfig.engine.includes('sqlite')) {
    dbConfig.engine = 'sqlite';
  } else {
    dbConfig.engine = 'mysql'; // Default mysql/mariadb
  }

  return dbConfig;
}

// 3. Introspección usando PHP PDO inline (altamente portátil en Laragon/LAMP) o fallbacks CLI
function fetchSchemaFromDb(config) {
  let phpCode = '';
  
  if (config.engine === 'sqlite') {
    const sqlitePath = path.resolve(config.sqlite_path);
    if (!fs.existsSync(sqlitePath)) {
      return null;
    }
    phpCode = `
$pdo = new PDO("sqlite:${sqlitePath.replace(/\\/g, '\\\\')}");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$tables = [];
$res = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
while ($row = $res->fetch(PDO::FETCH_ASSOC)) {
    $tableName = $row['name'];
    $columns = [];
    $colRes = $pdo->query("PRAGMA table_info(\`$tableName\`)");
    while ($col = $colRes->fetch(PDO::FETCH_ASSOC)) {
        $columns[] = [
            'name' => $col['name'],
            'type' => $col['type'],
            'nullable' => $col['notnull'] == 0,
            'primary_key' => $col['pk'] > 0,
            'default' => $col['dflt_value']
        ];
    }
    $tables[$tableName] = [
        'columns' => $columns,
        'foreign_keys' => []
    ];
}
echo json_encode($tables);
    `;
  } else if (config.engine === 'mysql') {
    phpCode = `
try {
    $pdo = new PDO("mysql:host=${config.host};port=${config.port};dbname=${config.database};charset=utf8mb4", "${config.username}", "${config.password}", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 3
    ]);
    
    $tables = [];
    $tabRes = $pdo->query("SHOW TABLES");
    while ($row = $tabRes->fetch(PDO::FETCH_NUM)) {
        $tableName = $row[0];
        
        // Columnas
        $columns = [];
        $colRes = $pdo->query("DESCRIBE \`$tableName\`");
        while ($col = $colRes->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = [
                'name' => $col['Field'],
                'type' => $col['Type'],
                'nullable' => $col['Null'] === 'YES',
                'primary_key' => $col['Key'] === 'PRI',
                'default' => $col['Default']
            ];
        }
        
        // Llaves foráneas
        $foreignKeys = [];
        $fkQuery = "
            SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = '${config.database}' 
              AND TABLE_NAME = '$tableName' 
              AND REFERENCED_TABLE_NAME IS NOT NULL
        ";
        $fkRes = $pdo->query($fkQuery);
        while ($fk = $fkRes->fetch(PDO::FETCH_ASSOC)) {
            $foreignKeys[] = [
                'column' => $fk['COLUMN_NAME'],
                'referenced_table' => $fk['REFERENCED_TABLE_NAME'],
                'referenced_column' => $fk['REFERENCED_COLUMN_NAME']
            ];
        }
        
        $tables[$tableName] = [
            'columns' => $columns,
            'foreign_keys' => $foreignKeys
        ];
    }
    echo json_encode($tables);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
    `;
  } else if (config.engine === 'pgsql') {
    phpCode = `
try {
    $pdo = new PDO("pgsql:host=${config.host};port=${config.port};dbname=${config.database}", "${config.username}", "${config.password}", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 3
    ]);
    
    $tables = [];
    $tabQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema='public'";
    $tabRes = $pdo->query($tabQuery);
    while ($row = $tabRes->fetch(PDO::FETCH_ASSOC)) {
        $tableName = $row['table_name'];
        
        $columns = [];
        $colQuery = "
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = '$tableName'
        ";
        $colRes = $pdo->query($colQuery);
        
        // Detectar PKs
        $pkQuery = "
            SELECT kcu.column_name 
            FROM information_schema.table_constraints tc 
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = '$tableName'
        ";
        $pks = [];
        $pkRes = $pdo->query($pkQuery);
        while ($pk = $pkRes->fetch(PDO::FETCH_ASSOC)) {
            $pks[] = $pk['column_name'];
        }
        
        while ($col = $colRes->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = [
                'name' => $col['column_name'],
                'type' => $col['data_type'],
                'nullable' => $col['is_nullable'] === 'YES',
                'primary_key' => in_array($col['column_name'], $pks),
                'default' => $col['column_default']
            ];
        }
        
        $tables[$tableName] = [
            'columns' => $columns,
            'foreign_keys' => [] // Simplificado para pgsql fallback
        ];
    }
    echo json_encode($tables);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
    `;
  }

  const tempFile = path.join(__dirname, 'temp_query.php');
  try {
    fs.writeFileSync(tempFile, `<?php\n${phpCode}`);
    const output = execSync(`php "${tempFile}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });

    if (output.startsWith('ERROR:')) {
      console.log(`  [!] Error de conexión PHP PDO: ${output}`);
      return null;
    }

    return JSON.parse(output);
  } catch (e) {
    // PHP no disponible o error fatal de ejecución
    return null;
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// 4. Fallback: Análisis estático de migraciones y esquemas DDL
function parseStaticMigrations(projectDir) {
  console.log('  [+] Ejecutando análisis estático (fallback de migraciones/DDL)...');
  const schema = {};
  
  // Buscar archivos de migración
  const migrationPaths = [
    path.join(projectDir, 'database/migrations'),
    path.join(projectDir, 'migrations'),
    path.join(projectDir, 'db')
  ];

  const filesToParse = [];
  migrationPaths.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(f => {
        if (f.endsWith('.sql') || f.endsWith('.php')) {
          filesToParse.push(path.join(dir, f));
        }
      });
    }
  });

  // Parsea Prisma schemas si existen
  const prismaSchema = path.join(projectDir, 'prisma/schema.prisma');
  if (fs.existsSync(prismaSchema)) {
    filesToParse.push(prismaSchema);
  }

  filesToParse.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.sql') {
      // Parsea CREATE TABLE en SQL
      const createTableRegex = /CREATE\s+TABLE\s+([a-zA-Z0-9_`"]+)\s*\(([\s\S]+?)\);/gi;
      let match;
      while ((match = createTableRegex.exec(content)) !== null) {
        let tableName = match[1].replace(/[`"]/g, '').trim();
        const columnsText = match[2];
        const columns = [];
        const fks = [];

        const colLines = columnsText.split(',');
        colLines.forEach(line => {
          const cleanLine = line.trim();
          if (cleanLine.toUpperCase().startsWith('CONSTRAINT') || cleanLine.toUpperCase().startsWith('FOREIGN KEY')) {
            // Relaciones básicas en DDL
            const fkMatch = cleanLine.match(/FOREIGN\s+KEY\s*\(([a-zA-Z0-9_`"]+)\)\s*REFERENCES\s*([a-zA-Z0-9_`"]+)\s*\(([a-zA-Z0-9_`"]+)\)/i);
            if (fkMatch) {
              fks.push({
                column: fkMatch[1].replace(/[`"]/g, ''),
                referenced_table: fkMatch[2].replace(/[`"]/g, ''),
                referenced_column: fkMatch[3].replace(/[`"]/g, '')
              });
            }
          } else if (cleanLine && !cleanLine.startsWith('--') && !cleanLine.startsWith('#') && !cleanLine.toUpperCase().startsWith('PRIMARY KEY') && !cleanLine.toUpperCase().startsWith('KEY') && !cleanLine.toUpperCase().startsWith('UNIQUE')) {
            const words = cleanLine.split(/\s+/);
            if (words.length >= 2) {
              const name = words[0].replace(/[`"]/g, '');
              const type = words[1];
              const nullable = !cleanLine.toUpperCase().includes('NOT NULL');
              const primary_key = cleanLine.toUpperCase().includes('PRIMARY KEY');
              columns.push({
                name,
                type,
                nullable,
                primary_key,
                default: cleanLine.toUpperCase().includes('DEFAULT') ? 'Value' : null
              });
            }
          }
        });

        if (tableName && columns.length > 0) {
          schema[tableName] = { columns, foreign_keys: fks };
        }
      }
    } else if (filePath.endsWith('schema.prisma')) {
      // Parsea Prisma schema
      const modelRegex = /model\s+(\w+)\s*{([\s\S]+?)}/g;
      let match;
      while ((match = modelRegex.exec(content)) !== null) {
        const modelName = match[1];
        const body = match[2];
        const columns = [];
        
        const lines = body.split('\n');
        lines.forEach(line => {
          const tokens = line.trim().split(/\s+/);
          if (tokens.length >= 2 && !tokens[0].startsWith('//') && !tokens[0].startsWith('@@')) {
            const name = tokens[0];
            const type = tokens[1];
            const primary_key = line.includes('@id');
            const nullable = type.endsWith('?');
            columns.push({
              name,
              type,
              nullable,
              primary_key,
              default: null
            });
          }
        });

        schema[modelName] = { columns, foreign_keys: [] };
      }
    }
  });

  return schema;
}

// 5. Auditoría de Base de Datos (Inconsistencias estructurales y de seguridad)
function auditSchema(schema) {
  const findings = [];
  const tables = Object.keys(schema);

  if (tables.length === 0) return findings;

  // Detección de inconsistencias de nombres (camelCase vs snake_case)
  let hasSnakeCase = false;
  let hasCamelCase = false;

  tables.forEach(table => {
    if (table.includes('_')) hasSnakeCase = true;
    else if (/[A-Z]/.test(table)) hasCamelCase = true;

    const columns = schema[table].columns || [];
    const fks = schema[table].foreign_keys || [];

    // 1. Verificar clave primaria
    const hasPk = columns.some(c => c.primary_key || c.name.toLowerCase() === 'id');
    if (!hasPk) {
      findings.push({
        level: 'HIGH',
        category: 'Structure',
        message: `La tabla \`${table}\` no posee clave primaria definida o columna \`id\`.`
      });
    }

    columns.forEach(col => {
      // 2. Seguridad: detectar almacenamiento de contraseñas plano
      if (col.name.toLowerCase().includes('password') || col.name.toLowerCase() === 'pass') {
        const typeLower = col.type.toLowerCase();
        // Si el tipo es varchar corto o char corto, probablemente no esté hasheado
        const shortMatch = col.type.match(/(varchar|char)\((\d+)\)/i);
        if (shortMatch && parseInt(shortMatch[2]) < 40) {
          findings.push({
            level: 'CRITICAL',
            category: 'Security',
            message: `La columna \`${col.name}\` en \`${table}\` parece almacenar contraseñas en texto plano (longitud corta: ${shortMatch[2]} caracteres).`
          });
        }
      }

      // 3. Claves foráneas implícitas sin índice ni constraint
      if (col.name.endsWith('_id') && col.name !== 'id') {
        const expectedTablePlural = col.name.replace(/_id$/, 's');
        const expectedTableSingular = col.name.replace(/_id$/, '');
        
        // Verificar si la tabla de destino existe
        const targetTable = tables.find(t => t.toLowerCase() === expectedTablePlural.toLowerCase() || t.toLowerCase() === expectedTableSingular.toLowerCase());
        
        if (targetTable) {
          const isFkDeclared = fks.some(fk => fk.column.toLowerCase() === col.name.toLowerCase());
          if (!isFkDeclared) {
            findings.push({
              level: 'MEDIUM',
              category: 'Performance/Constraint',
              message: `La columna \`${col.name}\` en \`${table}\` hace referencia implícita a \`${targetTable}\` pero no posee restricción de clave foránea declarada.`
            });
          }
        }
      }
    });
  });

  if (hasSnakeCase && hasCamelCase) {
    findings.push({
      level: 'LOW',
      category: 'Convention',
      message: 'Se detecta nomenclatura mixta en las tablas (camelCase y snake_case conviviendo juntas).'
    });
  }

  return findings;
}

// 6. Generación del reporte visual Markdown
function generateMarkdownReport(env, config, schema, findings) {
  let md = `# 📊 Reporte de Estructura de Base de Datos (CodeGraph Caché)\n\n`;
  md += `## 💻 Entorno Detectado\n`;
  md += `*   **Sistema Operativo**: ${env.osType === 'win32' ? 'Windows' : env.osType}\n`;
  md += `*   **Stack local**: ${env.stack}\n`;
  md += `*   **Contenedorizado (Docker)**: ${env.hasDocker ? 'Sí' : 'No'}\n`;
  md += `*   **Motor de Base de Datos**: ${config.engine.toUpperCase()}\n`;
  md += `*   **Host/Puerto**: \`${config.host}:${config.port}\`\n\n`;

  md += `## 🔍 Hallazgos de Auditoría\n\n`;
  if (findings.length === 0) {
    md += `> [!NOTE]\n> **¡Todo Correcto!** No se detectaron inconsistencias críticas de estructura o seguridad.\n\n`;
  } else {
    findings.forEach(f => {
      const alert = f.level === 'CRITICAL' ? 'CAUTION' : f.level === 'HIGH' ? 'WARNING' : 'NOTE';
      md += `> [!${alert}]\n> **[${f.level}] [${f.category}]**: ${f.message}\n\n`;
    });
  }

  md += `## 🏗️ Esquema de Tablas\n\n`;
  const tables = Object.keys(schema);
  if (tables.length === 0) {
    md += `*No se detectaron tablas en el esquema.*\n`;
  } else {
    tables.forEach(table => {
      md += `### 📋 Tabla: \`${table}\`\n\n`;
      md += `| Columna | Tipo | Nullable | Clave Primaria | Predeterminado |\n`;
      md += `|---|---|---|---|---|\n`;
      schema[table].columns.forEach(col => {
        md += `| \`${col.name}\` | \`${col.type}\` | ${col.nullable ? 'Sí' : 'No'} | ${col.primary_key ? '🔑 Sí' : 'No'} | \`${col.default || 'NULL'}\` |\n`;
      });
      md += `\n`;
      
      const fks = schema[table].foreign_keys || [];
      if (fks.length > 0) {
        md += `* **Claves Foráneas**:\n`;
        fks.forEach(fk => {
          md += `  * \`${fk.column}\` ➔ \`${fk.referenced_table}(${fk.referenced_column})\`\n`;
        });
        md += `\n`;
      }
      md += `--- \n\n`;
    });
  }

  return md;
}

// Ejecución principal
function run(projectDir) {
  console.log('=== ESCANEO Y DETECCION DE BASE DE DATOS ===');
  const env = detectEnvironment();
  console.log(`  [+] SO: ${env.osType} | Stack: ${env.stack}`);
  
  const config = getDbConfig(projectDir);
  console.log(`  [+] Motor: ${config.engine} | Base de datos: ${config.database || 'SQLite / Temporal'}`);

  // Intentar introspección en caliente
  let schema = fetchSchemaFromDb(config);
  let mode = 'Introspección en Caliente (Conexión Activa)';

  if (!schema) {
    // Si falla, usar fallback estático
    schema = parseStaticMigrations(projectDir);
    mode = 'Análisis Estático (Migraciones / DDL)';
  }

  // Auditar esquema
  const findings = auditSchema(schema);
  console.log(`  [+] Auditoría completada: ${findings.length} hallazgos encontrados.`);

  // Guardar en la carpeta .codegraph/ del proyecto
  const codegraphDir = path.join(projectDir, '.codegraph');
  if (!fs.existsSync(codegraphDir)) {
    fs.mkdirSync(codegraphDir, { recursive: true });
  }

  // Escribir JSON
  const jsonOutput = {
    metadata: {
      generated_at: new Date().toISOString(),
      mode,
      environment: env,
      database_config: {
        engine: config.engine,
        host: config.host,
        port: config.port,
        database: config.database
      },
      audit_findings_count: findings.length
    },
    schema,
    findings
  };

  fs.writeFileSync(path.join(codegraphDir, 'db_schema.json'), JSON.stringify(jsonOutput, null, 2), 'utf8');
  console.log('  [+] Caché JSON guardado en: .codegraph/db_schema.json');

  // Escribir Markdown
  const mdReport = generateMarkdownReport(env, config, schema, findings);
  fs.writeFileSync(path.join(codegraphDir, 'db_schema.md'), mdReport, 'utf8');
  console.log('  [+] Reporte visual guardado en: .codegraph/db_schema.md');

  console.log('=== PROCESO DE BASE DE DATOS FINALIZADO ===\n');
}

// Ejecución desde línea de comandos
const targetDir = process.argv[2] || process.cwd();
run(targetDir);
