/**
 * @file This file contains code related to creating factory for API calls.
 */

import * as dataFE from "@ty-ras/data-frontend";
import type * as data from "@ty-ras/data-runtypes";

/**
 * Creates new object which is able to create instances of {@link APICallFactory}.
 * This is meant to be used by other TyRAS libraries, and not directly by client code.
 * @param callHttpEndpoint The callback to make actual HTTP call.
 * @returns The {@link APICallFactory}.
 */
export const createAPICallFactoryWithCallback = (
  callHttpEndpoint: dataFE.CallHTTPEndpoint,
) => dataFE.createAPICallFactoryGeneric<data.EncodedHKT>(callHttpEndpoint);

/**
 * This type specializes the {@link dataFE.APICallFactoryBase} to use the {@link data.HKTEncoded} as its first generic argument.
 */
export type APICallFactory<THeaderFunctionalityNames extends string = "auth"> =
  dataFE.APICallFactoryBase<data.EncodedHKT, THeaderFunctionalityNames>;
