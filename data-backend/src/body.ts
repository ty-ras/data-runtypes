/**
 * @file This file contains code to create generic TyRAS callbacks from 'native' `runtypes` validators, for HTTP request and response body validation.
 */

import * as data from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-runtypes";

/**
 * This is the default MIME type used to serialize/deserialize response/request bodies.
 * Its value is `application/json`.
 */
export const CONTENT_TYPE = "application/json" as const;

/**
 * Creates a new generic TyRAS {@link data.DataValidatorRequestInputSpec} for validating request body, wrapping native `runtypes` {@link common.Decoder}, without additional options.
 * @param validation The {@link common.Decoder} responsible for validating the deserialized and and JSON-parsed request body.
 * @param readBody The options for reading request body.
 * @returns The {@link data.DataValidatorRequestInputSpec} that can be passed to TyRAS functions as request body validator.
 */
export function requestBody<T>(
  validation: common.Decoder<T>,
  readBody: data.ReadBody,
): data.DataValidatorRequestInputSpec<
  T,
  common.ValidatorHKT,
  typeof CONTENT_TYPE
>;

/**
 * Creates a new generic TyRAS {@link data.DataValidatorRequestInputSpec} for validating request body, wrapping native `runtypes` {@link common.Decoder}, with additional options.
 * @param validation The {@link common.Decoder} responsible for validating the deserialized and and JSON-parsed request body.
 * @param readBody The options for reading request body.
 * @param opts The {@link RequestBodyCreationOptions}, without custom content type specifier.
 * @returns The {@link data.DataValidatorRequestInputSpec} that can be passed to TyRAS functions as request body validator.
 */
export function requestBody<T>(
  validation: common.Decoder<T>,
  readBody: data.ReadBody,
  opts: RequestBodyCreationOptions & { contentType?: never },
): data.DataValidatorRequestInputSpec<
  T,
  common.ValidatorHKT,
  typeof CONTENT_TYPE
>;

/**
 * Creates a new generic TyRAS {@link data.DataValidatorRequestInputSpec} for validating request body, wrapping native `runtypes` {@link common.Decoder}, with additional options, including content type.
 * @param validation The {@link common.Decoder} responsible for validating the deserialized and and JSON-parsed request body.
 * @param readBody The options for reading request body.
 * @param opts The {@link RequestBodyCreationOptions}, along with custom content type specifier.
 * @returns The {@link data.DataValidatorRequestInputSpec} that can be passed to TyRAS functions as request body validator.
 */
export function requestBody<T, TContentType extends string>(
  validation: common.Decoder<T>,
  readBody: data.ReadBody,
  opts: RequestBodyCreationOptions & { contentType: TContentType },
): data.DataValidatorRequestInputSpec<T, common.ValidatorHKT, TContentType>;

/**
 * Creates a new generic TyRAS {@link data.DataValidatorRequestInputSpec} for validating request body, wrapping native `runtypes` {@link common.Decoder}, with additional options, possibly including content type.
 * @param validation The {@link common.Decoder} responsible for validating the deserialized and and JSON-parsed request body.
 * @param readBody The options for reading request body.
 * @param opts The {@link RequestBodyCreationOptions}, possibly with custom content type specifier.
 * @returns The {@link data.DataValidatorRequestInputSpec} that can be passed to TyRAS functions as request body validator.
 */
export function requestBody<T, TContentType extends string>(
  validation: common.Decoder<T>,
  readBody: data.ReadBody,
  opts?: RequestBodyCreationOptions & { contentType?: TContentType },
): data.DataValidatorRequestInputSpec<T, common.ValidatorHKT, TContentType> {
  return data.requestBodyGeneric(
    validation,
    opts?.contentType ?? CONTENT_TYPE,
    opts?.strictContentType === true,
    readBody,
    common.fromDecoder(validation),
    opts?.allowProtoProperty === true,
  );
}

/**
 * Creates a new generic TyRAS {@link data.DataValidatorResponseOutputSpec} for validating response body, wrapping native `runtypes` {@link common.Encoder}.
 * @param validation The {@link common.Encoder} responsible for validating the response body before it is stringified and serialized.
 * @returns The {@link data.DataValidatorResponseOutputSpec} that can be passed to TyRAS functions as response body validator.
 */
export function responseBody<TOutput, TSerialized>(
  validation: common.Encoder<TOutput, TSerialized>,
): data.DataValidatorResponseOutputSpec<
  TOutput,
  TSerialized,
  common.ValidatorHKT,
  typeof CONTENT_TYPE
>;

/**
 * Creates a new generic TyRAS {@link data.DataValidatorResponseOutputSpec} for validating response body, wrapping native `runtypes` {@link common.Encoder}.
 * @param validation The {@link common.Encoder} responsible for validating the response body before it is stringified and serialized.
 * @param contentType The content type to use.
 * @returns The {@link data.DataValidatorResponseOutputSpec} that can be passed to TyRAS functions as response body validator.
 */
export function responseBody<TOutput, TSerialized, TContentType extends string>(
  validation: common.Encoder<TOutput, TSerialized>,
  contentType: TContentType,
): data.DataValidatorResponseOutputSpec<
  TOutput,
  TSerialized,
  common.ValidatorHKT,
  TContentType
>;

/**
 * Creates a new generic TyRAS {@link data.DataValidatorResponseOutputSpec} for validating response body, wrapping native `runtypes` {@link common.Encoder}.
 * @param validation The {@link common.Encoder} responsible for validating the response body before it is stringified and serialized.
 * @param contentType The possible content type to use.
 * @returns The {@link data.DataValidatorResponseOutputSpec} that can be passed to TyRAS functions as response body validator.
 */
export function responseBody<TOutput, TSerialized, TContentType extends string>(
  validation: common.Encoder<TOutput, TSerialized>,
  contentType?: TContentType,
): data.DataValidatorResponseOutputSpec<
  TOutput,
  TSerialized,
  common.ValidatorHKT,
  TContentType
> {
  return data.responseBodyGeneric(
    validation,
    contentType ?? CONTENT_TYPE,
    common.fromEncoder(validation),
  );
}

/**
 * This interface contains data that can be specified when using {@link requestBody}.
 */
export interface RequestBodyCreationOptions {
  /**
   * If set to `true`, the returned request body validator will throw an error if request's `Content-Type` header does not match exactly the given content type (or {@link CONTENT_TYPE} if not given).
   */
  strictContentType?: boolean;

  /**
   * If set to `true`, will NOT strip the `__proto__` properties when parsing JSON from request body.
   */
  allowProtoProperty?: boolean;
}
