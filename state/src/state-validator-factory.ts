/**
 * @file This file contains the `runtypes` -specific implementation of {@link state.createStateValidatorFactoryGeneric}.
 */

import * as t from "runtypes";
import * as data from "@ty-ras/data-runtypes";
import * as state from "@ty-ras/state";
import type * as types from "./state.types";

/**
 * This function narrows down the generic {@link state.createStateValidatorFactoryGeneric} function with `runtypes` specific {@link data.ValidatorHKT}.
 * The result of this function is a callback that can be used to create state information objects needed when defining endpoints.
 * @param validation The object containing information about state properties, typically result of {@link state.getFullStateValidationInfo}.
 * @returns A {@link CreateStateInformationFactory} callback to use to create state information objects needed when defining endpoints.
 */
export const createStateValidatorFactory = <
  TStateValidation extends types.TStateValidationBase,
>(
  validation: TStateValidation,
): CreateStateInformationFactory<TStateValidation> =>
  state.createStateValidatorFactoryGeneric<data.ValidatorHKT, TStateValidation>(
    validation,
    (mandatory, optional) => {
      const validator = t.Record({
        ...Object.fromEntries(
          mandatory.map(
            (mandatoryProp) =>
              [mandatoryProp, validation[mandatoryProp].validation] as const,
          ),
        ),
        ...Object.fromEntries(
          optional.map(
            (optionalProp) =>
              [
                optionalProp,
                validation[optionalProp].validation.optional(),
              ] as const,
          ),
        ),
      });
      return (input) => {
        const result = validator.validate(input);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result.success
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data.transformLibraryResultToModelResult(result) as any)
          : {
              ...data.createErrorObject([result]),
              erroneousProperties: Object.keys(result.details ?? {}),
            };
      };
    },
  );

/**
 * This type narrows the generic {@link state.CreateStateInformationFactoryGeneric} with `runtypes` -specific {@link data.ValidatorHKT}.
 */
export type CreateStateInformationFactory<
  TStateValidation extends types.TStateValidationBase,
> = state.CreateStateInformationFactoryGeneric<
  data.ValidatorHKT,
  TStateValidation
>;
