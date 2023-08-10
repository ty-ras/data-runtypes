/**
 * @file This internal file contains callback to check for `undefined` possibility, used by other places in the code.
 */

import * as common from "@ty-ras/metadata-jsonschema";
import * as t from "runtypes";
import type * as data from "@ty-ras/data-runtypes";

/**
 * Given either {@link t.Runtype} or protocol validation object, checks whether `undefined` is a valid value.
 *
 * Notice that when given the protocol validation object, this uses the `decoder` property to check for undefined being possible.
 * @param validation The validation to check.
 * @returns The {@link common.UndefinedPossibility} for given `validation`.
 */
const getUndefinedPossibility: common.GetUndefinedPossibility<
  data.AnyEncoder | data.AnyDecoder
> = (validation) => getUndefinedPossibilityImpl(validation.reflect);

export default getUndefinedPossibility;

const getUndefinedPossibilityImpl: common.GetUndefinedPossibility<t.Reflect> = (
  validation,
) => {
  let retVal: boolean | undefined =
    validation.tag === "literal" && validation.value === undefined;
  if (!retVal) {
    if (validation.tag === "constraint") {
      retVal = getUndefinedPossibilityImpl(validation.underlying);
    } else {
      retVal = validation.validate(undefined).success ? undefined : false;
    }
  }
  return retVal;
};
