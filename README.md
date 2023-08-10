# Typesafe REST API Specification - Runtypes Data Validation Related Libraries

[![CI Pipeline](https://github.com/ty-ras/data-runtypes/actions/workflows/ci.yml/badge.svg)](https://github.com/ty-ras/data-runtypes/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/ty-ras/data-runtypes/actions/workflows/cd.yml/badge.svg)](https://github.com/ty-ras/data-runtypes/actions/workflows/cd.yml)

The Typesafe REST API Specification (TyRAS) is a family of libraries used to enable seamless development of Backend and/or Frontend which communicate via HTTP protocol.
The protocol specification is checked both at compile-time and run-time to verify that communication indeed adhers to the protocol.
This all is done in such way that it does not make development tedious or boring, but instead robust and fun!

This particular repository contains related libraries related to using TyRAS with [`runtypes`](https://github.com/pelotom/runtypes) data validation library:
- [data](./data) folder contains `runtypes`-specific library `@ty-ras/data-runtypes` commonly used by both frontend and backend,
- [data-backend](./data-backend) folder contains `runtypes`-specific library `@ty-ras/data-backend-runtypes` used by backend,
- [state](./state) folder contains `runtypes`-specific library `@ty-ras/state-runtypes` used by backend 
- [data-frontend](./data-frontend) folder contains `runtypes`-specific library `@ty-ras/data-frontend-runtypes` used by frontend, and
- [metadata-jsonchema](./metadata-jsonschema) folder contains `runtypes`-specific library `@ty-ras/metadata-jsonschema-runtypes` used to transform `runtypes` validators into [JSON schema](https://json-schema.org/) objects.
  It is typically used by backend, but it is not restricted to that.