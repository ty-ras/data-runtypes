/**
 * @file This file contains functions to create TyRAS {@link data.DataValidator}s from 'native' `runtypes` decoders and encoders.
 */

import type * as data from "@ty-ras/data";
import * as t from "runtypes";
import * as utils from "./utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This is the TyRAS decoder (deserializer) type for 'native' `runtypes` {@link t.Runtype} type.
 */
export type Decoder<TData> = t.Runtype<TData>;

/**
 * This is the TyRAS encoder (serializer) type for 'native' `runtypes` {@link t.Runtype} type.
 * Notice that since `runtypes` validators, unlike `io-ts`, does not provide functionality to "encode back" the values, this type is essentially exactly the same as {@link Decoder}.
 */
export type Encoder<TOutput, TSerialized> = t.Runtype<TSerialized>; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * This interface "implements" the generic [HKT](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again), {@link data.ValidatorHKTBase}, to use `runtypes` {@link t.Runtype} as TyRAS decoders and encoders.
 */
export interface ValidatorHKT extends data.ValidatorHKTBase {
  /**
   * This property "implements" the {@link data.ValidatorHKTBase._getDecoder} property in order to provide functionality for {@link data.MaterializeDecoder} type.
   * @see Decoder
   */
  readonly _getDecoder: Decoder<this["_argDecodedType"]>;

  /**
   * This property "implements" the {@link data.ValidatorHKTBase._getEncoder} property in order to provide functionality for {@link data.MaterializeEncoder} type.
   * @see Encoder
   */
  readonly _getEncoder: Encoder<
    this["_argDecodedType"],
    this["_argEncodedType"]
  >;

  /**
   * This property "implements" the {@link data.ValidatorHKTBase._getDecodedType} property in order to provide functionality for {@link data.MaterializeDecodedType} type.
   */
  readonly _getDecodedType: this["_argDecoder"] extends t.Runtype<
    infer TDecodedType
  >
    ? TDecodedType
    : never;
}

/**
 * This type provides `runtypes` specific type for {@link data.AnyDecoderGeneric}.
 */
export type AnyDecoder = data.AnyDecoderGeneric<ValidatorHKT>;

/**
 * This type provides `runtypes` specific type for {@link data.AnyEncoderGeneric}.
 */
export type AnyEncoder = data.AnyEncoderGeneric<ValidatorHKT>;

/**
 * Creates a new {@link data.DataValidator} from given {@link Decoder}, wrapping its 'native' `runtypes` API into uniform TyRAS API.
 * @param validation The {@link Decoder}.
 * @returns A {@link data.DataValidator} which behaves like given `validation`.
 */
export const fromDecoder =
  <TData>(validation: Decoder<TData>): data.DataValidator<unknown, TData> =>
  (input) =>
    utils.transformLibraryResultToModelResult(validation.validate(input));

/**
 * Creates a new {@link data.DataValidator} from given {@link Encoder}, wrapping its 'native' `runtypes` API into uniform TyRAS API.
 * @param validation The {@link Encoder}.
 * @returns A {@link data.DataValidator} which behaves like given `validation`.
 */
export const fromEncoder =
  <TRuntime, TEncoded>(
    validation: Encoder<TRuntime, TEncoded>,
  ): data.DataValidator<TRuntime, TEncoded> =>
  // We can't use decoder to check whether 'input' is of correct type, as in most typical cases (e.g. timestamp in transit, Date at runtime, with correct .transform() used) it would always produce false.
  // There is no 'is' check like in `io-ts` library.
  (input) =>
    utils.transformLibraryResultToModelResult(validation.validate(input));
