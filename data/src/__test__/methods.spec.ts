/**
 * @file This file contains unit tests for functionality in file `../methods.ts`.
 */

import test, { ExecutionContext } from "ava";
import * as spec from "../methods";
import type * as data from "@ty-ras/data";

const testMethod = (
  c: ExecutionContext,
  method: string,
  validator: data.DataValidator<unknown, string>,
) => {
  c.plan(3);
  c.deepEqual(validator(method), {
    error: "none",
    data: method,
  });
  c.like(validator(` ${method}`), {
    error: "error",
  });
  c.like(validator(`${method} `), {
    error: "error",
  });
};

test("Validate DELETE validator works", testMethod, "DELETE", spec.DELETE);
test("Validate GET validator works", testMethod, "GET", spec.GET);
test("Validate HEAD validator works", testMethod, "HEAD", spec.HEAD);
test("Validate OPTIONS validator works", testMethod, "OPTIONS", spec.OPTIONS);
test("Validate PATCH validator works", testMethod, "PATCH", spec.PATCH);
test("Validate POST validator works", testMethod, "POST", spec.POST);
test("Validate PUT validator works", testMethod, "PUT", spec.PUT);
test("Validate TRACE validator works", testMethod, "TRACE", spec.TRACE);
