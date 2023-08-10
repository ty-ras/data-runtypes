/**
 * @file This file contains code to create generic TyRAS callbacks from 'native' `runtypes` validators, for HTTP request and response headers validation.
 */

import type * as dataBE from "@ty-ras/data-backend";
import type * as common from "@ty-ras/data-runtypes";
import type * as protocol from "@ty-ras/protocol";
import * as s from "./string";

/**
 * Creates a new generic TyRAS {@link dataBE.RequestHeaderDataValidatorSpec} for validating request headers, wrapping named native `runtypes` {@link common.Decoder}.
 * @param validation The named {@link common.Decoder}s, each responsible for validating the request header value. The key is header name, and the value is the {@link common.Decoder}.
 * @returns The {@link data.RequestHeaderDataValidatorSpec} that can be passed to TyRAS functions as response body validator.
 */
export const requestHeaders = <
  THeaderData extends protocol.TRequestHeadersDataBase,
>(
  validation: dataBE.RequestHeaderDataValidatorSpecMetadata<
    THeaderData,
    common.ValidatorHKT
  >,
) => s.stringDecoder<THeaderData>(validation, "Request header");

/**
 * Creates a new generic TyRAS {@link dataBE.ResponseHeaderDataValidatorSpec} for validating response headers, wrapping named native `runtypes` {@link common.Encoder}.
 * @param validation The named {@link common.Encoder}s, each responsible for validating the response header value. The key is header name, and the value is the {@link common.Encoder}.
 * @returns The {@link data.ResponseHeaderDataValidatorSpec} that can be passed to TyRAS functions as response body validator.
 */
export const responseHeaders = <
  THeaderData extends protocol.TRequestHeadersDataBase,
>(
  validation: dataBE.ResponseHeaderDataValidatorSpecMetadata<
    THeaderData,
    common.ValidatorHKT
  >,
) => s.stringEncoder<THeaderData>(validation, "Response header");
