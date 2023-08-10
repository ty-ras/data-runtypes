/**
 * @file This file contains unit tests for functionality in file `../transform.ts`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

import test, { ExecutionContext } from "ava";
import type * as md from "@ty-ras/metadata-jsonschema";
import * as t from "runtypes";
import * as spec from "../transform";

test("Validate transformToJSONSchema basic usages work", (c) => {
  c.plan(8);
  simpleTransformToJSONSchema(c, t.Null, "null");
  simpleTransformToJSONSchema(c, t.Undefined, { not: {} }, "undefined");
  simpleTransformToJSONSchema(c, t.Void, {}, "void");
  simpleTransformToJSONSchema(c, t.String, "string");
  simpleTransformToJSONSchema(c, t.Boolean, "boolean");
  simpleTransformToJSONSchema(c, t.Number, "number");
  simpleTransformToJSONSchema(c, t.Literal(null), "object", "null");
  simpleTransformToJSONSchema(c, t.Literal(undefined), "object", "undefined");
});

test("Validate transformToJSONSchema complex non-hierarchical usages work", (c) => {
  c.plan(5);
  c.deepEqual(rawTransformToJSONSchema(t.Literal("literal")), {
    type: "string",
    const: "literal",
    description: '"literal"',
  });
  c.deepEqual(rawTransformToJSONSchema(t.Literal(true)), {
    type: "boolean",
    const: true,
    description: "true",
  });
  c.deepEqual(rawTransformToJSONSchema(t.Literal("literal")), {
    type: "string",
    const: "literal",
    description: '"literal"',
  });
  c.deepEqual(rawTransformToJSONSchema(t.Never), { not: {} });
  c.deepEqual(
    rawTransformToJSONSchema(
      t.Union(t.Literal("literal"), t.Literal("anotherLiteral")),
    ),
    {
      type: "string",
      enum: ["literal", "anotherLiteral"],
      description: '("literal" | "anotherLiteral")',
    },
  );
  // No any in runtypes
  // c.deepEqual(rawTransformToJSONSchema(t.Any), {});
});

test("Validate transformToJSONSchema simple hierarchical usages work", (c) => {
  c.plan(3);
  simpleTransformToJSONSchema(
    c,
    t.String.withConstraint(() => true),
    "string",
  );
  const expectedArray: md.JSONSchema = {
    type: "array",
    items: {
      type: "string",
      description: "string",
    },
  };
  c.deepEqual(rawTransformToJSONSchema(t.Array(t.String)), {
    ...expectedArray,
    description: "Array<string>",
  });
  c.deepEqual(
    rawTransformToJSONSchema(t.Union(t.Literal("one"), t.Literal("two"))),
    {
      type: "string",
      enum: ["one", "two"],
      description: '("one" | "two")',
    },
  );
});

test("Validate transformToJSONSchema record types work", (c) => {
  c.plan(3);
  const expectedObject: md.JSONSchema = {
    type: "object",
    properties: {
      property: {
        type: "string",
        description: "string",
      },
    },
    description: "{ property: string }",
  };
  c.deepEqual(
    rawTransformToJSONSchema(
      t.Record({
        property: t.String,
      }),
    ),
    {
      ...expectedObject,
      required: ["property"],
      additionalProperties: false,
    },
  );
  c.deepEqual(
    rawTransformToJSONSchema(
      t.Record({
        property: t.String.optional(),
      }),
    ),
    {
      ...expectedObject,
      description: `{ property?: string }`,
      additionalProperties: false,
    },
  );
  c.deepEqual(rawTransformToJSONSchema(t.Dictionary(t.String, t.Number)), {
    type: "object",
    additionalProperties: {
      description: "number",
      type: "number",
    },

    description: "{ [K in string]: number }",
  });
  // c.deepEqual(
  //   rawTransformToJSONSchema(
  //     t
  //       .strictObject({
  //         property: t.String,
  //       }),
  //   ),
  //   {
  //     ...expectedObject,
  //     required: ["property"],
  //     additionalProperties: false,
  //   },
  // );
});

test("Validate transformToJSONSchema complex hierarchical usages work", (c) => {
  c.plan(7);
  // Union
  const stringAndNumber: Array<Exclude<md.JSONSchema, boolean>> = [
    {
      type: "string",
      description: "string",
    },
    {
      type: "number",
      description: "number",
    },
  ];
  c.deepEqual(
    rawTransformToJSONSchema(t.Union(t.String, t.Undefined)),
    // Top level `| undefined` type gets cut out, as it is handled specially in OpenAPI plugin
    stringAndNumber[0],
  );
  c.deepEqual(
    rawTransformToJSONSchema(
      t.Union(
        t.String,
        t.Undefined.withConstraint(() => true),
      ),
    ),
    // Top level `| undefined` type gets cut out, as it is handled specially in OpenAPI plugin
    stringAndNumber[0],
  );
  c.deepEqual(
    rawTransformToJSONSchema(t.Union(t.String, t.Number, t.Undefined)),
    {
      // Same thing happens here as above
      type: stringAndNumber.map((s) => s.type),
      // TODO do something about this...?
      description: "(string | number | undefined)",
    },
  );
  c.deepEqual(rawTransformToJSONSchema(t.Union(t.String, t.Number)), {
    // No undefined present -> both types must be present
    type: ["string", "number"],
    description: "(string | number)",
  });

  // Intersection
  c.deepEqual(rawTransformToJSONSchema(t.Intersect(t.String, t.Number)), {
    allOf: stringAndNumber,
    description: "(string & number)",
  });

  // Tuple
  c.deepEqual(rawTransformToJSONSchema(t.Tuple(t.String, t.Number)), {
    type: "array",
    minItems: 2,
    maxItems: 2,
    items: stringAndNumber,
    description: "[string, number]",
  });

  // Heterogenous literal unions
  c.deepEqual(
    rawTransformToJSONSchema(t.Union(t.Literal("literal"), t.Literal(1))),
    {
      type: ["string", "number"],
      enum: ["literal", 1],
      description: '("literal" | 1)',
    },
  );
});

test("Validate that transformToJSONSchema works with override and/or fallback callbacks", (c) => {
  c.plan(3);
  const overrideValue: md.JSONSchema = true;
  c.deepEqual(
    spec.transformToJSONSchema(
      t.String,
      true,
      () => overrideValue,
      () => undefined,
    ),
    overrideValue,
  );
  const fallbackValue: md.JSONSchema = false;
  c.deepEqual(
    spec.transformToJSONSchema(t.Unknown, true, undefined, () => fallbackValue),
    {},
  );
  c.deepEqual(
    spec.transformToJSONSchema(
      t.String,
      true,
      () => overrideValue,
      fallbackValue,
    ),
    overrideValue,
  );
});

test("Validate that transformToJSONSchema works with invalid inputs", (c) => {
  c.plan(1);
  c.deepEqual(
    spec.transformToJSONSchema(
      undefined as any,
      true,
      undefined,
      "hello" as any,
    ),
    "hello",
  );
});

// test("Validate that transformToJSONSchema works with union of unions", (c) => {
//   c.plan(1);
//   c.deepEqual(
//     rawTransformToJSONSchema(
//       common.union([
//         t.String,
//         common.union([t.Number, t.boolean().describe("boolean")]),
//       ]),
//     ),
//     {
//       // Nested unions are flattened
//       anyOf: [
//         {
//           description: "string",
//           type: "string",
//         },
//         {
//           description: "number",
//           type: "number",
//         },
//         {
//           description: "boolean",
//           type: "boolean",
//         },
//       ],
//       description: "(string | (number | boolean))",
//     },
//   );
// });

const simpleTransformToJSONSchema = (
  c: ExecutionContext,
  validation: t.Runtype,
  type: Exclude<md.JSONSchema, boolean>["type"] | md.JSONSchema,
  description?: string,
) =>
  c.deepEqual(
    rawTransformToJSONSchema(validation),
    typeof type === "string"
      ? {
          type,
          description: description ?? type,
        }
      : typeof type === "object"
      ? {
          ...type,
          description,
        }
      : type,
  );

const rawTransformToJSONSchema = (validation: t.Runtype) =>
  spec.transformToJSONSchema(
    validation.reflect,
    true,
    undefined,
    () => undefined,
  );
