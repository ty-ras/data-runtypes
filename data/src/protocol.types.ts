/**
 * @file This types-only file contains helper types to extract the runtime and serialized types of the types defined in protocol specification.
 */

import type * as protocol from "@ty-ras/protocol";
import * as t from "runtypes";

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

/**
 * This is type to get the runtime representation of type which might be expressed as {@link protocol.Encoded}.
 * It doesn't need to be {@link protocol.Encoded} tho, and works for normal types as expected.
 */
export type GetRuntime<T> = protocol.RuntimeOf<T>;

/**
 * This is type to get the serialized ("encoded") representation of type which might be expressed as {@link protocol.Encoded}.
 * It doesn't need to be {@link protocol.Encoded} tho, and works for normal types as expected.
 */
export type GetEncoded<T> = T extends protocol.Encoded<infer _, infer TEncoded>
  ? TEncoded
  : T extends Array<infer U>
  ? GetEncodedArray<U>
  : T extends object
  ? GetEncodedObject<T>
  : T;

/**
 * This is helper type used by {@link GetEncoded}.
 * Client code should not use this directly.
 */
export type GetEncodedObject<T> =
  // We have to do these in a different way than IO-TS, as the way Runtypes specifies optionality is not 1:1 with how TypeScript handles it.
  {
    [P in NonOptionalKeys<T>]: T[P] extends Function ? T[P] : GetEncoded<T[P]>;
  } & {
    [P in keyof Omit<T, NonOptionalKeys<T>>]: T[P] extends Function
      ? T[P]
      : GetEncoded<T[P]> | undefined;
  };

/**
 * This is helper type used by {@link GetEncoded}.
 * Client code should not use this directly.
 */
export type GetEncodedArray<T> = Array<GetEncoded<T>>;

/**
 * This is helper type used by {@link GetEncodedObject}.
 * Client code should not use this directly.
 */
export type NonOptionalKeys<T> = {
  [k in keyof T]-?: undefined extends T[k] ? never : k;
}[keyof T];

/**
 * This type materializes the [higher-kinded type](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again) defined in TyRAS {@link protocol.EncodedHKTBase}.
 * It uses {@link GetEncoded} to provide the actual logic of extracting encoded type.
 */
export interface EncodedHKT extends protocol.EncodedHKTBase {
  /**
   * This property will be used to construct the final serialized ("encoded") type of some type defined in protocol specification.
   */
  readonly typeEncoded: GetEncoded<this["_TEncodedSpec"]>;
}

/**
 * Helper type, in similar way like {@link t.TypeOf}, to extract the runtime and encoded types of given `runtypes` validation object {@link t.Runtype}, when specifying types for protocol.
 * Unfortunately, because `runtypes` types do not expose functionality to "serialize back" data like `io-ts` does via its `Encoder` interface, this type does not bring much value in itself, and is mostly exposed so that similar types would be available for users of both `io-ts` and `runtypes` -specific frameworks, and for future compatibility.
 */
export type ProtocolTypeOf<TValidation extends t.Runtype<any>> =
  TValidation extends t.Runtype<infer T> ? T : never;
