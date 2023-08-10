/**
 * @file This types-only file contains types used by this library, which specialize the generic types from other libraries.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as data from "@ty-ras/data-runtypes";
import type * as jsonSchema from "@ty-ras/metadata-jsonschema";

/**
 * This type customizes generic {@link jsonSchema.FallbackValueGeneric} type with `runtypes` specific generic arguments.
 */
export type FallbackValue = jsonSchema.FallbackValueGeneric<
  data.AnyEncoder | data.AnyDecoder
>;

/**
 * This type customizes generic {@link jsonSchema.OverrideGeneric} type with `runtypes` specific generic arguments.
 */
export type Override = jsonSchema.OverrideGeneric<
  data.AnyEncoder | data.AnyDecoder
>;
