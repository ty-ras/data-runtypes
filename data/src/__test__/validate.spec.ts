/**
 * @file This file contains unit tests for functionality in file `../validate.ts`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../validate";
import * as t from "runtypes";

test("Validate fromDecoder works", (c) => {
  c.plan(2);
  const validator = spec.fromDecoder(t.Number);
  c.deepEqual(validator(123), {
    error: "none",
    data: 123,
  });
  c.like(validator("123"), {
    error: "error",
    errorInfo: [
      {
        success: false,
        code: "TYPE_INCORRECT",
        message: "Expected number, but was string",
      },
    ],
  });
});

test("Validate fromEncoder works", (c) => {
  c.plan(2);
  const encoder = spec.fromEncoder(t.Number);
  c.deepEqual(encoder(123), {
    error: "none",
    data: 123,
  });
  c.like(encoder("123" as any), {
    error: "error",
    errorInfo: [
      {
        success: false,
        code: "TYPE_INCORRECT",
        message: "Expected number, but was string",
      },
    ],
  });
});
