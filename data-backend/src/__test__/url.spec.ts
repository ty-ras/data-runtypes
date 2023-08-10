/**
 * @file This file contains unit tests for functionality in file `../url.ts`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import test from "ava";
import * as spec from "../url";
import * as t from "runtypes";
import * as data from "@ty-ras/data";

test("Validate query works", (c) => {
  c.plan(5);
  const queryParamValue = t.String;
  const { validators, metadata } = spec.query<{ queryParam: string }>({
    queryParam: {
      required: true,
      decoder: queryParamValue,
    },
  });
  c.deepEqual(metadata, {
    queryParam: {
      required: true,
      decoder: queryParamValue,
    },
  });
  c.deepEqual(Object.keys(validators), ["queryParam"]);
  c.deepEqual(validators.queryParam("123"), { error: "none", data: "123" });
  c.like(validators.queryParam(undefined), {
    error: "error",
    errorInfo: 'Query parameter "queryParam" is mandatory.',
  });
  c.like(validators.queryParam(123 as any), {
    error: "error",
  });
});

test("Validate urlParameter works", (c) => {
  c.plan(7);
  const urlParamDefaultRegExp = t.String;
  const numberRegExp = /\d+/;
  const urlParamCustomRegExp = t.String.withConstraint((str) =>
    numberRegExp.test(str),
  );
  const defaultRegExp = spec.urlParameter(
    "urlParamDefaultRegExp",
    urlParamDefaultRegExp,
  );
  const customRegExp = spec.urlParameter(
    "urlParamCustomRegExp",
    urlParamCustomRegExp,
    numberRegExp,
  );
  c.deepEqual(data.omit(defaultRegExp, "validator"), {
    name: "urlParamDefaultRegExp",
    decoder: urlParamDefaultRegExp,
    regExp: data.defaultParameterRegExp(),
  });
  c.deepEqual(data.omit(customRegExp, "validator"), {
    name: "urlParamCustomRegExp",
    decoder: urlParamCustomRegExp,
    regExp: numberRegExp,
  });
  const notANumber = "not-a-number";
  c.deepEqual(defaultRegExp.validator(notANumber), {
    error: "none",
    data: notANumber,
  });
  c.like(customRegExp.validator(notANumber), {
    error: "error",
  });
  c.deepEqual(customRegExp.validator("123"), {
    error: "none",
    data: "123",
  });
  c.like(defaultRegExp.validator(123 as any), {
    error: "error",
  });
  c.like(customRegExp.validator(123 as any), {
    error: "error",
  });
});
