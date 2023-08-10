/**
 * @file This file contains code related to transforming `runtypes` validators to JSON schema objects.
 */

import * as t from "runtypes";
import * as common from "@ty-ras/metadata-jsonschema";
import type * as types from "./md.types";
import getUndefinedPossibility from "./check-undefined";

/**
 * This function will transform the given {@link t.Runtype} into {@link common.JSONSchema} value.
 * @param validation The `runtypes` decoder or encoder.
 * @param cutOffTopLevelUndefined When traversing validators hierarchically, set to `true` to consider top-level `X | undefined` value as just `X`.
 * @param override The optional callback to override certain decoders or encoders.
 * @param fallbackValue The callback to get fallback value when this transformation fails to construct the {@link common.JSONSchema} value.
 * @returns The {@link common.JSONSchema}
 */
export const transformToJSONSchema = (
  validation: t.Reflect,
  cutOffTopLevelUndefined: boolean,
  override: types.Override | undefined,
  fallbackValue: types.FallbackValue,
): common.JSONSchema => {
  const recursion: Recursion = (innerValidation: t.Reflect) =>
    transformToJSONSchemaImpl(
      false,
      recursion,
      innerValidation,
      cutOffTopLevelUndefined,
      override,
      fallbackValue,
    );

  return transformToJSONSchemaImpl(
    true,
    recursion,
    validation,
    cutOffTopLevelUndefined,
    override,
    fallbackValue,
  );
};

const transformToJSONSchemaImpl = (
  topLevel: boolean,
  recursion: Recursion,
  ...[validation, cutOffTopLevelUndefined, override, fallbackValue]: Parameters<
    typeof transformToJSONSchema
  >
): common.JSONSchema => {
  let retVal = override?.(validation, cutOffTopLevelUndefined);
  if (retVal === undefined) {
    if (topLevel && validation?.tag === "union") {
      // Special case: top-level schema with undefined as union component -> will be marked as optional and schema being everything except undefined
      retVal = tryTransformTopLevelSchema(
        recursion,
        validation,
        validation.alternatives,
      );
    } else {
      retVal = transformRuntypeReflect(recursion, validation);
    }
  }
  return retVal ?? common.getFallbackValue(validation, fallbackValue);
};

const tryTransformTopLevelSchema = (
  recursion: Recursion,
  original: t.Reflect,
  components: ReadonlyArray<t.Reflect>,
) => {
  const nonUndefineds = components.filter(
    (c) => getUndefinedPossibility(c) !== true,
  );
  return nonUndefineds.length !== components.length
    ? // This is top-level optional schema -> just transform the underlying non-undefineds
      nonUndefineds.length <= 1
      ? recursion(nonUndefineds[0])
      : recursion(t.Union(...(nonUndefineds as [t.Reflect, t.Reflect])))
    : undefined;
};

type Recursion = (item: t.Reflect) => common.JSONSchema;

const transformRuntypeReflect = (recursion: Recursion, reflect: t.Reflect) => {
  let retVal: common.JSONSchema | undefined;
  switch (reflect?.tag) {
    case "string":
    case "template":
      {
        retVal = {
          type: "string",
        };
      }
      break;
    case "number":
      {
        retVal = {
          type: "number",
        };
      }
      break;
    case "boolean":
      {
        retVal = {
          type: "boolean",
        };
      }
      break;
    case "never":
      {
        retVal = false;
      }
      break;
    case "literal":
      {
        const { value } = reflect;
        retVal =
          value === null
            ? {
                type: "null",
              }
            : value === undefined || typeof value === "bigint"
            ? undefined
            : {
                const: value,
              };
      }
      break;
    case "unknown":
      {
        retVal = {};
      }
      break;
    case "constraint":
    case "optional":
      {
        retVal = recursion(reflect.underlying);
      }
      break;
    case "brand":
      {
        retVal = recursion(reflect.entity);
      }
      break;
    case "array":
      {
        retVal = {
          type: "array",
          items: recursion(reflect.element),
        };
      }
      break;
    case "record":
      {
        const entries = Object.entries(reflect.fields);
        retVal = {
          type: "object",
          properties: Object.fromEntries(
            entries.map(([fieldName, fieldValidation]) => [
              fieldName,
              recursion(fieldValidation),
            ]),
          ),
        };
        if (!reflect.isPartial) {
          retVal.required = entries.map(([fieldName]) => fieldName);
        }
      }
      break;
    case "dictionary":
      {
        if (reflect.key != "symbol") {
          retVal = {
            type: "object",
            propertyNames: {
              type: reflect.key,
            },
            additionalProperties: recursion(reflect.value),
          };
        }
      }
      break;
    case "tuple":
      {
        retVal = {
          type: "array",
          items: reflect.components.map(recursion),
        };
      }
      break;
    case "intersect":
      {
        retVal = {
          allOf: reflect.intersectees.map(recursion),
        };
      }
      break;
    case "union":
      {
        const components = Array.from(
          common.flattenDeepStructures(reflect.alternatives, (item) =>
            item.reflect.tag === "union"
              ? item.reflect.alternatives
              : undefined,
          ),
        );
        retVal = {
          anyOf: components.map(recursion),
        };
        retVal = common.tryToCompressUnionOfMaybeEnums(retVal);
      }
      break;
  }

  return retVal;
};
