/* eslint-disable */

// @ts-nocheck

// Generated for Expo Center Norte Frontend V2 RC2 — workflows Expo V2.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as CagRouteImport } from './routes/cag'
import { Route as HidrometrosRouteImport } from './routes/hidrometros'
import { Route as QualidadeDadosRouteImport } from './routes/qualidade-dados'
import { Route as RelatoriosRouteImport } from './routes/relatorios'
import { Route as AnalisesIaRouteImport } from './routes/analises-ia'
import { Route as UsuariosRouteImport } from './routes/usuarios'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AlterarSenhaRouteImport } from './routes/alterar-senha'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

const CagRoute = CagRouteImport.update({
  id: '/cag',
  path: '/cag',
  getParentRoute: () => rootRouteImport,
} as any)

const HidrometrosRoute = HidrometrosRouteImport.update({
  id: '/hidrometros',
  path: '/hidrometros',
  getParentRoute: () => rootRouteImport,
} as any)

const QualidadeDadosRoute = QualidadeDadosRouteImport.update({
  id: '/qualidade-dados',
  path: '/qualidade-dados',
  getParentRoute: () => rootRouteImport,
} as any)

const RelatoriosRoute = RelatoriosRouteImport.update({
  id: '/relatorios',
  path: '/relatorios',
  getParentRoute: () => rootRouteImport,
} as any)

const AnalisesIaRoute = AnalisesIaRouteImport.update({
  id: '/analises-ia',
  path: '/analises-ia',
  getParentRoute: () => rootRouteImport,
} as any)

const UsuariosRoute = UsuariosRouteImport.update({
  id: '/usuarios',
  path: '/usuarios',
  getParentRoute: () => rootRouteImport,
} as any)

const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)

const AlterarSenhaRoute = AlterarSenhaRouteImport.update({
  id: '/alterar-senha',
  path: '/alterar-senha',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/cag': typeof CagRoute
  '/hidrometros': typeof HidrometrosRoute
  '/qualidade-dados': typeof QualidadeDadosRoute
  '/relatorios': typeof RelatoriosRoute
  '/analises-ia': typeof AnalisesIaRoute
  '/usuarios': typeof UsuariosRoute
  '/login': typeof LoginRoute
  '/alterar-senha': typeof AlterarSenhaRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/cag': typeof CagRoute
  '/hidrometros': typeof HidrometrosRoute
  '/qualidade-dados': typeof QualidadeDadosRoute
  '/relatorios': typeof RelatoriosRoute
  '/analises-ia': typeof AnalisesIaRoute
  '/usuarios': typeof UsuariosRoute
  '/login': typeof LoginRoute
  '/alterar-senha': typeof AlterarSenhaRoute
}

export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/cag': typeof CagRoute
  '/hidrometros': typeof HidrometrosRoute
  '/qualidade-dados': typeof QualidadeDadosRoute
  '/relatorios': typeof RelatoriosRoute
  '/analises-ia': typeof AnalisesIaRoute
  '/usuarios': typeof UsuariosRoute
  '/login': typeof LoginRoute
  '/alterar-senha': typeof AlterarSenhaRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/cag' | '/hidrometros' | '/qualidade-dados' | '/relatorios' | '/analises-ia' | '/usuarios' | '/login' | '/alterar-senha'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/cag' | '/hidrometros' | '/qualidade-dados' | '/relatorios' | '/analises-ia' | '/usuarios' | '/login' | '/alterar-senha'
  id: '__root__' | '/' | '/cag' | '/hidrometros' | '/qualidade-dados' | '/relatorios' | '/analises-ia' | '/usuarios' | '/login' | '/alterar-senha'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  CagRoute: typeof CagRoute
  HidrometrosRoute: typeof HidrometrosRoute
  QualidadeDadosRoute: typeof QualidadeDadosRoute
  RelatoriosRoute: typeof RelatoriosRoute
  AnalisesIaRoute: typeof AnalisesIaRoute
  UsuariosRoute: typeof UsuariosRoute
  LoginRoute: typeof LoginRoute
  AlterarSenhaRoute: typeof AlterarSenhaRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/cag': {
      id: '/cag'
      path: '/cag'
      fullPath: '/cag'
      preLoaderRoute: typeof CagRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/hidrometros': {
      id: '/hidrometros'
      path: '/hidrometros'
      fullPath: '/hidrometros'
      preLoaderRoute: typeof HidrometrosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/qualidade-dados': {
      id: '/qualidade-dados'
      path: '/qualidade-dados'
      fullPath: '/qualidade-dados'
      preLoaderRoute: typeof QualidadeDadosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/relatorios': {
      id: '/relatorios'
      path: '/relatorios'
      fullPath: '/relatorios'
      preLoaderRoute: typeof RelatoriosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/analises-ia': {
      id: '/analises-ia'
      path: '/analises-ia'
      fullPath: '/analises-ia'
      preLoaderRoute: typeof AnalisesIaRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/usuarios': {
      id: '/usuarios'
      path: '/usuarios'
      fullPath: '/usuarios'
      preLoaderRoute: typeof UsuariosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/alterar-senha': {
      id: '/alterar-senha'
      path: '/alterar-senha'
      fullPath: '/alterar-senha'
      preLoaderRoute: typeof AlterarSenhaRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  CagRoute: CagRoute,
  HidrometrosRoute: HidrometrosRoute,
  QualidadeDadosRoute: QualidadeDadosRoute,
  RelatoriosRoute: RelatoriosRoute,
  AnalisesIaRoute: AnalisesIaRoute,
  UsuariosRoute: UsuariosRoute,
  LoginRoute: LoginRoute,
  AlterarSenhaRoute: AlterarSenhaRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
