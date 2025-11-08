import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../../container/calculations/getContainerOrFail';
import { HttpMethod } from '../../../http/models/HttpMethod';
import { setServerRequest } from '../../../server/actions/setServerRequest';
import { getServerOrFail } from '../../../server/calculations/getServerOrFail';
import { Server } from '../../../server/models/Server';
import { ServerKind } from '../../../server/models/ServerKind';
import { WarriorsDeleteJsonBodyController } from '../controllers/WarriorsDeleteJsonBodyController';
import { WarriorsDeleteJsonBodyNamedController } from '../controllers/WarriorsDeleteJsonBodyNamedController';
import { WarriorsDeleteMultipartBodyExpressController } from '../controllers/WarriorsDeleteMultipartBodyExpressController';
import { WarriorsDeleteMultipartBodyExpressV4Controller } from '../controllers/WarriorsDeleteMultipartBodyExpressV4Controller';
import { WarriorsDeleteMultipartBodyFastifyController } from '../controllers/WarriorsDeleteMultipartBodyFastifyController';
import { WarriorsDeleteMultipartBodyHonoController } from '../controllers/WarriorsDeleteMultipartBodyHonoController';
import { WarriorsDeleteMultipartBodyUwebSocketsController } from '../controllers/WarriorsDeleteMultipartBodyUwebSocketsController';
import { WarriorsDeleteStringBodyController } from '../controllers/WarriorsDeleteStringBodyController';
import { WarriorsDeleteUrlEncodedBodyController } from '../controllers/WarriorsDeleteUrlEncodedBodyController';
import { WarriorsOptionsJsonBodyController } from '../controllers/WarriorsOptionsJsonBodyController';
import { WarriorsOptionsJsonBodyNamedController } from '../controllers/WarriorsOptionsJsonBodyNamedController';
import { WarriorsOptionsMultipartBodyExpressController } from '../controllers/WarriorsOptionsMultipartBodyExpressController';
import { WarriorsOptionsMultipartBodyExpressV4Controller } from '../controllers/WarriorsOptionsMultipartBodyExpressV4Controller';
import { WarriorsOptionsMultipartBodyFastifyController } from '../controllers/WarriorsOptionsMultipartBodyFastifyController';
import { WarriorsOptionsMultipartBodyHonoController } from '../controllers/WarriorsOptionsMultipartBodyHonoController';
import { WarriorsOptionsMultipartBodyUwebSocketsController } from '../controllers/WarriorsOptionsMultipartBodyUwebSocketsController';
import { WarriorsOptionsStringBodyController } from '../controllers/WarriorsOptionsStringBodyController';
import { WarriorsOptionsUrlEncodedBodyController } from '../controllers/WarriorsOptionsUrlEncodedBodyController';
import { WarriorsPatchJsonBodyController } from '../controllers/WarriorsPatchJsonBodyController';
import { WarriorsPatchJsonBodyNamedController } from '../controllers/WarriorsPatchJsonBodyNamedController';
import { WarriorsPatchMultipartBodyExpressController } from '../controllers/WarriorsPatchMultipartBodyExpressController';
import { WarriorsPatchMultipartBodyExpressV4Controller } from '../controllers/WarriorsPatchMultipartBodyExpressV4Controller';
import { WarriorsPatchMultipartBodyFastifyController } from '../controllers/WarriorsPatchMultipartBodyFastifyController';
import { WarriorsPatchMultipartBodyHonoController } from '../controllers/WarriorsPatchMultipartBodyHonoController';
import { WarriorsPatchMultipartBodyUwebSocketsController } from '../controllers/WarriorsPatchMultipartBodyUwebSocketsController';
import { WarriorsPatchStringBodyController } from '../controllers/WarriorsPatchStringBodyController';
import { WarriorsPatchUrlEncodedBodyController } from '../controllers/WarriorsPatchUrlEncodedBodyController';
import { WarriorsPostJsonBodyController } from '../controllers/WarriorsPostJsonBodyController';
import { WarriorsPostJsonBodyNamedController } from '../controllers/WarriorsPostJsonBodyNamedController';
import { WarriorsPostMultipartBodyExpressController } from '../controllers/WarriorsPostMultipartBodyExpressController';
import { WarriorsPostMultipartBodyExpressV4Controller } from '../controllers/WarriorsPostMultipartBodyExpressV4Controller';
import { WarriorsPostMultipartBodyFastifyController } from '../controllers/WarriorsPostMultipartBodyFastifyController';
import { WarriorsPostMultipartBodyHonoController } from '../controllers/WarriorsPostMultipartBodyHonoController';
import { WarriorsPostMultipartBodyUwebSocketsController } from '../controllers/WarriorsPostMultipartBodyUwebSocketsController';
import { WarriorsPostStringBodyController } from '../controllers/WarriorsPostStringBodyController';
import { WarriorsPostUrlEncodedBodyController } from '../controllers/WarriorsPostUrlEncodedBodyController';
import { WarriorsPutJsonBodyController } from '../controllers/WarriorsPutJsonBodyController';
import { WarriorsPutJsonBodyNamedController } from '../controllers/WarriorsPutJsonBodyNamedController';
import { WarriorsPutMultipartBodyExpressController } from '../controllers/WarriorsPutMultipartBodyExpressController';
import { WarriorsPutMultipartBodyExpressV4Controller } from '../controllers/WarriorsPutMultipartBodyExpressV4Controller';
import { WarriorsPutMultipartBodyFastifyController } from '../controllers/WarriorsPutMultipartBodyFastifyController';
import { WarriorsPutMultipartBodyHonoController } from '../controllers/WarriorsPutMultipartBodyHonoController';
import { WarriorsPutMultipartBodyUwebSocketsController } from '../controllers/WarriorsPutMultipartBodyUwebSocketsController';
import { WarriorsPutStringBodyController } from '../controllers/WarriorsPutStringBodyController';
import { WarriorsPutUrlEncodedBodyController } from '../controllers/WarriorsPutUrlEncodedBodyController';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';
import { WarriorRequest } from '../models/WarriorRequest';

function getMethodWarriorJsonBodyController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteJsonBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsJsonBodyController;
    case HttpMethod.patch:
      return WarriorsPatchJsonBodyController;
    case HttpMethod.post:
      return WarriorsPostJsonBodyController;
    case HttpMethod.put:
      return WarriorsPutJsonBodyController;
  }
}

function getMethodWarriorJsonBodyNamedController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteJsonBodyNamedController;
    case HttpMethod.get:
      throw new Error('Get not supported for body named controller');
    case HttpMethod.options:
      return WarriorsOptionsJsonBodyNamedController;
    case HttpMethod.patch:
      return WarriorsPatchJsonBodyNamedController;
    case HttpMethod.post:
      return WarriorsPostJsonBodyNamedController;
    case HttpMethod.put:
      return WarriorsPutJsonBodyNamedController;
  }
}

function getMethodWarriorStringBodyController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteStringBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsStringBodyController;
    case HttpMethod.patch:
      return WarriorsPatchStringBodyController;
    case HttpMethod.post:
      return WarriorsPostStringBodyController;
    case HttpMethod.put:
      return WarriorsPutStringBodyController;
  }
}

function getMethodWarriorUrlEncodedBodyController(
  method: HttpMethod,
): NewableFunction {
  switch (method) {
    case HttpMethod.delete:
      return WarriorsDeleteUrlEncodedBodyController;
    case HttpMethod.get:
      throw new Error('Get not supported for body controller');
    case HttpMethod.options:
      return WarriorsOptionsUrlEncodedBodyController;
    case HttpMethod.patch:
      return WarriorsPatchUrlEncodedBodyController;
    case HttpMethod.post:
      return WarriorsPostUrlEncodedBodyController;
    case HttpMethod.put:
      return WarriorsPutUrlEncodedBodyController;
  }
}

function getMethodWarriorMultipartBodyController(
  method: HttpMethod,
  serverKind: ServerKind,
): NewableFunction {
  switch (serverKind) {
    case ServerKind.express: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyExpressController;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyExpressController;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyExpressController;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyExpressController;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyExpressController;
      }
      // The inner switch always returns or throws, so this is unreachable
      // but satisfies the linter
      break;
    }
    case ServerKind.express4: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyExpressV4Controller;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyExpressV4Controller;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyExpressV4Controller;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyExpressV4Controller;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyExpressV4Controller;
      }
      break;
    }
    case ServerKind.fastify: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyFastifyController;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyFastifyController;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyFastifyController;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyFastifyController;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyFastifyController;
      }
      break;
    }
    case ServerKind.hono: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyHonoController;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyHonoController;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyHonoController;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyHonoController;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyHonoController;
      }
      break;
    }
    case ServerKind.uwebsockets: {
      switch (method) {
        case HttpMethod.delete:
          return WarriorsDeleteMultipartBodyUwebSocketsController;
        case HttpMethod.get:
          throw new Error('Get not supported for body controller');
        case HttpMethod.options:
          return WarriorsOptionsMultipartBodyUwebSocketsController;
        case HttpMethod.patch:
          return WarriorsPatchMultipartBodyUwebSocketsController;
        case HttpMethod.post:
          return WarriorsPostMultipartBodyUwebSocketsController;
        case HttpMethod.put:
          return WarriorsPutMultipartBodyUwebSocketsController;
      }
      break;
    }
  }
}

function givenWarriorRequestWithEmptyStringBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    body: '',
    headers: {
      'Content-Type': 'text/plain',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: '',
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithStringBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    body: 'string-body-content',
    headers: {
      'Content-Type': 'text/plain',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: 'string-body-content',
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithNoStringBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const requestInit: RequestInit = {
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: undefined,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithJsonBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const warriorRequest: WarriorRequest = {
    name: 'Samurai',
    type: WarriorCreationResponseType.Melee,
  };

  const requestInit: RequestInit = {
    body: JSON.stringify(warriorRequest),
    headers: {
      'Content-Type': 'application/json',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: warriorRequest,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorRequestWithUrlEncodedBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const warriorRequest: WarriorRequest = {
    name: 'Samurai',
    type: WarriorCreationResponseType.Melee,
  };

  const urlEncodedBody: string = new URLSearchParams({
    name: warriorRequest.name,
    type: warriorRequest.type,
  }).toString();

  const requestInit: RequestInit = {
    body: urlEncodedBody,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: warriorRequest,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

function givenWarriorBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorJsonBodyController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorBodyNamedControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorJsonBodyNamedController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorStringBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorStringBodyController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorUrlEncodedBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction =
    getMethodWarriorUrlEncodedBodyController(method);

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorMultipartBodyControllerForContainer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  serverKind: ServerKind,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  const controller: NewableFunction = getMethodWarriorMultipartBodyController(
    method,
    serverKind,
  );

  container.bind(controller).toSelf().inSingletonScope();
}

function givenWarriorRequestWithMultipartBodyForServer(
  this: InversifyHttpWorld,
  method: HttpMethod,
  requestAlias?: string,
  serverAlias?: string,
): void {
  const parsedRequestAlias: string = requestAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;
  const server: Server = getServerOrFail.bind(this)(parsedServerAlias);

  const url: string = `http://${server.host}:${server.port.toString()}/warriors`;

  const warriorRequest: WarriorRequest = {
    name: 'Samurai',
    type: WarriorCreationResponseType.Melee,
  };

  const formData: FormData = new FormData();
  formData.append('name', warriorRequest.name);
  formData.append('type', warriorRequest.type);

  const requestInit: RequestInit = {
    body: formData,
    method,
  };

  const request: Request = new Request(url, requestInit);

  setServerRequest.bind(this)(parsedRequestAlias, {
    body: warriorRequest,
    queryParameters: {},
    request,
    urlParameters: {},
  });
}

Given<InversifyHttpWorld>(
  'a warrior controller with body decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorBodyControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with body decorator with parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorBodyNamedControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with string body decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorStringBodyControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with empty string body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithEmptyStringBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with JSON body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithJsonBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with no body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithNoStringBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with string body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithStringBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with urlencoded body decorator without parameter name for "{httpMethod}" method',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorUrlEncodedBodyControllerForContainer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with urlencoded body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithUrlEncodedBodyForServer.bind(this)(httpMethod);
  },
);

Given<InversifyHttpWorld>(
  'a warrior controller with multipart body decorator without parameter name for "{httpMethod}" method for "{serverKind}" server',
  function (
    this: InversifyHttpWorld,
    httpMethod: HttpMethod,
    serverKind: ServerKind,
  ): void {
    givenWarriorMultipartBodyControllerForContainer.bind(this)(
      httpMethod,
      serverKind,
    );
  },
);

Given<InversifyHttpWorld>(
  'a "{httpMethod}" warriors HTTP request with multipart body',
  function (this: InversifyHttpWorld, httpMethod: HttpMethod): void {
    givenWarriorRequestWithMultipartBodyForServer.bind(this)(httpMethod);
  },
);
