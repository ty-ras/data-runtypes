/**
 * @file This file contains unit tests for functionality in file `../headers.ts`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

import test from "ava";
import * as spec from "../headers";
import * as t from "runtypes";

test("Validate headers works", (c) => {
  c.plan(5);
  const headerParamValue = t.String;
  const { validators, metadata } = spec.requestHeaders<{ headerParam: string }>(
    {
      headerParam: {
        required: true,
        decoder: headerParamValue,
      },
    },
  );
  c.deepEqual(metadata, {
    headerParam: {
      required: true,
      decoder: headerParamValue,
    },
  });
  c.deepEqual(Object.keys(validators), ["headerParam"]);
  c.deepEqual(validators.headerParam("123"), { error: "none", data: "123" });
  c.like(validators.headerParam(undefined), {
    error: "error",
    errorInfo: 'Request header "headerParam" is mandatory.',
  });
  c.like(validators.headerParam(123 as any), {
    error: "error",
  });
});

test("Validate responseHeaders works", (c) => {
  c.plan(5);
  const headerParamValue = t.String;
  const { validators, metadata } = spec.responseHeaders<{
    headerParam: string;
  }>({
    headerParam: {
      required: true,
      encoder: headerParamValue,
    },
  });
  c.deepEqual(metadata, {
    headerParam: {
      required: true,
      encoder: headerParamValue,
    },
  });
  c.deepEqual(Object.keys(validators), ["headerParam"]);
  c.deepEqual(validators.headerParam("123"), { error: "none", data: "123" });
  c.like(validators.headerParam(undefined as any), {
    error: "error",
    errorInfo: 'Response header "headerParam" is mandatory.',
  });
  c.like(validators.headerParam(123 as any), {
    error: "error",
  });
});

test("Validate string decoding optionality detection", (c) => {
  c.plan(3);
  const headerType = t.String;
  const optionalHeaderType = t.Union(headerType, t.Undefined);
  const { validators, metadata } = spec.requestHeaders<{
    requiredHeader: string;
    optionalHeader: string | undefined;
  }>({
    requiredHeader: {
      required: true,
      decoder: headerType,
    },
    optionalHeader: {
      required: false,
      decoder: optionalHeaderType,
    },
  });
  c.deepEqual(metadata, {
    requiredHeader: {
      decoder: headerType,
      required: true,
    },
    optionalHeader: {
      decoder: optionalHeaderType,
      required: false,
    },
  });
  c.deepEqual(validators.optionalHeader(undefined), {
    error: "none",
    data: undefined,
  });
  c.like(validators.requiredHeader(undefined), {
    error: "error",
  });
});

test("Validate string encoding optionality detection", (c) => {
  c.plan(3);
  const headerType = t.String;
  const optionalHeaderType = t.Union(headerType, t.Undefined);
  const { validators, metadata } = spec.responseHeaders<{
    requiredHeader: string;
    optionalHeader: string | undefined;
  }>({
    requiredHeader: {
      required: true,
      encoder: headerType,
    },
    optionalHeader: {
      required: false,
      encoder: optionalHeaderType,
    },
  });
  c.deepEqual(metadata, {
    requiredHeader: {
      encoder: headerType,
      required: true,
    },
    optionalHeader: {
      encoder: optionalHeaderType,
      required: false,
    },
  });
  c.deepEqual(validators.optionalHeader(undefined), {
    error: "none",
    data: undefined,
  });
  c.like(validators.requiredHeader(undefined as any), {
    error: "error",
  });
});
