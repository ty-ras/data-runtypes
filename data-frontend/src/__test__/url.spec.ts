/**
 * @file This file contains unit tests for code in `../url.ts`.
 */

import test from "ava";
import * as spec from "../url";
import * as t from "runtypes";

test("Validate that url validator gives static string when no args", (c) => {
  c.plan(1);
  const url = spec.url`/static/string`;
  c.deepEqual(url, "/static/string");
});

test("Validate that url validator gives function callback with args", (c) => {
  c.plan(1);
  const url = spec.url`/prefix/${spec.urlParam("param", t.String)}/suffix`;
  c.deepEqual(url({ param: "hello" }), {
    error: "none",
    data: "/prefix/hello/suffix",
  });
});
