/**
 * @file This file contains unit tests for functionality in file `../body.ts`.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

import test from "ava";
import * as spec from "../body";
import type * as data from "@ty-ras/data-backend";
import type * as common from "@ty-ras/data-runtypes";
import * as t from "runtypes";
import * as stream from "node:stream";

test("Validate requestBody works", async (c) => {
  c.plan(5);
  const input = t.String;
  const { validator, validatorSpec } = requestBody(input);
  c.deepEqual(validatorSpec, {
    contents: {
      [spec.CONTENT_TYPE]: input,
    },
  });
  const correctReadable = () => stream.Readable.from([JSON.stringify("123")]);
  c.deepEqual(
    await validator({
      contentType: spec.CONTENT_TYPE,
      input: correctReadable(),
    }),
    {
      error: "none",
      data: "123",
    },
  );
  c.deepEqual(
    await validator({
      contentType: "incorrect/applicationtype",
      input: correctReadable(),
    }),
    {
      error: "unsupported-content-type",
      supportedContentTypes: [spec.CONTENT_TYPE],
    },
  );
  c.like(
    await validator({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify(123)]),
    }),
    {
      error: "error",
    },
  );
  c.like(
    await validator({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "error",
    },
  );
});

test("Validate responseBody works", (c) => {
  c.plan(3);
  const output = t.String;
  const { validator, validatorSpec } = spec.responseBody(output);
  c.deepEqual(validatorSpec, {
    contents: {
      [spec.CONTENT_TYPE]: output,
    },
  });
  c.deepEqual(validator("123"), {
    error: "none",
    data: {
      contentType: spec.CONTENT_TYPE,
      output: JSON.stringify("123"),
    },
  });
  c.like(validator(123 as any), {
    error: "error",
  });
});

test("Validate request body optionality works", async (c) => {
  c.plan(4);
  const { validator: forbidRequestBody } = requestBody(t.Undefined);
  c.deepEqual(
    await forbidRequestBody({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "none",
      data: undefined,
    },
  );
  c.like(
    await forbidRequestBody({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify("123")]),
    }),
    {
      error: "error",
    },
  );
  const { validator: optionalRequestBody } = requestBody(
    t.Union(t.Undefined, t.String),
  );
  c.deepEqual(
    await optionalRequestBody({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([]),
    }),
    {
      error: "none",
      data: undefined,
    },
  );
  c.deepEqual(
    await optionalRequestBody({
      contentType: spec.CONTENT_TYPE,
      input: stream.Readable.from([JSON.stringify("123")]),
    }),
    {
      error: "none",
      data: "123",
    },
  );
});

test("Validate request body detects invalid JSON", async (c) => {
  c.plan(2);
  const { validator } = requestBody(t.String);
  const result = await validator({
    contentType: spec.CONTENT_TYPE,
    input: stream.Readable.from(["not-a-json"]),
  });
  c.like(result, {
    error: "error",
  });
  if (result.error === "error") {
    c.true(result.errorInfo instanceof SyntaxError);
  }
});

test("Validate that content type is customizable for request and response body validations", (c) => {
  c.plan(2);

  const validator = t.String;

  // Technically, if the code wouldn't work, these would not even pass TS type checking.
  const {
    validatorSpec: {
      contents: { customContent },
    },
  } = spec.requestBody(validator, {}, { contentType: "customContent" });
  c.is(
    customContent,
    validator,
    "The content type must've propagated when passed to the function",
  );

  const {
    validatorSpec: {
      contents: { customContentResponse },
    },
  } = spec.responseBody(validator, "customContentResponse");
  c.is(
    customContentResponse,
    validator,
    "The content type must've propagated when passed to the function",
  );
});

const requestBody = <T>(
  validation: common.Decoder<T>,
  readBody: data.ReadBody = {},
) => spec.requestBody(validation, readBody);
