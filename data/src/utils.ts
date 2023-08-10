/**
 * @file This file contains utility function to wrap 'native' `runtypes` {@link t.Result} into TyRAS {@link data.DataValidatorResult}.
 */

import type * as data from "@ty-ras/data";
import * as t from "runtypes";
import * as error from "./error";

/**
 * This function will wrap the given 'native' `runtypes` {@link t.Result} into TyRAS {@link data.DataValidatorResult}.
 * @param validationResult The {@link t.Result} validation result.
 * @returns The {@link data.DataValidatorResult}, either {@link data.DataValidatorResultError} or {@link data.DataValidatorResultSuccess}
 */
export const transformLibraryResultToModelResult = <TData>(
  validationResult: t.Result<TData>,
): data.DataValidatorResult<TData> => {
  if (validationResult.success) {
    return {
      error: "none",
      data: validationResult.value,
    };
  } else {
    const errorInfo = [validationResult];
    return {
      error: "error",
      errorInfo,
      getHumanReadableMessage: () =>
        error.getHumanReadableErrorMessage(errorInfo),
    };
  }
};
