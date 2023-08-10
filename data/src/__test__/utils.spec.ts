/**
 * @file This file contains unit tests for functionality in file `../utils.ts`.
 */

import test from "ava";
import * as spec from "../utils";
import * as t from "runtypes";
import * as error from "../error";

test("Validate transformLibraryResultToModelResult works for successful case", (c) => {
  c.plan(1);
  c.deepEqual(
    spec.transformLibraryResultToModelResult(t.Number.validate(123)),
    {
      error: "none",
      data: 123,
    },
  );
});

test("Validate transformLibraryResultToModelResult works for invalid case", (c) => {
  c.plan(2);
  const errorInfo: error.ValidationError = [
    {
      success: false,
      code: "TYPE_INCORRECT",
      message: "Expected number, but was string",
    },
  ];
  const result = spec.transformLibraryResultToModelResult(
    t.Number.validate("123"),
  );
  if (result.error === "error") {
    c.deepEqual(result.errorInfo as error.ValidationError, errorInfo);
    c.deepEqual(
      result.getHumanReadableMessage(),
      error.getHumanReadableErrorMessage(errorInfo),
    );
  }
});
