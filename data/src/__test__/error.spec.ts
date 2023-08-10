/**
 * @file This file contains unit tests for functionality in file `../error.ts`.
 */

/* eslint-disable sonarjs/no-duplicate-string */
import test from "ava";
import * as spec from "../error";
import * as t from "runtypes";

test("Validate getHumanReadableErrorMessage works", (c) => {
  c.plan(1);
  c.deepEqual(
    transformError(
      t.Number.validate("not-a-number"),
      spec.getHumanReadableErrorMessage,
    ),
    "Expected number, but was string",
  );
});

test("Validate createErrorObject works", (c) => {
  c.plan(2);
  const result = transformError(
    t.Number.validate("not-a-number"),
    spec.createErrorObject,
  );
  const errorInfo: spec.ValidationError = [
    {
      success: false,
      code: "TYPE_INCORRECT",
      message: "Expected number, but was string",
    },
  ];
  c.deepEqual(result.errorInfo as spec.ValidationError, errorInfo);
  c.deepEqual(
    result.getHumanReadableMessage(),
    spec.getHumanReadableErrorMessage(errorInfo),
  );
});

const transformError = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retVal: t.Result<any>,
  transform: (errorObject: spec.ValidationError) => T,
) => {
  if (retVal.success) {
    throw new Error("The return value should've been error");
  }
  return transform([retVal]);
};
