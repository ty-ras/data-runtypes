/**
 * @file This file contains unit tests for functionality in file `../state-validator-factory.ts`.
 */

import test from "ava";
import * as spec from "../state-validator-factory";
import * as t from "runtypes";
import * as state from "@ty-ras/state";
import type * as data from "@ty-ras/data-runtypes";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */

test("Verify that state validator factory behaves as specified for authenticated properties", (c) => {
  c.plan(3);
  const stateValidatorFactory = createStateValidatorFactory(
    { userId: t.String },
    {},
  );

  const mandatory = stateValidatorFactory({ userId: true });

  c.deepEqual(mandatory.stateInfo, ["userId"]);
  c.deepEqual(mandatory.validator({ userId: "userId" }), {
    error: "none",
    data: { userId: "userId" },
  });
  c.like(mandatory.validator({ userId: 42 }), {
    // protocol-error and 401, because authentication-related property
    error: "protocol-error",
    statusCode: 401,
    body: undefined,
  });
});

test("Verify that state validator factory behaves as specified for non-authenticated properties", (c) => {
  c.plan(3);
  const stateValidatorFactory = createStateValidatorFactory(
    {},
    { otherProperty: t.String },
  );

  const mandatory = stateValidatorFactory({ otherProperty: true });

  c.deepEqual(mandatory.stateInfo, ["otherProperty"]);
  c.deepEqual(mandatory.validator({ otherProperty: "otherProperty" }), {
    error: "none",
    data: { otherProperty: "otherProperty" },
  });
  // For some reason, .like doesn't seem to be recursive, so... do it like this.
  c.like(mandatory.validator({ otherProperty: 42 }), {
    error: "error",
  });
});

test("Verify that giving wrong input to state validator factory throws an error", (c) => {
  c.plan(2);

  const stateValidatorFactory = createStateValidatorFactory(
    { userId: t.String },
    {},
  );

  c.throws(() => stateValidatorFactory({ notUserId: true } as any), {
    instanceOf: Error,
    message: 'The given key "notUserId" is not part of the state validation.',
  });
  c.throws(() => stateValidatorFactory({ userId: "somethingElse" } as any), {
    instanceOf: Error,
    message: 'The given key "userId" should contain boolean as value.',
  });
});

test("Verify that optional authenticated property validation behaves as expected", (c) => {
  c.plan(1);

  const stateValidatorFactory = createStateValidatorFactory(
    { userId: t.String },
    {},
  );

  const optional = stateValidatorFactory({ userId: false });
  c.deepEqual(optional.validator({}), {
    // Important that this it NOT protocol-error
    error: "none",
    data: {},
  });
});

const createStateValidatorFactory = <
  TAuthenticated extends Record<string, data.AnyDecoder>,
  TOther extends Record<string, data.AnyDecoder>,
>(
  authenticated: TAuthenticated,
  other: TOther,
) =>
  spec.createStateValidatorFactory(
    state.getFullStateValidationInfo(authenticated, other),
  );
