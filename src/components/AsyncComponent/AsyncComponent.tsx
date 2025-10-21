import { ComponentType, lazy } from 'react';
import _isError from 'lodash/isError';
import NProgress from 'nprogress';

const storageKey = 'lazyImport-force-reload';

NProgress.configure({
  speed: 500,
  showSpinner: false,
});

const asyncComponent = (factory: () => Promise<{ default: ComponentType }>) =>
  lazy(async () => {
    try {
      NProgress.start();
      const component = await factory();
      window.sessionStorage.removeItem(storageKey);
      NProgress.done();
      return component;
    } catch (e) {
      if (_isError(e)) console.log(e.stack || e);
      else console.log(e);

      if (!window.sessionStorage.getItem(storageKey)) {
        try {
          window.sessionStorage.setItem(storageKey, 'true');
          console.error(`failed to load ${factory.toString()}, reloading`);
          window.location.reload();
        } catch (e) {
          console.error(e);
          console.error('failed to set sessionstorage');
          return {
            default: () => (
              <>
                <h1>Error occurred</h1>
                <button onClick={() => window.location.reload()}>Reload</button>
              </>
            ),
          };
        }
        return { default: () => <></> };
      }

      return {
        default: () => (
          <>
            <h1>Error occurred</h1>
            <button onClick={() => window.location.reload()}>Reload</button>
          </>
        ),
      };
    }
  });

export default asyncComponent;
