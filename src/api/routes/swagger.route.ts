import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { getOpenApiDocumentation } from '../../config/swagger';

const router = Router();

const openApiSpecification = getOpenApiDocumentation();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openApiSpecification));

export default router;
