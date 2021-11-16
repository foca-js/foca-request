import { AxiosAdapter, AxiosError, AxiosResponse } from 'axios';
import createError from 'axios/lib/core/createError';
import { FocaRequestConfig } from '../enhancer';
import { PromiseCallback } from '../libs/collectPromiseCallback';

export class RequestSlot {
  constructor(
    protected readonly originalAdapter: AxiosAdapter,
    protected readonly getHttpStatus:
      | ((response: AxiosResponse) => number)
      | undefined,
  ) {
    if (!originalAdapter) {
      throw new Error('axios default adapter is not found.');
    }
  }

  hit(
    config: FocaRequestConfig,
    [onResolve, onReject]: PromiseCallback,
    shouldLoop: (
      err: AxiosError,
      config: FocaRequestConfig,
      currentTimes: number,
    ) => Promise<boolean>,
  ): Promise<any> {
    const loop = (currentTimes: number): Promise<any> => {
      return this.originalAdapter(config)
        .then(onResolve, onReject)
        .then((response) => {
          const getHttpStatus = config.getHttpStatus || this.getHttpStatus;

          if (config.validateStatus && getHttpStatus) {
            const realHttpStatus = getHttpStatus(response);

            if (!config.validateStatus(realHttpStatus)) {
              return Promise.reject(
                createError(
                  'Request failed with status code ' + realHttpStatus,
                  response.config,
                  null,
                  response.request,
                  response,
                ),
              );
            }
          }

          return response;
        })
        .catch((err: AxiosError) => {
          return shouldLoop(err, config, currentTimes + 1)
            .then((enable) => {
              return enable
                ? Promise.resolve(loop(currentTimes + 1))
                : Promise.reject(err);
            })
            .catch(() => Promise.reject(err));
        });
    };

    return loop(0);
  }
}
