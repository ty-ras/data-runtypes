/**
 * @file This types-only file contains types used to obtain final shape of the state/context needed by BE endpoints.
 */

import type * as data from "@ty-ras/data-runtypes";
import type * as state from "@ty-ras/state";

/**
 * Helper type to extract the final shape of the state/context, given the full state validation, and description of state/context needed by BE endpoint.
 */
export type GetState<
  TStateValidation extends TStateValidationBase,
  TStateSpec,
> = state.GetStateGeneric<data.ValidatorHKT, TStateValidation, TStateSpec>;

/**
 * Helper type to extract the shape of the full state, given the full state validation.
 */
export type GetFullState<TStateValidation extends TStateValidationBase> =
  GetState<TStateValidation, { [P in keyof TStateValidation]: true }>;

/**
 * This type narrows the generic {@link state.StateHKTGeneric} using the `runtypes` -specific {@link data.ValidatorHKT} type.
 * @see state.StateHKTGeneric
 */
export type StateHKT<TFullStateValidationInfo extends TStateValidationBase> =
  state.StateHKTGeneric<data.ValidatorHKT, TFullStateValidationInfo>;

/**
 * This type narrows the generic {@link state.TStateValidationBaseGeneric} with `runtypes` -specific validator.
 *
 * Notice we must use {@link t.Mixed} instead of {@link data.Decoder}.
 * The reason for that is that we will pass the decoders to `t.type` and `t.partial`, both of which expect t.Mixed and not t.Decoders
 */
export type TStateValidationBase =
  state.TStateValidationBaseGeneric<data.AnyDecoder>;
