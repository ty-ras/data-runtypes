/**
 * @file This file contains functionality related to validation errors when using `runtypes` library with TyRAS.
 */

import type * as data from "@ty-ras/data";
import * as t from "runtypes";

/**
 * This type is the data validation error resulting from `runtypes` validators.
 */
export type ValidationError = Array<t.Failure>;

/**
 * Function to extract textual error from `runtypes` {@link ValidationError}.
 * @param errors The {@link ValidationError}.
 * @returns Textual representation of the error, extracting all {@link t.ValidationError.message} and {@link t.ValidationError.details} if the details are present.
 */
export const getHumanReadableErrorMessage = (errors: ValidationError) =>
  errors
    .map(
      (e) =>
        `${e.message}${
          e.details ? ` (details: ${JSON.stringify(e.details)})` : ""
        }`,
    )
    .join("\n");

/**
 * Function to create {@link data.DataValidatorResultError} from given {@link ValidationError}.
 * @param errorInfo The {@link ValidationError}.
 * @returns The {@link data.DataValidatorResultError} with given error as `errorInfo` property, and `getHumanREadableMessage` being {@link getHumanReadableErrorMessage}.
 */
export const createErrorObject = (
  errorInfo: ValidationError,
): data.DataValidatorResultError => ({
  error: "error",
  errorInfo,
  getHumanReadableMessage: () => getHumanReadableErrorMessage(errorInfo),
});
