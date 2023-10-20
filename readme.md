# ROLLINGCODE SCHOOL ACADEMY
## Comisión 55i Fullstack 2023
### Repo proyecto backend Express API Rest para proyecto final de curso: Hoteleria y reserva de habitaciones

### Nuestra API hasta el momento
- basada en Express
- CORS habilitado
- Variables de entorno y parámetros de URL habilitados
- Rutas de usuario, reservas y rooms en archivos separados con prefijos
- Catchall para rutas inexistentes
- Conexión con MongoDB vía Mongoose
- Paginación pendiente de rooms con mongoose-paginate-v2

### Funcionalidades habilitadas
#### Usuarios (users):
- Listado completo
- Listado paginado
- Listado por ID (validación de ID)
- Carga de usuario (validación de requeridos y ya registrado)
- Login de usuario (validación de requerido y existente)
- Login de usuario: generación de token JWT
- Edición de usuario (validación de ID y permitidos)
- Borrado de usuario (validación de ID)
- Endpoint protegido USER (requiere token)
- Endpoint protegido ADMIN (requiere token y rol admin)
- Almacenamiento de reserva de rooms en usuario

#### Habitaciones (rooms):
- Listado completo
- Listado paginado(pendiente)
- Listado por ID (validación de ID)
- Carga de rooms admin (validación de requeridos y ya registrado)
- Edición de rooms admin (validación de ID y permitidos)
- Reserva de rooms usuario (validación de ID y permitidos)
- Borrado de rooms admin (validación de ID)
- Endpoint protegido ADMIN (requiere token y rol admin para carga, edición y borrado)
- Almacenamiento de reserva de rooms en usuario y en reservas

### Dependencias
```bash
$ npm i bcrypt cors dotenv express express-validator mongoose mongoose-paginate-v2
$ npm i nodemon --save-dev
```

### Nombres de variables de entorno, ejemplo de lo que debe contener cada una (archivo .env en raíz del proyecto)
```bash
EXPRESS_PORT=5010
MONGODB_URI=mongodb://localhost:27017/rolling55i
MONGODB_URI_REMOTA=mongodb+srv://<usuario>:<clave>@cluster0.4qaobt3.mongodb.net/hoteleria
REQ_LIMIT=5
TOKEN_SECRET=rolling55i
TOKEN_EXPIRATION=1h
```

### Ejecución para desarrollo
```bash
$ npm run dev
```


### Deploy para producción (pendiente)
- Railway: [Railway.app](https://railway.app/)
- IMPORTANTE para Railway!: agregar las variables de entorno necesarias, incluyendo PORT con el número de puerto a utilizar, caso contrario el deploy se realizará pero la app no será accesible a través del dominio habilitado.
- Si se desea utilizar una versión de NodeJS específica, agregar en el directorio raíz de la aplicación un archivo .nvmrc con la versión dentro (20.4.0 por ejemplo), Railway iniciará el servicio respetando esa versión.

- Render: [Render.com](https://render.com/)
- IMPORTANTE para Render!: agregar en la configuración npm i (build command) y node src/app.js o el nombre de app que se haya elegido (start command). Colocar también las variables de entorno necesarias, en este caso no se requiere PORT, y la versión de node se puede manejar mediante la variable NODE_VERSION en lugar del archivo .nvmrc.

### Endpoints users
- Listado de usuarios: GET /api/users
- Ver un usuario: GET /api/users/one/:id
- Login de usuario: POST /api/users/login
- Carga de usuario: POST /api/users
- Edición de usuario: PUT /api/users/:id
- Borrado de usuario: DELETE /api/users/:id

### Endpoints rooms
- Listado de rooms: GET /api/rooms
- Ver una room: GET /api/rooms/one/:rid
- Carga de room: POST /api/rooms/admin
- Edición de room: PUT /api/rooms/admin/:rid
- Borrado de room: DELETE /api/rooms/admin/:rid
- Reserva de room: POST /api/rooms/reserved/:rid


### Pruebas de endpoints
- Programa externo: [Postman](https://www.postman.com/downloads/)
- Extensión VSCode: [Thunderclient](https://www.thunderclient.com/)


### Generador datos fake pra pruebas
- Datos mock: [Mockaroo](https://www.mockaroo.com/)