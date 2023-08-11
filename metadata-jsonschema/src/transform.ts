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
    retVal = transformRuntypeReflect(recursion, validation, topLevel);
  }
  return retVal ?? common.getFallbackValue(validation, fallbackValue);
};

type Recursion = (item: t.Reflect) => common.JSONSchema;

const transformRuntypeReflect = (
  recursion: Recursion,
  reflect: t.Reflect,
  topLevel: boolean,
): common.JSONSchema | undefined => {
  switch (reflect?.tag) {
    case "string":
    case "template":
      return makeTypedSchema("string");
    case "number":
      return makeTypedSchema("number");
    case "boolean":
      return makeTypedSchema("boolean");
    case "never":
    case "void":
      return false;
    case "literal":
      return transformLiteral(reflect.value);
    case "unknown":
      return true;
    case "constraint":
    case "optional":
      return recursion(reflect.underlying);
    case "brand":
      return recursion(reflect.entity);
    case "array":
      return {
        type: "array",
        items: recursion(reflect.element),
      };
    case "record": {
      const entries = Object.entries(reflect.fields);
      const retVal: common.JSONSchema = {
        type: "object",
        properties: Object.fromEntries(
          entries.map(([fieldName, fieldValidation]) => [
            fieldName,
            recursion(fieldValidation),
          ]),
        ),
        additionalProperties: false,
      };
      const required = entries.filter(([, field]) => field.tag !== "optional");

      if (required.length > 0) {
        retVal.required = required.map(([name]) => name);
      }
      return retVal;
    }
    case "dictionary":
      return reflect.key === "symbol"
        ? undefined
        : makeTypedSchema("object", {
            propertyNames: {
              type: reflect.key,
            },
            additionalProperties: recursion(reflect.value),
          });
    case "tuple":
      return makeTypedSchema("array", {
        minItems: reflect.components.length,
        maxItems: reflect.components.length,
        items: reflect.components.map(recursion),
      });
    case "intersect":
      return tryGetCommonTypeName("allOf", reflect.intersectees.map(recursion));
    case "union": {
      const components = Array.from(
        common.flattenDeepStructures(reflect.alternatives, (item) =>
          item.reflect.tag === "union" ? item.reflect.alternatives : undefined,
        ),
      );
      let retVal: common.JSONSchema | undefined;
      if (topLevel) {
        retVal = tryTransformTopLevelSchema(recursion, components);
      }
      if (retVal === undefined) {
        retVal = tryGetCommonTypeName("anyOf", components.map(recursion));
      }

      return common.tryToCompressUnionOfMaybeEnums(retVal);
    }
  }
};

// TODO move these to some common place. Currently duplicated code from io-ts version.

const tryTransformTopLevelSchema = (
  recursion: Recursion,
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

const transformLiteral = (
  value: undefined | null | boolean | number | bigint | string,
): common.JSONSchema | undefined => {
  switch (value) {
    case null:
      return { type: "null" };
    case undefined:
      return false;
    default:
      return typeof value === "bigint"
        ? undefined
        : makeTypedSchema(
            typeof value === "string"
              ? "string"
              : typeof value === "number"
              ? "number"
              : typeof value === "boolean"
              ? "boolean"
              : "object",
            { const: value },
          );
  }
};

const makeTypedSchema = (
  type: JSONSchemaObject["type"],
  rest: Omit<JSONSchemaObject, "type"> = {},
): JSONSchemaObject => ({
  type,
  ...rest,
});

type JSONSchemaObject = Exclude<common.JSONSchema, boolean>;

const tryGetCommonTypeName = <TName extends "anyOf" | "allOf">(
  name: TName,
  schemas: ReadonlyArray<common.JSONSchema>,
): JSONSchemaObject => {
  const types = new Set(
    schemas.map((s) =>
      typeof s === "object" && typeof s.type === "string" ? s.type : undefined,
    ),
  );
  const retVal: JSONSchemaObject = { [name]: schemas };
  if (types.size === 1) {
    const value = Array.from(types.values())[0];
    if (value !== undefined) {
      retVal.type = value;
    }
  }
  return retVal;
};
