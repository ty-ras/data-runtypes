/**
 * @file This file contains functionality to decode (deserialize) and encode (serialize) the textual values: HTTP URL query parameters or HTTP headers.
 */

import type * as data from "@ty-ras/data";
import * as dataBE from "@ty-ras/data-backend";
import * as common from "@ty-ras/data-runtypes";
import * as protocol from "@ty-ras/protocol";

/**
 * Creates a new {@link dataBE.StringDataValidatorSpec} from given named {@link common.Decoder}s.
 * Using this function directly in client code is very rare, since there exists separate functions for HTTP URL query parameter or HTTP header decoding.
 * @param validation The named {@link common.Decoder}s for URL query parameters or HTTP headers to decode.
 * @param itemName The name to use in error message if required item is missing. Typically is static string.
 * @returns A new {@link dataBE.StringDataValidatorSpec} which uses the given named {@link common.Decoder}s to decode the URL query parameters or HTTP headers into one object, each value being decoded value.
 */
export const stringDecoder = <TStringData extends protocol.TTextualDataBase>(
  validation: dataBE.StringDataValidatorSpecMetadata<
    TStringData,
    common.ValidatorHKT,
    data.ReadonlyStringValue,
    true
  >,
  itemName: string,
) =>
  dataBE.stringDataValidatorDecoderGeneric<TStringData, common.ValidatorHKT>(
    validation,
    common.fromDecoder,
    itemName,
  );

/**
 * Creates a new {@link dataBE.StringDataValidatorSpec} from given named {@link common.Encoder}s.
 * Using this function directly in client code is very rare, since there exists separate functions for HTTP URL query parameter or HTTP header decoding.
 * @param validation The named {@link common.Encoder}s for URL query parameters or HTTP headers to decode.
 * @param itemName The name to use in error message if required item is missing. Typically is static string.
 * @returns A new {@link dataBE.StringDataValidatorSpec} which uses the given named {@link common.Encoder}s to decode the URL query parameters or HTTP headers into one object, each value being decoded value.
 */
export const stringEncoder = <TStringData extends protocol.TTextualDataBase>(
  validation: dataBE.StringDataValidatorSpecMetadata<
    TStringData,
    common.ValidatorHKT,
    data.StringValue,
    false
  >,
  itemName: string,
) =>
  dataBE.stringDataValidatorEncoderGeneric<TStringData, common.ValidatorHKT>(
    validation,
    common.fromEncoder,
    itemName,
  );
