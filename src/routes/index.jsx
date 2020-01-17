import asyncComponent from '../components/AsyncComponent'

export const createRouteObj = ({ path = '', exact = true, component = '', ...rest }) => ({
  path,
  exact,
  component,
  ...rest,
})

export const createRoutes = store => ({
  routes: [
    createRouteObj({
      path: '/checklists',
      exact: false,
      component: asyncComponent(() => import('./Checklists').then(module => module.default(store))),
    }),
    createRouteObj({
      path: '/clients',
      exact: false,
      component: asyncComponent(() => import('./Clients').then(module => module.default(store))),
    }),
  ],
})

export default createRoutes
