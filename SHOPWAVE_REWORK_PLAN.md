# Executive Summary

Plan técnico para GPT-5.6 Luna. Fecha: 2026-09-16. Este documento NO implementa el rework. La única escritura de esta planificación es este archivo.

## Alcance y autoridad

- F = C:/Proyectos/shopwave-frontend.
- E = C:/Proyectos/shopwave-entorno, autorizado expresamente por el usuario al corregir la ubicación.
- B = E/backend. El repositorio Git del backend es E, no la ruta inexistente shopwave-backend.
- J = B/src/main/java/com/shopwavefusion.
- No acceder a otros proyectos. No ejecutar aplicar-cambios-backend.ps1 ni extraer/aplicar cambios-backend-render.zip: son artefactos locales no autorizados como fuente de cambios.
- Este plan no autoriza deploy, modificación de bases existentes, publicación de credenciales, borrados de datos, commits ni push. La ejecución futura requiere el encargo de implementación correspondiente.
- Preservar cambios existentes: en F ya están eliminados Contexto_proyecto_final.md, PLAN_CORRECCIONES.md y README_MIGRACION_VERCEL.md; existen auditoría y docs/ sin seguimiento. En E hay tres artefactos de producción sin seguimiento. No restaurarlos, incorporarlos ni sobrescribirlos automáticamente.

## Decisión ejecutiva

Sí merece rework: existe un dominio reconocible, servicios REST y un backend propio con persistencia. No merece un simple cambio de CSS. El mayor problema es la integridad y confidencialidad de los datos, seguido de la falta de contrato verificable y pruebas.

Conservar Next.js/React/TypeScript/Tailwind y Java/Spring/MySQL. No reescribir el backend en Node sólo para alinearlo con el posicionamiento profesional: demostrar React + REST + transacciones + pruebas con Spring es evidencia Full Stack válida. No presentar Java como experiencia Node.

Decisiones cerradas: API /api/v1; DTOs explícitos; BFF Next de mismo origen; JWT sólo en cookie HttpOnly del frontend; autorización y propiedad en Spring; pago MOCK sin tarjetas; stock por variante; órdenes transaccionales e idempotentes; importes en centavos BOB; catálogo paginado en SQL; pruebas desde cada fase; reseñas fuera del alcance final. Diez fases P0–P9. No se mantiene una segunda arquitectura de mocks para la demo: la demo final usa backend real y datos ficticios.

## Evidencia y límites

La auditoría frontend fue leída completa. Se contrastaron servicios/modelos del frontend con controllers, servicios, repositorios, entidades, DTOs, enums, seguridad, seeders, configuración, POM, Docker y test del backend. Las afirmaciones funcionales de backend son revisión estática, NO ejecución. No se arrancó Spring ni Docker: ddl-auto=update y CommandLineRunner pueden modificar datos. No se ejecutó Maven: no se autorizó instalar ni acceder a cachés fuera de los repositorios. La única prueba existente levanta el contexto real sin perfil aislado.

Build/lint frontend: PASS reportado en la auditoría anterior, con seis warnings de imágenes; NO reejecutado en esta planificación. Backend compile, context, tests, endpoints vivos, comportamiento exacto de Hibernate y seguridad en HTTP: NO VERIFICADOS. No inventar resultados ni confundir endpoint presente con flujo funcionando.

# Current Frontend State

Base principal: SHOPWAVE_FRONTEND_AUDIT.md, sin repetirla. Dieciséis páginas cubren home, catálogo/detalle, login/registro, carrito/checkout, perfil, órdenes y admin. Hay servicios y modelos por dominio, TypeScript strict, tokens de tema y componentes pequeños aprovechables. Next 16.2.6 y React 19.2.4; Tailwind 4; TypeScript declarado ^5, resolución 5.9.3 según auditoría; lucide-react y jwt-decode. Scripts existentes: dev, build, start y lint; no test/typecheck/CI.

La mayor parte carga datos tras hidratar, filtra arrays completos y replica loading/error. JWT en localStorage; guards visuales; ausencia de validación runtime; efectos susceptibles a respuestas antiguas; checkout con PAN; retry de órdenes defectuoso; UI y accesibilidad incompletas.

Correcciones al diagnóstico anterior al contrastar el backend:

- /products devuelve efectivamente un array; /products/products/search existe; /cart/ y /orders/ coinciden con mappings reales. No contabilizar esos nombres extraños como rutas rotas.
- Update de producto backend recibe CreateProductRequest: el formulario actual se aproxima a ese DTO, pero la firma Partial<Product> del servicio está equivocada.
- Los endpoints admin sí tienen hasRole(ADMIN). Los guards no son seguridad, pero no significa que el backend carezca de autorización admin.
- parseJsonSafe repara un fragmento de hibernateLazyInitializer y recorta JSON concatenado: esconder corrupción no sustituye arreglar serialización.
- El modal real está en src/components/ui/Modal.tsx, no components/forms/Modal.tsx.
- Soportar un filtro en un servicio no demuestra que tenga control visible. Tampoco se ha verificado UI real en navegador.

# Current Backend State

## Stack y estructura

POM: Java 17, Spring Boot 3.1.2, Web MVC, Spring Security, JPA, Validation, MySQL Connector, H2 runtime, Lombok opcional, devtools, springdoc 2.0.2, JJWT 0.11.5, jackson-datatype-hibernate5 2.15.2. Wrapper Maven 3.9.4. Las versiones transitivas instaladas son NO VERIFICADAS; no hay target. Docker construye con Maven 3.8.5/Java17 y ejecuta Corretto17; compila saltando tests.

Paquetes horizontales controller/service/repository/modal/request/response/config/exception/user.domain. 'modal' es una errata de nomenclatura, no razón suficiente para mover todo durante el rework. Interfaces y clases Implementation duplican estructura pero son utilizables. CategoryService está vacío; OrderItemService sólo hace save. No se encontró capa DTO de salida: controllers serializan entidades.

## Hallazgos por dominio y severidad

| Nivel | Evidencia en J | Diagnóstico |
|---|---|---|
| CRÍTICA | config/SecurityConstants.java, AdminInitializer.java | Clave JWT y credencial inicial codificadas; initializer sin perfil. Tratar como comprometidas si estuvieron expuestas; no reproducir valores. |
| CRÍTICA | controller/OrderController.java findOrderHandler | Obtiene usuario pero no lo compara con la orden. Un usuario autenticado puede solicitar IDs ajenos según código. |
| CRÍTICA | modal/User.java, Review.java, Rating.java, Product.java | Password es WRITE_ONLY, lo cual está bien; direcciones y paymentInformation no se ocultan. Reviews/ratings públicos incluyen User, y Product incluye esas colecciones: hay una ruta de exposición pública de datos privados cuando existen reseñas. Explotación HTTP NO VERIFICADA. |
| CRÍTICA | service/OrderServiceImplementation.java | Guarda PAN en orden y payment_information; PaymentDetails además declara cvv y expiración, aunque CreateOrderRequest no los recibe ni el servicio los asigna. No afirmar que se guardaron CVV reales. |
| ALTA | exception/GlobleException.java | Catch general retorna 202 con ErrorDetails; frontend considera éxito. Errores específicos siempre 400 incluso inexistencia; sin contrato de 401/403 consistente. |
| ALTA | service/CartServiceImplementation.java, CartItemServiceImplementation.java | Valida cantidad global, no talla; add permite cantidades no positivas; update clampa a mínimo1 incluso con stock0; talla del update ignorada. GET carrito guarda totales y puede crear carrito. |
| ALTA | service/OrderServiceImplementation.java | create sí es transaccional, pero sin locks/version; descuenta quantity global, no Size.quantity; no valida carrito vacío; copia precios anteriores del carrito; sin idempotencia. |
| ALTA | mismo servicio | Confirmar/enviar/entregar/cancelar no verifican transición; cancelar no repone stock; borrar destruye historial; placedOrder no guarda y no tiene controller. |
| ALTA | modal/Order.java y servicio | shippingAddress OneToOne pero se reutilizan direcciones en varias órdenes: conflicto potencial con unicidad JPA. orderId nunca se asigna; deliveryDate tampoco al entregar. OrderItem conserva Product mutable, no snapshot de título/imagen. |
| ALTA | config/ProjectSecurityConfig.java | CORS cualquier origen con credenciales, formLogin+Basic+JWT simultáneos. Matcher cart_items/** carece de slash inicial: comportamiento exacto pendiente de test. Creación de reviews/ratings no tiene regla permitida; no asumir que autenticarse concede acceso a mappings no coincidentes. |
| ALTA | config/JWTTokenValidatorFilter.java | JWT raw, errores de parseo silenciados; roles de claims, sin revocación ni consulta de rol actual. Expiración generada 30.000.000 ms (~8h20), sin refresh/logout backend. |
| ALTA | service/ProductServiceImplementation.java getAllProduct | colors opcional se desreferencia; sizes se ignora; subList falla para página fuera de rango; descarga lista y pagina en memoria. |
| ALTA | repository/ProductRepository.java | category null no equivale a ''; BETWEEN con un límite null no representa rango abierto; sort sólo price_low/price_high; semántica distinta al frontend. |
| ALTA | ProductServiceImplementation update | Ignora ceros para precios, descuento y cantidad: no permite poner stock0 ni quitar descuento0 correctamente. Duplicación de overloads; alta/edición casi sin validación. |
| ALTA | application-prod.properties | 'prod' usa H2 en memoria: reinicio pierde usuarios, carrito y órdenes. No es persistencia de producción. |
| MEDIA | modal/Product.java, CartItem.java | equals/hashCode incluyen campos mutables, colecciones y relaciones; riesgo en Set y coste de carga. Size/PaymentDetails no declaran Embeddable aunque se usan como embebidos: bootstrap NO VERIFICADO. |
| MEDIA | request/*, controllers | @Valid sólo en registros; @NotNull permite strings vacíos; no límites de rating, precio, cantidades, tamaños, longitudes ni URLs. |
| MEDIA | config/DataSeeder.java | 30 productos, categorías y suma de tallas son activos. count>0 impide reparar siembra parcial; catches silencian fallos; lookup padre por nombre ambiguo. Sin perfil/transacción global. |
| MEDIA | POM/config | Hibernate5 Jackson en una base Spring Boot3/Jakarta; no se encontró registro del módulo. Es dependencia sospechosa/no utilizada, no prueba de un fallo de runtime. |
| MEDIA | test/contextLoads | Único scaffolding JUnit/SpringBootTest, sin assertions de negocio ni aislamiento de datos. |

MySQL local en application.properties, usuario fijo y password de configuración; compose tiene credencial de ejemplo y volumen persistente; DB_PASSWORD de compose no aparece referenciada por application.properties. Prod H2 sobreescribe datasource. No Flyway/Liquibase ni perfiles test/local separados. OpenAPI declara Bearer pero parser exige token raw. Swagger está permitido por Security, aunque el disable de recursos estáticos requiere probar su UI. No gateway de pagos ni cliente de proveedor real. No reintentos/timeout de servicios externos que auditar: aquí son operaciones de BD.

Estado: catálogo/CRUD/login/carrito/órdenes están implementados; funcionamiento completo NO VERIFICADO. Reviews tienen almacenamiento pero no integración y seguridad de escritura pendiente. Categorías no tienen controller público propio. Perfil sólo lectura. No administración de usuarios salvo endpoint de alta admin protegido. Documentos de correcciones no sustituyen esta evidencia.

# Frontend ↔ Backend Contract Audit

## Leyenda de matriz

Rutas siguientes son actuales, NO el contrato futuro. F:modelos son los TS; B:entidades son modal/*.java, no DTOs seguros. 'Igual' indica ruta/verbo compatible estáticamente; no afirma ejecución. U/A = USER o ADMIN; A = ADMIN; P = público. Autenticación actual raw Authorization, salvo signin Basic. Sí = forma esencial compatible; Parcial = incompatibilidad de tipos/semántica; No = operación no cubre lo esperado. Todos los resultados están sujetos al error global M07.

Abreviaturas de payload: Reg={firstName,lastName,email,password,mobile}; CP={title,description,price,discountedPrice,discountPersent,quantity,brand,color,size:[{name,quantity}],imageUrl,topLevelCategory,secondLevelCategory,thirdLevelCategory}; CO={firstName,lastName,streetAddress,city,state,zipCode,mobile,paymentMethod,status,paymentId,cardholderName,cardNumber}; AI={productId,size,quantity,price}; AR={message,status}; Page={content,totalElements,totalPages,size,number,first,last}. Los campos adicionales de Spring Page no se usan. Referencias Mxx enlazan al inventario inmediatamente posterior. Sin cuerpo = —.

| Frontend service.method | HTTP / expected endpoint | Expected request → response | Backend controller / actual endpoint | Actual request → response / HTTP | Auth | Compatible / problema / cambio recomendado |
|---|---|---|---|---|---|---|
| Auth.login → api.loginBasic | GET /auth/signin | Basic → JWT header; service void | Auth / igual + GeneratorFilter | Basic → User + Authorization raw /200 | Basic | Sí; transporte no estándar M14; login JSON v1 |
| Auth.register | POST /auth/signup | Reg → User | Auth / igual | User @Valid → User /200 | P | Parcial; entity binding/nullable; DTO Reg seguro /201 |
| Product.getProducts | GET /products | — → Product[]; slice local | Product / igual | — → List<Product> /200 | P | Sí; migrar paginación real, no alegar ruta inexistente |
| Product.getFilteredProducts | GET /products | — → Product[], fabrica Page | Product / igual | — → List<Product> /200 | P | Sí HTTP; filtros no llegan a B; M15 al migrar /all; un solo query v1 |
| Product.getFacets | GET /products | — → Product[], deriva facets | Product / igual | — → List<Product> /200 | P | Sí; endpoint facets acotado |
| Product.getProduct | GET /products/{id} | — → Product | Product / igual | Long → Product /200 | P | Parcial M09/M11; DTO sin User anidado |
| Product.searchProducts | GET /products/products/search?q | q → Product[] | Product / igual | q → List<Product> /200 | P | Sí; integrar búsqueda en listado paginado |
| Product.getByCategory (sin uso) | GET /products/by-category | categoryName,page,pageSize → Page<Product> | Product / igual | mismos → Page<Product> /200 | P | Sí; eliminar método redundante |
| AdminProduct.getAll | GET /products | — → Product[] | Product / igual | — → List<Product> /200 | P | Sí; futuro admin incluye archivados y paginación |
| AdminProduct.getById | GET /products/{id} | — → Product | Product / igual | — → Product /200 | P | Sí esencial; separar recurso admin |
| AdminProduct.create | POST /admin/products/ | CP → Product | AdminProduct / igual | CreateProductRequest → Product /202 | A | Sí shape; validar, devolver201 |
| AdminProduct.update | PUT /admin/products/{id}/update | Partial<Product>; formulario CP → Product | AdminProduct / igual | CreateProductRequest → Product /200 | A | Parcial M01/M02; PUT DTO completo y ceros válidos |
| AdminProduct.delete | DELETE /admin/products/{id}/delete | — → AR | AdminProduct / igual | — → ApiResponse /202 | A | Sí; reemplazar borrado por archivado |
| AdminProduct.createMultiple (sin uso) | POST /admin/products/creates | CP[] → AR | AdminProduct / igual | CP[] → ApiResponse /202 | A | Sí; no atomicidad global; retirar |
| Cart.getCart | GET /cart/ | — → Cart | Cart / igual | — → Cart /200; puede escribir | U/A | Sí shape; lectura sin mutación |
| Cart.addItem | PUT /cart/add | AI → CartItem | Cart / igual | AddItemRequest → CartItem /202 | U/A | Parcial M03/M05; precio input ignorado correctamente; usar variantId |
| CartItem.update | PUT /cart_items/{id} | {quantity,size} → CartItem | CartItem / igual | CartItem → CartItem /202 | U/A* | Parcial M03/M04/M05; DTO cantidad absoluta |
| CartItem.remove | DELETE /cart_items/{id} | — → AR | CartItem / igual | — → ApiResponse /202 | U/A* | Sí forma, matcher pendiente; /cart/items/{id} v1 |
| Order.create | POST /orders/ | CO → Order | Order / igual | CreateOrderRequest → Order /200 | U/A | Parcial M06/M07/M10/M11; MOCK sin PAN,201 |
| Order.getUserOrders | GET /orders/user | — → Order[] | Order / igual | — → List<Order> /202 | U/A | Parcial tipos; paginar y ordenar |
| Order.getById | GET /orders/{id} | — → Order propia | Order / igual | — → cualquier Order /202 | U/A | No aislamiento propietario; DTO mínimo + ownership |
| User.getProfile | GET /users/profile | — → User | User / igual | — → User /202 | U/A | Compatible pero inseguro: paymentInformation completo; /me seguro |
| AdminOrder.getAll | GET /admin/orders/ | — → Order[] | AdminOrder / igual | — → List<Order> /202 | A | Sí shape; paginar |
| AdminOrder.getById | GET /orders/{id} | — → Order | Order / igual | — → Order /202 | U/A | Sí para admin pero comparte ruta insegura; separar admin |
| AdminOrder.confirm | PUT /admin/orders/{id}/confirmed | {} → Order | AdminOrder / igual | sin body usado → Order /202 | A | Compatible transporte, sin máquina de estados; PATCH status |
| AdminOrder.ship | PUT /admin/orders/{id}/ship | {} → Order | AdminOrder / igual | — → Order /202 | A | Ídem; validar CONFIRMED→SHIPPED |
| AdminOrder.deliver | PUT /admin/orders/{id}/deliver | {} → Order | AdminOrder / igual | — → Order /202 | A | Ídem; deliveryDate queda null; registrar deliveredAt |
| AdminOrder.cancel | PUT /admin/orders/{id}/cancel | {} → Order | AdminOrder / igual | — → Order /202 | A | Ídem; reponer stock una vez |
| AdminOrder.delete | DELETE /admin/orders/{id}/delete | — → AR | AdminOrder / igual | — → ApiResponse /202 | A | Sí transporte, borra historia; eliminar funcionalidad |
| Review.getByProduct | GET /reviews/product/{id} | — → Review[] auth=true | Review / igual | — → List<Review> /200 | P | Parcial M09/M12; retirar del alcance |
| Review.create | POST /reviews/create | {productId,review} → Review | Review / igual | ReviewRequest → Review /202 | sin regla grant | No M13; retirar |
| Rating.getByProduct | GET /ratings/product/{id} | — → Rating[] auth=true | Rating / igual | — → List<Rating> /200 | P | Parcial M09/M12; retirar |
| Rating.create | POST /ratings/create | {productId,rating} → Rating | Rating / igual | RatingRequest → Rating /202 | sin regla grant | No M13; retirar |

* El matcher cart_items/** sin slash requiere prueba de Spring Security; no se cuenta como fallo confirmado de routing.

Endpoints backend sin consumidor frontend: /all (protegido), /products/sorted, /products/by-category-and-price, /products/all, /products/products, /products/products/id/{id}, /admin/control/signup, /auth/post y home HTML. /auth/post carece de regla explícita de acceso. No perpetuar aliases redundantes ni el alta pública de administradores (la actual NO es pública).

## Inventario de incompatibilidades: 15 familias confirmadas estáticamente

Contar familias, no cada llamada afectada. Incluye diferencias de contrato de tipos y semántica, no sólo URLs. Riesgos de seguridad adicionales no se inflan como mismatches.

| ID | Diferencia concreta | Resolución única |
|---|---|---|
| M01 | update TS Partial<Product> vs B CreateProductRequest: sizes/category vs size/nombres por nivel | ProductWrite DTO idéntico create/update |
| M02 | UI puede enviar stock/descuento0; servicio B omite ceros | Validación explícita y asignación completa |
| M03 | F limita stock por talla; B usa/descuenta quantity global y nunca talla | Variante persistente e inventario autoritativo |
| M04 | UpdateCartItemRequest permite size; servicio B sólo actualiza cantidad | No permitir cambiar variante en update |
| M05 | F espera cantidad solicitada; B clampa silenciosamente y add acepta0/negativos | Rechazar400/409, responder carrito canónico |
| M06 | F manda status=PENDING/paymentId; B los reemplaza por COMPLETED/ID propio | MOCK explícito, campos sólo server-owned |
| M07 | F usa response.ok para éxito; B excepciones generales son202 ErrorDetails | Error no2xx tipado, sin heurísticas JSON |
| M08 | PaymentStatus B contiene PROCESSING; union F no | Contrato nuevo sólo SIMULATED/VOIDED |
| M09 | Review/Rating F requieren product; @JsonIgnore B lo omite | Retirar módulo; nunca serializar entidades como DTO |
| M10 | Order.orderId F string obligatorio; B no lo asigna | number público único obligatorio generado |
| M11 | F campos opcionales excluyen null; B devuelve null para deliveryDate,parentCategory y otros | null explícito en schema; quitar grafo recursivo |
| M12 | F marca lectura de reviews/ratings autenticada; B la permite pública | Retirar módulo, no conservar auth redundante |
| M13 | F ofrece create review/rating autenticados; B no concede esas rutas en Security | Retirar rutas; no asumir allow por controller |
| M14 | OpenAPI anuncia Bearer; parser y F interoperan sólo con JWT raw | Bearer estándar BFF→Spring |
| M15 | F filtros sort price_asc/desc/discount, ancestros y tallas; B filtros price_low/high, categoría hoja, sizes ignorado/null inseguro | Un único query v1 con semántica definida |

Los montos de seed (p.ej. camiseta 14900) se formatean hoy como BOB sin dividir. No existe unidad declarada: ambigüedad a corregir, NO afirmar conversión monetaria histórica. Slash final actual coincide en las llamadas activas; v1 adopta ausencia de slash, sin depender de redirects de mutaciones.

# Product Scope for the Rework

Tienda generalista ShopWave, español Bolivia, BOB, productos con una variante seleccionable (talla/capacidad/medida; etiqueta genérica 'Variante' fuera de ropa). Un producto mantiene un color; no introducir combinatoria multidimensional. Una sola tienda, catálogo curado de30 productos ficticios, no marketplace.

- Público: home sobria con propuesta y categorías; catálogo buscable/filtrable/paginado; detalle con imagen, descripción, precio y variantes.
- Autenticado: carrito persistente propio, checkout con dirección y resumen, confirmación MOCK, órdenes propias, detalle y perfil con edición de nombre/apellido/teléfono. Email visible no editable; sin password reset en este alcance.
- Direcciones: mantener selección de direcciones guardadas y guardar nueva mediante checkbox explícito en checkout; sin CRUD de libreta independiente. Ciudad separada de departamento, país BO fijo, código postal opcional.
- Admin: productos create/edit/archive, inventario por variante, órdenes paginadas y transiciones válidas, dashboard pequeño con métricas de pedidos simulados claramente rotuladas.
- No reviews/ratings en esta entrega: actualmente no visibles y elevan superficie de privacidad/moderación. Conservar conocimiento de dominio en Git, no código huérfano en ejecución.
- Cada superficie debe resolver loading, error con retry real, empty, forbidden/not-found y éxito; no enlaces, newsletter ni métricas falsas.

# KEEP / REFACTOR / REWRITE / REMOVE

| Área | Decisión | Justificación |
|---|---|---|
| Flujo catálogo→detalle→carrito→checkout→órdenes, admin | KEEP | Identidad del producto y evidencia Full Stack |
| Next App Router, React, TS strict, Tailwind4, lucide, Geist | KEEP | Base funcional; no migración cosmética de stack |
| Button/Input/Select/Badge/Spinner, cards, formatters | REFACTOR | Buenas unidades; corregir semántica, imágenes, dinero y feedback |
| ThemeContext/tokens | REFACTOR | Conservar light/dark con sistema, contraste y reduced motion |
| useProducts, CartContext, AuthContext, API singleton | REWRITE | Cambian fuente de verdad, transporte, seguridad y sincronización |
| Modelos/servicios por dominio | REFACTOR | Mantener puntos de entrada, sustituir contratos por DTOs validados |
| Checkout/AuthScreen/ProductFilter/ProductForm/sidebar | REWRITE | Demasiadas responsabilidades y superficies visuales/accesibles defectuosas |
| Java17/Spring/JPA/MySQL, BCrypt | KEEP | Dominio relacional útil, no sustituir por Node |
| Product/Category/User/Cart/Order y repositorios | REFACTOR | Conservar conceptos y capas; no conservar exposición de entidades |
| Order create transaction | REFACTOR | Frontera correcta; faltan locks, snapshots, idempotencia y stock |
| JWT, Security y errores | REWRITE | Secreto hardcodeado, roles stale, errores202 y raw token |
| DataSeeder | REFACTOR | Buen inventario, necesita claves estables, perfil explícito y atomicidad |
| PAN/CVV, PaymentInformation/PaymentBook | REMOVE | No aportan valor profesional y son un riesgo real |
| Reviews/ratings, aliases REST, /auth/post, home HTML ajeno, alta admin HTTP | REMOVE | No forman parte del producto comprometido |
| Polling3s | REMOVE | Sustituir refetch al volver a la vista + botón actualizar; no requiere tiempo real |
| Assets scaffold, servicios muertos y Stylelint huérfano | REMOVE | Reducir ruido sin reescribir código que será eliminado |

# Target Architecture

Navegador → Next (UI + /api/* BFF) → Spring /api/v1 → MySQL. Server Components consultan Spring directamente mediante módulo server-only, no llaman a su propio BFF por HTTP. El navegador nunca recibe JWT, URL privada ni respuestas de entidades. Spring es la única autoridad sobre stock, precios, roles y órdenes.

Conservar paquetes backend existentes para no gastar el rework en movimientos. Añadir api/v1 con controllers/records DTO/mapping específicos. Servicios existentes evolucionan; repositories contienen queries, no reglas de negocio. DTOs pueden agruparse como records anidados por dominio en un archivo (ProductDtos.java, OrderDtos.java, etc.), evitando cientos de archivos triviales. No CQRS/event bus/microservicios/repository genérico adicional.

Frontend conserva URLs. No es necesario mover todas las páginas a route groups: root layout compone StoreShell que detecta admin mediante isla de navegación; admin/layout.tsx usa shell propio, root no duplica main/nav. Cada página privada y cada acceso de datos llama requireSession; layout no es la única defensa. Public pages server-rendered; islas interactivas para filtros, formularios, carrito y admin. Un QueryProvider para estado remoto interactivo (TanStack Query), ThemeProvider separado y AuthContext de datos de usuario, sin tokens. No Redux ni segundo store de carrito.

Dependencias futuras justificadas: Zod (DTO/formularios), TanStack Query (cancelación/cache privada), Radix Dialog (modal/drawer accesible), Vitest + Testing Library + MSW, Playwright + axe; backend Flyway, Testcontainers MySQL y plugins de cobertura/checkstyle. No añadir Axios, Redux, RHF ni UI kit completo por defecto. Registrar versiones exactas en lock/POM al ejecutar; no se instalaron ahora. Mantener las versiones actuales al obtener baseline. Antes de demo pública, revisar advisories oficiales y fijar versiones mantenidas compatibles; esta auditoría local NO acredita que Boot3.1.2/Next16.2.6 estén libres de vulnerabilidades. Si se requiere cambio mayor incompatible, pausar para autorización; no inventar 'latest'.

## Transición sin romper ambos lados

Trabajo local/no desplegado. P1 fija contrato; P2–P4 construyen v1 en perfil rework con esquema MySQL nuevo aislado y schema definitivo. Legacy no cambia de DTO, tablas ni semántica mientras F antiguo sigue usándolo. Servicios nuevos que requieran entidades nuevas viven temporalmente en paquete v1; no conectar legacy al esquema nuevo. Las clases existentes se migran de una vez al modelo definitivo al corte P5, después de tests v1; hasta entonces perfiles mutuamente excluyentes y aplicación rework escanea sólo su configuración/entidades. No operar ambas APIs inseguras públicamente.

Para evitar duplicación innecesaria, no implementar un puente funcional legacy→v1 ni migrar datos antiguos. Mantener baseline en Git y no alterar un entorno publicado existente. P5 es un corte coordinado de frontend/backend probado, no una fase desplegable a medias. El mapa final describe destinos; archivos temporales de transición no cuentan como arquitectura entregada ni deben sobrevivir P8. No arrancar legacy sobre datos del dueño para comprobar compatibilidad.

Regla mecánica de aislamiento para P2–P4: la implementación nueva temporal vive bajo J/rework/ conservando los subpaquetes finales (modal, repository, service, api/v1, config); migraciones bajo resources/db/rework. Una configuración temporal ReworkConfiguration selecciona exclusivamente esos packages con ComponentScan/EntityScan/EnableJpaRepositories y perfil rework; la configuración principal legacy queda excluida en ese perfil. No mezclar bean scanning de los dos modelos. Los archivos existentes necesarios para esa exclusión se pueden editar sin cambiar su contrato. P5 mueve las implementaciones verificadas a los destinos del mapa, cambia los imports mecánicamente y elimina el árbol temporal y su configuración; el legacy queda desactivado y se retira físicamente P8. Es una sola implementación nueva trasladada, no dos implementaciones v1. El perfil rework siempre requiere URL de BD demo nueva y falla si no está explícita. Tests P2–P4 importan únicamente esa configuración; después del corte prueban la configuración final. Esos paths temporales son derivados exactamente de los destinos y no requieren decidir otra arquitectura.

# Authentication & Security

## Sesión decidida

Login JSON POST /api/v1/auth/login con email/password. Spring BCrypt autentica y emite JWT firmado, sub=userId, iss=shopwave, aud=shopwave-api, iat/exp, jti, tokenVersion. TTL30 minutos, sin refresh automático: re-login explícito es razonable en portfolio. Clave aleatoria >=256bits desde JWT_SECRET obligatorio, sin fallback. Algoritmo fijo HS256, verificar firma/issuer/audience/exp, rechazar claims ausentes.

BFF recibe el token servidor-servidor y escribe cookie __Host-shopwave_session en HTTPS: HttpOnly, Secure, SameSite=Lax, Path=/, sin Domain, MaxAge no mayor que exp. Desarrollo HTTP local usa shopwave_session no Secure; seleccionarlo por configuración de entorno, no por headers del cliente. El body al navegador sólo contiene UserDto y expiresAt. No token en HTML, RSC, logs, localStorage, sessionStorage ni query.

Spring recibe Authorization: Bearer <token>. Cada request privada carga usuario por sub y comprueba tokenVersion, rol actual y estado activo; no confiar únicamente en authorities del JWT. Logout POST invalida todas las sesiones del usuario incrementando tokenVersion transaccionalmente y borra cookie; esto es una decisión deliberada simple sin tabla de sesiones. Si backend no responde, BFF borra cookie local pero informa que revocación remota NO se confirmó; token eventualmente expira en <=30min. No afirmar logout global exitoso en ese caso.

401 = sesión inválida/expirada: BFF elimina cookie en response, Query limpia datos privados, redirige a login con returnTo validado. 403 = usuario autenticado sin permiso: conservar sesión, mostrar acceso denegado. Propiedad: órdenes ajenas y líneas ajenas retornan404, admin usa endpoints admin. Signup fuerza USER y nunca permite role/tokenVersion del body. Registro201 seguido de login explícito, sin mensaje de auto-login.

## CSRF, CORS y límites

BFF valida Origin exacto contra APP_ORIGIN en TODA mutación, incluidas login/signup/logout; requiere Content-Type application/json y X-ShopWave-Request: 1, rechaza Origin ausente/null y Sec-Fetch-Site cross-site. No usar Host/X-Forwarded-Host arbitrarios para decidir origen. GET nunca muta. Estas defensas se prueban, no sólo SameSite. Route handler allowlist fija de método/path/query; no proxy abierto, no pasar Authorization/Cookie/host que mande el navegador. Límite de body64KB, timeout10s, no redirects upstream automáticos, no logs de credenciales.

Spring stateless sin formLogin/httpBasic para v1, CSRF desactivado sólo en API Bearer que no autentica por cookies. CORS navegador→Spring deshabilitado por defecto: navegador usa mismo origen Next. Si se habilita una herramienta web explícita, origins exactos por env, métodos necesarios y allowCredentials=false; nunca '*'. CORS no es autorización. Login rate limit básico por IP y usuario con429 (cache acotada en una instancia, limitación documentada); no fingir defensa distribuida.

Admin: backend hasRole + comprobación en service; frontend requireAdmin antes de cargar datos + UX, no protección única. Retirar endpoint de alta admin HTTP. Cuenta admin demo creada sólo con perfil demo y variables explícitas, sin imprimir credenciales; habilitar acceso público de edición requiere entorno descartable y autorización del dueño, no credencial admin universal en README.

## Pago

Una opción única 'Pago simulado — no se realiza ningún cobro'. Request paymentMethod=MOCK; backend devuelve status=SIMULATED y reference generado por servidor. Al cancelar status=VOIDED, sin afirmar reembolso bancario. No inputs ni DTOs ni columnas PAN/CVV/expiration/cardholder; desconocidos rechazados en request. No gateway sandbox: no añade suficiente valor respecto a idempotencia, stock y seguridad. El historial muestra permanentemente que la operación fue simulada.

# API Contract

## Reglas normativas

Prefijo Spring /api/v1, sin slash final. IDs UUID en contrato nuevo; legacy numérico no se preserva en datos demo nuevos. Fechas ISO8601 UTC con Z; visualizar America/La_Paz. Dinero entero en centavos, currency='BOB'; límites monetarios 0..100000000 por importe unitario; operaciones Java long con límites de cantidad para no exceder Number.MAX_SAFE_INTEGER al serializar. Nada de double/int como moneda ambigua. formatPrice recibe centavos y divide100 sólo en presentación.

Campos requeridos siempre presentes; opcionales de salida declarados nullable, no omisiones arbitrarias. Requests strict: campos desconocidos400. JSON application/json; errores application/problem+json: {type,title,status,code,detail,instance,traceId,fieldErrors:[{field,message}]}; fieldErrors siempre array, code estable, detalle sin SQL/stack/PII. Éxito sin envelope genérico. Listado Page<T>={items:T[],page,size,totalItems,totalPages}; page base0,size default12,max48; página más allá del final200 items[], totalPages0 cuando vacío. Sort estable con id secundario. UUID mal formado400, inexistente404, validación400, duplicado/conflicto/stock409, auth401/403, rate429, inesperado500; BFF upstream inválido502, timeout504. DELETE204 sin parsear body.

## DTOs definitivos

| DTO | Campos y reglas |
|---|---|
| Register | firstName,lastName(1..80), email normalizado(trim+lowercase,<=254), password(12..72 bytes UTF8 BCrypt, no truncamiento silencioso), mobile(8 dígitos Bolivia o +591 seguido8). Sin rol. Login email/password mismos límites, error genérico. |
| User | id,email,firstName,lastName,mobile,role(USER/ADMIN),createdAt; ningún password ni pagos ni asociaciones. Session={user,expiresAt}; TokenResponse sólo backend→BFF agrega accessToken. |
| AddressInput | firstName,lastName,streetAddress(1..200),city(1..80),department(enum9 departamentos Bolivia),postalCode:string o null(max20),mobile,country='BO'. Guardada agrega id; nunca userId. |
| Category | id,name,parentId:UUID|null,path:array de {id,name}; profundidad máxima3; IDs evitan nombres repetidos. |
| Variant | id,label(1..30),stock entero>=0,active:boolean. No quantity total mutable en Product. Label único normalizado dentro de producto. |
| Product | id,title(1..160),description(1..4000 texto plano),brand(1..80),color(1..40),category:Category,imageUrl,priceMinor,salePriceMinor,currency,discountPercent calculado,stockTotal calculado,variants:Variant[],active,version,createdAt,updatedAt. No User/reviews/ratings. Sale<=price, price>0, sale>0. |
| ProductWrite | title,description,brand,color,categoryId,imageUrl,priceMinor,salePriceMinor,variants:[{id:UUID|null,label,stock,active}],version sólo update. Campo active del producto se cambia con archivado. No discountPercent/stockTotal/currency arbitrarios. URL https de host permitido o /catalog/asset existente; no URL interna/data/javascript. |
| Cart | id,version,quoteFingerprint,items:[{id,variantId,productId,title,imageUrl,variantLabel,quantity,stockAvailable,unitPriceMinor,unitSalePriceMinor,lineTotalMinor,available}],subtotalMinor,discountMinor,totalMinor,totalQuantity,currency. Líneas calculadas con precios actuales; archived/out-of-stock conservan línea available=false y bloquean checkout. |
| CartWrite | add={variantId,quantity}; update={quantity}; quantity1..10. Add incrementa línea existente; exceder10/stock409, no clamp. No price,size ni userId. Cada respuesta de mutación salvo DELETE devuelve Cart completo. |
| Checkout | {address:AddressInput,saveAddress:boolean,paymentMethod:'MOCK',cartVersion:integer,quoteFingerprint:string}; header Idempotency-Key UUID requerido. No totales/estado pago/id pago. |
| Order | id,number ('SW-'+UUID sin guiones, único),status(PLACED/CONFIRMED/SHIPPED/DELIVERED/CANCELLED),version,createdAt,deliveredAt:timestamp|null,shippingAddress:AddressInput snapshot,items:[{id,productId,variantId,title,imageUrl,variantLabel,quantity,unitPriceMinor,unitSalePriceMinor,lineTotalMinor}],subtotalMinor,discountMinor,totalMinor,currency,totalQuantity,payment:{method:'MOCK',status:SIMULATED/VOIDED,reference},allowedTransitions:status[]. AdminOrder agrega customer:{id,firstName,lastName,email}; no direcciones ajenas fuera de snapshot. |
| OrderStatusWrite | {status,version}; allowedTransitions sólo ayuda UX, backend vuelve a validar. |
| Facets | {categories:Category[],colors:string[],variantLabels:string[],minPriceMinor,maxPriceMinor}; globales de productos activos, no dependientes de filtro; sin counts engañosos. |
| AdminSummary | {activeProducts,ordersPlaced,ordersConfirmed,simulatedSalesMinor,currency,periodStart,periodEnd}; ventas = no canceladas creadas en mes calendario America/La_Paz; indicar simuladas. |

Product paginado puede usar Product completo al tener máximo48 y pocas variantes; no crear Summary/Detail distintos sin necesidad. Order paginada también usa Order; acotar size y probar coste antes de duplicar contratos.

## Endpoints únicos

| Método / ruta relativa v1 | Acceso | Entrada | Salida/status |
|---|---|---|---|
| POST /auth/register | público | Register | User201 |
| POST /auth/login | público | Login | TokenResponse200; nunca proxy body directo a navegador |
| POST /auth/logout | autenticado | {} |204 |
| GET /me | autenticado | — | User200 |
| PATCH /me | autenticado | firstName,lastName,mobile | User200 |
| GET /me/addresses | autenticado | — | Address[]200, máximo20 guardadas |
| GET /products | público | query definido abajo | Page<Product>200 |
| GET /products/{id} | público | UUID | Product200; archived404 |
| GET /products/facets | público | — | Facets200 |
| GET /categories | público | — | Category[]200 |
| GET /cart | autenticado | — | Cart200; creado al registrar/seedear usuario, sin escritura en GET |
| POST /cart/items | autenticado | CartWrite.add | Cart200 |
| PATCH /cart/items/{id} | propietario | CartWrite.update | Cart200 |
| DELETE /cart/items/{id} | propietario | — |204; luego invalidar/refetch |
| POST /orders | autenticado | Checkout + Idempotency-Key | Order201+Location; repetición200 mismo Order |
| GET /orders | autenticado | page,size | Page<Order>200 propias, createdAt desc/id |
| GET /orders/{id} | propietario | UUID | Order200; ajena404 |
| GET /admin/summary | ADMIN | — | AdminSummary200 |
| GET /admin/products | ADMIN | mismos filtros + active=all/true/false | Page<Product>200 |
| GET /admin/products/{id} | ADMIN | UUID | Product200 incluye archived |
| POST /admin/products | ADMIN | ProductWrite | Product201+Location |
| PUT /admin/products/{id} | ADMIN | ProductWrite con version | Product200; stale409 |
| PATCH /admin/products/{id}/archive | ADMIN | {active:boolean,version} | Product200 |
| GET /admin/orders | ADMIN | page,size,status opcional | Page<AdminOrder>200 |
| GET /admin/orders/{id} | ADMIN | UUID | AdminOrder200 |
| PATCH /admin/orders/{id}/status | ADMIN | OrderStatusWrite | AdminOrder200 |

Query catálogo: q trim<=100, categoryId (incluye descendientes), color repetible, variantLabel repetible, minPriceMinor/maxPriceMinor independientes e inclusivos, inStock boolean opcional, sort=newest/price_asc/price_desc/discount_desc, page,size. AND entre dimensiones; OR dentro de color/variantLabel; label seleccionado requiere variante activa con stock>0; inStock=false significa stockTotal0; contradicción filtros retorna vacío, no ignora filtros. Búsqueda case-insensitive en título, marca, descripción; escapar %/_ para búsqueda literal. Precio usa salePriceMinor. Cambio de cualquier filtro/búsqueda/sort resetea page0. No minDiscount en alcance UI; discount_desc conserva descubrimiento de ofertas.

BFF: /api/auth/register, /api/auth/login, /api/auth/logout dedicados; /api/session GET devuelve Session o401; /api/store/[...path] mapea sólo endpoints permitidos de tabla (me,products,categories,cart,orders,admin), nunca auth genérico. No doble prefijo v1 en navegador. DTOs públicos idénticos a Spring; validación Zod en entrada/salida. OpenAPI en B/openapi/shopwave-v1.yaml es fuente normativa; tests comparan respuestas reales y schemas TS, no declarar tres fuentes de verdad independientes.

# Frontend Plan

Mantener rutas públicas actuales. Home/catalog/product son Server Components con metadata por ruta, fetch server-only y estado404 real. Params/searchParams/cookies se consumen de forma asíncrona según docs instaladas de Next16; Luna debe leer guías relevantes antes de código. No basar auth únicamente en proxy/middleware.

Páginas privadas server verifican sesión antes de fetch y pasan datos mínimos como initialData a islas Query. Catálogo tiene URL como única verdad: router.push para aplicar filtros/página, replace para debounce de búsqueda300ms; atrás/adelante restaura estado. Sin sessionStorage de filtros. Render servidor acotado y cancelación de búsqueda; no paginar array ni renderizar resultados de request anterior. IDs inválidos llevan notFound, no spinner infinito.

TanStack Query para carrito/perfil/órdenes/admin, claves incluyen usuario y filtros; limpiar cache privada al logout/cambio de usuario. Un único fetch de carrito al activar sesión; no sumar fetch de provider y página. Mutaciones pesimistas para primera entrega, control ocupado por carrito (serializar operaciones) y sustituir con respuesta canónica; no conservar optimismo defectuoso. GET usa AbortSignal, timeout10s, un retry máximo para red/502/503/504, nunca401/403/404/409; mutaciones sin retry automático. Checkout timeout conserva Idempotency-Key y permite reintento explícito con la misma intención.

Caching: no-store en datos privados y catálogo inicialmente para priorizar coherencia de stock; deduplicar sólo dentro de request servidor. Query staleTime30s para lecturas, refetch al focus; no polling periódico. Cart invalidado tras checkout; admin update invalida products/facets y router.refresh. No CDN de sesión ni fetch privado dentro de cache compartida. No ISR/tag invalidation hasta necesitarlo y demostrar que no muestra stock obsoleto como garantía.

Formularios: HTML nativo + Zod, estado local, schema cliente para feedback y backend independiente autoritativo. ProductForm dividido en campos catálogo/variants, sin effects que sobreescriban datos editados. DTO de edición completo y version para conflicto409 visible. Errores junto al campo asociados con aria-describedby, resumen enfocável; preserve inputs no sensibles al fallar. Login/reg separados por estado/ruta con un formulario montado; returnTo relativo mismo origen, rechazar //, backslashes, protocolos, controles y destinos auth cíclicos.

Imágenes next/image con sizes, dimensión/aspect-ratio y fallback local; hosts remotos explícitos, no wildcard ni IP privada. No priority en todas las cards; sólo imagen LCP. Imágenes decorativas alt vacío, producto alt específico. Metadata de producto server, title/description/OG; robots noindex para auth/cart/orders/admin, sitemap sólo páginas públicas/productos activos. SEO no bloquea build si API no está: páginas dinámicas runtime y error honesto, nunca datos falsos en producción.

# Backend Plan

Controllers finos: validación, principal y status. Services transaccionales realizan reglas y devuelven DTO a través de mapper dentro de transacción; repositorios paginados y Specifications para catálogo. No devolver entidades, no depender de Open Session In View. open-in-view=false; resolver N+1 con consultas acotadas (página IDs + fetch variantes/categoría), no fetch join paginado de colección que pagine en memoria.

Auth service transaccional registro+carrito, uniqueness email normalizado en BD y manejo de carrera409. Guards de método @PreAuthorize para admin además de filter chain explícita con anyRequest.denyAll. Exception advice y entrypoint/accessDeniedHandler con mismo Problem. Reemplazar GlobleException, no wrapper que siga devolviendo202.

Product: categoryId existente, variantes identificadas estables. PUT puede crear variante id=null; IDs existentes deben pertenecer al producto; omitir variante existente no la borra implícitamente:400, usar active=false. No cambiar label de variante usada en carrito sin invalidar version de carrito; preferir etiqueta inmutable tras crear y nueva variante para renombrar (409 si intenta). Archivar producto no borra órdenes ni variantes. Totales/porcentaje calculados, no campos redundantes mutables. Stock admin es cantidad absoluta con optimistic version; mismo lock de producto que checkout para evitar lost update.

Order state machine: al crear PLACED; PLACED→CONFIRMED o CANCELLED; CONFIRMED→SHIPPED o CANCELLED; SHIPPED→DELIVERED; DELIVERED/CANCELLED terminales. Ninguna otra transición. Repetir mismo estado devuelve estado actual sin reposición extra; version antigua de transición diferente409. Sólo admin cancela en alcance. deliveredAt se asigna al entregar. No DELETE de órdenes.

## Algoritmo checkout y concurrencia obligatorio

1. Validar body estricto y clave UUID; identificar usuario desde principal. Abrir transacción.
2. Bloquear carrito del usuario (lock pesimista); mismo lock para TODAS mutaciones de carrito. Consultar orden por unique(userId,idempotencyKey) antes de validar carrito vacío/version: mismo hash de request retorna orden previa; hash distinto409 IDEMPOTENCY_CONFLICT. Persistir hash/clave en Order, sin tabla adicional.
3. Verificar cartVersion y líneas no vacías; bloquear productos en orden ascendente UUID y cargar variantes dentro del lock. Todos los escritores de inventario usan ese orden/lock. Revalidar active, cantidad1..10, stock variante y precios actuales.
4. Si cambió precio/producto desde cotización de carrito:409 CART_CHANGED, no crear orden. GET carrito devuelve nueva cotización; el usuario revisa y confirma de nuevo. Para mantener GET sin escritura, cartVersion es versión de composición y Checkout incluye quoteFingerprint retornado en Cart: SHA256 hexadecimal de JSON canónico con líneas ordenadas por variantId, cantidades, versiones producto y precios enteros. No cambia cartVersion sólo por GET; cambia el fingerprint cuando cambia el catálogo. No aceptar total enviado por cliente como validación. Comparar fingerprint bajo locks. No reservar la idempotency key para un intento rechazado antes de crear orden; una confirmación revisada inicia nueva intención/key.
5. Calcular importes server, descontar variantes, escribir Order e items como snapshots (incluida dirección), MOCK SIMULATED, número único; guardar dirección si saveAddress y límite20 (si lleno400 antes de debitar stock).
6. Vaciar líneas y aumentar versión carrito dentro de la misma transacción; commit. Cualquier error revierte stock/orden/dirección/carrito. Constraint unique refuerza idempotencia; resolver carrera devolviendo orden original en nueva lectura, no continuar transacción marcada rollback.
7. Cancelación: lock orden y después productos en el mismo orden, validar transición/version y reponer cantidades snapshot sólo en la primera transición a CANCELLED, pago VOIDED. Checkout no bloquea órdenes previas salvo idempotencia leída, evitar orden de locks inverso.

Producto actualizado no cambia historial. Carrito no reserva stock; advertir en UI. Cantidad0 elimina sólo por DELETE, nunca PATCH. No clamp silencioso. Pruebas con dos transacciones/usuarios contra la última unidad obligatorias.

# UI/UX Direction

Dirección: tienda editorial contemporánea sobria, conservar identidad violeta sin neones/carrusel continuo. Light principal y dark completo, no dos diseños distintos. Geist, texto base16px, jerarquía título32/24/20 según viewport; escala de espacio4/8/12/16/24/32/48/64; ancho contenido máximo1280px, lectura/formulario máximo640px. Tokens semánticos foreground/background/surface/border/accent/success/warning/danger; medir contraste4.5:1 texto normal y3:1 UI, no asumir que violeta cumple.

Header público compacto con marca/catálogo/búsqueda/cuenta/carrito; footer global sólo enlaces reales y aviso demo. Sidebar sólo admin en desktop; drawer modal móvil accesible. Breadcrumb de producto y admin. Grid catálogo1 columna320–479,2 desde480,3 desde768,4 desde1200; filtros laterales desde1024, drawer debajo. Imágenes consistentes aspect4/5 para cards, contain para electrónica; precio/variante siempre visibles.

Checkout dos bloques: dirección y revisión/pago MOCK, resumen sticky sólo desktop; móvil resumen antes de confirmar. Éxito muestra número y enlace a orden creada. Sin tarjeta guardada ni simulación visual de tarjeta. Producto deja añadir cantidades adicionales hasta límite en vez de transformar 'añadir' en 'eliminar'.

Admin tablas semánticas con caption/scope; scroll horizontal sólo dentro de contenedor a tablet; cards equivalentes en móvil con campos críticos y acciones nombradas. Filtros, orden y paginación visibles; no columnas esenciales ocultas sin alternativa. Dashboard distingue carga/error por métrica, no ceros como fallback.

Reemplazar completamente: hero/footer ficticios, marquee, auth paneles absolutos, checkout de tarjetas, sidebar global, drawer de filtros y confirmaciones inaccesibles. Refactorizar cards/formularios con mismas primitivas. Radix Dialog controla trap/restore/Escape/inert y scroll; una sola primitive para drawer/modal, altura max calc(100dvh - margen) con contenido scrollable. Un solo h1 por vista, skip link, navs nombradas, icon buttons con aria-label, target44px, focus visible, estado anunciado con role=status/alert moderado. Reduced motion global; sistema de tema sin flash y CSP compatible. No color como única señal de stock/error.

Pruebas visuales/manuales obligatorias320,375,768,1024,1440px, zoom200%, texto largo, teclado móvil, error largo, ambos temas. No overflow horizontal de página. Skeletons de estructura estable en catálogo/detalle/listas; spinner sólo acciones breves; empty con causa y CTA real ('limpiar filtros', 'explorar catálogo'). Errores preservan contexto y tienen retry efectivo.

# Testing Strategy

Pruebas se agregan cuando nace implementación definitiva, no al final ni para código destinado a borrar. No objetivo100% coverage. Meta: cubrir invariantes y fallos graves; un porcentaje no sustituye escenarios.

- Frontend Vitest/Testing Library: parseo query, dinero, redirects, validación DTO, formularios/errores, ProductForm version, modal/drawer teclado, cart mutación fallida, sesión401/403/cache purge.
- MSW para client API: timeout, abort, respuestas fuera de orden, JSON inválido502, Problem400/409, no retry de POST, query key por usuario. No sólo mockear hook y declarar integración probada.
- Playwright contra Next+Spring+MySQL de test: register/login, catálogo filtros/back, añadir dos variantes, cambiar/eliminar, checkout MOCK repetido, orden propia, logout, admin CRUD/archive/status y acceso USER denegado. Dos usuarios reales para IDOR, no sólo botones ocultos. Pruebas contract y concurrencia principales en backend.
- Backend JUnit5/Mockito para cálculo/estado; MockMvc para DTO/errores/roles; SpringBootTest + Testcontainers MySQL8 para persistencia, Flyway, ownership, lock/concurrencia, idempotencia, rollback y reinicio persistente. H2 no prueba equivalencia MySQL.
- Security: JWT falsificado/expirado/audience erróneo/rol cambiado/tokenVersion revocado; public JSON sin User/PAN; signin genérico; CORS cerrado; CSRF BFF; rate429; role input rechazado; request tarjeta400.
- Contrato: fixture por endpoint desde API real y comprobación OpenAPI + schemas TS; CI falla si cambian forma, enum, nullable/status. Snapshot sólo suplemento, no oráculo único.
- Accesibilidad: axe cero serious/critical + recorrido teclado y revisión manual, no afirmar WCAG completo sólo por axe.
- CI aislada sin secretos de producción; pruebas no dependen de API alojada ni BD del dueño. Tests no deben resetear volumen mysql_data existente.

# Data & Persistence

MySQL persistente en local/demo; perfil prod jamás H2 in-memory. Perfil test usa contenedor descartable con nombre único. H2 puede retirarse del POM para no dar falsa paridad. Flyway V1 crea esquema demo NUEVO; ddl-auto=validate, no update. No convertir automáticamente datos legacy: hay PAN y unidad monetaria ambigua. Cualquier exportación/migración/purga de BD vieja requiere autorización aparte y no forma parte de esta ejecución.

Entidades finales: User(UUID,emailNormalized único,passwordHash,role,tokenVersion,active,timestamps); Category(UUID,parentId,name,slug único estable); Product(UUID,campos comerciales,categoryId,active,version,timestamps); ProductVariant(UUID,productId,labelNormalized único por producto,stock,active); Cart(UUID,userId único,version); CartItem(UUID,cartId,variantId,quantity,unique(cartId,variantId)); Order(UUID,userId,idempotencyKey/requestHash,number único,status/version,payment MOCK,shipping snapshot,totales,timestamps); OrderItem(UUID,orderId,snapshot producto/variante/precios/cantidad); Address(UUID,userId,campos dirección).

Enums persistidos STRING. FK restrict para referencias históricas; cascade sólo composición orden-items/cart-items, nunca Cart→User. CHECK de stock>=0/cantidad1..10/precios válidos más validación servicio. Índices user+createdAt en órdenes, category/active/salePrice en productos, FKs y unicidades. equals/hashCode por identidad estable sin colecciones mutables. Mapper dentro de transaction evita LazyInitialization y fuga de relaciones.

Seeder sólo perfil demo + shopwave.seed.enabled=true, transacción completa, claves slug/SKU estables, idempotente por fila y sin sobrescribir stock editado al reiniciar. Dataset30 productos curado a Bolivia: definir explícitamente precios centavos (14900=Bs149.00) para DEMO NUEVA, no reinterpretación de registros históricos. Revisar correspondencia fotografía/título/color; variantes 'Unica' normalizadas como 'Única'; añadir caso sin stock y stock1 para tests. AdminInitializer sin hardcoded password, falla si se pide crear admin sin credenciales externas. No log de claves/PII.

# Cleanup

Eliminar sólo tras corte y pruebas: servicios/entidades reviews-rating, pagos con tarjeta, aliases REST, controllers legacy, generador filtro Basic, constantes con secreto, heurísticas JSON y JWT navegador, tipos huérfanos, Stylelint sin dependencia y cinco SVG scaffold. Mantener icon.svg propio. Retirar Hibernate5 Jackson si no tiene uso, H2/runtime prod, devtools de artefacto release. No eliminar wrapper Maven ni Lombok sólo por estética si sigue usado.

Documentación final con una fuente de contrato, README por repo y guía entorno, Postman generado/alineado. Archivos históricos de correcciones se conservan etiquetados como históricos en E; no ejecutar scripts/ZIP ni borrar archivos locales del usuario. Documentos ya eliminados en F no se recrean. docs/EXPOSICION_5_PARTES.md contiene ejemplo de credencial según auditoría: mantener fuera de publicación y solicitar al dueño tratamiento; no incorporarlo automáticamente. Nunca agregar .env real, .next, target ni reportes de tokens.

# Portfolio Readiness

Luna redactará README al final, no antes de tener evidencia: problema/alcance, stack exacto fijado, diagrama navegador→Next→Spring→MySQL, decisiones auth/stock/idempotencia, instalación reproducible, variables con placeholders, scripts reales, API OpenAPI, matriz de tests con resultados y limitaciones. Diferenciar proyecto académico original de contribución del rework y respetar atribuciones; el home backend enlaza un repo ajeno, no copiarlo como autoría propia.

Evidencia exigida: capturas375/768/1440 de catálogo/detalle/checkout MOCK/admin y ambos temas; vídeo breve de compra/admin; reporte tests real; ejemplo409 stock/conflicto y403; documentación de API; demo con aviso de datos ficticios y pago sin cobro. No publicar direcciones reales ni acceso admin universal. Performance Lighthouse en entorno descrito, mediana3 corridas; objetivo mobile>=90 performance y accessibility>=95, con excepción justificada si infraestructura domina, nunca inventar puntuación. Sin errores console/hydration, sin tokens/PAN en HTML/red pública/storage.

# Implementation Phases

Las fases y el mapa de archivos forman una sola especificación. Cada fase hereda contratos y políticas anteriores, no tiene libertad de elegir otra arquitectura. M/R/D/N en mapa significan modificar/refactorizar, reescribir, eliminar, crear. Pn indicado en mapa es fase principal; tests se amplían donde se implementa funcionalidad.

## P0 — Baseline seguro y herramientas

### Objetivo

Obtener una base reproducible sin tocar datos existentes. Registrar git status y versiones, y separar resultados actuales de resultados del rework.

### Problemas que resuelve

Tests de contexto inseguros, ausencia de scripts frontend/CI y configuración de entorno no reproducible.

### Backend changes

B/pom.xml: configuración test unit/integration, Testcontainers MySQL, JaCoCo, Checkstyle; E/Dockerfile y docker-compose.yml: servicios para entorno NUEVO, usuario no root, variables externas y healthcheck sin password expuesto. Nunca reutilizar volumen mysql_data ni ejecutar down -v. B/src/test/.../ShopwavefusionbackendApplicationTests.java: perfil test explícito y sin seeders. B/.gitignore: outputs de tests/IDE, no ignorar migraciones.

### Frontend changes

F/package.json y lock: añadir herramientas aprobadas y scripts definidos abajo; tsconfig separa typecheck sin emisión/incremental; eslint valida código/test. next.config y vercel: configuración reproducible, env server-only y headers se completan en P5/P8. No activar BFF ni cambiar endpoints todavía.

### Archivos nuevos

Los N/P0 del mapa: configuraciones Vitest/Playwright, setup de tests, workflows CI separados y application-test.properties. No construir tests del checkout legacy que se borrará.

### Archivos que deben eliminarse

Ninguno. Preservar archivos no trackeados del usuario.

### Contratos/DTOs involucrados

Inventario legacy de este plan como baseline; sin cambiar shape HTTP.

### Dependencias entre tareas

Primero aislar BD y desactivar seeders por propiedad en test; después ejecutar contexto. Instalar dependencias sólo cuando se autorice implementación. CI no usa credenciales existentes.

### Tests requeridos

Smoke de infraestructura y test puro de formatter; contexto backend sólo después de P2 si aún no arranca con modelo nuevo. No ocultar fallo legacy de bootstrap como PASS.

### Acceptance criteria

Scripts existentes npm run lint/build registrados con warnings. Luna CREARÁ npm run typecheck (next typegen y tsc --noEmit --incremental false), test (vitest run), test:watch, test:coverage, test:e2e (playwright test). Next typegen puede generar .next, no archivos de negocio. Backend comandos futuros .\mvnw.cmd test para tests *Test unitarios excluyendo *IntegrationTest y ShopwavefusionbackendApplicationTests; .\mvnw.cmd verify -P integration para Failsafe *IntegrationTest y ShopwavefusionbackendApplicationTests. Perfil/plugin se crea ahora, NO existe en baseline. No renombrar el test antiguo: configurarlo como integración aislada explícitamente. CI usa wrapper; no descarga dependencias durante esta planificación.

### Riesgos

Docker ausente, dependencias no disponibles o bootstrap legacy incompatible. Registrar bloqueo exacto; nunca usar BD real como atajo.

### Qué NO debe cambiarse

Contrato legacy, UI, datos, secretos reales, archivos de usuario, deploy.

## P1 — Congelar contrato y reglas

### Objetivo

Convertir API Contract de este documento en especificación ejecutable antes de implementar pantallas.

### Problemas que resuelve

M01–M15, ambigüedad moneda/nulls, versiones y exposición accidental de entidades.

### Backend changes

B/openapi/shopwave-v1.yaml: todas las operaciones, seguridad Bearer, schemas strict, Problem, ejemplos ficticios y códigos. J/ShopwavefusionbackendApplication.java se ajusta en P8 para no anunciar Basic; todavía no alterar controllers legacy.

### Frontend changes

src/contracts/shopwave.schema.ts: schemas Zod de cada DTO y request, inferir tipos. Modelos existentes sólo reexportan nuevos tipos al corte P5, no romper consumidores en P1. Definir versiones y quoteFingerprint de Cart/Checkout en OpenAPI y Zod desde el inicio (no omitir el suplemento normativo del algoritmo).

### Archivos nuevos

N/P1: OpenAPI, schemas y sus tests. No generador de SDK ni copia divergente del contrato.

### Archivos que deben eliminarse

Ninguno todavía.

### Contratos/DTOs involucrados

Todos los DTOs de API Contract; freezes enums/status, IDs UUID, centavos, query y BFF paths.

### Dependencias entre tareas

P0 antes. P2–P7 no agregan campos por su cuenta: cambio de contrato implica actualizar OpenAPI/schema/test en la misma tarea.

### Tests requeridos

Fixtures válidas/inválidas, null vs missing, payload PAN rechazado, unknown fields, dinero límite, páginas vacías, enum desconocido y quoteFingerprint. Paridad de fixtures con OpenAPI.

### Acceptance criteria

Schema tests pasan, ninguna request recibe role/precios de carrito/estado de pago. Las33 llamadas legacy tienen destino o retirada explícita. npm run typecheck/lint/test; build legacy sigue registrable sin cambios de servicio activos.

### Riesgos

Diseñar DTO demasiado parecido a entidad. Revisar recursión y campos privados antes de congelar.

### Qué NO debe cambiarse

Producto, BD legacy, rutas frontend, backend desplegado.

## P2 — Persistencia y catálogo v1

### Objetivo

Levantar API v1 de catálogo sobre esquema nuevo MySQL, con datos coherentes y DTOs seguros.

### Problemas que resuelve

M02/M03/M09/M11/M15, filtrado memoria, serialización, H2 prod y seed parcial.

### Backend changes

J/modal Product/Category/User/Address/Cart/CartItem/Order/OrderItem/PaymentDetails: modelo final y relaciones del apartado Data; ProductVariant reemplaza Size. J/repository Product/Category/ProductVariant: paginación SQL, Specifications, fetch acotado; CategoryService implementa lectura. J/service ProductService/Implementation: validación precios/categoría/variantes; quitar overload Product sólo al corte. DataSeeder/AdminInitializer: propiedades y perfiles explícitos. Recursos local/demo/prod/test: Flyway validate, MySQL, sin H2 ni secretos. Aislar implementación nueva como establece transición, no ejecutar entidades cambiadas contra DB vieja.

### Frontend changes

Sólo schema tests/fixtures; ProductService legado aún no cambia.

### Archivos nuevos

N/P2 del mapa: migración V1, ProductVariant/repository, ProductSpecifications, CommonDtos/ProductDtos/ProductMapper, ProductController v1 (incluye categories/facets), ProblemAdvice y tests catálogo/contexto. Records anidados permitidos; no record que exponga entidad.

### Archivos que deben eliminarse

Ninguno del legacy hasta P8; Size y configs inseguras quedan excluidos del proceso v1, no activos en paralelo contra tablas nuevas.

### Contratos/DTOs involucrados

Product/ProductWrite/Variant/Category/Facets/Page/Problem; User y entidades commerce sólo estructura de persistencia final, no exponer rutas antes de P3/P4.

### Dependencias entre tareas

P1. Esquema→constraints→repos→servicios→mappers→controllers→seed. El seed sólo tras migraciones del esquema nuevo.

### Tests requeridos

Flyway desde cero, contexto sin red externa, filtros combinados/un límite de precio/nulls/page fuera rango, máximo48, consultas no in-memory pagination, categoryId ancestros, variantes agotadas, JSON sin asociaciones sensibles, siembra idempotente y reinicio persistente. Stock y descuentos cero según reglas (salePrice debe seguir >0).

### Acceptance criteria

Wrapper compile/test y verify -P integration verdes contra MySQL de test; GET no escribe; listado/detalle reales validan OpenAPI. El baseline frontend no se cambia para maquillar errores de B.

### Riesgos

Mapeos embebidos, constraints históricas y cambio UUID. Son datos demo nuevos; no intentar upgrade automático de esquema viejo.

### Qué NO debe cambiarse

Datos legacy, frontend operativo legacy, alcance de categorías (sin CRUD nuevo), unidades monetarias de registros existentes.

## P3 — Seguridad y perfil backend

### Objetivo

Autenticación v1 verificable, sin Basic y sin secretos embebidos.

### Problemas que resuelve

JWT sin revocación, permisos stale, CORS abierto, entidad User expuesta, alta admin en HTTP.

### Backend changes

ProjectSecurityConfig: chain v1 explícita, denyAll por defecto, method security y handlers JSON. JwtTokenProvider/JWTTokenValidatorFilter: Bearer, claims obligatorios y tokenVersion consultado; UserService usa principal id, no parsea JWT repetidamente. AuthService registro transaccional/login/logout; ProfileController GET/PATCH me y direcciones propias. AdminInitializer sólo demo habilitado expresamente.

### Frontend changes

Schemas Auth/Profile y fixtures; preparar tests401/403, aún sin guardar token en navegador nuevo.

### Archivos nuevos

N/P3: AuthDtos/AuthController/ProfileController/AuthService, AuthRateLimiter, ApiSecurityHandlers, SecurityIntegrationTest.

### Archivos que deben eliminarse

Ninguno hasta corte; generador Basic y constantes legacy NO se cargan en perfil v1. No copiar secreto antiguo a env de demo.

### Contratos/DTOs involucrados

Register/Login/TokenResponse/User/Address/Problem; logout204 revoca todas las sesiones.

### Dependencias entre tareas

P2; roles y tokenVersion en schema antes de emitir tokens.

### Tests requeridos

Todos los casos de seguridad descritos; registro duplicado concurrente409 y sin usuario sin carrito; USER no admin; password WRITE_ONLY no basta: comprobar ausencia completa en DTO. Logout invalida token anteriormente válido.

### Acceptance criteria

MockMvc + integración autenticada real verde; HTTP401/403 nunca302/HTML/202. No clave hardcodeada en v1; contexto test usa secreto ficticio exclusivo test. compile/test/verify.

### Riesgos

Romper sesiones legacy es esperado sólo en corte; no prometer conservarlas. Rate limiter de una instancia no es protección distribuida.

### Qué NO debe cambiarse

No refresh token, OAuth, proveedor auth ni gestión de roles desde perfil.

## P4 — Commerce backend e invariantes

### Objetivo

Carrito y órdenes correctos antes de conectarlos a una nueva UI.

### Problemas que resuelve

M03–M07/M10/M11, IDOR, compra vacía, doble orden, precios stale y carreras de inventario.

### Backend changes

CartService/CartItemService e implementaciones: propiedad, locks y cantidades; OrderService/Implementation: algoritmo checkout/estado, snapshots y cancelación; repositories Cart/CartItem/Order/Product: queries con locks y unicidad; PaymentDetails/PaymentMethod/PaymentStatus/OrderStatus: sólo contrato nuevo. AddressRepository consulta por propietario; no OneToOne reutilizable con Order. No save de totales desde GET.

### Frontend changes

Schemas/fixtures de Cart/Order y Problem409; ninguna nueva pantalla de tarjetas.

### Archivos nuevos

N/P4: CartDtos/OrderDtos/CartController/OrderController/CommerceMapper, CommerceIntegrationTest y OrderRulesTest.

### Archivos que deben eliminarse

No borrar legacy todavía; v1 no tiene PaymentInformation, order delete ni CVV. OrderItemService trivial no se reutiliza.

### Contratos/DTOs involucrados

Cart/Checkout (incluye quoteFingerprint), Order, idempotency header y estado versionado.

### Dependencias entre tareas

P2/P3. Checkout usa reglas de catálogo y seguridad probadas. API de transición admin puede implementarse internamente ahora; controller final en P7.

### Tests requeridos

Carrito vacío409, cantidad inválida400, stock409, ajeno404, carrito GET no escribe, precio cambiado409; misma clave mismo request misma orden, distinta intención409; rollback si cualquier línea falla; stock por talla; cancelación una reposición; snapshots sobreviven edición/archivo. Inicio de pruebas concurrentes con dos usuarios.

### Acceptance criteria

Compra vía API real completa en MySQL test sin campos de tarjeta; orden y stock/carrito atómicos; compile/test/verify. BFF aún no requerido para demostrar backend.

### Riesgos

Deadlocks y carrera de constraint; no resolver con reintento ciego de pagos. Bloquear productos en orden estable.

### Qué NO debe cambiarse

No reservas, pagos reales, impuestos, envío tarifado ni descuentos promocionales.

## P5 — Corte coordinado, BFF y frontend público/auth

### Objetivo

Conectar frontend a v1 con una arquitectura segura y superficies públicas profesionales.

### Problemas que resuelve

LocalStorage JWT, guards visuales, API heurística, SSR limitado, carreras filtros y UI académica.

### Backend changes

Consolidar destinos definitivos de modelo/servicios v1 del mapa, desactivar legacy completamente en proceso rework; no exponer ambos modelos. Config APP_ORIGIN/BACKEND_URL de frontend y JWT_SECRET de B mediante entorno de ejecución autorizado, nunca editar secretos del dueño. No nuevo cambio contractual.

### Frontend changes

api.service.ts transporte same-origin validado; services por dominio apuntan v1 vía BFF. Modelos reexportan schemas. Root layout/providers, StoreShell/Header/Footer, home/products/detail/login/register/profile, AuthScreen y ThemeContext. AuthContext sólo User/expiry, hooks consumen Query; ProductFilter usa URL; ProductDetail maneja talla y feedback. Modal/UI a11y/tokens e imágenes. Perfil PATCH y direcciones readonly seguras. useProducts se reescribe, no portar filtros locales.

### Archivos nuevos

N/P5: server backend/session/bff, cinco route handlers, boundaries, shells y primitivas, tests, query parser/fallback. Los handlers auth especializados NO admiten pasar token al navegador.

### Archivos que deben eliminarse

Dejar de importar guards/token/PaymentBook/Reviews antes de borrar P8. En esta fase rutas de carrito/checkout/órdenes/admin muestran estado temporal de mantenimiento del entorno rework, nunca ejecutan legacy con cookie nueva; no publicar este checkpoint como producto final.

### Contratos/DTOs involucrados

Session, catálogo, perfil y Problem; BFF allowlist de endpoints completa pero denegar operaciones aún no entregadas visualmente no cambia autoridad backend.

### Dependencias entre tareas

P0–P4 verdes; corte de los dos repositorios junto en entorno aislado. No desplegar F nuevo con B legacy ni cambiar el contrato para hacer funcionar la UI.

### Tests requeridos

Auth CSRF/returnTo/no token leakage; contratos API, búsqueda rápida y back/forward, filtrado/reset page, DTO inválido,404, SSR sin hydration warnings, modal foco/teclado, perfil401/403. ProductDetail sin sesión redirige conservando returnTo seguro.

### Acceptance criteria

lint/typecheck/test/build frontend y compile/test/verify backend; login→perfil→logout real; catálogo servidor y API error honesto. DOM/red/storage no contienen JWT/PAN. UI responsive pública y auth verificadas antes de replicar patrones privados.

### Riesgos

Cookies async Next16, cache compartida, middleware mal usado como auth y recursos de imágenes no permitidos. Consultar docs instaladas, no APIs recordadas.

### Qué NO debe cambiarse

No wrappers alternativos ni fallback silencioso al API legacy, no rediseñar contrato ni introducir autenticación paralela.

## P6 — Carrito, checkout MOCK y órdenes frontend

### Objetivo

Completar el flujo de compra profesional sobre reglas ya probadas.

### Problemas que resuelve

PAN, errores silenciosos, retry falso, selección de tarjetas, doble submit y estado remoto duplicado.

### Backend changes

Sólo correcciones que respeten OpenAPI y tests de P4; ningún endpoint ad hoc para una pantalla.

### Frontend changes

CartContext es fachada Query, useCart no guarda copia; CartService/CartItemService devuelven DTO canónico. cart/page y rows muestran precio móvil, loading por acción y errores. CheckoutFlow separa AddressForm/AddressBook/review/confirm, header Idempotency-Key estable por intento y quoteFingerprint; éxito enlaza a Order.id. orders pages con refresh real, sin polling3s y sin spinners eternos para id inválido; OrderDetailView reutilizado por admin después.

### Archivos nuevos

N/P6: CheckoutFlow y tests, CartContext tests, loading de órdenes, MSW handlers compartidos.

### Archivos que deben eliminarse

PaymentBook ya sin consumidor; borrar en P8 junto a campos de modelos obsoletos. No eliminar órdenes en UI.

### Contratos/DTOs involucrados

Cart, Address, Checkout, Order y409 de stock/precio/idempotencia. Validar respuesta entera antes de mostrar éxito.

### Dependencias entre tareas

P5 y P4. No iniciar checkout si sesión/carrito pendientes; no tomar loading como empty.

### Tests requeridos

Añadir variante repetida, dos variantes distintas, update/delete/error, logout limpia carrito visible; checkout timeout mismo idempotency key, revisión obligatoria tras409 CART_CHANGED, errores dirección conservan inputs, éxito orden correcta, ajeno404. Recargar página tras éxito no duplica orden.

### Acceptance criteria

Flujo full stack completo usuario normal; lint/typecheck/test/build y backend verify verdes; sin PAN en ningún payload. A320px precio/resumen/confirmación siguen legibles y accesibles.

### Riesgos

Nuevo idempotency key después de timeout genera orden duplicada. Mantener key y payload en memoria del flujo; navegación que los pierde debe llevar a consultar órdenes antes de ofrecer confirmar de nuevo tras resultado incierto. No persistir dirección en localStorage.

### Qué NO debe cambiarse

No guest cart, payment SDK, guardado de tarjeta ni optimismo no probado.

## P7 — Admin profesional

### Objetivo

Entregar gestión segura de catálogo/inventario/órdenes y evidencia Full Stack.

### Problemas que resuelve

Update parcial ambiguo, borrado destructivo de historial, estados libres, dashboard engañoso y tablas móviles frágiles.

### Backend changes

api/v1/AdminController: summary, productos admin y estados de órdenes; reutilizar servicios con @PreAuthorize y locks/version. Product update puede stock0; archive no elimina. AdminSummary sólo operaciones simuladas según período; errores500 no ceros.

### Frontend changes

admin/layout, todas las páginas admin, ProductForm compartido create/edit con variantes estables y version; services admin usan endpoints admin. Sidebar pasa a navegación admin; AdminWorkspace contiene coordinación, extraer pequeños componentes locales sin reunir toda lógica en un monolito. Detalle órdenes reutiliza presentación no fetching de usuario.

### Archivos nuevos

N/P7: AdminController/AdminDtos/AdminIntegrationTest, admin layout/boundaries/AdminWorkspace y ProductForm tests.

### Archivos que deben eliminarse

Acciones DELETE order y hard delete product; suprimir métodos, no mantener botones ocultos. Archivos controllers legacy se retiran P8.

### Contratos/DTOs involucrados

ProductWrite, Product.version, AdminOrder, OrderStatusWrite, AdminSummary,409 stale version.

### Dependencias entre tareas

P2/P3/P4 y sistema visual P5; OrderDetailView P6 disponible.

### Tests requeridos

CRUD+archive, stock0, descuento recalculado, categoría id correcta con nombres repetidos, variante ajena400, USER403, orden de otro usuario sólo admin, transición inválida409, cancelación repetida no repone dos veces; dashboard error visible.

### Acceptance criteria

Admin flujo real end-to-end, tablas/cards a375/768/1440, formularios teclado, compile/verify y lint/typecheck/test/build. Modificar producto no altera snapshots de orden previa.

### Riesgos

Pérdida de cambios por conflicto. Mostrar409 con opción recargar tras advertir; nunca overwrite automático.

### Qué NO debe cambiarse

No alta/edición de roles, CMS, dashboard analítico avanzado ni productos eliminados físicamente.

## P8 — Retirada legacy, seguridad y verificación integral

### Objetivo

Eliminar superficies inseguras y demostrar que el conjunto cumple contrato, seguridad, accesibilidad y rendimiento.

### Problemas que resuelve

Código muerto, auth doble, secretos heredados, drift, pruebas aisladas sin evidencia conjunta.

### Backend changes

Todos D/E del mapa salen tras confirmar ningún consumidor. POM elimina Hibernate5/H2 no usados; aplicación anuncia sólo v1 Bearer y configura Swagger sin recursos deshabilitados accidentalmente. Exception advice v1 único. Revisar logs, headers, perfiles y documentación histórica sin aplicar ZIP/script. Smoke de todas las rutas v1; legacy devuelve404/410, nunca entidad insegura.

### Frontend changes

Todos D/F del mapa, imports y jwt-decode retirados; metadata/robots/sitemap/headers CSP ajustados a imágenes/fuentes/tema. No unsafe-eval en producción ni ampliar connect-src indiscriminadamente. Revisar redirects, parser normal JSON, no restos localStorage token. Tests e2e contra BD aislada.

### Archivos nuevos

N/P8: ContractIntegrationTest/ConcurrencyIntegrationTest; tres suites Playwright, robots/sitemap. No archivos temporales de transición sobreviven.

### Archivos que deben eliminarse

Lista D del mapa es exhaustiva para destinos actuales. Auditar imports antes de eliminar y no borrar documentos no trackeados del usuario. Remover código con credencial no rota credencial: avisar que rotación externa sigue siendo responsabilidad y gate de publicación.

### Contratos/DTOs involucrados

Todos, congelados; ningún PAN ni entidad expuesta. OpenAPI/TS/HTTP comparados automáticamente.

### Dependencias entre tareas

P0–P7; no retirar legacy durante un checkpoint con frontend aún consumidor. No deploy de estados parciales.

### Tests requeridos

Todas las suites y escenario concurrente último stock con barrera real, no llamadas secuenciales. MySQL lock/rollback/idempotencia/reinicio; perfiles sin seed accidental; axe/keyboard/responsive; JSON malformed/502/timeout504; nuevos contratos y ausencia endpoints viejos.

### Acceptance criteria

Frontend lint/typecheck/test:coverage/build/test:e2e; backend test/verify -P integration; cero errores/warnings propios nuevos y seis img warnings resueltos. Network/log/HTML/storage sin secretos. Sin cambios a DB legacy. Escaneo de dependencias con versiones reales y reporte, no afirmar 'seguro' si hay advisory crítico sin resolver.

### Riesgos

Deprecaciones, CVEs, CSP rompiendo tema/font, CI sin Docker. Un gate fallido no se convierte en excepción silenciosa ni en mock de éxito.

### Qué NO debe cambiarse

No añadir features para mejorar métricas, no deshabilitar tests/reglas para pasar CI, no publicar todavía.

## P9 — Evidencia y entrega portfolio

### Objetivo

Entregar repositorios comprensibles, reproducibles y honestamente presentables.

### Problemas que resuelve

README desalineado, ausencia evidencia Full Stack y límites de demo ocultos.

### Backend changes

B/README.md, E/README.md y EXPLICACION_ENTORNO.md documentan rutas correctas, perfiles/variables, MySQL y pruebas; no credenciales universales. B/docs/REWORK_EVIDENCE.md enlaza resultados reales y limitaciones.

### Frontend changes

README.md con evidencia de React/Next, decisiones y capturas; .env.example con placeholders no valores actuales; docs/REWORK_EVIDENCE.md documenta flujos, resultados y deuda residual. Postman ya alineado en P8, no otra especificación manual independiente.

### Archivos nuevos

N/P9 del mapa; las capturas/reportes binarios generados son evidencia adicional cuyo número depende de resultados y no se cuenta como archivos fuente esperados.

### Archivos que deben eliminarse

Ninguno. No restaurar documentos eliminados por el usuario ni publicar docs locales con ejemplos de credenciales.

### Contratos/DTOs involucrados

OpenAPI v1 final y ejemplos públicos ficticios, no cambios.

### Dependencias entre tareas

P8 verde y evidencia observable. Demo/deploy sólo con autorización separada; su ausencia se declara, no bloquea entrega de código pero sí la afirmación de 'demo publicada'.

### Tests requeridos

Reproducir comandos documentados desde entorno nuevo autorizado, smoke de artefacto de producción y verificación de enlaces/screenshots. No anunciar tests que no existen.

### Acceptance criteria

README permite ejecutar frontend/backend con roles y datos ficticios; todos los criterios de Definition of Done comprobados o bloqueos explícitos. Resultado distingue implementación, verificación local y publicación. Git diff revisado sin datos/archivos ajenos.

### Riesgos

Exagerar autoría, cobertura o seguridad; imágenes sin derechos comprobados; costes/limitaciones de alojamiento.

### Qué NO debe cambiarse

No commits/push/PR/deploy automáticos ni nuevas funcionalidades tardías.

# File-by-File Change Map

Inventario de destinos finales previsto, no permiso para modificar ahora. Cada ruta se cuenta una vez; M incluye reescritura completa cuando lo exige el capítulo correspondiente, D cuenta como archivo afectado y N como nuevo. Archivos temporales de build, migración de código durante transición y evidencias binarias no se cuentan. Los prefijos F/E se resuelven sólo dentro de las dos raíces autorizadas. No mover paquetes enteros por estética. El plan y la auditoría no se cuentan como código a cambiar. Cualquier archivo adicional imprescindible debe registrarse y justificarse durante ejecución, sin ampliar producto.

Conteo previsto: **144 archivos F + 133 archivos E (incluye backend y entorno)**. Es estimación de archivos fuente/config/documentación afectados, no número de líneas ni promesa de cambios ya hechos. Desglose: F: M=75, N=51, D=18; E: M=47, N=37, D=49; 

| ID | Raíz / archivo | Acción | Fase principal | Modificación / razón |
|---|---|---|---|---|
| F001 | F/public/window.svg | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F002 | F/public/vercel.svg | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F003 | F/public/next.svg | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F004 | F/public/globe.svg | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F005 | F/public/file.svg | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F006 | F/src/utils/validation.util.ts | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F007 | F/src/utils/token.util.ts | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F008 | F/src/utils/datetime.util.ts | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F009 | F/src/utils/currency.util.ts | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F010 | F/src/types/role.type.ts | M | P1 | Reexportar tipos inferidos de schemas v1; sin PAN, typos ni entidades |
| F011 | F/src/types/form-state.type.ts | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F012 | F/src/types/api-response.type.ts | M | P1 | Reexportar tipos inferidos de schemas v1; sin PAN, typos ni entidades |
| F013 | F/src/services/user.service.ts | M | P5 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F014 | F/src/services/review.service.ts | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F015 | F/src/services/rating.service.ts | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F016 | F/src/services/product.service.ts | M | P5 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F017 | F/src/services/order.service.ts | M | P6 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F018 | F/src/services/cartItem.service.ts | M | P6 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F019 | F/src/services/cart.service.ts | M | P6 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F020 | F/src/services/auth.service.ts | M | P5 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F021 | F/src/services/api.service.ts | M | P5 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F022 | F/src/services/admin-product.service.ts | M | P5 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F023 | F/src/services/admin-order.service.ts | M | P6 | Contrato v1 mediante transporte seguro; conservar separación de dominio |
| F024 | F/src/models/user.model.ts | M | P5 | Reexportar tipos inferidos de schemas v1; sin PAN, typos ni entidades |
| F025 | F/src/models/review.model.ts | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F026 | F/src/models/rating.model.ts | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F027 | F/src/models/product.model.ts | M | P1 | Reexportar tipos inferidos de schemas v1; sin PAN, typos ni entidades |
| F028 | F/src/models/order.model.ts | M | P6 | Reexportar tipos inferidos de schemas v1; sin PAN, typos ni entidades |
| F029 | F/src/models/cart.model.ts | M | P6 | Reexportar tipos inferidos de schemas v1; sin PAN, typos ni entidades |
| F030 | F/src/models/auth.model.ts | M | P5 | Reexportar tipos inferidos de schemas v1; sin PAN, typos ni entidades |
| F031 | F/src/hooks/useProducts.ts | M | P5 | Una sola fuente de estado; Query/URL, sin JWT cliente |
| F032 | F/src/hooks/useCart.ts | M | P6 | Una sola fuente de estado; Query/URL, sin JWT cliente |
| F033 | F/src/hooks/useAuth.ts | M | P5 | Una sola fuente de estado; Query/URL, sin JWT cliente |
| F034 | F/src/guards/AuthGuard.tsx | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F035 | F/src/guards/AdminGuard.tsx | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F036 | F/src/context/ThemeContext.tsx | M | P5 | Una sola fuente de estado; Query/URL, sin JWT cliente |
| F037 | F/src/context/CartContext.tsx | M | P6 | Una sola fuente de estado; Query/URL, sin JWT cliente |
| F038 | F/src/context/AuthContext.tsx | M | P5 | Una sola fuente de estado; Query/URL, sin JWT cliente |
| F039 | F/src/components/ui/ThemeToggle.tsx | M | P5 | Primitiva accesible, tokens, estados y test de componente |
| F040 | F/src/components/ui/Spinner.tsx | M | P5 | Primitiva accesible, tokens, estados y test de componente |
| F041 | F/src/components/ui/Select.tsx | M | P5 | Primitiva accesible, tokens, estados y test de componente |
| F042 | F/src/components/ui/Modal.tsx | M | P5 | Primitiva accesible, tokens, estados y test de componente |
| F043 | F/src/components/ui/Input.tsx | M | P5 | Primitiva accesible, tokens, estados y test de componente |
| F044 | F/src/components/ui/Button.tsx | M | P5 | Primitiva accesible, tokens, estados y test de componente |
| F045 | F/src/components/ui/Badge.tsx | M | P5 | Primitiva accesible, tokens, estados y test de componente |
| F046 | F/src/components/products/ProductReviews.tsx | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F047 | F/src/components/products/ProductList.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F048 | F/src/components/products/ProductFilter.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F049 | F/src/components/products/ProductDetail.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F050 | F/src/components/products/ProductCard.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F051 | F/src/components/products/FeaturedMarquee.tsx | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F052 | F/src/components/orders/OrderStatusBadge.tsx | M | P6 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F053 | F/src/components/orders/OrderList.tsx | M | P6 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F054 | F/src/components/orders/OrderDetailView.tsx | M | P6 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F055 | F/src/components/orders/OrderCard.tsx | M | P6 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F056 | F/src/components/layout/Sidebar.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F057 | F/src/components/forms/AddressBook.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F058 | F/src/components/auth/AuthScreen.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F059 | F/src/components/forms/AddressForm.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F060 | F/src/components/forms/CheckoutForm.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F061 | F/src/components/forms/ProductForm.tsx | M | P5 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F062 | F/src/components/forms/PaymentBook.tsx | D | P8 | Retirar tras corte; eliminar imports y verificar ausencia de consumidores |
| F063 | F/src/components/cart/cartItemRow.tsx | M | P6 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F064 | F/src/components/cart/EmptyCart.tsx | M | P6 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F065 | F/src/components/cart/cartSummary.tsx | M | P6 | Responsabilidad acotada, responsive, accesibilidad y DTO v1 |
| F066 | F/src/app/checkout/page.tsx | M | P6 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F067 | F/src/app/cart/page.tsx | M | P6 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F068 | F/src/app/register/page.tsx | M | P5 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F069 | F/src/app/admin/products/page.tsx | M | P7 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F070 | F/src/app/login/page.tsx | M | P5 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F071 | F/src/app/layout.tsx | M | P5 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F072 | F/src/app/globals.css | M | P5 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F073 | F/src/app/page.tsx | M | P5 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F074 | F/src/app/admin/orders/[id]/page.tsx | M | P7 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F075 | F/src/app/profile/page.tsx | M | P5 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F076 | F/src/app/admin/orders/page.tsx | M | P7 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F077 | F/src/app/admin/page.tsx | M | P7 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F078 | F/src/app/orders/page.tsx | M | P6 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F079 | F/src/app/admin/products/edit/[id]/page.tsx | M | P7 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F080 | F/src/app/admin/products/create/page.tsx | M | P7 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F081 | F/src/app/products/page.tsx | M | P5 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F082 | F/src/app/orders/[id]/page.tsx | M | P6 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F083 | F/src/app/products/[id]/page.tsx | M | P5 | Ruta server/shell e islas; autorización, estados y DTO canónico |
| F084 | F/package.json | M | P0 | Scripts/versiones reproducibles y configuración segura; contrato único |
| F085 | F/package-lock.json | M | P0 | Scripts/versiones reproducibles y configuración segura; contrato único |
| F086 | F/tsconfig.json | M | P0 | Scripts/versiones reproducibles y configuración segura; contrato único |
| F087 | F/next.config.ts | M | P0 | Scripts/versiones reproducibles y configuración segura; contrato único |
| F088 | F/eslint.config.mjs | M | P0 | Scripts/versiones reproducibles y configuración segura; contrato único |
| F089 | F/vercel.json | M | P0 | Scripts/versiones reproducibles y configuración segura; contrato único |
| F090 | F/.gitignore | M | P0 | Scripts/versiones reproducibles y configuración segura; contrato único |
| F091 | F/README.md | M | P9 | Documentar sólo evidencia final |
| F092 | F/ShopWave.postman_collection.json | M | P8 | Scripts/versiones reproducibles y configuración segura; contrato único |
| F093 | F/.stylelintrc.json | D | P8 | Config huérfana |
| F094 | F/vitest.config.ts | N | P0 | Crear para infraestructura de pruebas/CI |
| F095 | F/playwright.config.ts | N | P0 | Crear para infraestructura de pruebas/CI |
| F096 | F/src/test/setup.ts | N | P0 | Crear para infraestructura de pruebas/CI |
| F097 | F/.github/workflows/ci.yml | N | P0 | Crear para infraestructura de pruebas/CI |
| F098 | F/src/contracts/shopwave.schema.ts | N | P1 | Crear para contrato Zod y paridad OpenAPI |
| F099 | F/src/contracts/shopwave.schema.test.ts | N | P1 | Crear para contrato Zod y paridad OpenAPI |
| F100 | F/src/lib/server/backend.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F101 | F/src/lib/server/session.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F102 | F/src/lib/server/bff.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F103 | F/src/lib/server/security.test.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F104 | F/src/app/api/auth/login/route.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F105 | F/src/app/api/auth/register/route.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F106 | F/src/app/api/auth/logout/route.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F107 | F/src/app/api/session/route.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F108 | F/src/app/api/store/[...path]/route.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F109 | F/src/app/providers.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F110 | F/src/app/loading.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F111 | F/src/app/error.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F112 | F/src/app/not-found.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F113 | F/src/app/global-error.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F114 | F/src/app/products/loading.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F115 | F/src/app/products/[id]/not-found.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F116 | F/src/components/layout/StoreShell.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F117 | F/src/components/layout/StoreHeader.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F118 | F/src/components/layout/StoreFooter.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F119 | F/src/components/ui/Feedback.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F120 | F/src/components/ui/QuantitySelector.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F121 | F/src/components/auth/AuthScreen.test.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F122 | F/src/components/products/ProductFilter.test.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F123 | F/src/components/ui/Modal.test.tsx | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F124 | F/src/services/api.service.test.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F125 | F/src/utils/catalog-query.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F126 | F/src/utils/catalog-query.test.ts | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F127 | F/public/product-placeholder.svg | N | P5 | Crear para BFF, sesión y superficies accesibles |
| F128 | F/src/components/checkout/CheckoutFlow.tsx | N | P6 | Crear para checkout/carrito robustos |
| F129 | F/src/components/checkout/CheckoutFlow.test.tsx | N | P6 | Crear para checkout/carrito robustos |
| F130 | F/src/context/CartContext.test.tsx | N | P6 | Crear para checkout/carrito robustos |
| F131 | F/src/app/orders/loading.tsx | N | P6 | Crear para checkout/carrito robustos |
| F132 | F/src/test/handlers.ts | N | P6 | Crear para checkout/carrito robustos |
| F133 | F/src/app/admin/layout.tsx | N | P7 | Crear para admin separado y probado |
| F134 | F/src/app/admin/loading.tsx | N | P7 | Crear para admin separado y probado |
| F135 | F/src/app/admin/error.tsx | N | P7 | Crear para admin separado y probado |
| F136 | F/src/components/forms/ProductForm.test.tsx | N | P7 | Crear para admin separado y probado |
| F137 | F/src/components/admin/AdminWorkspace.tsx | N | P7 | Crear para admin separado y probado |
| F138 | F/e2e/commerce.spec.ts | N | P8 | Crear para verificación full stack/SEO |
| F139 | F/e2e/security.spec.ts | N | P8 | Crear para verificación full stack/SEO |
| F140 | F/e2e/responsive.spec.ts | N | P8 | Crear para verificación full stack/SEO |
| F141 | F/src/app/robots.ts | N | P8 | Crear para verificación full stack/SEO |
| F142 | F/src/app/sitemap.ts | N | P8 | Crear para verificación full stack/SEO |
| F143 | F/.env.example | N | P9 | Crear para configuración/documentación sin secretos |
| F144 | F/docs/REWORK_EVIDENCE.md | N | P9 | Crear para configuración/documentación sin secretos |
| E001 | E/backend/src/main/resources/application.properties | M | P2 | Perfiles aislados MySQL, validate/Flyway; sin secretos hardcodeados |
| E002 | E/backend/src/main/resources/application-prod.properties | M | P2 | Perfiles aislados MySQL, validate/Flyway; sin secretos hardcodeados |
| E003 | E/backend/src/test/java/com/shopwavefusion/ShopwavefusionbackendApplicationTests.java | M | P0 | Aislar contexto con Testcontainers y desactivar seeders |
| E004 | E/backend/src/main/java/com/shopwavefusion/user/domain/ProductSubCategory.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E005 | E/backend/src/main/java/com/shopwavefusion/user/domain/ProductSize.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E006 | E/backend/src/main/java/com/shopwavefusion/user/domain/ProductColor.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E007 | E/backend/src/main/java/com/shopwavefusion/user/domain/ProductCategory.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E008 | E/backend/src/main/java/com/shopwavefusion/user/domain/PaymentStatus.java | M | P4 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E009 | E/backend/src/main/java/com/shopwavefusion/user/domain/PaymentMethod.java | M | P4 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E010 | E/backend/src/main/java/com/shopwavefusion/user/domain/OrderStatus.java | M | P4 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E011 | E/backend/src/main/java/com/shopwavefusion/ShopwavefusionbackendApplication.java | M | P2 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E012 | E/backend/src/main/java/com/shopwavefusion/service/CartItemService.java | M | P4 | Reglas v1 transaccionales según contrato y tests |
| E013 | E/backend/src/main/java/com/shopwavefusion/service/CartItemServiceImplementation.java | M | P4 | Reglas v1 transaccionales según contrato y tests |
| E014 | E/backend/src/main/java/com/shopwavefusion/service/UserServiceImplementation.java | M | P3 | Reglas v1 transaccionales según contrato y tests |
| E015 | E/backend/src/main/java/com/shopwavefusion/service/UserService.java | M | P3 | Reglas v1 transaccionales según contrato y tests |
| E016 | E/backend/src/main/java/com/shopwavefusion/service/ReviewServiceImplementation.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E017 | E/backend/src/main/java/com/shopwavefusion/service/ReviewService.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E018 | E/backend/src/main/java/com/shopwavefusion/service/RatingServices.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E019 | E/backend/src/main/java/com/shopwavefusion/service/RatingServiceImplementation.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E020 | E/backend/src/main/java/com/shopwavefusion/service/ProductServiceImplementation.java | M | P2 | Reglas v1 transaccionales según contrato y tests |
| E021 | E/backend/src/main/java/com/shopwavefusion/service/ProductService.java | M | P2 | Reglas v1 transaccionales según contrato y tests |
| E022 | E/backend/src/main/java/com/shopwavefusion/service/OrderServiceImplementation.java | M | P4 | Reglas v1 transaccionales según contrato y tests |
| E023 | E/backend/src/main/java/com/shopwavefusion/service/OrderService.java | M | P4 | Reglas v1 transaccionales según contrato y tests |
| E024 | E/backend/src/main/java/com/shopwavefusion/service/OrderItemServiceImplementation.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E025 | E/backend/src/main/java/com/shopwavefusion/service/OrderItemService.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E026 | E/backend/src/main/java/com/shopwavefusion/service/CategoryService.java | M | P2 | Reglas v1 transaccionales según contrato y tests |
| E027 | E/backend/src/main/java/com/shopwavefusion/service/CartServiceImplementation.java | M | P4 | Reglas v1 transaccionales según contrato y tests |
| E028 | E/backend/src/main/java/com/shopwavefusion/service/CartService.java | M | P4 | Reglas v1 transaccionales según contrato y tests |
| E029 | E/backend/src/main/java/com/shopwavefusion/request/ReviewRequest.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E030 | E/backend/src/main/java/com/shopwavefusion/controller/UserController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E031 | E/backend/src/main/java/com/shopwavefusion/controller/ReviewController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E032 | E/backend/src/main/java/com/shopwavefusion/controller/RatingController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E033 | E/backend/src/main/java/com/shopwavefusion/controller/ProductController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E034 | E/backend/src/main/java/com/shopwavefusion/controller/OrderController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E035 | E/backend/src/main/java/com/shopwavefusion/controller/HomeController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E036 | E/backend/src/main/java/com/shopwavefusion/controller/CommonController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E037 | E/backend/src/main/java/com/shopwavefusion/controller/CartItemController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E038 | E/backend/src/main/java/com/shopwavefusion/controller/CartController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E039 | E/backend/src/main/java/com/shopwavefusion/controller/AuthController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E040 | E/backend/src/main/java/com/shopwavefusion/controller/AdminProductController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E041 | E/backend/src/main/java/com/shopwavefusion/controller/AdminOrderController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E042 | E/backend/src/main/java/com/shopwavefusion/controller/AdminController.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E043 | E/backend/src/main/java/com/shopwavefusion/repository/AddressRepository.java | M | P2 | Queries paginadas/ownership/locks; restricciones de unicidad |
| E044 | E/backend/src/main/java/com/shopwavefusion/request/CreateProductRequest.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E045 | E/backend/src/main/java/com/shopwavefusion/request/CreateOrderRequest.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E046 | E/backend/src/main/java/com/shopwavefusion/request/AddItemRequest.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E047 | E/backend/src/main/java/com/shopwavefusion/request/DeleteProductRequest.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E048 | E/backend/src/main/java/com/shopwavefusion/request/LoginRequest.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E049 | E/backend/src/main/java/com/shopwavefusion/modal/Cart.java | M | P4 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E050 | E/backend/src/main/java/com/shopwavefusion/modal/Address.java | M | P2 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E051 | E/backend/src/main/java/com/shopwavefusion/modal/CartItem.java | M | P4 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E052 | E/backend/src/main/java/com/shopwavefusion/response/ApiResponse.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E053 | E/backend/src/main/java/com/shopwavefusion/config/AdminInitializer.java | M | P2 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E054 | E/backend/src/main/java/com/shopwavefusion/request/RatingRequest.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E055 | E/backend/src/main/java/com/shopwavefusion/response/PaymentLinkResponse.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E056 | E/backend/src/main/java/com/shopwavefusion/response/CreatePaymentLinkResponse.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E057 | E/backend/src/main/java/com/shopwavefusion/response/AuthResponse.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E058 | E/backend/src/main/java/com/shopwavefusion/config/DataSeeder.java | M | P2 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E059 | E/backend/src/main/java/com/shopwavefusion/config/CustomUserAuthenticationProvider.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E060 | E/backend/src/main/java/com/shopwavefusion/config/JWTTokenGeneratorFilter.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E061 | E/backend/src/main/java/com/shopwavefusion/config/JwtTokenProvider.java | M | P3 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E062 | E/backend/src/main/java/com/shopwavefusion/repository/CategoryRepository.java | M | P2 | Queries paginadas/ownership/locks; restricciones de unicidad |
| E063 | E/backend/src/main/java/com/shopwavefusion/repository/CartRepository.java | M | P4 | Queries paginadas/ownership/locks; restricciones de unicidad |
| E064 | E/backend/src/main/java/com/shopwavefusion/repository/CartItemRepository.java | M | P4 | Queries paginadas/ownership/locks; restricciones de unicidad |
| E065 | E/backend/src/main/java/com/shopwavefusion/config/JWTTokenValidatorFilter.java | M | P3 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E066 | E/backend/src/main/java/com/shopwavefusion/repository/OrderRepository.java | M | P4 | Queries paginadas/ownership/locks; restricciones de unicidad |
| E067 | E/backend/src/main/java/com/shopwavefusion/repository/OrderItemRepository.java | M | P4 | Queries paginadas/ownership/locks; restricciones de unicidad |
| E068 | E/backend/src/main/java/com/shopwavefusion/repository/ProductRepository.java | M | P2 | Queries paginadas/ownership/locks; restricciones de unicidad |
| E069 | E/backend/src/main/java/com/shopwavefusion/modal/Order.java | M | P4 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E070 | E/backend/src/main/java/com/shopwavefusion/modal/Category.java | M | P2 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E071 | E/backend/src/main/java/com/shopwavefusion/modal/OrderItem.java | M | P4 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E072 | E/backend/src/main/java/com/shopwavefusion/exception/GlobleException.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E073 | E/backend/src/main/java/com/shopwavefusion/exception/ErrorDetails.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E074 | E/backend/src/main/java/com/shopwavefusion/exception/CartItemException.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E075 | E/backend/src/main/java/com/shopwavefusion/exception/UserException.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E076 | E/backend/src/main/java/com/shopwavefusion/repository/RatingRepository.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E077 | E/backend/src/main/java/com/shopwavefusion/exception/ProductException.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E078 | E/backend/src/main/java/com/shopwavefusion/exception/OrderException.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E079 | E/backend/src/main/java/com/shopwavefusion/config/ProjectSecurityConfig.java | M | P3 | Configuración v1 segura, perfiles explícitos y datos demo reproducibles |
| E080 | E/backend/src/main/java/com/shopwavefusion/modal/PaymentDetails.java | M | P4 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E081 | E/backend/src/main/java/com/shopwavefusion/config/SecurityConstants.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E082 | E/backend/src/main/java/com/shopwavefusion/repository/ReviewRepository.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E083 | E/backend/src/main/java/com/shopwavefusion/modal/PaymentInformation.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E084 | E/backend/src/main/java/com/shopwavefusion/repository/UserRepository.java | M | P2 | Queries paginadas/ownership/locks; restricciones de unicidad |
| E085 | E/backend/src/main/java/com/shopwavefusion/modal/User.java | M | P2 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E086 | E/backend/src/main/java/com/shopwavefusion/modal/Size.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E087 | E/backend/src/main/java/com/shopwavefusion/modal/Review.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E088 | E/backend/src/main/java/com/shopwavefusion/modal/Rating.java | D | P8 | Retirar legacy sólo después de equivalencia v1; sin endpoints inseguros finales |
| E089 | E/backend/src/main/java/com/shopwavefusion/modal/Product.java | M | P2 | Modelo persistente v1, UUID, constraints, snapshots, sin serialización REST |
| E090 | E/backend/pom.xml | M | P0 | Entorno reproducible, aislamiento y documentación real |
| E091 | E/backend/.gitignore | M | P0 | Entorno reproducible, aislamiento y documentación real |
| E092 | E/backend/README.md | M | P9 | Entorno reproducible, aislamiento y documentación real |
| E093 | E/docker-compose.yml | M | P0 | Entorno reproducible, aislamiento y documentación real |
| E094 | E/Dockerfile | M | P0 | Entorno reproducible, aislamiento y documentación real |
| E095 | E/README.md | M | P9 | Entorno reproducible, aislamiento y documentación real |
| E096 | E/EXPLICACION_ENTORNO.md | M | P9 | Entorno reproducible, aislamiento y documentación real |
| E097 | E/backend/src/test/resources/application-test.properties | N | P0 | Crear aislamiento/CI |
| E098 | E/.github/workflows/ci.yml | N | P0 | Crear aislamiento/CI |
| E099 | E/backend/openapi/shopwave-v1.yaml | N | P1 | Crear contrato normativo |
| E100 | E/backend/src/main/resources/application-local.properties | N | P2 | Crear DTOs, catálogo y persistencia |
| E101 | E/backend/src/main/resources/application-demo.properties | N | P2 | Crear DTOs, catálogo y persistencia |
| E102 | E/backend/src/main/resources/db/migration/V1__shopwave_schema.sql | N | P2 | Crear DTOs, catálogo y persistencia |
| E103 | E/backend/src/main/java/com/shopwavefusion/modal/ProductVariant.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E104 | E/backend/src/main/java/com/shopwavefusion/repository/ProductVariantRepository.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E105 | E/backend/src/main/java/com/shopwavefusion/api/v1/ProblemAdvice.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E106 | E/backend/src/main/java/com/shopwavefusion/api/v1/CommonDtos.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E107 | E/backend/src/main/java/com/shopwavefusion/api/v1/ProductDtos.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E108 | E/backend/src/main/java/com/shopwavefusion/api/v1/ProductController.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E109 | E/backend/src/main/java/com/shopwavefusion/api/v1/ProductMapper.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E110 | E/backend/src/main/java/com/shopwavefusion/repository/ProductSpecifications.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E111 | E/backend/src/test/java/com/shopwavefusion/CatalogIntegrationTest.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E112 | E/backend/src/test/java/com/shopwavefusion/ContextIntegrationTest.java | N | P2 | Crear DTOs, catálogo y persistencia |
| E113 | E/backend/src/main/java/com/shopwavefusion/api/v1/AuthDtos.java | N | P3 | Crear auth/perfil Bearer |
| E114 | E/backend/src/main/java/com/shopwavefusion/api/v1/AuthController.java | N | P3 | Crear auth/perfil Bearer |
| E115 | E/backend/src/main/java/com/shopwavefusion/api/v1/ProfileController.java | N | P3 | Crear auth/perfil Bearer |
| E116 | E/backend/src/main/java/com/shopwavefusion/service/AuthService.java | N | P3 | Crear auth/perfil Bearer |
| E117 | E/backend/src/main/java/com/shopwavefusion/config/AuthRateLimiter.java | N | P3 | Crear auth/perfil Bearer |
| E118 | E/backend/src/main/java/com/shopwavefusion/config/ApiSecurityHandlers.java | N | P3 | Crear auth/perfil Bearer |
| E119 | E/backend/src/test/java/com/shopwavefusion/SecurityIntegrationTest.java | N | P3 | Crear auth/perfil Bearer |
| E120 | E/backend/src/main/java/com/shopwavefusion/api/v1/CartDtos.java | N | P4 | Crear commerce transaccional |
| E121 | E/backend/src/main/java/com/shopwavefusion/api/v1/OrderDtos.java | N | P4 | Crear commerce transaccional |
| E122 | E/backend/src/main/java/com/shopwavefusion/api/v1/CartController.java | N | P4 | Crear commerce transaccional |
| E123 | E/backend/src/main/java/com/shopwavefusion/api/v1/OrderController.java | N | P4 | Crear commerce transaccional |
| E124 | E/backend/src/main/java/com/shopwavefusion/api/v1/CommerceMapper.java | N | P4 | Crear commerce transaccional |
| E125 | E/backend/src/test/java/com/shopwavefusion/CommerceIntegrationTest.java | N | P4 | Crear commerce transaccional |
| E126 | E/backend/src/test/java/com/shopwavefusion/OrderRulesTest.java | N | P4 | Crear commerce transaccional |
| E127 | E/backend/src/main/java/com/shopwavefusion/api/v1/AdminController.java | N | P7 | Crear admin seguro |
| E128 | E/backend/src/main/java/com/shopwavefusion/api/v1/AdminDtos.java | N | P7 | Crear admin seguro |
| E129 | E/backend/src/test/java/com/shopwavefusion/AdminIntegrationTest.java | N | P7 | Crear admin seguro |
| E130 | E/backend/src/test/java/com/shopwavefusion/ContractIntegrationTest.java | N | P8 | Crear paridad contrato y concurrencia |
| E131 | E/backend/src/test/java/com/shopwavefusion/ConcurrencyIntegrationTest.java | N | P8 | Crear paridad contrato y concurrencia |
| E132 | E/.env.example | N | P9 | Crear evidencia/configuración sin secretos |
| E133 | E/backend/docs/REWORK_EVIDENCE.md | N | P9 | Crear evidencia/configuración sin secretos |

# Acceptance Criteria

1. Contrato v1 único: cada endpoint tiene request/response/status probado; ninguna entidad User anidada ni error202; TS y OpenAPI coinciden incluso nulls/enums.
2. Sesión sin JWT accesible a JS, CSRF testeado, backend autoriza admin/propiedad, logout revoca y401/403 se distinguen. No secretos en Git ni credenciales por defecto activas.
3. Catálogo consulta SQL paginada, filtros/URL/back funcionan, no array completo descargado para paginar; empty/error/404 son reales.
4. Stock variante y cantidades coherentes bajo concurrencia; no stock negativo/overselling; update admin/checkout no pierden cambios.
5. Checkout sin PAN, método MOCK visible; petición repetida no crea dos órdenes; precio stale exige revisión; transacción rollback restaura todo.
6. Órdenes propias aisladas, historial immutable comercialmente, cancelación repone sólo una vez, admin respeta máquina de estados.
7. Profile/address DTOs privados mínimos; fotos y seed reproducibles, precios en centavos definidos, persistencia resiste reinicio.
8. Mobile/tablet/desktop y ambos temas verificados; teclado completo, nombres accesibles, contrastes medidos y sin overflow global.
9. Pruebas unit/component/API/security/DB/e2e existen y pasan en entorno aislado. No maquillar scaffolding como cobertura de negocio.
10. Documentación con comandos reales y evidencia. No deuda crítica pendiente en rutas entregadas; NO VERIFICADO visible donde corresponda.

# Risks

| Riesgo | Tratamiento/gate |
|---|---|
| Clave JWT/credenciales codificadas pudieron estar expuestas | Rotación externa autorizada antes de publicar; borrar del código no revoca secretos previos. No imprimir valores. |
| Base vieja contiene pagos/direcciones | No conectar nuevo código ni migraciones. Usar BD nueva; conservación/purga requiere decisión separada. |
| Boot3.1.2/springdoc2.0.2/JJWT0.11.5 envejecidos | Baseline primero, comprobación oficial de soporte/advisories al implementar; no certificar compatibilidad actual sin compilar/test. |
| Runtime backend no probado aquí | No prometer que 'ya funciona'; P0/P2 deben producir evidencia real. |
| Cambios UUID/moneda/snapshots son incompatibles legacy | Dataset nuevo y corte coordinado. No compatibilidad de sesiones ni IDs viejos prometida. |
| Concurrencia o locks con orden inconsistente | Pruebas MySQL reales, locks ordenados y rechazo de conflictos; no confiar sólo Mockito/H2. |
| BFF se vuelve proxy abierto o filtra token | Allowlist estricta, no auth upstream enviada por cliente, tests SSRF/token leakage. |
| Snapshot de cotización desincronizado | quoteFingerprint/version bajo lock,409 y revisión; no cobrar precio arbitrario. |
| Demo pública permite alterar inventario | Admin no público por defecto; sandbox autorizado, datos ficticios y reset manual autorizado, no cron destructivo. |
| Imágenes externas no relacionadas/disponibles | Curación, allowlist, fallback y licencia/origen documentado; no scraping. |
| Alcance excesivo/arquitectura transitoria | Sólo30 productos, una dimensión variante, sin reviews/pagos reales, borrar temporales al corte. |
| Versiones/dependencias o infra no disponibles | Registrar bloqueo concreto; no instalar/usar recursos fuera del alcance sin autorización. |

# Explicit Non-Goals

No marketplace, microservicios, pagos reales/sandbox, tarjeta/token ficticio con aspecto PAN, logística real, impuestos, cupones, favoritos, recomendaciones, chat, newsletter, reseñas, uploads de archivos, multi-moneda, guest checkout/cart, social login, refresh token, password reset, administración de roles, migración de datos legacy ni reescritura en Node. No 100% coverage ni certificación PCI/WCAG/seguridad. No deploy/commits/push/PR sin petición posterior explícita. No uso de otros proyectos.

# Final Execution Order

P0 baseline/aislamiento → P1 contrato congelado → P2 esquema/catálogo → P3 auth → P4 commerce → P5 corte BFF/frontend público → P6 compra/órdenes → P7 admin → P8 seguridad/limpieza/e2e → P9 evidencia.

Trabajo paralelizable: P3 y repos/tests de catálogo tras esquema P2; primitivas UI/tests pueden prepararse con fixtures P1 sin activar pantallas ni inventar datos definitivos. Checkout UI espera P4; admin espera servicios versionados. No optimizar legacy ni testear profundamente PaymentBook/reviews que se eliminan. Tests se desarrollan dentro de cada fase, no 'se dejan para P8'. No deploy por fase; checkpoints son locales aislados.

Si falla checkpoint: detener la siguiente fase, registrar comando/resultado/causa; arreglar dentro del mismo contrato y alcance. No avanzar con falso PASS, no cambiar contrato dos veces para acomodar una UI. Si hay datos reales, necesidad de cambio mayor de stack o autorización externa, pedir decisión al dueño.

# Definition of Done

Luna puede declarar REWORK IMPLEMENTADO sólo cuando P0–P9 están completos, contratos y flujos pasan con backend/MySQL reales aislados, no quedan PAN/secretos hardcodeados/endpoints legacy inseguros, la UI está comprobada con teclado y viewports, y documentación refleja resultados verificables. Build verde por sí solo no basta.

La entrega final debe enumerar versiones fijadas, archivos efectivamente cambiados, comandos y resultados, discrepancias contra este mapa, riesgos residuales y si hubo o no publicación. Una demo no desplegada se declara 'verificada localmente', no 'producción'. La falta de permiso de deploy no justifica publicar ni impide entregar el rework local terminado.

Estado de ESTE documento: planificación y auditoría estática, no implementación. Backend auditado en código; build/tests/backend vivo permanecen NO VERIFICADOS hasta ejecución futura autorizada.
