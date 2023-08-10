/**
 * @file This file contains functionality to create generic TyRAS validators for URL and query parameters from 'native' `runtypes` decoders.
 */

import * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-runtypes";
import type * as protocol from "@ty-ras/protocol";
import * as s from "./string";

/**
 * Creates a new generic {@link spec.URLParameterInfo} for one URL path-encoded parameter, to be used when defining the URL path pattern for BE endpoint.
 * @param name The name of the URL parameter.
 * @param decoder The {@link common.Decoder} to validate the URL parameter.
 * @param regExp The optional RegExp to use. If not specified, the value of {@link dataBE.defaultParameterRegExp} will be used.
 * @returns A new generic {@link spec.URLParameterInfo} to be passed to TyRAS functions.
 */
export const urlParameter = <TName extends string, TRuntime>(
  name: TName,
  decoder: common.Decoder<TRuntime>,
  regExp?: RegExp,
) =>
  dataBE.urlParameterGeneric<TName, TRuntime, common.ValidatorHKT>(
    name,
    decoder,
    regExp,
    common.fromDecoder,
  );

/**
 * Creates a new generic {@link dataBE.QueryValidatorSpec} for all query parameters from named native {@link common.Decoder}s.
 * @param validation The named native {@link common.Decoder}s.
 * @returns A new generic {@link dataBE.QueryValidatorSpec} for all query parameters
 */
export const query = <TQueryData extends protocol.TQueryDataBase>(
  validation: dataBE.QueryDataValidatorSpecMetadata<
    TQueryData,
    common.ValidatorHKT
  >,
) => s.stringDecoder<TQueryData>(validation, "Query parameter");
